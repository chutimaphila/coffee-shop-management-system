import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { AttendanceController } from './attendance.controller';
import { Attendance } from './entities/attendance.entity';
import { AttendanceService } from './attendance.service';
import { AttendanceCheckoutAdapter } from './attendance-checkout.adapter';
import { SalaryModule } from './salary.module'; // เพิ่มการอิมพอร์ต SalaryModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance, Employee]),
    SalaryModule, // เพิ่ม SalaryModule เพื่อให้เข้าถึง SalaryEvents
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceCheckoutAdapter],
  exports: [AttendanceService],
})
export class AttendanceModule {}
