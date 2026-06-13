import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Material } from 'src/material/entities/material.entity';
import { CheckStock } from 'src/check-stock/entities/check-stock.entity';

@Entity('stock_detail')
export class StockDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column({ name: 'qt_previous' })
  qtPrevious: number;

  @Column()
  quantity: number;

  @Column()
  min: number;

  @Column()
  use: number;

  @Column()
  status: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @ManyToOne(() => CheckStock, (checkStock) => checkStock.stockDetails)
  checkstock: CheckStock;

  @ManyToOne(() => Material, (material) => material.stockDetails)
  material: Material;
}
