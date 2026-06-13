<template>
  <q-dialog v-model="dialog" persistent>
    <q-card style="min-width: 600px; max-width: 90vw">
      <q-card-section class="row items-center justify-between">
        <div class="text-h6">จัดการตำแหน่ง</div>
        <q-btn flat dense round icon="close" @click="onReset()" />
      </q-card-section>

      <!-- Form -->
      <q-card-section class="q-pt-none">
        <q-form ref="form" @submit="onSubmit" @reset="onReset()" class="q-gutter-md">
          <q-input
            filled
            v-model="name"
            label="ตำแหน่ง"
            hint="Enter Role"
            lazy-rules
            :rules="[(val) => !!val || 'Required']"
          />
          <div class="row justify-end q-gutter-sm">
            <q-btn label="Submit" type="submit" color="primary" />
            <q-btn label="Cancel" type="reset" color="primary" flat class="q-ml-sm" />
          </div>
        </q-form>
      </q-card-section>

      <!-- Table -->
      <q-card-section>
        <!-- <q-input
          dense
          filled
          v-model="search"
          debounce="300"
          placeholder="Search by name"
          class="q-mb-md"
          clearable
        /> -->
        <q-table
          class="data-table"
          flat
          :columns="columns"
          :rows="filteredRoles"
          :rows-per-page-options="[5, 10]"
          v-model:pagination="pagination"
        >
          <template v-slot:body-cell-operation="{ row }">
            <q-td>
              <div class="full-width flex flex-center">
                <q-btn flat icon="edit" size="sm" @click="editRole(row)" />
                <q-btn flat icon="delete" size="sm" @click="removeRole(row)" />
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRoleStore } from 'src/stores/roleStore'
import type { QForm, QTableColumn } from 'quasar'
import type { Role } from 'src/models'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue'])

const dialog = ref(props.modelValue)
watch(
  () => props.modelValue,
  (val) => (dialog.value = val),
)
watch(dialog, (val) => emit('update:modelValue', val))

const roleStore = useRoleStore()
const form = ref<QForm | null>(null)

const id = ref(0)
const name = ref('')
const search = ref('')
const pagination = ref({
  page: 1,
  rowsPerPage: 5,
  rowsNumber: 0,
})

onMounted(() => {
  roleStore.getRoles()
})

const columns: QTableColumn[] = [
  { name: 'id', label: 'ID', field: 'id', align: 'center', sortable: true },
  { name: 'name', label: 'ตำแหน่ง', field: 'name', align: 'center' },
  { name: 'operation', label: 'Operation', field: 'operation', align: 'center' },
]

const filteredRoles = computed(() => {
  const list = search.value
    ? roleStore.roles.filter((r) => r.name.toLowerCase().includes(search.value.toLowerCase()))
    : roleStore.roles
  // eslint-disable-next-line vue/no-side-effects-in-computed-properties
  pagination.value.rowsNumber = list.length
  const start = (pagination.value.page - 1) * pagination.value.rowsPerPage
  const end = start + pagination.value.rowsPerPage
  return list.slice(start, end)
})

function onSubmit() {
  form.value?.validate().then(async (success) => {
    if (success) {
      if (id.value === 0) {
        await roleStore.addRole({ id: id.value, name: name.value })
      } else {
        await roleStore.updateRole({ id: id.value, name: name.value })
      }
      await roleStore.getRoles()
      onReset()
    }
  })
}

function onReset() {
  form.value?.resetValidation()
  id.value = 0
  name.value = ''
  dialog.value = false
}

function editRole(role: Role) {
  id.value = role.id
  name.value = role.name
}

function removeRole(role: Role) {
  roleStore.delRole(role)
}
</script>
<style scoped>
.q-card {
  background-color: #ffffff; /* โทนสีครีมนุ่มๆ */
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.q-form {
  background-color: #ffffff;
  padding: 16px;
  border-radius: 8px;
}

.q-input input {
  background-color: #fffbe6 !important;
}

.q-btn {
  border-radius: 8px;
}

.q-btn[type='submit'] {
  background-color: #ffb74d;
  color: white;
}

.q-btn[type='reset'] {
  color: #ff9800;
}
.data-table {
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  color: #3e2726;
}
</style>
