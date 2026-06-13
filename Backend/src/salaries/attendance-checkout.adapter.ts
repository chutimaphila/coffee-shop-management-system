import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { SalaryEvents } from './salary.events';

@Injectable()
export class AttendanceCheckoutAdapter implements OnModuleInit {
  private salaryEvents: SalaryEvents;

  constructor(private moduleRef: ModuleRef) {}

  onModuleInit() {
    try {
      this.salaryEvents = this.moduleRef.get(SalaryEvents, { strict: false });
    } catch {
      console.warn('SalaryEvents service not available');
    }
  }

  // เมธอดนี้จะถูกเรียกใช้จาก Attendance Service เมื่อมีการ checkout
  notifyCheckout(employeeId: number, workDate: Date) {
    if (this.salaryEvents) {
      this.salaryEvents.emitCheckoutCompleted(employeeId, workDate);
    } else {
      console.error('SalaryEvents service not available');
    }
  }
}
