import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSalaryDto {
  @IsOptional()
  @IsBoolean()
  is_paid?: boolean;
}
