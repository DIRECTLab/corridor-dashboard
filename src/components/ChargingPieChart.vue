<template>
  <div style="height: 300px;">
    <Doughnut
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
)

const props = defineProps({
  scenario: Object
})

const chartData = computed(() => {
  const dynamicKw = (props.scenario.totalChargeCapacityKw * props.scenario.dynamicChargingPercent) / 100
  const staticKw = (props.scenario.totalChargeCapacityKw * props.scenario.staticChargingPercent) / 100

  return {
    labels: ['Dynamic Charging', 'Static Charging'],
    datasets: [
      {
        data: [dynamicKw, staticKw],
        backgroundColor: [
          'rgba(25, 118, 210, 0.8)',
          'rgba(76, 175, 80, 0.8)'
        ],
        borderColor: [
          'rgba(25, 118, 210, 1)',
          'rgba(76, 175, 80, 1)'
        ],
        borderWidth: 2
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const label = context.label || ''
          const value = context.parsed || 0
          const total = context.dataset.data.reduce((a, b) => a + b, 0)
          const percentage = ((value / total) * 100).toFixed(1)
          return `${label}: ${value.toLocaleString()} kW (${percentage}%)`
        }
      }
    }
  }
}
</script>
