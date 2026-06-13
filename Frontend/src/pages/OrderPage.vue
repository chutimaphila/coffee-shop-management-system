<template>
  <q-page padding class="Order-page">
    <div class="row q-mb-md">
      <q-tabs v-model="selectedSection" dense class="tab-container">
        <q-tab name="order" label="ออเดอร์" />
        <q-tab name="analytics" label="วิเคราะห์ยอดขาย" />
        <q-tab name="statistic" label="สถิติ" />
      </q-tabs>
    </div>

    <q-tab-panels v-model="selectedSection" class="tab-panels">
      <q-tab-panel name="order">
        <OrderSection />
      </q-tab-panel>
      <q-tab-panel name="analytics">
        <OrderAnalytics />
      </q-tab-panel>
      <q-tab-panel name="statistic">
        <OrderStatistic />
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import OrderSection from 'components/OrderComponent/OrderSection.vue'
import OrderStatistic from 'components/OrderComponent/OrderStatistic.vue'
import OrderAnalytics from 'components/OrderComponent/OrderAnalytics.vue'

const selectedSection = ref('order')
</script>

<style>
.Order-page {
  background-color: #faf3e0;
}

.tab-container {
  background-color: rgba(255, 255, 255, 0.6);
  color: #3e2726;
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
console.log('Selected Section:', selectedSection.value)
