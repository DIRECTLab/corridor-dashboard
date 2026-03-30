<template>
  <div ref="containerRef" class="wasatch-map-container" :style="{ height: `${props.height}px` }">
    <div v-if="loading" class="map-loading">
      <v-progress-circular indeterminate color="primary" />
      <span class="ml-2">Loading map…</span>
    </div>
    <svg ref="svgRef" class="wasatch-map"></svg>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'

const props = defineProps({
  scenario: Object,
  // countyData: { [countyName]: { totalNpcUsd, totalKwh, avgBreakevenPerKwh, locations } }
  countyData: { type: Object, default: () => ({}) },
  interactive: { type: Boolean, default: true },
  highlightDataCounties: { type: Boolean, default: false },
  height: { type: Number, default: 500 },
})
const emit = defineEmits(['municipality-clicked'])

const svgRef = ref(null)
const containerRef = ref(null)
const loading = ref(true)
let resizeObserver = null

// FIPS codes for Wasatch Front counties (Box Elder excluded - no data)
const WASATCH_COUNTIES = {
  '49003': 'Box Elder',
  '49057': 'Weber',
  '49011': 'Davis',
  '49035': 'Salt Lake',
  '49049': 'Utah',
}

const COUNTY_FILL = '#90caf9'
const COUNTY_FILL_NO_DATA = '#cfd8dc'

let cachedFeatures = null   // reuse across redraws

async function fetchFeatures() {
  if (cachedFeatures) return cachedFeatures

  const us = await d3.json(
    'https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json'
  )
  const all = topojson.feature(us, us.objects.counties).features
  cachedFeatures = all
    .filter(f => WASATCH_COUNTIES[f.id])
    .map(f => ({ ...f, properties: { ...f.properties, name: WASATCH_COUNTIES[f.id] } }))

  return cachedFeatures
}

async function renderMap() {
  const svgEl = svgRef.value
  const containerEl = containerRef.value
  if (!svgEl || !containerEl) return

  const features = await fetchFeatures()
  loading.value = false

  const { width, height } = containerEl.getBoundingClientRect()
  const w = width  || 800
  const h = height || 500

  const margin = { top: 32, right: 24, bottom: 16, left: 24 }
  const iw = w - margin.left - margin.right
  const ih = h - margin.top  - margin.bottom

  const svg = d3.select(svgEl)
  svg.selectAll('*').remove()
  svg.attr('viewBox', `0 0 ${w} ${h}`).attr('width', w).attr('height', h)

  // Sky-blue background
  svg.append('rect').attr('width', w).attr('height', h).attr('fill', '#e8f4fd')

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  const featureCollection = { type: 'FeatureCollection', features }
  const projection = d3.geoMercator().fitExtent([[0, 0], [iw, ih]], featureCollection)
  const path = d3.geoPath().projection(projection)

  const countiesWithData = new Set(Object.keys(props.countyData || {}))

  // County polygons
  g.selectAll('path.county')
    .data(features)
    .join('path')
    .attr('class', 'county')
    .attr('d', path)
    .attr('fill', d => {
      if (!props.highlightDataCounties) return COUNTY_FILL
      return countiesWithData.has(d.properties.name) ? COUNTY_FILL : COUNTY_FILL_NO_DATA
    })
    .attr('stroke', '#ffffff')
    .attr('stroke-width', 1.5)
    .attr('opacity', 0.85)
    .style('cursor', props.interactive ? 'pointer' : 'default')
    .on('mouseover', function () {
      if (!props.interactive) return
      d3.select(this).attr('opacity', 1).attr('stroke-width', 3).attr('stroke', '#0d47a1')
    })
    .on('mouseout', function () {
      if (!props.interactive) return
      d3.select(this).attr('opacity', 0.85).attr('stroke-width', 1.5).attr('stroke', '#ffffff')
    })
    .on('click', (event, d) => {
      if (!props.interactive) return
      const countyName = d.properties.name
      const data = props.countyData[countyName] || null
      emit('municipality-clicked', { name: countyName + ' County', data })
    })

  // County labels
  g.selectAll('text.county-label')
    .data(features)
    .join('text')
    .attr('class', 'county-label')
    .attr('transform', d => {
      const [cx, cy] = path.centroid(d)
      return `translate(${cx},${cy})`
    })
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .style('font-size', `${Math.max(11, Math.min(16, iw / 30))}px`)
    .style('font-weight', '700')
    .style('fill', '#ffffff')
    .style('text-shadow', '0 1px 3px rgba(0,0,0,0.6)')
    .style('pointer-events', 'none')
    .text(d => d.properties.name + ' County')

  // Title
  svg.append('text')
    .attr('x', w / 2).attr('y', 20)
    .attr('text-anchor', 'middle')
    .style('font-size', '15px')
    .style('font-weight', '600')
    .style('fill', '#1a237e')
    .text('Wasatch Front Counties')
}

onMounted(async () => {
  await renderMap()

  if (containerRef.value && window.ResizeObserver) {
    resizeObserver = new ResizeObserver(() => renderMap())
    resizeObserver.observe(containerRef.value)
  } else {
    window.addEventListener('resize', renderMap)
  }
})

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect()
  else window.removeEventListener('resize', renderMap)
})
</script>

<style scoped>
.wasatch-map-container {
  width: 100%;
  height: 500px;
  min-height: 400px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #e8f4fd;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-loading {
  position: absolute;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #555;
}

.wasatch-map {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
