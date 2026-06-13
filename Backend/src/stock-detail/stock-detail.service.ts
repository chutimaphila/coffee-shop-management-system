import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStockDetailDto } from './dto/create-stock-detail.dto';
import { UpdateStockDetailDto } from './dto/update-stock-detail.dto';
import { Repository } from 'typeorm';
import { StockDetail } from './entities/stock-detail.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class StockDetailService {
  constructor(
    @InjectRepository(StockDetail)
    private readonly stockDetailRepository: Repository<StockDetail>,
  ) {}
  private stockDetails = [];

  async create(dto: CreateStockDetailDto) {
    return this.stockDetailRepository.save(dto);
  }

  async findAll() {
    return this.stockDetailRepository.find();
  }

  async findOne(id: number) {
    return this.stockDetailRepository.findOne({ where: { id } });
  }

  async update(id: number, dto: UpdateStockDetailDto) {
    const item = await this.stockDetailRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`StockDetail with id ${id} not found`);
    }
    const updated = Object.assign(item, dto);
    return this.stockDetailRepository.save(updated);
  }

  async remove(id: number) {
    const item = await this.stockDetailRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`StockDetail with id ${id} not found`);
    }
    return this.stockDetailRepository.remove(item);
  }
}
