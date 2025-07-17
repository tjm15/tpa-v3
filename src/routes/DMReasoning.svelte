<script lang="ts">
  import { onMount } from 'svelte';
  import { Scale, FileText, Users, MessageSquare } from 'lucide-svelte';
  
  onMount(() => {
    console.log('DM Reasoning Mode initialized');
  });
</script>

<div class="dm-reasoning">
  <div class="flex items-center justify-center h-full">
    <div class="text-center">
      <Scale size={48} class="text-gray-400 mx-auto mb-4" />
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Reasoning</h2>
      <p class="text-gray-600">Development Management - Decision justification and officer reports</p>
      <p class="text-sm text-gray-500 mt-2">Coming soon...</p>
    </div>
  </div>
</div>

<style>
  .dm-reasoning {
    height: 100%;
    background: white;
  }
</style>
