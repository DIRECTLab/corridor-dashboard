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
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const props = defineProps({
  demandData: Array
})

const chartData = computed(() => {
  return {
    labels: props.demandData.map(d => {
      const hour = d.hour % 12 || 12
      const period = d.hour < 12 ? 'AM' : 'PM'
      return `${hour}:00 ${period}`
    }),
    datasets: [
      {
        label: 'Electricity Demand (kW)',
        data: props.demandData.map(d => d.demand),
        borderColor: 'rgba(25, 118, 210, 1)',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        tension: 0.4,
        fill: true
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
          return context.parsed.y.toLocaleString() + ' kW'
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value) {
          return value.toLocaleString() + ' kW'
        }
      }
    }
  }
}
</script>
