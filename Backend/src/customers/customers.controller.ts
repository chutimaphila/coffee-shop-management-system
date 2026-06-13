import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Create new customer' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'customersdata', type: CreateCustomerDto })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/customers',
        filename: (req, file, callback) => {
          const uniqueFileName = uuidv4() + extname(file.originalname);
          callback(null, uniqueFileName);
        },
      }),
    }),
  )
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createCustomerDto: CreateCustomerDto,
  ) {
    return this.customersService.create({
      ...createCustomerDto,
      imageUrl: file
        ? '/customer-images/' + file.filename
        : '/customer-images/customers.png',
    });
  }

  // @Get()
  // async findAll(@Query() filterDto: FilterCustomerDto) {
  //   return this.customersService.findAll();
  // }
  @Get()
  async findAll() {
    return this.customersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(+id);
  }

  //Partail Update
  @Patch(':id')
  @ApiOperation({ summary: 'Update customer' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'customersdata', type: UpdateCustomerDto })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/customers',
        filename: (req, file, callback) => {
          const uniqueFileName = uuidv4() + extname(file.originalname);
          callback(null, uniqueFileName);
        },
      }),
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const existingCustomer = await this.customersService.findOne(+id);

    const { file: _, ...cleanDto } = updateCustomerDto;

    return this.customersService.update(+id, {
      ...cleanDto,
      imageUrl: file
        ? `/customer-images/${file.filename}`
        : existingCustomer.imageUrl,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customersService.remove(+id);
  }

  @Patch('customers/:id/add-points')
  @ApiOperation({ summary: 'Add points to a customer' })
  @ApiBody({
    description: 'Number of points to add to the customer',
    type: Number,
    examples: {
      default: {
        value: 10, // Example value to add 10 points
      },
    },
  })
  async addPoints(@Param('id') id: string, @Body('points') points: number) {
    try {
      if (points <= 0) {
        throw new BadRequestException('Points must be greater than 0');
      }

      const customer = await this.customersService.addPoints(+id, points);
      return {
        message: `Added ${points} points to customer with ID ${id}`,
        addedPoints: points,
        currentPoints: customer.point,
      };
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new BadRequestException('Failed to add points: ' + error.message);
    }
  }

  @Patch(':id/subtract-points')
  @ApiOperation({ summary: 'Subtract points from a customer' })
  @ApiBody({
    description: 'Number of points to add to the customer',
    type: Number,
    examples: {
      default: {
        value: 10, // Example value to add 10 points
      },
    },
  })
  async subtractPoints(
    @Param('id') id: string,
    @Body('points') points: number,
  ) {
    try {
      if (points <= 0) {
        throw new BadRequestException('Points must be greater than 0');
      }

      const customer = await this.customersService.subtractPoints(+id, points);
      return {
        message: `Subtracted ${points} points from customer with ID ${id}`,
        subtractedPoints: points,
        currentPoints: customer.point,
      };
    } catch (error) {
      throw new BadRequestException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        'Failed to subtract points: ' + error.message,
      );
    }
  }
}
