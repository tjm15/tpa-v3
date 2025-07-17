<script lang="ts">
  import { onMount } from 'svelte';
  
  export let icon: string = '📋';
  export let title: string = 'Getting Started';
  export let description: string = 'Welcome to your planning workspace';
  export let actions: Array<{label: string, primary?: boolean, onClick: () => void}> = [];
  
  let mounted = false;
  
  onMount(() => {
    mounted = true;
  });
</script>

<div class="layout-left"></div>
<div class="layout-center flex items-center justify-center">
  <div class="empty-state {mounted ? 'fade-in' : ''}">
    <div class="empty-state-icon text-6xl mb-4">{icon}</div>
    <h2 class="empty-state-title">{title}</h2>
    <p class="empty-state-description">{description}</p>
    
    {#if actions.length > 0}
      <div class="flex gap-3 mt-6">
        {#each actions as action}
          <button
            class="btn {action.primary ? 'btn-primary' : 'btn-secondary'} interactive"
            on:click={action.onClick}
          >
            {action.label}
          </button>
        {/each}
      </div>
    {/if}
    
    <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
      <div class="p-4 bg-white rounded-lg border border-gray-200 text-center">
        <div class="text-2xl mb-2">🎯</div>
        <h3 class="font-medium text-gray-900 mb-1">Smart Analysis</h3>
        <p class="text-sm text-gray-600">AI-powered policy and site analysis</p>
      </div>
      <div class="p-4 bg-white rounded-lg border border-gray-200 text-center">
        <div class="text-2xl mb-2">📊</div>
        <h3 class="font-medium text-gray-900 mb-1">Data Insights</h3>
        <p class="text-sm text-gray-600">Comprehensive planning metrics</p>
      </div>
      <div class="p-4 bg-white rounded-lg border border-gray-200 text-center">
        <div class="text-2xl mb-2">🔗</div>
        <h3 class="font-medium text-gray-900 mb-1">Connected View</h3>
        <p class="text-sm text-gray-600">See relationships across your plan</p>
      </div>
    </div>
  </div>
</div>
<div class="layout-right"></div>
