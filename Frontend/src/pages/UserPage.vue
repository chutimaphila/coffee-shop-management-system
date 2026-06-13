<template>
  <q-page padding class="user-page">
    <!-- ปุ่มเพิ่ม User -->

    <p class="text-h6">รายการผู้ใช้งาน</p>
    <div class="row q-mt-md q-col-gutter-md">
      <div class="col-18 col-md-4">
        <q-input
          filled
          v-model="search"
          label="ค้นหาด้วยชื่อผู้ใช้งาน"
          class="search-box"
          debounce="300"
          dense
        />
      </div>
      <div class="col-12 col-md-3">
        <!-- q-select สำหรับ filter role -->
        <q-select
          filled
          v-model="filterRole"
          :options="roleOptions"
          option-value="value"
          option-label="label"
          label="กรองโดยตำแหน่ง"
          emit-value
          map-options
          clearable
          dense
        />
      </div>
      <div class="col-12 col-md">
        <!-- เพิ่ม q-select สำหรับ filter branch -->
        <q-select
          filled
          v-model="filterBranch"
          :options="branchOptions"
          option-value="value"
          option-label="label"
          label="กรองโดยสาขา"
          emit-value
          map-options
          clearable
          dense
        />
      </div>
      <div class="col-12 col-md flex justify-end flex-Right">
        <q-btn
          icon="fa-solid fa-user-pen"
          label="จัดการตำแหน่ง"
          color="primary"
          class="addCuscut-btn"
          @click="showRoleDialog = true"
          dense
        />
        <RoleDialog v-model="showRoleDialog" />
      </div>
      <div class="col-12 col-md flex flex-Right">
        <q-btn
          icon="add"
          class="addCuscut-btn"
          label="เพิ่มผู้ใช้งาน"
          color="primary"
          @click="openDialog"
          dense
        />
      </div>
    </div>

    <!-- Dialog เพิ่ม/แก้ไข User -->
    <q-dialog v-model="dialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ id === 0 ? 'Add New User' : 'Edit User' }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-form ref="form" @submit="onSubmit" @reset="onReset" class="q-gutter-md">
            <q-input
              filled
              v-model="name"
              label="First Name"
              hint="Enter first name"
              lazy-rules
              :rules="[(val) => !!val || 'Required']"
            />
            <q-input
              filled
              v-model="surname"
              label="Last Name"
              hint="Enter last name"
              lazy-rules
              :rules="[(val) => !!val || 'Required']"
            />
            <q-input
              filled
              v-model="email"
              label="Email *"
              hint="example@email.com"
              lazy-rules
              :rules="[
                (val) => !!val || 'Required',
                (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Invalid email',
              ]"
            />
            <q-input
              filled
              type="password"
              v-model="password"
              label="Password"
              hint="Enter password"
              lazy-rules
              :rules="[
                (val) => !!val || 'Required',
                (val) => /[A-Z]/.test(val) || 'Password must contain at least one uppercase letter',
                (val) => /\d/.test(val) || 'Password must contain at least one number',
                (val) =>
                  /[\W_]/.test(val) || 'Password must contain at least one special character',
                (val) => (val && val.length >= 8) || 'Password must be at least 8 characters long',
              ]"
            />
            <q-input
              filled
              v-model.number="age"
              label="Your Age"
              type="number"
              hint="Enter age"
              lazy-rules
              :rules="[(val) => val >= 10 || 'Must be at least 10 years old']"
            />

            <q-img
              v-if="previewImage"
              :src="previewImage"
              style="width: 150px; height: 150px; border-radius: 8px"
            />

            <!-- เลือก Role -->
            <div class="q-gutter-sm">
              <p v-if="roleOptions.length === 0">ไม่พบ Role ที่สามารถเลือกได้</p>
              <div v-else>
                <p>เลือก Role:</p>
                <div v-for="role in roleOptions" :key="role.value">
                  <q-radio
                    v-model="selectedRole"
                    :label="role.label"
                    :val="role.value"
                    color="brown"
                  />
                </div>
                <div class="text-caption q-mt-sm">Role ที่เลือก: {{ selectedRoleLabel }}</div>
              </div>
            </div>
            <!-- Change the branch selection from q-select to q-radio buttons -->
            <div class="q-gutter-sm">
              <p>เลือก Branch:</p>
              <div v-if="branchOptions.length === 0">
                <p>ไม่มี Branch ให้เลือก</p>
              </div>
              <div v-else>
                <div v-for="branch in branchOptions" :key="branch.value">
                  <q-radio
                    v-model="selectedBranch"
                    :label="branch.label"
                    :val="branch.value"
                    color="brown"
                  />
                </div>
                <div class="text-caption q-mt-sm">Branch ที่เลือก: {{ selectedBranchLabel }}</div>
              </div>
            </div>
            <div class="q-gutter-sm">
              <q-radio v-model="gender" label="Male" val="male" color="brown" />
              <q-radio v-model="gender" label="Female" val="female" color="brown" />
            </div>
            <div class="q-gutter-xs">
              <q-file outlined v-model="file" accept="image/*" label="Upload Image">
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
              </q-file>
              <q-btn label="Submit" type="submit" color="primary" />
              <q-btn
                label="Cancel"
                type="reset"
                color="primary"
                flat
                class="q-ml-sm"
                @click="onReset"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- ตาราง User -->
    <q-table
      class="data-table"
      :columns="columns"
      :rows="filteredUsers"
      v-model:pagination="pagination"
      :rows-per-page-options="[5, 10, 15]"
      @request="onRequest"
    >
      <template v-slot:body-cell-operation="{ row }">
        <q-td>
          <div class="full-width flex flex-center">
            <q-btn flat icon="edit" @click="edit(row)"></q-btn>
            <q-btn flat icon="delete" @click="remove(row)"></q-btn>
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-roles="{ row }">
        <q-td>
          <div class="full-width flex flex-center">
            <q-chip v-if="row.role" :key="row.role" color="primary" text-color="white">
              {{ getRoleName(row.role) }}
            </q-chip>
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-branch="{ row }">
        <q-td>
          <div class="full-width flex flex-center">
            <q-chip v-if="row.branch" :key="row.branch.id" color="primary" text-color="white">
              {{ getBranchName(row.branch) }}
            </q-chip>
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-imageUrl="{ row }">
        <q-td>
          <q-img :src="'http://localhost:3000' + row.imageUrl"></q-img>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Notify, type QForm, type QTableColumn } from 'quasar'
import { useUserStore } from 'src/stores/userStore'
import axios from 'axios'
import type { User } from 'src/models'
import RoleDialog from 'src/components/RoleComponent/RoleDialog.vue'

declare const URL: typeof globalThis.URL

// State variables
const showRoleDialog = ref(false)
const dialog = ref(false)
const form = ref<QForm | null>(null)
const id = ref(0)
const name = ref('')
const surname = ref('')
const email = ref('')
const password = ref('')
const age = ref<number>(10)
const selectedRole = ref<number | null>(null)
const file = ref<File | null>(null)
const gender = ref<'male' | 'female'>('male')
const imageUrl = ref<string | null>(null)
const search = ref('')
const filterRole = ref<number | null>(null) // ตัวแปรสำหรับการกรอง role
const filterBranch = ref<number | null>(null) // เพิ่มตัวแปรสำหรับการกรอง branch
const pagination = ref({
  sortBy: 'id',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
})
// const roleDialogVisible = ref(false)

// การรับ event เมื่อ role ถูกเพิ่ม
// function onRoleAdded(newRole: { id: number; name: string }) {
//   roleOptions.value.push({
//     label: newRole.name,
//     value: newRole.id,
//   })
//   roleDialogVisible.value = false
// }

const roleOptions = ref<{ label: string; value: number }[]>([])

const defaultRoles = [
  { label: 'Owner', value: 1 },
  { label: 'Admin', value: 2 },
  { label: 'User', value: 3 },
]

// Columns for q-table
const columns: QTableColumn[] = [
  { name: 'id', label: 'ID', field: 'id', align: 'center', sortable: true },
  { name: 'imageUrl', label: 'รูปภาพ', field: 'imageUrl', align: 'center' },
  { name: 'name', label: 'ชื่อ', field: 'name', align: 'center' },
  { name: 'surname', label: 'นามสกุล', field: 'surname', align: 'center' },
  { name: 'email', label: 'อีเมล', field: 'email', align: 'center' },
  // { name: 'age', label: 'อายุ', field: 'age', align: 'center' },
  // { name: 'gender', label: 'เพศ', field: 'gender', align: 'center' },
  { name: 'roles', label: 'ตำแหน่ง', field: 'roles', align: 'center' },
  { name: 'branch', label: 'สาขา', field: 'branch', align: 'center' },
  { name: 'operation', label: 'Operation', field: 'operation', align: 'center' },
]

// User store
const userStore = useUserStore()

// ตัวเลือก Branch สำหรับ q-select
const branchOptions = ref<{ label: string; value: number }[]>([])

// Computed properties
const previewImage = computed(() => {
  if (file.value) return URL.createObjectURL(file.value)
  return imageUrl.value ? `http://localhost:3000${imageUrl.value}` : null
})

const selectedBranch = ref<number | null>(null)

// Computed property to get the selected branch label
const selectedBranchLabel = computed(() => {
  const branch = branchOptions.value.find((b) => b.value === selectedBranch.value)
  return branch ? branch.label : 'No branch selected'
})
// Compute the selected role label
const selectedRoleLabel = computed(() => {
  const role = roleOptions.value.find((r) => r.value === selectedRole.value)
  return role ? role.label : 'No role selected'
})

// Helper function to get role name from role ID or object
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getRoleName(role: any): string {
  if (!role) return 'No role'

  // ถ้า role เป็น object และมี id
  if (typeof role === 'object' && role !== null && 'id' in role) {
    const roleOption = roleOptions.value.find((r) => r.value === role.id)
    return roleOption?.label || 'Unknown role'
  }

  // ถ้า role เป็น number (ID)
  if (typeof role === 'number') {
    const roleOption = roleOptions.value.find((r) => r.value === role)
    return roleOption?.label || 'Unknown role'
  }

  return 'Unknown role format'
}

// Helper function to get branch name from branch object
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getBranchName(branch: any): string {
  if (!branch) return 'No branch'

  // ถ้า branch เป็น object และมี id และ name
  if (typeof branch === 'object' && branch !== null) {
    if ('name' in branch) {
      return branch.name
    }
    if ('id' in branch) {
      const branchOption = branchOptions.value.find((b) => b.value === branch.id)
      return branchOption?.label || 'Unknown branch'
    }
  }

  // ถ้า branch เป็น number (ID)
  if (typeof branch === 'number') {
    const branchOption = branchOptions.value.find((b) => b.value === branch)
    return branchOption?.label || 'Unknown branch'
  }

  return 'Unknown branch format'
}

const filteredData = computed(() => {
  return userStore.users.filter((user) => {
    const fullName = `${user.name} ${user.surname}`.toLowerCase()
    const nameMatch = fullName.includes(search.value.toLowerCase())

    // ปรับปรุงการกรอง branch
    let branchMatch = true
    if (filterBranch.value !== null) {
      if (user.branch && typeof user.branch === 'object' && 'id' in user.branch) {
        branchMatch = user.branch.id === filterBranch.value
      } else {
        branchMatch = false
      }
    }

    // การกรอง role
    let roleMatch = true
    if (filterRole.value !== null) {
      if (typeof user.role === 'object' && user.role !== null && 'id' in user.role) {
        roleMatch = user.role.id === filterRole.value
      } else if (typeof user.role === 'number') {
        roleMatch = user.role === filterRole.value
      } else {
        roleMatch = false
      }
    }

    return nameMatch && branchMatch && roleMatch
  })
})

const filteredUsers = computed(() => {
  const startIndex = (pagination.value.page - 1) * pagination.value.rowsPerPage
  const endIndex = startIndex + pagination.value.rowsPerPage
  return filteredData.value.slice(startIndex, endIndex)
})

// Watchers
watch(
  filteredData,
  (data) => {
    pagination.value.rowsNumber = data.length
  },
  { immediate: true },
)

watch(search, () => {
  pagination.value.page = 1
})

// watcher สำหรับ filterRole
watch(filterRole, () => {
  pagination.value.page = 1
})

// เพิ่ม watcher สำหรับ filterBranch
watch(filterBranch, () => {
  pagination.value.page = 1
})

onMounted(async () => {
  await userStore.getUsers()
  pagination.value.rowsNumber = userStore.users.length
  await loadRoles()
  await loadBranches()
})

async function loadBranches() {
  try {
    const response = await axios.get('http://localhost:3000/branches')
    const data = response.data
    if (data && data.length > 0) {
      branchOptions.value = data.map((branch: { id: number; name: string }) => ({
        label: branch.name,
        value: branch.id,
      }))
    } else {
      branchOptions.value = [{ label: 'No branches available', value: 0 }]
    }
  } catch (error) {
    console.error('Error loading branches:', error)
    branchOptions.value = [{ label: 'No branches available', value: 0 }]
  }
}

// Methods
async function loadRoles() {
  try {
    const response = await axios.get('http://localhost:3000/roles')
    const data = response.data
    if (data && data.length > 0) {
      roleOptions.value = data.map((role: { id: number; name: string }) => ({
        label: role.name,
        value: role.id,
      }))
    } else {
      roleOptions.value = defaultRoles
    }
  } catch (error) {
    console.error('Error loading roles:', error)
    roleOptions.value = defaultRoles
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function onRequest(props: any) {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending
}

function edit(row: User) {
  id.value = row.id ?? 0
  name.value = row.name
  surname.value = row.surname
  email.value = row.email
  password.value = row.password

  // การเลือก Role
  if (row.role) {
    if (typeof row.role === 'object' && row.role !== null && 'id' in row.role) {
      selectedRole.value = row.role.id
    } else if (typeof row.role === 'number') {
      selectedRole.value = row.role
    } else {
      selectedRole.value = null
    }
  } else {
    selectedRole.value = null
  }

  // การเลือก Branch
  if (row.branch && typeof row.branch === 'object' && 'id' in row.branch) {
    selectedBranch.value = row.branch.id
  } else {
    selectedBranch.value = null
  }

  age.value = row.age
  gender.value = row.gender || 'male'
  imageUrl.value = row.imageUrl || ''
  dialog.value = true
}

function openDialog() {
  dialog.value = true
}

async function onSubmit() {
  form.value?.validate().then(async (success) => {
    if (success) {
      const userToSave = {
        id: id.value,
        email: email.value,
        password: password.value,
        roleId: selectedRole.value,
        branchId: selectedBranch.value ?? null,
        gender: gender.value,
        age: age.value,
        name: name.value,
        surname: surname.value,
      }

      try {
        if (id.value === 0) {
          await userStore.addUser(userToSave, file.value)
        } else {
          await userStore.updateUser(userToSave, file.value)
        }
        dialog.value = false
        onReset()
      } catch (error) {
        console.error('Error saving user:', error)
      }
    } else {
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'Please correct the errors in the form.',
        icon: 'report_problem',
      })
    }
  })
}

function remove(row: User) {
  userStore.delUser(row)
}

function onReset() {
  form.value?.resetValidation()
  id.value = 0
  name.value = ''
  surname.value = ''
  email.value = ''
  password.value = ''
  age.value = 10
  selectedRole.value = null
  selectedBranch.value = null
  gender.value = 'male'
  file.value = null

  dialog.value = false
}
</script>

<style scoped>
.user-page {
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
  width: 100%;
}
.addCuscut-btn {
  background-color: rgb(141, 110, 99, 0.25);
  color: #3e2726;
  font-weight: bold;
  width: 180px;
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
