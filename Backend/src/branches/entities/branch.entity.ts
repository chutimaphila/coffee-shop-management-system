import { Employee } from 'src/employees/entities/employee.entity';
import { Expense } from 'src/expense/entities/expense.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class Branch {
  @PrimaryGeneratedColumn()
  id: number; // รหัสสาขา

  @Column()
  name: string;

  @Column()
  district: string; // ที่อยู่

  @Column()
  contactNumber: string; // เบอร์ติดต่อ

  @Column({ default: true })
  status: boolean; // สถานะเปิดหรือปิด (True = เปิด, False = ปิด)

  @Column()
  latitude: string; // ละติจูด
  @Column()
  longitude: string; // ลองจิจูด
  @Column()
  radius: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Employee, (employee) => employee.branch)
  employees: Employee[];

  @OneToMany(() => User, (user) => user.branch)
  users: User[]; // 1 สาขา มีได้หลาย user

  // @OneToMany(() => Stock, (stock) => stock.branch)
  // stocks: Stock[];
  @OneToMany(() => Expense, (expense) => expense.branch) // เชื่อมกับ Expense
  expenses: Expense[]; // สาขานี้สามารถมีหลายรายการค่าใช้จ่าย
}
