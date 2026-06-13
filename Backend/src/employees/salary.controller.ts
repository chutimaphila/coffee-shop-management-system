import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  Post,
  Req,
} from '@nestjs/common';
import { SalaryService } from './salary.service';
import { UpdateSalaryDto as MarkSalaryAsPaidDto } from './dto/update-salary.dto';
import { SalaryResponseDto } from './dto/salary-response.dto';
import { CreateSalaryDto } from './dto/create-salary.dto';

@Controller('salaries')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @Get()
  async findAll(): Promise<SalaryResponseDto[]> {
    return this.salaryService.findAll();
  }

  @Patch(':id')
  async markAsPaid(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: MarkSalaryAsPaidDto,
  ): Promise<SalaryResponseDto> {
    return this.salaryService.markAsPaid(id, body);
  }

  @Post('process')
  async processSalaries(
    @Body() createSalaryDtos: CreateSalaryDto[],
  ): Promise<{ input: CreateSalaryDto; result: SalaryResponseDto }[]> {
    return Promise.all(
      createSalaryDtos.map(async (dto) => {
        const result = await this.salaryService.processSalary(dto);
        return { input: dto, result };
      }),
    );
  }

  @Get('my-salaries')
  async findMySalaries(@Req() req: any): Promise<SalaryResponseDto[]> {
    const userId = req.user.id; // Assuming `req.user` is populated by your authentication middleware
    return this.salaryService.findByUserId(userId);
  }
}
