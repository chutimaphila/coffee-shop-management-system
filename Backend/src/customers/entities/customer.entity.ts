import { Order } from 'src/orders/entities/order.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  surname: string;

  @Column()
  phoneNumber: string;

  @Column({ type: 'date' })
  birthDate: Date;

  @Column({ type: 'text' }) // 👈 เปลี่ยนจาก enum เป็น text
  gender: 'male' | 'female' | 'others'; // ยังสามารถใช้ union type ใน TypeScript ได้

  @Column()
  age: number;

  @Column({ type: 'int', default: 0 })
  point: number;

  @Column({ default: '/customer-images/unknown.png' })
  imageUrl: string;

  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
