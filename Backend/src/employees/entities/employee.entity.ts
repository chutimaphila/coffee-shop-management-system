import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Attendance } from './attendance.entity';
import { Salary } from './salary.entity';
import { User } from 'src/users/entities/user.entity';
import { Branch } from 'src/branches/entities/branch.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: number;

  @Column()
  name: string;

  @Column()
  surname: string;

  @Column()
  age: number;

  @Column()
  gender: 'ชาย' | 'หญิง' | 'อื่นๆ';

  @Column()
  phone_number: string;

  @Column()
  position:
    | 'ผู้จัดการ'
    | 'พนักงานชงกาแฟ'
    | 'แคชเชียร์'
    | 'พนักงานครัว'
    | 'พนักงานเสิร์ฟ';

  @Column()
  employment_type: 'รายวัน' | 'รายเดือน';

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: '/user-images/unknown.png' })
  imageUrl: string;

  @OneToMany(() => Attendance, (attendance) => attendance.employee)
  attendances: Promise<Attendance[]>;

  @OneToMany(() => Salary, (salary) => salary.employee)
  salaries: Salary[];

  @ManyToOne(() => Branch, (branch) => branch.employees, {
    eager: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ nullable: true })
  branch_id: number;
}
