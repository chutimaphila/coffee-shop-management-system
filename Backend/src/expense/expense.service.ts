import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Expense } from './entities/expense.entity';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}

  create(createExpenseDto: any) {
    const expense = this.expenseRepository.create(createExpenseDto);
    return this.expenseRepository.save(expense);
  }

  async findAll(): Promise<any[]> {
    const expenses = await this.expenseRepository.find();
    return expenses.map((expense) => ({
      ...expense,
      datetime: new Date(expense.datetime).toISOString().slice(0, 16),
    }));
  }

  findOne(id: number) {
    return this.expenseRepository.findOneBy({ id });
  }

  async update(id: number, updateExpenseDto: any) {
    await this.expenseRepository.update(id, updateExpenseDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const expense = await this.findOne(id);
    if (!expense) {
      throw new Error(`Expense with ID ${id} not found`);
    }
    return this.expenseRepository.remove(expense);
  }
}
