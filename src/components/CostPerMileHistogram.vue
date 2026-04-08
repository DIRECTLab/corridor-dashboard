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
  if (!values.length) return { labels: [], counts: [], currentBin: -1 }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = Math.max(0.0001, max - min)
  const width = span / BIN_COUNT
  const counts = Array.from({ length: BIN_COUNT }, () => 0)
  values.forEach(v => counts[Math.min(BIN_COUNT - 1, Math.floor((v - min) / width))] += 1)
  const current = Number(props.currentScenario?.costPerMile || 0) * 100
  const currentBin = Math.min(BIN_COUNT - 1, Math.floor((current - min) / width))
  const labels = Array.from({ length: BIN_COUNT }, (_, i) => {
    const lo = min + i * width
    const hi = min + (i + 1) * width
    return `${trim(lo)}-${trim(hi)} c/mi`
  })
  return { labels, counts, currentBin }
})
const collapsedHistogram = computed(() => {
  const keep = histogram.value.counts
    .map((count, i) => ({ count, i }))
    .filter(({ count }) => count > 0)
    .map(({ i }) => i)
  return {
    labels: keep.map(i => histogram.value.labels[i]),
    counts: keep.map(i => histogram.value.counts[i]),
    currentBin: keep.indexOf(histogram.value.currentBin),
  }
})
function trim(v) { return Number(v).toLocaleString('en-US', { maximumFractionDigits: 2 }) }

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context) => `${context.parsed.y} scenarios`
      }
    }
  },
  scales: {
    x: {
      ticks: {
        display: true,
        autoSkip: true,
        maxTicksLimit: 6,
        maxRotation: 0
      },
      title: {
        display: true,
        text: 'Cost range (c/mi)'
      },
    },
    y: {
      beginAtZero: true,
      ticks: { precision: 0 }
    }
  }
}))

const chartData = computed(() => ({
  labels: collapsedHistogram.value.labels,
  datasets: [{
    label: 'Scenario count',
    data: collapsedHistogram.value.counts,
    backgroundColor: collapsedHistogram.value.counts.map((_, i) =>
      i === collapsedHistogram.value.currentBin ? 'rgba(25, 118, 210, 0.85)' : 'rgba(158, 158, 158, 0.75)'
    ),
    borderWidth: 0
  }]
}))
</script>
