<script lang="ts">
  import { File, Search, Plus, ArrowRight } from 'lucide-svelte';

  export let title: string;
  export let description: string;
  export let icon: 'file' | 'search' | 'plus' | 'arrow' = 'file';
  export let actionText: string = '';
  export let onAction: (() => void) | undefined = undefined;
</script>

<div class="empty-state">
  <div class="empty-state-icon">
    {#if icon === 'file'}
      <File size={48} />
    {:else if icon === 'search'}
      <Search size={48} />
    {:else if icon === 'plus'}
      <Plus size={48} />
    {:else if icon === 'arrow'}
      <ArrowRight size={48} />
    {/if}
  </div>
  
  <h3 class="empty-state-title">{title}</h3>
  <p class="empty-state-description">{description}</p>
  
  {#if actionText && onAction}
    <button class="empty-state-action" on:click={onAction}>
      {actionText}
    </button>
  {/if}
</div>

<style>
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 3rem 2rem;
    color: var(--color-text-secondary);
  }
  
  .empty-state-icon {
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  .empty-state-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--color-text-primary);
  }
  
  .empty-state-description {
    font-size: 0.875rem;
    max-width: 24rem;
    margin-bottom: 1.5rem;
    line-height: 1.5;
  }
  
  .empty-state-action {
    background: var(--color-primary);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .empty-state-action:hover {
    background: var(--color-primary-hover);
    transform: translateY(-1px);
  }
</style>
