import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { StockDetail } from 'src/stock-detail/entities/stock-detail.entity';

@Entity()
export class CheckStock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: string;

  @Column()
  totalPrice: number;

  @Column()
  totalQty: number;

  @Column()
  totalUse: number;

  @Column()
  userName: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @OneToMany(() => StockDetail, (stockDetail) => stockDetail.checkstock)
  stockDetails: StockDetail[];

  @ManyToOne(() => User, (user) => user.checkstock)
  user: User;
}
