<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">รายการใบเช็คสต๊อก</div>
    </q-card-section>
    <q-separator />
    <q-card-section>
      <q-table :rows="props.checklists" :columns="columns" row-key="id" flat bordered>
        <template v-slot:body-cell-actions="props">
          <q-td align="center">
            <q-btn
              label="ดูรายละเอียด"
              color="primary"
              dense
              size="sm"
              @click="openDetailDialog(props.row)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card-section>

    <!-- ✅ Dialog แสดงรายละเอียดใบเช็ค + รายการสินค้า -->
    <q-dialog v-model="showDetailDialog">
      <q-card style="min-width: 600px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">รายละเอียดใบเช็ค</div>
        </q-card-section>
        <q-separator />
        <q-card-section v-if="selectedChecklist">
          <div><strong>รหัสใบเช็ค:</strong> {{ selectedChecklist.id }}</div>
          <div><strong>วันที่:</strong> {{ selectedChecklist.date }}</div>
          <div><strong>ผู้ตรวจสอบ:</strong> {{ selectedChecklist.employee }}</div>
          <div><strong>จำนวนรายการ:</strong> {{ selectedChecklist.totalItems }}</div>
          <div><strong>หมายเหตุ:</strong> {{ selectedChecklist.note || '—' }}</div>
          <q-separator class="q-my-sm" />
          <div class="q-mb-sm text-bold">รายการสินค้า</div>
          <q-markup-table dense bordered>
            <thead>
              <tr>
                <th>รหัส</th>
                <th>ชื่อสินค้า</th>
                <th>จำนวน</th>
                <th>หน่วย</th>
                <th>วันหมดอายุ</th>
                <th>วันที่ตรวจ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in selectedChecklist.items" :key="item.id">
                <td>{{ item.id }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.quantity }}</td>
                <td>{{ item.unit }}</td>
                <td>{{ item.expDate }}</td>
                <td>{{ item.checkDate || '-' }}</td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="ปิด" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup lang="ts">
import { defineProps, ref } from 'vue'
import type { QTableColumn } from 'quasar'

interface StockItem {
  id: string
  name: string
  quantity: number
  unit: string
  mfgDate: string
  expDate: string
  checkDate?: string
  checkedBy?: string
}

interface ChecklistRecord {
  id: string
  date: string
  employee: string
  totalItems: number
  note?: string
  items: StockItem[]
}

const props = defineProps<{
  checklists: ChecklistRecord[]
}>()

const showDetailDialog = ref(false)
const selectedChecklist = ref<ChecklistRecord | null>(null)

function openDetailDialog(row: ChecklistRecord) {
  selectedChecklist.value = row
  showDetailDialog.value = true
}

const columns: QTableColumn[] = [
  { name: 'id', label: 'รหัสใบเช็ค', field: 'id', align: 'left', sortable: true },
  { name: 'date', label: 'วันที่', field: 'date', align: 'center', sortable: true },
  { name: 'employee', label: 'ผู้ตรวจสอบ', field: 'employee', align: 'center' },
  { name: 'totalItems', label: 'จำนวนรายการ', field: 'totalItems', align: 'center' },
  { name: 'actions', label: 'การกระทำ', field: 'actions', align: 'center' },
]
</script>

<style scoped>
.text-h6 {
  font-weight: bold;
}
</style>
