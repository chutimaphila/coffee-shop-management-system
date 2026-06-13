import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { User } from 'src/users/entities/user.entity';
import { Promotion } from 'src/promotions/entities/promotion.entity';
import { Branch } from 'src/branches/entities/branch.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number; // รหัสออเดอร์

  @Column('float')
  total: number; // ยอดรวมก่อนส่วนลด

  @Column({ type: 'float', nullable: true })
  receivedAmount: number; // เงินที่ลูกค้าจ่ายมาภ

  @Column({ type: 'float', nullable: true })
  changeAmount: number; // เงินทอนที่คืนให้ลูกค้า

  @Column({ type: 'float', nullable: true, default: 0 })
  discountAmount: number; // ส่วนลดที่ใช้

  @Column('float')
  totalAfterDiscount: number; // ยอดรวมหลังส่วนลด

  @Column({ type: 'int', default: 0 })
  usedPoints: number; // แต้มที่ใช้ในการแลกส่วนลด

  @Column({ type: 'int', default: 0 })
  earnedPoints: number; // แต้มที่ลูกค้าได้รับจากการซื้อ

  @Column({ default: 'cash' })
  paymentMethod: string; // วิธีการชำระเงิน

  @Column({ default: 'completed' })
  status: string; // สถานะของออเดอร์

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[]; // รายการสินค้าภายในออเดอร์

  @ManyToOne(() => User, { eager: true, nullable: true })
  user: User; // ผู้ที่สร้างออเดอร์

  @ManyToOne(() => Customer, { nullable: true, eager: true })
  @JoinColumn()
  customer: Customer | null;

  @ManyToOne(() => Promotion, { nullable: true, eager: true })
  @JoinColumn()
  promotion: Promotion | null;

  @ManyToOne(() => Branch, { eager: true, nullable: false })
  @JoinColumn()
  branch: Branch;

  @CreateDateColumn()
  createdAt: Date; // วันที่สร้างออเดอร์

  @UpdateDateColumn()
  updatedAt: Date; // วันที่อัปเดตออเดอร์
}
