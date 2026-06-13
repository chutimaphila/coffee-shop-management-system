import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Branch } from 'src/branches/entities/branch.entity';
import { Employee } from './entities/employee.entity';
import { Attendance } from './entities/attendance.entity';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, User, Branch, Attendance])],
  controllers: [EmployeesController, AttendanceController],
  providers: [EmployeesService, AttendanceService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
