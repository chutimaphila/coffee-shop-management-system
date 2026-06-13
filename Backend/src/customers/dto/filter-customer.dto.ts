import { Type } from 'class-transformer';
import { IsOptional, IsString, IsIn, IsInt, Min, Max } from 'class-validator';

export class FilterCustomerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  surname?: string;

  @IsOptional()
  @IsIn(['male', 'female', 'others'])
  gender?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(10)
  @Max(120)
  age?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1; // Default page is 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 10; // Default limit is 10

  @IsOptional()
  @IsString()
  sortBy?: string = 'name'; // Default sorting by 'name'

  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'ASC'; // Default sorting order ASC
}
