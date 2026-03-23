<template>
  <div>
    <Navbar />
    <div style="margin-top: 48px;">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" md="8">

            <v-card class="mb-6">
              <v-card-title class="text-h4 pt-4">What Does This Mean?</v-card-title>
              <v-card-text style="overflow: visible;">
                <v-alert type="warning" variant="tonal" density="comfortable" icon="mdi-alert-circle-outline" class="mb-4">
                  <strong>Important: All figures shown in this dashboard are model-based estimates.</strong>
                  They are derived from scenario assumptions and planning-level analysis, not from
                  measured or audited real-world data. Numbers should be used for comparative
                  analysis and long-range planning only — they are not final cost commitments,
                  engineering estimates, or utility rate guarantees.
                </v-alert>
                <p class="text-body-1">
                  This dashboard helps city planners and decision-makers explore the projected
                  cost and infrastructure implications of electrifying transportation on the
                  Wasatch Front. Every chart and number reflects a specific combination of
                  investment assumptions — use the scenario selector on the home page to see
                  how different choices ripple through estimated costs and grid requirements.
                </p>
              </v-card-text>
            </v-card>

            <!-- Scenario Selector -->
            <v-card class="mb-6">
              <v-card-title class="text-h5 pt-4">The Scenario Selector</v-card-title>
              <v-card-text style="overflow: visible;">
                <p class="text-body-1 mb-4">
                  The four dropdowns at the top of the dashboard let you build a "what-if" scenario
                  by adjusting four independent levers. Think of it as a policy calculator: change
                  one assumption and every metric on the page updates to reflect the new world.
                </p>

                <div class="metric-item mb-5">
                  <div class="text-h6 mb-1"><strong>Fixed Charging Station Cost</strong></div>
                  <p class="text-body-2">
                    This is the cost to build and operate traditional plug-in charging stations —
                    the kind you'd find in a parking garage or along a highway. It's expressed as a
                    capital cost per kilowatt of capacity, plus a yearly operating and maintenance fee.
                  </p>
                  <p class="text-body-2 mt-2">
                    <strong>For your city:</strong> Lower station costs (driven by technology
                    improvements or competitive procurement) directly reduce the total infrastructure
                    bill. Choosing a lower-cost option here shows you how much your city could save
                    if procurement goes well or if the market matures.
                  </p>
                </div>

                <div class="metric-item mb-5">
                  <div class="text-h6 mb-1"><strong>Road-Embedded (Wireless) Charging Cost</strong></div>
                  <p class="text-body-2">
                    Dynamic wireless power transfer (DWPT) is in-road technology that charges EVs
                    while they drive over it — similar to how wireless phone chargers work, but
                    embedded in lane miles of highway. It carries a high upfront price tag per lane
                    mile, but reduces the need for large onboard batteries and roadside charging
                    infrastructure.
                  </p>
                  <p class="text-body-2 mt-2">
                    <strong>For your city:</strong> This technology is still maturing. Higher cost
                    scenarios reflect today's early-deployment prices; lower cost scenarios represent
                    a future where manufacturing has scaled up. Understanding this range helps you
                    decide whether to wait for costs to drop or invest now in conventional
                    infrastructure.
                  </p>
                </div>

                <div class="metric-item mb-5">
                  <div class="text-h6 mb-1"><strong>EV Battery Cost ($/kWh)</strong></div>
                  <p class="text-body-2">
                    The cost to manufacture one kilowatt-hour of battery storage. Battery prices
                    have dropped dramatically over the past decade and continue to fall. This
                    assumption affects how expensive it is for residents and fleet operators to
                    purchase EVs, which in turn affects how quickly they adopt them.
                  </p>
                  <p class="text-body-2 mt-2">
                    <strong>For your city:</strong> Cheaper batteries mean lower vehicle prices,
                    faster adoption, and more demand on your charging infrastructure. Use this
                    lever alongside the EV adoption rate to model aggressive vs. conservative
                    electrification futures.
                  </p>
                </div>

                <div class="metric-item mb-2">
                  <div class="text-h6 mb-1"><strong>Fleet Electrification Rate (%)</strong></div>
                  <p class="text-body-2">
                    The percentage of all vehicles in the region that are electric under this
                    scenario. A higher rate means more EVs drawing power, more infrastructure
                    needed, and — ideally — more miles driven with lower emissions.
                  </p>
                  <p class="text-body-2 mt-2">
                    <strong>For your city:</strong> State and federal mandates, incentive programs,
                    and corporate fleet commitments all drive this number. Compare a conservative
                    20% adoption against an aggressive 80% to understand your city's infrastructure
                    exposure under different regulatory futures.
                  </p>
                </div>
              </v-card-text>
            </v-card>

            <!-- Metrics -->
            <v-card class="mb-6">
              <v-card-title class="text-h5 pt-4">Understanding Each Metric</v-card-title>
              <v-card-text style="overflow: visible;">

                <div class="metric-item mb-5">
                  <div class="text-h6 mb-1"><strong>Estimated Grid Upgrade Costs</strong></div>
                  <p class="text-body-2">
                    When more EVs plug in, your local electrical grid may need upgrades —
                    transformers, substations, and distribution lines all have capacity limits. This
                    card shows how much new infrastructure investment would be required regionwide,
                    expressed both as a total dollar amount and as additional kilowatts (kW) of
                    capacity added.
                  </p>
                  <p class="text-body-2 mt-2">
                    <strong>For your city:</strong> Your municipality typically cost-shares these
                    upgrades with Rocky Mountain Power. A higher dollar amount doesn't necessarily
                    mean the scenario is bad — it may also mean more charging capacity is being
                    built — but it directly informs budget conversations with your utility and
                    long-range capital improvement plans.
                  </p>
                </div>

                <div class="metric-item mb-5">
                  <div class="text-h6 mb-1"><strong>System Cost Efficiency (Cost per Mile)</strong></div>
                  <p class="text-body-2">
                    This is the cost of operating a Class 8 vehicle per mile using the proposed
                    infrastructure changes. It bundles together every cost — building stations,
                    upgrading the grid, buying batteries, paying for electricity, and maintaining
                    equipment — into a single "per mile" number that's easy to compare across scenarios.
                  </p>
                  <v-card variant="tonal" class="mt-2">
                    <v-card-text>
                      <ul class="text-body-2 ma-0 pl-4">
                        <li>A <strong>lower cost per mile</strong> means the region gets more
                          transportation value from each dollar invested.</li>
                        <li>The <strong>bar chart</strong> ranks all 54 scenarios from cheapest to most
                          expensive so you can see at a glance where your current selection falls.</li>
                      </ul>
                    </v-card-text>
                  </v-card>
                  <p class="text-body-2 mt-2">
                    <strong>For your city:</strong> Use this as your headline financial efficiency
                    metric when briefing council or comparing proposals. It translates complex
                    infrastructure trade-offs into a single, intuitive number that anyone can
                    understand — like comparing the miles-per-gallon of different vehicles.
                  </p>
                </div>

                <div class="metric-item mb-5">
                  <div class="text-h6 mb-1"><strong>Total Charging Capacity</strong></div>
                  <p class="text-body-2">
                    The peak simultaneous charging power available across all locations in this
                    scenario, measured in kilowatts (kW). For reference: a home Level 2 charger
                    delivers about 7–11 kW; a public DC fast charger delivers 50–350 kW; and a
                    commercial fleet depot charger can deliver 500 kW or more. This number is the
                    sum of all charging locations across the Wasatch Front combined.
                  </p>
                  <p class="text-body-2 mt-2">
                    <strong>For your city:</strong> Higher capacity means more vehicles can charge
                    simultaneously without queuing, reducing range anxiety and supporting faster
                    fleet electrification. Cross-reference this with the grid upgrade cost to
                    understand the price per kW of capacity added.
                  </p>
                </div>

                <div class="metric-item mb-5">
                  <div class="text-h6 mb-1"><strong>Charging Mix (Stationary vs. Dynamic)</strong></div>
                  <p class="text-body-2">
                    This pie chart shows how the total energy delivered to EVs is split between
                    two fundamentally different technologies:
                  </p>
                  <v-card variant="tonal" class="mt-2">
                    <v-card-text>
                      <ul class="text-body-2 ma-0 pl-4">
                        <li><strong>Stationary (plug-in):</strong> Traditional charging stations at
                          homes, workplaces, and public lots. Lower upfront cost, familiar technology,
                          but requires vehicles to stop and wait.</li>
                        <li><strong>Dynamic (road-embedded):</strong> Wireless in-road technology that
                          charges vehicles while they drive over it. Much higher upfront infrastructure
                          cost, but reduces the need for large (expensive) onboard batteries and
                          eliminates charge-stop delays for freight and transit fleets.</li>
                      </ul>
                    </v-card-text>
                  </v-card>
                  <p class="text-body-2 mt-2">
                    <strong>For your city:</strong> A heavier dynamic mix shifts costs from the
                    vehicle owner (smaller battery) to the road operator (in-road infrastructure).
                    This has implications for who pays — residents, fleet operators, UDOT, or the
                    city — and how costs appear in your capital budget vs. utility bills.
                  </p>
                </div>

                <div class="metric-item mb-5">
                  <div class="text-h6 mb-1"><strong>Projected 24-Hour EV Grid Load</strong></div>
                  <p class="text-body-2">
                    This line chart shows the modeled electricity demand from EVs across a typical
                    24-hour period for the selected scenario. Peaks represent times when the
                    regional grid must supply the most power for charging, while valleys show
                    periods of low demand when surplus renewable energy could be used cheaply.
                  </p>
                  <p class="text-body-2 mt-2">
                    <strong>For your city:</strong> Utility planners use load profiles like this to
                    size generation assets, plan demand-response programs, and set time-of-use
                    electricity rates. If your city operates a fleet, this chart helps identify
                    optimal overnight charging windows to minimize electricity costs.
                  </p>
                </div>

                <div class="metric-item mb-2">
                  <div class="text-h6 mb-1"><strong>Infrastructure by County (Map)</strong></div>
                  <p class="text-body-2">
                    The map shows the five Wasatch Front counties. Click any county to open a
                    detailed breakdown of every charging location in that county, including:
                  </p>
                  <v-card variant="tonal" class="mt-2">
                    <v-card-text>
                      <ul class="text-body-2 ma-0 pl-4">
                        <li><strong>Estimated 20-Year Infrastructure Cost:</strong> Total net-present-
                          value cost for all charging locations in the county.</li>
                        <li><strong>Total Energy Delivered:</strong> Lifetime electricity delivered
                          through those locations.</li>
                        <li><strong>Cost per kWh Delivered:</strong> How efficiently the county's
                          infrastructure converts investment dollars into delivered energy. Lower is
                          more cost-effective.</li>
                        <li>A <strong>city-level table</strong> listing every charging location with
                          its individual cost and energy numbers.</li>
                      </ul>
                    </v-card-text>
                  </v-card>
                  <p class="text-body-2 mt-2">
                    <strong>Note:</strong> The map is fixed — it shows the same county boundaries
                    regardless of which scenario is selected. The data inside the popup updates
                    when you change scenarios.
                  </p>
                </div>

              </v-card-text>
            </v-card>

            <!-- Glossary -->
            <v-card>
              <v-card-title class="text-h5 pt-4">Quick Glossary</v-card-title>
              <v-card-text style="overflow: visible;">
                <v-table density="compact">
                  <thead>
                    <tr>
                      <th class="text-left" style="width: 30%">Term</th>
                      <th class="text-left">Plain-English Definition</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>kW (kilowatt)</strong></td>
                      <td>A measure of power — how fast electricity flows. 1 kW can power roughly 10 light bulbs at once.</td>
                    </tr>
                    <tr>
                      <td><strong>kWh (kilowatt-hour)</strong></td>
                      <td>A measure of energy — how much electricity is consumed over time. Charging an average EV to full takes about 60–80 kWh.</td>
                    </tr>
                    <tr>
                      <td><strong>MWh (megawatt-hour)</strong></td>
                      <td>1,000 kWh. Used to describe large-scale energy totals across many vehicles or locations.</td>
                    </tr>
                    <tr>
                      <td><strong>Net Present Value (NPV / NPC)</strong></td>
                      <td>A method of comparing costs that occur at different times by converting future dollars into today's dollars. A dollar spent 10 years from now is worth less than a dollar spent today.</td>
                    </tr>
                    <tr>
                      <td><strong>Capex</strong></td>
                      <td>Capital expenditure — the upfront cost to build or buy infrastructure (e.g., installing a charging station).</td>
                    </tr>
                    <tr>
                      <td><strong>Opex</strong></td>
                      <td>Operating expenditure — the ongoing yearly cost to run and maintain infrastructure after it's built.</td>
                    </tr>
                    <tr>
                      <td><strong>Lane-mile</strong></td>
                      <td>One mile of a single lane of road. A two-lane road that is one mile long equals two lane-miles.</td>
                    </tr>
                    <tr>
                      <td><strong>DWPT</strong></td>
                      <td>Dynamic Wireless Power Transfer — the in-road technology that charges EVs while they drive.</td>
                    </tr>
                    <tr>
                      <td><strong>Breakeven cost per kWh</strong></td>
                      <td>The minimum electricity price at which a charging location recovers its full investment cost over its lifetime.</td>
                    </tr>
                  </tbody>
                </v-table>
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

<style scoped>
.metric-item {
  width: 100%;
}

.metric-item p,
.metric-item ul {
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: break-word;
  text-overflow: unset;
  overflow: visible;
}
</style>
