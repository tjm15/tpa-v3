<script lang="ts">
  import { onMount } from 'svelte';
  import { FileText, Users, AlertTriangle, CheckCircle, ExternalLink, Search, Upload } from 'lucide-svelte';
  import { db } from '../lib/db/settingsDexie';
  import { embeddingsService } from '../lib/embeddings/embedStrings';
  import { vectorDB } from '../lib/db/entityDb';
  import { pdfProcessor } from '../lib/pdf/extractChunks';
  import { generatePlanId, generateChunkId } from '../lib/utils/chunkId';
  import type { Plan } from '../lib/db/settingsDexie';
  
  // Search state
  let plans: Plan[] = [];
  let searchQuery = '';
  let searchResults: any[] = [];
  let isSearching = false;
  let isProcessing = false;
  let processingProgress = { page: 0, totalPages: 0, chunksCreated: 0, status: 'idle' as string };
  
  onMount(async () => {
    console.log('Policy Mode initialized');
    try {
      await db.open();
      plans = await db.plans.toArray();
    } catch (error) {
      console.error('Failed to initialize Policy Mode:', error);
    }
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
  
  async function handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    isProcessing = true;
    processingProgress = { page: 0, totalPages: 0, chunksCreated: 0, status: 'processing' };

    try {
      const planId = generatePlanId(file.name);
      
      // Create plan record
      await db.plans.add({
        id: planId,
        title: file.name.replace('.pdf', ''),
        filename: file.name,
        fileSize: file.size,
        status: 'processing',
        uploadedAt: new Date(),
        processedAt: undefined,
        chunkCount: 0
      });

      // Extract and process PDF
      const chunks = await pdfProcessor.extractChunks(file, (progress: any) => {
        processingProgress = progress;
      });

      // Generate embeddings
      const texts = chunks.map((chunk: any) => chunk.text);
      const embeddings = await embeddingsService.embedStrings(texts);

      // Store chunks with embeddings
      const chunkEntities = chunks.map((chunk: any, index: number) => ({
        id: generateChunkId(planId, index, chunk.pageNumber),
        text: chunk.text,
        pageNumber: chunk.pageNumber,
        planId: planId,
        vector: embeddings.embeddings[index],
        createdAt: new Date()
      }));

      await vectorDB.insertMany(chunkEntities);

      // Update plan status
      await db.plans.update(planId, { 
        status: 'completed', 
        processedAt: new Date(),
        chunkCount: chunks.length 
      });

      plans = await db.plans.toArray();
      processingProgress = { page: 0, totalPages: 0, chunksCreated: chunks.length, status: 'completed' };

    } catch (error) {
      console.error('Processing failed:', error);
      processingProgress = { page: 0, totalPages: 0, chunksCreated: 0, status: 'error' };
    } finally {
      isProcessing = false;
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    
    isSearching = true;
    try {
      const results = await vectorDB.query({
        query: searchQuery,
        k: 10
      });
      
      searchResults = results.map(result => ({
        ...result.entity,
        score: result.score
      }));
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      isSearching = false;
    }
  }
</script>

<!-- Three-pane layout container -->
<div class="three-pane-layout">
  <!-- Left Panel: Policy Navigator -->
  <div class="layout-left">
    <div class="p-4 border-b border-gray-200">
      <h3 class="font-medium text-gray-900 mb-3">Policy Navigator</h3>
      
      <!-- PDF Upload -->
      <div class="mb-4">
        <label for="file-upload" class="block text-sm font-medium text-gray-700 mb-2">
          Upload Planning Document
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".pdf"
          on:change={handleFileUpload}
          disabled={isProcessing}
          class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {#if isProcessing}
          <div class="mt-2 text-sm text-gray-600">
            Processing: {processingProgress.status}
            {#if processingProgress.totalPages > 0}
              - Page {processingProgress.page}/{processingProgress.totalPages}
            {/if}
          </div>
        {/if}
      </div>
      
      <!-- Semantic Search -->
      <div class="mb-4">
        <label for="search-input" class="block text-sm font-medium text-gray-700 mb-2">
          Search Policies
        </label>
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            id="search-input"
            type="text"
            placeholder="Search for policies, sites, or requirements..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            bind:value={searchQuery}
            on:keydown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button
          class="mt-2 btn btn-primary w-full"
          on:click={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>

      <!-- Loaded Plans -->
      <div class="mb-4">
        <h4 class="text-sm font-medium text-gray-700 mb-2">Loaded Plans</h4>
        {#if plans.length === 0}
          <p class="text-sm text-gray-500 italic">No plans loaded yet</p>
        {:else}
          <div class="space-y-2">
            {#each plans as plan}
              <div class="p-2 bg-gray-50 rounded border">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">{plan.title}</span>
                  <span class="text-xs px-2 py-1 rounded {plan.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">{plan.status}</span>
                </div>
                {#if plan.chunkCount}
                  <p class="text-xs text-gray-500 mt-1">{plan.chunkCount} chunks indexed</p>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>
      
      <button class="btn btn-primary w-full mb-4">New Policy</button>
      
      <!-- Search Results -->
      {#if searchResults.length > 0}
        <div class="mb-4">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Search Results</h4>
          <div class="space-y-3 max-h-64 overflow-y-auto">
            {#each searchResults as result}
              <div class="p-3 bg-white border border-gray-200 rounded-lg">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs text-gray-500">Page {result.pageNumber}</span>
                  <span class="text-xs text-blue-600">Score: {(result.score * 100).toFixed(1)}%</span>
                </div>
                <p class="text-sm text-gray-800 line-clamp-3">{result.text}</p>
              </div>
            {/each}
          </div>
        </div>
      {:else if searchQuery}
        <div class="mb-4 text-center py-4">
          <FileText class="mx-auto h-8 w-8 text-gray-400" />
          <p class="mt-2 text-sm text-gray-600">No results found for "{searchQuery}"</p>
        </div>
      {/if}
      
      <div class="space-y-3">
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
