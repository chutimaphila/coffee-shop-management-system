import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CheckStockService } from './check-stock.service';
import { CreateCheckStockDto } from './dto/create-check-stock.dto';
import { UpdateCheckStockDto } from './dto/update-check-stock.dto';
@Controller('checkStocks')
export class CheckStockController {
  constructor(private readonly checkStockService: CheckStockService) {}

  @Post()
  create(@Body() createCheckStockDto: CreateCheckStockDto) {
    return this.checkStockService.create(createCheckStockDto);
  }

  @Get()
  findAll() {
    return this.checkStockService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.checkStockService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCheckStockDto: UpdateCheckStockDto,
  ) {
    return this.checkStockService.update(+id, updateCheckStockDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.checkStockService.remove(+id);
  }
}
