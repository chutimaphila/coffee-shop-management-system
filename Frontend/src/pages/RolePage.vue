<template>
  <q-page padding class="role-page">
    <!-- ปุ่มเพิ่ม Role -->
    <div class="row justify-end q-mt-md">
      <q-btn icon="add" flat @click="dialog = true"></q-btn>
    </div>

    <q-input
      filled
      v-model="search"
      label="Search by name"
      debounce="300"
      clearable
      class="q-mb-md"
    />

    <!-- Dialog เพิ่ม/แก้ไข Role -->

    <q-dialog v-model="dialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ id === 0 ? 'Add New Role' : 'Edit Role' }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-form ref="form" @submit="onSubmit" @reset="onReset" class="q-gutter-md">
            <q-input
              filled
              v-model="name"
              label="Role"
              hint="Enter Role"
              lazy-rules
              :rules="[(val) => !!val || 'Required']"
            />

            <div>
              <q-btn label="Submit" type="submit" color="primary" />
              <q-btn label="Cancel" type="reset" color="primary" flat class="q-ml-sm" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- ตาราง Role -->

    <q-table
      :columns="columns"
      :rows="filteredRoles"
      :rows-per-page-options="[5, 10, 15]"
      v-model:pagination="pagination"
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
          <div class="q-gutter-sm">
            <q-chip
              v-for="role in row.roles"
              :key="typeof role === 'string' ? role : role.id"
              color="primary"
              text-color="white"
              class="q-mr-sm"
            >
              {{ typeof role === 'string' ? role : role.name }}
            </q-chip>
          </div>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import type { Role } from 'src/models'

import { computed, onMounted, ref } from 'vue'

import { type QForm, type QTableColumn } from 'quasar'
import { useRoleStore } from 'src/stores/roleStore'

const dialog = ref(false)
const form = ref<QForm | null>(null)

const columns: QTableColumn[] = [
  { name: 'id', label: 'ID', field: 'id', align: 'center', sortable: true },
  { name: 'name', label: 'First Name', field: 'name', align: 'center' },
  { name: 'operation', label: 'Operation', field: 'operation', align: 'center' },
]

//  ตัวแปรฟอร์ม
const roleStore = useRoleStore()
const id = ref(0)
const name = ref('')
const search = ref('')
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
})

const filteredRoles = computed(() => {
  const filteredData = search.value
    ? roleStore.roles.filter((role) =>
        `${role.name} ${role.name}`.toLowerCase().includes(search.value.toLowerCase()),
      )
    : roleStore.roles

  // eslint-disable-next-line vue/no-side-effects-in-computed-properties
  pagination.value.rowsNumber = filteredData.length
  const startIndex = (pagination.value.page - 1) * pagination.value.rowsPerPage
  const endIndex = startIndex + pagination.value.rowsPerPage
  return filteredData.slice(startIndex, endIndex)
})

onMounted(async () => {
  await roleStore.getRoles()
  await roleStore.fetchRoles()
})

function edit(row: Role) {
  id.value = row.id
  name.value = row.name
  dialog.value = true
}

function onSubmit() {
  form.value?.validate().then(async (success) => {
    if (success) {
      if (id.value === 0) {
        await roleStore.addRole({
          id: id.value,
          name: name.value,
        })
      } else {
        await roleStore.updateRole({
          id: id.value,
          name: name.value,
        })
      }
      dialog.value = false
      onReset()
    }
  })
}

function remove(row: Role) {
  roleStore.delRole(row)
}

function onReset() {
  form.value?.resetValidation()
  id.value = 0
  name.value = ''
  dialog.value = false
}
</script>

<style scoped>
.role-page {
  background-color: #faf3e0;
  font-family: 'Mali';
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  padding-top: 20px;
}
</style>
