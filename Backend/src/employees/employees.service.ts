import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { User } from 'src/users/entities/user.entity';
import { Branch } from 'src/branches/entities/branch.entity';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    console.log('CREATE DTO:', createEmployeeDto); // ✅ debug

    const { user_id, branch_id, ...rest } = createEmployeeDto;

    const user = await this.userRepository.findOneBy({ id: user_id });
    if (!user) throw new NotFoundException(`User with ID ${user_id} not found`);

    const branch = await this.branchRepository.findOneBy({ id: branch_id });
    if (!branch)
      throw new NotFoundException(`Branch with ID ${branch_id} not found`);

    const employee = this.employeeRepository.create({
      ...rest,
      user,
      branch,
    });

    if (rest.name) user.name = rest.name;
    if (rest.surname) user.surname = rest.surname;
    if (rest.imageUrl) {
      user.imageUrl = rest.imageUrl;
    } else {
      user.imageUrl = '/user-images/unknown.jpg'; // ✅ fallback default
    }
    await this.userRepository.save(user);

    return await this.employeeRepository.save(employee);
  }

  async findAll(): Promise<Employee[]> {
    return await this.employeeRepository.find({
      relations: ['user', 'branch'],
    });
  }

  async findOne(id: number): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: ['user', 'branch'],
    });
    if (!employee) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }
    return employee;
  }

  async update(
    id: number,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: ['user', 'branch'],
    });
    if (!employee) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }

    const { name, surname, imageUrl, branch_id, ...rest } = updateEmployeeDto;

    // อัปเดต branch ถ้าได้รับ branch_id ใหม่
    if (branch_id !== undefined) {
      const branch = await this.branchRepository.findOneBy({ id: branch_id });
      if (!branch) {
        throw new NotFoundException(`Branch with ID ${branch_id} not found`);
      }
      employee.branch = branch;
      employee.branch_id = branch.id;
    }

    Object.assign(employee, rest, { name, surname, imageUrl });

    if (employee.user) {
      const user = employee.user;
      if (name) user.name = name;
      if (surname) user.surname = surname;
      if (imageUrl) user.imageUrl = imageUrl;
      await this.userRepository.save(user);
    }

    return await this.employeeRepository.save(employee);
  }

  async remove(id: number): Promise<void> {
    const employee = await this.employeeRepository.findOneBy({ id });
    if (!employee) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }
    await this.employeeRepository.remove(employee);
  }
}
