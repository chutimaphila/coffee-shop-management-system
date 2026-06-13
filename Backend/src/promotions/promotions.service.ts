import { Injectable } from '@nestjs/common';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { Promotion } from './entities/promotion.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
  ) {}

  // ฟังก์ชันสร้างโปรโมชั่น
  create(createPromotionDto: CreatePromotionDto) {
    const promotion = this.promotionRepository.create(createPromotionDto);
    return this.promotionRepository.save(promotion);
  }

  // ฟังก์ชันค้นหาทุกโปรโมชั่น
  findAll() {
    return this.promotionRepository.find();
  }

  // ฟังก์ชันค้นหากระตุ้นตามประเภท (สามารถปรับตามที่ต้องการ)
  findByType(type: 'PERCENT' | 'FIXED') {
    return this.promotionRepository.find({
      where: {
        type: type,
      },
    });
  }

  findOne(id: number) {
    return this.promotionRepository.findOneBy({ id });
  }

  async update(id: number, updatePromotionDto: UpdatePromotionDto) {
    await this.promotionRepository.update(id, updatePromotionDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const promotion = await this.findOne(id);
    if (!promotion) {
      throw new Error(`Promotion with ID ${id} not found`);
    }
    return this.promotionRepository.remove(promotion);
  }
}
