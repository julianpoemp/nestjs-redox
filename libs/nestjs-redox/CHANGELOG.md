# Changelog

This file was generated using [@jscutlery/semver](https://github.com/jscutlery/semver).

## [1.3.3](https://github.com/julianpoemp/nestjs-redox/compare/nestjs-redox-1.3.2...nestjs-redox-1.3.3) (2025-02-28)


### Bug Fixes

* **nestjs-redox:** TypeError: res.setHeader is not a function on fastify ([0344de5](https://github.com/julianpoemp/nestjs-redox/commit/0344de5ccb0c34d8d6c7b52277cfc6a5dabfa27f))



## [1.3.2](https://github.com/julianpoemp/nestjs-redox/compare/nestjs-redox-1.3.1...nestjs-redox-1.3.2) (2025-02-27)


### Bug Fixes

* **nestjs-redox:** invalid encoded text on some languages ref [#10](https://github.com/julianpoemp/nestjs-redox/issues/10) ([f86a600](https://github.com/julianpoemp/nestjs-redox/commit/f86a6004b99255acfaa138225cc77246fc127602))



## [1.3.1](https://github.com/julianpoemp/nestjs-redox/compare/nestjs-redox-1.3.0...nestjs-redox-1.3.1) (2025-02-03)


### Bug Fixes

* **nestjs-redox:** fix 'invalid character' error encoding JSON spec [#9](https://github.com/julianpoemp/nestjs-redox/issues/9) ([6eea401](https://github.com/julianpoemp/nestjs-redox/commit/6eea40181c465839867433713994c1817ad99f53))



# [1.3.0](https://github.com/julianpoemp/nestjs-redox/compare/nestjs-redox-1.2.2...nestjs-redox-1.3.0) (2025-01-24)


### Features

* **nestjs-redox:** improved compatibility for bigger swagger json files ([11d42bf](https://github.com/julianpoemp/nestjs-redox/commit/11d42bfd36f6ebcb577f87030d804d46c4c2cd8a))



## [1.2.2](https://github.com/julianpoemp/nestjs-redox/compare/nestjs-redox-1.2.1...nestjs-redox-1.2.2) (2024-09-11)

### Bug Fixes

- **nestjs-redox:** fastify multiple api spec throws "The decorator 'basicAuth' has already been added ([622be00](https://github.com/julianpoemp/nestjs-redox/commit/622be00dbb1d449e84d4b36f74fc4e7a91dfee47)), closes [#7](https://github.com/julianpoemp/nestjs-redox/issues/7)

## [1.2.1](https://github.com/julianpoemp/nestjs-redox/compare/nestjs-redox-1.2.0...nestjs-redox-1.2.1) (2024-07-26)

### Bug Fixes

- **nestjs-redox:** cdn replacement not working without write access to node_modules ([806b694](https://github.com/julianpoemp/nestjs-redox/commit/806b6940f3b648b388453b5b3850092dfdb8d9c9))

# [1.2.0](https://github.com/julianpoemp/nestjs-redox/compare/nestjs-redox-1.1.6...nestjs-redox-1.2.0) (2024-07-23)

### Features

- **nestjs-redox:** new NestJSRedoxOptions.overwriteHeadersWith overwrites HTTP header for redoc ([1097650](https://github.com/julianpoemp/nestjs-redox/commit/109765041575547d956bb1ab5be16efb40b0d102)), closes [#6](https://github.com/julianpoemp/nestjs-redox/issues/6)
- **nestjs-redox:** replace redoc cdn link with local svg on standalone ([5a57946](https://github.com/julianpoemp/nestjs-redox/commit/5a579462d4a68c835130de1b94b0188ff528d6b6)), closes [#6](https://github.com/julianpoemp/nestjs-redox/issues/6)

## [1.1.6](https://github.com/julianpoemp/nestjs-redox/compare/nestjs-redox-1.1.5...nestjs-redox-1.1.6) (2024-07-22)

### Bug Fixes

- **nestjs-redox:** tag groups not working properly ([853e9c6](https://github.com/julianpoemp/nestjs-redox/commit/853e9c641b66a9b2cfdacd0bb749d854d5087098)), closes [#4](https://github.com/julianpoemp/nestjs-redox/issues/4)
- **nestjs-redox:** wrong type for RedocOptions.expandResponses, should be string ([5f14cde](https://github.com/julianpoemp/nestjs-redox/commit/5f14cdedfdf3f7c689c73ae749fcf7b52294cf0f)), closes [#4](https://github.com/julianpoemp/nestjs-redox/issues/4)

## [1.1.5](https://github.com/julianpoemp/nestjs-redox/compare/nestjs-redox-1.1.4...nestjs-redox-1.1.5) (2024-06-23)

### Bug Fixes

- **nestjs-redox:** RedocOptions.logo and RedocOptions.tagGroups not working ([9d8b1e0](https://github.com/julianpoemp/nestjs-redox/commit/9d8b1e03cb6a9e12b65e30d859c97c5130a4860f))

## [1.1.4](https://github.com/julianpoemp/nestjs-redox/compare/nestjs-redox-1.1.3...nestjs-redox-1.1.4) (2024-06-15)

### Features

- **nestjs-redox:** generate Redoc page from static URL ([4f35209](https://github.com/julianpoemp/nestjs-redox/commit/4f3520914bcce87b634a6a82484b9897dacab5a4))

## [1.1.3](https://github.com/julianpoemp/nestjs-redox/compare/nestjs-redox-1.1.2...nestjs-redox-1.1.3) (2024-05-29)

### Bug Fixes

- **nestjs-redox:** add missing theme property ([e20cd7e](https://github.com/julianpoemp/nestjs-redox/commit/e20cd7ee90c222cbc0acc8684d86bc8b9a19c119))

## [1.1.2](https://github.com/julianpoemp/nestjs-redox/compare/nestjs-redox-1.1.1...nestjs-redox-1.1.2) (2024-03-06)

### Bug Fixes

- **nestjs-redox:** basic auth with fastify not working ([39ff94d](https://github.com/julianpoemp/nestjs-redox/commit/39ff94d5be6e75d4f168a9b027fdcf92a9bf78e1))

## [1.1.1](https://github.com/julianpoemp/nestjs-redox/compare/nestjs-redox-1.1.0...nestjs-redox-1.1.1) (2024-03-06)

### Bug Fixes

- **nestjs-redox:** refused to execute inline script ref [#1](https://github.com/julianpoemp/nestjs-redox/issues/1) ([fa404fa](https://github.com/julianpoemp/nestjs-redox/commit/fa404fa09686991edddcef14cd617c5f145877d6))

# [1.1.0](https://github.com/julianpoemp/nestjs-redox/compare/nestjs-redox-1.0.0...nestjs-redox-1.1.0) (2024-03-03)

### Features

- **nestjs-redox:** option "redocBundlesDir" enables setting path for redoc bundles dir ([7960257](https://github.com/julianpoemp/nestjs-redox/commit/79602575fc098ed079f9b4f17a3e16eb47a7756d))

# 1.0.0 (2024-03-03)

### Features

- **nestjs-redox:** basic auth support for fastify ([ef557b1](https://github.com/julianpoemp/nestjs-redox/commit/ef557b17005537bd517bb2cb0a3b2b24e8e259e0))
- **nestjs-redox:** basic auth support with multiple users ([f68c978](https://github.com/julianpoemp/nestjs-redox/commit/f68c9788c4fcb0a02c3f47d7db14591a0f8aeac3))
- **nestjs-redox:** RedocOptions with latest redoc options ([a7e29d8](https://github.com/julianpoemp/nestjs-redox/commit/a7e29d895df8d30343e0204f1695a395f6c43886))
