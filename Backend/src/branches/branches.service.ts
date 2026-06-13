import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { validate } from 'class-validator';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchesRepository: Repository<Branch>,
  ) {}

  //  CREATE
  async create(createBranchDto: CreateBranchDto): Promise<Branch> {
    const errors = await validate(createBranchDto);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.toString()}`);
    }

    const newBranch = this.branchesRepository.create(createBranchDto);
    return await this.branchesRepository.save(newBranch);
  }

  //  READ ALL
  async findAll(): Promise<Branch[]> {
    return await this.branchesRepository.find();
  }

  //  READ ONE
  async findOne(id: number): Promise<Branch> {
    const branch = await this.branchesRepository.findOneBy({ id });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }
    return branch;
  }

  //  UPDATE
  async update(id: number, updateBranchDto: UpdateBranchDto): Promise<Branch> {
    const branch = await this.branchesRepository.findOneBy({ id });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    const updated = { ...branch, ...updateBranchDto };
    return await this.branchesRepository.save(updated);
  }

  //  DELETE (Soft Delete)
  async remove(id: number): Promise<void> {
    const branch = await this.branchesRepository.findOneBy({ id });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }
    await this.branchesRepository.remove(branch);
  }
}
