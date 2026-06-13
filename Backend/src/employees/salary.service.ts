import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { OnEvent } from '@nestjs/event-emitter';

import { Salary } from './entities/salary.entity';
import { Attendance } from '../employees/entities/attendance.entity';
import { Employee } from '../employees/entities/employee.entity';

import { UpdateSalaryDto } from './dto/update-salary.dto';
import { SalaryResponseDto, EmployeeInfoDto } from './dto/salary-response.dto';
import { CreateSalaryDto } from './dto/create-salary.dto';

const CronExpressionSafe = {
  EVERY_DAY_AT_MIDNIGHT: '0 0 * * *',
};

@Injectable()
export class SalaryService {
  constructor(
    @InjectRepository(Salary)
    private readonly salaryRepository: Repository<Salary>,

    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,

    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  // เพิ่ม Event Listener สำหรับ Checkout
  @OnEvent('attendance.checkout.completed')
  async handleCheckoutEvent(payload: { employeeId: number; workDate: Date }) {
    console.log('Received checkout event:', payload);
    try {
      const dto: CreateSalaryDto = {
        employee_id: payload.employeeId,
        salary_date: payload.workDate.toISOString().split('T')[0],
      };

      // ตรวจสอบว่าวันนี้มี salary อยู่แล้วหรือไม่
      const existingSalary = await this.salaryRepository.findOne({
        where: {
          employee_id: payload.employeeId,
          salary_date: payload.workDate,
        },
      });

      if (!existingSalary) {
        await this.processSalary(dto);
        console.log(
          `Salary processed for employee ${payload.employeeId} on ${dto.salary_date}`,
        );
      } else {
        console.log(
          `Salary already exists for employee ${payload.employeeId} on ${dto.salary_date}`,
        );
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error processing salary after checkout:', error.message);
      } else {
        console.error('Error processing salary after checkout:', error);
      }
    }
  }

  async findAll(): Promise<SalaryResponseDto[]> {
    const salaries = await this.salaryRepository.find({
      relations: ['employee', 'employee.branch'],
    });

    return salaries.map((salary) => ({
      id: salary.id,
      is_paid: salary.is_paid,
      wage: salary.wage,
      total_amount:
        salary.total_amount < 0.01
          ? 0
          : parseFloat(salary.total_amount.toFixed(2)),
      working_hours: Math.round(salary.working_hours),
      salary_date: salary.salary_date,
      employee: {
        employee_id: salary.employee.id,
        employee_name: `${salary.employee.name} ${salary.employee.surname}`,
        position: salary.employee.position,
        branch_name: salary.employee.branch
          ? salary.employee.branch.name
          : null,
      },
    }));
  }

  async findByUserId(userId: number): Promise<SalaryResponseDto[]> {
    const salaries = await this.salaryRepository.find({
      where: { employee: { user_id: userId } },
      relations: ['employee', 'employee.branch'],
    });

    return salaries.map((salary) => ({
      id: salary.id,
      is_paid: salary.is_paid,
      wage: salary.wage,
      total_amount:
        salary.total_amount < 0.01
          ? 0
          : parseFloat(salary.total_amount.toFixed(2)),
      working_hours: Math.round(salary.working_hours),
      salary_date: salary.salary_date,
      employee: {
        employee_id: salary.employee.id,
        employee_name: `${salary.employee.name} ${salary.employee.surname}`,
        position: salary.employee.position,
        branch_name: salary.employee.branch
          ? salary.employee.branch.name
          : null,
      },
    }));
  }

  async markAsPaid(
    id: number,
    updateDto: UpdateSalaryDto,
  ): Promise<SalaryResponseDto> {
    const salary = await this.salaryRepository.findOne({
      where: { id },
      relations: ['employee', 'employee.branch'],
    });

    if (!salary) {
      throw new NotFoundException('Salary not found');
    }

    if (typeof updateDto.is_paid === 'boolean') {
      if (salary.is_paid === true && updateDto.is_paid === true) {
        throw new Error('Salary is already marked as paid');
      }
      salary.is_paid = updateDto.is_paid;
    }

    const updatedSalary = await this.salaryRepository.save(salary);

    const employeeInfo: EmployeeInfoDto = updatedSalary.employee
      ? {
          employee_id: updatedSalary.employee.id,
          employee_name: `${updatedSalary.employee.name} ${updatedSalary.employee.surname}`,
          position: updatedSalary.employee.position,
          branch_name: updatedSalary.employee.branch
            ? updatedSalary.employee.branch.name
            : null,
        }
      : {
          employee_id: 0,
          employee_name: 'Unknown',
          position: 'Unknown',
          branch_name: null,
        };
    return {
      id: updatedSalary.id,
      is_paid: updatedSalary.is_paid,
      wage: updatedSalary.wage,
      total_amount:
        updatedSalary.total_amount < 0.01
          ? 0
          : parseFloat(updatedSalary.total_amount.toFixed(2)),
      working_hours: Math.round(updatedSalary.working_hours),
      salary_date: updatedSalary.salary_date,
      employee: employeeInfo,
    };
  }

  async processSalary(dto: CreateSalaryDto): Promise<SalaryResponseDto> {
    const { employee_id, salary_date } = dto;

    // Validate salary_date format
    const salaryDateObj = new Date(salary_date);
    if (isNaN(salaryDateObj.getTime())) {
      throw new Error('Invalid salary_date format');
    }

    const employeeEntity = await this.employeeRepository.findOne({
      where: { id: employee_id },
      relations: ['branch'],
    });

    if (!employeeEntity) {
      throw new NotFoundException('Employee not found');
    }

    // Determine hourly wage based on position
    let hourlyWage: number;
    if (employeeEntity.position === 'ผู้จัดการ') {
      hourlyWage = 150;
    } else {
      hourlyWage = 100;
    }

    // Format work_date to be date-only for comparison (no time component)
    const workDateString = salaryDateObj.toISOString().split('T')[0];
    const workDateFormatted = new Date(workDateString);

    // Fetch attendance records filtered by employee_id and salary_date
    const attendances = await this.attendanceRepository.find({
      where: {
        employee: { id: employee_id },
      },
      relations: ['employee'],
    });

    // Filter attendances by date (manual filter as TypeORM might have issues with date comparison)
    const matchingAttendances = attendances.filter((attendance) => {
      const attendanceDate = new Date(attendance.work_date);
      return attendanceDate.toISOString().split('T')[0] === workDateString;
    });

    console.log('Matching Attendances:', matchingAttendances);

    if (!matchingAttendances || matchingAttendances.length === 0) {
      throw new NotFoundException(
        `No attendance records found for employee ${employee_id} on ${workDateString}`,
      );
    }

    let totalWorkingHours = 0;

    matchingAttendances.forEach((attendance) => {
      if (attendance.check_in_time && attendance.check_out_time) {
        const [inHours, inMinutes, inSeconds] = attendance.check_in_time
          .split(':')
          .map(Number);
        const checkIn = new Date(workDateFormatted);
        checkIn.setHours(inHours, inMinutes, inSeconds || 0, 0);

        const [outHours, outMinutes, outSeconds] = attendance.check_out_time
          .split(':')
          .map(Number);
        const checkOut = new Date(workDateFormatted);
        checkOut.setHours(outHours, outMinutes, outSeconds || 0, 0);

        console.log('Check-in:', checkIn, 'Check-out:', checkOut);

        if (!isNaN(checkIn.getTime()) && !isNaN(checkOut.getTime())) {
          const hoursWorked =
            (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
          if (hoursWorked < 0) {
            console.warn(
              `Negative working hours for attendance id ${attendance.id}, skipping`,
            );
          } else {
            console.log('Hours worked:', hoursWorked);
            // Use latest hoursWorked instead of accumulating
            totalWorkingHours = hoursWorked;
          }
        } else {
          console.warn(
            `Invalid check-in or check-out time for attendance id ${attendance.id}`,
          );
        }
      } else {
        console.warn(
          `Missing check-in or check-out time for attendance id ${attendance.id}`,
        );
      }
    });

    const totalAmount = parseFloat((totalWorkingHours * hourlyWage).toFixed(2));

    if (isNaN(totalAmount) || totalAmount === null) {
      throw new Error('Invalid total amount calculated');
    }

    // Check if salary for this date already exists
    const existingSalary = await this.salaryRepository.findOne({
      where: {
        employee_id,
        salary_date: salaryDateObj,
      },
    });

    if (existingSalary) {
      // Update existing salary
      existingSalary.working_hours = totalWorkingHours;
      existingSalary.total_amount = totalAmount;
      await this.salaryRepository.save(existingSalary);

      return {
        id: existingSalary.id,
        is_paid: existingSalary.is_paid,
        wage: existingSalary.wage,
        total_amount: existingSalary.total_amount,
        working_hours: existingSalary.working_hours,
        salary_date: existingSalary.salary_date,
        employee: {
          employee_id: employeeEntity.id,
          employee_name: `${employeeEntity.name} ${employeeEntity.surname}`,
          position: employeeEntity.position,
          branch_name: employeeEntity.branch
            ? employeeEntity.branch.name
            : null,
        },
      };
    }

    // Create new salary
    const salary = this.salaryRepository.create({
      employee: employeeEntity,
      employee_id,
      working_hours: totalWorkingHours,
      wage: hourlyWage,
      total_amount: totalAmount,
      salary_date: salaryDateObj,
      is_paid: false,
    });

    await this.salaryRepository.save(salary);

    const employeeInfo: EmployeeInfoDto = salary.employee
      ? {
          employee_id: salary.employee.id,
          employee_name: `${employeeEntity.name} ${employeeEntity.surname}`,
          position: employeeEntity.position,
          branch_name: employeeEntity.branch
            ? employeeEntity.branch.name
            : null,
        }
      : {
          employee_id: 0,
          employee_name: 'Unknown',
          position: 'Unknown',
          branch_name: null,
        };
    return {
      id: salary.id,
      is_paid: salary.is_paid,
      wage: salary.wage,
      total_amount:
        salary.total_amount < 0.01
          ? 0
          : parseFloat(salary.total_amount.toFixed(2)),
      working_hours: Math.round(salary.working_hours),
      salary_date: salary.salary_date,
      employee: employeeInfo,
    };
  }

  @Cron(CronExpressionSafe.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    const employees = await this.employeeRepository.find();

    for (const employee of employees) {
      const salaryDate = new Date();
      salaryDate.setDate(salaryDate.getDate() - 1); // Process for previous day

      const dto: CreateSalaryDto = {
        employee_id: employee.id,
        salary_date: salaryDate.toISOString().split('T')[0],
      };

      try {
        await this.processSalary(dto);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(
            `Error processing salary for employee ${employee.id} on ${dto.salary_date}:`,
            error.message,
          );
        } else {
          console.error(
            `Error processing salary for employee ${employee.id} on ${dto.salary_date}:`,
            error,
          );
        }
        continue;
      }
    }
  }
}
