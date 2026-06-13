<template>
  <q-page padding class="customer-page">
    <!-- ปุ่มเพิ่ม Customer -->

    <!-- หัวข้อ -->
    <p class="text-h6">รายการสมาชิก</p>

    <div class="row q-gutter-md">
      <!-- ค้นหาชื่อ -->
      <q-input filled v-model="search" label="ค้นหาด้วยเบอร์สมาชิก" class="search-box" dense>
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>

      <!-- ตัวกรองเพศ -->
      <q-select
        filled
        v-model="filterGender"
        :options="genderOptions"
        option-value="value"
        option-label="label"
        label="กรองโดยเพศ"
        emit-value
        map-options
        :clearable="filterGender !== null"
        style="width: 200px"
      />
      <!-- <q-range
        :model-value="filterAge"
        @update:model-value="(val) => (filterAge.value = val)"
        :min="0"
        :max="100"
        :label="true"
        color="primary"
        style="width: 300px"
      /> -->
      <!-- <PosCustomerSearch /> -->
      <div style="width: 300px; position: relative">
        <div class="text-subtitle2 text-center q-mb-xs">
          อายุ: {{ rangeAge.min }} - {{ rangeAge.max }} ปี
        </div>

        <q-range
          v-model="rangeAge"
          color="deep-brown"
          :min="10"
          :max="120"
          :inner-min="1"
          :inner-max="120"
          @input="updateAgeLabel"
        />

        <q-tooltip
          v-if="rangeAge !== null"
          anchor="top middle"
          self="bottom middle"
          :offset="[0, 10]"
        >
          อายุ: {{ rangeAge.min }} - {{ rangeAge.max }}
        </q-tooltip>
      </div>

      <!-- ปุ่มเพิ่มสมาชิก -->
      <div class="col-12 col-md flex justify-end flex-Right">
        <q-btn
          dense
          icon="add"
          class="addCuscut-btn"
          @click="openDialog()"
          color="primary"
          label="เพิ่มสมาชิก"
        />
      </div>
    </div>

    <!-- Dialog เพิ่ม/แก้ไข Customer -->
    <CustomerFormDialog v-model="dialog" :customer="customerStore.form" @submit="handleSave" />

    <!-- ตาราง Customer -->
    <q-table
      :columns="columns"
      :rows="filteredCustomers"
      v-model:pagination="pagination"
      :rows-per-page-options="[5, 10, 15]"
      @request="onRequest"
      class="data-table"
    >
      <template v-slot:no-data>
        <div class="text-center q-pa-md">ไม่พบข้อมูลสมาชิกตามเงื่อนไขที่เลือก</div>
      </template>
      >
      <template v-slot:body-cell-operation="props">
        <q-td :props="props">
          <div class="full-width flex flex-center">
            <q-btn flat icon="edit" @click="edit(props.row)" />
            <q-btn flat icon="delete" @click="remove(props.row)" />
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-imageUrl="{ row }">
        <td class="q-td">
          <q-img :src="'http://localhost:3000' + row.imageUrl"></q-img>
        </td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { type QTableColumn } from 'quasar'
import { useCustomerStore } from 'src/stores/customerStore'
import type { Customer } from 'src/models'
import CustomerFormDialog from 'src/components/CustomerComponent/CustomerFormDialog.vue'
// import PosCustomerSearch from 'components/CustomerComponent/PosCustomerSearch.vue'

const dialog = ref(false)

const columns: QTableColumn[] = [
  { name: 'id', label: 'ID', field: 'id', align: 'center', sortable: true },
  { name: 'imageUrl', label: 'รูปภาพ', field: 'imageUrl', align: 'center' },
  { name: 'name', label: 'ชื่อ', field: 'name', align: 'center' },
  { name: 'surname', label: 'นามสกุล', field: 'surname', align: 'center' },
  { name: 'birthDate', label: 'วันเกิด', field: 'birthDate', align: 'center' },
  { name: 'phoneNumber', label: 'เบอร์โทรศัพท์', field: 'phoneNumber', align: 'center' },
  { name: 'age', label: 'อายุ', field: 'age', align: 'center' },
  { name: 'gender', label: 'เพศ', field: 'gender', align: 'center' },
  { name: 'point', label: 'คะแนน', field: 'point', align: 'center' },
  { name: 'operation', label: 'Operation', field: 'operation', align: 'center' },
]

function openDialog() {
  customerStore.form = {
    id: 0,
    name: '',
    surname: '',
    phoneNumber: '',
    birthDate: '',
    age: 10,
    gender: 'male',
    point: 0,
    imageUrl: '',
  }
  dialog.value = true
}

async function handleSave(customer: Customer, file: File | null) {
  try {
    if (customer.id === 0) {
      await customerStore.addCustomer(customer, file)
    } else {
      await customerStore.updateCustomer(customer, file)
    }
    dialog.value = false
  } catch (error) {
    console.error('Error saving customer:', error)
  }
}

const rangeAge = ref({
  min: 10, // ค่าเริ่มต้น
  max: 120,
})

const filterGender = ref<'male' | 'female' | null>(null) // สำหรับการกรองเพศ
const customerStore = useCustomerStore()
const id = ref(0)

const imageUrl = ref<string>('')
const search = ref('')
const pagination = ref({
  sortBy: 'id',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
})
const updateAgeLabel = () => {
  console.log('Current Age:', rangeAge.value)
}
const genderOptions = ref<{ label: string; value: 'male' | 'female' | null }[]>([
  { label: 'ชาย', value: 'male' },
  { label: 'หญิง', value: 'female' },
  { label: 'ทั้งหมด', value: null },
])

const filteredData = computed(() => {
  let result = customerStore.customers

  // กรองตามชื่อถ้ามีการค้นหา
  if (search.value) {
    result = result.filter((customer) =>
      `${customer.phoneNumber} ${customer.phoneNumber}`
        .toLowerCase()
        .includes(search.value.toLowerCase())
    )
  }

  // กรองตามเพศถ้ามีการเลือก
  if (filterGender.value !== null) {
    result = result.filter((customer) => customer.gender === filterGender.value)
  }

  // กรองตามช่วงอายุ
  result = result.filter((customer) => {
    return customer.age >= rangeAge.value.min && customer.age <= rangeAge.value.max
  })

  // เรียงลำดับผลลัพธ์
  return result.sort((a, b) => b.id - a.id)
})

const filteredCustomers = computed(() => {
  const startIndex = (pagination.value.page - 1) * pagination.value.rowsPerPage
  const endIndex = startIndex + pagination.value.rowsPerPage
  return filteredData.value.slice(startIndex, endIndex)
})

watch(
  filteredData,
  (data) => {
    pagination.value.rowsNumber = data.length
  },
  { immediate: true }
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function onRequest(props: any) {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending
}

watch(search, () => {
  pagination.value.page = 1
})
watch(customerStore.form, () => {
  console.log(customerStore.form)
})
onMounted(async () => {
  await customerStore.getCustomers()
  console.log('After update:', customerStore.form)
  pagination.value.rowsNumber = customerStore.customers.length
})

// const form = ref<QForm | null>(null)
const file = ref<File | null>(null)
// const formData = ref<Customer>({
//   id: 0,
//   name: '',
//   surname: '',
//   phoneNumber: '',
//   birthDate: '',
//   age: 10,
//   gender: 'male',
//   point: 0,
//   imageUrl: '',
// })

// const previewImage = computed(() => {
//   return file.value
//     ? URL.createObjectURL(file.value)
//     : formData.value.imageUrl
//       ? 'http://localhost:3000' + formData.value.imageUrl
//       : null
// })

// const isEdit = computed(() => formData.value.id !== 0)

// async function onSubmit() {
//   await form.value?.validate()
//   await handleSave(formData.value, file.value)
// }

// function onReset() {
//   form.value?.resetValidation()
//   dialog.value = false
// }

// ฟังก์ชัน edit
function edit(row: Customer) {
  console.log('Editing customer:', row)
  customerStore.form = { ...row } // คัดลอกข้อมูลจาก row ไปที่ form
  imageUrl.value = row.imageUrl || ''
  file.value = null
  id.value = row.id // ตั้งค่า id ตามข้อมูลที่เลือก
  dialog.value = true // เปิด dialog
}

// ฟังก์ชัน onSubmit
// function onSubmit() {
//   loading.value = true
//   form.value?.validate().then(async (success) => {
//     if (success) {
//       try {
//         // สร้างออบเจ็กต์ลูกค้าพร้อมข้อมูลที่จำเป็นทั้งหมด
//         const customerToSave: Customer = {
//           id: id.value,
//           name: name.value,
//           surname: surname.value,
//           phoneNumber: phoneNumber.value,
//           birthDate: birthDate.value || '',
//           age: age.value,
//           gender: gender.value,
//           point: point.value,
//           imageUrl: imageUrl.value, // เก็บ URL รูปภาพเดิมไว้หากไม่มีการเลือกไฟล์ใหม่
//         }

//         // บันทึกข้อมูลที่กำลังส่งเพื่อช่วยในการดีบัก
//         // console.log('Saving customer:', customerToSave, 'File:', file.value)

//         if (id.value === 0) {
//           await customerStore.addCustomer(customerToSave, file.value)
//         } else {
//           await customerStore.updateCustomer(customerToSave, file.value)
//         }

//         dialog.value = false
//         onReset()
//       } catch (error) {
//         console.error('Error saving customer:', error)
//       } finally {
//         loading.value = false
//       }
//     } else {
//       loading.value = false
//     }
//   })
// }

function remove(row: Customer) {
  customerStore.delCustomer(row)
}
</script>

<style scoped>
.customer-page {
  background-color: #faf3e0;
  font-family: 'Mali';
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-top: 20px;
}
.search-box {
  height: 40px;
  font-size: 15px;
  width: 44%;
}
.header-row {
  display: flex;
  align-items: center;
  /* justify-content: space-between; */
  gap: 10px;
  background-color: transparent;
  padding-bottom: 22px;
}
.filter-btn {
  background-color: rgb(141, 110, 99, 0.25);
  width: 130px;
  height: 40px;
  border-radius: 15px;
  font-family: 'Nunito', sans-serif;
  font-weight: bold;
  align-items: center;
}
.addCuscut-btn {
  background-color: rgb(141, 110, 99, 0.25);
  color: #3e2726;
  font-weight: bold;
  width: 200px;
  height: 50px;
  margin-left: 20px;
  border-radius: 15px;
  align-items: center;
}
.data-table {
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  color: #3e2726;
}
</style>
