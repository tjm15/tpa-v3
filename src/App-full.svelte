<script lang="ts">
  import { onMount } from 'svelte';
  import Home from './routes/Home.svelte';
  import SettingsModal from './routes/SettingsModal.svelte';
  import { Settings, HelpCircle, RefreshCw } from 'lucide-svelte';
  import { currentMode, showSettings, uiReset } from './lib/stores/ui';
  
  let showResetConfirm = false;
  let planTitle = 'Local Plan 2024';
  let planStatus = 'Draft';
  
  function handleReset() {
    showResetConfirm = true;
  }
  
  function confirmReset() {
    uiReset.set(true);
    showResetConfirm = false;
    // Reset UI state
    currentMode.set('policy');
    // Additional reset logic would go here
  }
  
  function cancelReset() {
    showResetConfirm = false;
  }
  
  onMount(() => {
    // Initialize any global state or load saved preferences
    console.log('Planner Assistant initialized');
  });
</script>

<main class="h-full flex flex-col bg-gray-50">
  <!-- Top Bar -->
  <header class="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
    <div class="flex items-center gap-4">
      <h1 class="text-xl font-semibold text-gray-900">{planTitle}</h1>
      <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{planStatus}</span>
    </div>
    
    <div class="flex items-center gap-2">
      <button 
        class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        on:click={handleReset}
        title="Reset UI"
      >
        <RefreshCw size={16} />
        Reset
      </button>
      
      <button 
        class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        on:click={() => showSettings.set(true)}
        title="Settings"
      >
        <Settings size={16} />
        Settings
      </button>
      
      <button 
        class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        title="Help"
      >
        <HelpCircle size={16} />
        Help
      </button>
    </div>
  </header>

  <!-- Main Content -->
  <div class="flex-1 overflow-hidden">
    <Home />
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
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            on:click={cancelReset}
          >
            Cancel
          </button>
          <button 
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            on:click={confirmReset}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  {/if}
</main>
