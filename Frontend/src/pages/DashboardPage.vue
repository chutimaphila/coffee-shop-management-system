<template>
  <q-page class="product-page">
    <div>
      <div class="row box-grid">
        <div class="box">
          Today Total Sale
          <div class="item-in-box">{{ totalReceivedToday }} Baht</div>
          <div v-if="authStore.user?.role?.id === 1"></div>
        </div>
        <div class="box">
          Popular Product
          <div
            class="item-in-box2lay"
            v-for="product in bestSellingProducts"
            :key="product.productId"
          >
            <p>{{ getProductNameById(product.productId) }}</p>
            <!-- <p>{{ product.productId }}</p> -->
            <p>{{ product.total_quantity }} Pieces</p>
          </div>
        </div>
        <div class="box">
          count order
          <div class="item-in-box">{{ store.countbill.length }} Order</div>
        </div>
        <div class="box">
          count orderitems
          <div class="item-in-box">{{ store.countoderitem }} Pieces</div>
        </div>
      </div>
    </div>
    <div>
      <div class="row box-grid-2">
        <div class="box-2 col-6">
          <div class="graph">
            <!-- //graph -->
            <q-tab-panel name="statistic">
              <OrderChart class="graph" />
            </q-tab-panel>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import axios from 'axios'
import OrderChart from 'src/components/OrderComponent/OrderChart.vue'
import type { PopularProductSale } from 'src/models'
import { useAuthStore } from 'src/stores/authStore'
import { useOrderStore } from 'src/stores/orderStore'
import { onMounted, ref, watch } from 'vue'
const store = useOrderStore()
const authStore = useAuthStore()
let totalReceivedToday = store.todayTotalReceived
watch(
  () => store.orders,
  () => {
    totalReceivedToday = store.todayTotalReceived
  },
  { immediate: true }, // ให้มันทำงานทันทีเมื่อโหลดหน้า
)
onMounted(() => {
  store.fetchOrders()
})
const bestSellingProducts = ref<PopularProductSale[]>([])

const fetchBestSellingProducts = async () => {
  try {
    // ส่ง POST request ไปที่ API
    const response = await axios.post('http://localhost:3000/orders/popular', {
      roleId: 3, // หรือส่งค่า roleId ที่เกี่ยวข้อง
      userId: 123, // userId ของผู้ใช้
      branchId: 1, // branchId ถ้ามี
    })

    bestSellingProducts.value = response.data
  } catch (error) {
    console.error('Error fetching best-selling products:', error)
  }
}

onMounted(() => {
  fetchBestSellingProducts()
})

const items = [
  { id: 1, name: 'Americano' },
  { id: 2, name: 'CookieCream' },
  { id: 3, name: 'ThaiTea' },
  { id: 4, name: 'HoneyLemon' },
  { id: 5, name: 'Hot Americano' },
  { id: 6, name: 'Hot Cappuccino' },
  { id: 7, name: 'Hot Espresso' },
  { id: 8, name: 'Hot GreenTea' },
  { id: 9, name: 'Hot Latte' },
  { id: 10, name: 'Hot Moccha' },
  { id: 11, name: 'Hot ThaiTea' },
  { id: 12, name: 'BlackTea' },
  { id: 13, name: 'Cappuccino' },
  { id: 14, name: 'Muffin' },
  { id: 15, name: 'ChocoCake' },
  { id: 16, name: 'Croissant' },
  { id: 17, name: 'VanillaCake' },
  { id: 18, name: 'Redvelvet' },
  { id: 19, name: 'Waffle' },
  { id: 20, name: 'Fries' },
  { id: 21, name: 'Sandwich' },
  { id: 22, name: 'Nugget' },
  { id: 23, name: 'Soi-Ju' },
  { id: 24, name: 'Larb-Goi' },
  { id: 25, name: 'Enn-Gai' },
  { id: 26, name: 'Muu-Dad-Deaw' },
  { id: 27, name: 'Ka-Prow-Muu-Krob (FOR MUSALIM)' },
]

// ฟังก์ชันที่เช็คว่า id ตรงกับชื่ออะไร
function getProductNameById(id: number) {
  const item = items.find((item) => item.id === id) // ค้นหาสินค้าที่มี id ตรงกับที่ระบุ

  if (item) {
    return item.name // ถ้าพบ id จะคืนชื่อของสินค้านั้น
  } else {
    return 'ไม่พบสินค้า' // ถ้าไม่พบ id จะคืนข้อความนี้
  }
}
</script>

<style scoped>
.product-page {
  background-color: #faf3e0;
}

.main-page {
  gap: 50px;
  justify-content: center;
  align-items: center;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* แถวบนมี 3 ช่อง */
  grid-template-rows: 1fr; /* แถวล่างเป็นช่องเดียว */
  margin-bottom: 20px;
  gap: 20px;
}

.grid-container-bt {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* แถวบนมี 3 ช่อง */
  grid-template-rows: 1fr; /* แถวล่างเป็นช่องเดียว */
  gap: 20px;
}

.grid-item {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f4f4f4; /* สีพื้นหลัง */
  border-radius: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* เงารอบๆ */
  padding: 200px;
  height: auto;
  width: auto; /* ทำให้แต่ละส่วนเต็มความสูงของกริด */
}

.box {
  padding-left: 20px;
  padding-top: 5px;
  width: 350px;
  height: 150px;
  background-color: #4b3533;
  border-radius: 15px;
  font-size: 20px;
  font-weight: bold;
}

.item-in-box {
  padding-top: 16px;
  padding-left: 20px;
  font-size: 50px;
}

.item-in-box2lay {
  padding-top: 16px;
  padding-left: 20px;
  font-size: 30px;
  line-height: 1;
}

.box-2 {
  padding-left: 20px;
  padding-top: 5px;
  width: 100%;
  max-width: 1525px;
  height: 450px;
  background-color: #4b3533;
  border-radius: 15px;
  font-size: 20px;
  font-weight: bold;
}

.graph {
  padding-left: 0px;
  padding-right: 20px;
  height: 400px !important;
}
.box-grid {
  padding-top: 40px;
  gap: 40px;
  justify-content: center;
  width: 100%;
}

.box-grid-2 {
  margin-top: 40px;
  gap: 40px;
  justify-content: center;
}

.top-left {
  background-color: #c0c0c0; /* สีพื้นหลังส่วนบนซ้าย */
}

.top-center {
  background-color: #e0e0e0; /* สีพื้นหลังส่วนบนกลาง */
}

.top-right {
  background-color: #d0d0d0; /* สีพื้นหลังส่วนบนขวา */
}

.bottom-left {
  background-color: #b0b0b0; /* สีพื้นหลังส่วนล่างซ้าย */
}

.bottom-right {
  background-color: #a0a0a0; /* สีพื้นหลังส่วนล่างขวา */
}
</style>
