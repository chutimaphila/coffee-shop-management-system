import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ModuleRef } from '@nestjs/core';
import { Repository, IsNull } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { Attendance } from './entities/attendance.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { AttendanceCheckoutAdapter } from './attendance-checkout.adapter';
import * as moment from 'moment';

@Injectable()
export class AttendanceService implements OnModuleInit {
  private attendanceCheckoutAdapter: AttendanceCheckoutAdapter;

  constructor(
    @InjectRepository(Attendance)
    private readonly attRepository: Repository<Attendance>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly moduleRef: ModuleRef,
  ) {}

  onModuleInit() {
    try {
      this.attendanceCheckoutAdapter = this.moduleRef.get(
        AttendanceCheckoutAdapter,
        { strict: false },
      );
    } catch {
      console.warn(
        'AttendanceCheckoutAdapter not available, salary processing after checkout will not work',
      );
    }
  }

  async create(dto: CreateAttendanceDto): Promise<Attendance> {
    const { employee_id, ...rest } = dto;
    const employee = await this.employeeRepository.findOne({
      where: { id: employee_id },
      relations: ['branch'],
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employee_id} not found`);
    }
    const att = this.attRepository.create({
      ...rest,
      employee,
      branch: employee.branch,
    });

    return await this.attRepository.save(att);
  }

  async findAll(): Promise<Attendance[]> {
    return await this.attRepository.find({
      relations: ['employee', 'employee.branch'],
      order: { work_date: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Attendance> {
    const attendance = await this.attRepository.findOne({
      where: { id },
      relations: ['employee', 'employee.branch'],
    });
    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }
    return attendance;
  }

  async update(id: number, dto: UpdateAttendanceDto): Promise<Attendance> {
    const attendance = await this.attRepository.findOne({
      where: { id },
      relations: ['employee'],
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }

    const { employee_id, ...rest } = dto;
    if (employee_id !== undefined) {
      const employee = await this.employeeRepository.findOne({
        where: { id: employee_id },
        relations: ['branch'],
      });

      if (!employee) {
        throw new NotFoundException(
          `Employee with ID ${employee_id} not found`,
        );
      }
      attendance.employee = employee;
      attendance.branch = employee.branch;
    }
    Object.assign(attendance, rest);
    return this.attRepository.save(attendance);
  }

  async remove(id: number): Promise<void> {
    const attendance = await this.attRepository.findOneBy({ id });
    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }
    await this.attRepository.softRemove(attendance);
  }

  async checkIn(dto: CheckInDto): Promise<Attendance> {
    const { employee_id } = dto;

    const employee = await this.employeeRepository.findOne({
      where: { id: employee_id },
      relations: ['branch'],
    });

    if (!employee?.branch) {
      throw new BadRequestException('Employee or branch not found');
    }

    const now = new Date();
    const localCheckInTime = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const localWorkDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );

    const newAttendance = this.attRepository.create({
      employee: { id: employee_id },
      branch: { id: employee.branch.id },
      work_date: localWorkDate,
      check_in_time: localCheckInTime,
      status: 'มา',
    });

    return await this.attRepository.save(newAttendance);
  }

  async checkOut(dto: CheckOutDto): Promise<Attendance> {
    console.log(`Attempting checkout for employee ID: ${dto.employee_id}`);

    const now = new Date();
    const localToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );

    const attendance = await this.attRepository.findOne({
      where: {
        employee: { id: dto.employee_id },
        work_date: localToday,
        check_out_time: IsNull(),
      },
      order: {
        id: 'DESC',
      },
      relations: ['employee'],
    });

    if (!attendance) {
      console.warn(
        `No check-in record found for employee ID: ${dto.employee_id} on ${localToday.toISOString()}`,
      );
      throw new NotFoundException('No check-in record found for check-out');
    }

    const checkOutTime = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    attendance.check_out_time = checkOutTime;
    const savedAttendance = await this.attRepository.save(attendance);

    if (this.attendanceCheckoutAdapter) {
      try {
        // Ensure work_date is a Date object
        const workDate =
          attendance.work_date instanceof Date
            ? attendance.work_date
            : new Date(attendance.work_date);

        this.attendanceCheckoutAdapter.notifyCheckout(
          dto.employee_id,
          workDate,
        );
        console.log(
          `Checkout notification sent for employee ID: ${dto.employee_id}`,
        );
      } catch (error) {
        console.error(
          `Failed to notify checkout for employee ID: ${dto.employee_id}`,
          error,
        );
      }
    } else {
      console.warn(
        'AttendanceCheckoutAdapter not available, skipping salary notification',
      );
    }

    console.log(
      `Checkout completed for employee ID: ${dto.employee_id} at ${checkOutTime}`,
    );
    return savedAttendance;
  }

  // ปรับปรุงเมธอด checkOutById เพื่อรองรับการคำนวณเงินเดือน
  async checkOutById(attendanceId: number): Promise<Attendance> {
    console.log(`Attempting checkout for attendance ID: ${attendanceId}`);

    const attendance = await this.attRepository.findOne({
      where: {
        id: attendanceId,
        check_out_time: IsNull(),
      },
      relations: ['employee'],
    });

    if (!attendance) {
      console.warn(
        `No check-in record found for attendance ID: ${attendanceId}`,
      );
      throw new NotFoundException('No check-in record found for check-out');
    }

    const now = new Date();
    const checkOutTime = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    attendance.check_out_time = checkOutTime;
    const savedAttendance = await this.attRepository.save(attendance);

    if (this.attendanceCheckoutAdapter) {
      try {
        // Ensure work_date is a Date object
        const workDate =
          attendance.work_date instanceof Date
            ? attendance.work_date
            : new Date(attendance.work_date);

        this.attendanceCheckoutAdapter.notifyCheckout(
          attendance.employee.id,
          workDate,
        );
        console.log(
          `Checkout notification sent for employee ID: ${attendance.employee.id}`,
        );
      } catch (error) {
        console.error(
          `Failed to notify checkout for employee ID: ${attendance.employee.id}`,
          error,
        );
      }
    } else {
      console.warn(
        'AttendanceCheckoutAdapter not available, skipping salary notification',
      );
    }

    console.log(
      `Checkout completed for attendance ID: ${attendanceId} at ${checkOutTime}`,
    );
    return savedAttendance;
  }
}
