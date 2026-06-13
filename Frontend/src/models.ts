export interface Product {
  id: number
  name: string //
  price: number //
  categoryId: number //
  category?: Category // เพิ่ม category เป็น optional
  imageUrl?: string // สำหรับแสดงภาพ
  file?: File | null // สำหรับอัปโหลดภาพใหม่//
}

export interface Category {
  id?: number
  name: string
}

export interface OrderItem {
  productId: number
  name: string
  quantity: number
  price: number
  product?: Product
  createdAt?: string
}

export interface Order {
  id?: number
  total: number
  discountAmount: number // ✅ ส่วนลดที่ใช้
  totalAfterDiscount: number // ✅ ยอดหลังส่วนลด
  receivedAmount?: number // เงินที่ลูกค้าจ่าย
  changeAmount?: number // เงินทอนที่คืนให้ลูกค้า
  usedPoints: number // ✅ แต้มที่ใช้
  earnedPoints: number // ✅ แต้มที่ได้
  paymentMethod: 'cash' | 'transfer' | 'credit' | string
  customerId?: number | null // ✅ ไอดีลูกค้า (nullable)
  customer?: Customer | null // เพิ่มฟิลด์ customer
  promotionId?: number | null // ✅ ไอดีโปร (nullable)
  promotion?: Promotion | null // เพิ่มฟิลด์ promotion
  items: OrderItem[]
  createdAt?: string
  userId?: number
  user?: User
  branchId: number
  branch?: Branch
}

export interface User {
  id: number
  name: string
  surname: string
  age: number
  email: string
  password: string
  roleId?: number | null
  roleName?: 'Owner' | 'Admin' | 'User' | null
  role?: Role | null
  gender: 'male' | 'female'
  imageUrl?: string
  branchId: number | null
  branch?: Branch | null
}

export interface Role {
  id: number
  name: string
  createAt?: Date
  updateAt?: Date
  deleteAt?: Date
}

export interface Employee {
  id: number
  name: string
  surname: string
  age: number
  gender: string
  // gender: 'ชาย' | 'หญิง' | 'อื่นๆ'
  phone_number: string
  position: string
  // position: 'ผู้จัดการ' | 'พนักงานชงกาแฟ' | 'แคชเชียร์' | 'พนักงานครัว' | 'พนักงานเสิร์ฟ'
  employment_type: string
  // employment_type: 'รายวัน' | 'รายเดือน'
  is_active: boolean
  imageUrl: string
  file?: File | null
  user_id: number
  branch_id: number
  user?: User
  branch?: Branch
}

export interface Branch {
  id: number // รหัสสาขา
  name: string // ชื่อสาขา
  district: string // ที่อยู่
  contactNumber: string // เบอร์ติดต่อ
  status: boolean // สถานะเปิด (true) หรือปิด (false)
  latitude: string // ละติจูด
  longitude: string // ลองจิจูด
  radius: string // รัศมีการให้บริการ
  createdAt?: string // วันที่สร้าง
  updatedAt?: string // วันที่แก้ไขล่าสุด
}
export interface Attendance {
  id: number
  employee_id: number
  employee?: Employee // ความสัมพันธ์กับพนักงาน
  work_date: Date
  check_in_time: string
  check_out_time: string
  status: 'มา' | 'ขาด' | 'ลา' | 'มาสาย' // workHour?: number
  created_at: Date
  updated_at: Date
  // note?: string
  branch_id: number
  branch?: Branch
}

export interface Expense {
  id: number
  name: string
  branch: string // สำหรับแสดงชื่อสาขา
  branchId: number // ใช้เพื่อเก็บข้อมูลจาก API หรือในการส่งข้อมูลไปยัง API
  datetime: string
  amount: number
  type: string
}

export interface Customer {
  id: number
  name: string
  surname: string
  phoneNumber: string
  birthDate: string | undefined
  gender: 'male' | 'female' | 'others'
  age: number
  point: number
  imageUrl: string
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date
}

export interface Promotion {
  id: number
  name: string
  description: string
}

export interface Stock {
  id: string // รหัสสต็อก
  productId: string // อ้างอิงถึงสินค้าที่เกี่ยวข้อง
  warehouseId?: string // อ้างอิงคลังสินค้า (ถ้ามีหลายคลัง)
  quantity: number // จำนวนที่มีอยู่
  unit: string // หน่วย (เช่น ชิ้น, กล่อง, กิโลกรัม)
  updatedAt: Date
  createdAt: Date
}

export interface Salary {
  id: number
  working_hours: number
  wage: number
  total_amount: number
  is_paid: boolean
  salary_date: string
  employee: {
    employee_id: number
    employee_name: string
    position: string
    branch_name: string
  }
}

export interface PopularProductSale {
  productId: number
  total_quantity: number
  total_sales: number
}
