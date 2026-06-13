import { Controller, Get } from '@nestjs/common';

@Controller('api')
export class ReportController {
  @Get('finance')
  getFinanceData() {
    return {
      dailySales: [120, 200, 150, 300, 250, 400, 350], // ยอดขายรายวัน
      monthlySales: [
        1000, 1500, 2000, 2500, 6000, 3500, 4000, 4500, 5000, 5500, 6000, 6500,
      ], // ยอดขายรายเดือน
      yearlySales: [12000, 15000, 18000, 21000, 24000], // ยอดขายรายปี
      expenses: [500, 400, 300, 200, 100], // ค่าใช้จ่าย
      totalRevenue: 50000, // รายรับรวม
      totalCost: 35000, // ต้นทุนรวม
      netProfit: 15000, // กำไรสุทธิ
    };
  }
}
