import { IsNumber, IsOptional } from 'class-validator';

export class CheckOutDto {
  @IsNumber()
  employee_id: number;

  @IsOptional()
  @IsNumber()
  attendance_id?: number;
}
