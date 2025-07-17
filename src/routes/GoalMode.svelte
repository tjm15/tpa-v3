<script lang="ts">
  import { onMount } from 'svelte';
  import { Target, TrendingUp, AlertCircle, CheckCircle, ExternalLink, AlertTriangle } from 'lucide-svelte';
  
  onMount(() => {
    console.log('Goal Mode initialized');
  });

  // Mock data for strategic goals
  const goals = [
    {
      id: 'housing-delivery',
      category: 'Housing',
      title: 'Housing Delivery',
      description: '2,400 new homes by 2030',
      target: 2400,
      current: 1850,
      unit: 'homes',
      targetDate: '2030',
      trend: 'up',
      policies: ['H1', 'H2', 'H3'],
      sites: ['SA11', 'SA12', 'SA14']
    },
    {
      id: 'affordability',
      category: 'Housing',
      title: 'Affordable Housing',
      description: '35% affordable homes borough-wide',
      target: 35,
      current: 28,
      unit: '%',
      targetDate: '2025',
      trend: 'up',
      policies: ['H1', 'H4'],
      sites: ['SA11', 'SA13']
    },
    {
      id: 'employment',
      category: 'Economy',
      title: 'Job Creation',
      description: '1,500 new jobs across all sectors',
      target: 1500,
      current: 1200,
      unit: 'jobs',
      targetDate: '2028',
      trend: 'stable',
      policies: ['E1', 'E2'],
      sites: ['EA1', 'EA2']
    }
  ];

  let selectedGoal = goals[0];
  let filteredGoals = goals;
  let selectedCategory = 'all';
  
  function selectGoal(goal: any) {
    selectedGoal = goal;
  }
  
  function getProgressPercentage(current: number, target: number) {
    return Math.min(Math.round((current / target) * 100), 100);
  }
  
  function getProgressColor(percentage: number) {
    if (percentage >= 80) return 'green';
    if (percentage >= 60) return 'amber';
    return 'red';
  }
  
  function getTrendIcon(trend: string) {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return AlertCircle;
      default: return Target;
    }
  }
</script>

<!-- Three-pane layout container -->
<div class="three-pane-layout">
  <!-- Left Panel: Goals List -->
  <div class="layout-left">
    <div class="p-4 border-b border-gray-200">
      <h3 class="font-medium text-gray-900 mb-3">Strategic Goals</h3>
      <button class="btn btn-primary w-full mb-4">Add Goal</button>
      
      <div class="space-y-3">
        <select
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          bind:value={selectedCategory}
        >
          <option value="all">All Categories</option>
          <option value="Housing">Housing</option>
          <option value="Economy">Economy</option>
          <option value="Transport">Transport</option>
          <option value="Environment">Environment</option>
        </select>
      </div>
    </div>
    
    <div class="flex-1 overflow-y-auto">
      <div class="p-4 space-y-3">
        {#each filteredGoals as goal}
          <button
            class="w-full text-left p-4 rounded-lg border transition-all {goal.id === selectedGoal.id ? 'bg-primary-50 border-primary-200' : 'bg-white border-gray-200 hover:bg-gray-50'}"
            on:click={() => selectGoal(goal)}
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">{goal.category}</span>
              <svelte:component this={getTrendIcon(goal.trend)} size={14} class="text-{goal.trend === 'up' ? 'green' : goal.trend === 'down' ? 'red' : 'gray'}-500" />
            </div>
            
            <h4 class="font-medium text-gray-900 mb-1">{goal.title}</h4>
            <p class="text-sm text-gray-600 mb-3">{goal.description}</p>
            
            <!-- Progress bar -->
            <div class="mb-2">
              <div class="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{getProgressPercentage(goal.current, goal.target)}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-{getProgressColor(getProgressPercentage(goal.current, goal.target))}-500 h-2 rounded-full transition-all"
                  style="width: {getProgressPercentage(goal.current, goal.target)}%"
                ></div>
              </div>
            </div>
            
            <div class="flex justify-between text-xs text-gray-500">
              <span>{goal.current} / {goal.target} {goal.unit}</span>
              <span>Due {goal.targetDate}</span>
            </div>
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Center Panel: Goal Details -->
  <div class="layout-center">
    <div class="p-6">
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-xl font-semibold text-gray-900">{selectedGoal.title}</h2>
            <p class="text-gray-600">{selectedGoal.description}</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-800">
              {selectedGoal.category}
            </span>
            <button class="btn btn-secondary">Edit Goal</button>
            <button class="btn btn-primary">Update Progress</button>
          </div>
        </div>
      </div>

      <!-- Progress Overview -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="card p-6 text-center">
          <div class="text-3xl font-bold text-{getProgressColor(getProgressPercentage(selectedGoal.current, selectedGoal.target))}-600 mb-2">
            {getProgressPercentage(selectedGoal.current, selectedGoal.target)}%
          </div>
          <p class="text-sm text-gray-600">Progress Complete</p>
        </div>
        
        <div class="card p-6 text-center">
          <div class="text-3xl font-bold text-gray-900 mb-2">
            {selectedGoal.current}
          </div>
          <p class="text-sm text-gray-600">Current {selectedGoal.unit}</p>
        </div>
        
        <div class="card p-6 text-center">
          <div class="text-3xl font-bold text-gray-900 mb-2">
            {selectedGoal.target - selectedGoal.current}
          </div>
          <p class="text-sm text-gray-600">Remaining {selectedGoal.unit}</p>
        </div>
      </div>

      <!-- Progress Timeline -->
      <div class="card p-6 mb-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Progress Timeline</h3>
        <div class="flex items-center justify-center h-40 bg-gray-100 rounded-lg">
          <div class="text-center">
            <Target size={48} class="text-gray-400 mx-auto mb-2" />
            <p class="text-gray-600">Progress timeline chart will be displayed here</p>
            <p class="text-sm text-gray-500">Showing historical progress and projections</p>
          </div>
        </div>
      </div>

      <!-- Performance Indicators -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="card p-4">
          <h4 class="font-medium text-gray-900 mb-3">Key Milestones</h4>
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span>Phase 1 Complete</span>
              <CheckCircle size={16} class="text-green-500" />
            </div>
            <div class="flex items-center justify-between text-sm">
              <span>Phase 2 In Progress</span>
              <div class="w-4 h-4 border-2 border-amber-500 rounded-full"></div>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span>Phase 3 Planned</span>
              <div class="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
        
        <div class="card p-4">
          <h4 class="font-medium text-gray-900 mb-3">Risk Factors</h4>
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span>Market Conditions</span>
              <span class="text-amber-600">Medium</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span>Infrastructure Capacity</span>
              <span class="text-red-600">High</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span>Policy Support</span>
              <span class="text-green-600">Low</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Right Panel: Goal Connections -->
  <div class="layout-right">
    <div class="p-4">
      <h3 class="font-medium text-gray-900 mb-4">Goal Connections</h3>
      
      <!-- Supporting Policies -->
      <div class="mb-6">
        <h4 class="text-sm font-medium text-gray-700 mb-3">Supporting Policies</h4>
        <div class="space-y-2">
          {#each selectedGoal.policies as policyId}
            <div class="p-2 bg-gray-50 rounded-lg">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-900">Policy {policyId}</span>
                <ExternalLink size={14} class="text-primary-600" />
              </div>
              <p class="text-xs text-gray-600">
                {#if policyId === 'H1'}
                  Housing mix and density requirements
                {:else if policyId === 'E1'}
                  Employment area protection
                {:else}
                  Policy description
                {/if}
              </p>
            </div>
          {/each}
        </div>
      </div>

      <!-- Related Sites -->
      <div class="border-t border-gray-200 pt-4 mb-6">
        <h4 class="text-sm font-medium text-gray-700 mb-3">Contributing Sites</h4>
        <div class="space-y-2">
          {#each selectedGoal.sites as siteId}
            <div class="p-2 bg-gray-50 rounded-lg">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-900">Site {siteId}</span>
                <ExternalLink size={14} class="text-primary-600" />
              </div>
              <p class="text-xs text-gray-600">
                {#if siteId === 'SA11'}
                  180 homes contribution
                {:else if siteId === 'EA1'}
                  500 jobs potential
                {:else}
                  Site contribution details
                {/if}
              </p>
            </div>
          {/each}
        </div>
      </div>

      <!-- Dependencies -->
      <div class="border-t border-gray-200 pt-4 mb-6">
        <h4 class="text-sm font-medium text-gray-700 mb-3">Dependencies</h4>
        <div class="space-y-2">
          <div class="p-2 bg-amber-50 rounded-lg border border-amber-200">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-amber-900">Infrastructure</span>
              <AlertTriangle size={14} class="text-amber-600" />
            </div>
            <p class="text-xs text-amber-700">Transport upgrades required</p>
          </div>
          
          <div class="p-2 bg-blue-50 rounded-lg border border-blue-200">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-blue-900">Market Conditions</span>
              <CheckCircle size={14} class="text-blue-600" />
            </div>
            <p class="text-xs text-blue-700">Favorable development market</p>
          </div>
        </div>
      </div>

      <!-- AI Insights -->
      <div class="border-t border-gray-200 pt-4">
        <h4 class="text-sm font-medium text-gray-700 mb-3">AI Insights</h4>
        <div class="p-3 bg-blue-50 rounded-lg">
          <p class="text-sm text-blue-800">
            Goal is {getProgressPercentage(selectedGoal.current, selectedGoal.target)}% complete and on track. 
            Consider accelerating site delivery in final phase to ensure target achievement.
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
