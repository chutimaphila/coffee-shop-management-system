import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Expense } from './expense/entities/expense.entity';
import { ExpenseController } from './expense/expense.controller';
import { BranchesModule } from './branches/branches.module';
import { ProductsModule } from './products/products.module';
import { User } from './users/entities/user.entity';
import { UsersController } from './users/users.controller';
import { Customer } from './customers/entities/customer.entity';
import { CustomersController } from './customers/customers.controller';
import { Product } from './products/entities/product.entity';
import { ProductsController } from './products/products.controller';
import { RolesModule } from './roles/roles.module';
import { Role } from './roles/entities/role.entity';
import { RolesController } from './roles/roles.controller';
import { UsersModule } from './users/users.module';
import { EmployeesModule } from './employees/employees.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { EmployeesController } from './employees/employees.controller';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoriesModule } from './categories/categories.module';
import { Categories } from './categories/entities/category.entity';
import { CategoriesController } from './categories/categories.controller';
import { Employee } from './employees/entities/employee.entity';
import { Salary } from './employees/entities/salary.entity';
import { Attendance } from './employees/entities/attendance.entity';
import { SalaryModule } from './employees/salary.module';
import { CustomersModule } from './customers/customers.module';
import { ExpenseModule } from './expense/expense.module';
import { BranchesController } from './branches/branches.controller';
import { Branch } from './branches/entities/branch.entity';
import { DataSource } from 'typeorm';
import { OrderItem } from './orders/entities/order-item.entity';
import { Order } from './orders/entities/order.entity';
import { OrdersModule } from './orders/orders.module';
import { OrdersController } from './orders/orders.controller';
import { Promotion } from './promotions/entities/promotion.entity';
import { PromotionsModule } from './promotions/promotions.module';
import { PromotionsController } from './promotions/promotions.controller';
import { AttendanceModule } from './employees/attendance.module';
import { AttendanceController } from './employees/attendance.controller';
import { StockDetailModule } from './stock-detail/stock-detail.module';
import { CheckStockModule } from './check-stock/check-stock.module';
import { StockDetail } from './stock-detail/entities/stock-detail.entity';
import { CheckStock } from './check-stock/entities/check-stock.entity';
import { Material } from './material/entities/material.entity';
import { MaterialsModule } from './material/material.module';
import { StockDetailController } from './stock-detail/stock-detail.controller';
import { MaterialsController } from './material/material.controller';
import { CheckStockController } from './check-stock/check-stock.controller';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads/users'),
      serveRoot: '/user-images',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads/products'),
      serveRoot: '/product-images',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads/customers'),
      serveRoot: '/customer-images',
    }),

    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [
        User,
        Customer,
        Expense,
        Product,
        Categories,
        Order,
        OrderItem,
        Role,
        Employee,
        Salary,
        Branch,
        Promotion,
        Attendance,
        StockDetail,
        CheckStock,
        Material,
      ],
      synchronize: false,
    }),
    TypeOrmModule.forFeature([
      User,
      Customer,
      Expense,
      Product,
      Categories,
      Order,
      OrderItem,
      Role,
      Employee,
      Salary,
      Promotion,
      Attendance,
      StockDetail,
      CheckStock,
      Material,
    ]),
    BranchesModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    RolesModule,
    UsersModule,
    EmployeesModule,
    // SalaryModule,
    CustomersModule,
    ExpenseModule,
    BranchesModule,
    PromotionsModule,
    AttendanceModule,
    SalaryModule,
    StockDetailModule,
    StockDetailModule,
    MaterialsModule,
    CheckStockModule,
  ],
  controllers: [
    AppController,
    UsersController,
    ProductsController,
    RolesController,
    EmployeesController,
    CategoriesController,
    CustomersController,
    ExpenseController,
    BranchesController,
    OrdersController,
    PromotionsController,
    AttendanceController,
    StockDetailController,
    MaterialsController,
    CheckStockController,
  ],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
