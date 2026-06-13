import { PartialType } from '@nestjs/mapped-types';
import { CreateCheckStockDto } from './create-check-stock.dto';

export class UpdateCheckStockDto extends PartialType(CreateCheckStockDto) {}
