import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NestjsRedoxModule } from 'nestjs-redox';

@Module({
  imports: [NestjsRedoxModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {
}
