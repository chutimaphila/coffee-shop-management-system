<template>
  <div class="q-pa-md">
    <div class="filter-section q-mb-lg">
      <div class="row q-col-gutter-md">
        <!-- Filter controls -->
        <div class="col-12 col-md-4">
          <q-input
            v-model="customerPhone"
            label="ค้นหาลูกค้าด้วยเบอร์โทร"
            outlined
            clearable
            @keyup.enter="filterByCustomerPhone"
          >
            <template v-slot:append>
              <q-btn round dense flat icon="search" @click="filterByCustomerPhone" />
            </template>
          </q-input>
        </div>

        <div class="col-12 col-md-4">
          <q-select
            v-model="selectedDateRange"
            :options="dateRangeOptions"
            label="ช่วงเวลา"
            outlined
            emit-value
            map-options
          />
        </div>

        <div class="col-12 col-md-4">
          <q-input
            v-if="selectedDateRange === 'custom'"
            v-model="customDate"
            outlined
            label="เลือกวันที่"
            mask="date"
            placeholder="YYYY-MM-DD"
            clearable
            type="date"
          />
        </div>
      </div>

      <div class="row q-mt-md">
        <div class="col-12">
          <q-btn-toggle
            v-model="viewMode"
            :options="[
              { label: 'รายวัน', value: 'daily' },
              { label: 'รายเดือน', value: 'monthly' },
              { label: 'รายปี', value: 'yearly' },
            ]"
            spread
            unelevated
            class="bg-white view-toggle"
            toggle-color="primary"
          />
        </div>
      </div>
    </div>

    <!-- Dashboard summary -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-4">
        <q-card class="bg-primary text-white">
          <q-card-section>
            <div class="text-h6">ยอดขายรวม</div>
            <div class="text-h4">{{ filteredTotal.toLocaleString() }} บาท</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="bg-secondary text-white">
          <q-card-section>
            <div class="text-h6">จำนวนออเดอร์</div>
            <div class="text-h4">{{ filteredOrders.length }} รายการ</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="top-selling-product-card">
          <q-card-section>
            <div class="text-h6">สินค้าขายดี</div>
            <div class="text-h4">{{ topSellingProduct }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Charts -->
    <div class="q-mb-lg">
      <div class="chart-box q-mb-md">
        <Bar :data="salesChartData" :options="salesChartOptions" />
      </div>
    </div>

    <!-- Orders table -->
    <div>
      <q-table
        :rows="filteredOrders"
        :columns="columns"
        row-key="id"
        :rows-per-page="10"
        :rows-per-page-options="[5, 10, 20]"
        :pagination="pagination"
        class="data-table"
        bordered
        flat
      >
        <template #body-cell-createdAt="props">
          <q-td :props="props">
            {{ formatDate(props.row.createdAt) }}
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn @click="viewOrderDetail(props.row)" color="primary" label="ดูรายละเอียด" />
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Order details dialog -->
    <q-dialog v-model="isDialogOpen">
      <q-card style="width: 700px; max-width: 80vw">
        <q-card-section>
          <div class="text-h6">รายละเอียดออเดอร์</div>
          <div v-if="selectedOrder">
            <p>
              <strong>ชื่อลูกค้า:</strong>
              {{
                selectedOrder.customer
                  ? selectedOrder.customer.name + ' ' + selectedOrder.customer.surname
                  : '-'
              }}
            </p>
            <p>
              <strong>เบอร์โทร:</strong>
              {{ selectedOrder.customer ? selectedOrder.customer.phoneNumber : '-' }}
            </p>
            <p>
              <strong>ชื่อพนักงาน:</strong>
              {{
                selectedOrder.user
                  ? selectedOrder.user.name + ' ' + selectedOrder.user.surname
                  : '-'
              }}
            </p>

            <p><strong>รายการสินค้า:</strong></p>
            <q-list bordered separator>
              <q-item v-for="item in selectedOrder.items" :key="item.productId">
                <q-item-section>{{
                  item.product?.name || item.name || 'ไม่มีข้อมูล'
                }}</q-item-section>
                <q-item-section side>{{ item.quantity }} x {{ item.price }} บาท</q-item-section>
              </q-item>
            </q-list>
            <p class="q-mt-md">
              <strong>วิธีการชำระ:</strong>
              {{ translatePaymentMethod(selectedOrder.paymentMethod) }}
            </p>
            <p><strong>โปรโมชัน:</strong> {{ selectedOrder.promotion?.name || '-' }}</p>
            <p><strong>ส่วนลด:</strong> {{ selectedOrder.discountAmount || 0 }} บาท</p>
            <p><strong>แต้มที่ใช้:</strong> {{ selectedOrder.usedPoints || 0 }} แต้ม</p>
            <p><strong>แต้มที่ได้รับ:</strong> {{ selectedOrder.earnedPoints || 0 }} แต้ม</p>
            <p><strong>ยอดรวม:</strong> {{ selectedOrder.total }} บาท</p>
            <p>
              <strong>ยอดหลังส่วนลด:</strong>
              {{ selectedOrder.totalAfterDiscount || selectedOrder.total }} บาท
            </p>
            <p><strong>เงินรับ:</strong> {{ selectedOrder.receivedAmount || 0 }} บาท</p>
            <p><strong>เงินทอน:</strong> {{ selectedOrder.changeAmount || 0 }} บาท</p>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="ปิด" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Bar } from 'vue-chartjs'
import type { ChartOptions, ChartData } from 'chart.js'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'
import { useOrderStore } from 'src/stores/orderStore'
import { useCustomerStore } from 'src/stores/customerStore'
import { useAuthStore } from 'src/stores/authStore'
import type { Order } from 'src/models'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const orderStore = useOrderStore()
const customerStore = useCustomerStore()
const authStore = useAuthStore()

const isDialogOpen = ref(false)
const selectedOrder = ref<Order | null>(null)
const viewMode = ref('daily')
const customerPhone = ref('')
const selectedDateRange = ref('all')
const customDate = ref('')

const dateRangeOptions = [
  { label: 'วันนี้', value: 'today' },
  { label: 'เดือนนี้', value: 'this-month' },
  { label: 'ปีนี้', value: 'this-year' },
  { label: 'ทั้งหมด', value: 'all' },
  { label: 'กำหนดเอง', value: 'custom' },
]

const pagination = ref({
  sortBy: 'createdAt',
  descending: true,
  page: 1,
  rowsPerPage: 10,
})

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'center' as const, sortable: true },
  {
    name: 'paymentMethod',
    label: 'วิธีการชำระ',
    field: (row) => translatePaymentMethod(row.paymentMethod),
    align: 'center' as const,
  },
  { name: 'total', label: 'ยอดรวม', field: 'total', align: 'center' as const, sortable: true },
  {
    name: 'customer',
    label: 'ลูกค้า',
    field: (row) => row.customer?.name || '-',
    align: 'center' as const,
  },
  {
    name: 'user',
    label: 'พนักงาน',
    field: (row) => row.user?.name || '-',
    align: 'center' as const,
  },
  {
    name: 'createdAt',
    label: 'วันที่',
    field: 'createdAt',
    align: 'center' as const,
    sortable: true,
  },
  { name: 'actions', label: 'การกระทำ', field: () => '', align: 'center' as const },
]

// Load data on component mount
onMounted(async () => {
  await Promise.all([orderStore.fetchOrders(), customerStore.getCustomers()])
  console.log(
    'Sample order structure:',
    orderStore.orders.length > 0 ? orderStore.orders[0] : 'No orders',
  )
})

// Filter orders
const filteredOrders = computed(() => {
  let filtered = orderStore.orders

  console.log('Starting filtering orders, total orders:', filtered.length)

  // Filter by current user if role is employee
  if (authStore.getRoleId === 1) {
    // Assuming 1 is employee role
    filtered = filtered.filter((order) => order.userId === authStore.user?.id)
    console.log('Filtered by employee userId, count:', filtered.length)
  }

  // Apply date filter
  filtered = applyDateFilter(filtered)
  console.log('After date filter, count:', filtered.length)

  // Apply customer phone filter
  if (customerPhone.value) {
    const matchingCustomers = customerStore.searchCustomersByPhone(customerPhone.value)
    if (matchingCustomers.length > 0) {
      const customerIds = matchingCustomers.map((c) => c.id)
      filtered = filtered.filter(
        (order) =>
          order.customerId !== null &&
          order.customerId !== undefined &&
          customerIds.includes(order.customerId),
      )
      console.log('After customer phone filter, count:', filtered.length)
    } else {
      filtered = []
      console.log('No matching customers found for phone filter, filtered orders empty')
    }
  }

  console.log('filteredOrders count:', filtered.length)
  if (filtered.length > 0) {
    console.log('Sample filtered order:', filtered[0])
  }

  // Sort by created date descending
  return [...filtered].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime()
    const dateB = new Date(b.createdAt || 0).getTime()
    return dateB - dateA
  })
})

// Calculate total sales from filtered orders
const filteredTotal = computed(() => {
  return filteredOrders.value.reduce((sum, order) => sum + Number(order.total || 0), 0)
})

// Find top selling product
const topSellingProduct = computed(() => {
  const productMap = new Map<number, { name: string; count: number }>()

  filteredOrders.value.forEach((order) => {
    order.items.forEach((item) => {
      if (!productMap.has(item.productId)) {
        productMap.set(item.productId, {
          name: item.product?.name || item.name,
          count: 0,
        })
      }
      productMap.get(item.productId)!.count += item.quantity
    })
  })

  let topProduct = { name: 'ไม่มีข้อมูล', count: 0 }
  productMap.forEach((value) => {
    if (value.count > topProduct.count) {
      topProduct = value
    }
  })

  return topProduct.name
})

// Generate chart data based on view mode
const salesChartData = computed<ChartData<'bar'>>(() => {
  const data: Record<string, number> = {}
  const orders = filteredOrders.value

  console.log('Creating chart with orders:', orders.length)

  orders.forEach((order) => {
    if (!order.createdAt) return

    const date = new Date(order.createdAt)
    let key: string | undefined = undefined

    if (viewMode.value === 'daily') {
      key = date.toISOString().split('T')[0]
    } else if (viewMode.value === 'monthly') {
      key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
    } else {
      // yearly
      key = date.getFullYear().toString()
    }

    if (!key) return

    // กำหนดค่าเริ่มต้นถ้ายังไม่มี
    if (data[key] === undefined) {
      data[key] = 0
    }

    // เพิ่มค่าเข้าไปในข้อมูล
    data[key]! += Number(order.total || 0)
  })

  // Sort keys by date
  const sortedKeys = Object.keys(data).sort()

  console.log('Chart data created with labels:', sortedKeys.length)

  // Format labels based on view mode
  const formattedLabels = sortedKeys.map((key) => {
    if (viewMode.value === 'daily') {
      return formatDate(key).split(' ')[0] // Just get the date part
    } else if (viewMode.value === 'monthly') {
      const [year, month] = key.split('-')
      const monthNames = [
        'ม.ค.',
        'ก.พ.',
        'มี.ค.',
        'เม.ย.',
        'พ.ค.',
        'มิ.ย.',
        'ก.ค.',
        'ส.ค.',
        'ก.ย.',
        'ต.ค.',
        'พ.ย.',
        'ธ.ค.',
      ]
      // ตรวจสอบว่า month มีค่าก่อนใช้งาน
      if (!month) return key
      return `${monthNames[parseInt(month) - 1]} ${year}`
    } else {
      return key // year already in correct format
    }
  })

  return {
    labels: formattedLabels,
    datasets: [
      {
        label: 'ยอดขาย (บาท)',
        data: sortedKeys.map((key) => data[key] ?? 0),
        backgroundColor: '#42a5f5',
      },
    ],
  }
})

const salesChartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text:
        viewMode.value === 'daily'
          ? 'สถิติยอดขายรายวัน'
          : viewMode.value === 'monthly'
            ? 'สถิติยอดขายรายเดือน'
            : 'สถิติยอดขายรายปี',
      font: { size: 24 },
    },
  },
}

// Apply date filter to orders
function applyDateFilter(orders: Order[]): Order[] {
  console.log('Original orders before filtering:', orders.length)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Removed unused variable isCustomDate

  const filteredResult = orders.filter((order) => {
    if (!order.createdAt) return false
    const orderDate = new Date(order.createdAt)

    switch (selectedDateRange.value) {
      case 'today':
        return orderDate.toISOString().split('T')[0] === today.toISOString().split('T')[0]

      case 'this-month':
        return (
          orderDate.getMonth() === today.getMonth() &&
          orderDate.getFullYear() === today.getFullYear()
        )

      case 'this-year':
        return orderDate.getFullYear() === today.getFullYear()

      case 'custom':
        if (!customDate.value) return true
        return orderDate.toISOString().split('T')[0] === customDate.value

      case 'all':
      default:
        return true
    }
  })
  console.log('Filtered orders:', filteredResult.length)
  return filteredResult
}

// Filter by customer phone
function filterByCustomerPhone() {
  if (customerPhone.value) {
    const customers = customerStore.searchCustomersByPhone(customerPhone.value)
    if (customers.length === 0) {
      // Handle no matching customers
      console.log('ไม่พบลูกค้าที่มีเบอร์โทรนี้')
    }
  }
}

// View order details
function viewOrderDetail(order: Order) {
  selectedOrder.value = order
  isDialogOpen.value = true
}

// Format date
function formatDate(date: string | Date) {
  return new Date(date).toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Translate payment method
function translatePaymentMethod(method: string): string {
  const translations: Record<string, string> = {
    cash: 'เงินสด',
    transfer: 'โอนเงิน',
    credit: 'บัตรเครดิต',
  }
  return translations[method] || method
}

watch(selectedDateRange, () => {
  console.log('Filter changed, recalculating filtered orders due to selectedDateRange change')
})

watch(customDate, () => {
  console.log('Filter changed, recalculating filtered orders due to customDate change')
})

// Watch for changes in viewMode to update chart title
watch(viewMode, () => {
  // Chart title will update automatically via computed property
})
</script>

<style scoped>
.filter-section {
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  padding: 16px;
}

.view-toggle {
  min-width: 300px;
}

.chart-box {
  width: 100%;
  height: 300px;
  position: relative;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px;
  box-sizing: border-box;
}

.data-table {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.top-selling-product-card {
  background-color: #ffa500 !important;
  color: black !important;
}
</style>
