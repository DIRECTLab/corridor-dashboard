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

const minMaxScenarios = computed(() => {
  if (!props.allScenarios?.length) return { min: null, max: null }
  const withTotal = props.allScenarios.map(s => ({
    scenario: s,
    total: (s.electricityDemand24h || []).reduce((sum, d) => sum + (d.demand ?? 0), 0)
  }))
  const sorted = [...withTotal].sort((a, b) => a.total - b.total)
  return {
    min: sorted[0]?.scenario ?? null,
    max: sorted[sorted.length - 1]?.scenario ?? null
  }
})

const chartData = computed(() => {
  const labels = props.demandData.map(d => {
    const hour = d.hour % 12 || 12
    const period = d.hour < 12 ? 'AM' : 'PM'
    return `${hour}:00 ${period}`
  })

  const datasets = []

  // Find min and max scenarios by total 24h demand
  const { min: minScenario, max: maxScenario } = minMaxScenarios.value
  if (minScenario || maxScenario) {

    if (minScenario?.electricityDemand24h && minScenario.id !== props.currentScenario?.id) {
      datasets.push({
        label: 'Min scenario',
        data: minScenario.electricityDemand24h.map(d => (d.demand ?? 0) / 1000),
        borderColor: 'rgba(158, 158, 158, 0.9)',
        backgroundColor: 'transparent',
        tension: 0.4,
        fill: false,
        borderDash: [4, 4]
      })
    }
    if (maxScenario?.electricityDemand24h && maxScenario.id !== props.currentScenario?.id) {
      datasets.push({
        label: 'Max scenario',
        data: maxScenario.electricityDemand24h.map(d => (d.demand ?? 0) / 1000),
        borderColor: 'rgba(97, 97, 97, 0.9)',
        backgroundColor: 'transparent',
        tension: 0.4,
        fill: false,
        borderDash: [4, 4]
      })
    }
  }

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
      onClick: (event, legendItem, legend) => {
        if (legendItem.text === 'Min scenario' && minMaxScenarios.value.min) {
          emit('select-scenario', minMaxScenarios.value.min)
        } else if (legendItem.text === 'Max scenario' && minMaxScenarios.value.max) {
          emit('select-scenario', minMaxScenarios.value.max)
        }
      }
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          return context.parsed.y.toLocaleString() + ' MW'
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value) {
          return value.toLocaleString() + ' MW'
        }
      }
    }
  }
}))
</script>
