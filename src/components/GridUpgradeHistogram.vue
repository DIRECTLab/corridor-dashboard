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
  if (!values.length) return { counts: [], currentBin: -1, centers: [], binWidth: 1, min: 0, max: 0 }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = Math.max(1, max - min)
  const width = span / BIN_COUNT
  const counts = Array.from({ length: BIN_COUNT }, () => 0)
  const bins = values.map(v => Math.min(BIN_COUNT - 1, Math.floor((v - min) / width)))
  bins.forEach(i => { counts[i] += 1 })
  const currentVal = Number(props.currentScenario?.gridInfrastructureUpgrades?.kw || 0)
  const currentBin = Math.min(BIN_COUNT - 1, Math.floor((currentVal - min) / width))
  const centers = Array.from({ length: BIN_COUNT }, (_, i) => min + (i + 0.5) * width)
  return { counts, currentBin, centers, binWidth: width, min, max }
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
function shortNumber(v) {
  const n = Number(v)
  const abs = Math.abs(n)
  if (abs >= 1e9) return `${trim(n / 1e9)}G`
  if (abs >= 1e6) return `${trim(n / 1e6)}M`
  if (abs >= 1e3) return `${trim(n / 1e3)}k`
  return trim(n)
}

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
          return `${formatSIWatts(lo * 1000)}-${formatSIWatts(hi * 1000)}`
        },
        label: (context) => `${context.parsed.y} scenarios`
      }
    }
  },
  scales: {
    x: {
      type: 'linear',
      min: 0,
      max: histogram.value.max,
      ticks: {
        callback: (value) => shortNumber(Number(value) * 1000),
        maxTicksLimit: 6
      },
      title: {
        display: true,
        text: 'Upgrade [W]'
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
