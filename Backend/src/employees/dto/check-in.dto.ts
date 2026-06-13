import { IsNumber } from 'class-validator';

export class CheckInDto {
  @IsNumber()
  employee_id: number; // latitude?: number;
  // longitude?: number;
}
