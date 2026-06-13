import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;
}

export class CreateOrderDto {
  @Min(0)
  @IsNumber()
  total: number;

  @IsString()
  paymentMethod: string;

  @IsNumber()
  totalAfterDiscount: number; // ยอดรวมหลังส่วนลด

  @IsNumber()
  @Min(0)
  receivedAmount: number;

  @IsNumber()
  @Min(0)
  changeAmount: number;

  @IsNumber()
  @Min(0)
  discountAmount: number; // ส่วนลดทั้งหมดที่หักจาก total

  @IsNumber()
  usedPoints: number; // แต้มที่ใช้ในการแลกส่วนลด

  @IsNumber()
  earnedPoints: number; // แต้มที่ได้รับจากการซื้อ

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsNumber()
  userId: number; // เพิ่ม userId เพื่อระบุผู้ที่สร้างออเดอร์

  @IsOptional()
  @IsInt()
  customerId: number | null; // ให้เป็น null ได้

  @IsOptional()
  @IsInt()
  promotionId: number | null; // ไอดีของโปรโมชัน (สามารถเป็น null ได้)

  @IsInt()
  branchId: number;
}
