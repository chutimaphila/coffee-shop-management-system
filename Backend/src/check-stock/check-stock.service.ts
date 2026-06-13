import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCheckStockDto } from './dto/create-check-stock.dto';
import { UpdateCheckStockDto } from './dto/update-check-stock.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CheckStock } from './entities/check-stock.entity';
import { Repository } from 'typeorm';
import { StockDetail } from 'src/stock-detail/entities/stock-detail.entity';

@Injectable()
export class CheckStockService {
  constructor(
    @InjectRepository(CheckStock)
    private readonly checkstockRepository: Repository<CheckStock>,
    @InjectRepository(StockDetail)
    private readonly stockDetailRepository: Repository<StockDetail>,
  ) {}
  create(createCheckStockDto: CreateCheckStockDto) {
    return this.checkstockRepository.save(createCheckStockDto);
  }

  async findAll(): Promise<CheckStock[]> {
    return await this.checkstockRepository.find();
  }

  async findOne(id: number): Promise<CheckStock> {
    const checkstock = await this.checkstockRepository.findOneBy({ id });
    if (!checkstock) {
      throw new NotFoundException(`checkstock with ID ${id} not found`);
    }
    return checkstock;
  }

  async update(id: number, updateCheckStockDto: UpdateCheckStockDto) {
    // อัปเดต CheckStock เอง (ถ้ามี)
    await this.checkstockRepository.update(id, {
      ...updateCheckStockDto,
      updated: new Date(),
    });
    // อัปเดตรายการ stockDetails ถ้าแนบมาใน DTO
    if (
      updateCheckStockDto.stockDetails &&
      Array.isArray(updateCheckStockDto.stockDetails)
    ) {
      for (const detailDto of updateCheckStockDto.stockDetails) {
        if (detailDto.id) {
          // มี id → อัปเดต record เดิม
          await this.stockDetailRepository.update(detailDto.id, {
            ...detailDto,
            updated: new Date(),
          });
        } else {
          // ไม่มี id → สร้างใหม่และผูกกับ checkstock นี้
          await this.stockDetailRepository.save({
            ...detailDto,
            checkstock: { id }, // FK ไปยัง checkstock
          });
        }
      }
    }
    return { message: `CheckStock #${id} updated successfully` };
  }

  async remove(id: number): Promise<void> {
    const checkstock = await this.checkstockRepository.findOneBy({ id });
    if (!checkstock) {
      throw new NotFoundException(`checkstock with ID ${id} not found`);
    }
    await this.checkstockRepository.remove(checkstock);
  }
}
