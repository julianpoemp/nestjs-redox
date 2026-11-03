<h1 style="text-align: center;" align="center">NestJS-Redox v3.x <a href="https://www.npmjs.com/package/nestjs-redox?activeTab=readme"><img alt="NPM Version" src="https://img.shields.io/npm/v/nestjs-redox"></a></h1>

<p style="text-align: center;" align="center">This <a href="https://docs.nestjs.com/">NestJS</a> module enables to auto-generate beautiful API docs using <a href="https://www.openapis.org/">Swagger</a> and <a href="https://github.com/Redocly/redoc/tree/main">Redoc</a>. It supports NestJS 11, ExpressJS and Fastify.</p>

<img src="https://github.com/Redocly/redoc/raw/main/images/redoc-layouts.gif" />

## Features

- NestJS 11 support
- ExpressJS and Fastify support
- Redoc v3 support with modern interface
- Multi-user auth basic support
- Option "standalone" for self hosted redoc bundles without requesting a CDN.
- Redoc telemetry disabled by default
- Theming via CSS variables (option "customCss")

Using the "standalone" option respects the user's privacy and allows to serve the API reference offline (Redoc 3 uses the system font stack, Google Fonts are not loaded anymore).

⭐️ If you like this package give it a star ;) ⭐️

## Compatibility

<table>
<thead>
<tr>
<th>nestjs-redox</th>
<th>NestJS</th>
<th>Redoc</th>
<th></th>
</tr>
</thead>
<tbody><tr>
<td>
  <a href="https://www.npmjs.com/package/nestjs-redox"><img alt="npm" src="https://img.shields.io/npm/v/nestjs-redox/latest"></a>
</td>
<td>
  v11
</td>
<td>
v3
</td>
<td><a href="https://github.com/julianpoemp/nestjs-redox">More information</a></td>
</tr>
<tr>
<td>
  <a href="https://www.npmjs.com/package/nestjs-redox/v/2x"><img alt="npm" src="https://img.shields.io/npm/v/nestjs-redox/2x"></a>
</td>
<td>
  v11
</td>
<td>
v2
</td>
<td><a href="https://github.com/julianpoemp/nestjs-redox/tree/v2.x/">More information</a></td>
</tr>
<tr>
<td>
  <a href="https://www.npmjs.com/package/nestjs-redox/v/1x"><img alt="npm" src="https://img.shields.io/npm/v/nestjs-redox/1x"></a>
</td>
<td>
  v10
</td>
<td>
v2
</td>
<td><a href="https://github.com/julianpoemp/nestjs-redox/blob/v1.x/README.md">More information</a></td>
</tr>
</tbody>
</table>

## Installation

`npm install nestjs-redox`

### Standalone

By default NestJSRedox automatically loads the redoc bundle from a CDN. If you want to host it yourself, install redoc via `npm install "redoc@^3.0.1"` and set `standalone` in RedoxOptions parameter to true. An additional fix replaces the redoc logo URL with a local saved image.
See chapter "setup".

### Supported Redoc versions

NestJSRedox supports Redoc `^3.0.0`. If you need Redoc 2, use [nestjs-redox v2.x](https://github.com/julianpoemp/nestjs-redox/tree/v2.x/).

- **CDN (default):** NestJSRedox loads a pinned Redoc version (`3.0.1`) from the CDN. You can change it using the `redocVersion` option, e.g. `redocVersion: '3.0.0'` or `redocVersion: '3.x'` for the newest Redoc 3 release. `redocVersion: 'latest'` always loads the newest Redoc release, which may be an unsupported major version.
- **Standalone:** redoc is an optional peer dependency (`^3.0.0`), so npm reports a conflict if you install an unsupported version. On startup NestJSRedox also checks the installed version and throws an error if it isn't `^3.0.0`. Set `allowUnsupportedRedocVersion: true` to skip this check.

### Telemetry

Redoc 3 collects anonymous usage data by default. NestJSRedox disables it by setting the Redoc option `disableTelemetry` to `true`. If you want to enable it, set `disableTelemetry: false` in RedocOptions.

### Theming

Redoc 3 removed the `theme` option. It's styled using [CSS variables](https://redocly.com/docs/realm/branding/css-variables) instead. Use the option `customCss` of NestJSRedoxOptions to add your own CSS, e.g.:

```typescript
const redoxOptions: NestJSRedoxOptions = {
  customCss: `
    :root { --sidebar-width: 222px; }
    :root.dark { --color-primary-base: #60a5fa; }
  `,
};
```

### Migration from nestjs-redox v2 (Redoc 2)

- The RedocOptions follow the [Redoc 3 configuration](https://redocly.com/docs/redoc/v3.x/config). Some options were renamed (e.g. `requiredPropsFirst` → `sortRequiredPropsFirst`, `hideDownloadButton` → `hideDownloadButtons`, `jsonSampleExpandLevel` → `jsonSamplesExpandLevel`, `schemaExpansionLevel` → `schemasExpansionLevel`, `untrustedDefinition` → `sanitize`) and many were removed by Redoc. See the [Redoc migration guide](https://redocly.com/docs/redoc/v3.x/config-migration) for details.
- `theme` was removed, use `customCss` in NestJSRedoxOptions instead (see "Theming").
- `disableGoogleFont` was removed because Redoc 3 doesn't use Google Fonts anymore.
- `logo` and `tagGroups` are still supported. They set the `x-logo` and `x-tagGroups` extensions of your OpenAPI document. If you pass an URL instead of a document, `logo` is mapped to Redoc's `apiLogo` option.

## Setup

In your main.ts file, before calling app.listen() insert the module setup (Fastify example more below):

### ExpressJS example

```typescript
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestjsRedoxModule, NestJSRedoxOptions, RedocOptions } from 'nestjs-redox';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // ...

  const swaggerConfig = new DocumentBuilder()
    .setTitle('NESTJS-REDOX API')
    .setDescription('some description')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addSecurity('roles', {
      type: 'http',
      scheme: 'bearer',
    })
    .build();

  const redocOptions: RedocOptions = {
    sortRequiredPropsFirst: true,
    logo: {
      url: 'https://redocly.github.io/redoc/petstore-logo.png',
    },
  };

  const redoxOptions: NestJSRedoxOptions = {
    useGlobalPrefix: true,
    customCss: ':root { --sidebar-width: 222px; }',
    standalone: true,
    auth: {
      enabled: true,
      users: {
        test123: 'test123',
        test: 'test',
      },
    },
  };

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    ignoreGlobalPrefix: false,
    operationIdFactory: (controllerKey, methodKey) => methodKey,
  });

  NestjsRedoxModule.setup('reference', app, document, redoxOptions, redocOptions);

  // ...
  await app.listen(port);
}

bootstrap();
```

### Fastify example

```typescript
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestjsRedoxModule, NestJSRedoxOptions, RedocOptions } from 'nestjs-redox';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  // ...

  const swaggerConfig = new DocumentBuilder()
    .setTitle('NESTJS-REDOX API')
    .setDescription('some description')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addSecurity('roles', {
      type: 'http',
      scheme: 'bearer',
    })
    .build();

  const redocOptions: RedocOptions = {
    sortRequiredPropsFirst: true,
  };

  const redoxOptions: NestJSRedoxOptions = {
    useGlobalPrefix: true,
    customCss: ':root { --sidebar-width: 222px; }',
    standalone: true,
    auth: {
      enabled: true,
      users: {
        test123: 'test123',
        test: 'test',
      },
    },
  };

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    ignoreGlobalPrefix: false,
    operationIdFactory: (controllerKey, methodKey) => methodKey,
  });

  NestjsRedoxModule.setup('reference', app, document, redoxOptions, redocOptions);

  //... 

  await app.listen(port);
}

bootstrap();
```
<br/>
⭐️ **If you like this package give it a star ;)** ⭐️

### Options

For supported options see [Options](https://github.com/julianpoemp/nestjs-redox/blob/main/libs/nestjs-redox/src/lib/types.ts).

## Changelog

See [Changelog](https://github.com/julianpoemp/nestjs-redox/blob/main/libs/nestjs-redox/CHANGELOG.md).

## Development

Clone this repository and run `npm install`. You find the library under `libs/nestjs-redox` and the demo apps under `apps/demo-express`or `apps/demo-fastify`. Please run `npm run format` before commiting and make sure to use valid commit messages (see chapter Contributing).

## E2E Testing

Run `npm run test` to run e2e tests.

## Contributing

If you want to contribute please create a new issue with your feature request. When your issue was approved you can work on a PR. **If you created a PR without approval and we don't see a need for the PR it won't be merged. To create a PR fork this repository and send a pull request. The commit messages must be formatted after the conventional changelog angular theme. Following scopes are allowed: "nestjs-redox", "demo-express", "demo-fastify" and "project" for changes that affect the whole project.
