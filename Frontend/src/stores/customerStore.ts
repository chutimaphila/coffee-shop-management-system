import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'boot/axios'
import type { Customer } from 'src/models'
import { Notify, Loading } from 'quasar'

export const useCustomerStore = defineStore('customer', () => {
  const customers = ref<Customer[]>([])
  const form = ref<Customer>({
    id: 0,
    name: '',
    surname: '',
    phoneNumber: '',
    birthDate: '',
    gender: 'male',
    age: 0,
    point: 0,
    imageUrl: '',
  })

  const form2 = ref<Customer>({ ...form.value })
  async function getCustomers() {
    try {
      Loading.show()
      const res = await api.get('/customers')
      customers.value = res.data
      console.log('✔ customers:', customers.value)
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'Loading customers failed',
        icon: 'report_problem',
      })
    } finally {
      Loading.hide()
    }
  }

  async function addCustomer(c: Customer, file: File | null) {
    try {
      Loading.show()
      const formData = new FormData()
      formData.append('name', c.name)
      formData.append('surname', c.surname)
      formData.append('phoneNumber', c.phoneNumber)
      formData.append('birthDate', c.birthDate || '')
      formData.append('gender', c.gender)
      formData.append('age', c.age.toString())
      formData.append('point', c.point.toString())

      if (file) {
        formData.append('file', file)
      }

      const res = await api.post('/customers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      console.log('Add Customer Response:', res.data)
      await getCustomers()
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'Add customer failed',
        icon: 'report_problem',
      })
    } finally {
      Loading.hide()
    }
  }

  async function updateCustomer(c: Customer, file: File | null) {
    try {
      Loading.show()
      const formData = new FormData()
      formData.append('name', c.name)
      formData.append('surname', c.surname)
      formData.append('phoneNumber', c.phoneNumber)
      formData.append('birthDate', c.birthDate || '')
      formData.append('gender', c.gender)
      formData.append('age', c.age.toString())
      formData.append('point', c.point.toString())

      if (file) {
        formData.append('file', file)
      }

      const res = await api.patch(`/customers/${c.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      console.log('Update Customer Response:', res.data)
      await getCustomers()
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'Update customer failed',
        icon: 'report_problem',
      })
    } finally {
      Loading.hide()
    }
  }

  async function delCustomer(c: Customer) {
    try {
      Loading.show()
      const res = await api.delete(`/customers/${c.id}`)
      console.log('Delete Customer Response:', res.data)
      await getCustomers()
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'Delete customer failed',
        icon: 'report_problem',
      })
    } finally {
      Loading.hide()
    }
  }

  async function addPoints(customerId: number, points: number) {
    try {
      Loading.show()
      const res = await api.patch(`/customers/customers/${customerId}/add-points`, {
        points, // ต้องส่งในรูปแบบ object { points: number }
      })
      console.log('Add Points Response:', res.data)
      await getCustomers() // รีโหลดข้อมูลลูกค้าใหม่
      Notify.create({
        type: 'positive',
        message: `Added ${points} points successfully.`,
      })
    } catch (err) {
      console.error(err)
      Notify.create({
        type: 'negative',
        message: 'Failed to add points',
      })
    } finally {
      Loading.hide()
    }
  }

  async function subtractPoints(customerId: number, points: number) {
    try {
      Loading.show()
      const res = await api.patch(`/customers/${customerId}/subtract-points`, {
        points, // ส่งในรูปแบบ { points: number }
      })
      console.log('Subtract Points Response:', res.data)
      await getCustomers()
      Notify.create({
        type: 'positive',
        message: `Subtracted ${points} points successfully.`,
      })
    } catch (err) {
      console.error(err)
      Notify.create({
        type: 'negative',
        message: 'Failed to subtract points',
      })
    } finally {
      Loading.hide()
    }
  }

  function searchCustomersByPhone(phone: string): Customer[] {
    const keyword = phone.trim().toLowerCase()
    const result = customers.value.filter((c) => c.phoneNumber.toLowerCase().includes(keyword))

    console.log('Search Results:', result) // Log ค่า result ที่ return
    return result
  }

  return {
    form,
    form2,
    customers,
    getCustomers,
    addCustomer,
    updateCustomer,
    delCustomer,
    searchCustomersByPhone,
    addPoints,
    subtractPoints,
  }
})
