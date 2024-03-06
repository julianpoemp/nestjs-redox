import {
  DynamicModule,
  HttpServer,
  INestApplication,
  UnauthorizedException,
} from '@nestjs/common';
import { NestJSRedoxOptions, RedocOptions } from './types';
import { OpenAPIObject } from '@nestjs/swagger';
import { getGlobalPrefix } from '@nestjs/swagger/dist/utils/get-global-prefix';
import { validatePath } from '@nestjs/swagger/dist/utils/validate-path.util';
import { validateGlobalPrefix } from '@nestjs/swagger/dist/utils/validate-global-prefix.util';
import { resolve } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { normalizeRelPath } from '@nestjs/swagger/dist/utils/normalize-rel-path';
import * as handlebars from 'handlebars';
import { REDOC_HANDLEBAR } from './views/index.hbs';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import expressAuth from 'express-basic-auth';
import { fastifyBasicAuth } from '@fastify/basic-auth';
import { FastifyInstance } from 'fastify';

const buildRedocHTML = (
  baseUrlForRedocUI: string,
  document: OpenAPIObject,
  redoxOptions: NestJSRedoxOptions,
  redocOptions: RedocOptions = {}
) => {
  const template = handlebars.compile(REDOC_HANDLEBAR);
  handlebars.registerHelper('json', (context, options) => {
    return JSON.stringify(context ?? {});
  });
  return template({
    baseUrlForRedocUI,
    document,
    redoxOptions,
    redocOptions,
  });
};

/** ------
 * Disclaimer: some functions were extracted from https://github.com/nestjs/swagger/blob/master/lib/swagger-module.ts
 * and changed in that way it renders redoc instead of swagger ui.
 */

export class NestjsRedoxModule {
  protected static redocOptions: RedocOptions;
  protected static options: NestJSRedoxOptions;

  static register(
    options?: NestJSRedoxOptions,
    redocOptions?: RedocOptions
  ): DynamicModule {
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

  public static setup(
    path: string,
    app: INestApplication,
    documentOrFactory: OpenAPIObject | (() => OpenAPIObject),
    options: NestJSRedoxOptions = new NestJSRedoxOptions(),
    redocOptions?: RedocOptions
  ) {
    options = new NestJSRedoxOptions(options);
    const globalPrefix = getGlobalPrefix(app);
    const finalPath = validatePath(
      options?.useGlobalPrefix && validateGlobalPrefix(globalPrefix)
        ? `${globalPrefix}${validatePath(path)}`
        : path
    );
    const urlLastSubdirectory = finalPath.split('/').slice(-1).pop() || '';
    const httpAdapter = app.getHttpAdapter();

    NestjsRedoxModule.serveDocuments(
      finalPath,
      urlLastSubdirectory,
      httpAdapter,
      documentOrFactory,
      {
        redocOptions: redocOptions || {},
        redoxOptions: options,
      }
    );

    if (options.standalone) {
      NestjsRedoxModule.serveStatic(finalPath, app, options);
    }
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

  private static serveStatic(
    finalPath: string,
    app: INestApplication,
    options: NestJSRedoxOptions
  ) {
    const httpAdapter = app.getHttpAdapter();
    const redocAssetsPath =
      options.redocBundlesDir ?? resolve('node_modules/redoc/bundles');

    if (httpAdapter && httpAdapter.getType() === 'fastify') {
      (app as NestFastifyApplication).useStaticAssets({
        root: redocAssetsPath,
        prefix: finalPath,
        decorateReply: false,
      });
    } else {
      (app as NestExpressApplication).useStaticAssets(redocAssetsPath, {
        prefix: finalPath,
      });
    }
  }

  private static serveDocuments(
    finalPath: string,
    urlLastSubdirectory: string,
    httpAdapter: HttpServer,
    documentOrFactory: OpenAPIObject | (() => OpenAPIObject),
    options: {
      redocOptions: RedocOptions;
      redoxOptions: NestJSRedoxOptions;
    }
  ) {
    let document: OpenAPIObject;

    const lazyBuildDocument = () => {
      return typeof documentOrFactory === 'function'
        ? documentOrFactory()
        : documentOrFactory;
    };

    const baseUrlForRedocUI = normalizeRelPath(`./${urlLastSubdirectory}/`);

    let html: string;

    if (httpAdapter.getType() === 'fastify') {
      const instance: FastifyInstance = httpAdapter.getInstance();
      instance.register(fastifyBasicAuth, {
        validate: async (username, password, req, reply) => {
          if (
            !Object.keys(options.redoxOptions.auth.users).includes(username) ||
            options.redoxOptions.auth.users[username] !== password
          ) {
            return new Error('Undefined!');
          }
        },
        authenticate: {
          realm: 'NestJSRedox',
        },
      });
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

        if (!document) {
          document = lazyBuildDocument();
        }

        if (!html) {
          html = buildRedocHTML(
            baseUrlForRedocUI,
            document,
            options.redoxOptions,
            options.redocOptions
          );
        }
        this.setContentSecurityHeader(httpAdapter, res);
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

        if (!document) {
          document = lazyBuildDocument();
        }

        if (!html) {
          html = buildRedocHTML(
            baseUrlForRedocUI,
            document,
            options.redoxOptions,
            options.redocOptions
          );
        }
        this.setContentSecurityHeader(httpAdapter, res);
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
   * fixes content security policy issue see issue #1
   * @param httpAdapter
   * @param res
   * @private
   */
  private static setContentSecurityHeader(httpAdapter: HttpServer, res: any) {
    const header = {
      name: 'Content-Security-Policy',
      value:
        "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; child-src * 'unsafe-inline' 'unsafe-eval' blob:; worker-src * 'unsafe-inline' 'unsafe-eval' blob:; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';",
    };

    if (httpAdapter.getType() === 'express') {
      res.setHeader(header.name, header.value);
    } else if (httpAdapter.getType() === 'fastify') {
      res.header(header.name, header.value);
    }
  }
}
