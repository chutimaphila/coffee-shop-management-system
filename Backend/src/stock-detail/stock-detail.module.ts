import { Module } from '@nestjs/common';
import { StockDetailService } from './stock-detail.service';
import { StockDetailController } from './stock-detail.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockDetail } from './entities/stock-detail.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([StockDetail]),
    StockDetailModule, // นำเข้าหมายเลข UserModule// นำเข้าหมายเลข CustomerModule
  ],
  controllers: [StockDetailController],
  providers: [StockDetailService],
  exports: [StockDetailService],
})
export class StockDetailModule {}
