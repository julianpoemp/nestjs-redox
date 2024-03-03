import { DynamicModule, HttpServer, INestApplication } from '@nestjs/common';
import { NestjsRedoxService } from './nestjs-redox.service';
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
import * as jsyaml from 'js-yaml';

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
        NestjsRedoxService,
      ],
      exports: [NestjsRedoxService],
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
    const validatedGlobalPrefix =
      options?.useGlobalPrefix && validateGlobalPrefix(globalPrefix)
        ? validatePath(globalPrefix)
        : '';

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
      NestjsRedoxModule.serveStatic(finalPath, app);
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
      NestjsRedoxModule.serveStatic(serveStaticSlashEndingPath, app);
    }
  }

  private static serveStatic(finalPath: string, app: INestApplication) {
    const httpAdapter = app.getHttpAdapter();
    const redocAssetsPath = resolve('node_modules/redoc/bundles');

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

    httpAdapter.get(finalPath, (req, res) => {
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

      res.send(html);
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
}
