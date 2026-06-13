import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsNotEmpty,
  IsString,
  IsIn,
  Matches,
  IsNumber,
} from 'class-validator';

export class CreateAttendanceDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  employee_id: number;

  @ApiProperty()
  @Transform(({ value }) => {
    const date = value ? new Date(value) : new Date();
    date.setHours(0, 0, 0, 0); // ล้างเวลาให้เหลือแต่วันที่
    return date;
  })
  @IsNotEmpty()
  work_date: Date;

  @ApiProperty({
    description: 'เวลาเข้างาน (เช่น 08:30:00)',
    required: false,
  })
  @IsOptional()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'check_in_time ต้องอยู่ในรูปแบบ HH:mm:ss',
  })
  check_in_time?: string;

  @ApiProperty({
    description: 'เวลาออกงาน (เช่น 17:00:00)',
    required: false,
  })
  @IsOptional()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'check_out_time ต้องอยู่ในรูปแบบ HH:mm:ss',
  })
  check_out_time?: string;

  @ApiProperty({
    enum: ['มา', 'ขาด', 'ลา', 'มาสาย'],
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['มา', 'ขาด', 'ลา', 'มาสาย'])
  status: 'มา' | 'ขาด' | 'ลา' | 'มาสาย';

  @ApiProperty()
  name: string;

  @ApiProperty()
  surname: string;

  @ApiProperty()
  branch_id: number;
}
