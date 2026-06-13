import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { ApiBody, ApiOperation, ApiParam } from '@nestjs/swagger';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { CheckInDto } from './dto/check-in.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @ApiOperation({ summary: 'เพิ่มข้อมูลการเข้า-ออกงาน (หลังบ้าน)' })
  @ApiBody({
    type: CreateAttendanceDto,
    examples: {
      example1: {
        summary: 'ตัวอย่างข้อมูลที่ admin เพิ่ม',
        value: {
          employee_id: 1,
          work_date: '2025-04-21',
          check_in_time: '08:00:00',
          check_out_time: '17:00:00',
          status: 'มา',
        },
      },
    },
  })
  async create(@Body() dto: CreateAttendanceDto) {
    return this.attendanceService.create(dto);
  }

  @Post('checkout/:id')
  async checkoutById(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceService.checkOutById(id);
  }

  @Post('check-in')
  async checkIn(@Body() dto: CheckInDto) {
    return this.attendanceService.checkIn(dto);
  }

  @Get() // ต้องมี endpoint นี้
  async findAll() {
    return this.attendanceService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'ค้นหาพนักงานด้วยไอดี' })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'ไอดีของการบันทึกเวลาเข้าออกงาน',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'แก้ไขข้อมูลการเข้า-ออกงาน' })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'ไอดีของการบันทึกเวลาเข้าออกงาน',
  })
  @ApiBody({
    description: 'ข้อมูลใหม่ของพนักงาน',
    type: UpdateAttendanceDto,
    examples: {
      example1: {
        summary: 'ตัวอย่างข้อมูล',
        value: {
          check_in_time: '18:00:00',
          check_out_time: '18:00:00',
          status: 'มาสาย',
        },
      },
    },
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'ลบข้อมูลการบันทึกเวลาเข้าออกงาน' })
  @ApiParam({ name: 'id', example: 1 })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceService.remove(id);
  }
}
