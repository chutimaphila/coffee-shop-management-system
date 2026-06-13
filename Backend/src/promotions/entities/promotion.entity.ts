import { Order } from 'src/orders/entities/order.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

export type PromotionType = 'PERCENT' | 'FIXED';

@Entity()
export class Promotion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  datetime: string;

  @Column({ type: 'varchar', nullable: true })
  type: PromotionType; // 'PERCENT' | 'FIXED'

  @Column({ type: 'float', nullable: true })
  value: number; // เช่น 10 = 10% หรือ 100 = 100 บาท ขึ้นอยู่กับ type

  @Column({ type: 'float', default: 0, nullable: true })
  minSpend: number; // ยอดขั้นต่ำที่ต้องซื้อก่อนใช้โปรโมชันได้

  @OneToMany(() => Order, (order) => order.promotion) // เพิ่มการเชื่อมโยงย้อนกลับ
  orders: Order[]; // เพิ่มการเชื่อมโยงระหว่าง Promotion และ Order
}
