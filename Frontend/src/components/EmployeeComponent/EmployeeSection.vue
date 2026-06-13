<template>
  <div>
    <!-- หน้าหลัก -->
    <div class="section-header q-mb-md">
      <h4 class="q-ma-none">รายชื่อพนักงาน</h4>
    </div>
    <div class="header-row">
      <q-input filled v-model="search" label="ค้นหา..." class="search-box" dense>
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
      <q-select
        filled
        v-model="filterBranch"
        :options="['ทั้งหมด', ...branchOptions.map((branch) => branch.label)]"
        label="Filter"
        class="q-mb-md"
        style="width: 200px"
      />
      <div class="btn-group">
        <q-btn dense class="add-btn" icon-right="fa-solid fa-plus" @click="openAddEmpDialog">
          เพิ่มพนักงาน</q-btn
        >
      </div>
    </div>
    <!-- ตาราง -->
    <div>
      <q-table
        :columns="columns"
        :rows="filteredEmp"
        :rows-per-page="pagination.rowsPerPage"
        :rows-per-page-options="[5, 10, 15]"
        class="data-table"
      >
        <template v-slot:body-cell-operation="{ row }">
          <q-td>
            <div class="full-width flex flex-center">
              <q-btn flat icon="edit" @click="edit(row)" />
              <q-btn flat icon="delete" @click="openDeleteDialog(row)" />
            </div>
          </q-td>
        </template>
        <template v-slot:body-cell-imageUrl="{ row }">
          <q-td>
            <q-img
              :src="'http://localhost:3000' + row.imageUrl"
              style="width: 60px; height: 60px; border-radius: 6px"
            />
          </q-td>
        </template>
        <template v-slot:body-cell-branch="{ row }">
          <q-td>
            {{ row.branch?.name || '-' }}
          </q-td>
        </template>
      </q-table>
    </div>
    <!-- Dailog -->
    <q-dialog v-model="isDialogOpen" persistent>
      <q-card style="min-width: 500px">
        <q-form @submit.prevent="saveEmployee" ref="employeeForm">
          <q-card-section>
            <div class="text-h6">
              {{ isEditMode ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มพนักงานใหม่' }}
            </div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <!-- ชื่อ-นามสกุล -->
            <q-input
              filled
              v-model="formData.name"
              label="ชื่อ"
              :rules="[(val) => !!val || 'กรุณากรอกชื่อ']"
            />
            <q-input
              filled
              v-model="formData.surname"
              label="นามสกุล"
              :rules="[(val) => !!val || 'กรุณากรอกนามสกุล']"
            />

            <!-- สาขา -->
            <q-select
              label="สาขา"
              v-model="formData.branch_id"
              :options="[
                { label: 'สาขา 1', value: 1 },
                { label: 'สาขา 2', value: 2 },
              ]"
              emit-value
              map-options
            />
            <q-select
              filled
              v-model="formData.user_id"
              :options="userOptions"
              option-label="label"
              option-value="value"
              label="รหัสผู้ใช้"
              emit-value
              map-options
            />

            <!-- อายุ -->
            <q-input
              filled
              v-model.number="formData.age"
              type="number"
              label="อายุ"
              :rules="[(val) => val >= 15 || 'อายุขั้นต่ำคือ 15 ปี']"
            />

            <!-- เพศ -->
            <q-option-group
              v-model="formData.gender"
              :options="[
                { label: 'ชาย', value: 'ชาย' },
                { label: 'หญิง', value: 'หญิง' },
                { label: 'อื่นๆ', value: 'อื่นๆ' },
              ]"
              label="เพศ"
              type="radio"
              color="brown"
            />

            <!-- เบอร์โทร -->
            <q-input
              filled
              v-model="formData.phone_number"
              label="เบอร์โทร"
              mask="###-###-####"
              :rules="[(val) => !!val || 'กรุณากรอกเบอร์โทร']"
            />

            <!-- ตำแหน่ง -->
            <q-select
              filled
              v-model="formData.position"
              :options="['ผู้จัดการ', 'พนักงานชงกาแฟ', 'แคชเชียร์', 'พนักงานครัว', 'พนักงานเสิร์ฟ']"
              label="ตำแหน่ง"
              emit-value
              map-options
            />

            <!-- ประเภทการจ้าง -->
            <q-select
              filled
              v-model="formData.employment_type"
              :options="['รายเดือน', 'รายวัน']"
              label="ประเภทการจ้าง"
              emit-value
              map-options
            />

            <!-- สถานะการทำงาน -->
            <q-toggle v-model="formData.is_active" label="ยังทำงานอยู่" color="green" />

            <!-- รูปโปรไฟล์ -->
            <q-file
              v-model="formData.file"
              label="เลือกรูปพนักงาน"
              accept="image/*"
              filled
              class="q-mt-sm"
              @change="onImageSelected"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>
            <q-img
              v-if="previewImage || formData.imageUrl"
              :src="previewImage || 'http://localhost:3000' + formData.imageUrl"
              style="width: 60px; height: 60px; border-radius: 6px"
            />
          </q-card-section>
          <q-card-actions class="justify-center">
            <q-btn
              flat
              class="addProdcut-btn q-mx-sm"
              label="ยกเลิก"
              color="primary"
              v-close-popup
            />
            <q-btn
              flat
              class="addProdcut-btn q-mx-sm"
              label="บันทึก"
              color="primary"
              type="submit"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
  <!-- dialog ยืนยันการลบข้อมูล -->
  <q-dialog v-model="isDeleteDialogOpen" persistent>
    <q-card
      style="min-width: 400px; min-height: 200px"
      class="column items-center justify-center q-pa-md"
    >
      <q-card-section class="text-center">
        <div class="text-h6 q-mb-sm">คุณแน่ใจว่าจะลบใช่หรือไม่?</div>
        <div class="text-h6 text-weight-bold">{{ deleteEmployeeName }}</div>
      </q-card-section>

      <q-card-actions class="justify-center">
        <q-btn flat class="addProdcut-btn q-mx-sm" label="ยกเลิก" color="primary" v-close-popup />
        <q-btn
          flat
          class="addProdcut-btn q-mx-sm"
          label="ลบ"
          color="negative"
          @click="confirmDelete"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { Notify, type QForm, type QTableColumn } from 'quasar'
import type { Employee } from 'src/models'
import { useBranchStore } from 'src/stores/branchStore'
import { useEmployeeStore } from 'src/stores/empStore'
import { useUserStore } from 'src/stores/userStore'
import { computed, onMounted, ref } from 'vue'

const search = ref('')
const empStore = useEmployeeStore()
const branchStore = useBranchStore()
const userStore = useUserStore()
const isDialogOpen = ref(false)
const isEditMode = ref(false)
const employeeToDelete = ref<Employee | null>(null)

const branchOptions = computed(() => {
  return branchStore.branches.map((brn) => ({
    label: brn.name,
    value: brn.id,
  }))
})
const userOptions = computed(() => {
  return userStore.users.map((u) => ({
    label: u.name,
    value: u.id,
  }))
})
const formData = ref({
  name: '',
  surname: '',
  age: 0,
  gender: 'ชาย',
  phone_number: '',
  position: 'ผู้จัดการ',
  employment_type: 'รายเดือน',
  is_active: true,
  imageUrl: '',
  user_id: 0,
  branch_id: 0,
  file: null,
})
const pagination = ref({
  sortBy: 'id',
  descending: true,
  page: 1,
  rowsPerPage: 5,
  rowsNumber: 0,
})
const columns: QTableColumn[] = [
  { name: 'id', label: 'ID', field: 'id', align: 'center', sortable: true },
  {
    name: 'imageUrl',
    label: 'รูปภาพ',
    field: (row) => row.imageUrl || '',
    align: 'center',
  },
  { name: 'name', label: 'ชื่อ', align: 'center', field: 'name' },
  { name: 'surname', label: 'นามสกุล', align: 'center', field: 'surname' },
  { name: 'is_active', label: 'สถานะการทำงาน', align: 'center', field: 'is_active' },
  { name: 'age', label: 'อายุ', align: 'center', field: 'age' },
  { name: 'gender', label: 'เพศ', align: 'center', field: 'gender' },
  { name: 'phone_number', label: 'เบอร์', align: 'center', field: 'phone_number' },
  {
    name: 'branch',
    label: 'สาขา',
    field: (row) => row.branch?.name ?? '-',
    align: 'center',
  },
  { name: 'employment_type', label: 'ประเภท', align: 'center', field: 'employment_type' },
  { name: 'position', label: 'ตำแหน่ง', align: 'center', field: 'position' },
  {
    name: 'operation',
    label: 'การจัดการ',
    align: 'center',
    field: (row) => row.id,
  },
]

const filterBranch = ref('')
const filteredEmp = computed(() => {
  let filtered = empStore.employees
  if (search.value) {
    filtered = filtered.filter((e) => e.name.toLowerCase().includes(search.value.toLowerCase()))
  }
  if (filterBranch.value && filterBranch.value !== 'ทั้งหมด') {
    filtered = filtered.filter((e) => e.branch?.name === filterBranch.value)
  }
  return filtered
})
onMounted(async () => {
  await empStore.getEmps()
  await branchStore.getBranches()
  await userStore.getUsers()
  pagination.value.rowsPerPage = empStore.employees.length
  pagination.value.rowsNumber = empStore.employees.length
})

function openAddEmpDialog() {
  resetForm()
  isEditMode.value = false
  isDialogOpen.value = true
}

function resetForm() {
  formData.value = {
    name: '',
    surname: '',
    age: 0,
    gender: 'ชาย',
    phone_number: '',
    position: 'ผู้จัดการ',
    employment_type: 'รายเดือน',
    is_active: true,
    imageUrl: '',
    user_id: 0,
    branch_id: 0,
    file: null,
  }
}

const previewImage = ref('')

const onImageSelected = (file: File) => {
  const reader = new FileReader()
  reader.onload = () => {
    previewImage.value = reader.result as string
  }
  reader.readAsDataURL(file)
}
function edit(row: Employee) {
  formData.value = {
    ...row,
    imageUrl: row.imageUrl || '',
    user_id: row.user?.id ?? 1,
    branch_id: row.branch?.id ?? 1,
    file: null,
  }
  isEditMode.value = true
  isDialogOpen.value = true
}

const employeeForm = ref()

async function saveEmployee() {
  // ตรวจสอบความถูกต้องของฟอร์ม
  const valid = await employeeForm.value?.validate()
  if (!valid) {
    Notify.create({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน', color: 'negative' })
    return
  }

  // ตรวจสอบว่ามีการเลือกผู้ใช้และสาขาหรือไม่
  if (!formData.value.user_id || !formData.value.branch_id) {
    Notify.create({ message: 'กรุณาเลือกผู้ใช้และสาขา', color: 'negative' })
    return
  }

  try {
    if (isEditMode.value) {
      // แก้ไขข้อมูลพนักงาน
      await empStore.updateEmployee({ ...formData.value } as Employee, formData.value.file ?? null)
      Notify.create({
        message: 'แก้ไขข้อมูลสำเร็จ',
        color: 'green',
        icon: 'check',
        position: 'top',
      })
    } else {
      // เพิ่มพนักงานใหม่
      await empStore.addEmployee({ ...formData.value } as Employee, formData.value.file ?? null)
      Notify.create({
        message: 'เพิ่มข้อมูลสำเร็จ',
        color: 'green',
        icon: 'check',
        position: 'top',
      })
    }
    isDialogOpen.value = false
    resetForm()
    await empStore.getEmps()
  } catch (error) {
    console.error('❌ saveEmployee error:', error)
    Notify.create({
      message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
      color: 'negative',
      icon: 'report_problem',
      position: 'top',
    })
  }
}
// async function saveEmployee() {
//   await empStore.addEmployee({ ...formData.value }, ) // Pass the file as the second argument
//   isDialogOpen.value = false
//   resetForm()
//   empStore.fetchEmployees()
// }

const deleteEmployeeName = ref('')
const isDeleteDialogOpen = ref(false)

function openDeleteDialog(employee: Employee) {
  deleteEmployeeName.value = employee.name
  employeeToDelete.value = employee
  isDeleteDialogOpen.value = true
}
function confirmDelete() {
  if (employeeToDelete.value) {
    empStore.delEmployee(employeeToDelete.value)
    isDeleteDialogOpen.value = false
  }
}

// function remove(row: Employee) {
//   empStore.delEmployee(row)
// }
</script>

<style scoped>
.header-row {
  display: flex;
  align-items: center;
  /* justify-content: space-between; */
  gap: 10px;
  background-color: transparent;
  padding-bottom: 22px;
}
.title {
  font-size: 15px;
  font-weight: bold;
  color: #3e2726;
  margin-right: 10px;
}
.search-box {
  height: 40px;
  font-size: 15px;
  width: 30%;
}
.filter-btn {
  width: 150px;
  font-weight: bold;
  align-items: center;
}
.btn-group {
  align-items: center;
  justify-content: center;
  margin-left: auto;
  display: flex;
  gap: 10px;
}
.add-btn {
  background-color: #8d6e63;
  color: #faf3e0;
  font-weight: bold;
  width: 150px;
  height: 40px;
  margin-left: 20px;
  border-radius: 15px;
  align-items: center;
}
.data-table {
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  color: #3e2726;
}
.section-header {
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  padding: 16px;
  color: #3e2726;
}
</style>
