<template>
  <div class="q-pa-md">
    <q-input
      filled
      v-model="phoneInput"
      label="ค้นหาลูกค้าด้วยเบอร์โทร"
      maxlength="10"
      @update:model-value="onSearch"
      class="q-mb-md"
      clearable
      :mask="'##########'"
      :rules="[(value) => /^\d{10}$/.test(value) || 'กรุณากรอกเบอร์โทร 10 หลัก']"
    />

    <q-table
      :rows="results"
      :columns="columns"
      row-key="id"
      dense
      flat
      bordered
      hide-bottom
      no-data-label="ไม่พบลูกค้า"
    >
      <template v-slot:body-cell-imageUrl="props">
        <q-td :props="props">
          <q-avatar size="32px">
            <img :src="props.row.imageUrl || 'https://cdn.quasar.dev/img/boy-avatar.png'" />
          </q-avatar>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCustomerStore } from 'stores/customerStore'
import type { Customer } from 'src/models'

const customerStore = useCustomerStore()

const phoneInput = ref('')
const results = ref<Customer[]>([])

const columns = [
  { name: 'name', label: 'ชื่อ', field: 'name', align: 'left' as const },
  { name: 'surname', label: 'นามสกุล', field: 'surname', align: 'left' as const },
  { name: 'phoneNumber', label: 'เบอร์โทร', field: 'phoneNumber', align: 'left' as const },
  { name: 'point', label: 'แต้ม', field: 'point', align: 'right' as const },
]

function onSearch(val: string | number | null) {
  const keyword = val?.toString() ?? ''
  if (keyword.length === 10) {
    const customersFound = customerStore.searchCustomersByPhone(keyword)
    results.value = customersFound.length ? customersFound : [] // ค้นหาลูกค้าจากเบอร์โทร
  } else {
    results.value = []
  }
}
</script>
