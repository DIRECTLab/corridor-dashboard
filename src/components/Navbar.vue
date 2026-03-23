<template>
  <v-app-bar color="primary" density="compact" elevation="2" :fixed="false" :absolute="false">
    <v-app-bar-title class="d-flex align-center">
      <router-link to="/" class="d-flex align-center text-decoration-none" style="color: inherit;">
        <v-icon class="mr-2">mdi-chart-line</v-icon>
        <span class="text-h6">Freight Electrification Explorer</span>
      </router-link>
    </v-app-bar-title>
    <v-spacer></v-spacer>
    <v-btn to="/what-does-this-mean" variant="text" class="mr-2">
      What Does this Mean?
    </v-btn>
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
