<template>
  <div class="wasatch-map-container">
    <svg 
      viewBox="0 0 1000 600" 
      class="wasatch-map"
      @click="handleMapClick"
    >
      <!-- Background - Valley floor -->
      <rect x="0" y="0" width="1000" height="600" fill="#e8f5e9" />
      
      <!-- Great Salt Lake (Northwest) -->
      <ellipse
        cx="150"
        cy="80"
        rx="120"
        ry="60"
        fill="#81d4fa"
        opacity="0.6"
        stroke="#0288d1"
        stroke-width="2"
      />
      <text x="150" y="85" text-anchor="middle" font-size="12" fill="#01579b" font-weight="bold">Great Salt Lake</text>
      
      <!-- Wasatch Mountains (Eastern side) -->
      <path
        d="M 800 0 L 850 100 L 900 150 L 950 200 L 980 250 L 1000 300 L 1000 600 L 800 600 Z"
        fill="#8d6e63"
        opacity="0.7"
        stroke="#5d4037"
        stroke-width="2"
      />
      <path
        d="M 750 50 L 780 120 L 820 180 L 860 240 L 900 300 L 920 350 L 940 400 L 950 450 L 960 500 L 970 550 L 980 600 L 750 600 Z"
        fill="#a1887f"
        opacity="0.6"
      />
      <!-- Mountain peaks -->
      <polygon points="850,100 870,60 890,100" fill="#ffffff" opacity="0.8" />
      <polygon points="900,150 920,110 940,150" fill="#ffffff" opacity="0.8" />
      <polygon points="950,200 970,160 990,200" fill="#ffffff" opacity="0.8" />
      <text x="900" y="350" text-anchor="middle" font-size="14" fill="#3e2723" font-weight="bold" transform="rotate(-90 900 350)">Wasatch Mountains</text>
      
      <!-- Ogden (North) -->
      <ellipse
        cx="200"
        cy="120"
        rx="80"
        ry="50"
        :fill="getMunicipalityColor('Ogden')"
        :stroke="hoveredMunicipality === 'Ogden' ? '#1976d2' : '#333'"
        stroke-width="2"
        class="municipality"
        data-municipality="Ogden"
        @mouseenter="hoveredMunicipality = 'Ogden'"
        @mouseleave="hoveredMunicipality = null"
        style="cursor: pointer;"
        opacity="0.8"
      />
      <text
        x="200"
        y="125"
        text-anchor="middle"
        fill="white"
        font-weight="bold"
        font-size="14"
        class="municipality-label"
      >Ogden</text>
      
      <!-- West Valley City (West of Salt Lake) -->
      <ellipse
        cx="180"
        cy="250"
        rx="90"
        ry="60"
        :fill="getMunicipalityColor('West Valley City')"
        :stroke="hoveredMunicipality === 'West Valley City' ? '#1976d2' : '#333'"
        stroke-width="2"
        class="municipality"
        data-municipality="West Valley City"
        @mouseenter="hoveredMunicipality = 'West Valley City'"
        @mouseleave="hoveredMunicipality = null"
        style="cursor: pointer;"
        opacity="0.8"
      />
      <text
        x="180"
        y="255"
        text-anchor="middle"
        fill="white"
        font-weight="bold"
        font-size="13"
        class="municipality-label"
      >West Valley City</text>
      
      <!-- Salt Lake City (Central) -->
      <ellipse
        cx="320"
        cy="240"
        rx="110"
        ry="70"
        :fill="getMunicipalityColor('Salt Lake City')"
        :stroke="hoveredMunicipality === 'Salt Lake City' ? '#1976d2' : '#333'"
        stroke-width="3"
        class="municipality"
        data-municipality="Salt Lake City"
        @mouseenter="hoveredMunicipality = 'Salt Lake City'"
        @mouseleave="hoveredMunicipality = null"
        style="cursor: pointer;"
        opacity="0.8"
      />
      <text
        x="320"
        y="245"
        text-anchor="middle"
        fill="white"
        font-weight="bold"
        font-size="16"
        class="municipality-label"
      >Salt Lake City</text>
      
      <!-- Sandy (South of Salt Lake) -->
      <ellipse
        cx="350"
        cy="360"
        rx="85"
        ry="55"
        :fill="getMunicipalityColor('Sandy')"
        :stroke="hoveredMunicipality === 'Sandy' ? '#1976d2' : '#333'"
        stroke-width="2"
        class="municipality"
        data-municipality="Sandy"
        @mouseenter="hoveredMunicipality = 'Sandy'"
        @mouseleave="hoveredMunicipality = null"
        style="cursor: pointer;"
        opacity="0.8"
      />
      <text
        x="350"
        y="365"
        text-anchor="middle"
        fill="white"
        font-weight="bold"
        font-size="14"
        class="municipality-label"
      >Sandy</text>
      
      <!-- Provo (South) -->
      <ellipse
        cx="420"
        cy="450"
        rx="95"
        ry="60"
        :fill="getMunicipalityColor('Provo')"
        :stroke="hoveredMunicipality === 'Provo' ? '#1976d2' : '#333'"
        stroke-width="2"
        class="municipality"
        data-municipality="Provo"
        @mouseenter="hoveredMunicipality = 'Provo'"
        @mouseleave="hoveredMunicipality = null"
        style="cursor: pointer;"
        opacity="0.8"
      />
      <text
        x="420"
        y="455"
        text-anchor="middle"
        fill="white"
        font-weight="bold"
        font-size="15"
        class="municipality-label"
      >Provo</text>
      
      <!-- I-15 Corridor (Main highway running north-south) -->
      <path
        d="M 250 50 Q 280 150 300 250 Q 320 350 350 450 Q 380 520 400 580"
        fill="none"
        stroke="#ff6f00"
        stroke-width="4"
        stroke-dasharray="10,5"
        opacity="0.6"
      />
      <text x="280" y="300" font-size="12" fill="#e65100" font-weight="bold" transform="rotate(15 280 300)">I-15</text>
      
      <!-- Utah Lake (South) -->
      <ellipse
        cx="500"
        cy="500"
        rx="100"
        ry="70"
        fill="#81d4fa"
        opacity="0.5"
        stroke="#0288d1"
        stroke-width="2"
      />
      <text x="500" y="505" text-anchor="middle" font-size="12" fill="#01579b" font-weight="bold">Utah Lake</text>
      
      <!-- Compass Rose -->
      <g transform="translate(50, 500)">
        <circle cx="0" cy="0" r="30" fill="none" stroke="#666" stroke-width="2" />
        <line x1="0" y1="-30" x2="0" y2="30" stroke="#666" stroke-width="2" />
        <line x1="-30" y1="0" x2="30" y2="0" stroke="#666" stroke-width="2" />
        <text x="0" y="-40" text-anchor="middle" font-size="14" fill="#333" font-weight="bold">N</text>
        <text x="40" y="5" text-anchor="middle" font-size="12" fill="#666">E</text>
        <text x="-40" y="5" text-anchor="middle" font-size="12" fill="#666">W</text>
        <text x="0" y="50" text-anchor="middle" font-size="12" fill="#666">S</text>
      </g>
      
      <!-- Legend -->
      <g transform="translate(700, 50)">
        <rect x="0" y="0" width="250" height="180" fill="white" stroke="#ddd" stroke-width="1" rx="4" opacity="0.95" />
        <text x="125" y="25" text-anchor="middle" font-weight="bold" font-size="16" fill="#333">Legend</text>
        <rect x="20" y="40" width="20" height="20" fill="#4caf50" />
        <text x="50" y="55" font-size="12" fill="#333">Low Impact</text>
        <rect x="20" y="70" width="20" height="20" fill="#ff9800" />
        <text x="50" y="85" font-size="12" fill="#333">Medium Impact</text>
        <rect x="20" y="100" width="20" height="20" fill="#f44336" />
        <text x="50" y="115" font-size="12" fill="#333">High Impact</text>
        <line x1="20" y1="130" x2="230" y2="130" stroke="#ddd" stroke-width="1" />
        <text x="125" y="150" text-anchor="middle" font-size="11" fill="#666">Click on a municipality</text>
        <text x="125" y="170" text-anchor="middle" font-size="11" fill="#666">for details</text>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  scenario: Object
})

const emit = defineEmits(['municipality-clicked'])

const hoveredMunicipality = ref(null)

const municipalities = computed(() => {
  return Object.keys(props.scenario.municipalities).map(name => ({
    name,
    data: props.scenario.municipalities[name]
  }))
})

function getMunicipalityColor(municipalityName) {
  const municipality = props.scenario.municipalities[municipalityName]
  if (!municipality) return '#ccc'
  
  // Color based on grid upgrade cost (relative scale)
  const maxUpgrade = Math.max(...Object.values(props.scenario.municipalities).map(m => m.gridUpgrades.dollars))
  const ratio = municipality.gridUpgrades.dollars / maxUpgrade
  
  if (ratio < 0.4) return '#4caf50' // Green - low
  if (ratio < 0.7) return '#ff9800' // Orange - medium
  return '#f44336' // Red - high
}

function handleMapClick(event) {
  const municipalityElement = event.target.closest('.municipality')
  if (municipalityElement) {
    const municipalityName = municipalityElement.getAttribute('data-municipality')
    const municipality = municipalities.value.find(m => m.name === municipalityName)
    if (municipality) {
      emit('municipality-clicked', municipality)
    }
  }
}
</script>

<style scoped>
.wasatch-map-container {
  width: 100%;
  height: 600px;
  overflow: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fafafa;
}

.wasatch-map {
  width: 100%;
  height: 100%;
}

.municipality {
  transition: all 0.3s ease;
  filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
}

.municipality:hover {
  opacity: 1 !important;
  transform: scale(1.1);
  transform-origin: center;
  filter: drop-shadow(4px 4px 8px rgba(0,0,0,0.5));
}

.municipality-label {
  pointer-events: none;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
}
</style>
