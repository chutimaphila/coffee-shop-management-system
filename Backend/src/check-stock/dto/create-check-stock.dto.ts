export class CreateCheckStockDto {
  stockDetails?: {
    id: number;
    materialId: number;
    quantity: number;
  }[];
  userId: number;
}
