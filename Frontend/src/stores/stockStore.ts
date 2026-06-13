// stores/stockStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface StockItem {
  id: string
  name: string
  quantity: number
  unit: string
  mfgDate: string
  expDate: string
  checkDate?: string
  checkedBy?: string
}

export interface ChecklistRecord {
  id: string
  date: string
  employee: string
  totalItems: number
  note?: string
  items: StockItem[]
}

export const useStockStore = defineStore('stockStore', () => {
  // ✅ mock ข้อมูลสินค้า
  const stockItems = ref<StockItem[]>([
    {
      id: 'P001',
      name: 'น้ำดื่ม 500ml',
      quantity: 120,
      unit: 'ขวด',
      mfgDate: '2024-03-01',
      expDate: '2025-03-01',
      checkDate: '',
      checkedBy: '',
    },
    {
      id: 'P002',
      name: 'ขนมปังแผ่น',
      quantity: 60,
      unit: 'แพ็ค',
      mfgDate: '2024-04-01',
      expDate: '2024-04-30',
      checkDate: '',
      checkedBy: '',
    },
    {
      id: 'P003',
      name: 'น้ำมันพืช 1L',
      quantity: 35,
      unit: 'ขวด',
      mfgDate: '2024-02-15',
      expDate: '2025-02-15',
      checkDate: '',
      checkedBy: '',
    },
  ])

  // ✅ mock รายการใบเช็คสต็อก
  const savedChecklists = ref<ChecklistRecord[]>([])

  function addChecklist(newChecklist: StockItem[]) {
    const checklist: ChecklistRecord = {
      id: 'CHK' + (savedChecklists.value.length + 1).toString().padStart(3, '0'),
      date: new Date().toLocaleDateString('en-CA'),
      employee: newChecklist?.[0]?.checkedBy || 'ไม่ระบุ',
      totalItems: newChecklist.length,
      note: 'เพิ่มจากแบบฟอร์ม',
      items: newChecklist,
    }
    savedChecklists.value.push(checklist)
  }

  return {
    stockItems,
    savedChecklists,
    addChecklist,
  }
})
