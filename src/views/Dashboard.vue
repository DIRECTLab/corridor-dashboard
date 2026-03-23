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

      <!-- Scenario Selector -->
      <v-row class="mb-4">
        <v-col cols="12" md="3">
          <v-select
            v-model="selectedStationaryCost"
            :items="stationaryCostOptions"
            label="Fixed Charging Station Cost"
            variant="outlined"
            density="compact"
            hide-details
          ></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="selectedDynamicCost"
            :items="dynamicCostOptions"
            label="Road-Embedded (Wireless) Charging Cost"
            variant="outlined"
            density="compact"
            hide-details
          ></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="selectedBatteryCost"
            :items="batteryCostOptions"
            label="EV Battery Cost ($/kWh)"
            variant="outlined"
            density="compact"
            hide-details
          ></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="selectedEvAdoption"
            :items="evAdoptionOptions"
            label="Fleet Electrification Rate (%)"
            variant="outlined"
            density="compact"
            hide-details
          ></v-select>
        </v-col>
      </v-row>

      <!-- Selected scenario inputs -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-card class="scenario-inputs-card">
            <v-card-title class="text-subtitle-1 font-weight-medium">
              Selected scenario inputs
            </v-card-title>
            <v-card-subtitle>Assumptions for the current scenario</v-card-subtitle>
            <v-card-text class="pt-2">
              <v-row dense>
                <v-col cols="12" sm="6" md="3">
                  <div class="d-flex align-center text-caption text-medium-emphasis mb-1">
                    Fixed charging capital
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
                    Fixed charging operating
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
                    Road-embedded capital
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
                    Road-embedded operating
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
      </v-row>

      <!-- Infrastructure and Histogram Cards -->
      <v-row class="mb-4">
        <v-col cols="12" md="6" class="d-flex">
          <v-card class="flex-grow-1">
            <v-card-title class="d-flex align-center">
              Estimated Grid Upgrade Costs
              <v-tooltip location="bottom" max-width="320">
                <template #activator="{ props }">
                  <v-icon v-bind="props" size="18" color="grey" class="ml-2">mdi-information-outline</v-icon>
                </template>
                The additional electrical infrastructure investment needed regionwide to support this
                level of EV adoption — covering transformers, substations, and distribution lines.
                Your city typically shares these costs with the utility.
              </v-tooltip>
            </v-card-title>
            <v-card-subtitle>Total upgrades required to the Wasatch Front grid</v-card-subtitle>
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
                    {{ currentScenario.gridInfrastructureUpgrades.kw.toLocaleString() }} kW of additional capacity
                  </div>
                  <div class="d-flex align-center text-body-2 text-medium-emphasis">
                    ${{ formatCurrency(currentScenario.gridInfrastructureUpgrades.dollars) }}
                    <v-tooltip :text="costDisclaimer" location="top" max-width="280">
                      <template #activator="{ props }">
                        <v-icon v-bind="props" size="14" color="grey" class="ml-1">mdi-information-outline</v-icon>
                      </template>
                    </v-tooltip>
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
              Total Charging Capacity
              <v-tooltip location="bottom" max-width="320">
                <template #activator="{ props }">
                  <v-icon v-bind="props" size="18" color="grey" class="ml-2">mdi-information-outline</v-icon>
                </template>
                The peak simultaneous charging power available across all locations in this scenario,
                measured in kilowatts (kW). For reference: a home Level 2 charger delivers ~7–11 kW;
                a public DC fast charger delivers 50–350 kW.
              </v-tooltip>
            </v-card-title>
            <v-card-subtitle>Peak kilowatts available across the region</v-card-subtitle>
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
                    {{ currentScenario.totalChargeCapacityKw.toLocaleString() }} kW
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

      <!-- Map -->
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title class="d-flex align-center">
              Infrastructure by County
              <v-tooltip location="bottom" max-width="320">
                <template #activator="{ props }">
                  <v-icon v-bind="props" size="18" color="grey" class="ml-2">mdi-information-outline</v-icon>
                </template>
                Click any county to see 20-year infrastructure costs and energy delivery summary for
                that county under the current scenario.
              </v-tooltip>
            </v-card-title>
            <v-card-subtitle>Click any county for cost and energy summary</v-card-subtitle>
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

    <!-- Model Estimates Disclaimer Dialog -->
    <v-dialog v-model="modelEstimateDialog" max-width="480" persistent>
      <v-card>
        <v-card-title class="d-flex align-center pt-4">
          <v-icon color="warning" class="mr-2">mdi-alert-circle-outline</v-icon>
          Model-Based Estimates
        </v-card-title>
        <v-card-text class="pt-2">
          All figures shown are projections derived from planning assumptions and scenario inputs —
          they are not measured or confirmed actuals. They are intended to support comparative
          analysis and long-range planning, not to serve as final cost commitments.
        </v-card-text>
        <v-card-actions class="pb-4">
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="flat" @click="modelEstimateDialog = false">Got it</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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

        <v-card-text v-else class="pa-4 pt-5">
          <!-- County summary -->
          <v-row dense>
            <v-col cols="12" class="pb-1 pt-1 d-flex flex-column align-center">
              <div class="d-flex flex-column align-center justify-center" style="min-height: 100px;">
                <div class="text-caption text-medium-emphasis text-center">
                  Total Energy Delivered (lifetime)
                  <v-tooltip location="top" max-width="260">
                    <template #activator="{ props }">
                      <v-icon v-bind="props" size="14" color="grey">mdi-information-outline</v-icon>
                    </template>
                    Total kilowatt-hours of electricity delivered to EVs across all charging
                    locations in this county over the system lifetime, discounted to present value.
                  </v-tooltip>
                </div>
                <div class="text-h5 font-weight-bold text-center">
                  {{ Math.round(selectedMunicipality.data.totalKwh / 1000).toLocaleString() }} MWh
                </div>
              </div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="text-caption text-medium-emphasis mb-1">
                Est. 20-Year Infrastructure Cost
              </div>
              <div class="d-flex align-center">
                <span class="text-body-2 font-weight-bold">${{ formatCurrency(Math.round(selectedMunicipality.data.totalNpcUsd)) }}</span>
                <v-tooltip :text="costDisclaimer" location="top" max-width="280">
                  <template #activator="{ props }">
                    <v-icon v-bind="props" size="14" color="grey" class="ml-1">mdi-information-outline</v-icon>
                  </template>
                </v-tooltip>
              </div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="text-caption text-medium-emphasis mb-1">
                Avg. Cost per kWh Delivered
              </div>
              <div class="d-flex align-center">
                <span class="text-body-2 font-weight-bold">${{ selectedMunicipality.data.avgBreakevenPerKwh.toFixed(3) }}/kWh</span>
                <v-tooltip :text="costDisclaimer" location="top" max-width="280">
                  <template #activator="{ props }">
                    <v-icon v-bind="props" size="14" color="grey" class="ml-1">mdi-information-outline</v-icon>
                  </template>
                </v-tooltip>
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />
        <v-card-text class="pa-3 bg-grey-lighten-4">
          <div class="d-flex align-center">
            <v-icon size="14" color="warning" class="mr-1">mdi-alert-circle-outline</v-icon>
            <span class="text-caption text-medium-emphasis">
              All figures are model-based estimates for planning purposes only — not confirmed cost commitments.
            </span>
          </div>
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
import GridUpgradeHistogram from '../components/GridUpgradeHistogram.vue'
import ChargingCapacityHistogram from '../components/ChargingCapacityHistogram.vue'
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
const modelEstimateDialog = ref(true)

const costDisclaimer = 'Costs shown here should be used as rough estimates for comparing scenarios, not as actual budget figures for a project.'

function formatCurrency(value) {
  return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function showMunicipalityDialog(municipality) {
  selectedMunicipality.value = municipality
  municipalityDialog.value = true
}

function selectScenario(scenario) {
  selectedStationaryCost.value = scenario.stationaryChargingCost
  selectedDynamicCost.value = scenario.dynamicChargingCost
  selectedBatteryCost.value = scenario.batteryCost
  selectedEvAdoption.value = scenario.evAdoptionPercent
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

.scenario-inputs-card {
  min-height: auto;
}
</style>

<style>
/* Unscoped: tooltip content renders in portal */
.no-scroll-tooltip {
  overflow: visible !important;
  max-height: none !important;
}
</style>
