<script lang="ts">
  import { onMount } from 'svelte';
  import { Search, BarChart3 } from 'lucide-svelte';
  import type { PlanningApplication } from '../lib/components/dm/types';
  
  // Import new components
  import ApplicationDashboard from '../lib/components/dm/ApplicationDashboard.svelte';
  import ApplicationDetails from '../lib/components/dm/ApplicationDetails.svelte';
  import AIAssistant from '../lib/components/dm/AIAssistant.svelte';
  
  // State management
  let selectedApplication: PlanningApplication | null = null;
  let activeWorkspace: 'dashboard' | 'application' | 'search' | 'analytics' = 'dashboard';
  let searchQuery = '';
  
  // Empty applications array for now
  let applications: PlanningApplication[] = [];
  
  function selectApplication(app: PlanningApplication) {
    selectedApplication = app;
    activeWorkspace = 'application';
  }
  
  async function handleAIMessage(message: string) {
    console.log('AI message:', message);
  }
  
  onMount(() => {
    console.log('DM Overview initialized');
  });
</script>

<div class="dm-overview">
  <!-- Top Navigation Bar -->
  <div class="bg-white border-b border-gray-200 px-6 py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <h1 class="text-xl font-semibold text-gray-900">Development Management</h1>
        {#if selectedApplication}
          <div class="flex items-center gap-2">
            <span class="text-lg font-medium text-gray-700">{selectedApplication.reference}</span>
          </div>
        {/if}
      </div>
      
      <div class="flex items-center gap-3">
        <button class="btn btn-secondary" on:click={() => { activeWorkspace = 'dashboard'; selectedApplication = null; }}>
          <BarChart3 size={16} />
          Dashboard
        </button>
        <button class="btn btn-secondary" on:click={() => activeWorkspace = 'search'}>
          <Search size={16} />
          Policy Search
        </button>
      </div>
    </div>
  </div>

  <!-- Main Content Area -->
  <div class="flex-1 flex overflow-hidden">
    {#if activeWorkspace === 'dashboard'}
      <ApplicationDashboard 
        {applications} 
        onSelectApplication={selectApplication} 
      />
      
    {:else if activeWorkspace === 'application' && selectedApplication}
      <ApplicationDetails application={selectedApplication} />
      <AIAssistant 
        {selectedApplication} 
        onSendMessage={handleAIMessage} 
      />
      
    {:else if activeWorkspace === 'search'}
      <!-- Policy Search View -->
      <div class="flex-1 p-6">
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Policy & Guidance Search</h2>
          <div class="space-y-4">
            <div class="relative">
              <input
                type="text"
                placeholder="Search planning policies, guidance, and precedents..."
                class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                bind:value={searchQuery}
              />
              <Search size={24} class="absolute left-4 top-3.5 text-gray-400" />
            </div>
            <button class="btn btn-primary">Search Policies</button>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .dm-overview {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #f9fafb;
  }
</style>
