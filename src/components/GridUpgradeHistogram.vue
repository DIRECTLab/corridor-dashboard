<template>
  <div style="height: 300px; cursor: pointer;">
    <Bar
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const emit = defineEmits(['select-scenario'])
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

const props = defineProps({
  currentScenario: Object,
  allScenarios: Array
})

const chartData = computed(() => {
  const currentId = props.currentScenario?.id

  // Sort all scenarios by grid upgrade dollars from smallest to largest
  const sortedScenarios = [...props.allScenarios].sort(
    (a, b) => (a.gridInfrastructureUpgrades?.dollars ?? 0) - (b.gridInfrastructureUpgrades?.dollars ?? 0)
  )

  const scenariosWithCurrent = sortedScenarios.map(s => ({
    ...s,
    isCurrent: s.id === currentId
  }))

  return {
    labels: scenariosWithCurrent.map((s, i) => `S${i + 1}`),
    datasets: [
      {
        label: 'Grid Upgrade Cost ($)',
        data: scenariosWithCurrent.map(s => s.gridInfrastructureUpgrades?.dollars ?? 0),
        backgroundColor: scenariosWithCurrent.map(s =>
          s.isCurrent ? 'rgba(25, 118, 210, 0.8)' : 'rgba(158, 158, 158, 0.8)'
        ),
        borderColor: scenariosWithCurrent.map(s =>
          s.isCurrent ? 'rgba(25, 118, 210, 1)' : 'rgba(158, 158, 158, 1)'
        ),
        borderWidth: scenariosWithCurrent.map(s => s.isCurrent ? 3 : 1)
      }
    ]
  }
})

function formatCurrency(value) {
  return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

const sortedScenarios = computed(() =>
  [...(props.allScenarios || [])].sort(
    (a, b) => (a.gridInfrastructureUpgrades?.dollars ?? 0) - (b.gridInfrastructureUpgrades?.dollars ?? 0)
  )
)

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  onClick: (event, elements, chart) => {
    if (elements.length > 0) {
      const dataIndex = elements[0].index
      const scenario = sortedScenarios.value[dataIndex]
      if (scenario) emit('select-scenario', scenario)
    }
  },
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        generateLabels: function(chart) {
          return [
            {
              text: 'Current scenario',
              fillStyle: 'rgba(25, 118, 210, 0.8)',
              strokeStyle: 'rgba(25, 118, 210, 1)',
              lineWidth: 1,
              hidden: false
            },
            {
              text: 'Other scenarios',
              fillStyle: 'rgba(158, 158, 158, 0.8)',
              strokeStyle: 'rgba(158, 158, 158, 1)',
              lineWidth: 1,
              hidden: false
            }
          ]
        }
      },
      onClick: function() {
        // Prevent toggling; legend is display-only
      }
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          return '$' + formatCurrency(context.parsed.y)
        }
      }
    }
  },
  scales: {
    x: {
      ticks: {
        display: false
      }
    },
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value) {
          return '$' + formatCurrency(value)
        }
      }
    }
  }
}))
</script>
