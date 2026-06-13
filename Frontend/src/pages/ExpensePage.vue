<template>
  <q-page padding class="custom-page">
    <div class="row q-mb-md">
      <q-tabs v-model="selectedSection" dense class="tab-container">
        <q-tab name="tableexpense" label="รายการค่าใช้จ่ายอื่นๆ" v-if="canViewTableExpense" />
        <q-tab name="Summaryexpenses" label="สรุปค่าใช้จ่าย" v-if="canViewSummary" />
        <q-tab name="report" label="รายงาน(กราฟ)" v-if="canViewReport" />
      </q-tabs>

      <q-tab-panels v-model="selectedSection" animated class="tab-panels">
        <!-- "Owner" และ "Admin" สามารถเข้าถึงได้ทุกหน้า -->
        <q-tab-panel name="tableexpense" v-if="isOwner || isAdmin"> </q-tab-panel>

        <!-- รายงานและสรุปข้อมูล -->
        <q-tab-panel name="Summaryexpenses" v-if="isOwner || isAdmin"> </q-tab-panel>

        <!-- "User" สามารถเข้าถึงได้แค่หน้า "ค่าใช้จ่ายอื่นๆ" -->
        <q-tab-panel name="report" v-if="isUser">
          <q-table :rows="filteredExpenses" :columns="columns" row-key="id" class="q-mt-md" />
        </q-tab-panel>
      </q-tab-panels>
    </div>

    <q-tab-panels v-model="selectedSection" animated class="tab-panels">
      <!-- ค่าใช้จ่ายอื่นๆ -->
      <q-tab-panel name="tableexpense">
        <div class="row items-center q-gutter-sm q-mb-md">
          <div class="text-subtitle1 q-mr-sm">รายการค่าใช้จ่าย</div>
          <q-input filled v-model="searchTerm" label="ค้นหา" debounce="300" style="width: 550px" />
          <q-select
            filled
            v-model="filterType"
            :options="['ทั้งหมด', 'ค่าน้ำ', 'ค่าไฟ', 'ค่าเช่า', 'อื่นๆ']"
            label="Filter"
            style="width: 180px"
          />
          <q-btn icon="clear" color="red" @click="clearSearch" class="equal-btn q-mx-xs"
            >Reset</q-btn
          >
          <q-btn icon="add" color="green" @click="openDialog" class="equal-btn q-mx-xs">Add</q-btn>
        </div>
        <q-dialog v-model="dialog" persistent>
          <q-card style="min-width: 350px">
            <q-card-section>
              <div class="text-h6">Add Expense</div>
            </q-card-section>
            <q-card-section class="q-pt-none">
              <q-form ref="form" @submit.prevent="save">
                <q-input filled v-model="formData.name" label="ชื่อ" class="q-mb-md" />
                <q-select
                  filled
                  v-model="formData.branch"
                  :options="branchOptions"
                  label="สาขา"
                  class="q-mb-md"
                  :disable="isAdmin || isUser"
                />

                <q-input
                  filled
                  v-model="formData.datetime"
                  type="datetime-local"
                  label="วันที่ เวลา"
                  class="q-mb-md"
                />
                <q-input
                  filled
                  v-model.number="formData.amount"
                  type="number"
                  label="จำนวน (บาท)"
                  class="q-mb-md"
                  @blur="formatAmount"
                  :step="0.01"
                />
                <q-select
                  filled
                  v-model="formData.type"
                  :options="['ค่าน้ำ', 'ค่าไฟ', 'ค่าเช่า', 'อื่นๆ']"
                  label="ประเภท"
                  class="q-mb-md"
                />
                <div class="row justify-end">
                  <q-btn
                    label="Cancel"
                    color="primary"
                    flat
                    @click="dialog = false"
                    class="q-mr-sm"
                  />
                  <q-btn label="Save" color="primary" type="submit" />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </q-dialog>

        <!-- ตารางข้อมูลในหน้าสรุปค่าใช้จ่าย -->
        <q-table :rows="filteredExpenses" :columns="columns" row-key="id" class="q-mt-md" />
      </q-tab-panel>

      <!-- รายงานกราฟ -->
      <q-tab-panel name="report">
        <div class="q-pa-md">
          <!-- กราฟในหน้ารายงานค่าใช้จ่าย -->
          <YearExpense title="กราฟรายปี" :expenses="filteredExpenses" :typeFilter="null" />
          <ExpenseCategoryChart title="ค่าน้ำ" :expenses="filteredExpenses" typeFilter="ค่าน้ำ" />
          <ExpenseCategoryChart title="ค่าไฟ" :expenses="filteredExpenses" typeFilter="ค่าไฟ" />
          <ExpenseCategoryChart title="ค่าเช่า" :expenses="filteredExpenses" typeFilter="ค่าเช่า" />
          <ExpenseCategoryChart
            title="ค่าใช้จ่ายอื่นๆ"
            :expenses="filteredExpenses"
            typeFilter="อื่นๆ"
          />
          <ExpenseCategoryChart
            title="รวมทั้งหมด"
            :expenses="filteredExpenses"
            :typeFilter="null"
          />
        </div>
      </q-tab-panel>

      <!-- สรุปค่าใช้จ่าย (แสดงตารางแยกประเภท) -->
      <!-- ตาราง สรุปค่าใช้จ่าย ในหน้า "สรุปค่าใช้จ่าย" -->
      <q-tab-panel name="Summaryexpenses">
        <div class="q-pa-md">
          <q-card class="q-pa-md q-mb-lg">
            <!-- ปิดทั้งส่วนเมื่อเป็น Admin หรือ User -->
            <q-option-group
              v-if="isOwner"
              type="checkbox"
              v-model="selectedBranches"
              :options="[
                { label: 'สาขา 1', value: 'สาขา 1' },
                { label: 'สาขา 2', value: 'สาขา 2' },
              ]"
              inline
              hide-label
            />
          </q-card>
          <!-- เพิ่มส่วนเลือกปี -->
          <q-card class="q-pa-md q-mb-lg">
            <div class="text-subtitle1 q-mb-sm">เลือกปี</div>
            <q-option-group
              type="radio"
              v-model="selectedYearForSummary"
              :options="yearOptions"
              inline
            />
          </q-card>

          <!-- เพิ่มส่วนเลือกเดือน -->
          <q-card class="q-pa-md q-mb-lg">
            <div class="text-subtitle1 q-mb-sm">เลือกเดือน</div>
            <q-option-group
              type="checkbox"
              v-model="selectedMonths"
              :options="[
                { label: 'มกราคม', value: 1 },
                { label: 'กุมภาพันธ์', value: 2 },
                { label: 'มีนาคม', value: 3 },
                { label: 'เมษายน', value: 4 },
                { label: 'พฤษภาคม', value: 5 },
                { label: 'มิถุนายน', value: 6 },
                { label: 'กรกฎาคม', value: 7 },
                { label: 'สิงหาคม', value: 8 },
                { label: 'กันยายน', value: 9 },
                { label: 'ตุลาคม', value: 10 },
                { label: 'พฤศจิกายน', value: 11 },
                { label: 'ธันวาคม', value: 12 },
              ]"
              inline
            />
          </q-card>

          <q-card class="q-pa-md q-mb-lg">
            <div class="text-subtitle1 q-mb-sm">ค่าน้ำ</div>
            <q-table :rows="filteredSummaryExpenses[0] || []" :columns="columns" row-key="id" />
          </q-card>

          <q-card class="q-pa-md q-mb-lg">
            <div class="text-subtitle1 q-mb-sm">ค่าไฟ</div>
            <q-table :rows="filteredSummaryExpenses[1] || []" :columns="columns" row-key="id" />
          </q-card>

          <q-card class="q-pa-md q-mb-lg">
            <div class="text-subtitle1 q-mb-sm">ค่าเช่า</div>
            <q-table :rows="filteredSummaryExpenses[2] || []" :columns="columns" row-key="id" />
          </q-card>

          <q-card class="q-pa-md q-mb-lg">
            <div class="text-subtitle1 q-mb-sm">ค่าใช้จ่ายอื่นๆ</div>
            <q-table :rows="filteredSummaryExpenses[3] || []" :columns="columns" row-key="id" />
          </q-card>

          <q-card class="q-pa-md q-mb-lg">
            <div class="text-subtitle1 q-mb-sm">รวมทั้งหมด</div>
            <q-table :rows="filteredSummaryExpenses[4] || []" :columns="columns" row-key="id" />
          </q-card>
        </div>
        <q-btn
          icon="fa-solid fa-file-pdf"
          color="brown"
          @click="generateReceiptPDF"
          class="equal-btn q-mx-xs"
        >
          ดูสรุปรายเดือน บันทึกเป็น PDF
        </q-btn>

        <q-btn
          icon="fa-solid fa-file-pdf"
          color="brown"
          @click="generateAnnualSummaryPDF"
          class="equal-btn q-mx-xs"
        >
          ดูสรุปรายปี บันทึกเป็น PDF
        </q-btn>

        <!-- Dialog สำหรับเลือกปี -->
        <q-dialog v-model="yearDialog" persistent>
          <q-card style="min-width: 350px">
            <q-card-section>
              <div class="text-h6">เลือกปีที่ต้องการดู</div>
            </q-card-section>
            <q-card-section>
              <q-select
                v-model="selectedYearForSummary"
                :options="yearOptions"
                label="เลือกปี"
                class="q-mb-md"
              />
            </q-card-section>
            <q-card-actions>
              <q-btn label="Cancel" color="primary" flat @click="yearDialog = false" />
              <q-btn label="ดูสรุป" color="primary" @click="generateAnnualSummaryPDF" />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
// Import authStore (authentication store) instead of expenseStore for user data
import { useAuthStore } from 'src/stores/authStore'
import { useExpenseStore } from 'src/stores/expenseStore'
import type { QTableColumn } from 'quasar'
import ExpenseCategoryChart from 'src/components/ExpenseComponent/ExpenseCategoryChart.vue'
import YearExpense from 'src/components/ExpenseComponent/YearExpense.vue'

// Import Expense interface from store
import type { Expense } from 'src/stores/expenseStore'

const canViewTableExpense = computed(() => {
  return (
    currentUser.value?.role?.name === 'Owner' ||
    currentUser.value?.role?.name === 'Admin' ||
    currentUser.value?.role?.name === 'User'
  )
})

const canViewSummary = computed(() => {
  return currentUser.value?.role?.name === 'Owner' || currentUser.value?.role?.name === 'Admin'
})

const canViewReport = computed(() => {
  return currentUser.value?.role?.name === 'Owner' || currentUser.value?.role?.name === 'Admin'
})

// Initialize authStore to get the user data
const authStore = useAuthStore()
const store = useExpenseStore()

// Access current user from the authStore
const currentUser = computed(() => authStore.user) // Get user from authStore

const isOwner = computed(() => currentUser.value?.role?.name === 'Owner')
const isAdmin = computed(() => currentUser.value?.role?.name === 'Admin')
const isUser = computed(() => currentUser.value?.role?.name === 'User')

const dialog = ref(false)
const searchTerm = ref('')
const filterType = ref('ทั้งหมด')
const selectedSection = ref('tableexpense')
const selectedBranches = ref<string[]>(['สาขา 1', 'สาขา 2'])
const selectedMonths = ref<number[]>([]) // ตัวแปรสำหรับเก็บเดือนที่เลือก
const selectedYear = ref<number | null>(null) // ตัวแปรสำหรับปีที่เลือก
const branchOptions = ['สาขา 1', 'สาขา 2']
// กรองข้อมูลค่าใช้จ่ายตามบทบาทและสาขาของผู้ใช้
// กรองข้อมูลค่าใช้จ่ายตามบทบาทและสาขาของผู้ใช้
const filteredExpenses = computed(() => {
  if (!store.expenses || store.expenses.length === 0) {
    return [] // ถ้าไม่มีข้อมูลจะคืนค่า array ว่าง
  }

  return store.expenses
    .map((item) => {
      const branchName = item.branchId === 1 ? 'สาขา 1' : 'สาขา 2'
      return {
        ...item,
        branch: branchName,
      }
    })
    .filter((item) => {
      const matchType = filterType.value === 'ทั้งหมด' || item.type === filterType.value
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        item.datetime.toLowerCase().includes(searchTerm.value.toLowerCase())

      const expenseMonth = new Date(item.datetime).getMonth() + 1
      const matchMonth =
        selectedMonths.value.length === 0 || selectedMonths.value.includes(expenseMonth)

      const expenseYear = new Date(item.datetime).getFullYear()
      const matchYear = selectedYear.value === null || expenseYear === selectedYear.value

      // กรองข้อมูลตามสาขาของผู้ใช้
      let matchBranch = true
      if (isAdmin.value) {
        // หากเป็น Admin จะให้ดูข้อมูลเฉพาะสาขาของตัวเอง
        matchBranch = item.branch === currentUser.value?.branch?.name // ใช้ .name หาก currentUser.branch เป็นอ็อบเจ็กต์
      } else if (isUser.value) {
        // หากเป็น User จะให้ดูข้อมูลเฉพาะสาขาของตัวเอง
        matchBranch = item.branch === currentUser.value?.branch?.name // ใช้ .name หาก currentUser.branch เป็นอ็อบเจ็กต์
      } else if (isOwner.value) {
        matchBranch = true // Owner ดูได้ทุกสาขา
      }

      return matchType && matchSearch && matchBranch && matchMonth && matchYear
    })
})

const formData = ref({
  name: '',
  branch: '',
  datetime: '',
  amount: 0,
  type: 'ค่าน้ำ',
})

const columns: QTableColumn[] = [
  { name: 'id', label: 'ID', align: 'left', field: 'id' },
  { name: 'name', label: 'ชื่อ', align: 'left', field: 'name' },
  { name: 'branch', label: 'สาขา', align: 'left', field: 'branch' },
  { name: 'datetime', label: 'วันที่ เวลา', align: 'left', field: 'datetime' },
  {
    name: 'amount',
    label: 'จำนวน (บาท)',
    align: 'right',
    field: 'amount',
    // Format amount to 2 decimal places when displayed
    format: (val: number) => val.toFixed(2),
  },
  { name: 'type', label: 'ประเภท', align: 'left', field: 'type' },
]

function formatAmount() {
  // Ensure amount is formatted to 2 decimal places
  formData.value.amount = parseFloat(formData.value.amount.toFixed(2))
}

async function save() {
  // เพิ่มการแปลง branch เป็น branchId
  const expenseToAdd = {
    ...formData.value,
    branchId: formData.value.branch === 'สาขา 1' ? 1 : 2, // แปลง branch เป็น branchId
  }

  await store.addExpense(expenseToAdd) // ส่งข้อมูลไปที่ store
  dialog.value = false
  resetForm()
  store.fetchExpenses() // ดึงข้อมูลใหม่มาอัพเดต
}

function clearSearch() {
  searchTerm.value = ''
  filterType.value = 'ทั้งหมด'
}

function openDialog() {
  resetForm()
  dialog.value = true
}

function resetForm() {
  formData.value = {
    name: '',
    branch: currentUser.value?.branch?.name || 'สาขา 1',
    datetime: '',
    amount: 0,
    type: 'ค่าน้ำ',
  }
}

onMounted(async () => {
  await store.fetchExpenses() // รอจนกว่าข้อมูลจะถูกดึงมา
  console.log(store.expenses) // ตรวจสอบว่า store.expenses มีข้อมูลหรือไม่
})

// State สำหรับการเลือกปี
const yearDialog = ref(false)
const selectedYearForSummary = ref<number | null>(null)

// สร้างตัวเลือกปี (จะให้เป็นช่วงปีที่มีในข้อมูล)
// สร้างตัวเลือกปี (จะให้เป็นช่วงปีที่มีในข้อมูล)
const yearOptions = computed(() => {
  const years = new Set(store.expenses.map((exp) => new Date(exp.datetime).getFullYear()))
  return [...years].map((year) => ({ label: String(year), value: year }))
})

// ฟังก์ชันสร้าง PDF สรุปรายปี

function generateAnnualSummaryPDF() {
  // ตรวจสอบว่าเลือกปีที่ต้องการแล้วหรือไม่
  if (!selectedYearForSummary.value) {
    alert('กรุณาเลือกปีที่ต้องการดู')
    return
  }

  // กรณี Owner สามารถเลือกหลายสาขาได้, Admin เลือกได้แค่สาขาของตัวเอง
  let selectedBranchesToDisplay = selectedBranches.value

  if (isAdmin.value) {
    // หากเป็น Admin ให้เลือกสาขาของตัวเองเท่านั้น
    selectedBranchesToDisplay = [currentUser.value?.branch?.name || ''] // แสดงแค่สาขาที่ Admin อยู่
  }

  // ฟิลเตอร์ข้อมูลค่าใช้จ่ายตามปีที่เลือก
  const filteredByYear = store.expenses.filter(
    (exp) => new Date(exp.datetime).getFullYear() === selectedYearForSummary.value,
  )

  // กรองข้อมูลตามสาขาที่เลือก
  const filteredByBranch = filteredByYear.filter((exp) =>
    selectedBranchesToDisplay.includes(exp.branch),
  )

  // หากไม่มีข้อมูลตามที่กรอง ให้แจ้งเตือน
  if (filteredByBranch.length === 0) {
    alert('ไม่มีข้อมูลสำหรับปีนี้และสาขาที่เลือก')
    return
  }

  // สร้าง HTML สำหรับใบเสร็จ
  const receiptHTML = `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>สรุปค่าใช้จ่ายรายปี D-Coffee</title>
      <style>
        body {
          font-family: 'TH Sarabun New', sans-serif;
          margin: 0;
          padding: 0;
          font-size: 14px;
          line-height: 1.5;
        }
        .container {
          width: 100%;
          margin: 0 auto;
          padding: 20px;
          background-color: #fff;
          border-radius: 10px;
          box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .header img {
          width: 100px;
          height: 100px;
        }
        .header h1 {
          font-size: 24px;
          margin-top: 10px;
        }
        .details {
          margin-top: 20px;
        }
        .section-title {
          font-weight: bold;
          margin-top: 20px;
          font-size: 18px;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        .table th, .table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        .table th {
          background-color: #f4f4f4;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 14px;
          font-weight: bold;
        }
        .total {
          font-size: 18px;
          font-weight: bold;
          margin-top: 20px;
        }
        .align-left {
          text-align: left;
        }
        .align-right {
          text-align: right;
        }
        .date {
          text-align: right;
          font-size: 14px;
          margin-top: 30px;
        }
        @media print {
          @page {
            size: A4;
            margin: 20mm; /* ขนาดขอบเท่ากับ A4 */
          }
          body {
            margin: 20mm; /* กำหนดมาร์จินขอบ A4 */
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Logo and Title -->
        <div class="header">
          <img src="public/logo/D-CoffeeLogo-Black.png" alt="D.Coffee Logo">
          <h1>สรุปค่าใช้จ่ายรายปี D-Coffee</h1>
        </div>

        <!-- สาขา, ปี (Left Aligned) -->
        <div class="details align-left">
          <p>สาขา: ${selectedBranchesToDisplay.join(', ') || 'ทุกสาขา'}</p>
          <p>ปี: ${selectedYearForSummary.value}</p>
        </div>

        <!-- รายการค่าใช้จ่าย -->
        <div class="section-title">รายการค่าใช้จ่าย</div>
        <table class="table">
          <thead>
            <tr>
              <th>ประเภท</th>
              <th>จำนวน</th>
              <th>ยอดรวม</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>ค่าน้ำ</td>
              <td>${filteredByBranch.filter((exp) => exp.type === 'ค่าน้ำ').length || 0}</td>
              <td>฿ ${
                filteredByBranch
                  .filter((exp) => exp.type === 'ค่าน้ำ')
                  .reduce((acc, curr) => acc + curr.amount, 0)
                  .toFixed(2) || 0
              }</td>
            </tr>
            <tr>
              <td>ค่าไฟ</td>
              <td>${filteredByBranch.filter((exp) => exp.type === 'ค่าไฟ').length || 0}</td>
              <td>฿ ${
                filteredByBranch
                  .filter((exp) => exp.type === 'ค่าไฟ')
                  .reduce((acc, curr) => acc + curr.amount, 0)
                  .toFixed(2) || 0
              }</td>
            </tr>
            <tr>
              <td>ค่าเช่า</td>
              <td>${filteredByBranch.filter((exp) => exp.type === 'ค่าเช่า').length || 0}</td>
              <td>฿ ${
                filteredByBranch
                  .filter((exp) => exp.type === 'ค่าเช่า')
                  .reduce((acc, curr) => acc + curr.amount, 0)
                  .toFixed(2) || 0
              }</td>
            </tr>
            <tr>
              <td>ค่าใช้จ่ายอื่นๆ</td>
              <td>${filteredByBranch.filter((exp) => exp.type === 'อื่นๆ').length || 0}</td>
              <td>฿ ${
                filteredByBranch
                  .filter((exp) => exp.type === 'อื่นๆ')
                  .reduce((acc, curr) => acc + curr.amount, 0)
                  .toFixed(2) || 0
              }</td>
            </tr>
          </tbody>
        </table>

        <!-- ยอดรวมทั้งหมด -->
        <div class="total">
          <p>รวมทั้งหมด: ฿ ${filteredByBranch.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}</p>
        </div>

        <!-- Footer -->
        <div class="footer">
          <!-- Removed "NO VAT" as per the request -->
        </div>

        <!-- วันที่ (Right Aligned) -->
        <div class="date">
          <p>วันที่: ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </body>
    </html>
  `

  // เปิดหน้าต่างใหม่เพื่อแสดงใบเสร็จ
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Please allow pop-ups for printing receipts.')
    return
  }

  // เขียน HTML ลงในหน้าใหม่
  printWindow.document.write(receiptHTML)
  printWindow.document.close()

  // เมื่อหน้าต่างโหลดเสร็จแล้ว ให้ทำการพิมพ์
  printWindow.onload = function () {
    setTimeout(() => {
      printWindow.focus()
      printWindow.print()
      printWindow.onafterprint = function () {
        printWindow.close()
      }
    }, 1000)
  }
}

// ฟังก์ชันสำหรับสร้าง PDF

function generateReceiptPDF() {
  if (!selectedYearForSummary.value || selectedMonths.value.length === 0) {
    alert('กรุณาเลือกปีและเดือนเพื่อดูสรุป')
    return
  }

  // กรณี Owner สามารถเลือกหลายสาขาได้, Admin เลือกได้แค่สาขาของตัวเอง
  let selectedBranchesToDisplay = selectedBranches.value

  if (isAdmin.value) {
    // หากเป็น Admin ให้เลือกสาขาของตัวเองเท่านั้น
    selectedBranchesToDisplay = [currentUser.value?.branch?.name || ''] // แสดงแค่สาขาที่ Admin อยู่
  }

  const receiptHTML = `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>สรุปค่าใช้จ่ายรายเดือน D-Coffee</title>
      <style>
        body {
          font-family: 'TH Sarabun New', sans-serif;
          margin: 0;
          padding: 0;
          font-size: 14px;
          line-height: 1.5;
        }
        .container {
          width: 100%;
          margin: 0 auto;
          padding: 20px;
          background-color: #fff;
          border-radius: 10px;
          box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .header img {
          width: 100px;
          height: 100px;
        }
        .header h1 {
          font-size: 24px;
          margin-top: 10px;
        }
        .details {
          margin-top: 20px;
        }
        .section-title {
          font-weight: bold;
          margin-top: 20px;
          font-size: 18px;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        .table th, .table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        .table th {
          background-color: #f4f4f4;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 14px;
          font-weight: bold;
        }
        .total {
          font-size: 18px;
          font-weight: bold;
          margin-top: 20px;
        }
        .align-left {
          text-align: left;
        }
        .align-right {
          text-align: right;
        }
        .date {
          text-align: right;
          font-size: 14px;
          margin-top: 30px;
        }
        @media print {
          @page {
            size: A4;
            margin: 20mm; /* ขนาดขอบเท่ากับ A4 */
          }
          body {
            margin: 20mm; /* กำหนดมาร์จินขอบ A4 */
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Logo and Title -->
        <div class="header">
          <img src="public/logo/D-CoffeeLogo-Black.png" alt="D.Coffee Logo">
          <h1>สรุปค่าใช้จ่ายรายเดือน D-Coffee</h1>
        </div>

        <!-- สาขา, ปี, เดือน (Left Aligned) -->
        <div class="details align-left">
          <p>สาขา: ${selectedBranchesToDisplay.join(', ') || 'ทุกสาขา'}</p>
          <p>ปี: ${selectedYearForSummary.value}</p>
          <p>เดือน: ${selectedMonths.value.join(', ') || 'ทุกเดือน'}</p>
        </div>

        <!-- รายการค่าใช้จ่าย -->
        <div class="section-title">รายการค่าใช้จ่าย</div>
        <table class="table">
          <thead>
            <tr>
              <th>ประเภท</th>
              <th>จำนวน</th>
              <th>ยอดรวม</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>ค่าน้ำ</td>
              <td>${filteredSummaryExpenses.value[0]?.length || 0}</td>
              <td>฿ ${filteredSummaryExpenses.value[0]?.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2) || 0}</td>
            </tr>
            <tr>
              <td>ค่าไฟ</td>
              <td>${filteredSummaryExpenses.value[1]?.length || 0}</td>
              <td>฿ ${filteredSummaryExpenses.value[1]?.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2) || 0}</td>
            </tr>
            <tr>
              <td>ค่าเช่า</td>
              <td>${filteredSummaryExpenses.value[2]?.length || 0}</td>
              <td>฿ ${filteredSummaryExpenses.value[2]?.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2) || 0}</td>
            </tr>
            <tr>
              <td>ค่าใช้จ่ายอื่นๆ</td>
              <td>${filteredSummaryExpenses.value[3]?.length || 0}</td>
              <td>฿ ${filteredSummaryExpenses.value[3]?.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2) || 0}</td>
            </tr>
          </tbody>
        </table>

        <!-- ยอดรวมทั้งหมด -->
        <div class="total">
          <p>รวมทั้งหมด: ฿ ${filteredSummaryExpenses.value
            .flat()
            .reduce((acc, curr) => acc + curr.amount, 0)
            .toFixed(2)}</p>
        </div>

        <!-- Footer -->
        <div class="footer">
          <!-- Removed "NO VAT" as per the request -->
        </div>

        <!-- วันที่ (Right Aligned) -->
        <div class="date">
          <p>วันที่: ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </body>
    </html>
  `

  // เปิดหน้าต่างใหม่เพื่อแสดงใบเสร็จ
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Please allow pop-ups for printing receipts.')
    return
  }

  // เขียน HTML ลงในหน้าใหม่
  printWindow.document.write(receiptHTML)
  printWindow.document.close()

  // เมื่อหน้าต่างโหลดเสร็จแล้ว ให้ทำการพิมพ์
  printWindow.onload = function () {
    setTimeout(() => {
      printWindow.focus()
      printWindow.print()
      printWindow.onafterprint = function () {
        printWindow.close()
      }
    }, 1000)
  }
}

const filteredSummaryExpenses = computed(() => {
  if (!store.expenses || store.expenses.length === 0) {
    return [] // ถ้าไม่มีข้อมูลจะคืนค่าเป็นอาร์เรย์ว่าง
  }

  // กรองข้อมูลตามปีที่เลือก
  const filteredByYear = store.expenses.filter((exp) => {
    const expenseYear = new Date(exp.datetime).getFullYear()
    return !selectedYearForSummary.value || expenseYear === selectedYearForSummary.value
  })

  // กำหนดตัวแปรสำหรับค่าใช้จ่ายแต่ละประเภท
  const grouped: Record<string, Expense[]> = {
    ค่าน้ำ: [],
    ค่าไฟ: [],
    ค่าเช่า: [],
    อื่นๆ: [],
  }

  // กรองข้อมูลตามสาขาที่เลือก
  let filteredExpenses = filteredByYear
  if (isAdmin.value) {
    // สำหรับ Admin ให้กรองข้อมูลตามสาขาของ Admin เท่านั้น
    filteredExpenses = filteredByYear.filter(
      (exp) => exp.branch === currentUser.value?.branch?.name,
    )
  } else if (selectedBranches.value.length > 0) {
    // สำหรับ User หรือ Owner, กรองข้อมูลตามสาขาที่เลือก
    filteredExpenses = filteredByYear.filter((exp) => selectedBranches.value.includes(exp.branch))
  }

  // กรองข้อมูลตามเดือนที่เลือก
  const filteredByMonth = filteredExpenses.filter((exp) => {
    const expenseMonth = new Date(exp.datetime).getMonth() + 1
    return selectedMonths.value.length === 0 || selectedMonths.value.includes(expenseMonth)
  })

  // แบ่งกลุ่มข้อมูลตามประเภท
  filteredByMonth.forEach((exp) => {
    // ตรวจสอบว่า grouped[exp.type] มีค่า ถ้าไม่มีจะสร้างใหม่
    if (!grouped[exp.type]) {
      grouped[exp.type] = []
    }
    grouped[exp.type]!.push(exp)
  })

  // เพิ่มประเภทข้อมูลรวมทั้งหมด
  grouped['รวมทั้งหมด'] = filteredByMonth

  // เรียงลำดับประเภทของค่าใช้จ่ายที่ต้องการ
  const orderedCategories = ['ค่าน้ำ', 'ค่าไฟ', 'ค่าเช่า', 'อื่นๆ', 'รวมทั้งหมด']

  // เปลี่ยนจากอ็อบเจ็กต์เป็นอาร์เรย์ตามลำดับที่ต้องการ
  return orderedCategories.map((category) => grouped[category] || []) // ใช้อาร์เรย์ว่างหากไม่มีข้อมูล
})
</script>

<style scoped>
.custom-page {
  background-color: #faf3e0;
}
.tab-container {
  background-color: rgba(255, 255, 255, 0.6);
  color: #3e2726;
}
.custom-header {
  margin-bottom: 20px;
}
.large-btn {
  font-size: 16px;
  padding: 10px 20px;
}
.equal-btn {
  min-width: 120px;
  font-size: 16px;
  padding: 10px 20px;
  display: inline-flex;
  justify-content: center;
  appearance: 40;
}
.q-tab__label {
  font-size: 15px !important;
  font-weight: bold !important;
}
.tab-panels {
  width: 100%;
  max-width: 100%;
  background-color: transparent;
}
</style>
