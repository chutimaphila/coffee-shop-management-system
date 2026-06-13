import { IsInt, IsDateString } from 'class-validator';

export class CreateSalaryDto {
  @IsInt()
  employee_id: number;

  @IsDateString()
  salary_date: string; // ใช้เป็น string ที่เป็นรูปแบบ ISO เช่น "2025-04-30"
}
