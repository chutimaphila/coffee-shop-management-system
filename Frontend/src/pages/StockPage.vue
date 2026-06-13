<template>
  <q-page padding class="stock-page">
    <!-- SECTION ด้านบน -->
    <div class="row q-mb-md items-center justify-between">
      <q-tabs v-model="selectedSection" dense class="tab-container">
        <q-tab name="checklist" label="คลังสินค้า" />
        <q-tab name="graph" label="กราฟ" />
        <q-tab name="checklistList" label="รายการใบเช็คสต๊อก" />
      </q-tabs>

      <q-btn
        label="ใบเช็คสินค้า"
        color="primary"
        icon="add"
        class="q-ml-md"
        @click="handleAddChecklist"
      />

      <q-btn
        label="ใบสั่งซื้อสินค้า"
        color="secondary"
        icon="add_shopping_cart"
        class="q-ml-md"
        @click="handleAddOrder"
      />
    </div>

    <!-- SECTION เนื้อหาแต่ละแท็บ -->
    <q-tab-panels v-model="selectedSection" class="tab-panels">
      <q-tab-panel name="checklist">
        <StockChecklistSection />
      </q-tab-panel>
      <q-tab-panel name="graph">
        <StockGraphSection />
      </q-tab-panel>
      <q-tab-panel name="checklistList">
        <StockChecklistListSection :checklists="savedChecklists" />
      </q-tab-panel>
    </q-tab-panels>

    <!-- Dialog สำหรับใบสั่งซื้อสินค้า -->
    <q-dialog v-model="showOrderDialog" persistent>
      <q-card style="min-width: 900px; max-width: 100vw">
        <PurchaseOrder :stock-items="stockItems" />
        <q-card-actions align="right">
          <q-btn flat label="ปิด" color="primary" @click="showOrderDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog สำหรับใบเช็คสต็อกสินค้า -->
    <!-- <q-dialog v-model="showStockCheckDialog" persistent>
      <q-card style="min-width: 1000px; max-width: 100vw">
        <StockCheckSheet
          :stock-items="stockItems"
          @save-checklist="addChecklistRecord"
          @close="showStockCheckDialog = false"
        />
        <q-card-actions align="right">
          <q-btn flat label="ปิด" color="primary" @click="showStockCheckDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog> -->
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useStockStore } from 'src/stores/stockStore'
import StockChecklistSection from 'src/components/StockComponent/StockChecklistSection.vue'
import StockGraphSection from 'src/components/StockComponent/StockGraphSection.vue'
import StockChecklistListSection from 'src/components/StockComponent/StockChecklistListSection.vue'
import PurchaseOrder from 'src/components/StockComponent/PurchaseOrder.vue'

const selectedSection = ref('checklist')
const showOrderDialog = ref(false)
const showStockCheckDialog = ref(false)

// ✅ ดึงข้อมูลจาก Pinia store
const stockStore = useStockStore()
const stockItems = stockStore.stockItems
const savedChecklists = stockStore.savedChecklists

function handleAddChecklist() {
  showStockCheckDialog.value = true
}

function handleAddOrder() {
  showOrderDialog.value = true
}

// function addChecklistRecord(newChecklist: typeof stockItems.value) {
//   stockStore.addChecklist(newChecklist)
//   selectedSection.value = 'checklistList'
// }
</script>

<style>
.stock-page {
  background-color: #f5f5f5;
}
.tab-container {
  background-color: rgba(255, 255, 255, 0.8);
  color: #2e2e2e;
  flex-grow: 1;
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
