<script lang="ts">
  import { onMount } from 'svelte';
  import { BarChart, TrendingUp, AlertTriangle, CheckCircle, Target } from 'lucide-svelte';
  
  onMount(() => {
    console.log('Scenario Mode initialized');
  });

  // Mock data for scenarios
  const scenarios = [
    {
      id: 'baseline',
      name: 'Baseline Growth',
      description: 'Conservative growth following current trends',
      active: true,
      housing: { target: 2400, projected: 2200 },
      employment: { target: 1500, projected: 1400 },
      transport: { score: 85, status: 'good' },
      environment: { score: 70, status: 'acceptable' }
    },
    {
      id: 'growth',
      name: 'Accelerated Growth',
      description: 'Higher growth with Green Belt release',
      active: false,
      housing: { target: 2400, projected: 2800 },
      employment: { target: 1500, projected: 1800 },
      transport: { score: 65, status: 'challenging' },
      environment: { score: 55, status: 'concerning' }
    },
    {
      id: 'sustainable',
      name: 'Sustainable Focus',
      description: 'Brownfield-first with sustainability emphasis',
      active: false,
      housing: { target: 2400, projected: 2100 },
      employment: { target: 1500, projected: 1350 },
      transport: { score: 90, status: 'excellent' },
      environment: { score: 85, status: 'excellent' }
    }
  ];

  let selectedScenario = scenarios[0];
  
  function selectScenario(scenario: any) {
    selectedScenario = scenario;
    scenarios.forEach(s => s.active = s.id === scenario.id);
  }
  
  function getScoreColor(score: number) {
    if (score >= 80) return 'green';
    if (score >= 60) return 'amber';
    return 'red';
  }

  function getPerformanceColor(target: number, projected: number) {
    const percentage = (projected / target) * 100;
    if (percentage >= 95) return 'green';
    if (percentage >= 80) return 'amber';
    return 'red';
  }
</script>

<!-- Three-pane layout container -->
<div class="three-pane-layout">
  <!-- Left Panel: Scenario List -->
  <div class="layout-left">
    <div class="p-4 border-b border-gray-200">
      <h3 class="font-medium text-gray-900 mb-3">Plan Scenarios</h3>
      <button class="btn btn-primary w-full mb-4">New Scenario</button>
    </div>
    
    <div class="flex-1 overflow-y-auto">
      <div class="p-4 space-y-3">
        {#each scenarios as scenario}
          <button
            class="w-full text-left p-4 rounded-lg border transition-all {scenario.active ? 'bg-primary-50 border-primary-200' : 'bg-white border-gray-200 hover:bg-gray-50'}"
            on:click={() => selectScenario(scenario)}
          >
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-medium text-gray-900">{scenario.name}</h4>
              {#if scenario.active}
                <span class="text-xs px-2 py-1 rounded-full bg-primary-100 text-primary-800">Active</span>
              {/if}
            </div>
            <p class="text-sm text-gray-600 mb-3">{scenario.description}</p>
            
            <!-- Quick metrics -->
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="flex items-center justify-between">
                <span class="text-gray-500">Housing:</span>
                <span class="font-medium text-{getPerformanceColor(scenario.housing.target, scenario.housing.projected)}-600">
                  {scenario.housing.projected}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-500">Jobs:</span>
                <span class="font-medium text-{getPerformanceColor(scenario.employment.target, scenario.employment.projected)}-600">
                  {scenario.employment.projected}
                </span>
              </div>
            </div>
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Center Panel: Scenario Dashboard -->
  <div class="layout-center">
    <div class="p-6">
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-xl font-semibold text-gray-900">{selectedScenario.name}</h2>
            <p class="text-gray-600">{selectedScenario.description}</p>
          </div>
          <div class="flex items-center gap-2">
            <button class="btn btn-secondary">Compare</button>
            <button class="btn btn-primary">Set Active</button>
          </div>
        </div>
      </div>

      <!-- Performance Overview -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="card p-4 text-center">
          <p class="text-2xl font-bold text-{getPerformanceColor(selectedScenario.housing.target, selectedScenario.housing.projected)}-600">
            {selectedScenario.housing.projected}
          </p>
          <p class="text-sm text-gray-600">Housing Units</p>
          <p class="text-xs text-gray-500">Target: {selectedScenario.housing.target}</p>
        </div>
        <div class="card p-4 text-center">
          <p class="text-2xl font-bold text-{getPerformanceColor(selectedScenario.employment.target, selectedScenario.employment.projected)}-600">
            {selectedScenario.employment.projected}
          </p>
          <p class="text-sm text-gray-600">Jobs</p>
          <p class="text-xs text-gray-500">Target: {selectedScenario.employment.target}</p>
        </div>
        <div class="card p-4 text-center">
          <p class="text-2xl font-bold text-{getScoreColor(selectedScenario.transport.score)}-600">
            {selectedScenario.transport.score}
          </p>
          <p class="text-sm text-gray-600">Transport Score</p>
          <p class="text-xs text-gray-500 capitalize">{selectedScenario.transport.status}</p>
        </div>
        <div class="card p-4 text-center">
          <p class="text-2xl font-bold text-{getScoreColor(selectedScenario.environment.score)}-600">
            {selectedScenario.environment.score}
          </p>
          <p class="text-sm text-gray-600">Environment Score</p>
          <p class="text-xs text-gray-500 capitalize">{selectedScenario.environment.status}</p>
        </div>
      </div>

      <!-- Scenario Analysis Chart -->
      <div class="card p-6 mb-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Performance Analysis</h3>
        <div class="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
          <div class="text-center">
            <BarChart size={48} class="text-gray-400 mx-auto mb-2" />
            <p class="text-gray-600">Performance charts will be displayed here</p>
            <p class="text-sm text-gray-500">Showing targets vs projections across all metrics</p>
          </div>
        </div>
      </div>

      <!-- Key Indicators -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="card p-4">
          <h4 class="font-medium text-gray-900 mb-3">Housing Delivery</h4>
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span>Allocated Sites</span>
              <span class="font-medium">85%</span>
            </div>
            <div class="flex justify-between text-sm">
              <span>Windfall Sites</span>
              <span class="font-medium">15%</span>
            </div>
            <div class="flex justify-between text-sm">
              <span>Affordable Housing</span>
              <span class="font-medium">32%</span>
            </div>
          </div>
        </div>
        
        <div class="card p-4">
          <h4 class="font-medium text-gray-900 mb-3">Infrastructure</h4>
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span>School Capacity</span>
              <span class="font-medium text-{getScoreColor(75)}-600">75%</span>
            </div>
            <div class="flex justify-between text-sm">
              <span>Healthcare Access</span>
              <span class="font-medium text-{getScoreColor(90)}-600">90%</span>
            </div>
            <div class="flex justify-between text-sm">
              <span>Transport Links</span>
              <span class="font-medium text-{getScoreColor(selectedScenario.transport.score)}-600">{selectedScenario.transport.score}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Right Panel: Scenario Impact -->
  <div class="layout-right">
    <div class="p-4">
      <h3 class="font-medium text-gray-900 mb-4">Scenario Impact</h3>
      
      <!-- Goal Performance -->
      <div class="mb-6">
        <h4 class="text-sm font-medium text-gray-700 mb-3">Strategic Goals</h4>
        <div class="space-y-3">
          <div class="p-2 bg-gray-50 rounded-lg">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium text-gray-900">Housing Targets</span>
              <CheckCircle size={14} class="text-{getPerformanceColor(selectedScenario.housing.target, selectedScenario.housing.projected)}-500" />
            </div>
            <div class="text-xs text-gray-600">
              {Math.round((selectedScenario.housing.projected / selectedScenario.housing.target) * 100)}% of target achieved
            </div>
          </div>
          
          <div class="p-2 bg-gray-50 rounded-lg">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium text-gray-900">Employment Growth</span>
              <CheckCircle size={14} class="text-{getPerformanceColor(selectedScenario.employment.target, selectedScenario.employment.projected)}-500" />
            </div>
            <div class="text-xs text-gray-600">
              {Math.round((selectedScenario.employment.projected / selectedScenario.employment.target) * 100)}% of target achieved
            </div>
          </div>
          
          <div class="p-2 bg-gray-50 rounded-lg">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium text-gray-900">Sustainability</span>
              <CheckCircle size={14} class="text-{getScoreColor(selectedScenario.environment.score)}-500" />
            </div>
            <div class="text-xs text-gray-600">
              Environment score: {selectedScenario.environment.score}/100
            </div>
          </div>
        </div>
      </div>

      <!-- Risk Assessment -->
      <div class="border-t border-gray-200 pt-4 mb-6">
        <h4 class="text-sm font-medium text-gray-700 mb-3">Risk Assessment</h4>
        <div class="space-y-2">
          <div class="p-2 bg-amber-50 rounded-lg border border-amber-200">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-amber-900">Infrastructure Capacity</span>
              <AlertTriangle size={14} class="text-amber-600" />
            </div>
            <p class="text-xs text-amber-700">Transport network may need upgrade</p>
          </div>
          
          {#if selectedScenario.id === 'growth'}
            <div class="p-2 bg-red-50 rounded-lg border border-red-200">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-red-900">Environmental Impact</span>
                <AlertTriangle size={14} class="text-red-600" />
              </div>
              <p class="text-xs text-red-700">Green Belt release impacts</p>
            </div>
          {/if}
        </div>
      </div>

      <!-- Comparison -->
      <div class="border-t border-gray-200 pt-4 mb-6">
        <h4 class="text-sm font-medium text-gray-700 mb-3">vs Other Scenarios</h4>
        <div class="text-xs text-gray-600">
          <p>Best for housing delivery: Accelerated Growth</p>
          <p>Best for sustainability: Sustainable Focus</p>
          <p>Most balanced: Baseline Growth</p>
        </div>
      </div>

      <!-- AI Commentary -->
      <div class="border-t border-gray-200 pt-4">
        <h4 class="text-sm font-medium text-gray-700 mb-3">AI Analysis</h4>
        <div class="p-3 bg-blue-50 rounded-lg">
          <p class="text-sm text-blue-800">
            {#if selectedScenario.id === 'baseline'}
              Balanced approach with manageable risks. Consider infrastructure investment to unlock additional capacity.
            {:else if selectedScenario.id === 'growth'}
              High delivery potential but requires significant infrastructure investment and environmental mitigation.
            {:else}
              Strong sustainability credentials but may fall short of housing targets. Consider selective site additions.
            {/if}
          </p>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .three-pane-layout {
    height: 100%;
    display: grid;
    grid-template-areas: "left center right";
    grid-template-columns: var(--sidebar-width, 280px) 1fr var(--detail-width, 320px);
    overflow: hidden;
  }

  .card {
    background: white;
    border-radius: var(--border-radius-card);
    box-shadow: var(--shadow-card);
    border: 1px solid var(--neutral-200);
  }
</style>
