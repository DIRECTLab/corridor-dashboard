<template>
  <div>
    <Navbar />
    <div style="margin-top: 48px;">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" md="8">
            <v-card>
              <v-card-title class="text-h4">What Does this Mean?</v-card-title>
              <v-card-text style="overflow: visible;">
                <p class="text-body-1">
                  This dashboard visualizes the economic and infrastructure implications 
                  of different electric vehicle charging scenarios for the Wasatch Front region.
                </p>
                
                <h3 class="text-h6 mt-6 mb-3">Understanding the Metrics</h3>
                
                <div class="metrics-list">
                  <div class="metric-item mb-4">
                    <div class="text-h6 mb-2"><strong>Grid Infrastructure Upgrades</strong></div>
                    <p class="text-body-2">
                      The total investment required to upgrade the electrical grid to support 
                      the selected EV charging scenario, shown in both dollars and capacity (kW).
                    </p>
                  </div>
                  
                  <div class="metric-item mb-4">
                    <div class="text-h6 mb-2"><strong>Cost per Mile</strong></div>
                    <p class="text-body-2">
                      This represents the total lifetime cost of the EV charging infrastructure system 
                      divided by the total miles that will be driven by electric vehicles. It includes 
                      all capital investments (charging stations, grid upgrades, battery systems), 
                      operational expenses (maintenance, electricity), and infrastructure costs spread 
                      across the miles driven over the system's lifetime.
                    </p>
                    <p class="text-body-2 mt-2">
                      <strong>For municipal decision-makers:</strong> This metric helps you understand 
                      the economic efficiency of different charging infrastructure strategies. A lower 
                      cost per mile means your community gets more value from each dollar invested in 
                      EV infrastructure. When comparing scenarios, consider how this cost translates to 
                      your municipality's share of infrastructure investments and how it impacts long-term 
                      budget planning for transportation electrification.
                    </p>
                  </div>
                  
                  <div class="metric-item mb-4">
                    <div class="text-h6 mb-2"><strong>Charge Capacity</strong></div>
                    <p class="text-body-2">
                      The total electric vehicle charging capacity available on the grid, 
                      measured in kilowatts (kW).
                    </p>
                  </div>
                  
                  <div class="metric-item mb-4">
                    <div class="text-h6 mb-2"><strong>Charging Type Distribution</strong></div>
                    <p class="text-body-2">
                      The split between stationary charging (traditional charging stations) 
                      and dynamic charging (wireless charging while driving).
                    </p>
                  </div>
                  
                  <div class="metric-item mb-4">
                    <div class="text-h6 mb-2"><strong>24-Hour Electricity Demand</strong></div>
                    <p class="text-body-2">
                      The hourly electricity demand pattern over a 24-hour period, showing 
                      peak usage times and overall grid load from EV charging.
                    </p>
                  </div>
                  
                  <div class="metric-item mb-4">
                    <div class="text-h6 mb-2"><strong>Municipality Data</strong></div>
                    <p class="text-body-2">
                      Click on municipalities in the map to see location-specific infrastructure 
                      requirements and costs for each city in the Wasatch Front region.
                    </p>
                  </div>
                </div>
                
                <h3 class="text-h6 mt-6 mb-3">How to Use This Dashboard</h3>
                <p class="text-body-1">
                  Use the scenario selector at the top to explore different combinations of:
                </p>
                <ul class="text-body-1 mt-2">
                  <li><strong>Stationary Charging Cost:</strong> The cost structure for traditional charging stations</li>
                  <li><strong>Dynamic Charging Cost:</strong> The cost structure for wireless dynamic charging infrastructure</li>
                  <li><strong>Battery Cost:</strong> The cost per kWh of EV batteries</li>
                  <li><strong>EV Adoption %:</strong> The percentage of vehicles that are electric</li>
                </ul>
                <p class="text-body-1 mt-4">
                  As you change these parameters, all charts and metrics update to show the 
                  infrastructure and economic implications of your selected scenario.
                </p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script setup>
import Navbar from '../components/Navbar.vue'
</script>

<style scoped>
.metrics-list {
  width: 100%;
}

.metric-item {
  width: 100%;
}

.metric-item p {
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: break-word;
  text-overflow: unset;
  overflow: visible;
}
</style>
