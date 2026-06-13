import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @ApiProperty({ example: 'Iced Latte' })
  name: string;

  @IsNumber()
  @ApiProperty({ example: 120 })
  price: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  categoryId: number;

  // ใช้สำหรับอัปโหลดไฟล์ใน Swagger UI
  @ApiPropertyOptional({
    description: 'Product image file',
    type: 'string',
    format: 'binary',
  })
  file?: any;
  // ตัวนี้ใช้ภายในแอป ไม่ต้องโชว์ใน Swagger
  imageUrl?: string;
}
