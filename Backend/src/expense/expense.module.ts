import { Module } from '@nestjs/common';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from './entities/expense.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Expense])], // Register the Expense entity with TypeORM
  providers: [ExpenseService], // Ensure that ExpenseService is in providers
  controllers: [ExpenseController], // Controller uses ExpenseService
  exports: [ExpenseService], // Optionally export ExpenseService if needed elsewhere
})
export class ExpenseModule {}
