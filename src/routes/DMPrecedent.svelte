<script lang="ts">
  import { onMount } from 'svelte';
  import { BookOpen, Search, FileText, Link } from 'lucide-svelte';
  
  onMount(() => {
    console.log('DM Precedent Mode initialized');
  });
</script>

<div class="dm-precedent">
  <div class="flex items-center justify-center h-full">
    <div class="text-center">
      <BookOpen size={48} class="text-gray-400 mx-auto mb-4" />
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Precedent</h2>
      <p class="text-gray-600">Development Management - Case law and precedent research</p>
      <p class="text-sm text-gray-500 mt-2">Coming soon...</p>
    </div>
  </div>
</div>

<style>
  .dm-precedent {
    height: 100%;
    background: white;
  }
</style>
