# Freight Electrification Explorer

A Vue.js dashboard for visualizing electric vehicle infrastructure and grid requirements for the Wasatch Front region.

## Features

- Material Design UI using Vuetify
- Scenario selector with 4 dropdown options (Stationary Charging Cost, Dynamic Charging Cost, Battery Cost, EV Adoption %)
- Grid infrastructure upgrades visualization
- Cost per mile comparison histogram
- Charge capacity metrics and pie chart
- 24-hour electricity demand line graph
- Interactive Wasatch Front map with municipality details

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Project Structure

- `src/views/` - Main page views (Dashboard, About)
- `src/components/` - Reusable components (Navbar, Charts, Map)
- `src/data/dataset.js` - Hard-coded dataset (replace with actual data later)

## Data Structure

The dataset is stored in `src/data/dataset.js` and contains:
- Multiple scenarios based on different parameter combinations
- Grid infrastructure upgrade data
- Electricity demand data (24-hour)
- Municipality-specific data for the Wasatch Front region

Replace the placeholder data in `dataset.js` with your actual data when ready.
