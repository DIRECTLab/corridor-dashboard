<template>
  <v-app-bar color="primary" density="compact" elevation="2" :fixed="false" :absolute="false">
    <v-app-bar-title class="d-flex align-center">
      <v-icon class="mr-2">mdi-chart-line</v-icon>
      <span class="text-h6">Corridor Dashboard</span>
    </v-app-bar-title>
    <v-spacer></v-spacer>
    <v-btn to="/about" variant="text" class="mr-2">
      About
    </v-btn>
  </v-app-bar>
</template>

<script setup>
</script>

<style scoped>
.v-app-bar {
  min-height: 48px !important;
}
</style>
