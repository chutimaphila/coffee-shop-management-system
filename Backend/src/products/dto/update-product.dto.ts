// update-product.dto.ts
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Iced Latte' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  categoryId?: number; // สำหรับอัปเดตหมวดหมู่

  @IsOptional()
  @ApiPropertyOptional({
    description: 'รูปสินต้าใหม่',
    type: 'string',
    format: 'binary',
  })
  file?: any;

  @IsOptional()
  @ApiPropertyOptional({ example: '/product-images/filename.jpg' })
  imageUrl?: string;
}
