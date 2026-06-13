import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  Length,
  Max,
  Min,
  Matches,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  id: number;

  @ApiProperty({
    description: 'Input your name',
    example: 'Jordy',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Input your surname',
    example: 'Kayeejai',
  })
  @IsNotEmpty()
  surname: string;

  @ApiProperty({
    description: 'Age between 10-120 years',
    example: 25,
    minimum: 10,
    maximum: 120,
  })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(10)
  @Max(120)
  age: number;

  @ApiProperty({
    description: 'Email for login',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      'Password for login >= 8 letters, with at least one number, one uppercase, and one special character',
    example: '@Pass1234',
    minLength: 8,
  })
  @IsNotEmpty()
  @Length(8)
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message:
      'Password must contain at least one uppercase letter, one number, and one special character',
  })
  password: string;

  @ApiProperty({
    description: 'The gender of the user, can be either male or female',
    enum: ['male', 'female'],
  })
  @IsNotEmpty()
  @IsIn(['male', 'female'])
  gender: 'male' | 'female';

  @ApiProperty({
    description: 'id ของ role',
    example: 1,
    type: Number,
  })
  @Transform(({ value }) => Number(value))
  @IsInt()
  roleId: number;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Image-users',
    required: false,
  })
  @IsOptional()
  file?: string;

  @ApiProperty({
    description: 'id ของ branch ที่ผู้ใช้อยู่',
    example: 1,
    type: Number,
  })
  @Transform(({ value }) => Number(value))
  @IsInt()
  branchId: number;
}
