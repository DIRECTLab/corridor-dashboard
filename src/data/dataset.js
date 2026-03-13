// Dataset wiring based on CSV files in this folder.
// The scenario selector, grid upgrades, energy balance, and 24h load profiles
// are all derived from CSVs so you can swap in new data without changing code.

import scenarioCsv from './scenario_selector.csv?raw'
import gridUpgradesCsv from './grid_upgrades_wasatch.csv?raw'
import energyBalanceCsv from './energy_balance_wasatch.csv?raw'
import loadProfilesCsv from './load_profiles_hourly.csv?raw'

// Column indexes for scenario_selector.csv
const COLS = {
  sc: 0,
  stationary_cost_case: 1,
  dynamic_cost_case: 2,
  batt_cost_kwh: 3,
  lp_elec_frac: 4,
  stationary_capex_per_kw: 5,
  stationary_opex_per_kw_year: 6,
  stationary_cost_readable: 7,
  dynamic_capex_per_lane_mile: 8,
  dynamic_opex_per_lane_mile_year: 9,
  dynamic_cost_readable: 10,
  electrification_percent: 11,
  system_total_npc_usd: 12,
  system_net_present_kwh: 13,
  system_usd_per_kwh: 14,
  location_npc_zone_usd: 15,
  battery_npc_zone_usd: 16,
  system_total_npc_for_mile_usd: 17,
  system_net_present_miles_zone: 18,
  system_usd_per_mile: 19,
  n_ev_vehicles: 20,
  energy_zone_kwh: 21,
  grid_upgrade_wasatch_kw: 22,
  grid_upgrade_wasatch_cost_usd: 23,
  energy_stn_kwh_wasatch: 24,
  energy_dwpt_kwh_wasatch: 25,
  energy_total_kwh_wasatch: 26,
  energy_frac_stn: 27,
  energy_frac_dwpt: 28
}

// Generate base demand pattern used when no hourly profile is available
function generateSyntheticDemandPattern(baseDemand) {
  return Array.from({ length: 24 }, (_, hour) => {
    let factor
    if (hour < 5) {
      // very early morning
      factor = 0.5
    } else if (hour < 8) {
      // morning ramp-up
      factor = 0.8 + (hour - 5) * 0.2
    } else if (hour < 18) {
      // daytime plateau with slight variation
      factor = 1.4 - (Math.abs(13 - hour) * 0.05)
    } else if (hour < 22) {
      // evening decline
      factor = 1.0 - (hour - 18) * 0.15
    } else {
      // late night
      factor = 0.6
    }
    const demand = Math.max(0, Math.round(baseDemand * factor))
    return { hour, demand }
  })
}

// Parse grid_upgrades_wasatch.csv into a lookup keyed by sc
function parseGridUpgrades() {
  const lines = gridUpgradesCsv.trim().split('\n')
  const header = lines[0].split(',')
  if (header[0] !== 'sc') return {}

  const map = {}
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue
    const cols = line.split(',')
    const scId = cols[0]
    const kw = Number(cols[1]) || 0
    const cost = Number(cols[2]) || 0
    map[scId] = { kw, cost }
  }
  return map
}

// Parse energy_balance_wasatch.csv into a lookup keyed by sc
function parseEnergyBalance() {
  const lines = energyBalanceCsv.trim().split('\n')
  const header = lines[0].split(',')
  if (header[0] !== 'sc') return {}

  const map = {}
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue
    const cols = line.split(',')
    const scId = cols[0]
    const energyStn = Number(cols[1]) || 0
    const energyDwpt = Number(cols[2]) || 0
    const energyTotal = Number(cols[3]) || energyStn + energyDwpt
    map[scId] = { energyStn, energyDwpt, energyTotal }
  }
  return map
}

// Parse load_profiles_hourly.csv into a lookup keyed by sc,
// each containing an array[24] of aggregated net_power_kw
function parseHourlyLoadProfiles() {
  const lines = loadProfilesCsv.trim().split('\n')
  const header = lines[0].split(',')
  // Expect: sc,LocId,hour_of_day,net_power_kw,net_energy_kwh
  if (header[0] !== 'sc' || header[2] !== 'hour_of_day') return {}

  /** @type {Record<string, number[]>} */
  const map = {}

  for (const line of lines.slice(1)) {
    if (!line.trim()) continue
    const cols = line.split(',')
    const scId = cols[0]
    const hour = Number(cols[2])
    const netPowerKw = Number(cols[3]) || 0
    if (Number.isNaN(hour) || hour < 0 || hour > 23) continue

    if (!map[scId]) {
      map[scId] = Array.from({ length: 24 }, () => 0)
    }
    map[scId][hour] += netPowerKw
  }

  return map
}

// Generate municipality data (placeholder but consistent with scenario scale)
function generateMunicipalityData(baseCostPerMile, gridUpgradeDollars) {
  const baseKw = gridUpgradeDollars / 500 // arbitrary scaling to kW

  return {
    'Salt Lake City': {
      gridUpgrades: { dollars: Math.round(gridUpgradeDollars * 0.32), kw: Math.round(baseKw * 0.32) },
      chargeCapacity: Math.round(baseKw * 0.6),
      costPerMile: baseCostPerMile
    },
    'West Valley City': {
      gridUpgrades: { dollars: Math.round(gridUpgradeDollars * 0.24), kw: Math.round(baseKw * 0.24) },
      chargeCapacity: Math.round(baseKw * 0.45),
      costPerMile: baseCostPerMile * 1.05
    },
    Provo: {
      gridUpgrades: { dollars: Math.round(gridUpgradeDollars * 0.18), kw: Math.round(baseKw * 0.18) },
      chargeCapacity: Math.round(baseKw * 0.35),
      costPerMile: baseCostPerMile * 0.95
    },
    Ogden: {
      gridUpgrades: { dollars: Math.round(gridUpgradeDollars * 0.16), kw: Math.round(baseKw * 0.16) },
      chargeCapacity: Math.round(baseKw * 0.3),
      costPerMile: baseCostPerMile
    },
    Sandy: {
      gridUpgrades: { dollars: Math.round(gridUpgradeDollars * 0.1), kw: Math.round(baseKw * 0.1) },
      chargeCapacity: Math.round(baseKw * 0.25),
      costPerMile: baseCostPerMile * 1.05
    }
  }
}

function parseScenariosFromCsv() {
  // Pre-parse auxiliary CSVs so we can enrich each scenario
  const gridUpgradesBySc = parseGridUpgrades()
  const energyBySc = parseEnergyBalance()
  const hourlyProfilesBySc = parseHourlyLoadProfiles()

  const lines = scenarioCsv.trim().split('\n')
  const header = lines[0].split(',')

  // Basic sanity check to ensure expected columns exist
  if (header[COLS.stationary_cost_readable] !== 'stationary_cost_readable') {
    // If the header doesn't match, just return an empty dataset to avoid runtime errors
    return {
      scenarios: [],
      stationaryChargingCostOptions: [],
      dynamicChargingCostOptions: [],
      batteryCostOptions: [],
      evAdoptionPercentOptions: []
    }
  }

  const scenarios = lines
    .slice(1)
    .filter(line => line.trim().length > 0)
    .map(line => {
      const cols = line.split(',')

      const scId = cols[COLS.sc]
      const stationaryReadable = cols[COLS.stationary_cost_readable]
      const dynamicReadable = cols[COLS.dynamic_cost_readable]
      const batteryKwh = Number(cols[COLS.batt_cost_kwh])
      const evPercent = Number(cols[COLS.electrification_percent])

      // Grid upgrade data: prefer dedicated CSV, fall back to selector CSV
      const gu = gridUpgradesBySc[scId]
      const gridKw =
        gu && typeof gu.kw === 'number'
          ? gu.kw
          : Number(cols[COLS.grid_upgrade_wasatch_kw]) || 0
      const gridCost =
        gu && typeof gu.cost === 'number'
          ? gu.cost
          : Number(cols[COLS.grid_upgrade_wasatch_cost_usd]) || 0

      const costPerMile = Number(cols[COLS.system_usd_per_mile]) || 0

      // Energy balance data: prefer dedicated CSV, fall back to selector CSV
      const eb = energyBySc[scId]
      const energyTotalCsv = Number(cols[COLS.energy_total_kwh_wasatch]) || 0
      const totalKwhWasatch =
        eb && typeof eb.energyTotal === 'number' ? eb.energyTotal : energyTotalCsv

      const energyFracDwptCsv = Number(cols[COLS.energy_frac_dwpt]) || 0
      const energyFracStnCsv = Number(cols[COLS.energy_frac_stn]) || 0

      let dynamicFrac = eb ? eb.energyDwpt / (eb.energyTotal || 1) : energyFracDwptCsv
      let staticFrac = eb ? eb.energyStn / (eb.energyTotal || 1) : energyFracStnCsv
      if (!Number.isFinite(dynamicFrac)) dynamicFrac = 0
      if (!Number.isFinite(staticFrac)) staticFrac = 1 - dynamicFrac

      // 24h demand profile: prefer dedicated hourly load CSV, fallback synthetic
      const hourlyProfile = hourlyProfilesBySc[scId]
      const baseDemand = Math.max(500, 800 + (evPercent - 20) * 80)

      return {
        id: `scenario-${scId}`,

        // Values used for dropdown matching
        stationaryChargingCost: stationaryReadable,
        dynamicChargingCost: dynamicReadable,
        batteryCost: batteryKwh,
        evAdoptionPercent: evPercent,

        // Grid upgrade metrics
        gridInfrastructureUpgrades: {
          dollars: Math.round(gridCost),
          kw: Math.round(gridKw)
        },

        // Cost per mile from CSV
        costPerMile,

        // Capacity and charging mix (approximate)
        totalChargeCapacityKw: Math.round(totalKwhWasatch || gridKw || 0),
        dynamicChargingPercent: Math.round(dynamicFrac * 100),
        staticChargingPercent: Math.round(
          staticFrac * 100 || (1 - dynamicFrac) * 100
        ),

        // 24h demand: real hourly profile if available, otherwise synthetic
        electricityDemand24h: hourlyProfile
          ? hourlyProfile.map((demand, hour) => ({
              hour,
              demand: Math.max(0, Math.round(demand))
            }))
          : generateSyntheticDemandPattern(baseDemand),

        // Municipality breakdown (synthetic but scaled)
        municipalities: generateMunicipalityData(costPerMile, gridCost || 1_000_000)
      }
    })

  // Build dropdown options from unique values in the CSV
  const stationaryChargingCostOptions = Array.from(
    new Set(scenarios.map(s => s.stationaryChargingCost))
  )
  const dynamicChargingCostOptions = Array.from(
    new Set(scenarios.map(s => s.dynamicChargingCost))
  )
  const batteryCostOptions = Array.from(new Set(scenarios.map(s => s.batteryCost))).sort(
    (a, b) => a - b
  )
  const evAdoptionPercentOptions = Array.from(
    new Set(scenarios.map(s => s.evAdoptionPercent))
  ).sort((a, b) => a - b)

  // Sort scenarios by cost per mile from smallest to largest
  scenarios.sort((a, b) => a.costPerMile - b.costPerMile)

  return {
    scenarios,
    stationaryChargingCostOptions,
    dynamicChargingCostOptions,
    batteryCostOptions,
    evAdoptionPercentOptions
  }
}

export const scenarioData = parseScenariosFromCsv()

// Helper function to find matching scenario based on dropdown selections
export function findScenario(stationaryCost, dynamicCost, batteryCost, evAdoption) {
  return (
    scenarioData.scenarios.find(
      s =>
        s.stationaryChargingCost === stationaryCost &&
        s.dynamicChargingCost === dynamicCost &&
        s.batteryCost === batteryCost &&
        s.evAdoptionPercent === evAdoption
    ) || scenarioData.scenarios[0]
  )
}
