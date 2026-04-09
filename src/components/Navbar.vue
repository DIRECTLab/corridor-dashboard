<template>
  <v-app-bar color="primary" density="compact" elevation="2" :fixed="false" :absolute="false">
    <v-app-bar-title class="d-flex align-center">
      <router-link to="/" class="d-flex align-center text-decoration-none" style="color: inherit;">
        <span class="navbar-logo-circle mr-2">
          <img :src="logoUrl" alt="ASPIRE" class="navbar-logo" />
        </span>
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
import logoUrl from '../logo/logo.svg?url'
</script>

<style scoped>
.v-app-bar {
  min-height: 48px !important;
}

.navbar-logo-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
}

.navbar-logo {
  display: block;
  height: 24px;
  width: auto;
  max-width: 32px;
  object-fit: contain;
}
</style>
