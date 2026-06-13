<template>
  <q-page padding class="product-page">
    <!-- หน้าหลัก -->
    <div class="header-row">
      <p class="title">รายการสินค้า</p>
      <q-input filled v-model="search" label="ค้นหาด้วยชื่อสินค้า" class="search-box" dense>
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
      <q-select
        filled
        v-model="filterType"
        :options="['ทั้งหมด', ...categoryOptions.map((opt) => opt.label)]"
        label="Filter"
        style="width: 180px"
      />

      <q-btn dense class="addProdcut-btn" @click="openAddProductDialog"> เพิ่มสินค้าใหม่ </q-btn>

      <q-btn dense class="addProdcut-btn" @click="openCategoryDialog"> หมวดหมู่สินค้า </q-btn>
    </div>
    <!-- ตารางสินค้า -->
    <div>
      <q-table
        :columns="columns"
        :rows="filteredProducts"
        :rows-per-page="pagination.rowsPerPage"
        :rows-per-page-options="[5, 10, 15]"
        class="data-table"
      >
        <template v-slot:body-cell-operation="{ row }">
          <q-td>
            <div class="full-width flex flex-center">
              <q-btn flat icon="edit" @click="edit(row)"></q-btn>
              <q-btn flat icon="delete" @click="openDeleteDialog(row)" />
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-imageUrl="{ row }">
          <q-td class="q-pa-sm">
            <div class="flex flex-center">
              <q-img
                :src="'http://localhost:3000' + row.imageUrl"
                style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px"
              />
            </div>
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- dialog หมวดหมู่สินค้า -->
    <q-dialog v-model="isCategoryDialogOpen" persistent>
      <q-card style="min-width: 500px">
        <!-- หัวข้อ -->
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">หมวดหมู่สินค้า</div>
          <q-btn dense flat icon="close" @click="isCategoryDialogOpen = false" />
        </q-card-section>

        <!-- ฟอร์ม + ตาราง -->
        <q-card-section class="q-pt-none">
          <!-- ฟอร์มเพิ่มหมวดหมู่ -->
          <q-form @submit.prevent="saveCategory" ref="categoryForm">
            <div class="row items-center q-col-gutter-sm">
              <div class="row items-center q-gutter-sm">
                <q-input
                  v-model="searchKeyword"
                  placeholder="ค้นหาหมวดหมู่..."
                  dense
                  filled
                  debounce="300"
                  clearable
                  class="q-mr-sm"
                  style="min-width: 350px; height: 40px"
                />
              </div>

              <q-btn
                dense
                flat
                label="เพิ่มหมวดหมู่"
                color="primary"
                class="addProdcut-btn"
                style="height: 40px"
                @click="openCategoryFormDialog()"
              />
            </div>
          </q-form>

          <!-- ตารางหมวดหมู่ -->
          <q-table
            class="q-mt-md"
            :rows="filteredCategories"
            :columns="categoryColumns"
            row-key="id"
            dense
          >
            <template v-slot:body-cell-action="{ row }">
              <q-td>
                <div class="flex justify-center">
                  <q-btn flat icon="edit" @click="openCategoryFormDialog(row)" />
                  <q-btn flat icon="delete" @click="deleteCategory(row)" />
                </div>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog สำหรับ เพิ่ม / แก้ไข หมวดหมู่ -->
    <q-dialog v-model="isCategoryFormDialogOpen" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">
            {{ isEditCategoryMode ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่' }}
          </div>
          <q-btn dense flat icon="close" @click="isCategoryFormDialogOpen = false" />
        </q-card-section>

        <q-form @submit.prevent="saveCategory" ref="categoryForm">
          <q-card-section class="q-pt-none">
            <q-input
              v-model="category.name"
              label="ชื่อหมวดหมู่"
              filled
              dense
              :rules="[(val) => !!val || 'กรุณากรอกชื่อหมวดหมู่']"
            />
          </q-card-section>

          <q-card-actions align="center">
            <q-btn flat label="ยกเลิก" color="primary" v-close-popup />
            <q-btn flat label="บันทึก" color="primary" type="submit" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- dialog เพิ่มและแก้ไข -->
    <q-dialog v-model="isDialogOpen" persistent>
      <q-card style="min-width: 400px">
        <q-form @submit.prevent="saveProduct" ref="productForm">
          <q-card-section>
            <div class="text-h6">{{ isEditMode ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่' }}</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input
              v-model="product.name"
              label="ชื่อสินค้า"
              filled
              class="q-mt-sm"
              :rules="[(val) => !!val || 'กรุณากรอกชื่อสินค้า']"
            />
            <q-input
              v-model.number="product.price"
              type="number"
              label="ราคา"
              filled
              :rules="[(val) => !!val || 'กรุณากรอกราคา', (val) => val > 0 || 'ราคาต้องมากกว่า 0']"
            />
            <q-select
              v-model="product.categoryId"
              :options="categoryOptions"
              label="หมวดหมู่"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              filled
              class="q-mt-sm"
              :rules="[(val) => !!val || 'กรุณาเลือกหมวดหมู่']"
            />
            <q-file v-model="product.file" label="เลือกรูปสินค้า" filled class="q-mt-sm" />
            <div class="flex justify-center">
              <q-img
                v-if="product.imageUrl"
                :src="'http://localhost:3000' + product.imageUrl"
                style="max-width: 150px; height: auto; object-fit: cover"
              />
            </div>
          </q-card-section>

          <q-card-actions class="justify-center">
            <q-btn
              flat
              class="addProdcut-btn q-mx-sm"
              label="ยกเลิก"
              color="primary"
              v-close-popup
            />
            <q-btn
              flat
              class="addProdcut-btn q-mx-sm"
              label="บันทึก"
              color="primary"
              type="submit"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- dialog ยืนยันการลบข้อมูล -->
    <q-dialog v-model="isDeleteDialogOpen" persistent>
      <q-card
        style="min-width: 400px; min-height: 200px"
        class="column items-center justify-center q-pa-md"
      >
        <q-card-section class="text-center">
          <div class="text-h6 q-mb-sm">คุณแน่ใจว่าจะลบสินค้านี้หรือไม่?</div>
          <div class="text-h6 text-weight-bold">{{ deleteProductName }}</div>
        </q-card-section>

        <q-card-actions class="justify-center">
          <q-btn flat class="addProdcut-btn q-mx-sm" label="ยกเลิก" color="primary" v-close-popup />
          <q-btn
            flat
            class="addProdcut-btn q-mx-sm"
            label="ลบ"
            color="negative"
            @click="confirmDelete"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import type { QTableColumn } from 'quasar'
import type { Product } from 'src/models'
import { useCategoryStore } from 'src/stores/categoryStore'
import { useProductStore } from 'src/stores/productStore'
import { computed, ref } from 'vue'

const isDialogOpen = ref(false)
const isEditMode = ref(false)
const categoryOptions = computed(() =>
  categoryStore.categories.map((cat) => ({
    label: cat.name,
    value: cat.id,
  }))
)

const productStore = useProductStore()
const categoryStore = useCategoryStore()

const product = ref<Product>({
  id: 0,
  name: '',
  price: 0,
  categoryId: 0,
  imageUrl: '',
})
const isDeleteDialogOpen = ref(false) // ควบคุมการเปิด/ปิด dialog การลบ
const deleteProductName = ref('') // ชื่อสินค้าที่จะถูกลบ
const productToDelete = ref<Product | null>(null) // สินค้าที่จะถูกลบ
const search = ref('')

const pagination = ref({
  sortBy: 'id',
  descending: true,
  page: 1,
  rowsPerPage: 0,
  rowsNumber: 0,
})
// ตารางสินค้า
const columns: QTableColumn<Product>[] = [
  { name: 'id', label: 'ID', field: 'id', align: 'center', sortable: true },
  {
    name: 'imageUrl',
    label: 'รูปภาพ',
    field: (row) => row.imageUrl || '',
    align: 'center',
  },
  { name: 'name', label: 'ชื่อสินค้า', field: 'name', align: 'center' },
  { name: 'price', label: 'ราคา', field: 'price', align: 'center' },
  {
    name: 'categoryId',
    label: 'หมวดหมู่',
    field: (row) => row.category?.name ?? '-',
    align: 'center',
  },

  {
    name: 'operation',
    label: 'การจัดการ',
    field: (row) => row.id,
    align: 'center',
  },
]
// กรองสินค้า
const filterType = ref('')
const filteredProducts = computed(() => {
  let filtered = productStore.products

  if (search.value) {
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(search.value.toLowerCase()))
  }

  if (filterType.value && filterType.value !== 'ทั้งหมด') {
    filtered = filtered.filter((p) => p.category?.name === filterType.value)
  }

  const start = (pagination.value.page - 1) * pagination.value.rowsPerPage
  const end = start + pagination.value.rowsPerPage

  return filtered.slice(start, end)
})

import { onMounted } from 'vue'

onMounted(async () => {
  await productStore.getProducts()
  await categoryStore.getCategories()

  pagination.value.rowsPerPage = productStore.products.length
  pagination.value.rowsNumber = productStore.products.length
})

function openAddProductDialog() {
  product.value = {
    id: 0,
    name: '',
    price: 0,
    categoryId: 1,
    imageUrl: '',
    file: null,
  }
  isEditMode.value = false
  isDialogOpen.value = true
}

function edit(row: Product) {
  product.value = {
    ...row,
    categoryId: row.category?.id ?? 1, // เพิ่มการตั้งค่าของ categoryId
    file: null, // ไม่โหลดไฟล์เดิม แต่ให้เลือกใหม่ถ้าจะอัปโหลด
  }

  isEditMode.value = true
  isDialogOpen.value = true
}

const productForm = ref()
import { Notify } from 'quasar'

async function saveProduct() {
  const valid = await productForm.value.validate()
  if (!valid) return

  if (isEditMode.value) {
    await productStore.updateProduct(product.value, product.value.file ?? null)
    Notify.create({
      message: 'แก้ไขสินค้าสำเร็จ',
      color: 'green',
      icon: 'check',
      position: 'top',
    })
  } else {
    await productStore.addProduct(product.value, product.value.file ?? null)
    Notify.create({
      message: 'เพิ่มสินค้าสำเร็จ',
      color: 'green',
      icon: 'check',
      position: 'top',
    })
    // รีเฟรชข้อมูลสินค้าใน productStore
    productStore.getProducts()

    // รีเฟรช pagination
    pagination.value.rowsPerPage = productStore.products.length
    pagination.value.rowsNumber = productStore.products.length
  }

  await productStore.getProducts()
  isDialogOpen.value = false
}

function openDeleteDialog(product: Product) {
  deleteProductName.value = product.name
  productToDelete.value = product
  isDeleteDialogOpen.value = true
}

function confirmDelete() {
  if (productToDelete.value) {
    productStore.delProduct(productToDelete.value)
    isDeleteDialogOpen.value = false
  }
}
// เกี่ยวกับหมวดหมู่ของสินค้า
const isCategoryDialogOpen = ref(false)
const categoryForm = ref()

const categoryColumns: QTableColumn[] = [
  { name: 'id', label: 'ID', field: 'id', align: 'center' },
  { name: 'name', label: 'ชื่อหมวดหมู่', field: 'name', align: 'center' },
  { name: 'action', label: 'การจัดการ', field: 'id', align: 'center' },
]

function openCategoryDialog() {
  category.value = { id: 0, name: '' }
  isCategoryDialogOpen.value = true
}

function deleteCategory(row: { id: number }) {
  categoryStore.deleteCategory(row.id)
}

//ไดอารอกแก้ไขหมวดหมู่
const isCategoryFormDialogOpen = ref(false)
const isEditCategoryMode = ref(false)

const category = ref({
  id: 0,
  name: '',
})

function openCategoryFormDialog(editData?: { id: number; name: string }) {
  if (editData) {
    isEditCategoryMode.value = true
    category.value = { ...editData }
  } else {
    isEditCategoryMode.value = false
    category.value = { id: 0, name: '' }
  }
  isCategoryFormDialogOpen.value = true
}

function saveCategory() {
  if (isEditCategoryMode.value) {
    categoryStore.updateCategory(category.value)
  } else {
    categoryStore.addCategory(category.value)
  }
  isCategoryFormDialogOpen.value = false
}

// ค้นหาหมวดหมู่
const searchKeyword = ref('')

const filteredCategories = computed(() => {
  return categoryStore.categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})
</script>
<style>
.product-page {
  background-color: #faf3e0;
}
.title {
  font-size: 15px;
  font-weight: bold;
  color: #3e2726;
  margin-right: 10px;
}
.header-row {
  display: flex;
  align-items: center;
  /* justify-content: space-between; */
  gap: 10px;
  background-color: transparent;
  padding-bottom: 22px;
}
.search-box {
  height: 40px;
  font-size: 15px;
  width: 44%;
}
.filter-btn {
  background-color: rgb(141, 110, 99, 0.25);
  width: 130px;
  height: 40px;
  border-radius: 15px;
  font-family: 'Nunito', sans-serif;
  font-weight: bold;
  align-items: center;
}
.addProdcut-btn {
  background-color: rgb(141, 110, 99, 0.25);
  color: #3e2726;
  font-weight: bold;
  width: 140px;
  height: 40px;
  margin-left: 20px;
  border-radius: 15px;
  align-items: center;
}
.data-table {
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  color: #3e2726;
}
</style>
