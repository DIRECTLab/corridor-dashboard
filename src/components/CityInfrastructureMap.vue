<template>
  <div class="city-map-wrapper">
    <div v-if="loading" class="map-overlay">
      <v-progress-circular indeterminate color="primary" size="22" />
      <span class="ml-2">Loading city infrastructure map...</span>
    </div>
    <div v-else-if="error" class="map-overlay error-text">
      {{ error }}
    </div>
    <div ref="mapContainerRef" class="city-map" :style="{ height: `${props.height}px` }"></div>
    <div class="map-legend">
      <div class="legend-title">Total kW by municipality</div>
      <div class="legend-caption">
        Colors use a log scale and cap at the 95th percentile so extreme values share the same top color.
      </div>
      <div v-for="item in legendItems" :key="item.label" class="legend-row">
        <span class="legend-swatch" :style="{ background: item.color }"></span>
        <span>{{ item.label }}</span>
      </div>
    </div>
    <div class="custom-attribution">
      Map tiles by CARTO, data by OpenStreetMap contributors
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import infrastructureMapCsvUrl from '../data/infrastructure_map.csv?url'

const props = defineProps({
  scenario: Object,
  height: { type: Number, default: 320 },
})

const mapContainerRef = ref(null)
const loading = ref(true)
const error = ref('')

let mapInstance = null
let featureLayer = null
let scenarioFeatures = {}
let municipalityBoundaries = []
let waterMaskFeatures = []
const legendItems = ref([])

function parseCsvLine(line) {
  const out = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  out.push(current)
  return out
}

function parseCoords(raw) {
  return raw.split(',').map(pair => {
    const [lon, lat] = pair.trim().split(/\s+/).map(Number)
    return [lat, lon]
  }).filter(([lat, lon]) => Number.isFinite(lat) && Number.isFinite(lon))
}

function wktToLatLngs(type, wkt) {
  if (!wkt) return null
  if (type === 'LineString') {
    const match = wkt.match(/LINESTRING\s*\((.*)\)/i)
    if (!match) return null
    return parseCoords(match[1])
  }
  return null
}

const COLOR_STEPS = ['#deebf7', '#9ecae1', '#6baed6', '#3182bd', '#08519c']

function quantile(values, q) {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const pos = (sorted.length - 1) * q
  const base = Math.floor(pos)
  const rest = pos - base
  if (sorted[base + 1] !== undefined) return sorted[base] + rest * (sorted[base + 1] - sorted[base])
  return sorted[base]
}

function colorForKwLogCapped(kw, minKw, capKw) {
  const bounded = Math.min(Math.max(kw, minKw), capKw)
  const minLog = Math.log1p(Math.max(0, minKw))
  const maxLog = Math.log1p(Math.max(minKw + 1, capKw))
  const t = (Math.log1p(bounded) - minLog) / Math.max(1e-9, maxLog - minLog)
  const idx = Math.min(COLOR_STEPS.length - 1, Math.max(0, Math.floor(t * COLOR_STEPS.length)))
  return COLOR_STEPS[idx]
}

function formatKw(kw) {
  return Number(kw || 0).toLocaleString('en-US', { maximumSignificantDigits: 2 })
}

function municipalityFromLocId(locId) {
  const parts = String(locId || '').split('_')
  // Municipality names are encoded only in stationary IDs like stn_100_South_Ogden.
  if (parts[0] !== 'stn' || parts.length < 3) return null
  return parts.slice(2).join(' ').replace(/_/g, ' ')
}

function normalizeMunicipalityName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\s+(city|town|village|metro township|township|borough)$/i, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanRoadName(name) {
  const s = String(name || '').trim()
  if (!s) return null
  return s.replace(/\s+/g, ' ')
}

function buildLegendItems(minKw, capKw) {
  if (!(capKw > 0)) return []
  const minLog = Math.log1p(Math.max(0, minKw))
  const maxLog = Math.log1p(Math.max(minKw + 1, capKw))
  const items = []
  for (let i = COLOR_STEPS.length - 1; i >= 0; i -= 1) {
    const upperT = (i + 1) / COLOR_STEPS.length
    const lowerT = i / COLOR_STEPS.length
    const upper = Math.expm1(minLog + (maxLog - minLog) * upperT)
    const lower = Math.expm1(minLog + (maxLog - minLog) * lowerT)
    const label = i === COLOR_STEPS.length - 1
      ? `>= ${formatKw(lower)} kW`
      : `${formatKw(lower)} - ${formatKw(upper)} kW`
    items.push({ color: COLOR_STEPS[i], label })
  }
  return items
}

async function loadScenarioFeatures() {
  const res = await fetch(infrastructureMapCsvUrl)
  if (!res.ok) throw new Error(`Failed to load infrastructure_map.csv (${res.status})`)
  const text = await res.text()
  const lines = text.split('\n')
  if (lines.length < 2) return {}

  const byScenario = {}
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue
    const cols = parseCsvLine(line)
    const scId = cols[0]
    const locId = cols[1]
    const capacityKw = Number(cols[3]) || 0
    const roadName = cols[10]
    const geometryType = cols[12]
    const geometryWkt = cols[13]
    if (!byScenario[scId]) byScenario[scId] = []
    const latLngs = geometryType === 'LineString' ? wktToLatLngs(geometryType, geometryWkt) : null
    byScenario[scId].push({ locId, capacityKw, roadName, geometryType, latLngs })
  }
  return byScenario
}

function municipalitiesFromScenarioFeatures(byScenario) {
  const set = new Set()
  Object.values(byScenario).forEach((arr) => {
    arr.forEach((f) => {
      const name = municipalityFromLocId(f.locId)
      if (name) set.add(name)
    })
  })
  return set
}

async function loadMunicipalityBoundaries(municipalityNames) {
  const url = 'https://services1.arcgis.com/99lidPhWCzftIe9K/ArcGIS/rest/services/UtahMunicipalBoundaries/FeatureServer/0/query'
  const params = new URLSearchParams({
    where: '1=1',
    outFields: 'NAME',
    returnGeometry: 'true',
    f: 'geojson'
  })
  const res = await fetch(`${url}?${params.toString()}`)
  if (!res.ok) throw new Error(`Failed to load municipal boundaries (${res.status})`)
  const geojson = await res.json()
  const target = new Set([...municipalityNames].map(normalizeMunicipalityName))
  const filtered = (geojson.features || []).filter((f) => {
    const n = normalizeMunicipalityName(f?.properties?.NAME)
    return target.has(n)
  })
  return filtered.map((f) => ({
    municipality: String(f.properties?.NAME || '').replace(/\s+(city|town|village|metro township|township)$/i, ''),
    normName: normalizeMunicipalityName(f.properties?.NAME),
    feature: f
  }))
}

async function loadWaterMaskFeatures() {
  // Use all multipart polygons for the two major lakes in Utah.
  const url = 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Hydro/MapServer/1/query'
  const params = new URLSearchParams({
    where: "NAME IN ('Great Salt Lk','Utah Lk')",
    geometry: '-114.1,36.8,-108.9,42.3',
    geometryType: 'esriGeometryEnvelope',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: 'NAME',
    returnGeometry: 'true',
    f: 'geojson'
  })
  const res = await fetch(`${url}?${params.toString()}`)
  if (!res.ok) throw new Error(`Failed to load water mask (${res.status})`)
  const geojson = await res.json()
  return geojson.features || []
}

function currentScenarioId() {
  return String(props.scenario?.id || '').replace('scenario-', '')
}

function drawScenarioFeatures() {
  if (!mapInstance || !featureLayer) return
  featureLayer.clearLayers()
  const scId = currentScenarioId()
  const features = scenarioFeatures[scId] || []
  if (!features.length) {
    legendItems.value = []
    return
  }

  const municipalityKw = new Map()
  for (const f of features) {
    const municipality = municipalityFromLocId(f.locId)
    if (!municipality) continue
    const key = normalizeMunicipalityName(municipality)
    municipalityKw.set(key, (municipalityKw.get(key) || 0) + f.capacityKw)
  }

  const municipalityValues = [...municipalityKw.values()]
  if (!municipalityValues.length) {
    legendItems.value = []
    return
  }
  const minVal = Math.min(...municipalityValues, 0)
  const capVal = Math.max(quantile(municipalityValues, 0.95), minVal + 1)
  legendItems.value = buildLegendItems(minVal, capVal)

  // Draw true municipality boundaries.
  for (const b of municipalityBoundaries) {
    const municipalityTotalKw = municipalityKw.get(b.normName) || 0
    const color = colorForKwLogCapped(municipalityTotalKw, minVal, capVal)
    const layer = L.geoJSON(b.feature, {
      style: { color, weight: 1.5, fillColor: color, fillOpacity: 0.5, opacity: 0.9 }
    })
    layer.bindTooltip(
      `<strong>${b.municipality}</strong><br/>Municipality total: ${formatKw(municipalityTotalKw)} kW`,
      { sticky: true }
    )
    layer.addTo(featureLayer)
  }

  // Water mask clips municipality fills over large lakes.
  for (const water of waterMaskFeatures) {
    L.geoJSON(water, {
      style: {
        color: '#edf3f7',
        weight: 0,
        fillColor: '#edf3f7',
        fillOpacity: 1,
        opacity: 1
      },
      interactive: false
    }).addTo(featureLayer)
  }

  // Draw roads on top so they remain hoverable.
  const lineFeatures = features.filter(f => f.geometryType === 'LineString' && f.latLngs?.length)
  lineFeatures.forEach((f) => {
    const tooltipName = cleanRoadName(f.roadName) || 'Road segment'
    const layer = L.polyline(f.latLngs, { color: '#d81b60', weight: 5, opacity: 0.95 })
    layer.bindTooltip(`<strong>${tooltipName}</strong><br/>Segment kW: ${formatKw(f.capacityKw)} kW`, { sticky: true })
    layer.addTo(featureLayer)
  })

  // Ensure line layers are visually on top after render.
  featureLayer.eachLayer((layer) => {
    if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
      layer.bringToFront()
    }
  })
}

function initMap() {
  if (!mapContainerRef.value || mapInstance) return

  mapInstance = L.map(mapContainerRef.value, {
    zoomControl: true,
    attributionControl: false,
  }).setView([40.72, -111.95], 9)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: 'Map tiles by CARTO, data by OpenStreetMap contributors',
    maxZoom: 18,
  }).addTo(mapInstance)

  featureLayer = L.layerGroup().addTo(mapInstance)
  mapInstance.on('zoomend moveend', drawScenarioFeatures)
  drawScenarioFeatures()
}

onMounted(async () => {
  try {
    scenarioFeatures = await loadScenarioFeatures()
    const municipalities = municipalitiesFromScenarioFeatures(scenarioFeatures)
    municipalityBoundaries = await loadMunicipalityBoundaries(municipalities)
    waterMaskFeatures = await loadWaterMaskFeatures()
  } catch (e) {
    error.value = 'Unable to load map data.'
    console.error(e)
  } finally {
    loading.value = false
    initMap()
  }
})

watch(
  () => props.scenario?.id,
  () => {
    drawScenarioFeatures()
  }
)

onUnmounted(() => {
  if (mapInstance) {
    mapInstance.off('zoomend moveend', drawScenarioFeatures)
    mapInstance.remove()
    mapInstance = null
  }
})
</script>

<style scoped>
.city-map-wrapper {
  position: relative;
  width: 100%;
}

.city-map {
  width: 100%;
  height: 320px;
  min-height: 280px;
  border-radius: 6px;
  border: 1px solid #d6d6d6;
}

.map-overlay {
  position: absolute;
  inset: 0;
  z-index: 401;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.82);
  color: #37474f;
  font-size: 14px;
}

.error-text {
  color: #c62828;
}

.custom-attribution {
  position: absolute;
  right: 8px;
  bottom: 8px;
  z-index: 450;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #d6d6d6;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 11px;
  line-height: 1.25;
  color: #37474f;
}

.map-legend {
  position: absolute;
  left: 8px;
  bottom: 8px;
  z-index: 450;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #d6d6d6;
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 11px;
  color: #37474f;
}

.legend-title {
  font-weight: 600;
  margin-bottom: 2px;
}

.legend-caption {
  font-size: 10px;
  color: #546e7a;
  line-height: 1.25;
  margin-bottom: 6px;
  max-width: 200px;
}

.legend-row {
  display: flex;
  align-items: center;
  gap: 6px;
  line-height: 1.2;
}

.legend-swatch {
  display: inline-block;
  width: 18px;
  height: 10px;
  border-radius: 2px;
}

</style>
