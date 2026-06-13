import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Order, OrderItem, Product } from 'src/models'
import { api } from 'src/boot/axios'
import { useAuthStore } from './authStore'
import { useCustomerStore } from './customerStore'

export const useOrderStore = defineStore('order', () => {
  const items = ref<OrderItem[]>([])
  const paymentMethod = ref<Order['paymentMethod']>('cash')
  const orders = ref<Order[]>([])
  const authStore = useAuthStore()
  const discountAmount = ref(0)
  const receivedAmount = ref(0)
  const branchid = ref(0)
  const changeAmount = ref(0)
  const usedPoints = ref(0)
  const earnedPoints = ref(0)
  const promotionId = ref<number | null>(null)
  const customerId = ref<number | null>(null)
  const customerStore = useCustomerStore()

  const totalAfterDiscount = computed(() => total.value - discountAmount.value)
  const total = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
  )

  // คำนวณยอดขายตามเดือน
  const monthlySalesData = computed(() => {
    const salesByMonth: { [key: string]: number } = {}

    orders.value.forEach((order) => {
      if (order.createdAt) {
        // ตรวจสอบว่า createdAt มีค่าและแปลงเป็น Date ได้
        const date = new Date(order.createdAt)
        if (!isNaN(date.getTime())) {
          // ตรวจสอบว่า date เป็นวันที่ถูกต้อง
          const month = date.getMonth() + 1 // เดือน (0-11, บวก 1 เพื่อให้เป็น 1-12)
          const year = date.getFullYear() // ปี
          const monthYear = `${year}-${month < 10 ? '0' + month : month}` // รูปแบบ 'YYYY-MM'

          if (!salesByMonth[monthYear]) {
            salesByMonth[monthYear] = 0
          }
          salesByMonth[monthYear] += order.total || 0 // บวกยอดขายในแต่ละเดือน
        } else {
          console.error('Invalid createdAt date:', order.createdAt)
        }
      }
    })

    return salesByMonth
  })

  // คำนวณเดือนและยอดขายรวม
  const months = computed(() => Object.keys(monthlySalesData.value))
  const totalSalesPerMonth = computed(() =>
    months.value.map((month) => monthlySalesData.value[month]),
  )

  const todayTotalReceived = computed(() => {
    const today = new Date().toISOString().split('T')[0] // วันนี้ในรูปแบบ YYYY-MM-DD
    console.log(today)

    if (authStore.user?.role?.id === 3) {
      // role 3: กรองตาม userId
      return orders.value
        .filter(
          (item) => item.createdAt?.split('T')[0] === today && item.user?.id === authStore.user?.id,
        )
        .reduce((sum, item) => sum + Number(item.total || 0), 0)
    } else if (authStore.user?.role?.id === 2) {
      // role 2: กรองตาม branchId
      return orders.value
        .filter(
          (item) =>
            item.createdAt?.split('T')[0] === today &&
            item.user?.branchId === authStore.user?.branchId,
        )
        .reduce((sum, item) => sum + Number(item.total || 0), 0)
    }

    // role 1: ทุกคนที่มีวันที่ตรงกับวันนี้
    return orders.value
      .filter((item) => item.createdAt?.split('T')[0] === today)
      .reduce((sum, item) => sum + Number(item.total || 0), 0)
  })

  const countbill = computed(() => {
    const today = new Date().toISOString().split('T')[0] // วันนี้ในรูปแบบ YYYY-MM-DD

    if (authStore.user?.role?.id === 3) {
      // role 3: กรองตาม userId
      return orders.value.filter(
        (item) => item.createdAt?.split('T')[0] === today && item.user?.id === authStore.user?.id,
      )
    } else if (authStore.user?.role?.id === 2) {
      // role 2: กรองตาม branchId
      return orders.value.filter(
        (item) =>
          item.createdAt?.split('T')[0] === today &&
          item.user?.branchId === authStore.user?.branchId,
      )
    }

    // role 1: ทุกคนที่มีวันที่ตรงกับวันนี้
    return orders.value.filter((item) => item.createdAt?.split('T')[0] === today)
  })

  const countoderitem = computed(() => {
    console.log(countbill)

    if (authStore.user?.role?.id === 3) {
      // role 3: กรองตาม userId
      return countbill.value
        .flatMap(
          (item) => item.items.map((orderItem) => orderItem.quantity), // ดึง quantity จากแต่ละ orderItem
        )
        .reduce((sum, quantity) => sum + quantity, 0) // คำนวณผลรวมของ quantity
    } else if (authStore.user?.role?.id === 2) {
      // role 2: กรองตาม branchId
      return countbill.value
        .flatMap(
          (item) => item.items.map((orderItem) => orderItem.quantity), // ดึง quantity จากแต่ละ orderItem
        )
        .reduce((sum, quantity) => sum + quantity, 0)
    }

    // role 1: ทุกคนที่มีวันที่ตรงกับวันนี้
    return countbill.value
      .flatMap(
        (item) => item.items.map((orderItem) => orderItem.quantity), // ดึง quantity จากแต่ละ orderItem
      )
      .reduce((sum, quantity) => sum + quantity, 0)
  })

  // ฟังก์ชันเพิ่มสินค้า
  function addItem(product: Product) {
    const existing = items.value.find((item) => item.productId === product.id)
    if (existing) {
      existing.quantity++
    } else {
      items.value.push({
        productId: product.id!,
        name: product.name,
        price: product.price,
        quantity: 1,
      })
    }
  }

  // ฟังก์ชันลบสินค้า
  function removeItem(productId: number) {
    items.value = items.value.filter((item) => item.productId !== productId)
  }

  // ฟังก์ชันเปลี่ยนจำนวนสินค้า
  function changeQuantity(productId: number, quantity: number) {
    const item = items.value.find((item) => item.productId === productId)
    if (item) {
      item.quantity = quantity
    }
  }

  // ฟังก์ชันตั้งค่าวิธีการชำระเงิน
  function setPaymentMethod(method: Order['paymentMethod']) {
    paymentMethod.value = method
  }

  // ฟังก์ชันเคลียร์การสั่งซื้อ
  function clearOrder() {
    items.value = []
    paymentMethod.value = 'cash'
    receivedAmount.value = 0
    changeAmount.value = 0
    usedPoints.value = 0
    earnedPoints.value = 0
    promotionId.value = null
    customerId.value = null
  }

  // ฟังก์ชันสร้างคำสั่งซื้อ
  function buildOrder(): Order {
    if (usedPoints.value !== 0 && customerId.value != null) {
      console.log('ใช้แต้มสะสม: ', usedPoints.value)
      customerStore.subtractPoints(customerId.value, usedPoints.value)
    }
    if (earnedPoints.value !== 0 && customerId.value != null) {
      console.log('รับแต้มสะสม: ', earnedPoints.value)
      customerStore.addPoints(customerId.value, earnedPoints.value)
    }

    return {
      userId: authStore.user?.id ?? 0, // กำหนดเป็น 0 หากไม่มี user.id
      total: total.value,
      totalAfterDiscount: totalAfterDiscount.value,
      discountAmount: discountAmount.value,
      usedPoints: usedPoints.value,
      earnedPoints: earnedPoints.value,
      paymentMethod: paymentMethod.value,
      items: items.value.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      promotionId: promotionId.value,
      customerId: customerId.value,
      receivedAmount: receivedAmount.value, // ✅ เพิ่มตรงนี้
      changeAmount: changeAmount.value, // ✅ และตรงนี้ด้วย
      branchId: branchid.value,
    }
  }

  // ฟังก์ชันดึงข้อมูลคำสั่งซื้อ
  async function fetchOrders() {
    try {
      const response = await api.get('/orders')
      console.log('📦 Response from /orders:', response)
      console.log('📦 Response from /orders:', response)

      if (Array.isArray(response.data)) {
        orders.value = response.data
        console.log('Orders:', orders.value)
      } else {
        console.error('Expected an array, but got:', response.data)
        orders.value = []
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      orders.value = []
    }
  }

  return {
    items,
    paymentMethod,
    orders,
    total,
    todayTotalReceived,
    countbill,
    countoderitem,
    totalSalesPerMonth,
    monthlySalesData,
    months,
    addItem,
    removeItem,
    changeQuantity,
    setPaymentMethod,
    clearOrder,
    buildOrder,
    fetchOrders,
  }
})
