import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { Material } from './entities/material.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(Material)
    private MaterialsRepository: Repository<Material>,
  ) {}

  create(createMaterialDto: CreateMaterialDto) {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-GB');
    const material = new Material();
    material.name = createMaterialDto.name;
    material.in_date = formattedDate;
    material.price = createMaterialDto.price;
    material.qt_previous = createMaterialDto.qt_previous;
    material.quantity = createMaterialDto.quantity;
    material.min = createMaterialDto.min;
    material.use = material.quantity - material.qt_previous;
    if (material.quantity < material.min) {
      createMaterialDto.status = 'Low';
    } else {
      createMaterialDto.status = 'Available';
    }
    material.status = createMaterialDto.status;

    // if (createMaterialDto.image && createMaterialDto.image !== '') {
    //   material.image = createMaterialDto.image;
    // }

    return this.MaterialsRepository.save(material);
  }

  findAllByStatus(Status: string) {
    return this.MaterialsRepository.find({
      where: { status: Status }, // find by type
      order: { status: 'ASC' },
    });
  }

  findAll() {
    return this.MaterialsRepository.find();
  }

  async findOne(id: number): Promise<Material> {
    const material = await this.MaterialsRepository.findOneBy({ id });
    if (!material) {
      throw new NotFoundException(`material with ID ${id} not found`);
    }
    return material;
  }

  // async update(id: number, updateMaterialDto: UpdateMaterialDto) {
  //   const material = await this.MaterialsRepository.findOneOrFail({
  //     where: { id },
  //   });
  //   material.name = updateMaterialDto.name;
  //   material.in_date = updateMaterialDto.in_date;
  //   material.price = updateMaterialDto.price;
  //   material.quantity = updateMaterialDto.quantity;
  //   material.min = updateMaterialDto.min;
  //   material.use = material.quantity - material.qt_previous;
  //   if (material.quantity < material.min) {
  //     updateMaterialDto.status = 'Low';
  //     material.status = updateMaterialDto.status;
  //   } else {
  //     updateMaterialDto.status = 'Available';
  //     material.status = updateMaterialDto.status;
  //   }

  //   await this.MaterialsRepository.save(material);
  //   const updateMaterial = await this.MaterialsRepository.findOneOrFail({
  //     where: { id },
  //   });
  //   updateMaterial.name = material.name;
  //   updateMaterial.price = material.price;
  //   updateMaterial.quantity = material.quantity;
  //   updateMaterial.min = material.min;
  //   if (updateMaterial.quantity < updateMaterial.min) {
  //     material.status = 'Low';
  //     updateMaterial.status = material.status;
  //   } else {
  //     material.status = 'Available';
  //     updateMaterial.status = material.status;
  //   }
  //   await this.MaterialsRepository.save(updateMaterial);
  //   const result = await this.MaterialsRepository.findOne({
  //     where: { id },
  //   });
  //   return result;
  // }
  async update(id: number, updateMaterialDto: UpdateMaterialDto) {
    const material = await this.MaterialsRepository.findOneOrFail({
      where: { id },
    });

    if (updateMaterialDto.name !== undefined) {
      material.name = updateMaterialDto.name;
    }

    if (updateMaterialDto.in_date !== undefined) {
      material.in_date = updateMaterialDto.in_date;
    }

    if (updateMaterialDto.price !== undefined) {
      material.price = updateMaterialDto.price;
    }

    if (updateMaterialDto.quantity !== undefined) {
      material.quantity = updateMaterialDto.quantity;
    }

    if (updateMaterialDto.min !== undefined) {
      material.min = updateMaterialDto.min;
    }

    // อัปเดตค่า use
    if (updateMaterialDto.quantity !== undefined) {
      material.use = updateMaterialDto.quantity - (material.qt_previous ?? 0);
    }

    // เช็กสถานะ
    if (material.quantity < material.min) {
      material.status = 'Low';
    } else {
      material.status = 'Available';
    }

    await this.MaterialsRepository.save(material);

    return this.MaterialsRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    const deleteMaterial = await this.MaterialsRepository.findOneOrFail({
      where: { id },
    });
    await this.MaterialsRepository.remove(deleteMaterial);
    return deleteMaterial;
  }
}
