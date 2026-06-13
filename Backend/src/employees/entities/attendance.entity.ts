import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from './employee.entity';
import { Branch } from 'src/branches/entities/branch.entity';

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  // @ManyToOne(() => Employee, { eager: true })
  // @JoinColumn({ name: 'employee_id' })
  // employee: Employee; // ใช้ relation object แทน column
  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ name: 'employee_id' }) // ต้องมี column นี้ด้วย
  employee_id: number;

  @Column({ type: 'date' })
  work_date: Date;

  @Column({ type: 'time', nullable: true })
  check_in_time: string;

  @Column({ type: 'time', nullable: true })
  check_out_time: string;

  @Column()
  status: 'มา' | 'ขาด' | 'ลา' | 'มาสาย';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @ManyToOne(() => Branch, (branch) => branch.employees, {
    eager: true, // โหลด branch อัตโนมัติ
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;
}
