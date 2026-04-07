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
  const values = (props.allScenarios || []).map(s => Number(s.gridInfrastructureUpgrades?.kw || 0))
  if (!values.length) return { labels: [], counts: [], currentBin: -1 }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = Math.max(1, max - min)
  const width = span / BIN_COUNT
  const counts = Array.from({ length: BIN_COUNT }, () => 0)
  const bins = values.map(v => Math.min(BIN_COUNT - 1, Math.floor((v - min) / width)))
  bins.forEach(i => { counts[i] += 1 })
  const currentVal = Number(props.currentScenario?.gridInfrastructureUpgrades?.kw || 0)
  const currentBin = Math.min(BIN_COUNT - 1, Math.floor((currentVal - min) / width))
  const labels = Array.from({ length: BIN_COUNT }, (_, i) => {
    const lo = min + (i * width)
    const hi = min + ((i + 1) * width)
    return `${formatSIWatts(lo * 1000)}-${formatSIWatts(hi * 1000)}`
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

function formatSIWatts(watts) {
  const abs = Math.abs(watts)
  if (abs >= 1e9) return `${trim(watts / 1e9)} GW`
  if (abs >= 1e6) return `${trim(watts / 1e6)} MW`
  if (abs >= 1e3) return `${trim(watts / 1e3)} kW`
  return `${trim(watts)} W`
}
function trim(v) {
  return Number(v).toLocaleString('en-US', { maximumFractionDigits: 2 })
}

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
        text: 'Additional grid capacity range'
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
