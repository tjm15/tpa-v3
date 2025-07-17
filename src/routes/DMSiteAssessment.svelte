<script lang="ts">
  import { onMount } from 'svelte';
  import { MapPin, Building, CheckCircle, AlertTriangle } from 'lucide-svelte';
  
  onMount(() => {
    console.log('DM Site Assessment Mode initialized');
  });
</script>

<div class="dm-site-assessment">
  <div class="flex items-center justify-center h-full">
    <div class="text-center">
      <Building size={48} class="text-gray-400 mx-auto mb-4" />
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Site Assessment</h2>
      <p class="text-gray-600">Development Management - Site evaluation and constraint analysis</p>
      <p class="text-sm text-gray-500 mt-2">Coming soon...</p>
    </div>
  </div>
</div>

<style>
  .dm-site-assessment {
    height: 100%;
    background: white;
  }
</style>
