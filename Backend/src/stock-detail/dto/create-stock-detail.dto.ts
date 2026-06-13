export class CreateStockDetailDto {
  name: string;
  price: number;
  qtPrevious: number;
  quantity: number;
  min: number;
  use: number;
  status: string;
  checkstockId?: number;
  materialId?: number;
}
