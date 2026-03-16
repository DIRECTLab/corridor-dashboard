<template>
  <div>
    <Navbar />
    <div style="margin-top: 48px;">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" md="10">
            <v-card>
              <v-card-title class="text-h4">About</v-card-title>
              <v-card-text>
                <p class="text-body-1">
                  The Corridor Dashboard is an interactive tool designed to help decision-makers 
                  understand the economic and infrastructure implications of electric vehicle (EV) 
                  charging scenarios for the Wasatch Front region of Utah.
                </p>
                
                <h3 class="text-h6 mt-6 mb-3">Purpose</h3>
                <p class="text-body-1">
                  As communities across the Wasatch Front plan for the transition to electric vehicles, 
                  they face critical decisions about charging infrastructure investments. This dashboard 
                  enables municipal leaders, planners, and stakeholders to:
                </p>
                <ul class="text-body-1 mt-2">
                  <li>Compare the costs and infrastructure requirements of different EV charging strategies</li>
                  <li>Understand the relationship between charging costs, battery prices, and adoption rates</li>
                  <li>Evaluate grid upgrade needs and electricity demand patterns</li>
                  <li>Make data-driven decisions about EV infrastructure investments</li>
                </ul>
                
                <h3 class="text-h6 mt-6 mb-3">Data Sources</h3>
                <p class="text-body-1">
                  The dashboard is powered by comprehensive scenario analysis data that includes:
                </p>
                <ul class="text-body-1 mt-2">
                  <li><strong>Scenario Configurations:</strong> Multiple combinations of charging costs, battery prices, and EV adoption rates</li>
                  <li><strong>Grid Infrastructure Data:</strong> Detailed information about required grid upgrades in kilowatts and dollars</li>
                  <li><strong>Energy Balance:</strong> Stationary and dynamic charging energy requirements across the region</li>
                  <li><strong>Hourly Load Profiles:</strong> 24-hour electricity demand patterns for different scenarios</li>
                  <li><strong>Location-Specific Data:</strong> Infrastructure costs and requirements for individual municipalities</li>
                </ul>
                
                <h3 class="text-h6 mt-6 mb-3">Key Features</h3>
                <p class="text-body-1">
                  The dashboard provides several visualization tools to help you understand the data:
                </p>
                <ul class="text-body-1 mt-2">
                  <li><strong>Scenario Comparison:</strong> Compare cost per mile across all 54 scenarios to see how your selected scenario performs</li>
                  <li><strong>Infrastructure Metrics:</strong> View total grid upgrade requirements in both dollar amounts and capacity (kW)</li>
                  <li><strong>Charging Distribution:</strong> Understand the split between stationary and dynamic charging infrastructure</li>
                  <li><strong>Demand Forecasting:</strong> See how electricity demand varies throughout the day</li>
                  <li><strong>Municipality Analysis:</strong> Click on cities in the map to see location-specific infrastructure needs</li>
                </ul>
                
                <h3 class="text-h6 mt-6 mb-3">How to Use</h3>
                <p class="text-body-1">
                  Start by selecting your scenario parameters using the four dropdown menus at the top of the dashboard:
                </p>
                <ul class="text-body-1 mt-2">
                  <li>Choose your stationary charging cost structure</li>
                  <li>Select your dynamic charging cost structure</li>
                  <li>Set the battery cost per kWh</li>
                  <li>Specify the expected EV adoption percentage</li>
                </ul>
                <p class="text-body-1 mt-4">
                  As you change these parameters, all visualizations and metrics update automatically 
                  to show the implications of your selected scenario. Use the "What Does this Mean?" 
                  page for detailed explanations of each metric and how to interpret the results.
                </p>
                
                <h3 class="text-h6 mt-6 mb-3">For Decision-Makers</h3>
                <p class="text-body-1">
                  This tool is designed to support strategic planning and budget decisions for EV 
                  infrastructure. The cost per mile metric helps you understand the economic efficiency 
                  of different approaches, while the infrastructure upgrade requirements help you plan 
                  for necessary grid investments. Use the municipality-specific data to understand 
                  how different cities in the Wasatch Front will be affected by various scenarios.
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
