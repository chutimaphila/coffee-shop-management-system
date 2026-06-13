import { Module } from '@nestjs/common';
import { CheckStockService } from './check-stock.service';
import { CheckStockController } from './check-stock.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckStock } from './entities/check-stock.entity';
import { StockDetail } from 'src/stock-detail/entities/stock-detail.entity';
import { StockDetailModule } from 'src/stock-detail/stock-detail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CheckStock, StockDetail]),
    CheckStockModule,
    StockDetailModule, // นำเข้าหมายเลข UserModule// นำเข้าหมายเลข CustomerModule
  ],
  controllers: [CheckStockController],
  providers: [CheckStockService],
  exports: [CheckStockService],
})
export class CheckStockModule {}
