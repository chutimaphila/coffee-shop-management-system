import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  //Create
  @Post()
  @ApiOperation({ summary: 'Create new user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'usersdata', type: CreateUserDto })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/users',
        filename: (req, file, callback) => {
          console.log(file);
          const uniqueFileName = uuidv4() + extname(file.originalname);
          callback(null, uniqueFileName);
        },
      }),
    }),
  )
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createUserDto: CreateUserDto,
  ) {
    console.log(file);
    return this.usersService.create({
      ...createUserDto,
      imageUrl: file
        ? '/user-images/' + file.filename
        : '/user-images/users.png',
    });
  }
  //ReadAll
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
  //ReadOne
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }
  //Partail Update
  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'usersdata', type: UpdateUserDto })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/users',
        filename: (req, file, callback) => {
          console.log(file);
          const uniqueFileName = uuidv4() + extname(file.originalname);
          callback(null, uniqueFileName);
        },
      }),
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log(file);
    const existingUser = await this.usersService.findOne(+id);
    return this.usersService.update(+id, {
      ...updateUserDto,
      imageUrl: file ? `/user-images/${file.filename}` : existingUser.imageUrl,
    });
  }
  //Delete
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
