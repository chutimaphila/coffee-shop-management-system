import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsDate,
  IsInt,
  Min,
  Max,
  IsIn,
  IsOptional,
} from 'class-validator';

export class CreateCustomerDto {
  id: number;

  @ApiProperty({ description: 'Input your name', example: 'John' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Input your surname', example: 'Smith' })
  @IsNotEmpty()
  @IsString()
  surname: string;

  @ApiProperty({
    description: 'Phone number in international format',
    example: '0912345678', // เปลี่ยนให้เป็นเบอร์แบบ international ตาม @IsPhoneNumber('TH')
  })
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    description: 'Birth date in ISO format',
    example: '1995-07-20',
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  birthDate: Date;

  @ApiProperty({
    description: 'Gender of the customer',
    enum: ['male', 'female', 'others'],
    example: 'male',
  })
  @IsIn(['male', 'female', 'others'])
  gender: 'male' | 'female' | 'others';

  @ApiProperty({
    description: 'Age between 10-120 years',
    example: 25,
    minimum: 10,
    maximum: 120,
  })
  @IsInt()
  @Min(10)
  @Max(120)
  age: number;

  @ApiProperty({
    description: 'Number of points to add',
    example: 10,
    required: true,
  })
  @IsInt()
  @Min(1)
  point: number;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Image-customers',
    required: false,
  })
  @IsOptional()
  file?: string;
}
