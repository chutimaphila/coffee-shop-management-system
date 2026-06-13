import { Test, TestingModule } from '@nestjs/testing';
import { CheckStockService } from './check-stock.service';

describe('CheckStockService', () => {
  let service: CheckStockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CheckStockService],
    }).compile();

    service = module.get<CheckStockService>(CheckStockService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
