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
              <CostPerMileHistogram 
                :currentScenario="currentScenario"
                :allScenarios="scenarioData.scenarios"
              />
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
                @municipality-clicked="showMunicipalityDialog"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      </v-container>
    </div>

    <!-- Municipality Dialog -->
    <v-dialog v-model="municipalityDialog" max-width="600">
      <v-card v-if="selectedMunicipality">
        <v-card-title>{{ selectedMunicipality.name }}</v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item>
              <v-list-item-title>Grid Infrastructure Upgrades</v-list-item-title>
              <v-list-item-subtitle>
                ${{ formatCurrency(selectedMunicipality.data.gridUpgrades.dollars) }} | 
                {{ selectedMunicipality.data.gridUpgrades.kw.toLocaleString() }} kW
              </v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Charge Capacity</v-list-item-title>
              <v-list-item-subtitle>{{ selectedMunicipality.data.chargeCapacity.toLocaleString() }} kW</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Cost per Mile</v-list-item-title>
              <v-list-item-subtitle>${{ selectedMunicipality.data.costPerMile.toFixed(2) }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="municipalityDialog = false">Close</v-btn>
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
import { scenarioData, findScenario } from '../data/dataset.js'

const selectedStationaryCost = ref(0.10)
const selectedDynamicCost = ref(0.15)
const selectedBatteryCost = ref(5000)
const selectedEvAdoption = ref(25)

const stationaryCostOptions = scenarioData.stationaryChargingCostOptions
const dynamicCostOptions = scenarioData.dynamicChargingCostOptions
const batteryCostOptions = scenarioData.batteryCostOptions
const evAdoptionOptions = scenarioData.evAdoptionPercentOptions

const currentScenario = computed(() => {
  return findScenario(
    selectedStationaryCost.value,
    selectedDynamicCost.value,
    selectedBatteryCost.value,
    selectedEvAdoption.value
  )
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
  height: 450px;
  display: flex;
  flex-direction: column;
}

.v-card-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.demand-chart-container {
  overflow: hidden !important;
  padding: 16px;
}

.v-row .v-col {
  display: flex;
}

.v-row .v-col > .v-card {
  width: 100%;
}
</style>
