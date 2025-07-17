<script lang="ts">
  import { onMount } from 'svelte';
  import { FileText, Users, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-svelte';
  
  onMount(() => {
    console.log('Policy Mode initialized');
  });

  // Mock data for policies
  const policies = [
    {
      id: 'H1',
      title: 'Housing Mix and Density',
      category: 'Housing',
      status: 'Draft',
      summary: 'Require developments of 10+ units to provide 25% affordable housing',
      sections: ['Objectives', 'Policy Text', 'Justification', 'Implementation']
    },
    {
      id: 'T1', 
      title: 'Transport Infrastructure',
      category: 'Transport',
      status: 'Review',
      summary: 'New developments must demonstrate sustainable transport connectivity',
      sections: ['Objectives', 'Policy Text', 'Justification', 'Implementation']
    },
    {
      id: 'E1',
      title: 'Employment Areas',
      category: 'Economy', 
      status: 'Approved',
      summary: 'Protect existing employment areas from residential conversion',
      sections: ['Objectives', 'Policy Text', 'Justification', 'Implementation']
    }
  ];

  let selectedPolicy = policies[0];
  let filteredPolicies = policies;
  let searchQuery = '';
  let selectedCategory = 'all';
  
  function selectPolicy(policy: any) {
    selectedPolicy = policy;
  }
  
  function getStatusColor(status: string) {
    switch (status) {
      case 'Approved': return 'success';
      case 'Review': return 'warning';
      case 'Draft': return 'primary';
      default: return 'gray';
    }
  }
</script>

<!-- Three-pane layout container -->
<div class="three-pane-layout">
  <!-- Left Panel: Policy Navigator -->
  <div class="layout-left">
    <div class="p-4 border-b border-gray-200">
      <h3 class="font-medium text-gray-900 mb-3">Policy Navigator</h3>
      <button class="btn btn-primary w-full mb-4">New Policy</button>
      
      <div class="space-y-3">
        <input
          type="text"
          placeholder="Search policies..."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          bind:value={searchQuery}
        />
        
        <select
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          bind:value={selectedCategory}
        >
          <option value="all">All Categories</option>
          <option value="Housing">Housing</option>
          <option value="Transport">Transport</option>
          <option value="Economy">Economy</option>
          <option value="Environment">Environment</option>
        </select>
      </div>
    </div>
    
    <div class="flex-1 overflow-y-auto">
      <div class="p-4 space-y-2">
        {#each filteredPolicies as policy}
          <button
            class="w-full text-left p-3 rounded-lg border transition-all {policy.id === selectedPolicy.id ? 'bg-primary-50 border-primary-200' : 'bg-white border-gray-200 hover:bg-gray-50'}"
            on:click={() => selectPolicy(policy)}
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium text-gray-900">{policy.id}</span>
              <span class="text-xs px-2 py-1 rounded-full bg-{getStatusColor(policy.status)}-100 text-{getStatusColor(policy.status)}-800">
                {policy.status}
              </span>
            </div>
            <h4 class="font-medium text-gray-900 mb-1">{policy.title}</h4>
            <p class="text-sm text-gray-600">{policy.summary}</p>
            <div class="flex items-center justify-between mt-2">
              <span class="text-xs text-gray-500">{policy.category}</span>
              <span class="text-xs text-gray-500">{policy.sections.length} sections</span>
            </div>
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Center Panel: Policy Editor -->
  <div class="layout-center">
    <div class="p-6">
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-xl font-semibold text-gray-900">{selectedPolicy.title}</h2>
            <p class="text-gray-600">Policy {selectedPolicy.id} - {selectedPolicy.category}</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs px-3 py-1 rounded-full bg-{getStatusColor(selectedPolicy.status)}-100 text-{getStatusColor(selectedPolicy.status)}-800">
              {selectedPolicy.status}
            </span>
            <button class="btn btn-secondary">Save Draft</button>
            <button class="btn btn-primary">Publish</button>
          </div>
        </div>
      </div>

      <!-- Policy Text Editor -->
      <div class="card p-6 mb-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Policy Text</h3>
        <div class="space-y-4">
          {#each selectedPolicy.sections as section}
            <div class="border rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-2">{section}</h4>
              <textarea
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows="4"
                placeholder="Enter {section.toLowerCase()} content..."
              ></textarea>
            </div>
          {/each}
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="flex gap-4">
        <button class="btn btn-secondary">
          <ExternalLink size={16} />
          View in Context
        </button>
        <button class="btn btn-secondary">
          <Users size={16} />
          Stakeholder Review
        </button>
        <button class="btn btn-secondary">
          <FileText size={16} />
          Export Policy
        </button>
      </div>
    </div>
  </div>

  <!-- Right Panel: Impact Assessment -->
  <div class="layout-right">
    <div class="p-4">
      <h3 class="font-medium text-gray-900 mb-4">Impact Assessment</h3>
      
      <!-- Policy Connections -->
      <div class="mb-6">
        <h4 class="text-sm font-medium text-gray-700 mb-3">Connected Policies</h4>
        <div class="space-y-2">
          <div class="p-2 bg-gray-50 rounded-lg">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-900">Policy T2</span>
              <CheckCircle size={14} class="text-green-500" />
            </div>
            <p class="text-xs text-gray-600">Supports transport objectives</p>
          </div>
          <div class="p-2 bg-gray-50 rounded-lg">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-900">Policy E2</span>
              <AlertTriangle size={14} class="text-amber-500" />
            </div>
            <p class="text-xs text-gray-600">Potential employment impact</p>
          </div>
        </div>
      </div>

      <!-- Site Impacts -->
      <div class="border-t border-gray-200 pt-4 mb-6">
        <h4 class="text-sm font-medium text-gray-700 mb-3">Site Impacts</h4>
        <div class="space-y-2">
          <div class="p-2 bg-gray-50 rounded-lg">
            <span class="text-sm font-medium text-gray-900">Site SA11</span>
            <p class="text-xs text-gray-600">180 homes affected</p>
          </div>
          <div class="p-2 bg-gray-50 rounded-lg">
            <span class="text-sm font-medium text-gray-900">Site SA12</span>
            <p class="text-xs text-gray-600">65 homes affected</p>
          </div>
        </div>
      </div>

      <!-- AI Insights -->
      <div class="border-t border-gray-200 pt-4">
        <h4 class="text-sm font-medium text-gray-700 mb-3">AI Insights</h4>
        <div class="p-3 bg-blue-50 rounded-lg">
          <p class="text-sm text-blue-800">
            This policy aligns well with housing targets but may need stronger affordable housing provisions 
            to meet local needs assessment.
          </p>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .three-pane-layout {
    height: 100%;
    display: grid;
    grid-template-areas: "left center right";
    grid-template-columns: var(--sidebar-width, 280px) 1fr var(--detail-width, 320px);
    overflow: hidden;
  }

  .card {
    background: white;
    border-radius: var(--border-radius-card);
    box-shadow: var(--shadow-card);
    border: 1px solid var(--neutral-200);
  }
</style>
