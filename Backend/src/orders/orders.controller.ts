import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiBody } from '@nestjs/swagger';
import { CreatePopularProductSale } from './dto/create-popular-product.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiBody({
    description: 'Create a new order',
    type: CreateOrderDto,
  })
  async create(@Body() dto: CreateOrderDto) {
    try {
      return await this.ordersService.create(dto);
    } catch (error) {
      throw new HttpException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        error?.message || 'Failed to create order',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        error?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    try {
      return await this.ordersService.findOne(id);
    } catch (error) {
      throw new HttpException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        error.message || `Order with ID ${id} not found`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        error.status || HttpStatus.NOT_FOUND,
      );
    }
  }
  @Post('/popular')
  async popularProduct(@Body() dto: CreatePopularProductSale) {
    try {
      const today = new Date().toISOString().split('T')[0];
      return await this.ordersService.getBestSellingProducts(
        dto.roleId,
        dto.userId,
        dto.branchId,
        today,
      );
    } catch (error) {
      throw new HttpException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        error?.message || 'Failed to create order',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        error?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
