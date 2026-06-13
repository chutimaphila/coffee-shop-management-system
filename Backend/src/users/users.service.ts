import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate } from 'class-validator';
import { Role } from 'src/roles/entities/role.entity';
import { Branch } from 'src/branches/entities/branch.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    @InjectRepository(Branch)
    private readonly branchesRepository: Repository<Branch>,
  ) {}

  async create(
    createUserDto: CreateUserDto & { imageUrl: string },
  ): Promise<User> {
    const errors = await validate(createUserDto);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.toString()}`);
    }

    const newUser = this.usersRepository.create(createUserDto);

    // ตั้งค่า role ให้ผู้ใช้ (1 คนมี 1 role)
    if (createUserDto.roleId) {
      const role = await this.rolesRepository.findOneBy({
        id: createUserDto.roleId,
      });
      if (!role)
        throw new NotFoundException(
          `Role ID ${createUserDto.roleId} not found`,
        );
      newUser.role = role;
    }
    if (createUserDto.branchId) {
      const branch = await this.branchesRepository.findOneBy({
        id: createUserDto.branchId,
      });
      if (!branch) {
        throw new NotFoundException(
          `Branch ID ${createUserDto.branchId} not found`,
        );
      }
      newUser.branch = branch;
    }

    return await this.usersRepository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find({ relations: ['role', 'branch'] }); // เปลี่ยนเป็น 'role'
  }

  async findOne(id: number): Promise<User> {
    return await this.usersRepository.findOneOrFail({
      where: { id },
      relations: ['role', 'branch'],
    });
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOneOrFail({
      where: { email },
      relations: ['role', 'branch'],
    });
    return user;
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto & { imageUrl: string },
  ): Promise<User> {
    const user = await this.usersRepository.findOneOrFail({
      where: { id },
      relations: ['role', 'branch'], // Ensure these are eagerly loaded
    });

    if (updateUserDto.roleId) {
      const role = await this.rolesRepository.findOneBy({
        id: updateUserDto.roleId,
      });
      if (!role) {
        throw new NotFoundException(
          `Role ID ${updateUserDto.roleId} not found`,
        );
      }
      user.role = role;
    }

    if (updateUserDto.branchId) {
      const branch = await this.branchesRepository.findOneBy({
        id: updateUserDto.branchId,
      });
      if (!branch) {
        throw new NotFoundException(
          `Branch ID ${updateUserDto.branchId} not found`,
        );
      }
      user.branch = branch;
    }

    const updateUser = { ...user, ...updateUserDto };

    return await this.usersRepository.save(updateUser);
  }

  async remove(id: number): Promise<void> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.usersRepository.softRemove(user);
  }
}
