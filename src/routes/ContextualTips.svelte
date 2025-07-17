<script lang="ts">
  import { onMount } from 'svelte';
  import { currentMode } from '../lib/stores/ui';
  import { X } from 'lucide-svelte';
  
  let showTips = false;
  let currentTip: any = null;
  
  const modeTips = {
    policy: {
      title: 'Policy Analysis Mode',
      description: 'Use semantic search to find and analyze planning policies. Upload documents to build your policy database.',
      tips: [
        'Search for housing requirements using natural language',
        'Upload PDF documents to extract policy text',
        'Use the policy tree to navigate between sections'
      ]
    },
    site: {
      title: 'Site Allocation Mode',
      description: 'Assess and manage development sites with detailed analysis tools.',
      tips: [
        'Review site capacity and constraints',
        'Analyze spatial relationships',
        'Track site delivery progress'
      ]
    },
    scenario: {
      title: 'Scenario Planning Mode',
      description: 'Compare different growth scenarios and their trade-offs.',
      tips: [
        'Switch between baseline and alternative scenarios',
        'Analyze housing delivery impacts',
        'Review infrastructure requirements'
      ]
    },
    goal: {
      title: 'Goal Tracking Mode',
      description: 'Monitor progress toward strategic planning objectives.',
      tips: [
        'Track goal completion percentages',
        'See policy and site connections',
        'Monitor delivery timelines'
      ]
    },
    document: {
      title: 'Document Management Mode',
      description: 'Organize and connect planning evidence documents.',
      tips: [
        'Search across all evidence documents',
        'See policy connections',
        'Track document approval status'
      ]
    },
    application: {
      title: 'Development Management Mode',
      description: 'Manage planning applications and assessments.',
      tips: [
        'Review policy compliance',
        'Track consultation responses',
        'Monitor application progress'
      ]
    },
    viability: {
      title: 'Viability Assessment Mode',
      description: 'Analyze development economics and viability.',
      tips: [
        'Review financial assumptions',
        'Analyze sensitivity scenarios',
        'Track affordable housing delivery'
      ]
    },
    enforcement: {
      title: 'Enforcement Management Mode',
      description: 'Track planning enforcement cases and actions.',
      tips: [
        'Monitor case progress',
        'Track site visits and evidence',
        'Manage compliance timelines'
      ]
    }
  };
  
  onMount(() => {
    // Show tips for first-time users
    const hasSeenTips = localStorage.getItem('tpa-has-seen-tips');
    if (!hasSeenTips) {
      showTips = true;
      localStorage.setItem('tpa-has-seen-tips', 'true');
    }
  });
  
  function closeTips() {
    showTips = false;
  }
  
  $: currentTip = modeTips[$currentMode] || modeTips.policy;
</script>

{#if showTips}
  <div class="fixed top-20 right-4 z-30 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 bounce-in">
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 class="font-medium text-gray-900">{currentTip.title}</h3>
      </div>
      <button
        on:click={closeTips}
        class="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
    
    <p class="text-sm text-gray-600 mb-3">{currentTip.description}</p>
    
    <div class="space-y-1">
      {#each currentTip.tips as tip}
        <div class="flex items-start gap-2 text-sm">
          <div class="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
          <span class="text-gray-700">{tip}</span>
        </div>
      {/each}
    </div>
    
    <div class="mt-4 pt-3 border-t border-gray-200">
      <button
        on:click={closeTips}
        class="text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium"
      >
        Got it, thanks!
      </button>
    </div>
  </div>
{/if}
