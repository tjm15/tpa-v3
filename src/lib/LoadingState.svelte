<script lang="ts">
  import { Loader } from 'lucide-svelte';

  export let text: string = 'Loading...';
  export let showSpinner: boolean = true;
  export let size: 'sm' | 'md' | 'lg' = 'md';
</script>

<div class="loading-state loading-{size}">
  {#if showSpinner}
    <div class="loading-spinner">
      <Loader size={size === 'sm' ? 16 : size === 'md' ? 24 : 32} />
    </div>
  {/if}
  
  <p class="loading-text">{text}</p>
</div>

<style>
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem;
    color: var(--color-text-secondary);
  }
  
  .loading-state.loading-sm {
    padding: 1rem;
  }
  
  .loading-state.loading-lg {
    padding: 3rem;
  }
  
  .loading-spinner {
    margin-bottom: 1rem;
    animation: spin 1s linear infinite;
  }
  
  .loading-text {
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .loading-sm .loading-text {
    font-size: 0.75rem;
  }
  
  .loading-lg .loading-text {
    font-size: 1rem;
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
