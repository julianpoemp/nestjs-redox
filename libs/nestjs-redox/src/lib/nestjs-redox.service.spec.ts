import { Test, TestingModule } from '@nestjs/testing';
import { NestjsRedoxService } from './nestjs-redox.service';

describe('NestjsRedoxService', () => {
  let service: NestjsRedoxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NestjsRedoxService],
    }).compile();

    service = module.get<NestjsRedoxService>(NestjsRedoxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
