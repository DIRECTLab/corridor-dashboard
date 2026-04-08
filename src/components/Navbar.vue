<template>
  <v-app-bar color="primary" density="compact" elevation="2" :fixed="false" :absolute="false">
    <v-app-bar-title class="d-flex align-center">
      <router-link to="/" class="d-flex align-center text-decoration-none" style="color: inherit;">
        <span class="aspire-wordmark mr-2">ASPIRE</span>
        <span class="text-h6">Heavy Duty Freight Electrification Explorer</span>
      </router-link>
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

.aspire-wordmark {
  color: #fff;
  font-weight: 700;
  letter-spacing: 0.08em;
  font-size: 0.9rem;
}
</style>
