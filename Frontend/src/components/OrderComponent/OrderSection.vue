<template>
  <div class="Order-page">
    <p class="title">รายการออเดอร์</p>

    <q-table
      :rows="orders"
      :columns="columns"
      row-key="id"
      :rows-per-page="5"
      :rows-per-page-options="[5, 10, 15]"
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

    <!-- Dialog to show order details -->
    <q-dialog v-model="isDialogOpen">
      <q-card>
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
              <strong>ชื่อหนักงาน:</strong>
              {{
                selectedOrder.customer
                  ? selectedOrder.user?.name + ' ' + selectedOrder.user?.surname
                  : '-'
              }}
            </p>

            <p><strong>รายการสินค้า:</strong></p>
            <ul>
              <li v-for="item in selectedOrder.items" :key="item.productId">
                {{ item.product?.name || 'ไม่มีข้อมูล' }} - {{ item.quantity }} x
                {{ item.price }} บาท
              </li>
            </ul>
            <p><strong>วิธีการชำระ:</strong> {{ selectedOrder.paymentMethod }}</p>
            <p><strong>โปรโมชัน:</strong> {{ selectedOrder.promotion?.name || '-' }}</p>
            <p><strong>ยอดรวม:</strong> {{ selectedOrder.total }}</p>
            <p><strong>เงินรับ:</strong> {{ selectedOrder.receivedAmount }}</p>
            <p><strong>เงินทอน:</strong> {{ selectedOrder.changeAmount }}</p>
          </div>
        </q-card-section>
        <q-card-actions>
          <q-btn flat label="ปิด" @click="isDialogOpen = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Order } from 'src/models'
import type { QTableColumn } from 'quasar'
import { useOrderStore } from 'src/stores/orderStore'
import { useCustomerStore } from 'src/stores/customerStore'

const orderStore = useOrderStore()
const customerStore = useCustomerStore()
const isDataLoaded = ref(false)

onMounted(async () => {
  try {
    await Promise.all([orderStore.fetchOrders(), customerStore.getCustomers()])
    console.log('Data loaded successfully, orders count:', orderStore.orders.length)
    console.log('Customers loaded:', customerStore.customers.length)
    isDataLoaded.value = true
  } catch (error) {
    console.error('Failed to load data:', error)
  }
})

const orders = computed(() => orderStore.orders)

const columns: QTableColumn<Order>[] = [
  { name: 'id', label: 'ID', field: 'id', align: 'center', sortable: true },
  { name: 'paymentMethod', label: 'วิธีการชำระ', field: 'paymentMethod', align: 'center' },
  { name: 'total', label: 'ยอดรวม', field: 'totalAfterDiscount', align: 'center', sortable: true },
  { name: 'receivedAmount', label: 'เงินรับ', field: 'receivedAmount', align: 'center' },

  { name: 'customer', label: 'ลูกค้า', field: (row) => row.customer?.name || '-', align: 'center' },
  { name: 'user', label: 'พนักงาน', field: (row) => row.user?.name || '-', align: 'center' },
  {
    name: 'promotion',
    label: 'โปรโมชัน',
    field: (row) => row.promotion?.name || '-',
    align: 'center',
  },
  { name: 'createdAt', label: 'วันที่', field: 'createdAt', align: 'center' },
  { name: 'actions', label: 'การกระทำ', field: () => '', align: 'center' },
  // เพิ่มคอลัมน์นี้เพื่อแสดงปุ่ม
]

const isDialogOpen = ref(false)
const selectedOrder = ref<Order | null>(null)

function viewOrderDetail(order: Order) {
  selectedOrder.value = order
  isDialogOpen.value = true
  orderStore.fetchOrders()
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.Order-page {
  background-color: #faf3e0;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #3e2726;
  margin-bottom: 15px;
}

.data-table {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
