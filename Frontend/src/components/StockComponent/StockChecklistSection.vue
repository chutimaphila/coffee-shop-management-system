<template>
  <div>
    <!-- ปุ่มเลือกสาขา -->
    <q-btn label="สาขา 1" color="primary" @click="showBranch('A')" class="q-mb-md" />
    <q-btn label="สาขา 2" color="primary" @click="showBranch('B')" class="q-mb-md" />

    <q-separator />

    <!-- ข้อมูลคลังสินค้าแสดงตามสาขาที่เลือก -->
    <q-card v-if="currentBranch === 'A'">
      <q-card-section class="row items-center justify-between">
        <div class="text-h6">ข้อมูลคลังสินค้า สาขา A</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-table :rows="stockItemsA" :columns="columns" row-key="id" flat bordered>
          <!-- สถานะคงคลัง -->
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge
                :color="getStatusColor(props.row.quantity)"
                :label="getStatusLabel(props.row.quantity)"
                class="status-badge"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-card v-if="currentBranch === 'B'">
      <q-card-section class="row items-center justify-between">
        <div class="text-h6">ข้อมูลคลังสินค้า สาขา B</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-table :rows="stockItemsB" :columns="columns" row-key="id" flat bordered>
          <!-- สถานะคงคลัง -->
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge
                :color="getStatusColor(props.row.quantity)"
                :label="getStatusLabel(props.row.quantity)"
                class="status-badge"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { QTableColumn } from 'quasar'

interface StockItem {
  id: number
  code: string
  name: string
  quantity: number
  unit: string
  location: string
  description: string
}

// ข้อมูลสินค้าสำหรับสาขา A
const stockItemsA = ref<StockItem[]>([
  {
    id: 1,
    code: 'P001',
    name: 'ข้าวสาร',
    quantity: 50,
    unit: 'กิโลกรัม',
    location: 'สาขา A',
    description: 'ข้าวสาร',
  },
  {
    id: 2,
    code: 'P002',
    name: 'น้ำปลา',
    quantity: 20,
    unit: 'ขวด',
    location: 'สาขา A',
    description: 'น้ำปลา',
  },
  {
    id: 3,
    code: 'P003',
    name: 'น้ำมันพืช',
    quantity: 5,
    unit: 'ลิตร',
    location: 'สาขา A',
    description: 'น้ำมันพืชทำอาหาร',
  },
])

// ข้อมูลสินค้าสำหรับสาขา B
const stockItemsB = ref<StockItem[]>([
  {
    id: 1,
    code: 'P001',
    name: 'เกลือ',
    quantity: 0,
    unit: 'กิโลกรัม',
    location: 'สาขา B',
    description: 'เกลือบริโภค',
  },
  {
    id: 2,
    code: 'P002',
    name: 'น้ำตาล',
    quantity: 10,
    unit: 'กิโลกรัม',
    location: 'สาขา B',
    description: 'น้ำตาลทราย',
  },
  {
    id: 3,
    code: 'P003',
    name: 'แป้งสาลี',
    quantity: 30,
    unit: 'กิโลกรัม',
    location: 'สาขา B',
    description: 'แป้งสาลีคุณภาพดี',
  },
])

const columns = ref<QTableColumn[]>([
  { name: 'code', label: 'รหัสสินค้า', field: 'code', align: 'left', sortable: true },
  { name: 'name', label: 'ชื่อสินค้า', field: 'name', align: 'left', sortable: true },
  { name: 'quantity', label: 'จำนวน', field: 'quantity', align: 'center', sortable: true },
  { name: 'unit', label: 'หน่วย', field: 'unit', align: 'center', sortable: true },
  { name: 'location', label: 'สาขา', field: 'location', align: 'center', sortable: true },
  { name: 'description', label: 'อธิบาย', field: 'description', align: 'left', sortable: true },
  { name: 'status', label: 'สถานะคลัง', field: 'status', align: 'center' },
])

// ตัวแปรควบคุมสาขาที่แสดง
const currentBranch = ref('A')

function showBranch(branch: string) {
  currentBranch.value = branch
}

function getStatusColor(quantity: number) {
  if (quantity === 0) return 'negative'
  if (quantity < 10) return 'warning'
  return 'positive'
}

function getStatusLabel(quantity: number) {
  if (quantity === 0) return 'สินค้าหมด'
  if (quantity < 10) return 'สินค้าจำนวนน้อย'
  return 'สินค้าปกติ'
}
</script>

<style scoped>
.q-card {
  margin: 20px;
}

.text-h6 {
  font-weight: bold;
}

.status-badge {
  width: 100%;
  display: flex;
  justify-content: center;
  text-align: center;
}

.q-separator {
  margin: 10px 0;
}
</style>
