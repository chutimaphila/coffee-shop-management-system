<template>
  <q-page padding class="custom-page">
    <div class="row q-mb-md">
      <q-tabs v-model="selectedSection" dense class="tab-container">
        <q-tab name="tableexpense" label="รายการโปรโมชั่น" />
      </q-tabs>
    </div>

    <q-tab-panels v-model="selectedSection" animated class="tab-panels">
      <q-tab-panel name="tableexpense">
        <div class="row items-center q-gutter-sm q-mb-md">
          <div class="text-subtitle1 q-mr-sm">รายการโปรโมชั่น</div>
          <q-input filled v-model="searchTerm" label="ค้นหา" debounce="300" style="width: 800px" />
          <q-btn label="Clear" @click="clearSearch" class="q-ml-sm" />
          <div class="btn-group">
            <q-btn dense class="checkin-btn" @click="openDialog"> Add Promotion </q-btn>
          </div>
        </div>

        <q-table
          :rows="store.promotions"
          :columns="columns"
          row-key="id"
          flat
          bordered
          class="q-mt-md"
        >
          <template v-slot:body-cell-actions="props">
            <q-td align="center">
              <q-btn flat round dense icon="edit" color="primary" @click="editRow(props.row)" />
              <q-btn
                flat
                round
                dense
                icon="delete"
                color="negative"
                @click="deleteRow(props.row.id)"
              />
            </q-td>
          </template>
        </q-table>

        <q-dialog v-model="dialog" persistent>
          <q-card style="min-width: 350px">
            <q-card-section>
              <div class="text-h6">Add Promotion</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <q-form ref="form" @submit.prevent="save">
                <q-input filled v-model="formData.name" label="ชื่อ" class="q-mb-md" />
                <q-input
                  filled
                  v-model="formData.datetime"
                  type="datetime-local"
                  label="วันที่ เวลา"
                  class="q-mb-md"
                />
                <q-select
                  filled
                  v-model="formData.type"
                  label="ประเภทโปรโมชั่น"
                  :options="[
                    { label: 'เปอร์เซ็นต์', value: 'PERCENT' },
                    { label: 'จำนวนเงินคงที่', value: 'FIXED' },
                  ]"
                  class="q-mb-md"
                />
                <q-input
                  filled
                  v-model="formData.value"
                  label="มูลค่าของโปรโมชั่น"
                  type="number"
                  class="q-mb-md"
                />
                <q-input
                  filled
                  v-model="formData.minSpend"
                  label="ยอดขั้นต่ำในการใช้โปรโมชั่น"
                  type="number"
                  class="q-mb-md"
                />
                <div class="row justify-end">
                  <q-btn
                    label="Cancel"
                    color="primary"
                    flat
                    @click="dialog = false"
                    class="q-mr-sm"
                  />
                  <q-btn label="Save" color="primary" type="submit" />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </q-dialog>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { QTableColumn } from 'quasar'
import type { Promotion } from 'src/stores/promotionStore'
import { usePromotionStore } from 'src/stores/promotionStore'

const store = usePromotionStore()

const dialog = ref(false)
const searchTerm = ref('')
const selectedSection = ref('tableexpense')

const formData = ref<{
  id?: number
  name: string
  datetime: string
  type: 'PERCENT' | 'FIXED' // เพิ่ม type
  value: number // เพิ่ม value
  minSpend: number // เพิ่ม minSpend
}>({
  name: '',
  datetime: '',
  type: 'PERCENT', // กำหนดค่าเริ่มต้น
  value: 0, // กำหนดค่าเริ่มต้น
  minSpend: 0, // กำหนดค่าเริ่มต้น
})

const columns: QTableColumn[] = [
  { name: 'id', label: 'ID', align: 'left', field: 'id' },
  { name: 'name', label: 'ชื่อ', align: 'left', field: 'name' },
  { name: 'datetime', label: 'วันที่ เวลา', align: 'left', field: 'datetime' },
  {
    name: 'actions',
    label: '',
    align: 'center',
    field: 'id',
    sortable: false,
  },
]

function resetForm() {
  formData.value = {
    name: '',
    datetime: '',
    type: 'PERCENT', // กำหนดค่าเริ่มต้น
    value: 0, // กำหนดค่าเริ่มต้น
    minSpend: 0, // กำหนดค่าเริ่มต้น
  }
}

function openDialog() {
  resetForm()
  dialog.value = true
}

function editRow(row: Promotion) {
  formData.value = {
    id: row.id,
    name: row.name,
    datetime: row.datetime,
    type: row.type, // กำหนด type
    value: row.value, // กำหนด value
    minSpend: row.minSpend, // กำหนด minSpend
  }
  dialog.value = true
}

async function deleteRow(id: number) {
  await store.deletePromotion(id)
  await store.fetchPromotion()
}

async function save() {
  if (formData.value.id) {
    // หากมี ID แสดงว่าเป็นการแก้ไขข้อมูล
    await store.updatePromotion(formData.value.id, { ...formData.value })
  } else {
    // หากไม่มี ID แสดงว่าเป็นการเพิ่มข้อมูลใหม่
    await store.addPromotion({ ...formData.value })
  }
  dialog.value = false
  resetForm()
  await store.fetchPromotion() // รีเฟรชข้อมูลหลังจากการบันทึก
}

function clearSearch() {
  searchTerm.value = ''
}

onMounted(() => {
  store.fetchPromotion()
})
</script>

<style scoped>
.custom-page {
  background-color: #faf3e0;
}
.tab-container {
  background-color: rgba(255, 255, 255, 0.6);
  color: #3e2726;
}
.custom-header {
  background-color: #64483c;
  padding: 1px;
  color: white;
  text-align: center;
  margin-bottom: 20px;
}

.tabs-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}
.equal-btn {
  min-width: 120px;
  font-size: 16px;
  padding: 10px 20px;
  display: inline-flex;
  justify-content: center;
  appearance: 40;
}
.q-tab__label {
  font-size: 15px !important;
  font-weight: bold !important;
}
.tab-panels {
  width: 100%;
  max-width: 100%;
  background-color: transparent;
}
.checkin-btn {
  background-color: #71fd67;
  color: #3e2726;
  font-weight: bold;
  width: 180px;
  height: 40px;
  margin-left: 20px;
  border-radius: 15px;
  font-family: 'Nunito', sans-serif;
  align-items: center;
}
</style>
