import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'boot/axios'
import type { Product } from 'src/models'
import { Notify, Loading } from 'quasar'

export const useProductStore = defineStore('product', () => {
  const products = ref<Product[]>([])

  async function addProduct(p: Product, file: File | null) {
    try {
      Loading.show()
      const formData = new FormData()
      formData.append('name', p.name)
      formData.append('price', p.price.toString())
      formData.append('categoryId', p.categoryId.toString())

      if (file) {
        formData.append('file', file)
      }

      const res = await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      console.log('Add Product Response:', res.data)
      await getProducts()
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'Add product failed',
        icon: 'report_problem',
      })
    } finally {
      Loading.hide()
    }
  }

  async function updateProduct(p: Product, file: File | null) {
    try {
      Loading.show()
      const formData = new FormData()
      formData.append('name', p.name)
      formData.append('price', p.price.toString())
      formData.append('categoryId', p.categoryId.toString())

      if (file) {
        formData.append('file', file)
      }

      const res = await api.patch('/products/' + p.id, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      console.log('Update Product Response:', res.data)
      await getProducts()
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'Update product failed',
        icon: 'report_problem',
      })
    } finally {
      Loading.hide()
    }
  }

  async function delProduct(p: Product) {
    try {
      Loading.show()
      const res = await api.delete('/products/' + p.id)
      console.log('Delete Product Response:', res.data)
      await getProducts()
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'Delete product failed',
        icon: 'report_problem',
      })
    } finally {
      Loading.hide()
    }
  }

  async function getProducts() {
    try {
      Loading.show()
      const res = await api.get('/products')
      products.value = res.data
      console.log('✔ products:', products.value) // <= ตรงนี้
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'Loading products failed',
        icon: 'report_problem',
      })
    } finally {
      Loading.hide()
    }
  }

  return {
    products,
    addProduct,
    getProducts,
    delProduct,
    updateProduct,
  }
})
