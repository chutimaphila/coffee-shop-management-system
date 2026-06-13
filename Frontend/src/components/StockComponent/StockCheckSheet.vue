<template>
  <q-card flat class="q-pa-md">
    <q-card-section>
      <div class="text-h6">ใบเช็คสต็อกสินค้า</div>
      <!-- ช่องกรอกชื่อผู้ตรวจสอบ ขนาดสั้นลง -->
      <q-input
        v-model="checkedBy"
        dense
        filled
        label="ชื่อผู้ตรวจสอบ"
        placeholder="กรุณากรอกชื่อผู้ตรวจสอบ"
        @blur="syncCheckedBy"
        style="max-width: 250px"
      />
    </q-card-section>

    <q-table :rows="stockItems" :columns="columns" row-key="id" class="q-mb-md" dense bordered>
      <template v-slot:body-cell-id="props">
        <q-td><q-input v-model="props.row.id" dense filled type="text" /></q-td>
      </template>
      <template v-slot:body-cell-name="props">
        <q-td><q-input v-model="props.row.name" dense filled /></q-td>
      </template>
      <template v-slot:body-cell-quantity="props">
        <q-td><q-input v-model.number="props.row.quantity" type="number" dense filled /></q-td>
      </template>
      <template v-slot:body-cell-unit="props">
        <q-td><q-input v-model="props.row.unit" dense filled /></q-td>
      </template>
      <template v-slot:body-cell-mfgDate="props">
        <q-td><q-input v-model="props.row.mfgDate" type="date" dense filled /></q-td>
      </template>
      <template v-slot:body-cell-expDate="props">
        <q-td><q-input v-model="props.row.expDate" type="date" dense filled /></q-td>
      </template>
      <template v-slot:body-cell-checkDate="props">
        <q-td><q-input v-model="props.row.checkDate" type="datetime-local" dense filled /></q-td>
      </template>
    </q-table>

    <q-card-actions align="right">
      <q-btn label="บันทึกการตรวจสต็อก" color="primary" icon="save" @click="handleSaveAndClose" />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { defineEmits, withDefaults, defineProps, ref } from 'vue'

const emit = defineEmits(['close', 'save-checklist'])

const props = withDefaults(
  defineProps<{
    stockItems: Array<{
      id: string | number
      name: string
      quantity: number
      unit: string
      mfgDate: string
      expDate: string
      checkDate?: string
      checkedBy?: string
    }>
  }>(),
  {
    stockItems: () => [
      {
        id: 1,
        name: 'สินค้า A',
        quantity: 500,
        unit: 'ชิ้น',
        mfgDate: '2024-01-01',
        expDate: '2025-01-01',
      },
      {
        id: 2,
        name: 'สินค้า B',
        quantity: 200,
        unit: 'กล่อง',
        mfgDate: '2024-02-01',
        expDate: '2025-02-01',
      },
      {
        id: 3,
        name: 'สินค้า C',
        quantity: 300,
        unit: 'ชิ้น',
        mfgDate: '2024-03-01',
        expDate: '2025-03-01',
      },
      {
        id: 4,
        name: 'สินค้า D',
        quantity: 100,
        unit: 'กระปุก',
        mfgDate: '2024-04-01',
        expDate: '2025-04-01',
      },
      {
        id: 5,
        name: 'สินค้า E',
        quantity: 150,
        unit: 'แพ็ค',
        mfgDate: '2024-05-01',
        expDate: '2025-05-01',
      },
      {
        id: 6,
        name: 'สินค้า F',
        quantity: 400,
        unit: 'ถุง',
        mfgDate: '2024-06-01',
        expDate: '2025-06-01',
      },
      {
        id: 7,
        name: 'สินค้า G',
        quantity: 50,
        unit: 'กล่อง',
        mfgDate: '2024-07-01',
        expDate: '2025-07-01',
      },
      {
        id: 8,
        name: 'สินค้า H',
        quantity: 250,
        unit: 'ขวด',
        mfgDate: '2024-08-01',
        expDate: '2025-08-01',
      },
      {
        id: 9,
        name: 'สินค้า I',
        quantity: 600,
        unit: 'ชิ้น',
        mfgDate: '2024-09-01',
        expDate: '2025-09-01',
      },
      {
        id: 10,
        name: 'สินค้า J',
        quantity: 350,
        unit: 'กระปุก',
        mfgDate: '2024-10-01',
        expDate: '2025-10-01',
      },
      {
        id: 11,
        name: 'สินค้า K',
        quantity: 250,
        unit: 'ขวด',
        mfgDate: '2024-11-01',
        expDate: '2025-11-01',
      },
      {
        id: 12,
        name: 'สินค้า L',
        quantity: 180,
        unit: 'ชิ้น',
        mfgDate: '2024-12-01',
        expDate: '2025-12-01',
      },
      {
        id: 13,
        name: 'สินค้า M',
        quantity: 300,
        unit: 'กระปุก',
        mfgDate: '2025-01-01',
        expDate: '2026-01-01',
      },
      {
        id: 14,
        name: 'สินค้า N',
        quantity: 450,
        unit: 'กล่อง',
        mfgDate: '2025-02-01',
        expDate: '2026-02-01',
      },
      {
        id: 15,
        name: 'สินค้า O',
        quantity: 400,
        unit: 'แพ็ค',
        mfgDate: '2025-03-01',
        expDate: '2026-03-01',
      },
      {
        id: 16,
        name: 'สินค้า P',
        quantity: 220,
        unit: 'ถุง',
        mfgDate: '2025-04-01',
        expDate: '2026-04-01',
      },
      {
        id: 17,
        name: 'สินค้า Q',
        quantity: 500,
        unit: 'ชิ้น',
        mfgDate: '2025-05-01',
        expDate: '2026-05-01',
      },
      {
        id: 18,
        name: 'สินค้า R',
        quantity: 280,
        unit: 'กระปุก',
        mfgDate: '2025-06-01',
        expDate: '2026-06-01',
      },
      {
        id: 19,
        name: 'สินค้า S',
        quantity: 150,
        unit: 'กล่อง',
        mfgDate: '2025-07-01',
        expDate: '2026-07-01',
      },
      {
        id: 20,
        name: 'สินค้า T',
        quantity: 350,
        unit: 'แพ็ค',
        mfgDate: '2025-08-01',
        expDate: '2026-08-01',
      },
    ],
  },
)

const columns = [
  { name: 'id', label: 'รหัสสินค้า', field: 'id' },
  { name: 'name', label: 'ชื่อสินค้า', field: 'name' },
  { name: 'quantity', label: 'จำนวนคงเหลือ', field: 'quantity' },
  { name: 'unit', label: 'หน่วยนับ', field: 'unit' },
  { name: 'mfgDate', label: 'วันที่ผลิต', field: 'mfgDate' },
  { name: 'expDate', label: 'วันหมดอายุ', field: 'expDate' },
  { name: 'checkDate', label: 'วันที่ตรวจสอบ', field: 'checkDate' },
]

/** ✅ ชื่อผู้ตรวจสอบ */
const checkedBy = ref('') // เก็บชื่อผู้ตรวจสอบ

/** ✅ ซิงค์ชื่อผู้ตรวจสอบไปยังทุกแถว */
function syncCheckedBy() {
  // หากมีชื่อผู้ตรวจสอบให้ตั้งชื่อในทุกแถว
  if (checkedBy.value && props.stockItems.length > 0) {
    props.stockItems.forEach((item) => {
      item.checkedBy = checkedBy.value
    })
  }
}

/** ✅ บันทึกการตรวจสต็อก */
function handleSaveAndClose() {
  // ทำการอัปเดตชื่อผู้ตรวจสอบในทุกแถว
  props.stockItems.forEach((item) => {
    item.checkedBy = checkedBy.value
  })
  emit('save-checklist', props.stockItems)
  emit('close')
}
</script>
