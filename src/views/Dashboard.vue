<template>
  <div>
    <Navbar />
    <div style="margin-top: 48px;">
      <v-container fluid class="pa-4">
      <!-- Context Banner -->
      <v-row class="mb-3">
        <v-col cols="12">
          <v-alert type="info" variant="tonal" density="compact" icon="mdi-information-outline">
            <strong>Class 8 vehicles only.</strong> This dashboard models infrastructure for heavy-duty
            trucks (Class 8) across the Wasatch Front. Choose a set of assumptions below to see how
            different investments would affect costs. You can also click any bar in the histograms to
            jump to that scenario. All charts and metrics update when you change a parameter.
          </v-alert>
        </v-col>
      </v-row>

      <!-- Key takeaway -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-alert type="success" variant="tonal" density="compact" icon="mdi-lightbulb-on-outline">
            <strong>Key takeaway:</strong> {{ keyTakeawayText }}
          </v-alert>
        </v-col>
      </v-row>

      <!-- Selected scenario inputs + county coverage map -->
      <v-row class="mb-4">
        <v-col cols="12" md="6" class="d-flex">
          <v-card class="scenario-inputs-card flex-grow-1">
            <v-card-title class="text-subtitle-1 font-weight-medium">
              Selected scenario inputs
            </v-card-title>
            <v-card-subtitle>Assumptions for the current scenario</v-card-subtitle>
            <v-card-text class="pt-2">
              <v-row class="mb-3" dense>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="selectedStationaryCost"
                    :items="stationaryCostSelectItems"
                    item-title="title"
                    item-value="value"
                    label="Plug-In Charging Cost Tier"
                    variant="outlined"
                    density="compact"
                    hide-details
                  ></v-select>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="selectedDynamicCost"
                    :items="dynamicCostSelectItems"
                    item-title="title"
                    item-value="value"
                    label="In-Road Charging Cost Tier"
                    variant="outlined"
                    density="compact"
                    hide-details
                  ></v-select>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="selectedBatteryCost"
                    :items="batteryCostSelectItems"
                    item-title="title"
                    item-value="value"
                    label="Battery Cost Tier"
                    variant="outlined"
                    density="compact"
                    hide-details
                  ></v-select>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="selectedEvAdoption"
                    :items="evAdoptionSelectItems"
                    item-title="title"
                    item-value="value"
                    label="Fleet Electrification Tier"
                    variant="outlined"
                    density="compact"
                    hide-details
                  ></v-select>
                </v-col>
              </v-row>

              <v-row dense>
                <v-col cols="12" sm="6" md="3">
                  <div class="d-flex align-center text-caption text-medium-emphasis mb-1">
                    Plug-in charging upfront cost (capex)
                    <v-tooltip location="top" max-width="280" content-class="no-scroll-tooltip">
                      <template #activator="{ props }">
                        <v-icon v-bind="props" size="14" color="grey" class="ml-1">mdi-information-outline</v-icon>
                      </template>
                      Capital cost (capex) per kW of traditional plug-in stations
                    </v-tooltip>
                  </div>
                  <div class="text-body-2 font-weight-medium">${{ currentScenario.stationaryCapexPerKw?.toLocaleString() }}/kW</div>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <div class="d-flex align-center text-caption text-medium-emphasis mb-1">
                    Plug-in charging annual operations (opex)
                    <v-tooltip location="top" max-width="280" content-class="no-scroll-tooltip">
                      <template #activator="{ props }">
                        <v-icon v-bind="props" size="14" color="grey" class="ml-1">mdi-information-outline</v-icon>
                      </template>
                      Yearly operating cost (opex) per kW of traditional plug-in stations
                    </v-tooltip>
                  </div>
                  <div class="text-body-2 font-weight-medium">${{ currentScenario.stationaryOpexPerKwYear?.toLocaleString() }}/kW/yr</div>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <div class="d-flex align-center text-caption text-medium-emphasis mb-1">
                    In-road charging upfront cost (capex)
                    <v-tooltip location="top" max-width="280" content-class="no-scroll-tooltip">
                      <template #activator="{ props }">
                        <v-icon v-bind="props" size="14" color="grey" class="ml-1">mdi-information-outline</v-icon>
                      </template>
                      Capital cost (capex) per lane-mile for in-road wireless charging
                    </v-tooltip>
                  </div>
                  <div class="text-body-2 font-weight-medium">${{ formatCurrency(currentScenario.dynamicCapexPerLaneMile) }}/lane-mi</div>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <div class="d-flex align-center text-caption text-medium-emphasis mb-1">
                    In-road charging annual operations (opex)
                    <v-tooltip location="top" max-width="280" content-class="no-scroll-tooltip">
                      <template #activator="{ props }">
                        <v-icon v-bind="props" size="14" color="grey" class="ml-1">mdi-information-outline</v-icon>
                      </template>
                      Yearly operating cost (opex) per lane-mile for in-road wireless charging
                    </v-tooltip>
                  </div>
                  <div class="text-body-2 font-weight-medium">${{ formatCurrency(currentScenario.dynamicOpexPerLaneMileYear) }}/lane-mi/yr</div>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <div class="d-flex align-center text-caption text-medium-emphasis mb-1">
                    EV battery cost
                    <v-tooltip location="top" max-width="280" content-class="no-scroll-tooltip">
                      <template #activator="{ props }">
                        <v-icon v-bind="props" size="14" color="grey" class="ml-1">mdi-information-outline</v-icon>
                      </template>
                      Assumed manufacturing cost of electric vehicle battery packs
                    </v-tooltip>
                  </div>
                  <div class="text-body-2 font-weight-medium">${{ currentScenario.batteryCost }}/kWh</div>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <div class="d-flex align-center text-caption text-medium-emphasis mb-1">
                    Fleet electrification
                    <v-tooltip location="top" max-width="280" content-class="no-scroll-tooltip">
                      <template #activator="{ props }">
                        <v-icon v-bind="props" size="14" color="grey" class="ml-1">mdi-information-outline</v-icon>
                      </template>
                      Share of vehicles on the road that are electric
                    </v-tooltip>
                  </div>
                  <div class="text-body-2 font-weight-medium">{{ currentScenario.evAdoptionPercent }}%</div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6" class="d-flex">
          <v-card class="flex-grow-1 top-map-card">
            <v-card-title class="d-flex align-center">
              Wasatch Front Infrastructure Map
              <v-tooltip location="bottom" max-width="320">
                <template #activator="{ props }">
                  <v-icon v-bind="props" size="18" color="grey" class="ml-2">mdi-information-outline</v-icon>
                </template>
                Blue dots are cities. Dot size reflects total kW: plug-in capacity at that city plus
                in-road (dynamic) capacity attributed to the nearest city from each road segment.
              </v-tooltip>
            </v-card-title>
            <v-card-subtitle>Total kW per city (plug-in + in-road, grouped by city)</v-card-subtitle>
            <v-card-text>
              <CityInfrastructureMap
                :scenario="currentScenario"
                :height="320"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Infrastructure and Histogram Cards -->
      <v-row class="mb-4">
        <v-col cols="12" md="6" class="d-flex">
          <v-card class="flex-grow-1">
            <v-card-title class="d-flex align-center">
              Total Charging Capacity
              <v-tooltip location="bottom" max-width="320">
                <template #activator="{ props }">
                  <v-icon v-bind="props" size="18" color="grey" class="ml-2">mdi-information-outline</v-icon>
                </template>
                The peak simultaneous charging power available across all locations in this scenario,
                measured in megawatts (MW). For reference: a home Level 2 charger delivers ~0.007–0.011 MW;
                a public DC fast charger delivers ~0.05–0.35 MW.
              </v-tooltip>
            </v-card-title>
            <v-card-subtitle>Peak megawatts available across the region</v-card-subtitle>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="4">
                  <div class="d-flex align-center mb-1">
                    <div class="text-subtitle-1 mr-1">This scenario</div>
                    <v-tooltip text="Compared against all other scenarios in the bar chart. Click any bar to select that scenario.">
                      <template #activator="{ props }">
                        <v-icon v-bind="props" size="18" color="primary" class="ml-1">mdi-information-outline</v-icon>
                      </template>
                    </v-tooltip>
                  </div>
                  <div class="text-h5 text-primary font-weight-bold mb-1">
                    {{ formatPowerMw(currentScenario.totalChargeCapacityKw) }}
                  </div>
                  <div class="text-caption text-warning mt-1">~ Model estimate</div>
                </v-col>
                <v-col cols="12" md="8">
                  <ChargingCapacityHistogram
                    :currentScenario="currentScenario"
                    :allScenarios="scenarioData.scenarios"
                    @select-scenario="selectScenario"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6" class="d-flex">
          <v-card class="flex-grow-1">
            <v-card-title class="d-flex align-center">
              System Cost Efficiency
              <v-tooltip location="bottom" max-width="320">
                <template #activator="{ props }">
                  <v-icon v-bind="props" size="18" color="grey" class="ml-2">mdi-information-outline</v-icon>
                </template>
                The cost of operating a Class 8 vehicle per mile using the proposed infrastructure
                changes. Lower is better — it means more transportation value per dollar invested.
                The bar chart compares all 54 scenarios so you can see where this one ranks.
              </v-tooltip>
            </v-card-title>
            <v-card-subtitle>How far each dollar goes vs. all other scenarios</v-card-subtitle>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="4">
                  <div class="d-flex align-center mb-1">
                    <div class="text-subtitle-1 mr-1">This scenario</div>
                    <v-tooltip text="Compared against all other scenarios in the bar chart. Click any bar to select that scenario.">
                      <template #activator="{ props }">
                        <v-icon v-bind="props" size="18" color="primary" class="ml-1">mdi-information-outline</v-icon>
                      </template>
                    </v-tooltip>
                  </div>
                  <div class="d-flex align-center">
                    <span class="text-h6 text-primary font-weight-bold">${{ currentScenario.costPerMile.toFixed(2) }}/mile</span>
                    <v-tooltip :text="costDisclaimer" location="top" max-width="280">
                      <template #activator="{ props }">
                        <v-icon v-bind="props" size="14" color="grey" class="ml-1">mdi-information-outline</v-icon>
                      </template>
                    </v-tooltip>
                  </div>
                  <div class="text-caption text-warning mt-1">~ Model estimate</div>
                </v-col>
                <v-col cols="12" md="8">
                  <CostPerMileHistogram
                    :currentScenario="currentScenario"
                    :allScenarios="scenarioData.scenarios"
                    @select-scenario="selectScenario"
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
            <v-card-title class="d-flex align-center">
              Additional Grid Capacity Needed (MW)
              <v-tooltip location="bottom" max-width="320">
                <template #activator="{ props }">
                  <v-icon v-bind="props" size="18" color="grey" class="ml-2">mdi-information-outline</v-icon>
                </template>
                Modeled additional electrical capacity (MW) for the Wasatch Front to support this
                scenario — substations, transformers, and distribution capacity. Municipalities often
                cost-share major grid upgrades with the utility.
              </v-tooltip>
            </v-card-title>
            <v-card-subtitle>Modeled incremental capacity for the Wasatch Front grid</v-card-subtitle>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="4">
                  <div class="d-flex align-center mb-1">
                    <div class="text-subtitle-1 mr-1">This scenario</div>
                    <v-tooltip text="Compared against all other scenarios in the bar chart. Click any bar to select that scenario.">
                      <template #activator="{ props }">
                        <v-icon v-bind="props" size="18" color="primary" class="ml-1">mdi-information-outline</v-icon>
                      </template>
                    </v-tooltip>
                  </div>
                  <div class="text-h5 text-primary font-weight-bold">
                    {{ formatPowerMw(currentScenario.gridInfrastructureUpgrades.kw) }} additional grid capacity
                  </div>
                  <div class="text-caption text-warning">~ Model estimate</div>
                </v-col>
                <v-col cols="12" md="8">
                  <GridUpgradeHistogram
                    :currentScenario="currentScenario"
                    :allScenarios="scenarioData.scenarios"
                    @select-scenario="selectScenario"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6" class="d-flex">
          <v-card class="flex-grow-1">
            <v-card-title class="d-flex align-center">
              Charging Mix
              <v-tooltip location="bottom" max-width="320">
                <template #activator="{ props }">
                  <v-icon v-bind="props" size="18" color="grey" class="ml-2">mdi-information-outline</v-icon>
                </template>
                <strong>Stationary (plug-in):</strong> Traditional charging stations at homes,
                workplaces, and public lots. <br/>
                <strong>Dynamic (road-embedded):</strong> Wireless in-road technology that charges
                vehicles while they drive. Higher upfront cost but reduces the need for large
                onboard batteries.
              </v-tooltip>
            </v-card-title>
            <v-card-subtitle>Share of stationary vs. road-embedded (dynamic) charging</v-card-subtitle>
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
            <v-card-title class="d-flex align-center">
              Projected 24-Hour EV Grid Load
              <v-tooltip location="bottom" max-width="320">
                <template #activator="{ props }">
                  <v-icon v-bind="props" size="18" color="grey" class="ml-2">mdi-information-outline</v-icon>
                </template>
                Modeled electricity demand from EVs across a typical 24-hour period for this scenario.
                Peaks indicate times when the grid will need to supply the most power for EV charging.
                Utility planners use this profile to size generation and distribution assets.
              </v-tooltip>
            </v-card-title>
            <v-card-subtitle>Modeled electricity demand from EVs across a typical day</v-card-subtitle>
            <v-card-text class="demand-chart-container">
              <DemandLineChart
                :demandData="currentScenario.electricityDemand24h"
                :allScenarios="scenarioData.scenarios"
                :currentScenario="currentScenario"
                @select-scenario="selectScenario"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- County breakdown -->
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title class="d-flex align-center">
              County Infrastructure Summary
              <v-tooltip location="bottom" max-width="320">
                <template #activator="{ props }">
                  <v-icon v-bind="props" size="18" color="grey" class="ml-2">mdi-information-outline</v-icon>
                </template>
                Select a county to view model-estimated energy and cost metrics for the current scenario.
              </v-tooltip>
            </v-card-title>
            <v-card-subtitle>Select a county to view its metrics</v-card-subtitle>
            <v-card-text>
              <v-select
                v-model="selectedCounty"
                :items="countySelectItems"
                item-title="title"
                item-value="value"
                label="County"
                variant="outlined"
                density="compact"
                hide-details
                class="mb-4"
              />

              <v-alert
                v-if="!selectedCountyData"
                type="info"
                variant="tonal"
                density="comfortable"
              >
                No county-level data is available for this selection.
              </v-alert>

              <template v-else>
                <v-row dense>
                  <v-col cols="12" md="6">
                    <v-card variant="tonal" class="pa-3 county-metric-card">
                      <div class="text-caption text-medium-emphasis">Total Energy Delivered (lifetime)</div>
                      <div class="text-h6 font-weight-bold mt-1">
                        {{ Math.round(selectedCountyData.totalKwh / 1000).toLocaleString() }} MWh
                      </div>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-card variant="tonal" class="pa-3 county-metric-card">
                      <div class="text-caption text-medium-emphasis">Avg. Cost per kWh Delivered</div>
                      <div class="text-h6 font-weight-bold mt-1">
                        ${{ selectedCountyData.avgBreakevenPerKwh.toFixed(3) }}/kWh
                      </div>
                    </v-card>
                  </v-col>
                </v-row>

                <div class="text-subtitle-2 font-weight-medium mt-4 mb-2">
                  Top locations by net present cost
                </div>
                <v-table density="compact">
                  <thead>
                    <tr>
                      <th class="text-left">Location</th>
                      <th class="text-right">Lifetime Energy (MWh)</th>
                      <th class="text-right">Breakeven ($/kWh)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="loc in selectedCountyTopLocations" :key="loc.name">
                      <td>{{ loc.name }}</td>
                      <td class="text-right">{{ Math.round(loc.kwhVal / 1000).toLocaleString() }}</td>
                      <td class="text-right">${{ loc.breakevenPerKwh.toFixed(3) }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </template>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      </v-container>
    </div>

    <v-dialog v-model="gettingStartedDialog" max-width="560" content-class="quick-start-dialog-content">
      <v-card>
        <v-card-title class="d-flex align-center pt-4">
          <v-icon color="primary" class="mr-2">mdi-map-marker-path</v-icon>
          Quick Start
        </v-card-title>
        <v-card-text class="pt-2">
          <div class="text-body-2 mb-3">
            Use these three steps to explore scenarios and county-level results.
          </div>
          <div class="d-flex flex-column ga-2 align-start">
            <v-chip size="small" color="primary" variant="tonal">1. Choose assumptions</v-chip>
            <v-chip size="small" color="primary" variant="tonal">2. Compare regional outcomes</v-chip>
            <v-chip size="small" color="primary" variant="tonal">3. Review county details</v-chip>
          </div>
        </v-card-text>
        <v-card-actions class="pb-4">
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="flat" @click="gettingStartedDialog = false">Got it</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Navbar from '../components/Navbar.vue'
import CostPerMileHistogram from '../components/CostPerMileHistogram.vue'
import GridUpgradeHistogram from '../components/GridUpgradeHistogram.vue'
import ChargingCapacityHistogram from '../components/ChargingCapacityHistogram.vue'
import ChargingPieChart from '../components/ChargingPieChart.vue'
import DemandLineChart from '../components/DemandLineChart.vue'
import CityInfrastructureMap from '../components/CityInfrastructureMap.vue'
import { scenarioData, findScenario, locationDataByScenario } from '../data/dataset.js'

// Options for the 4 scenario selector dropdowns, derived from CSV-backed dataset
const stationaryCostSelectItems = scenarioData.stationaryChargingCostSelectItems
const dynamicCostSelectItems = scenarioData.dynamicChargingCostSelectItems
const batteryCostSelectItems = scenarioData.batteryCostSelectItems
const evAdoptionSelectItems = scenarioData.evAdoptionPercentSelectItems

// Initialize selects with the first available option from each list
const selectedStationaryCost = ref(stationaryCostSelectItems[0]?.value ?? '')
const selectedDynamicCost = ref(dynamicCostSelectItems[0]?.value ?? '')
const selectedBatteryCost = ref(batteryCostSelectItems[0]?.value ?? 0)
const selectedEvAdoption = ref(evAdoptionSelectItems[0]?.value ?? 0)
const gettingStartedDialog = ref(true)

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

const selectedCounty = ref(null)

const countySelectItems = computed(() => {
  return Object.keys(currentCountyData.value)
    .sort((a, b) => a.localeCompare(b))
    .map(county => ({
      title: `${county} County`,
      value: county,
    }))
})

const selectedCountyData = computed(() => {
  if (!selectedCounty.value) return null
  return currentCountyData.value[selectedCounty.value] || null
})

const selectedCountyTopLocations = computed(() => {
  if (!selectedCountyData.value?.locations) return []
  return selectedCountyData.value.locations.slice(0, 10)
})

const costDisclaimer = 'Costs shown here should be used as rough estimates for comparing scenarios, not as actual budget figures for a project.'
const keyTakeawayText = computed(() => {
  const chargeCapacity = formatPowerMw(currentScenario.value.totalChargeCapacityKw)
  const gridMw = formatPowerMw(currentScenario.value.gridInfrastructureUpgrades.kw)
  const costPerMile = currentScenario.value.costPerMile.toFixed(2)
  return `This scenario delivers ${chargeCapacity} of total charging capacity, needs about ${gridMw} of additional grid capacity, and is estimated at $${costPerMile} per mile.`
})

function formatCurrency(value) {
  return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function formatPowerMw(kw) {
  const mw = Number(kw) / 1000
  return `${mw.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 0 })} MW`
}

function selectScenario(scenario) {
  selectedStationaryCost.value = scenario.stationaryChargingCost
  selectedDynamicCost.value = scenario.dynamicChargingCost
  selectedBatteryCost.value = scenario.batteryCost
  selectedEvAdoption.value = scenario.evAdoptionPercent
}

watch(
  countySelectItems,
  (items) => {
    if (!items.length) {
      selectedCounty.value = null
      return
    }
    const selectedStillExists = items.some(i => i.value === selectedCounty.value)
    if (!selectedStillExists) {
      selectedCounty.value = items[0].value
    }
  },
  { immediate: true }
)
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

.scenario-inputs-card {
  min-height: auto;
}

.top-map-card {
  min-height: auto;
}

.county-metric-card {
  min-height: 120px;
}
</style>

<style>
/* Unscoped: tooltip content renders in portal */
.no-scroll-tooltip {
  overflow: visible !important;
  max-height: none !important;
}

.quick-start-dialog-content {
  max-height: 320px;
}
</style>
