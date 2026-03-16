<template>
  <div class="wasatch-map-container">
    <svg ref="svgRef" class="wasatch-map"></svg>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import * as d3 from 'd3'
import infrastructureCsv from '../data/infrastructure_map.csv?raw'

const props = defineProps({
  scenario: Object
})

const emit = defineEmits(['municipality-clicked'])

const svgRef = ref(null)

// Parse WKT POLYGON to GeoJSON Polygon
function wktPolygonToGeoJSON(wkt) {
  if (!wkt) return null
  const match = wkt.match(/^POLYGON\\s*\\(\\((.*)\\)\\)$/i)
  if (!match) return null
  const coords = match[1]
    .split(',')
    .map(p => p.trim().split(/\s+/).map(Number))
  return {
    type: 'Polygon',
    coordinates: [coords.map(([lng, lat]) => [lng, lat])]
  }
}

// Parse infrastructure_map.csv into GeoJSON features
function parseInfrastructure(scIdFilter) {
  const rows = d3.csvParse(infrastructureCsv)
  return rows
    .filter(row => !scIdFilter || row.sc === scIdFilter)
    .map(row => {
      const geom = wktPolygonToGeoJSON(row.geometry_wkt)
      if (!geom) return null
      return {
        type: 'Feature',
        geometry: geom,
        properties: {
          sc: row.sc,
          locId: row.LocId,
          paradigm: row.paradigm,
          capacityKw: +row.capacity_kw || 0,
          infraNpc: +row.infra_npc_usd || 0
        }
      }
    })
    .filter(Boolean)
}

function renderMap() {
  const svgEl = svgRef.value
  if (!svgEl) return

  const width = svgEl.clientWidth || 800
  const height = svgEl.clientHeight || 600

  const svg = d3.select(svgEl)
  svg.selectAll('*').remove()

  const scId =
    props.scenario?.id && props.scenario.id.startsWith('scenario-')
      ? props.scenario.id.replace('scenario-', '')
      : null

  const features = parseInfrastructure(scId)
  if (!features.length) return

  const projection = d3.geoMercator().fitSize(
    [width, height],
    {
      type: 'FeatureCollection',
      features
    }
  )

  const path = d3.geoPath(projection)

  const npcValues = features.map(f => f.properties.infraNpc)
  const color = d3
    .scaleQuantize()
    .domain([d3.min(npcValues), d3.max(npcValues)])
    .range(['#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#e34a33', '#b30000'])

  const g = svg.append('g')

  g.selectAll('path')
    .data(features)
    .join('path')
    .attr('d', path)
    .attr('fill', d => color(d.properties.infraNpc))
    .attr('stroke', '#fff')
    .attr('stroke-width', 0.5)
    .attr('opacity', 0.9)
    .on('mouseover', function () {
      d3.select(this).attr('opacity', 1)
    })
    .on('mouseout', function () {
      d3.select(this).attr('opacity', 0.9)
    })
    .on('click', (event, d) => {
      emit('municipality-clicked', {
        name: d.properties.locId,
        data: {
          gridUpgrades: {
            dollars: d.properties.infraNpc,
            kw: d.properties.capacityKw
          },
          chargeCapacity: d.properties.capacityKw,
          costPerMile: props.scenario?.costPerMile ?? 0
        }
      })
    })

  // Simple legend in top-right corner
  const legendWidth = 160
  const legendHeight = 12
  const legendMargin = 16

  const legendGroup = svg
    .append('g')
    .attr(
      'transform',
      `translate(${width - legendWidth - legendMargin}, ${legendMargin})`
    )

  const legendScale = d3
    .scaleLinear()
    .domain(color.domain())
    .range([0, legendWidth])

  const legendAxis = d3
    .axisBottom(legendScale)
    .ticks(4)
    .tickFormat(d3.format('~s'))

  const legendGradientId = 'wasatch-map-legend-gradient'

  const defs = svg.append('defs')
  const gradient = defs
    .append('linearGradient')
    .attr('id', legendGradientId)

  color.range().forEach((c, i, arr) => {
    const t = (i / (arr.length - 1)) * 100
    gradient
      .append('stop')
      .attr('offset', `${t}%`)
      .attr('stop-color', c)
  })

  legendGroup
    .append('rect')
    .attr('width', legendWidth)
    .attr('height', legendHeight)
    .style('fill', `url(#${legendGradientId})`)
    .attr('stroke', '#ccc')
    .attr('stroke-width', 0.5)

  legendGroup
    .append('g')
    .attr('transform', `translate(0, ${legendHeight})`)
    .call(legendAxis)
    .selectAll('text')
    .style('font-size', '10px')

  legendGroup
    .append('text')
    .attr('x', legendWidth / 2)
    .attr('y', -4)
    .attr('text-anchor', 'middle')
    .style('font-size', '11px')
    .text('Infrastructure NPC (USD)')
}

onMounted(() => {
  renderMap()
  window.addEventListener('resize', renderMap)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', renderMap)
})

watch(
  () => props.scenario,
  () => {
    renderMap()
  },
  { deep: true }
)
</script>

<style scoped>
.wasatch-map-container {
  width: 100%;
  height: 600px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fafafa;
}

.wasatch-map {
  width: 100%;
  height: 100%;
}
</style>
