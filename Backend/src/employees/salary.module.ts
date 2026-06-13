import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Salary } from './entities/salary.entity';
import { Employee } from '../employees/entities/employee.entity';
import { Attendance } from '../employees/entities/attendance.entity';
import { SalaryService } from './salary.service';
import { SalaryController } from './salary.controller';
import { SalaryEvents } from './salary.events';
import { AttendanceCheckoutAdapter } from './attendance-checkout.adapter';

@Module({
  imports: [
    TypeOrmModule.forFeature([Salary, Attendance, Employee]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [SalaryController],
  providers: [SalaryService, SalaryEvents, AttendanceCheckoutAdapter],
  exports: [SalaryEvents], // ส่งออก SalaryEvents เพื่อให้ module อื่นใช้งานได้
})
export class SalaryModule {}
