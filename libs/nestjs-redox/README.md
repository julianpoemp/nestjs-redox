<h1 style="text-align: center;">NestJS-Redox</h1>

<p style="text-align: center;">This <a href="https://docs.nestjs.com/">NestJS</a> module enabled to auto-generate beautiful API docs using <a href="https://www.openapis.org/">Swagger</a> and <a href="https://github.com/Redocly/redoc/tree/main">Redoc</a>. It supports NestJS 10, ExpressJS and Fastify.</p>

<img src="https://raw.githubusercontent.com/Redocly/redoc/main/demo/redoc-demo.png" />

## Features

- NestJS 10 support
- ExpressJS and Fastify support
- Multi-user auth basic support
- Option "standalone" for self hosted redoc bundles
- Option to disable Google fonts

## Installation

`npm install nestjs-redox`

### Standalone

By default NestJSRedox automatically loads the redoc bundle from a CDN. If you want to host it yourself, install redoc via `npm install redoc` and set `standalone` in RedoxOptions parameter to true. See chapter "setup".

## Setup

In your main.ts file, before calling app.listen() insert the module setup:

```typescript
/** example swagger config **/
const swaggerConfig = new DocumentBuilder()
    .setTitle('API reference')
    .setDescription('Some description')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addSecurity('roles', {
      type: 'http',
      scheme: 'bearer',
    })
    .build();

/**
 * official supported options by Redoc
 */
const redocOptions: RedocOptions = {
  requiredPropsFirst: true,
};

/**
 * create swagger document
 */
const document = SwaggerModule.createDocument(app, swaggerConfig, {
  ignoreGlobalPrefix: false,
  operationIdFactory: (controllerKey, methodKey) => methodKey,
});

/**
 * Initialize NestjsRedoxModule
 */
NestjsRedoxModule.setup(
  'reference',
  app as any,
  document,
  {
    useGlobalPrefix: true,
    disableGoogleFont: true,
    standalone: true,
    auth: {
      enabled: true,
      users: {
        user1: 'user1',
        user2: 'user2',
      },
    },
  },
  redocOptions
);
```

If you like this package give it a star ;)

### Options

For supported options see [Options](https://github.com/julianpoemp/nestjs-redox/blob/main/libs/nestjs-redox/src/lib/types.ts).

## Changelog
See [Changelog](https://github.com/julianpoemp/nestjs-redox/blob/main/libs/nestjs-redox/CHANGELOG.md).

## Contributing

If you want to contribute please fork this repository and send a pull request. The commit messages must be formatted after the conventional changelog angular theme. Following scopes are allowed: "nestjs-redox", "demo-express", "demo-fastify" and "project" for changes that affect the whole project.
