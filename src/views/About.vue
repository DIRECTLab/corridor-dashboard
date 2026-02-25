<template>
  <div>
    <Navbar />
    <div style="margin-top: 48px;">
      <v-container>
      <v-row justify="center">
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title class="text-h4">About</v-card-title>
            <v-card-text>
              <p class="text-body-1">
                This dashboard provides insights into electric vehicle infrastructure 
                and grid requirements for the Wasatch Front region.
              </p>
              <p class="text-body-1 mt-4">
                Use the scenario selector to explore different combinations of charging costs, 
                battery costs, and EV adoption rates to see their impact on grid infrastructure 
                needs and electricity demand.
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
