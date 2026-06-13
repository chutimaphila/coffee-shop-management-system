<template>
  <q-card-section>
    <div class="text-h6 q-mb-md">ใบสั่งซื้อสินค้า</div>

    <!-- วันที่ และ ชื่อพนักงาน -->
    <div class="q-mb-md row q-col-gutter-md">
      <div class="col-6">
        <q-input filled v-model="orderDate" label="วันที่" type="date" />
      </div>
      <div class="col-6">
        <q-input filled v-model="employeeName" label="ชื่อพนักงาน" />
      </div>
    </div>

    <!-- ปุ่มเพิ่มรายการสินค้าเอง -->
    <div class="q-mb-md">
      <q-btn color="secondary" icon="add" label="เพิ่มรายการสินค้า" @click="showAddDialog = true" />
    </div>

    <!-- ตารางรายการที่สั่งซื้อ -->
    <q-table :rows="orderedItems" :columns="orderedColumns" row-key="id" flat bordered hide-bottom>
      <template v-slot:body-cell-total="props">
        <q-td class="text-right">
          {{ (props.row.price * props.row.quantity).toFixed(2) }}
        </q-td>
      </template>
    </q-table>

    <!-- ปุ่มบันทึกและปิด -->
    <div class="q-mt-md row justify-end">
      <q-btn color="primary" icon="save" label="บันทึกและปิด" @click="saveOrder" />
    </div>

    <!-- Dialog เพิ่มสินค้าเอง -->
    <q-dialog v-model="showAddDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">เพิ่มรายการสินค้าเอง</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input v-model="newItem.code" label="รหัสสินค้า" filled class="q-mb-sm" />
          <q-input v-model="newItem.name" label="ชื่อสินค้า" filled class="q-mb-sm" />
          <q-input v-model="newItem.unit" label="หน่วย" filled class="q-mb-sm" />
          <q-input
            v-model.number="newItem.quantity"
            type="number"
            label="จำนวน"
            filled
            class="q-mb-sm"
          />
          <q-input
            v-model.number="newItem.price"
            type="number"
            label="ราคา"
            filled
            class="q-mb-sm"
          />
          <q-input v-model="newItem.branch" label="สาขา" filled class="q-mb-sm" />
          <!-- ✅ ช่องกรอกคำอธิบาย -->
          <q-input v-model="newItem.note" label="คำอธิบาย" filled type="textarea" class="q-mb-sm" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="ยกเลิก" color="grey" @click="showAddDialog = false" />
          <q-btn flat label="เพิ่ม" color="primary" @click="addManualItem" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card-section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { uid } from 'quasar'
import type { QTableColumn } from 'quasar'

const emit = defineEmits(['new-stock-items'])

interface StockItem {
  id: number | string
  code: string
  name: string
  unit: string
  quantity: number
  price: number
  branch: string
  note?: string // ✅ เพิ่มฟิลด์คำอธิบาย
}

const orderDate = ref('')
const employeeName = ref('')
const orderedItems = ref<StockItem[]>([])

const showAddDialog = ref(false)
const newItem = ref<StockItem>({
  id: '',
  code: '',
  name: '',
  unit: '',
  quantity: 1,
  price: 0,
  branch: '',
  note: '', // ✅ คำอธิบายเริ่มว่าง
})

const orderedColumns: QTableColumn[] = [
  { name: 'code', label: 'รหัสสินค้า', field: 'code', align: 'left' },
  { name: 'name', label: 'ชื่อสินค้า', field: 'name', align: 'left' },
  { name: 'unit', label: 'หน่วย', field: 'unit', align: 'center' },
  { name: 'quantity', label: 'จำนวน', field: 'quantity', align: 'center' },
  { name: 'price', label: 'ราคา', field: 'price', align: 'right' },
  { name: 'branch', label: 'สาขา', field: 'branch', align: 'center' },
  { name: 'note', label: 'คำอธิบาย', field: 'note', align: 'left' },
  { name: 'total', label: 'จำนวนเงิน', field: 'total', align: 'right' },
]

function addManualItem() {
  if (!newItem.value.name || newItem.value.quantity <= 0 || !newItem.value.branch) return

  orderedItems.value.push({
    ...newItem.value,
    id: uid(),
  })

  // Reset form
  newItem.value = {
    id: '',
    code: '',
    name: '',
    unit: '',
    quantity: 1,
    price: 0,
    branch: '',
    note: '',
  }
  showAddDialog.value = false
}

function saveOrder() {
  const orderData = {
    date: orderDate.value,
    employee: employeeName.value,
    items: orderedItems.value.map((item) => ({
      code: item.code,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
      branch: item.branch,
      note: item.note,
      total: item.quantity * item.price,
    })),
  }

  console.log('รายการสั่งซื้อที่บันทึก:', orderData)

  emit('new-stock-items', orderedItems.value)

  // Reset form
  orderedItems.value = []
  orderDate.value = ''
  employeeName.value = ''
}
</script>
