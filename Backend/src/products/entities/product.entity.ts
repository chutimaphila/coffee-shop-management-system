import { ApiProperty } from '@nestjs/swagger';
import { Categories } from 'src/categories/entities/category.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @ApiProperty({
    description: 'Name of the product',
    example: 'Latte',
  })
  name: string;

  @Column('float')
  @ApiProperty({
    description: 'Price of the product',
    example: 120.5,
    minimum: 0,
  })
  price: number;

  @Column({ default: '/product-images/Product-Default.jpg' })
  imageUrl: string;

  @ManyToOne(() => Categories, (category) => category.products, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'categoryId' }) // Optional: ชื่อคอลัมน์ในตาราง
  @ApiProperty({
    description: 'Category of the product',
    type: () => Categories,
    nullable: true,
  })
  category: Categories;
  ///////////////////////////////////
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
