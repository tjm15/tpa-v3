<script lang="ts">
  import { onMount } from 'svelte';
  import { MapPin, Building2, CheckCircle, AlertTriangle, XCircle } from 'lucide-svelte';
  
  onMount(() => {
    console.log('Site Mode initialized');
  });

  // Mock data for sites
  const sites = [
    {
      id: 'SA11',
      name: 'Land North of High Street',
      capacity: 180,
      type: 'Residential',
      status: 'Allocated',
      deliverability: 'high',
      constraints: ['Flood Zone 2', 'TPO Trees'],
      area: '8.2 hectares'
    },
    {
      id: 'SA12', 
      name: 'Former Gas Works',
      capacity: 65,
      type: 'Mixed Use',
      status: 'Preferred',
      deliverability: 'medium',
      constraints: ['Contamination', 'Heritage'],
      area: '3.4 hectares'
    },
    {
      id: 'SA13',
      name: 'Greenfield Extension',
      capacity: 220,
      type: 'Residential',
      status: 'Alternative',
      deliverability: 'low',
      constraints: ['Green Belt', 'Ecology'],
      area: '12.1 hectares'
    }
  ];

  let selectedSite = sites[0];
  let filteredSites = sites;
  let searchQuery = '';
  let selectedStatus = 'all';
  
  function selectSite(site: any) {
    selectedSite = site;
  }
  
  function getDeliverabilityColor(deliverability: string) {
    switch (deliverability) {
      case 'high': return 'green';
      case 'medium': return 'amber';
      case 'low': return 'red';
      default: return 'gray';
    }
  }

  function getDeliverabilityIcon(deliverability: string) {
    switch (deliverability) {
      case 'high': return CheckCircle;
      case 'medium': return AlertTriangle;
      case 'low': return XCircle;
      default: return AlertTriangle;
    }
  }
</script>

<!-- Three-pane layout container -->
<div class="three-pane-layout">
  <!-- Left Panel: Site List -->
  <div class="layout-left">
    <div class="p-4 border-b border-gray-200">
      <h3 class="font-medium text-gray-900 mb-3">Site Allocations</h3>
      <button class="btn btn-primary w-full mb-4">Add Site</button>
      
      <div class="space-y-3">
        <input
          type="text"
          placeholder="Search sites..."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          bind:value={searchQuery}
        />
        
        <select
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          bind:value={selectedStatus}
        >
          <option value="all">All Status</option>
          <option value="Allocated">Allocated</option>
          <option value="Preferred">Preferred</option>
          <option value="Alternative">Alternative</option>
        </select>
      </div>
    </div>
    
    <div class="flex-1 overflow-y-auto">
      <div class="p-4 space-y-2">
        {#each filteredSites as site}
          <button
            class="w-full text-left p-3 rounded-lg border transition-all {site.id === selectedSite.id ? 'bg-primary-50 border-primary-200' : 'bg-white border-gray-200 hover:bg-gray-50'}"
            on:click={() => selectSite(site)}
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium text-gray-900">{site.id}</span>
              <div class="flex items-center gap-1">
                <svelte:component this={getDeliverabilityIcon(site.deliverability)} size={14} class="text-{getDeliverabilityColor(site.deliverability)}-500" />
                <span class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                  {site.status}
                </span>
              </div>
            </div>
            <h4 class="font-medium text-gray-900 mb-1">{site.name}</h4>
            <p class="text-sm text-gray-600">{site.capacity} homes • {site.area}</p>
            <div class="flex items-center justify-between mt-2">
              <span class="text-xs text-gray-500">{site.type}</span>
              <span class="text-xs text-{getDeliverabilityColor(site.deliverability)}-600 capitalize">{site.deliverability} deliverability</span>
            </div>
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Center Panel: Map & Site Details -->
  <div class="layout-center">
    <div class="p-6">
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-xl font-semibold text-gray-900">{selectedSite.name}</h2>
            <p class="text-gray-600">Site {selectedSite.id} - {selectedSite.type}</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-800">
              {selectedSite.status}
            </span>
            <button class="btn btn-secondary">Edit Site</button>
            <button class="btn btn-primary">Assess</button>
          </div>
        </div>
      </div>

      <!-- Map Container -->
      <div class="card p-6 mb-6" style="height: 300px;">
        <div class="flex items-center justify-center h-full bg-gray-100 rounded-lg">
          <div class="text-center">
            <MapPin size={48} class="text-gray-400 mx-auto mb-2" />
            <p class="text-gray-600">Interactive map will be displayed here</p>
            <p class="text-sm text-gray-500">Showing site boundaries and constraints</p>
          </div>
        </div>
      </div>

      <!-- Site Metrics -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="card p-4 text-center">
          <p class="text-2xl font-bold text-gray-900">{selectedSite.capacity}</p>
          <p class="text-sm text-gray-600">Homes</p>
        </div>
        <div class="card p-4 text-center">
          <p class="text-2xl font-bold text-gray-900">{selectedSite.area}</p>
          <p class="text-sm text-gray-600">Area</p>
        </div>
        <div class="card p-4 text-center">
          <p class="text-2xl font-bold text-{getDeliverabilityColor(selectedSite.deliverability)}-600 capitalize">{selectedSite.deliverability}</p>
          <p class="text-sm text-gray-600">Deliverability</p>
        </div>
        <div class="card p-4 text-center">
          <p class="text-2xl font-bold text-gray-900">{selectedSite.constraints.length}</p>
          <p class="text-sm text-gray-600">Constraints</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="flex gap-4">
        <button class="btn btn-secondary">
          <Building2 size={16} />
          Viability Assessment
        </button>
        <button class="btn btn-secondary">
          <MapPin size={16} />
          View on Map
        </button>
        <button class="btn btn-secondary">
          Export Data
        </button>
      </div>
    </div>
  </div>

  <!-- Right Panel: Constraints & Assessment -->
  <div class="layout-right">
    <div class="p-4">
      <h3 class="font-medium text-gray-900 mb-4">Site Assessment</h3>
      
      <!-- Deliverability -->
      <div class="mb-6">
        <h4 class="text-sm font-medium text-gray-700 mb-3">Deliverability</h4>
        <div class="p-3 bg-{getDeliverabilityColor(selectedSite.deliverability)}-50 rounded-lg border border-{getDeliverabilityColor(selectedSite.deliverability)}-200">
          <div class="flex items-center gap-2 mb-2">
            <svelte:component this={getDeliverabilityIcon(selectedSite.deliverability)} size={16} class="text-{getDeliverabilityColor(selectedSite.deliverability)}-600" />
            <span class="font-medium text-{getDeliverabilityColor(selectedSite.deliverability)}-800 capitalize">{selectedSite.deliverability} Confidence</span>
          </div>
          <p class="text-sm text-{getDeliverabilityColor(selectedSite.deliverability)}-700">
            {#if selectedSite.deliverability === 'high'}
              Site is suitable and likely to be delivered within plan period
            {:else if selectedSite.deliverability === 'medium'}
              Some constraints present but manageable with mitigation
            {:else}
              Significant constraints may impact delivery timeline
            {/if}
          </p>
        </div>
      </div>

      <!-- Constraints -->
      <div class="border-t border-gray-200 pt-4 mb-6">
        <h4 class="text-sm font-medium text-gray-700 mb-3">Constraints</h4>
        <div class="space-y-2">
          {#each selectedSite.constraints as constraint}
            <div class="p-2 bg-red-50 rounded-lg border border-red-200">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-red-900">{constraint}</span>
                <AlertTriangle size={14} class="text-red-600" />
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Related Policies -->
      <div class="border-t border-gray-200 pt-4 mb-6">
        <h4 class="text-sm font-medium text-gray-700 mb-3">Related Policies</h4>
        <div class="space-y-2">
          <div class="p-2 bg-gray-50 rounded-lg">
            <span class="text-sm font-medium text-gray-900">Policy H1</span>
            <p class="text-xs text-gray-600">Housing mix requirements</p>
          </div>
          <div class="p-2 bg-gray-50 rounded-lg">
            <span class="text-sm font-medium text-gray-900">Policy T1</span>
            <p class="text-xs text-gray-600">Transport accessibility</p>
          </div>
        </div>
      </div>

      <!-- AI Assessment -->
      <div class="border-t border-gray-200 pt-4">
        <h4 class="text-sm font-medium text-gray-700 mb-3">AI Assessment</h4>
        <div class="p-3 bg-blue-50 rounded-lg">
          <p class="text-sm text-blue-800">
            Site shows good potential for delivery. Consider early engagement with utilities 
            and transport providers to address infrastructure capacity.
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
