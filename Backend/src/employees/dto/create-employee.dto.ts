import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsString,
  IsBoolean,
  IsNumber,
  IsNotEmpty,
  Min,
  Max,
  IsIn,
} from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({
    description: 'ชื่อ',
    example: 'กขค',
  })
  @IsNotEmpty()
  name: string;
  @ApiProperty({
    description: 'นามสกุล',
    example: 'กขค',
  })
  @IsNotEmpty()
  surname: string;

  @ApiProperty({
    description: 'กรอกอายุระหว่าง 10-120 ปี',
    example: 20,
    minimum: 10,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  @Max(120)
  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  age: number;

  @ApiProperty({
    description: 'เพศ',
    enum: ['ชาย', 'หญิง', 'อื่นๆ'],
  })
  @IsNotEmpty()
  @IsIn(['ชาย', 'หญิง', 'อื่นๆ'])
  gender: 'ชาย' | 'หญิง' | 'อื่นๆ';

  @ApiProperty({
    description: 'กรอกเบอร์โทรศัพท์',
    example: '0801234567',
  })
  @IsString()
  phone_number: string;

  @ApiProperty({
    description: 'กรอกไอดีผู้ใช้',
    example: 1,
  })
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @IsNumber()
  user_id: number;

  @ApiProperty({
    description: 'กรอกไอดีสาขา',
    example: 1,
  })
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @IsNumber()
  branch_id: number;

  @ApiProperty({
    description: 'ตำแหน่ง',
    example: 'ผู้จัดการ',
    enum: [
      'ผู้จัดการ',
      'พนักงานชงกาแฟ',
      'แคชเชียร์',
      'พนักงานครัว',
      'พนักงานเสิร์ฟ',
    ],
  })
  @IsNotEmpty()
  @IsString()
  @IsIn([
    'ผู้จัดการ',
    'พนักงานชงกาแฟ',
    'แคชเชียร์',
    'พนักงานครัว',
    'พนักงานเสิร์ฟ',
  ])
  position:
    | 'ผู้จัดการ'
    | 'พนักงานชงกาแฟ'
    | 'แคชเชียร์'
    | 'พนักงานครัว'
    | 'พนักงานเสิร์ฟ';

  @ApiProperty({
    description: 'ประเภทการจ้างงาน',
    enum: ['รายวัน', 'รายเดือน'],
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['รายวัน', 'รายเดือน'])
  employment_type: 'รายวัน' | 'รายเดือน';

  @ApiProperty({
    description: 'สถานะการทำงาน',
    example: true,
  })
  @Transform(({ value }) => Boolean(value))
  @IsNotEmpty()
  @IsBoolean()
  is_active: boolean;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'อัพโหลดไฟล์รูปภาพ',
  })
  file?: any;
  imageUrl?: string;
}
