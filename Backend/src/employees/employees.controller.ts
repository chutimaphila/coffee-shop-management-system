import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Employee } from './entities/employee.entity';
import { v4 as uuidv4 } from 'uuid';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'เพิ่มพนักงานใหม่' })
  @ApiCreatedResponse({ description: 'เพิ่มพนักงานสำเร็จ' })
  @ApiBody({ description: 'ข้อมูลสินค้า', type: CreateEmployeeDto })
  @UseInterceptors(
    FileInterceptor('file', {
      // กำหนดชื่อฟิลด์ที่จะใช้รับไฟล์
      storage: diskStorage({
        destination: './uploads/users', // ตั้งค่า path สำหรับเก็บไฟล์
        filename: (req, file, callback) => {
          console.log(file);
          const uniqueFileName = uuidv4() + extname(file.originalname); // ตั้งชื่อไฟล์แบบไม่ซ้ำ
          callback(null, uniqueFileName); // ส่งชื่อไฟล์
        },
      }),
    }),
  )
  async create(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // ถ้าไม่มีไฟล์ ให้ใช้รูป default
    if (file) {
      createEmployeeDto.imageUrl = `/user-images/${file.filename}`;
    } else {
      createEmployeeDto.imageUrl = `/user-images/unknown.jpg`;
    }
    return this.employeesService.create(createEmployeeDto); // ส่งข้อมูลไปยัง service
  }

  @Get()
  @ApiOperation({ summary: 'ดูข้อมูลพนักงานทั้งหมด' })
  findAll() {
    return this.employeesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'ค้นหาพนักงานด้วยไอดี' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Employee> {
    return this.employeesService.findOne(+id);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'อัพเดทข้อมูลพนักงานด้วยไอดี' })
  @ApiBody({ type: UpdateEmployeeDto, description: 'ข้อมูลพนักงาน' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/users',
        filename: (req, file, callback) => {
          console.log(file);
          const uniqueFileName = uuidv4() + extname(file.originalname);
          callback(null, uniqueFileName);
        },
      }),
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    console.log(file);
    if (file) {
      // เพิ่ม path เข้าไปที่ imageUrl
      updateEmployeeDto.imageUrl = `/user-images/${file.filename}`;
    }
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.employeesService.remove(id);
  }
}
