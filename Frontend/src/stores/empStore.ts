import { defineStore } from 'pinia'
import { Loading, Notify } from 'quasar'
import { api } from 'src/boot/axios'
import { type Employee } from 'src/models'
import { ref } from 'vue'

export const useEmployeeStore = defineStore('employee', () => {
  const employees = ref<Employee[]>([])

  // เพิ่มพนักงาน
  async function addEmployee(e: Employee, file: File | null) {
    try {
      Loading.show()

      // 🔹 สร้าง FormData อย่างปลอดภัย
      const formData = new FormData()
      // formData.append('id', e.id.toString())
      formData.append('name', e.name)
      formData.append('surname', e.surname)
      formData.append('age', e.age.toString())
      formData.append('gender', e.gender)
      formData.append('phone_number', e.phone_number)

      // 🔸 ดึง user_id และ branch_id จาก object หรือตรง ๆ
      const userId = e.user_id
      const branchId = e.branch_id

      formData.append('user_id', userId ? userId.toString() : '')
      formData.append('branch_id', branchId ? branchId.toString() : '')
      formData.append('position', e.position)
      formData.append('employment_type', e.employment_type)

      formData.append('is_active', e.is_active ? 'true' : 'false')
      if (file) {
        formData.append('file', file)
      }
      console.log('addemp1', formData)

      console.log('addemp', e)
      console.log('👀 updating employee id', e.id)

      const res = await api.post('/employees', e, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      console.log('Add Employee Response:', res.data)
      await getEmps()
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'Add failed',
        icon: 'report_problem',
      })
    } finally {
      console.log('finally')
      Loading.hide()
    }
  }

  // ลบพนักงาน
  async function delEmployee(e: Employee) {
    try {
      Loading.show()
      const res = await api.delete('/employees/' + e.id)
      console.log('Delete ID:', e.id)
      console.log('Try delete employee id:', res.data)

      await getEmps()
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'ลบพนักงานล้มเหลว',
        icon: 'report_problem',
      })
    } finally {
      console.log('finally')
      Loading.hide()
    }
  }

  // อัพเดตข้อมูลพนักงาน
  async function updateEmployee(e: Employee, file: File | null) {
    try {
      Loading.show()
      const formData = new FormData()
      formData.append('id', e.id.toString())
      formData.append('name', e.name)
      formData.append('surname', e.surname)
      formData.append('age', String(e.age))
      formData.append('gender', e.gender)
      formData.append('phone_number', e.phone_number)
      formData.append('user_id', String(e.user_id ?? '')) // ✅ ป้องกัน null/undefined
      formData.append('branch_id', String(e.branch_id ?? '')) // ✅ เช่นเดียวกัน
      formData.append('position', e.position)
      formData.append('employment_type', e.employment_type)

      // ✅ ตรวจว่าค่าเป็น string อยู่แล้วรึยัง ถ้าใช่ไม่ต้อง new Date
      formData.append('is_active', e.is_active ? 'true' : 'false')

      if (file) {
        formData.append('file', file)
      }

      console.log('👀 updating employee id', e.id)

      const res = await api.patch('/employees/' + e.id, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      console.log('✅ Update Employee Response:', res.data)
      await getEmps()
    } catch (err: unknown) {
      console.error('❌ updateEmployee error:', err)

      // Check if the error is an instance of Error
      if (err instanceof Error) {
        Notify.create({
          color: 'negative',
          position: 'top',
          message: err.message || 'อัพเดตข้อมูลพนักงานล้มเหลว',
          icon: 'report_problem',
        })
      } else {
        Notify.create({
          color: 'negative',
          position: 'top',
          message: 'อัพเดตข้อมูลพนักงานล้มเหลว',
          icon: 'report_problem',
        })
      }
    }
  }

  // ดึงข้อมูลพนักงานทั้งหมด
  async function getEmps() {
    try {
      Loading.show()
      const res = await api.get('/employees')
      employees.value = res.data
      console.log('✔ emplotee:', employees.value) // <= ตรงนี้
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'โหลดข้อมูลพนักงานล้มเหลว',
        icon: 'report_problem',
      })
    } finally {
      console.log('finally')
      Loading.hide()
    }
  }

  return {
    employees,
    addEmployee,
    delEmployee,
    updateEmployee,
    getEmps,
  }
})
