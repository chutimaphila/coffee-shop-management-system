import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { User } from 'src/users/entities/user.entity';
import { CustomersModule } from 'src/customers/customers.module';
import { UsersModule } from 'src/users/users.module';
import { Branch } from 'src/branches/entities/branch.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Product,
      User,
      Customer,
      Branch,
    ]),
    UsersModule, // นำเข้าหมายเลข UserModule
    CustomersModule, // นำเข้าหมายเลข CustomerModule
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
