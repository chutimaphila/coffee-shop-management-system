import { defineStore } from 'pinia'
import { ref } from 'vue'

// Interface สำหรับข้อมูลที่ได้รับจาก API
interface ExpenseApiResponse {
  id: number
  name: string
  branchId: number
  datetime: string
  amount: number
  type: string
}

// Interface สำหรับข้อมูลที่ใช้ในแอป
export interface Expense {
  id: number
  name: string
  branch: string
  branchId: number
  datetime: string
  amount: number
  type: string
}

export const useExpenseStore = defineStore('Expense', () => {
  const expenses = ref<Expense[]>([])

  // ฟังก์ชันดึงข้อมูลค่าใช้จ่าย
  // ฟังก์ชันดึงข้อมูลค่าใช้จ่ายพร้อมการจัดการข้อผิดพลาดที่ดีขึ้น
  async function fetchExpenses() {
    try {
      const res = await fetch('http://localhost:3000/expense')
      if (!res.ok) throw new Error('Failed to fetch expenses')

      const data: ExpenseApiResponse[] = await res.json()

      // แปลงข้อมูลและเพิ่มชื่อสาขา
      expenses.value = data.map((item) => ({
        ...item,
        branch: item.branchId === 1 ? 'สาขา 1' : 'สาขา 2',
      }))
    } catch (error) {
      console.error('Error fetching expenses:', error)
      // แสดงข้อความข้อผิดพลาดหรือการแจ้งเตือนให้ผู้ใช้ทราบ
      alert('มีข้อผิดพลาดในการดึงข้อมูลค่าใช้จ่าย โปรดลองใหม่อีกครั้ง')
    }
  }

  // ฟังก์ชันเพิ่มค่าใช้จ่าย
  async function addExpense(expense: Omit<Expense, 'id'>) {
    // แปลง branch เป็น branchId ก่อนส่ง
    const expenseWithBranchId = {
      ...expense,
      branchId: expense.branch === 'สาขา 1' ? 1 : 2, // แปลง branch เป็น branchId
    }
    try {
      const res = await fetch('http://localhost:3000/expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseWithBranchId),
      })
      if (!res.ok) throw new Error('Failed to add expense')
      const data = await res.json()
      expenses.value.push(data)
    } catch (error) {
      console.error('Error adding expense:', error)
    }
  }

  // ฟังก์ชันอัพเดตค่าใช้จ่าย
  async function updateExpense(expense: Expense) {
    try {
      const res = await fetch(`http://localhost:3000/expense/${expense.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      })
      if (!res.ok) throw new Error('Failed to update expense')
      const updated = await res.json()
      const index = expenses.value.findIndex((item) => item.id === expense.id)
      if (index !== -1) expenses.value[index] = updated
    } catch (error) {
      console.error('Error updating expense:', error)
    }
  }

  // ฟังก์ชันลบค่าใช้จ่าย
  async function deleteExpense(id: number) {
    try {
      const res = await fetch(`http://localhost:3000/expense/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete expense')
      expenses.value = expenses.value.filter((item) => item.id !== id)
    } catch (error) {
      console.error('Error deleting expense:', error)
    }
  }

  return {
    expenses,
    fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
  }
})
