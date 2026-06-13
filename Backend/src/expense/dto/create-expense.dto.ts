import { IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  name: string;

  @IsNumber() // ใช้ @IsNumber สำหรับ branchId
  branchId: number;

  @IsDateString()
  datetime: string;

  @IsNumber()
  amount: number;

  @IsString()
  type: string;
}
