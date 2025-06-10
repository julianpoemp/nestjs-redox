import { fastifyBasicAuth } from '@fastify/basic-auth';
import { DynamicModule, HttpServer, INestApplication, UnauthorizedException } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { OpenAPIObject } from '@nestjs/swagger';
import { getGlobalPrefix } from '@nestjs/swagger/dist/utils/get-global-prefix';
import { normalizeRelPath } from '@nestjs/swagger/dist/utils/normalize-rel-path';
import { validateGlobalPrefix } from '@nestjs/swagger/dist/utils/validate-global-prefix.util';
import { validatePath } from '@nestjs/swagger/dist/utils/validate-path.util';
import { randomBytes } from 'crypto';
import { NextFunction, Response } from 'express';
import expressAuth from 'express-basic-auth';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { existsSync, readFileSync } from 'fs';
import * as handlebars from 'handlebars';
import { join, resolve } from 'path';
import { NestJSRedoxOptions, RedocOptions } from './types';
import { REDOC_HANDLEBAR } from './views/index.hbs';

const NestJSRedoxStaticMiddlewareExpress = async (
  request: Request,
  response: Response,
  next: NextFunction,
  options: {
    preparedRedocJS: string;
    baseUrlForRedocUI: string;
  }
) => {
  if (request.url === `${options.baseUrlForRedocUI}/redoc.standalone.js`) {
    response.setHeader('Content-Type', 'application/javascript');
    response.send(options.preparedRedocJS).status(200);
    return;
  } else {
    next();
  }
};

const NestJSRedoxStaticMiddlewareFastify = async (
  eq: FastifyRequest,
  res: FastifyReply['raw'],
  next: () => void,
  options: {
    preparedRedocJS: string;
    baseUrlForRedocUI: string;
  }
) => {
  if (eq.url === `${options.baseUrlForRedocUI}/redoc.standalone.js`) {
    res.setHeader('Content-Type', 'application/javascript');
    res.write(options.preparedRedocJS);
    res.statusCode = 200;
    res.end();
    return;
  } else {
    next();
  }
};

function stringTob64(text: string) {
  return Buffer.from(text).toString('base64');
}

const buildRedocHTML = (
  baseUrlForRedocUI: string,
  document: OpenAPIObject,
  documentURL: string | undefined,
  redoxOptions: NestJSRedoxOptions,
  redocOptions: RedocOptions = {},
  nonce: string
) => {
  const template = handlebars.compile(REDOC_HANDLEBAR);
  handlebars.registerHelper('json', (context) => {
    return JSON.stringify(context ?? {}, null, 2);
  });

  let base64Document = stringTob64(JSON.stringify(document));

  // add line breaks
  for (let i = 200; i < base64Document.length; i += 200) {
    base64Document = base64Document.slice(0, i) + '\n' + base64Document.slice(i);
  }

  (redocOptions as any).nonce = nonce;
  return template({
    baseUrlForRedocUI,
    document,
    base64Document,
    documentURL,
    redoxOptions,
    nonce,
    redocOptions
  });
};

/** ------
 * Disclaimer: some functions were extracted from https://github.com/nestjs/swagger/blob/master/lib/swagger-module.ts
 * and changed in that way it renders redoc instead of swagger ui.
 */

export class NestjsRedoxModule {
  protected static redocOptions: RedocOptions;
  protected static options: NestJSRedoxOptions;
  protected static preparedRedocJS?: string;

  protected static isFastifyBasicAuthRegistered = false;

  static register(options?: NestJSRedoxOptions, redocOptions?: RedocOptions): DynamicModule {
    this.options = new NestJSRedoxOptions(options ?? {});
    this.redocOptions = redocOptions;
    return {
      module: NestjsRedoxModule,
      providers: [
        {
          provide: 'REDOX_OPTIONS',
          useValue: this.options,
        },
        {
          provide: 'REDOC_OPTIONS',
          useValue: redocOptions,
        },
      ],
      exports: [],
    };
  }

  /**
   * setups RedoxMdoule with generating and serving redoc html page using expressjs or fastify.
   * @param path          URI path to the redoc page
   * @param app           The nest application that is currently serving
   * @param documentOrURL The OpenAPI Object or a function that creates the object or a static URL
   * @param options       NestJSRedoxOptions. If undefined default options are used.
   * @param redocOptions  Officical options by redoc.
   */
  public static setup(
    path: string,
    app: INestApplication,
    documentOrURL: OpenAPIObject | (() => OpenAPIObject) | string,
    options: NestJSRedoxOptions = new NestJSRedoxOptions(),
    redocOptions?: RedocOptions
  ) {
    options = new NestJSRedoxOptions(options);
    const globalPrefix = getGlobalPrefix(app);
    const finalPath = validatePath(options?.useGlobalPrefix && validateGlobalPrefix(globalPrefix) ? `${globalPrefix}${validatePath(path)}` : path);
    const urlLastSubdirectory = finalPath.split('/').slice(-1).pop() || '';
    const httpAdapter = app.getHttpAdapter();

    NestjsRedoxModule.serveDocuments(finalPath, urlLastSubdirectory, httpAdapter, documentOrURL, {
      redocOptions: redocOptions || {},
      redoxOptions: options,
    });

    if (options.standalone) {
      NestjsRedoxModule.serveStatic(finalPath, app, options);

      /**
       * Covers assets fetched through a relative path when Swagger url ends with a slash '/'.
       * @see https://github.com/nestjs/swagger/issues/1976
       */
      const serveStaticSlashEndingPath = `${finalPath}/${urlLastSubdirectory}`;
      /**
       *  serveStaticSlashEndingPath === finalPath when path === '' || path === '/'
       *  in that case we don't need to serve swagger assets on extra sub path
       */
      if (serveStaticSlashEndingPath !== finalPath) {
        NestjsRedoxModule.serveStatic(serveStaticSlashEndingPath, app, options);
      }
    }
  }

  private static serveStatic(finalPath: string, app: INestApplication, options: NestJSRedoxOptions) {
    const httpAdapter = app.getHttpAdapter();
    const redocAssetsPath = options.redocBundlesDir ?? resolve('node_modules/redoc/bundles');

    if (!this.preparedRedocJS) {
      if (existsSync(join(redocAssetsPath, 'redoc.standalone.js'))) {
        this.preparedRedocJS = readFileSync(join(redocAssetsPath, 'redoc.standalone.js'), { encoding: 'utf-8' }).replace(
          /"(https?:\/\/cdn[^"]*(?:svg))"/gm,
          "\"data:image/svg+xml, %3Csvg width='300' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%230044d4' d='M249.488 231.49a123.68 123.68 0 0 0-22.86-12.66 111.55 111.55 0 0 0-42.12-214.75h-171.8a8.18 8.18 0 0 0-5.78 14 7.48 7.48 0 0 0 5.78 2.48 95 95 0 1 1 0 190c-.83 0-1.38.27-2.21.27a8 8 0 0 0-6.33 7.71v1.11a7.69 7.69 0 0 0 7.71 7.7h5.52a92.93 92.93 0 0 1 50.66 17.62 95.33 95.33 0 0 1 34.14 45.43 8.27 8.27 0 0 0 7.7 5.52h171.8a7.76 7.76 0 0 0 6.61-3.58 8 8 0 0 0 1.09-7.42 109.06 109.06 0 0 0-39.91-53.43zm-158-37.16a111.62 111.62 0 0 0 32.76-78.75 110 110 0 0 0-32.76-78.74 105.91 105.91 0 0 0-20.37-16.24h113.39a95 95 0 1 1 0 190 3.55 3.55 0 0 0-1.65.27H70.798a109.06 109.06 0 0 0 20.65-16.54h.04zm-13.77 37.16c-1.92-1.37-4.13-2.75-6.33-4.13h117.8a94.79 94.79 0 0 1 80.12 52h-153.63a112 112 0 0 0-38-47.87h.04z' class='cls-1'/%3E%3Cpath fill='%230044d4' d='M158.398 115.58a8.11 8.11 0 0 0 8.26 8.26h82.6a8.26 8.26 0 0 0 0-16.52h-82.6a8.29 8.29 0 0 0-8.26 8.26zM152.298 156.92h82.59a8.26 8.26 0 0 0 0-16.52h-82.59a8.11 8.11 0 0 0-8.26 8.26 8.28 8.28 0 0 0 8.26 8.26zM152.298 90.8h82.59a8.26 8.26 0 0 0 0-16.52h-82.59a8.11 8.11 0 0 0-8.26 8.26 8.46 8.46 0 0 0 8.26 8.26z' class='cls-1'/%3E%3C/svg%3E\""
        );
      } else {
        throw new Error("NestJSRedox: Can't find redoc bundle. Please install redoc.");
      }
    }

    if (httpAdapter && httpAdapter.getType() === 'fastify') {
      (app as NestFastifyApplication).use((request: FastifyRequest, response: FastifyReply['raw'], next: () => void) => {
        return NestJSRedoxStaticMiddlewareFastify(request, response, next, {
          preparedRedocJS: this.preparedRedocJS!,
          baseUrlForRedocUI: finalPath,
        });
      });
    } else {
      (app as NestExpressApplication).use((request: Request, response: Response, next: NextFunction) => {
        return NestJSRedoxStaticMiddlewareExpress(request, response, next, {
          preparedRedocJS: this.preparedRedocJS!,
          baseUrlForRedocUI: finalPath,
        });
      });
    }
  }

  private static serveDocuments(
    finalPath: string,
    urlLastSubdirectory: string,
    httpAdapter: HttpServer,
    documentOrURL: OpenAPIObject | (() => OpenAPIObject) | string,
    options: {
      redocOptions: RedocOptions;
      redoxOptions: NestJSRedoxOptions;
    }
  ) {
    let document: OpenAPIObject;
    const documentURL = typeof documentOrURL === 'string' ? documentOrURL : undefined;

    const lazyBuildDocument = () => {
      if (typeof documentOrURL === 'string') {
        throw new Error('documentFactory is a string.');
      }

      return typeof documentOrURL === 'function'
        ? this.applyRedocExtensions(options.redocOptions, documentOrURL())
        : this.applyRedocExtensions(options.redocOptions, documentOrURL);
    };

    const baseUrlForRedocUI = normalizeRelPath(`./${urlLastSubdirectory}/`);

    if (httpAdapter.getType() === 'fastify') {
      const instance: FastifyInstance = httpAdapter.getInstance();

      if (options.redoxOptions.auth?.enabled) {
        if (!this.isFastifyBasicAuthRegistered) {
          this.isFastifyBasicAuthRegistered = true;

          instance.register(fastifyBasicAuth, {
            validate: async (username, password, req, reply) => {
              if (!Object.keys(options.redoxOptions.auth.users).includes(username) || options.redoxOptions.auth.users[username] !== password) {
                return new Error('Undefined!');
              }
            },
            authenticate: {
              realm: 'NestJSRedox',
            },
          });
        }
      }
      instance.setErrorHandler(function (err, req, reply) {
        if (err.statusCode === 401) {
          // this was unauthorized! Display the correct page/message.
          reply.code(401).send({ was: 'unauthorized' });
          return;
        }
        reply.send(err);
      });
    }

    httpAdapter.get(finalPath, (req, res, next) => {
      const sendPage = (error?: Error) => {
        if (error) {
          res.send(new UnauthorizedException());
          return;
        }
        res.type('text/html');

        if (!document && !documentURL) {
          document = lazyBuildDocument();
        }

        const nonce = randomBytes(16).toString('hex');
        const html = buildRedocHTML(baseUrlForRedocUI, document, documentURL, options.redoxOptions, options.redocOptions, nonce);
        this.setContentSecurityHeader(httpAdapter, res, nonce);

        if (options.redoxOptions.overwriteHeadersWith && typeof options.redoxOptions.overwriteHeadersWith === 'object') {
          this.overwriteHeadersWith(httpAdapter, res, options.redoxOptions.overwriteHeadersWith);
        }
        this.overwriteHeadersWith(httpAdapter, res, {
          'Content-Type': 'text/html; charset=utf-8',
        });

        res.send(html);
      };

      if (options.redoxOptions.auth?.enabled) {
        if (httpAdapter.getType() === 'express') {
          expressAuth({
            users: options.redoxOptions.auth.users,
            challenge: true,
          })(req, res, () => {
            sendPage();
          });
        } else if (httpAdapter.getType() === 'fastify') {
          const instance: FastifyInstance = httpAdapter.getInstance();
          if (instance.basicAuth) {
            instance.basicAuth(req, res, sendPage);
          } else {
            sendPage();
          }
        }
      } else {
        sendPage();
      }
    });

    // fastify doesn't resolve 'routePath/' -> 'routePath', that's why we handle it manually
    try {
      httpAdapter.get(normalizeRelPath(`${finalPath}/`), (req, res) => {
        res.type('text/html');

        if (!document && !documentURL) {
          document = lazyBuildDocument();
        }

        const nonce = randomBytes(16).toString('hex');
        const html = buildRedocHTML(baseUrlForRedocUI, document, documentURL, options.redoxOptions, options.redocOptions, nonce);
        this.setContentSecurityHeader(httpAdapter, res, nonce);
        res.send(html);
      });
    } catch (err) {
      /**
       * When Fastify adapter is being used with the "ignoreTrailingSlash" configuration option set to "true",
       * declaration of the route "finalPath/" will throw an error because of the following conflict:
       * Method '${method}' already declared for route '${path}' with constraints '${JSON.stringify(constraints)}.
       * We can simply ignore that error here.
       */
    }
  }

  /**
   * Fixes content security policy issue
   * see issue #2 and #17
   * @param httpAdapter
   * @param res
   * @private
   */
  private static setContentSecurityHeader(httpAdapter: HttpServer, res: Response, nonce: string) {
    const header = {
      name: 'Content-Security-Policy',
      value: `script-src 'self' 'nonce-${nonce}'; script-src-elem 'self' 'nonce-${nonce}' https://cdn.redoc.ly; child-src 'self' 'nonce-${nonce}' blob:;`,
    };

    if (httpAdapter.getType() === 'express') {
      res.setHeader(header.name, header.value);
    } else if (httpAdapter.getType() === 'fastify') {
      res.header(header.name, header.value);
    }
  }

  /**
   * overwrites the HTTP header with that ones from RedoxOptions.
   * @param newHeaders foreach header use one attribute and value
   */
  private static overwriteHeadersWith(httpAdapter: HttpServer, res: Response, newHeaders?: Record<string, string>) {
    for (const key of Object.keys(newHeaders ?? {})) {
      if (httpAdapter.getType() === 'express') {
        res.setHeader(key, newHeaders[key]);
      } else if (httpAdapter.getType() === 'fastify') {
        res.header(key, newHeaders[key]);
      }
    }
  }

  private static applyRedocExtensions(redocOptions: RedocOptions | undefined, swaggerSpec: OpenAPIObject) {
    if (redocOptions?.logo) {
      const logo = swaggerSpec.info['x-logo'] ?? {};
      swaggerSpec.info['x-logo'] = {
        ...logo,
        url: logo['url'] ?? redocOptions.logo.url,
        href: logo['href'] ?? redocOptions.logo.href,
        backgroundColor: logo['backgroundColor'] ?? redocOptions.logo.backgroundColor,
        altText: logo['altText'] ?? redocOptions.logo.altText,
      };
    }

    if (redocOptions?.tagGroups) {
      swaggerSpec['x-tagGroups'] = swaggerSpec['x-tagGroups'] ?? redocOptions.tagGroups;
    }

    return swaggerSpec;
  }
}
