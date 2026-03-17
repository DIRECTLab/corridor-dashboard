<template>
  <div>
    <Navbar />
    <div style="margin-top: 48px;">
      <v-container fluid class="pa-4">
      <!-- Scenario Selector -->
      <v-row class="mb-4">
        <v-col cols="12" md="3">
          <v-select
            v-model="selectedStationaryCost"
            :items="stationaryCostOptions"
            label="Stationary Charging Cost"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="selectedDynamicCost"
            :items="dynamicCostOptions"
            label="Dynamic Charging Cost"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="selectedBatteryCost"
            :items="batteryCostOptions"
            label="Battery Cost"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="selectedEvAdoption"
            :items="evAdoptionOptions"
            label="EV Adoption %"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>
      </v-row>

      <!-- Infrastructure and Histogram Cards -->
      <v-row class="mb-4">
        <v-col cols="12" md="6" class="d-flex">
          <v-card class="flex-grow-1">
            <v-card-title>Necessary Grid Infrastructure Upgrades</v-card-title>
            <v-card-text class="d-flex flex-column justify-center" style="min-height: 300px;">
              <div class="text-h4 mb-2">${{ formatCurrency(currentScenario.gridInfrastructureUpgrades.dollars) }}</div>
              <div class="text-h6">{{ currentScenario.gridInfrastructureUpgrades.kw.toLocaleString() }} kW</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6" class="d-flex">
          <v-card class="flex-grow-1">
            <v-card-title>Cost per Mile Comparison</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="4">
                  <div class="d-flex align-center mb-1">
                    <div class="text-subtitle-1 mr-1">Current scenario</div>
                    <v-tooltip text="Compared against all other scenarios in the histogram on the right.">
                      <template #activator="{ props }">
                        <v-icon
                          v-bind="props"
                          size="18"
                          color="primary"
                          class="ml-1"
                        >
                          mdi-information-outline
                        </v-icon>
                      </template>
                    </v-tooltip>
                  </div>
                  <div class="text-h5 text-primary font-weight-bold">
                    ${{ currentScenario.costPerMile.toFixed(2) }}/mile
                  </div>
                </v-col>
                <v-col cols="12" md="8">
                  <CostPerMileHistogram 
                    :currentScenario="currentScenario"
                    :allScenarios="scenarioData.scenarios"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Charge Capacity Cards -->
      <v-row class="mb-4">
        <v-col cols="12" md="6" class="d-flex">
          <v-card class="flex-grow-1">
            <v-card-title>Total EV Charge Capacity</v-card-title>
            <v-card-text class="d-flex flex-column justify-center" style="min-height: 300px;">
              <div class="text-h4">{{ currentScenario.totalChargeCapacityKw.toLocaleString() }} kW</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6" class="d-flex">
          <v-card class="flex-grow-1">
            <v-card-title>Charging Type Distribution</v-card-title>
            <v-card-text>
              <ChargingPieChart :scenario="currentScenario" />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- 24 Hour Demand Graph -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-card>
            <v-card-title>Electricity Demand - Last 24 Hours</v-card-title>
            <v-card-text class="demand-chart-container">
              <DemandLineChart :demandData="currentScenario.electricityDemand24h" />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Map -->
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title>Wasatch Front Map</v-card-title>
            <v-card-text>
              <WasatchMap
                :scenario="currentScenario"
                :countyData="currentCountyData"
                @municipality-clicked="showMunicipalityDialog"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      </v-container>
    </div>

    <!-- County Dialog -->
    <v-dialog v-model="municipalityDialog" max-width="680" scrollable>
      <v-card v-if="selectedMunicipality">
        <v-card-title class="text-h6 py-3 px-4 bg-primary text-white">
          {{ selectedMunicipality.name }}
        </v-card-title>

        <!-- No data case (e.g. Box Elder has no locations in the dataset) -->
        <v-card-text v-if="!selectedMunicipality.data" class="pa-4">
          <p class="text-body-1 text-medium-emphasis">
            No charging location data available for this county in the current scenario.
          </p>
        </v-card-text>

        <v-card-text v-else class="pa-4">
          <!-- County summary row -->
          <v-row dense class="mb-4">
            <v-col cols="4">
              <div class="text-caption text-medium-emphasis mb-1">Total Net Present Cost</div>
              <div class="text-h6 text-primary font-weight-bold">
                ${{ formatCurrency(Math.round(selectedMunicipality.data.totalNpcUsd)) }}
              </div>
            </v-col>
            <v-col cols="4">
              <div class="text-caption text-medium-emphasis mb-1">Total Energy (NPV)</div>
              <div class="text-h6 font-weight-bold">
                {{ Math.round(selectedMunicipality.data.totalKwh / 1000).toLocaleString() }} MWh
              </div>
            </v-col>
            <v-col cols="4">
              <div class="text-caption text-medium-emphasis mb-1">Avg Breakeven</div>
              <div class="text-h6 font-weight-bold">
                ${{ selectedMunicipality.data.avgBreakevenPerKwh.toFixed(3) }}/kWh
              </div>
            </v-col>
          </v-row>

          <v-divider class="mb-3" />

          <!-- Per-city breakdown table -->
          <div class="text-subtitle-2 mb-2">Charging Locations in this County</div>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="text-left">City</th>
                <th class="text-right">NPC Cost</th>
                <th class="text-right">Energy (MWh)</th>
                <th class="text-right">$/kWh breakeven</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="loc in selectedMunicipality.data.locations" :key="loc.name">
                <td>{{ loc.name }}</td>
                <td class="text-right">${{ formatCurrency(Math.round(loc.npcUsd)) }}</td>
                <td class="text-right">{{ Math.round(loc.kwhVal / 1000).toLocaleString() }}</td>
                <td class="text-right">${{ loc.breakevenPerKwh.toFixed(3) }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>

        <v-card-actions class="px-4 pb-3">
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="municipalityDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Navbar from '../components/Navbar.vue'
import CostPerMileHistogram from '../components/CostPerMileHistogram.vue'
import ChargingPieChart from '../components/ChargingPieChart.vue'
import DemandLineChart from '../components/DemandLineChart.vue'
import WasatchMap from '../components/WasatchMap.vue'
import { scenarioData, findScenario, locationDataByScenario } from '../data/dataset.js'

// Options for the 4 scenario selector dropdowns, derived from CSV-backed dataset
const stationaryCostOptions = scenarioData.stationaryChargingCostOptions
const dynamicCostOptions = scenarioData.dynamicChargingCostOptions
const batteryCostOptions = scenarioData.batteryCostOptions
const evAdoptionOptions = scenarioData.evAdoptionPercentOptions

// Initialize selects with the first available option from each list
const selectedStationaryCost = ref(stationaryCostOptions[0] || '')
const selectedDynamicCost = ref(dynamicCostOptions[0] || '')
const selectedBatteryCost = ref(batteryCostOptions[0] || 0)
const selectedEvAdoption = ref(evAdoptionOptions[0] || 0)

const currentScenario = computed(() => {
  return findScenario(
    selectedStationaryCost.value,
    selectedDynamicCost.value,
    selectedBatteryCost.value,
    selectedEvAdoption.value
  )
})

// County-level aggregated data for the current scenario, keyed by county name
const currentCountyData = computed(() => {
  const scId = currentScenario.value?.id?.replace('scenario-', '')
  return locationDataByScenario[scId] || {}
})

const municipalityDialog = ref(false)
const selectedMunicipality = ref(null)

function formatCurrency(value) {
  return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function showMunicipalityDialog(municipality) {
  selectedMunicipality.value = municipality
  municipalityDialog.value = true
}
</script>

<style scoped>
.v-card {
  min-height: 450px;
  display: flex;
  flex-direction: column;
}

.v-card-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: visible;
}

.demand-chart-container {
  overflow: visible !important;
  padding: 16px;
}

.v-row .v-col {
  display: flex;
}

.v-row .v-col > .v-card {
  width: 100%;
}
</style>
