<template>
  <div style="height: 100%; min-height: 350px;">
    <Line
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
)

const emit = defineEmits(['select-scenario'])

const props = defineProps({
  demandData: Array,
  allScenarios: {
    type: Array,
    default: () => []
  },
  currentScenario: {
    type: Object,
    default: null
  }
})

const minMaxEnvelopeByHour = computed(() => {
  if (!props.allScenarios?.length) return { min: [], max: [] }
  const hourly = Array.from({ length: 24 }, () => [])
  for (const s of props.allScenarios) {
    for (const pt of (s.electricityDemand24h || [])) {
      if (pt?.hour >= 0 && pt?.hour < 24) hourly[pt.hour].push(Number(pt.demand || 0) / 1000)
    }
  }
  return {
    min: hourly.map(arr => arr.length ? Math.min(...arr) : 0),
    max: hourly.map(arr => arr.length ? Math.max(...arr) : 0),
  }
})

const chartData = computed(() => {
  const labels = props.demandData.map(d => {
    const hour = d.hour % 12 || 12
    const period = d.hour < 12 ? 'AM' : 'PM'
    return `${hour} ${period}`
  })

  const datasets = []

  const envelope = minMaxEnvelopeByHour.value
  datasets.push({
    label: 'Hourly min (all scenarios)',
    data: envelope.min,
    borderColor: 'rgba(158, 158, 158, 0.9)',
    backgroundColor: 'transparent',
    tension: 0.35,
    fill: false,
    borderDash: [4, 4]
  })
  datasets.push({
    label: 'Hourly max (all scenarios)',
    data: envelope.max,
    borderColor: 'rgba(97, 97, 97, 0.9)',
    backgroundColor: 'transparent',
    tension: 0.35,
    fill: false,
    borderDash: [4, 4]
  })

  datasets.push({
    label: 'This scenario',
    data: props.demandData.map(d => (d.demand ?? 0) / 1000),
    borderColor: 'rgba(25, 118, 210, 1)',
    backgroundColor: 'rgba(25, 118, 210, 0.1)',
    tension: 0.4,
    fill: true
  })

  return { labels, datasets }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      onClick: () => {}
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          return Number(context.parsed.y).toLocaleString('en-US', { maximumSignificantDigits: 2 }) + ' MW'
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value) {
          return Number(value).toLocaleString('en-US', { maximumSignificantDigits: 2 }) + ' MW'
        }
      }
    }
  }
}))
</script>
