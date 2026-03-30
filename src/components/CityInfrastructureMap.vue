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
      <div class="legend-title">Total kW (per city)</div>
      <div class="legend-caption">Plug-in plus in-road capacity (in-road attributed to nearest city).</div>
      <div class="legend-row">
        <span class="legend-dot legend-dot-small"></span>
        <span>Lower kW</span>
      </div>
      <div class="legend-row">
        <span class="legend-dot legend-dot-large"></span>
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
let markerLayer = null
let cityDataByScenario = {}

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

function citySlugFromLocId(locId) {
  const parts = String(locId || '').split('_')
  if (parts.length < 3) return null
  return parts.slice(2).join('_')
}

function parseFirstLonLat(wkt) {
  const match = String(wkt || '').match(/(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/)
  if (!match) return null
  const lon = Number(match[1])
  const lat = Number(match[2])
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null
  return { lat, lon }
}

/** Lon/lat centroid of all coordinates in WKT (LineString, Polygon, etc.). */
function parseWktCentroid(wkt) {
  const pairs = []
  const re = /(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g
  let m
  while ((m = re.exec(String(wkt || ''))) !== null) {
    const lon = Number(m[1])
    const lat = Number(m[2])
    if (Number.isFinite(lat) && Number.isFinite(lon)) pairs.push({ lat, lon })
  }
  if (!pairs.length) return null
  const sumLat = pairs.reduce((a, p) => a + p.lat, 0)
  const sumLon = pairs.reduce((a, p) => a + p.lon, 0)
  return { lat: sumLat / pairs.length, lon: sumLon / pairs.length }
}

function distSq(a, b) {
  const dLat = a.lat - b.lat
  const dLon = a.lon - b.lon
  return dLat * dLat + dLon * dLon
}

async function loadCityData() {
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
    const geometryWkt = cols[13]

    if (!String(locId).startsWith('stn_')) continue
    const citySlug = citySlugFromLocId(locId)
    if (!citySlug) continue

    const lonLat = parseFirstLonLat(geometryWkt)
    if (!lonLat) continue

    if (!byScenario[scId]) byScenario[scId] = {}
    if (!byScenario[scId][citySlug]) {
      byScenario[scId][citySlug] = {
        city: citySlug.replace(/_/g, ' '),
        totalCapacityKw: 0,
        latWeightedSum: 0,
        lonWeightedSum: 0,
        weightSum: 0,
      }
    }

    const cityEntry = byScenario[scId][citySlug]
    const weight = Math.max(1, capacityKw)
    cityEntry.totalCapacityKw += capacityKw
    cityEntry.latWeightedSum += lonLat.lat * weight
    cityEntry.lonWeightedSum += lonLat.lon * weight
    cityEntry.weightSum += weight
  }

  // Add in-road (dynamic) capacity_kw to nearest plug-in city within each scenario.
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue
    const cols = parseCsvLine(line)
    const scId = cols[0]
    const locId = cols[1]
    const capacityKw = Number(cols[3]) || 0
    const geometryWkt = cols[13]

    if (!String(locId).startsWith('dwpt_')) continue
    const scenarioCities = byScenario[scId]
    if (!scenarioCities || !Object.keys(scenarioCities).length) continue

    const centroid = parseWktCentroid(geometryWkt)
    if (!centroid) continue

    let nearestSlug = null
    let bestD = Infinity
    for (const slug of Object.keys(scenarioCities)) {
      const e = scenarioCities[slug]
      const lat = e.latWeightedSum / e.weightSum
      const lon = e.lonWeightedSum / e.weightSum
      const d = distSq(centroid, { lat, lon })
      if (d < bestD) {
        bestD = d
        nearestSlug = slug
      }
    }
    if (nearestSlug) scenarioCities[nearestSlug].totalCapacityKw += capacityKw
  }

  // Flatten and finalize weighted city coordinates.
  const result = {}
  for (const [scId, cities] of Object.entries(byScenario)) {
    result[scId] = Object.values(cities)
      .map((entry) => ({
        city: entry.city,
        totalCapacityKw: entry.totalCapacityKw,
        lat: entry.latWeightedSum / entry.weightSum,
        lon: entry.lonWeightedSum / entry.weightSum,
      }))
      .filter((d) => Number.isFinite(d.lat) && Number.isFinite(d.lon))
  }
  return result
}

function currentScenarioId() {
  return String(props.scenario?.id || '').replace('scenario-', '')
}

function drawScenarioMarkers() {
  if (!mapInstance || !markerLayer) return
  markerLayer.clearLayers()

  const scId = currentScenarioId()
  const points = cityDataByScenario[scId] || []
  if (!points.length) return

  const values = points.map((p) => p.totalCapacityKw)
  const maxVal = Math.max(...values, 1)
  const minVal = Math.min(...values, 0)

  for (const point of points) {
    const normalized = (point.totalCapacityKw - minVal) / Math.max(1, maxVal - minVal)
    const radius = 5 + normalized * 14
    const marker = L.circleMarker([point.lat, point.lon], {
      radius,
      color: '#1565c0',
      fillColor: '#1e88e5',
      fillOpacity: 0.65,
      weight: 1.5,
    })

    marker.bindTooltip(
      `<strong>${point.city}</strong><br/>Total kW: ${Math.round(point.totalCapacityKw).toLocaleString()}`,
      { sticky: true }
    )
    marker.addTo(markerLayer)
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

  markerLayer = L.layerGroup().addTo(mapInstance)
  mapInstance.on('zoomend moveend', drawScenarioMarkers)
  drawScenarioMarkers()
}

onMounted(async () => {
  try {
    cityDataByScenario = await loadCityData()
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
    drawScenarioMarkers()
  }
)

onUnmounted(() => {
  if (mapInstance) {
    mapInstance.off('zoomend moveend', drawScenarioMarkers)
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

.legend-dot {
  display: inline-block;
  border-radius: 999px;
  background: rgba(30, 136, 229, 0.65);
  border: 1px solid #1565c0;
}

.legend-dot-small {
  width: 8px;
  height: 8px;
}

.legend-dot-large {
  width: 16px;
  height: 16px;
}

</style>
