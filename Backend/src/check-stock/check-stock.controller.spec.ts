import { Test, TestingModule } from '@nestjs/testing';
import { CheckStockController } from './check-stock.controller';
import { CheckStockService } from './check-stock.service';

describe('CheckStockController', () => {
  let controller: CheckStockController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckStockController],
      providers: [CheckStockService],
    }).compile();

    controller = module.get<CheckStockController>(CheckStockController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
