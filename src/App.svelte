<script lang="ts">
  import { onMount } from 'svelte';
  import SettingsModal from './routes/SettingsModal.svelte';
  import { Settings, HelpCircle, RefreshCw } from 'lucide-svelte';
  import { 
    showSettings, 
    currentMode, 
    currentWorkspace, 
    switchMode, 
    resetUI,
    type PlanningMode,
    type WorkspaceType
  } from './lib/stores/ui';
  
  // Mode components
  import PolicyMode from './routes/PolicyMode.svelte';
  import SiteMode from './routes/SiteMode.svelte';
  import ScenarioMode from './routes/ScenarioMode.svelte';
  import GoalMode from './routes/GoalMode.svelte';
  import DocumentMode from './routes/DocumentMode.svelte';
  
  // DM Mode components
  import DMSiteAssessment from './routes/DMSiteAssessment.svelte';
  import DMReasoning from './routes/DMReasoning.svelte';
  import DMPrecedent from './routes/DMPrecedent.svelte';
  import DMReport from './routes/DMReport.svelte';
  
  let showResetConfirm = false;
  let planTitle = 'Local Plan 2024';
  let planStatus = 'Draft';
  
  // Mode definitions
  const planMakingModes: { id: PlanningMode; label: string }[] = [
    { id: 'Policy', label: 'Policy' },
    { id: 'Site', label: 'Site' },
    { id: 'Scenario', label: 'Scenario' },
    { id: 'Goal', label: 'Goal' },
    { id: 'Document', label: 'Document' }
  ];
  
  const dmModes: { id: PlanningMode; label: string }[] = [
    { id: 'DMSiteAssessment', label: 'Site Assessment' },
    { id: 'DMReasoning', label: 'Reasoning' },
    { id: 'DMPrecedent', label: 'Precedent' },
    { id: 'DMReport', label: 'Report' }
  ];
  
  function handleReset() {
    showResetConfirm = true;
  }
  
  function confirmReset() {
    resetUI();
    showResetConfirm = false;
    // Reset local storage
    localStorage.clear();
  }
  
  function cancelReset() {
    showResetConfirm = false;
  }
  
  function handleWorkspaceChange(workspace: WorkspaceType) {
    currentWorkspace.set(workspace);
    // Switch to appropriate default mode
    if (workspace === 'PlanMaking') {
      switchMode('Policy');
    } else {
      switchMode('DMSiteAssessment');
    }
  }
  
  function handleModeChange(mode: PlanningMode) {
    switchMode(mode);
  }
  
  onMount(() => {
    console.log('Planner Assistant initialized');
  });
</script>

<main id="app">
  <!-- Top Bar -->
  <header class="layout-header">
    <div class="flex items-center justify-between px-4 py-3">
      <div class="flex items-center gap-4">
        <h1 class="text-xl font-semibold text-gray-900">{planTitle}</h1>
        <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{planStatus}</span>
      </div>
      
      <!-- Workspace Toggle -->
      <div class="flex items-center gap-4">
        <div class="flex bg-gray-100 rounded-lg p-1">
          <button 
            class="px-3 py-1 text-sm rounded-md transition-colors {$currentWorkspace === 'PlanMaking' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}"
            on:click={() => handleWorkspaceChange('PlanMaking')}
          >
            Plan Making
          </button>
          <button 
            class="px-3 py-1 text-sm rounded-md transition-colors {$currentWorkspace === 'DevelopmentManagement' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}"
            on:click={() => handleWorkspaceChange('DevelopmentManagement')}
          >
            Development Management
          </button>
        </div>
        
        <div class="flex items-center gap-2">
          <button 
            class="btn btn-secondary"
            on:click={handleReset}
            title="Reset UI"
          >
            <RefreshCw size={16} />
            Reset
          </button>
          
          <button 
            class="btn btn-secondary"
            on:click={() => showSettings.set(true)}
            title="Settings"
          >
            <Settings size={16} />
            Settings
          </button>
          
          <button 
            class="btn btn-secondary"
            title="Help"
          >
            <HelpCircle size={16} />
            Help
          </button>
        </div>
      </div>
    </div>
    
    <!-- Mode Navigation -->
    <div class="border-t border-gray-200 px-4 py-2">
      <div class="flex gap-1">
        {#each ($currentWorkspace === 'PlanMaking' ? planMakingModes : dmModes) as mode}
          <button
            class="px-3 py-1 text-sm rounded-md transition-colors {$currentMode === mode.id ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}"
            on:click={() => handleModeChange(mode.id)}
          >
            {mode.label}
          </button>
        {/each}
      </div>
    </div>
  </header>

  <!-- Main Content Area -->
  <div class="layout-content">
    {#if $currentMode === 'Policy'}
      <PolicyMode />
    {:else if $currentMode === 'Site'}
      <SiteMode />
    {:else if $currentMode === 'Scenario'}
      <ScenarioMode />
    {:else if $currentMode === 'Goal'}
      <GoalMode />
    {:else if $currentMode === 'Document'}
      <DocumentMode />
    {:else if $currentMode === 'DMSiteAssessment'}
      <DMSiteAssessment />
    {:else if $currentMode === 'DMReasoning'}
      <DMReasoning />
    {:else if $currentMode === 'DMPrecedent'}
      <DMPrecedent />
    {:else if $currentMode === 'DMReport'}
      <DMReport />
    {/if}
  </div>

  <!-- Settings Modal -->
  {#if $showSettings}
    <SettingsModal />
  {/if}

  <!-- Reset Confirmation -->
  {#if showResetConfirm}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 class="text-lg font-semibold mb-4">Reset UI</h2>
        <p class="text-gray-600 mb-6">
          This will reset all panels and return the interface to its default state. 
          Your data will not be affected.
        </p>
        <div class="flex gap-3 justify-end">
          <button 
            class="btn btn-secondary"
            on:click={cancelReset}
          >
            Cancel
          </button>
          <button 
            class="btn btn-primary"
            on:click={confirmReset}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  {/if}
</main>
