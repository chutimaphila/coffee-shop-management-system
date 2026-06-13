import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { validate } from 'class-validator';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customersRepository: Repository<Customer>,
  ) {}

  async create(
    createCustomerDto: CreateCustomerDto & { imageUrl: string },
  ): Promise<Customer> {
    // ตรวจสอบความถูกต้องของ DTO
    const errors = await validate(createCustomerDto);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.toString()}`);
    }

    // สร้าง entity ใหม่จาก DTO
    const newCustomer = this.customersRepository.create({
      ...createCustomerDto,
      point: createCustomerDto.point ?? 0,
    });
    // บันทึกลง database
    return await this.customersRepository.save(newCustomer);
  }

  async findAll(): Promise<Customer[]> {
    return await this.customersRepository.find({});
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customersRepository.findOne({
      where: { id },
    });

    if (!customer) {
      throw new Error(`Customer with id ${id} not found`);
    }

    return customer;
  }

  async update(
    id: number,
    updateCustomerDto: UpdateCustomerDto & { imageUrl?: string },
  ): Promise<Customer> {
    await this.customersRepository.update(id, updateCustomerDto);
    const updatedCustomer = await this.customersRepository.findOneByOrFail({
      id,
    });
    return updatedCustomer;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<Customer[]> {
    return this.customersRepository.find({
      where: {
        phoneNumber: Like(`%${phoneNumber}%`),
      },
    });
  }

  async remove(id: number): Promise<void> {
    const customer = await this.customersRepository.findOneBy({ id });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    await this.customersRepository.softRemove(customer);
  }

  async addPoints(id: number, points: number): Promise<Customer> {
    if (points <= 0) {
      throw new BadRequestException('Points must be greater than 0');
    }

    // ใช้ findOne โดยระบุ where เพื่อค้นหาตาม id
    const customer = await this.customersRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    customer.point += points; // เพิ่มแต้มให้กับลูกค้า
    return await this.customersRepository.save(customer); // บันทึกการเปลี่ยนแปลง
  }

  async subtractPoints(id: number, points: number): Promise<Customer> {
    if (points <= 0) {
      throw new BadRequestException('Points must be greater than 0');
    }

    const customer = await this.customersRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    if (customer.point < points) {
      throw new BadRequestException('Not enough points to subtract');
    }

    customer.point -= points; // ลดแต้มให้กับลูกค้า
    return await this.customersRepository.save(customer); // บันทึกการเปลี่ยนแปลง
  }
}
