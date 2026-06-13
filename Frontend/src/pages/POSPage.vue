<template>
  <q-page padding class="product-page column q-pa-md">
    <div class="my-content">
      <div class="row full-height">
        <!-- ฝั่งซ้าย -->
        <div class="col-7">
          <div class="header-row">
            <q-input filled v-model="search" label="ค้นหาด้วยชื่อสินค้า" class="search-box" dense>
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>

            <q-select
              filled
              v-model="filterType"
              :options="categoryOptions"
              label="เลือกหมวดหมู่"
              dense
              class="category-select"
              emit-value
              map-options
            />
          </div>

          <div class="product-scroll-area">
            <div class="product-grid">
              <q-card
                v-for="product in filteredProducts"
                :key="product.id"
                class="product-card cursor-pointer hoverable"
                @click="addToCart(product)"
                flat
                bordered
                v-ripple
              >
                <q-img
                  :src="'http://localhost:3000' + product.imageUrl"
                  class="product-image"
                  fit="cover"
                />
                <q-card-section>
                  <div class="text-subtitle2">{{ product.name }}</div>
                  <div class="text-caption text-brown">{{ product.price }} ฿</div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <!-- ฝั่งขวา -->
        <div class="col-5">
          <!-- ด้านบน -->
          <q-card
            flat
            bordered
            class="q-pa-md bg-white cart-box column justify-between"
            style="max-height: 400px"
          >
            <q-card-section>
              <div class="text-h6">
                <q-icon name="shopping_cart" size="32px" class="q-mb-sm" />ตะกร้าสินค้า
              </div>
            </q-card-section>

            <q-separator v-if="orderStore.items.length" />

            <q-card-section v-if="orderStore.items.length === 0" class="scroll-area-no-product">
              <div class="text-grey text-center">ยังไม่มีสินค้าในตะกร้า</div>
            </q-card-section>

            <q-card-section v-else class="cart-items-scroll">
              <div class="cart-scroll-area">
                <q-list separator>
                  <q-item v-for="item in orderStore.items" :key="item.productId" class="q-py-sm">
                    <q-item-section>
                      <div class="text-subtitle2">{{ item.name }}</div>
                      <div class="text-caption">x{{ item.quantity }}</div>
                    </q-item-section>

                    <q-item-section side>
                      <div class="text-subtitle2">{{ item.price * item.quantity }} ฿</div>
                    </q-item-section>

                    <q-item-section side>
                      <div class="row items-center no-wrap">
                        <q-btn size="sm" round dense icon="remove" @click="decreaseQty(item)" />
                        <div class="q-mx-sm">{{ item.quantity }}</div>
                        <q-btn size="sm" round dense icon="add" @click="increaseQty(item)" />
                        <q-btn
                          flat
                          dense
                          icon="delete"
                          color="red"
                          @click="removeFromCart(item.productId)"
                        />
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </q-card-section>
          </q-card>
          <!-- ด้านล่าง -->
          <q-card
            flat
            bordered
            class="q-pa-md bg-white manage-cart-box column justify-between"
            style="margin-top: 20px; height: auto"
          >
            <div class="row">
              <div class="col">
                <q-card-section>
                  <div class="row justify-between">
                    <div><strong>รวม</strong></div>
                    <div>
                      <strong>{{ totalPrice }} ฿</strong>
                    </div>
                  </div>
                </q-card-section>
              </div>
              <div class="col">
                <q-card-actions align="right" class="row justify-end q-gutter-sm">
                  <!-- ปุ่มเคลียร์ตะกร้าแสดงเฉพาะเมื่อมีสินค้าในตะกร้า -->

                  <q-btn color="primary" label="ตรวจสอบคำสั่งซื้อ" @click="openConfirmDialog" />
                  <q-btn @click="openDialogAddCus()" color="primary" label="เพิ่มสมาชิก" />
                  <q-btn
                    v-if="orderStore.items.length > 0"
                    color="negative"
                    label="ยกเลิก"
                    @click="clearCart"
                  />
                </q-card-actions>
              </div>
            </div>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
  <!-- ใบเสร็จ -->
  <!-- ใบเสร็จรับเงิน -->
  <!-- ใบเสร็จรับเงิน -->
  <q-dialog v-model="showReceiptDialog">
    <q-card flat bordered class="q-pa-md" style="width: 700px">
      <q-card-section>
        <div class="text-h6">ใบเสร็จรับเงิน</div>
      </q-card-section>

      <q-separator />

      <q-card-section v-if="orderReceipt">
        <q-list>
          <q-item v-for="item in orderReceipt.items" :key="item.productId" class="q-py-sm">
            <q-item-section>
              <div class="text-subtitle2">{{ item.product?.name || 'สินค้า' }}</div>
              <div class="text-caption">x{{ item.quantity }}</div>
            </q-item-section>
            <q-item-section side>
              <div class="text-subtitle2">{{ item.price * item.quantity }} ฿</div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="row justify-between">
          <div><strong>รวม</strong></div>
          <div>
            <strong>{{ orderReceipt?.total }} ฿</strong>
          </div>
        </div>
        <div class="row justify-between">
          <div><strong>ส่วนลดโปรโมชั่น</strong></div>
          <div>
            <strong>{{ orderReceipt?.discountAmount }} ฿</strong>
          </div>
        </div>
        <div class="row justify-between">
          <div><strong>แต้มที่ใช้</strong></div>
          <div>
            <strong>{{ orderReceipt?.usedPoints }} แต้ม</strong>
          </div>
        </div>
        <div class="row justify-between">
          <div><strong>ราคาสุทธิ</strong></div>
          <div>
            <strong>{{ orderReceipt?.totalAfterDiscount }} ฿</strong>
          </div>
        </div>
        <div class="row justify-between">
          <div><strong>รับเงิน</strong></div>
          <div>
            <strong>{{ orderReceipt?.receivedAmount }} ฿</strong>
          </div>
        </div>
        <div class="row justify-between">
          <div><strong>เงินทอน</strong></div>
          <div>
            <strong>{{ orderReceipt?.changeAmount }} ฿</strong>
          </div>
        </div>
        <div class="row justify-between">
          <div><strong>พนักงานขาย</strong></div>
          <div>
            <strong>{{ orderReceipt?.user?.name }}</strong>
          </div>
        </div>
        <div v-if="orderReceipt?.customer?.name" class="row justify-between">
          <div><strong>ชื่อลูกค้า</strong></div>
          <div>
            <strong>{{ orderReceipt.customer.name }}</strong>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn color="primary" label="ปิด" @click="showReceiptDialog = false" />
        <q-btn color="secondary" label="ดาวน์โหลด PDF" @click="generateReceiptPDF" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Dialog ยืนยันคำสั่งซื้อ -->
  <q-dialog v-model="showConfirmDialog">
    <q-card flat bordered class="q-pa-m" style="width: 700px">
      <q-card-section>
        <div class="text-h6">ยืนยันคำสั่งซื้อ</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-list>
          <q-item v-for="item in orderStore.items" :key="item.productId" class="q-py-sm">
            <q-item-section>
              <div class="text-subtitle2">{{ item.name }}</div>
              <div class="text-caption">x{{ item.quantity }}</div>
            </q-item-section>

            <q-item-section side>
              <div class="text-subtitle2">{{ item.price * item.quantity }} ฿</div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-py-sm"
        ><q-select
          v-model="selectedPromotion"
          label="เลือกโปรโมชั่น"
          :options="promotionOptions"
          filled
          emit-value
          map-options
          dense
      /></q-card-section>

      <q-card-section
        ><q-option-group
          align="right"
          class="q-py-sm"
          v-model="paymentMethod"
          :options="[
            { label: 'เงินสด', value: 'cash' },
            { label: 'โอนเงิน', value: 'transfer' },
            { label: 'บัตรเครดิต', value: 'credit_card' },
          ]"
          type="radio"
          label="เลือกวิธีชำระเงิน"
          dense
          inline
        />

        <!-- ช่องใส่เงินเฉพาะตอนเลือกเงินสด -->
        <q-input
          v-if="paymentMethod === 'cash'"
          v-model="receivedAmount"
          label="จำนวนเงินที่รับ"
          type="number"
          filled
          dense
          class="q-mt-sm"
          :rules="[(val) => val >= totalAfterDiscount || 'จำนวนเงินต้องไม่น้อยกว่าราคาที่ต้องชำระ']"
        />

        <div v-if="paymentMethod === 'transfer'" class="q-mt-md" align="center">
          <div class="text-subtitle1 q-mb-sm">สแกนเพื่อชำระเงิน</div>
          <qrcode-vue :value="qrValue" :size="200" />
        </div>

        <q-option-group
          v-model="isMember"
          type="radio"
          align="right"
          :options="[
            { label: 'สมาชิก', value: true },
            { label: 'ไม่ใช่สมาชิก', value: false },
          ]"
          inline
          class="q-mb-md"
        />

        <q-input
          v-if="isMember"
          filled
          v-model="phoneInput"
          label="ค้นหาลูกค้าด้วยเบอร์โทร"
          maxlength="10"
          @update:model-value="onSearch"
          class="q-mb-md"
          clearable
          :mask="'##########'"
          :rules="[(value) => /^\d{10}$/.test(value) || 'กรุณากรอกเบอร์โทร 10 หลัก']"
        />

        <q-option-group
          v-if="customerId"
          v-model="usePoint"
          type="radio"
          :options="[
            { label: 'ใช้แต้มสะสมลดราคา', value: true },
            { label: 'ไม่ใช้แต้มสะสม', value: false },
          ]"
          inline
          class="q-mb-sm"
          align="right"
        />

        <q-input
          v-if="usePoint && isMember"
          v-model="usedPoints"
          label="ใช้แต้มสะสมลดราคา"
          type="number"
          filled
          dense
          class="q-mt-sm"
          :rules="[(val) => val <= currentCusPoint || 'แต้มสะสมมีไม่เพียงพอ']"
        />

        <div><strong>พนักงานขาย</strong></div>
        <div>
          <strong>{{ usesrName }}</strong>
        </div>
        <div class="row justify-between" v-if="isMember && customerName">
          <div><strong>ชื่อลูกค้า</strong></div>
          <div>
            <strong>{{ customerName }}</strong>
          </div>
          <div><strong>แต้มคงเหลือ</strong></div>
          <div>
            <strong>{{ currentCusPoint }}</strong>
          </div>
        </div>
      </q-card-section>

      <!-- รายละเอียดด้านล่าง -->
      <q-card-section>
        <div class="row justify-between">
          <div><strong>แต้มที่ใช้</strong></div>
          <div>
            <strong>{{ usedPoints }} แต้ม</strong>
          </div>
        </div>
        <div class="row justify-between">
          <div><strong>แต้มที่ได้รับ</strong></div>
          <div>
            <strong>{{ earnedPoints }} แต้ม</strong>
          </div>
        </div>
        <div class="row justify-between">
          <div><strong>รวม</strong></div>
          <div>
            <strong>{{ totalPrice }} ฿</strong>
          </div>
        </div>
        <div class="row justify-between">
          <div><strong>ส่วนลดโปรโมชั่น</strong></div>
          <div>
            <strong>{{ discountAmount }} ฿</strong>
          </div>
        </div>
        <div class="row justify-between">
          <div><strong>ราคาสุทธิ</strong></div>
          <div>
            <strong>{{ totalAfterDiscount }} ฿</strong>
          </div>
        </div>
        <div class="row justify-between">
          <div><strong>เงินทอน</strong></div>
          <div>
            <strong>{{ changeAmount }} ฿</strong>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="ยกเลิก" @click="closeConfirmDialog" />
        <q-btn color="primary" label="ยืนยัน" @click="confirmOrder" />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <!-- Dialog เพิ่ม/แก้ไข Customer -->
  <CustomerFormDialog v-model="dialogCus" :customer="customerStore.form" @submit="handleSave" />
</template>

<script setup lang="ts">
import type { Category, Customer, Order, Product } from 'src/models'
import { useCategoryStore } from 'src/stores/categoryStore'
import { useOrderStore } from 'src/stores/orderStore'
import { useProductStore } from 'src/stores/productStore'
import { computed, onMounted, ref, watch } from 'vue'
import axios from 'axios'
import { useQuasar } from 'quasar'
import { usePromotionStore } from 'src/stores/promotionStore'
import { useCustomerStore } from 'src/stores/customerStore'
import { useAuthStore } from 'src/stores/authStore'
import QrcodeVue from 'qrcode.vue'
import CustomerFormDialog from 'src/components/CustomerComponent/CustomerFormDialog.vue'
import generatePayload from 'promptpay-qr'

const $q = useQuasar()

const authStore = useAuthStore()
const currentUser = authStore.user
const categoryStore = useCategoryStore()
const productStore = useProductStore()
const orderStore = useOrderStore()
const promotionStore = usePromotionStore()
const customerStore = useCustomerStore()
const phoneInput = ref('')
const currentCusPoint = computed(() => CustomerByTel.value[0]?.point ?? '')
const CustomerByTel = ref<Customer[]>([])
const usesrName = currentUser?.name
const customerName = computed(() => CustomerByTel.value[0]?.name ?? '')
// const phone_number = ref('')
// ข้อมูลก่อนส่งไปออเดอร์
const customerId = computed(() => CustomerByTel.value[0]?.id ?? null)
const usePoint = ref(false) //เช็คว่าเลือกใช้การลดราคาไหม
const usedPoints = ref(0)
const earnedPoints = computed(() => {
  return Math.floor(totalAfterDiscount.value / 100)
})
const selectedPromotion = ref<number | null>(null)
// ราคาก่อนลด (รวมจากสินค้าใน orderStore)
const totalPrice = computed(() => {
  return orderStore.items.reduce((total, item) => total + item.price * item.quantity, 0)
})
const discountAmount = computed(() => {
  const total = totalPrice.value
  const promotion = promotionStore.promotions.find((p) => p.id === selectedPromotion.value)

  let promoDiscount = 0

  if (promotion) {
    if (promotion.type === 'PERCENT') {
      promoDiscount = total * (promotion.value / 100)
    } else if (promotion.type === 'FIXED') {
      promoDiscount = promotion.value
    }
  }

  const pointDiscount = Number(usedPoints.value) // เผื่อเป็น string

  return promoDiscount + pointDiscount
})

// ราคาหลังลด (อิงจาก totalPrice และ selectedPromotion)
const totalAfterDiscount = ref(0)
const receivedAmount = ref(0)

const changeAmount = computed(() => {
  return receivedAmount.value - totalAfterDiscount.value
})

const promotionOptions = computed(() => [
  { label: 'ไม่มีโปรโมชั่น', value: null },
  ...promotionStore.promotions.map((promotion) => ({
    label: promotion.name,
    value: promotion.id,
  })),
])
const isMember = ref<boolean | null>(null)
onMounted(async () => {
  await productStore.getProducts()
  await categoryStore.getCategories()
  await customerStore.getCustomers()
  await promotionStore.fetchPromotion()
  await console.log(currentUser)
  console.log(currentUser?.branch?.id)
})

onMounted(() => {
  if (paymentMethod.value === 'transfer') {
    qrValue.value = generatePayload(phone, { amount: totalAfterDiscount.value })
  }
})
const search = ref('')
const filterType = ref<number | null>(null)
// หาลูกค้าตามเบอ
function onSearch(val: string | number | null) {
  const keyword = val?.toString() ?? ''
  if (keyword.length === 10) {
    // ค้นหาลูกค้าที่เบอร์ตรงเป๊ะ
    const customersFound = customerStore.customers.filter((c) => c.phoneNumber === keyword)
    CustomerByTel.value = customersFound
  } else {
    CustomerByTel.value = []
  }
}

// สมมุติเป็น promptpay หรือบัญชีธนาคารก็ใส่ link ได้เลย
const phone = '0657248255' // เบอร์พร้อมเพย์
const amount = totalAfterDiscount // จำนวนเงินเริ่มต้น

// สร้าง URL สำหรับ PromptPay
const qrValue = ref(`https://promptpay.io/${phone}/${amount.value.toFixed(2)}`)
const paymentMethod = ref<'cash' | 'transfer' | 'credit_card'>('cash')
const categoryOptions = computed(() => [
  { label: 'ทั้งหมด', value: null },
  ...categoryStore.categories.map((category: Category) => ({
    label: category.name,
    value: category.id,
  })),
])
// เกี่ยวกับการเพิ่มสมาชิก
const dialogCus = ref(false)
function openDialogAddCus() {
  customerStore.form = {
    id: 0,
    name: '',
    surname: '',
    phoneNumber: '',
    birthDate: '',
    age: 10,
    gender: 'male',
    point: 0,
    imageUrl: '',
  }
  dialogCus.value = true
}
async function handleSave(customer: Customer, file: File | null) {
  try {
    if (customer.id === 0) {
      await customerStore.addCustomer(customer, file)
    } else {
      await customerStore.updateCustomer(customer, file)
    }
    dialogCus.value = false
  } catch (error) {
    console.error('Error saving customer:', error)
  }
}
const filteredProducts = computed(() => {
  let filtered = productStore.products

  if (search.value) {
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(search.value.toLowerCase()))
  }

  if (filterType.value !== null && filterType.value !== undefined) {
    filtered = filtered.filter((p) => p.category?.id === filterType.value)
  }

  return filtered
})

function addToCart(product: Product) {
  orderStore.addItem(product)
}

function increaseQty(item: { productId: number; quantity: number }) {
  orderStore.changeQuantity(item.productId, item.quantity + 1)
}

function decreaseQty(item: { productId: number; quantity: number }) {
  if (item.quantity > 1) {
    orderStore.changeQuantity(item.productId, item.quantity - 1)
  } else {
    removeFromCart(item.productId)
  }
}

function removeFromCart(productId: number) {
  orderStore.removeItem(productId)
}

function clearCart() {
  orderStore.clearOrder()
  $q.notify({
    type: 'info',
    message: 'เคลียร์ตะกร้าสินค้าเรียบร้อย',
    position: 'top',
  })
}
// อัปเดตราคาหลังลดเมื่อ totalPrice หรือ promotion เปลี่ยน
watch(
  [totalPrice, selectedPromotion, usedPoints],
  () => {
    let total = totalPrice.value

    const promotion = promotionStore.promotions.find((p) => p.id === selectedPromotion.value)
    if (promotion) {
      if (promotion.type === 'PERCENT') {
        total -= total * (promotion.value / 100)
      } else if (promotion.type === 'FIXED') {
        total -= promotion.value
      }
    }

    const pointDiscount = Number(usedPoints.value) || 0
    total -= pointDiscount

    totalAfterDiscount.value = total < 0 ? 0 : total // ป้องกันติดลบ
  },
  { immediate: true }
)

onMounted(() => {
  watch([paymentMethod, amount], ([method, amt]) => {
    if (method === 'transfer') {
      qrValue.value = generatePayload(phone, { amount: totalAfterDiscount.value })
    } else if (method === 'credit_card') {
      qrValue.value = `https://paymentgateway.com/${amt.toFixed(2)}` // ตัวอย่าง URL สำหรับการชำระเงินผ่านบัตร
    } else {
      qrValue.value = '' // ถ้าไม่มีวิธีการชำระเงินที่เลือก
    }
  })
})
watch(isMember, (val) => {
  if (val === false) {
    phoneInput.value = ''
    CustomerByTel.value = []
    usedPoints.value = 0
    usePoint.value = false
  }
})
watch(usePoint, (val) => {
  if (val === false) {
    usedPoints.value = 0
  }
})
watch([paymentMethod, totalAfterDiscount], ([method, total]) => {
  if (method === 'transfer' || method === 'credit_card') {
    receivedAmount.value = total
  } else {
    receivedAmount.value = 0
  }
})
const showConfirmDialog = ref(false)

function openConfirmDialog() {
  if (orderStore.items.length === 0) {
    // แจ้งเตือนผู้ใช้ว่าไม่มีสินค้าในตะกร้า
    $q.notify({
      type: 'warning',
      message: 'กรุณาเพิ่มสินค้าลงในตะกร้าก่อนทำการสั่งซื้อ',
      position: 'top',
    })
    return
  }

  showConfirmDialog.value = true
}

function closeConfirmDialog() {
  showConfirmDialog.value = false
}

const showReceiptDialog = ref(false)
const orderReceipt = ref<Order | null>(null)

async function confirmOrder() {
  if (
    usePoint.value &&
    (!usedPoints.value ||
      Number(usedPoints.value) <= 0 ||
      Number(usedPoints.value) > Number(currentCusPoint.value))
  ) {
    $q.notify({
      type: 'negative',
      message: 'กรุณากรอกจำนวนแต้มสะสมให้ถูกต้อง',
    })
    return
  }

  if (paymentMethod.value === 'cash' && receivedAmount.value < totalAfterDiscount.value) {
    $q.notify({
      type: 'negative',
      message: 'จำนวนเงินที่รับต้องไม่น้อยกว่าราคาที่ต้องชำระ',
      position: 'top',
    })
    return // หยุดไม่ให้ยืนยันต่อ
  }
  if (isMember.value && phoneInput.value.trim() === '') {
    $q.notify({
      type: 'negative',
      message: 'กรุณากรอกเบอร์โทรสำหรับสมาชิก',
    })
    return
  }

  const order = {
    userId: currentUser?.id,
    branchId: currentUser?.branch?.id,
    customerId: customerId.value,
    promotionId: selectedPromotion.value,
    paymentMethod: paymentMethod.value,
    total: totalPrice.value,
    discountAmount: discountAmount.value,
    totalAfterDiscount: totalAfterDiscount.value,
    receivedAmount: receivedAmount.value,
    changeAmount: changeAmount.value,
    usedPoints: usedPoints.value,
    earnedPoints: earnedPoints.value,
    items: orderStore.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
    })),
  }
  // Log ข้อมูล order ที่กำลังจะส่งไป
  console.log('Order to be sent:', order)
  phoneInput.value = ''
  usedPoints.value = 0
  try {
    const response = await axios.post('http://localhost:3000/orders', order)
    console.log('Order confirmed:', response.data)
    orderReceipt.value = response.data // เก็บข้อมูลใบเสร็จ
    showConfirmDialog.value = false
    showReceiptDialog.value = true // แสดงใบเสร็จ
    orderStore.clearOrder()
  } catch (error) {
    console.error('Error confirming order:', error)
  }
}
//ใบเสร็จ pdf
import { jsPDF } from 'jspdf'

// นำเข้าฟอนต์ Sarabun จาก assets
import sarabunRegular from 'src/assets/fonts/Sarabun-Regular.ttf'

function generateReceiptPDF() {
  try {
    if (!orderReceipt.value) return
    const receipt = orderReceipt.value

    const margin = 10
    const lineGap = 8
    const baseHeight = 60 // ส่วนหัว + footer
    const itemCount = receipt.items.length
    const dynamicHeight = baseHeight + itemCount * lineGap + 15 * lineGap // เพิ่มพื้นที่ส่วนรวม ยืดหยุ่นได้

    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: [120, dynamicHeight], // กว้าง 12cm ยาวตามจำนวนรายการ
    })

    doc.addFont(sarabunRegular, 'Sarabun', 'normal')
    doc.setFont('Sarabun', 'normal')
    doc.setFontSize(16)

    let y = 10
    doc.text('ใบเสร็จรับเงิน', margin, y)
    y += lineGap + 2

    doc.setFontSize(14)

    // รายการสินค้า
    receipt.items.forEach((item) => {
      const itemName = `${item.product?.name || 'สินค้า'} x${item.quantity}`
      const itemTotal = item.price * item.quantity

      doc.text(itemName, margin, y)
      doc.text(`${itemTotal.toLocaleString()} ฿`, 120 - margin, y, { align: 'right' })
      y += lineGap
    })

    y += lineGap

    // รวม
    doc.text(`รวม: ${receipt.total.toLocaleString()} ฿`, margin, y)
    y += lineGap

    // ส่วนลด
    doc.text(`โปรโมชั่น: ${receipt.promotion?.name} ฿`, margin, y)
    y += lineGap

    // ส่วนลด
    doc.text(`ส่วนลดโปรโมชั่น: ${receipt.discountAmount.toLocaleString()} ฿`, margin, y)
    y += lineGap

    // แต้ม
    doc.text(`แต้มที่ใช้: ${receipt.usedPoints} แต้ม`, margin, y)
    y += lineGap

    // ราคาสุทธิ
    doc.text(`ราคาสุทธิ: ${receipt.totalAfterDiscount.toLocaleString()} ฿`, margin, y)
    y += lineGap

    // รับเงิน
    doc.text(`รับเงิน: ${(receipt.receivedAmount ?? 0).toLocaleString()} ฿`, margin, y)
    y += lineGap

    // เงินทอน
    doc.text(`เงินทอน: ${(receipt.changeAmount ?? 0).toLocaleString()} ฿`, margin, y)
    y += lineGap

    // วิธีการชำระเงิน
    doc.text(`วิธีการชำระเงิน: ${receipt.paymentMethod}`, margin, y)
    y += lineGap

    // พนักงานขาย
    if (receipt.user?.name) {
      doc.text(`พนักงานขาย: ${currentUser?.name || ''}`, margin, y)
      y += lineGap
    }

    // ลูกค้า
    if (receipt.customer) {
      doc.text(`ชื่อลูกค้า: ${receipt.customer.name}`, margin, y)
      y += lineGap
    }

    // วันที่
    const createdAt = new Date(receipt.createdAt || new Date())
    doc.text(`วันที่: ${createdAt.toLocaleString('th-TH')}`, margin, y)
    y += lineGap

    // เส้นคั่น
    y += 5
    doc.setLineWidth(0.5)
    doc.line(margin, y, 120 - margin, y)

    // บันทึก PDF
    // บันทึก PDF แบบเปิดในแท็บใหม่
    const pdfBlob = doc.output('blob')
    const pdfUrl = URL.createObjectURL(pdfBlob)
    window.open(pdfUrl, '_blank')
  } catch (error) {
    console.error('PDF Generate Error:', error)
  }
}
</script>

<style scoped>
.my-content {
  padding: 20px;
  /* ปรับขนาดให้เต็มหน้าจอ */
  height: 90vh;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden; /* ป้องกันการ scroll */
}
.product-page {
  background-color: #faf3e0;
}
.header-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
.search-box {
  width: 75%;
}
.product-scroll-area {
  max-height: calc(100vh - 170px); /* ปรับเลขให้พอดีกับองค์ประกอบอื่น เช่น input, select, margin */
  overflow-y: auto;
  padding-right: 8px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
}
.product-card {
  width: 170px;
}
.product-image {
  height: 150px;
  width: 100%;
  object-fit: cover;
}
.product-card.hoverable {
  transition: transform 0.1s, box-shadow 0.1s;
}
.product-card.hoverable:active {
  transform: scale(0.85);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
.product-card.hoverable:hover {
  background-color: rgba(0, 0, 0, 0.03);
}
.cart-box {
  height: 600px;
  width: 100%;
  max-width: 90%;
  margin: auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.manage-cart-box {
  height: 90px;
  width: 100%;
  max-width: 90%;
  margin: auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.cart-items-scroll {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}
</style>
