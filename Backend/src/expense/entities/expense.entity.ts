import { Branch } from 'src/branches/entities/branch.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  branchId: number;

  @Column('datetime')
  datetime: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  type: string;

  @ManyToOne(() => Branch, (branch) => branch.expenses) // เชื่อมกับ Branch
  @JoinColumn({ name: 'branchId' }) // ชื่อของคอลัมน์ที่เชื่อมกับ branch
  branch: Branch; // รายการค่าใช้จ่ายนี้จะเชื่อมโยงกับหนึ่งสาขา
}
