import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  BeforeUpdate,
  BeforeInsert,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from 'src/products/entities/product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number; // รหัสรายการสินค้าในออเดอร์

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order; // เชื่อมโยงกับออเดอร์ที่รายการสินค้านี้อยู่

  @ManyToOne(() => Product, { eager: true })
  product: Product; // เชื่อมโยงกับสินค้าในออเดอร์

  @Column()
  quantity: number; // จำนวนสินค้าที่สั่ง

  @Column('float')
  price: number; // ราคาต่อหน่วยของสินค้า

  @Column('float')
  total: number; // ราคาทั้งหมด (จำนวน * ราคา)

  @BeforeInsert()
  @BeforeUpdate()
  calculateTotal() {
    this.total = this.quantity * this.price;
  }
}
