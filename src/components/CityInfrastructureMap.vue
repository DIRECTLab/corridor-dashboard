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
      <div class="legend-title">Total kW by feature</div>
      <div class="legend-caption">Electrified roads and charging footprints. Darker blue means higher kW.</div>
      <div class="legend-row">
        <span class="legend-swatch legend-swatch-light"></span>
        <span>Lower kW</span>
      </div>
      <div class="legend-row">
        <span class="legend-swatch legend-swatch-dark"></span>
        <span>Higher kW</span>
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
  if (type === 'Polygon') {
    const match = wkt.match(/POLYGON\s*\(\((.*)\)\)/i)
    if (!match) return null
    const ring = match[1].split('),(')[0]
    return parseCoords(ring)
  }
  return null
}

function colorForKw(kw, minKw, maxKw) {
  const t = (kw - minKw) / Math.max(1, maxKw - minKw)
  if (t < 0.25) return '#bbdefb'
  if (t < 0.5) return '#90caf9'
  if (t < 0.75) return '#42a5f5'
  return '#1565c0'
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
    const geometryType = cols[12]
    const geometryWkt = cols[13]
    const latLngs = wktToLatLngs(geometryType, geometryWkt)
    if (!latLngs?.length) continue
    if (!byScenario[scId]) byScenario[scId] = []
    byScenario[scId].push({ locId, capacityKw, geometryType, latLngs })
  }
  return byScenario
}

function currentScenarioId() {
  return String(props.scenario?.id || '').replace('scenario-', '')
}

function drawScenarioFeatures() {
  if (!mapInstance || !featureLayer) return
  featureLayer.clearLayers()
  const scId = currentScenarioId()
  const features = scenarioFeatures[scId] || []
  if (!features.length) return
  const values = features.map((f) => f.capacityKw)
  const maxVal = Math.max(...values, 1)
  const minVal = Math.min(...values, 0)
  for (const f of features) {
    const color = colorForKw(f.capacityKw, minVal, maxVal)
    const isLine = f.geometryType === 'LineString'
    const layer = isLine
      ? L.polyline(f.latLngs, { color, weight: 3, opacity: 0.9 })
      : L.polygon(f.latLngs, { color, weight: 1.5, fillColor: color, fillOpacity: 0.5, opacity: 0.9 })
    layer.bindTooltip(`<strong>${f.locId}</strong><br/>Total kW: ${Math.round(f.capacityKw).toLocaleString()}`, { sticky: true })
    layer.addTo(featureLayer)
  }
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

.legend-swatch-light {
  background: #bbdefb;
}

.legend-swatch-dark {
  background: #1565c0;
}

</style>
