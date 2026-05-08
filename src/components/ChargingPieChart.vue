<template>
  <div style="height: 300px;">
    <Bar
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
)

const props = defineProps({
  scenario: Object
})

const chartData = computed(() => {
  const dynamicMw =
    (props.scenario.totalChargeCapacityKw * props.scenario.dynamicChargingPercent) / 100 / 1000
  const staticMw =
    (props.scenario.totalChargeCapacityKw * props.scenario.staticChargingPercent) / 100 / 1000

  return {
    labels: [''],
    datasets: [
      {
        label: 'Dynamic Charging',
        data: [dynamicMw],
        backgroundColor: 'rgba(25, 118, 210, 0.8)',
        borderColor: 'rgba(25, 118, 210, 1)',
        borderWidth: 1
      },
      {
        label: 'Static Charging',
        data: [staticMw],
        backgroundColor: 'rgba(76, 175, 80, 0.8)',
        borderColor: 'rgba(76, 175, 80, 1)',
        borderWidth: 1
      }
    ]
  }
})

const chartOptions = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    },
    tooltip: {
      callbacks: {
        label(context) {
          const label = context.dataset.label || ''
          const value = context.parsed.x
          const idx = context.dataIndex
          const total = context.chart.data.datasets.reduce(
            (sum, ds) => sum + Number(ds.data[idx] || 0),
            0
          )
          const percentage = total > 0 ? (value / total) * 100 : 0
          return `${label}: ${Number(value).toLocaleString('en-US', { maximumSignificantDigits: 2 })} MW (${Number(percentage).toLocaleString('en-US', { maximumSignificantDigits: 2 })}%)`
        }
      }
    }
  },
  scales: {
    x: {
      stacked: true,
      beginAtZero: true,
      title: {
        display: true,
        text: 'Capacity (MW)'
      },
      ticks: {
        callback: (value) =>
          Number(value).toLocaleString('en-US', { maximumSignificantDigits: 2 })
      }
    },
    y: {
      stacked: true,
      display: false
    }
  },
  datasets: {
    bar: {
      maxBarThickness: 56,
      categoryPercentage: 1,
      barPercentage: 1
    }
  }
}
</script>
