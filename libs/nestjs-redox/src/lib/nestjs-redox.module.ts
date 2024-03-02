import { MiddlewareConsumer, Module } from '@nestjs/common';
import { NestjsRedoxService } from './nestjs-redox.service';
import { LoggerMiddleware } from './nestjs-redox.middleware';

@Module({
  providers: [NestjsRedoxService],
  exports: [NestjsRedoxService],
})
export class NestjsRedoxModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('');
  }
}
