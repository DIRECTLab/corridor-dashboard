// Dataset wiring based on CSV files in this folder.
// The scenario selector, grid upgrades, energy balance, and 24h load profiles
// are all derived from CSVs so you can swap in new data without changing code.

import scenarioCsv from './scenario_selector.csv?raw'
import gridUpgradesCsv from './grid_upgrades_wasatch.csv?raw'
import energyBalanceCsv from './energy_balance_wasatch.csv?raw'
import loadProfilesCsv from './load_profiles_hourly.csv?raw'
import locationCostCsv from './location_cost_totals.csv?raw'

// Maps city slug (from LocId suffix) → Wasatch Front county name.
// Cities in Tooele or other counties are assigned 'Other'.
const CITY_TO_COUNTY = {
  // Box Elder County
  Brigham_City: 'Box Elder', Perry: 'Box Elder',
  // Weber County
  Ogden: 'Weber', South_Ogden: 'Weber', North_Ogden: 'Weber',
  Harrisville: 'Weber', Roy: 'Weber', Riverdale: 'Weber',
  West_Haven: 'Weber', Farr_West: 'Weber', Plain_City: 'Weber',
  Pleasant_View: 'Weber', Marriott_Slaterville: 'Weber', Uintah: 'Weber',
  // Davis County
  Layton: 'Davis', Kaysville: 'Davis', Farmington: 'Davis',
  Bountiful: 'Davis', West_Bountiful: 'Davis', North_Salt_Lake: 'Davis',
  Woods_Cross: 'Davis', Centerville: 'Davis', Syracuse: 'Davis',
  Clearfield: 'Davis', Sunset: 'Davis', Clinton: 'Davis',
  South_Weber: 'Davis',
  // Salt Lake County
  Salt_Lake_City: 'Salt Lake', West_Valley_City: 'Salt Lake',
  Taylorsville: 'Salt Lake', West_Jordan: 'Salt Lake', Sandy: 'Salt Lake',
  South_Jordan: 'Salt Lake', Murray: 'Salt Lake', Millcreek: 'Salt Lake',
  Holladay: 'Salt Lake', Cottonwood_Heights: 'Salt Lake',
  South_Salt_Lake: 'Salt Lake', Riverton: 'Salt Lake', Draper: 'Salt Lake',
  Midvale: 'Salt Lake', Kearns: 'Salt Lake', Magna_City: 'Salt Lake',
  Bluffdale: 'Salt Lake',
  // Utah County
  Provo: 'Utah', Orem: 'Utah', Lehi: 'Utah', Pleasant_Grove: 'Utah',
  American_Fork: 'Utah', Springville: 'Utah', Spanish_Fork: 'Utah',
  Payson: 'Utah', Santaquin: 'Utah', Eagle_Mountain: 'Utah',
  Saratoga_Springs: 'Utah', Vineyard: 'Utah', Cedar_Hills: 'Utah',
  Lindon: 'Utah', Cedar_Fort: 'Utah', Salem: 'Utah', Rocky_Ridge: 'Utah',
  // Tooele County (adjacent but not a main Wasatch Front county)
  Tooele: 'Tooele', Grantsville: 'Tooele', Erda: 'Tooele',
}

// Extract the city slug from a LocId such as "stn_100_South_Ogden" → "South_Ogden"
function citySlugFromLocId(locId) {
  // Format is: <type>_<number>_<City_Name>  or just <type>_<number>
  const parts = locId.split('_')
  if (parts.length < 3) return null
  return parts.slice(2).join('_')   // everything after the numeric segment
}

// Parse location_cost_totals.csv and return a nested map:
//   { [sc]: { [countyName]: { totalNpcUsd, totalKwh, locations: [...] } } }
function parseLocationCostTotals() {
  const lines = locationCostCsv.trim().split('\n')
  // Expected header: sc,LocId,net_present_kwh,total_npc_usd,breakeven_usd_per_kwh
  if (lines.length < 2) return {}

  const byScenario = {}

  for (const line of lines.slice(1)) {
    if (!line.trim()) continue
    const cols = line.split(',')
    const scId = cols[0]
    const locId = cols[1]
    const kwhVal = Number(cols[2]) || 0
    const npcUsd = Number(cols[3]) || 0
    const breakevenPerKwh = Number(cols[4]) || 0

    const citySlug = citySlugFromLocId(locId)
    if (!citySlug) continue                        // skip dwpt_ entries with no city

    const county = CITY_TO_COUNTY[citySlug]
    if (!county) continue                          // skip unknown locations

    if (!byScenario[scId]) byScenario[scId] = {}
    if (!byScenario[scId][county]) {
      byScenario[scId][county] = { totalNpcUsd: 0, totalKwh: 0, locations: [] }
    }

    const entry = byScenario[scId][county]
    entry.totalNpcUsd += npcUsd
    entry.totalKwh    += kwhVal
    entry.locations.push({
      name: citySlug.replace(/_/g, ' '),
      npcUsd,
      kwhVal,
      breakevenPerKwh,
    })
  }

  // Sort each county's location list by NPC descending
  for (const sc of Object.values(byScenario)) {
    for (const county of Object.values(sc)) {
      county.locations.sort((a, b) => b.npcUsd - a.npcUsd)
      // Compute weighted-average breakeven
      county.avgBreakevenPerKwh =
        county.totalKwh > 0
          ? county.locations.reduce((sum, l) => sum + l.breakevenPerKwh * l.kwhVal, 0) /
            county.totalKwh
          : 0
    }
  }

  return byScenario
}

export const locationDataByScenario = parseLocationCostTotals()

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

// stationary_cost_case in scenario CSV: 0 = highest cost tier, 1 = middle, 2 = lowest.
const STATIONARY_CASE_TIER_LABEL = { 0: 'Current', 1: 'Middle', 2: 'Optimal' }
const STATIONARY_COST_SELECT_ORDER = [2, 1, 0]

function buildStationaryChargingCostSelectItems(scenarios) {
  const byCase = new Map()
  for (const s of scenarios) {
    if (!byCase.has(s.stationaryCostCase)) {
      byCase.set(s.stationaryCostCase, s.stationaryChargingCost)
    }
  }
  return STATIONARY_COST_SELECT_ORDER.filter(c => byCase.has(c)).map(c => ({
    title: STATIONARY_CASE_TIER_LABEL[c],
    value: byCase.get(c)
  }))
}

// dynamic_cost_case: same encoding as stationary — 0 highest cost, 1 middle, 2 lowest.
const DYNAMIC_CASE_TIER_LABEL = { 0: 'Current', 1: 'Middle', 2: 'Optimal' }
const DYNAMIC_COST_SELECT_ORDER = [2, 1, 0]

function buildDynamicChargingCostSelectItems(scenarios) {
  const byCase = new Map()
  for (const s of scenarios) {
    if (!byCase.has(s.dynamicCostCase)) {
      byCase.set(s.dynamicCostCase, s.dynamicChargingCost)
    }
  }
  return DYNAMIC_COST_SELECT_ORDER.filter(c => byCase.has(c)).map(c => ({
    title: DYNAMIC_CASE_TIER_LABEL[c],
    value: byCase.get(c)
  }))
}

/** Assorted numeric levers sorted ascending by "expense" → Optimal … Middle … Current */
function tierLabelsForExpenseOrder(count) {
  if (count <= 0) return []
  if (count === 1) return ['Optimal']
  if (count === 2) return ['Optimal', 'Current']
  return ['Optimal', 'Middle', 'Current']
}

function buildBatteryCostSelectItems(scenarios) {
  const vals = [...new Set(scenarios.map(s => s.batteryCost))].sort((a, b) => a - b)
  const labels = tierLabelsForExpenseOrder(vals.length)
  return vals.map((v, i) => ({ title: labels[i], value: v }))
}

function buildEvAdoptionSelectItems(scenarios) {
  const vals = [...new Set(scenarios.map(s => s.evAdoptionPercent))].sort((a, b) => a - b)
  const labels = tierLabelsForExpenseOrder(vals.length)
  return vals.map((v, i) => ({ title: labels[i], value: v }))
}

function attachBatteryAndEvTierLabels(scenarios) {
  const batVals = [...new Set(scenarios.map(s => s.batteryCost))].sort((a, b) => a - b)
  const batLabels = tierLabelsForExpenseOrder(batVals.length)
  const batMap = Object.fromEntries(batVals.map((v, i) => [v, batLabels[i]]))
  const evVals = [...new Set(scenarios.map(s => s.evAdoptionPercent))].sort((a, b) => a - b)
  const evLabels = tierLabelsForExpenseOrder(evVals.length)
  const evMap = Object.fromEntries(evVals.map((v, i) => [v, evLabels[i]]))
  for (const s of scenarios) {
    s.batteryCostTierLabel = batMap[s.batteryCost] ?? 'Middle'
    s.evAdoptionTierLabel = evMap[s.evAdoptionPercent] ?? 'Middle'
  }
}

// ---------------------------------------------------------------------------
// Human-readable label formatters for dropdown options
// ---------------------------------------------------------------------------

// "stn $2250/kW capex + $75/kW/yr opex"  →  "$2,250/kW capital · $75/kW/yr ops"
function formatStationaryLabel(raw) {
  const m = raw.match(/\$(\d+(?:\.\d+)?)\/kW[^+]*\+\s*\$(\d+(?:\.\d+)?)\/kW\/yr/)
  if (!m) return raw
  const capex = Number(m[1]).toLocaleString('en-US')
  const opex  = Number(m[2]).toLocaleString('en-US')
  return `$${capex} + $${opex}/yr`
}

// "dwpt $3920000/lane-mi capex + $240000/lane-mi/yr opex"
//   →  "$3.92M/lane-mi capital  ·  $240K/yr ops"
function formatDynamicLabel(raw) {
  const cleaned = String(raw || '').replace(/^\s*dwpt\s+/i, '').trim()
  const m = cleaned.match(/\$(-?\d+(?:\.\d+)?)\/lane-mi[^+]*\+\s*\$(-?\d+(?:\.\d+)?)\/lane-mi\/yr/)
  if (!m) return cleaned || raw

  const capexNum = Number(m[1])
  const opexNum  = Number(m[2])

  const fmtLarge = n => {
    if (n >= 1_000_000) {
      const v = n / 1_000_000
      return `$${parseFloat(v.toFixed(2)).toLocaleString('en-US')}M`
    }
    if (n >= 1_000) {
      const v = n / 1_000
      return `$${parseFloat(v.toFixed(0)).toLocaleString('en-US')}K`
    }
    return `$${n.toLocaleString('en-US')}`
  }

  return `${fmtLarge(capexNum)} + ${fmtLarge(opexNum)}/yr`
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
      stationaryChargingCostSelectItems: [],
      dynamicChargingCostSelectItems: [],
      batteryCostSelectItems: [],
      evAdoptionPercentSelectItems: []
    }
  }

  const scenarios = lines
    .slice(1)
    .filter(line => line.trim().length > 0)
    .map(line => {
      const cols = line.split(',')

      const scId = cols[COLS.sc]
      const stationaryCostCase = Number(cols[COLS.stationary_cost_case])
      const stationaryReadable = formatStationaryLabel(cols[COLS.stationary_cost_readable])
      const dynamicCostCase = Number(cols[COLS.dynamic_cost_case])
      const dynamicReadable = formatDynamicLabel(cols[COLS.dynamic_cost_readable])
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
        stationaryCostCase: Number.isFinite(stationaryCostCase) ? stationaryCostCase : 0,
        stationaryCostTierLabel:
          STATIONARY_CASE_TIER_LABEL[stationaryCostCase] ?? 'Middle',
        stationaryCapexPerKw: Number(cols[COLS.stationary_capex_per_kw]) || 0,
        stationaryOpexPerKwYear: Number(cols[COLS.stationary_opex_per_kw_year]) || 0,
        dynamicChargingCost: dynamicReadable,
        dynamicCostCase: Number.isFinite(dynamicCostCase) ? dynamicCostCase : 0,
        dynamicCostTierLabel:
          DYNAMIC_CASE_TIER_LABEL[dynamicCostCase] ?? 'Middle',
        dynamicCapexPerLaneMile: Number(cols[COLS.dynamic_capex_per_lane_mile]) || 0,
        dynamicOpexPerLaneMileYear: Number(cols[COLS.dynamic_opex_per_lane_mile_year]) || 0,
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

  attachBatteryAndEvTierLabels(scenarios)

  const stationaryChargingCostSelectItems = buildStationaryChargingCostSelectItems(scenarios)
  const dynamicChargingCostSelectItems = buildDynamicChargingCostSelectItems(scenarios)
  const batteryCostSelectItems = buildBatteryCostSelectItems(scenarios)
  const evAdoptionPercentSelectItems = buildEvAdoptionSelectItems(scenarios)

  // Sort scenarios by cost per mile from smallest to largest
  scenarios.sort((a, b) => a.costPerMile - b.costPerMile)

  return {
    scenarios,
    stationaryChargingCostSelectItems,
    dynamicChargingCostSelectItems,
    batteryCostSelectItems,
    evAdoptionPercentSelectItems
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
