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
  const currentId = props.currentScenario.id
  
  // Sort all scenarios by cost per mile from smallest to largest
  const sortedScenarios = [...props.allScenarios].sort((a, b) => a.costPerMile - b.costPerMile)
  
  const scenariosWithCurrent = sortedScenarios.map(s => ({
    ...s,
    isCurrent: s.id === currentId
  }))

  return {
    labels: scenariosWithCurrent.map((s, i) => `S${i + 1}`),
    datasets: [
      {
        label: 'Cost per Mile ($)',
        data: scenariosWithCurrent.map(s => s.costPerMile),
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

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top'
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          return '$' + context.parsed.y.toFixed(2) + ' per mile'
        }
      }
    }
  },
  scales: {
    x: {
      ticks: {
        maxRotation: 90,
        minRotation: 90,
        font: {
          size: 8
        }
      }
    },
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value) {
          return '$' + value.toFixed(2)
        }
      }
    }
  }
}
</script>
