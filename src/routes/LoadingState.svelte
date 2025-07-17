<script lang="ts">
  export let type: 'list' | 'card' | 'detail' = 'list';
  export let count: number = 3;
  export let showHeader: boolean = true;
</script>

{#if type === 'list'}
  <div class="p-4 space-y-3">
    {#if showHeader}
      <div class="skeleton skeleton-title w-48"></div>
      <div class="skeleton skeleton-text w-32"></div>
      <div class="h-4"></div>
    {/if}
    
    {#each Array(count) as _}
      <div class="p-3 border border-gray-200 rounded-lg">
        <div class="flex items-center justify-between mb-2">
          <div class="skeleton skeleton-text w-32"></div>
          <div class="skeleton skeleton-text w-20"></div>
        </div>
        <div class="skeleton skeleton-text w-full mb-2"></div>
        <div class="skeleton skeleton-text w-3/4"></div>
      </div>
    {/each}
  </div>
{:else if type === 'card'}
  <div class="p-6">
    {#if showHeader}
      <div class="skeleton skeleton-title w-64 mb-6"></div>
    {/if}
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {#each Array(4) as _}
        <div class="card p-4">
          <div class="skeleton skeleton-text w-24 mb-2"></div>
          <div class="skeleton skeleton-text w-32"></div>
        </div>
      {/each}
    </div>
    
    <div class="card p-6 mb-6">
      <div class="skeleton skeleton-title w-48 mb-4"></div>
      <div class="space-y-3">
        {#each Array(3) as _}
          <div class="skeleton skeleton-text w-full"></div>
        {/each}
      </div>
    </div>
  </div>
{:else if type === 'detail'}
  <div class="p-4">
    <div class="skeleton skeleton-title w-40 mb-4"></div>
    
    <div class="space-y-4">
      {#each Array(count) as _}
        <div class="p-3 bg-gray-50 rounded-lg">
          <div class="skeleton skeleton-text w-full mb-2"></div>
          <div class="skeleton skeleton-text w-3/4"></div>
        </div>
      {/each}
    </div>
    
    <div class="mt-6 space-y-2">
      {#each Array(3) as _}
        <div class="skeleton skeleton-text w-full h-10"></div>
      {/each}
    </div>
  </div>
{/if}
