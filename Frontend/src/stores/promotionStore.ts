import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export interface Promotion {
  id: number
  name: string
  datetime: string
  type: 'PERCENT' | 'FIXED' // ประเภทของโปรโมชั่น
  value: number // ค่าโปรโมชั่น (เปอร์เซ็นต์ หรือ จำนวนเงิน)
  minSpend: number // ยอดขั้นต่ำที่ต้องใช้โปรโมชั่น
}

export const usePromotionStore = defineStore('promotion', () => {
  const promotions = ref<Promotion[]>([])

  // ฟังก์ชันดึงข้อมูลโปรโมชั่น
  const fetchPromotion = async () => {
    try {
      const res = await axios.get<Promotion[]>('http://localhost:3000/promotions')
      promotions.value = res.data
    } catch (err) {
      console.error('โหลดข้อมูลไม่สำเร็จ:', err)
    }
  }

  // ฟังก์ชันคำนวณราคาหลังจากใช้โปรโมชั่น
  const applyPromotion = (totalPrice: number, promotionId: number) => {
    const promotion = promotions.value.find((p) => p.id === promotionId)

    if (!promotion) {
      console.error('โปรโมชั่นไม่พบ')
      return totalPrice // คืนราคาเดิมถ้าไม่พบโปรโมชั่น
    }

    // ตรวจสอบยอดขั้นต่ำ
    if (totalPrice < promotion.minSpend) {
      console.log(`ยอดรวมต้องมากกว่าหรือเท่ากับ ${promotion.minSpend} ฿ เพื่อใช้โปรโมชั่นนี้`)
      return totalPrice // คืนราคาเดิมถ้ายอดไม่ถึง
    }

    // คำนวณส่วนลด
    if (promotion.type === 'PERCENT') {
      // ถ้าโปรโมชั่นเป็นเปอร์เซ็นต์ เช่น 10% ลด 10%
      return totalPrice - totalPrice * (promotion.value / 100)
    } else if (promotion.type === 'FIXED') {
      // ถ้าโปรโมชั่นเป็นจำนวนเงิน เช่น ลด 100 บาท
      return totalPrice - promotion.value
    }
    return totalPrice // คืนราคาเดิมถ้าไม่ตรงเงื่อนไข
  }

  // ฟังก์ชันเพิ่มโปรโมชั่น
  const addPromotion = async (data: Omit<Promotion, 'id'>) => {
    try {
      const res = await axios.post<Promotion>('http://localhost:3000/promotions', data)
      promotions.value.push(res.data)
    } catch (err) {
      console.error('เพิ่มโปรโมชั่นไม่สำเร็จ:', err)
    }
  }

  // ฟังก์ชันแก้ไขโปรโมชั่น
  const updatePromotion = async (id: number, data: Omit<Promotion, 'id'>) => {
    try {
      const res = await axios.patch<Promotion>(`http://localhost:3000/promotions/${id}`, data)
      const index = promotions.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        promotions.value[index] = res.data
      }
    } catch (err) {
      console.error('แก้ไขโปรโมชั่นไม่สำเร็จ:', err)
    }
  }

  // ฟังก์ชันลบโปรโมชั่น
  const deletePromotion = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3000/promotions/${id}`)
      promotions.value = promotions.value.filter((p) => p.id !== id)
    } catch (err) {
      console.error('ลบโปรโมชั่นไม่สำเร็จ:', err)
    }
  }

  return {
    promotions,
    fetchPromotion,
    applyPromotion, // ส่งฟังก์ชันคำนวณราคาหลังจากใช้โปรโมชั่น
    addPromotion,
    updatePromotion,
    deletePromotion,
  }
})
