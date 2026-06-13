import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePromotionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  datetime: string;

  @IsIn(['PERCENT', 'FIXED'])
  type: 'PERCENT' | 'FIXED';

  @IsNumber()
  value: number;

  @IsNumber()
  @IsOptional()
  minSpend?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
