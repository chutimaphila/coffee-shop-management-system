import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderItem } from './entities/order-item.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { Promotion } from 'src/promotions/entities/promotion.entity';
import { Branch } from 'src/branches/entities/branch.entity';
import { PopularProductSale } from './dto/popular-product.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private itemRepo: Repository<OrderItem>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(User) private userRepo: Repository<User>, // Inject UserRepository
    @InjectRepository(Customer) private customerRepo: Repository<Customer>, // Inject CustomerRepository
    @InjectRepository(Branch) private branchRepo: Repository<Branch>, // เพิ่มใน constructor
  ) {}

  async create(dto: CreateOrderDto) {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const branch = await this.branchRepo.findOne({
      where: { id: dto.branchId },
    });
    if (!branch) {
      throw new HttpException('Branch not found', HttpStatus.NOT_FOUND);
    }

    const customer = dto.customerId
      ? await this.customerRepo.findOne({
          where: { id: dto.customerId },
          withDeleted: true, // ค้นหาลูกค้าทั้งที่ถูกลบและไม่ถูกลบ
        })
      : null;

    if (dto.customerId && !customer) {
      throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
    }

    // สร้าง order พร้อมฟิลด์ใหม่
    const order = this.orderRepo.create({
      total: dto.total,
      totalAfterDiscount: dto.totalAfterDiscount,
      discountAmount: dto.discountAmount,
      usedPoints: dto.usedPoints,
      earnedPoints: dto.earnedPoints,
      paymentMethod: dto.paymentMethod,
      status: 'completed', // อาจต้องการเปลี่ยนสถานะตามสถานการณ์
      user,
      customer,
      branch, // ✅ เพิ่มตรงนี้
      promotion: dto.promotionId
        ? ({ id: dto.promotionId } as Promotion)
        : null,
      receivedAmount: dto.receivedAmount, // เพิ่มฟิลด์นี้
      changeAmount: dto.changeAmount, // และฟิลด์นี้
    });

    order.items = [];

    for (const item of dto.items) {
      const product = await this.productRepo.findOneBy({ id: item.productId });
      if (!product) {
        throw new HttpException(
          `Product with ID ${item.productId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      const orderItem = this.itemRepo.create({
        product,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity, // คำนวณ total ของ item
      });

      order.items.push(orderItem);
    }

    const savedOrder = await this.orderRepo.save(order);

    // ถ้ามีลูกค้า ต้องอัปเดตแต้ม
    if (customer) {
      customer.point = customer.point - dto.usedPoints + dto.earnedPoints;
      await this.customerRepo.save(customer);
    }

    return savedOrder;
  }

  findAll() {
    return this.orderRepo.find({
      relations: ['items', 'items.product', 'user', 'customer', 'promotion'], // ✅ เพิ่มตรงนี้
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    try {
      return await this.orderRepo.findOneOrFail({
        where: { id },
        relations: ['items', 'items.product', 'user', 'customer', 'promotion'], // เพิ่ม 'promotion' ที่นี่
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new HttpException(
        `Order with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async getBestSellingProducts(
    roleId?: number,
    userId?: number,
    branchId?: number,
    today?: string,
  ): Promise<PopularProductSale[]> {
    // const orderItemRepository = await this.itemRepo.find();

    let query = this.itemRepo
      .createQueryBuilder('order_item')
      .select('order_item.productId', 'productId')
      .addSelect('SUM(order_item.quantity)', 'total_quantity')
      .addSelect('SUM(order_item.total)', 'total_sales')
      .leftJoin('order_item.order', 'order')
      .where('order.status = :status', { status: 'completed' })
      .andWhere('DATE(order.createdAt) = :today', { today }) // กรองตามวันที
      .groupBy('order_item.productId')
      .orderBy('total_quantity', 'DESC')
      .limit(1); // จำกัดการแสดงผล 10 อันดับแรก

    // กรองตาม roleId
    if (roleId === 3) {
      query = query.andWhere('order.userId = :userId', { userId });
    } else if (roleId === 2) {
      query = query.andWhere('order.branchId = :branchId', { branchId });
    }

    // แปลงผลลัพธ์ให้อยู่ในรูปแบบที่ต้องการ (ตามประเภท PopularProductSale)
    const bestSellingProducts: PopularProductSale[] = await query.getRawMany();

    // แปลงผลลัพธ์ให้อยู่ในรูปแบบที่ต้องการ (ตามประเภท PopularProductSale)
    // const formattedProducts: PopularProductSale[] = bestSellingProducts.map(
    //   (product) => ({
    //     productId: product.productId,
    //     total_quantity: parseFloat(product.total_quantity), // แปลงเป็นตัวเลข
    //     total_sales: parseFloat(product.total_sales), // แปลงเป็นตัวเลข
    //   }),
    // );
    return bestSellingProducts;
  }
}
