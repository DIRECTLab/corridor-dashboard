<template>
  <div style="height: 220px;">
    <Bar :data="chartData" :options="chartOptions" />
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
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const props = defineProps({ currentScenario: Object, allScenarios: Array })

const BIN_COUNT = 12
const histogram = computed(() => {
  const values = (props.allScenarios || []).map(s => Number(s.costPerMile || 0) * 100)
  if (!values.length) return { counts: [], currentBin: -1, centers: [], binWidth: 1, min: 0, max: 0 }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = Math.max(0.0001, max - min)
  const width = span / BIN_COUNT
  const counts = Array.from({ length: BIN_COUNT }, () => 0)
  values.forEach(v => counts[Math.min(BIN_COUNT - 1, Math.floor((v - min) / width))] += 1)
  const current = Number(props.currentScenario?.costPerMile || 0) * 100
  const currentBin = Math.min(BIN_COUNT - 1, Math.floor((current - min) / width))
  const centers = Array.from({ length: BIN_COUNT }, (_, i) => min + (i + 0.5) * width)
  return { counts, currentBin, centers, binWidth: width, min, max }
})
function trim(v) { return Number(v).toLocaleString('en-US', { maximumFractionDigits: 2 }) }

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        title: (items) => {
          const i = items[0]?.dataIndex ?? 0
          const lo = histogram.value.min + i * histogram.value.binWidth
          const hi = histogram.value.min + (i + 1) * histogram.value.binWidth
          return `${trim(lo)}-${trim(hi)} ¢/mi`
        },
        label: (context) => `${context.parsed.y} scenarios`
      }
    }
  },
  scales: {
    x: {
      type: 'linear',
      min: histogram.value.min,
      max: histogram.value.max,
      ticks: {
        callback: (value) => `${trim(value)} ¢/mi`,
        maxTicksLimit: 6
      },
      title: {
        display: true,
        text: 'Cost (¢/mi)'
      },
    },
    y: {
      beginAtZero: true,
      ticks: { precision: 0 }
    }
  }
}))

const chartData = computed(() => ({
  labels: [],
  datasets: [{
    label: 'Scenario count',
    data: histogram.value.centers.map((x, i) => ({ x, y: histogram.value.counts[i] })),
    backgroundColor: histogram.value.counts.map((_, i) =>
      i === histogram.value.currentBin ? 'rgba(25, 118, 210, 0.85)' : 'rgba(158, 158, 158, 0.75)'
    ),
    borderWidth: 0,
    barThickness: 'flex',
    categoryPercentage: 1.0,
    barPercentage: 1.0,
    inflateAmount: 0
  }]
}))
</script>
