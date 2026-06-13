import { Branch } from 'src/branches/entities/branch.entity';
import { CheckStock } from 'src/check-stock/entities/check-stock.entity';
import { Employee } from 'src/employees/entities/employee.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Role } from 'src/roles/entities/role.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  surname: string;
  @Column()
  age: number;
  @Column()
  email: string;
  @Column()
  password: string;

  @Column({ default: '/user-images/unknown.png' })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  role: Role;

  @Column()
  gender: 'male' | 'female';

  @ManyToOne(() => Branch, (branch) => branch.users)
  @JoinColumn({ name: 'branchId' })
  branch: Branch; // ความสัมพันธ์กับ Branch

  @Column({ nullable: true })
  branchId: number;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Employee, (employee) => employee.user)
  employees: Employee[];

  @OneToMany(() => CheckStock, (checkstock) => checkstock.user)
  checkstock: CheckStock[];
}
