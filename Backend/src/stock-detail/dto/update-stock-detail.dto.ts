import { PartialType } from '@nestjs/mapped-types';
import { CreateStockDetailDto } from './create-stock-detail.dto';

export class UpdateStockDetailDto extends PartialType(CreateStockDetailDto) {}
