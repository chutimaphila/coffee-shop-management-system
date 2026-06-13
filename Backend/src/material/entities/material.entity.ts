import { StockDetail } from 'src/stock-detail/entities/stock-detail.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Material {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  in_date: string;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column()
  qt_previous: number;

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

  @OneToMany(() => StockDetail, (stockDetail) => stockDetail.material)
  stockDetails: StockDetail[];
}
