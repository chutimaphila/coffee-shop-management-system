<template>
  <q-page padding class="branch-page">
    <!-- ปุ่มเพิ่มสาขา -->
    <div class="row justify-end q-mt-md">
      <q-btn icon="add" flat @click="dialog = true" />
    </div>

    <q-input filled v-model="search" label="ค้นหาสาขา" debounce="300" clearable class="q-mb-md" />

    <!-- Dialog เพิ่ม/แก้ไขสาขา -->
    <q-dialog v-model="dialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ id === 0 ? 'เพิ่มสาขาใหม่' : 'แก้ไขสาขา' }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-form ref="form" @submit="onSubmit" @reset="onReset" class="q-gutter-md">
            <q-input filled v-model="name" label="ชื่อสาขา" :rules="[(val) => !!val || 'จำเป็น']" />
            <q-input filled v-model="district" label="ที่อยู่" />
            <q-input filled v-model="contactNumber" label="เบอร์ติดต่อ" />
            <q-toggle v-model="status" label="เปิดให้บริการ" />
            <q-input
              filled
              v-model="latitude"
              label="ละติจูด"
              :rules="[(val) => !!val || 'จำเป็น']"
            />
            <q-input
              filled
              v-model="longitude"
              label="ลองจิจูด"
              :rules="[(val) => !!val || 'จำเป็น']"
            />
            <q-input filled v-model="radius" label="รัศมี" :rules="[(val) => !!val || 'จำเป็น']" />

            <div>
              <q-btn label="บันทึก" type="submit" color="primary" />
              <q-btn label="ยกเลิก" type="reset" flat class="q-ml-sm" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- ตารางแสดงสาขา -->
    <q-table
      :columns="columns"
      :rows="filteredBranches"
      :rows-per-page-options="[5, 10, 15]"
      v-model:pagination="pagination"
    >
      <template v-slot:body-cell-operation="{ row }">
        <q-td>
          <q-btn flat icon="edit" @click="edit(row)" />
          <q-btn flat icon="delete" @click="remove(row)" />
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBranchStore } from 'src/stores/branchStore'
import type { Branch } from 'src/models'
import { type QForm, type QTableColumn } from 'quasar'

const dialog = ref(false)
const form = ref<QForm | null>(null)

const id = ref(0)
const name = ref('')
const district = ref('')
const contactNumber = ref('')
const status = ref(true)
const latitude = ref('')
const longitude = ref('')
const radius = ref('')

const search = ref('')
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
})

const branchStore = useBranchStore()

const columns: QTableColumn[] = [
  { name: 'id', label: 'ID', field: 'id', align: 'center' },
  { name: 'name', label: 'ชื่อสาขา', field: 'name', align: 'center' },
  { name: 'district', label: 'ที่อยู่', field: 'district', align: 'center' },
  { name: 'contactNumber', label: 'เบอร์ติดต่อ', field: 'contactNumber', align: 'center' },
  { name: 'status', label: 'สถานะ', field: 'status', align: 'center' },
  { name: 'latitude', label: 'ละติจูด', field: 'latitude', align: 'center' },
  { name: 'longitude', label: 'ลองจิจูด', field: 'longitude', align: 'center' },
  { name: 'radius', label: 'รัศมี', field: 'radius', align: 'center' },
  { name: 'operation', label: 'จัดการ', field: 'operation', align: 'center' },
]

const filteredBranches = computed(() => {
  const filtered = search.value
    ? branchStore.branches.filter((b) => b.name.toLowerCase().includes(search.value.toLowerCase()))
    : branchStore.branches

  // eslint-disable-next-line vue/no-side-effects-in-computed-properties
  pagination.value.rowsNumber = filtered.length
  const start = (pagination.value.page - 1) * pagination.value.rowsPerPage
  return filtered.slice(start, start + pagination.value.rowsPerPage)
})

onMounted(async () => {
  await branchStore.getBranches()
})

function onSubmit() {
  form.value?.validate().then(async (valid) => {
    if (valid) {
      const data: Branch = {
        id: id.value,
        name: name.value,
        district: district.value,
        contactNumber: contactNumber.value,
        status: status.value,
        latitude: latitude.value,
        longitude: longitude.value,
        radius: radius.value,
      }

      if (id.value === 0) {
        await branchStore.addBranch(data)
      } else {
        await branchStore.updateBranch(data)
      }

      dialog.value = false
      onReset()
    }
  })
}

function onReset() {
  form.value?.resetValidation()
  id.value = 0
  name.value = ''
  district.value = ''
  contactNumber.value = ''
  status.value = true
  latitude.value = ''
  longitude.value = ''
  radius.value = ''
  dialog.value = false
}

function edit(row: Branch) {
  id.value = row.id
  name.value = row.name
  district.value = row.district
  contactNumber.value = row.contactNumber
  status.value = row.status
  latitude.value = row.latitude.toString()
  longitude.value = row.longitude.toString()
  radius.value = row.radius.toString()
  dialog.value = true
}

function remove(row: Branch) {
  branchStore.delBranch(row.id)
}
</script>

<style scoped>
.branch-page {
  background-color: #f0f8ff;
  font-family: 'Mali', sans-serif;
  min-height: 100vh;
  padding-top: 20px;
}
</style>
