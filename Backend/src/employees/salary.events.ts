import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SalaryEvents {
  constructor(private eventEmitter: EventEmitter2) {}

  emitCheckoutCompleted(employeeId: number, workDate: Date) {
    this.eventEmitter.emit('attendance.checkout.completed', {
      employeeId,
      workDate,
    });
  }
}
