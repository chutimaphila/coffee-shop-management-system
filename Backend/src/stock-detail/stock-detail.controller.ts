import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { StockDetailService } from './stock-detail.service';
import { CreateStockDetailDto } from './dto/create-stock-detail.dto';
import { UpdateStockDetailDto } from './dto/update-stock-detail.dto';

@Controller('stock-detail')
export class StockDetailController {
  constructor(private readonly stockDetailService: StockDetailService) {}

  @Post()
  create(@Body() dto: CreateStockDetailDto) {
    return this.stockDetailService.create(dto);
  }

  @Get()
  findAll() {
    return this.stockDetailService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockDetailService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStockDetailDto) {
    return this.stockDetailService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockDetailService.remove(+id);
  }
}
