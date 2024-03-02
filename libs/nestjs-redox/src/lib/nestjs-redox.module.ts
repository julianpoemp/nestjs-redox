import { Module } from '@nestjs/common';
import { NestjsRedoxService } from './nestjs-redox.service';

@Module({
  providers: [NestjsRedoxService],
  exports: [NestjsRedoxService],
})
export class NestjsRedoxModule {}
