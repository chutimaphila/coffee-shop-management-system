import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Employee } from 'src/employees/entities/employee.entity';

@Entity('salaries')
export class Salary {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Employee, (employee) => employee.salaries, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column()
  employee_id: number;

  @Column({ type: 'float' })
  working_hours: number;

  @Column({ type: 'float' })
  wage: number;

  @Column({ type: 'float', nullable: true })
  total_amount: number;

  @Column({ type: 'date' })
  salary_date: Date;

  @Column({ default: false })
  is_paid: boolean;
}
