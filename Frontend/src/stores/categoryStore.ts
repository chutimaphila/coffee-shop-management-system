import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'boot/axios'
import { Notify, Loading } from 'quasar'

export interface Category {
  id: number
  name: string
}

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<Category[]>([])

  async function getCategories() {
    try {
      Loading.show()
      const res = await api.get('/categories')
      categories.value = res.data
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'โหลดหมวดหมู่ล้มเหลว',
        icon: 'report_problem',
      })
    } finally {
      Loading.hide()
    }
  }

  async function addCategory(category: { name: string }) {
    try {
      Loading.show()
      const res = await api.post('/categories', category)
      categories.value.push(res.data)
      Notify.create({
        color: 'positive',
        position: 'top',
        message: 'เพิ่มหมวดหมู่เรียบร้อยแล้ว',
        icon: 'check',
      })
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'เพิ่มหมวดหมู่ล้มเหลว',
        icon: 'report_problem',
      })
    } finally {
      Loading.hide()
    }
  }

  async function updateCategory(category: Category) {
    try {
      Loading.show()
      // เปลี่ยนจาก `put` เป็น `patch`
      await api.patch(`/categories/${category.id}`, category)
      const index = categories.value.findIndex((c) => c.id === category.id)
      if (index !== -1) {
        categories.value[index] = category
      }
      Notify.create({
        color: 'positive',
        position: 'top',
        message: 'แก้ไขหมวดหมู่เรียบร้อยแล้ว',
        icon: 'check',
      })
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'แก้ไขหมวดหมู่ล้มเหลว',
        icon: 'report_problem',
      })
    } finally {
      Loading.hide()
    }
  }

  async function deleteCategory(id: number) {
    try {
      Loading.show()
      await api.delete(`/categories/${id}`)
      categories.value = categories.value.filter((c) => c.id !== id)
      Notify.create({
        color: 'positive',
        position: 'top',
        message: 'ลบหมวดหมู่เรียบร้อยแล้ว',
        icon: 'check',
      })
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'ลบหมวดหมู่ล้มเหลว',
        icon: 'report_problem',
      })
    } finally {
      Loading.hide()
    }
  }

  return {
    categories,
    getCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  }
})
