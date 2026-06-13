<!-- src/components/CustomerFormDialog.vue -->
<template>
  <q-dialog v-model="dialog" persistent>
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">{{ isEdit ? 'Edit Customer' : 'Add New Customer' }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form ref="form" @submit="onSubmit" @reset="onReset" class="q-gutter-md">
          <!-- Name and Surname Inputs -->
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

          <!-- Phone Number Input -->
          <q-input
            filled
            v-model="formInput.phoneNumber"
            label="เบอร์โทรศัพท์"
            :rules="[
              (val) => !!val || 'กรุณากรอกเบอร์โทร',
              (val) => /^(0\d{9})$/.test(val) || 'กรุณากรอกเบอร์โทรที่ถูกต้อง',
            ]"
            @input="onPhoneInput"
            mask="##########"
          />

          <!-- Birthdate Input -->
          <q-input
            filled
            type="date"
            v-model="formInput.birthDate"
            label="วันเกิด"
            :rules="[
              (val) => !!val || 'กรุณากรอกวันเกิด',
              (val) => new Date(val) <= new Date() || 'วันเกิดไม่สามารถเป็นวันในอนาคตได้',
            ]"
          />

          <!-- Age Input -->
          <q-input
            filled
            type="number"
            v-model.number="formData.age"
            label="อายุ"
            :rules="[
              (val) => (val >= 10 && val <= 120) || 'อายุต้องมากกว่า 10 ปีและน้อยกว่า 120 ปี',
            ]"
          />

          <!-- Points Input -->
          <q-input
            filled
            type="number"
            v-model.number="formData.point"
            label="คะแนน"
            :rules="[(val) => val >= 0 || 'แต้มต้องมากกว่าหรือเท่ากับ 0']"
          />

          <!-- Image Preview -->
          <q-img
            v-if="previewImage"
            :src="previewImage"
            style="width: 150px; height: 150px; border-radius: 8px"
          />

          <!-- Gender Selection -->
          <div class="q-gutter-sm">
            <q-radio v-model="formData.gender" label="Male" val="male" color="brown" />
            <q-radio v-model="formData.gender" label="Female" val="female" color="brown" />
          </div>

          <!-- File Input -->
          <q-file outlined v-model="file" accept="image/*" label="อัพโหลดรูปภาพ" />

          <!-- Submit and Cancel Buttons -->
          <q-btn label="Submit" type="submit" color="primary" />
          <q-btn label="Cancel" type="reset" color="primary" flat class="q-ml-sm" />
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, defineEmits, defineProps, watchEffect } from 'vue'
import type { QForm } from 'quasar'
import type { Customer } from 'src/models'

const onPhoneInput = (value: string) => {
  // กรองให้กรอกได้แค่ตัวเลข
  formInput.value.phoneNumber = value.replace(/[^0-9]/g, '')
}

const props = defineProps<{
  modelValue: boolean
  customer: Customer
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', customer: Customer, file: File | null): void
}>()

const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const form = ref<QForm | null>(null)
const file = ref<File | null>(null)
const formData = ref<Customer>({ ...props.customer })
const formInput = ref({
  phoneNumber: '',
  birthDate: '',
})
const previewImage = computed(() => {
  return file.value
    ? URL.createObjectURL(file.value)
    : formData.value.imageUrl
      ? 'http://localhost:3000' + formData.value.imageUrl
      : null
})

const isEdit = computed(() => formData.value.id !== 0)

async function onSubmit() {
  await form.value?.validate()
  formData.value.phoneNumber = formInput.value.phoneNumber // Sync phoneNumber with formData
  formData.value.birthDate = formInput.value.birthDate // Sync birthDate with formData
  emit('submit', formData.value, file.value)
}

function onReset() {
  form.value?.resetValidation()
  dialog.value = false
}

watchEffect(() => {
  formData.value = { ...props.customer }
  file.value = null
  formInput.value.phoneNumber = formData.value.phoneNumber || ''
  formInput.value.birthDate = formData.value.birthDate || ''
})
</script>
