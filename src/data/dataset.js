// Hard-coded dataset for the dashboard
// This will be replaced with actual data later

// Generate 54 scenarios with varying cost per mile
function generateScenarios() {
  const scenarios = []
  const stationaryOptions = [0.08, 0.10, 0.12, 0.15]
  const dynamicOptions = [0.12, 0.15, 0.18, 0.20]
  const batteryOptions = [4000, 5000, 6000, 7000]
  const evAdoptionOptions = [20, 25, 30, 35]
  
  // Generate base demand pattern
  function generateDemandPattern(baseDemand) {
    return Array.from({ length: 24 }, (_, hour) => {
      const hourMultiplier = hour < 6 ? 0.8 : hour < 12 ? 1.2 + (hour - 6) * 0.3 : hour < 18 ? 1.5 - (hour - 12) * 0.1 : 1.0 - (hour - 18) * 0.15
      return { hour, demand: Math.round(baseDemand * hourMultiplier) }
    })
  }
  
  // Generate municipality data
  function generateMunicipalityData(baseCost, baseUpgrade) {
    return {
      'Salt Lake City': {
        gridUpgrades: { dollars: baseUpgrade * 1.6, kw: baseUpgrade * 0.32 },
        chargeCapacity: Math.round(baseUpgrade * 0.64),
        costPerMile: baseCost
      },
      'West Valley City': {
        gridUpgrades: { dollars: baseUpgrade * 1.2, kw: baseUpgrade * 0.24 },
        chargeCapacity: Math.round(baseUpgrade * 0.48),
        costPerMile: baseCost * 1.1
      },
      'Provo': {
        gridUpgrades: { dollars: baseUpgrade * 0.8, kw: baseUpgrade * 0.16 },
        chargeCapacity: Math.round(baseUpgrade * 0.32),
        costPerMile: baseCost * 0.95
      },
      'Ogden': {
        gridUpgrades: { dollars: baseUpgrade * 0.7, kw: baseUpgrade * 0.14 },
        chargeCapacity: Math.round(baseUpgrade * 0.28),
        costPerMile: baseCost
      },
      'Sandy': {
        gridUpgrades: { dollars: baseUpgrade * 0.7, kw: baseUpgrade * 0.14 },
        chargeCapacity: Math.round(baseUpgrade * 0.21),
        costPerMile: baseCost * 1.1
      }
    }
  }
  
  let scenarioId = 1
  for (let i = 0; i < stationaryOptions.length; i++) {
    for (let j = 0; j < dynamicOptions.length; j++) {
      for (let k = 0; k < batteryOptions.length; k++) {
        for (let l = 0; l < evAdoptionOptions.length; l++) {
          if (scenarioId > 54) break
          
          const stationary = stationaryOptions[i]
          const dynamic = dynamicOptions[j]
          const battery = batteryOptions[k]
          const evAdoption = evAdoptionOptions[l]
          
          // Calculate cost per mile based on parameters
          const baseCost = (stationary * 0.4 + dynamic * 0.3 + (battery / 100000) * 0.2 + (evAdoption / 100) * 0.1)
          const costPerMile = Math.round(baseCost * 100) / 100
          
          // Calculate other metrics
          const gridUpgradeBase = 1000000 + (evAdoption - 20) * 200000 + (battery - 4000) * 100
          const totalCapacity = 10000 + (evAdoption - 20) * 1000
          const dynamicPercent = 50 + (dynamic - 0.12) * 25
          const staticPercent = 100 - dynamicPercent
          
          scenarios.push({
            id: `scenario-${scenarioId}`,
            stationaryChargingCost: stationary,
            dynamicChargingCost: dynamic,
            batteryCost: battery,
            evAdoptionPercent: evAdoption,
            gridInfrastructureUpgrades: {
              dollars: Math.round(gridUpgradeBase),
              kw: Math.round(gridUpgradeBase / 500)
            },
            costPerMile: costPerMile,
            totalChargeCapacityKw: totalCapacity,
            dynamicChargingPercent: Math.round(dynamicPercent),
            staticChargingPercent: Math.round(staticPercent),
            electricityDemand24h: generateDemandPattern(1000 + (evAdoption - 20) * 100),
            municipalities: generateMunicipalityData(costPerMile, gridUpgradeBase)
          })
          
          scenarioId++
        }
        if (scenarioId > 54) break
      }
      if (scenarioId > 54) break
    }
    if (scenarioId > 54) break
  }
  
  // Sort by cost per mile from smallest to largest
  return scenarios.sort((a, b) => a.costPerMile - b.costPerMile)
}

export const scenarioData = {
  // Matrix of scenarios based on the 4 dropdown selections
  scenarios: generateScenarios(),
  
  // Available options for dropdowns
  stationaryChargingCostOptions: [0.08, 0.10, 0.12, 0.15],
  dynamicChargingCostOptions: [0.12, 0.15, 0.18, 0.20],
  batteryCostOptions: [4000, 5000, 6000, 7000],
  evAdoptionPercentOptions: [20, 25, 30, 35]
}

// Helper function to find matching scenario
export function findScenario(stationaryCost, dynamicCost, batteryCost, evAdoption) {
  return scenarioData.scenarios.find(s => 
    s.stationaryChargingCost === stationaryCost &&
    s.dynamicChargingCost === dynamicCost &&
    s.batteryCost === batteryCost &&
    s.evAdoptionPercent === evAdoption
  ) || scenarioData.scenarios[0] // Default to first scenario if not found
}
