<script lang="ts">
  import { onMount } from 'svelte';
  import { Search, Upload, FileText, MapPin, MessageSquare, Download } from 'lucide-svelte';
  import { db } from '../lib/db/settingsDexie';
  import { modelLoader } from '../lib/embeddings/modelLoader';
  import { pdfProcessor } from '../lib/pdf/extractChunks';
  import { embeddingsService } from '../lib/embeddings/embedStrings';
  import { vectorDB } from '../lib/db/entityDb';
  import { generatePlanId, generateChunkId } from '../lib/utils/chunkId';
  import type { Plan, PlanChunk } from '../lib/db/settingsDexie';
  
  let isInitialized = false;
  let initializationError = '';
  let isProcessing = false;
  let processingProgress = { page: 0, totalPages: 0, chunksCreated: 0, status: 'idle' };
  let plans: Plan[] = [];
  let searchQuery = '';
  let searchResults: any[] = [];
  let isSearching = false;
  let selectedSite: any = null;
  let chatQuery = '';
  let chatResponse = '';
  let isGenerating = false;
  
  onMount(async () => {
    try {
      // Initialize database
      await db.open();
      
      // Load existing plans
      plans = await db.plans.toArray();
      
      // Load AI models in background
      modelLoader.loadModels((progress) => {
        console.log('Model loading progress:', progress);
      });
      
      isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize:', error);
      initializationError = error instanceof Error ? error.message : 'Unknown error';
    }
  });

  async function handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    isProcessing = true;
    processingProgress = { page: 0, totalPages: 0, chunksCreated: 0, status: 'processing' };

    try {
      // Create plan record
      const planId = generatePlanId(file.name);
      const plan: Plan = {
        id: planId,
        title: file.name.replace('.pdf', ''),
        filename: file.name,
        fileSize: file.size,
        uploadedAt: new Date(),
        status: 'processing'
      };

      await db.plans.add(plan);
      plans = await db.plans.toArray();

      // Extract chunks
      const chunks = await pdfProcessor.extractChunks(file, (progress) => {
        processingProgress = progress;
      });

      // Generate embeddings
      const texts = chunks.map(chunk => chunk.text);
      const embeddings = await embeddingsService.embedStrings(texts);

      // Store chunks with embeddings
      const chunkEntities = chunks.map((chunk, index) => ({
        id: generateChunkId(planId, chunk.pageNumber, index),
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

  async function handleChatQuery() {
    if (!chatQuery.trim()) return;
    
    isGenerating = true;
    try {
      // First search for relevant chunks
      const searchResults = await vectorDB.query({
        query: chatQuery,
        k: 5
      });
      
      // For now, just return a simple response
      chatResponse = `Based on the search results, here are the relevant policy excerpts:\n\n` +
        searchResults.map((result, index) => 
          `${index + 1}. ${result.entity.text.substring(0, 200)}...`
        ).join('\n\n');
      
    } catch (error) {
      console.error('Chat query failed:', error);
      chatResponse = 'Sorry, I encountered an error processing your query.';
    } finally {
      isGenerating = false;
    }
  }

  function handleSiteSelect(site: any) {
    selectedSite = site;
  }

  // Mock site data for demonstration
  const mockSites = [
    { id: 'SA11', name: 'Land at Mill Road', area: 2.4, status: 'Draft' },
    { id: 'SA12', name: 'Industrial Estate', area: 8.7, status: 'Allocated' },
    { id: 'SA13', name: 'Green Belt Edge', area: 15.2, status: 'Rejected' }
  ];
</script>

<!-- Three-pane layout as per specification -->
<div class="contents">
  {#if !isInitialized}
    <div class="layout-left flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Initializing...</p>
      </div>
    </div>
    <div class="layout-center flex items-center justify-center">
      <div class="text-center">
        <h2 class="text-2xl font-semibold text-gray-900 mb-2">Planning Assistant</h2>
        <p class="text-gray-600">Loading your intelligent planning workspace...</p>
      </div>
    </div>
    <div class="layout-right flex items-center justify-center">
      <div class="text-center text-gray-500">
        <p>AI assistant loading...</p>
      </div>
    </div>
  {:else}
    <!-- Left Panel: Plan search & ingestion -->
    <div class="layout-left">
      <div class="p-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Plan Search & Ingestion</h2>
        
        <!-- File Upload -->
        <div class="mb-6">
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

        <!-- Search -->
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
          <h3 class="text-sm font-medium text-gray-700 mb-2">Loaded Plans</h3>
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
      </div>

      <!-- Search Results -->
      <div class="flex-1 overflow-y-auto p-4">
        {#if searchResults.length > 0}
          <h3 class="text-sm font-medium text-gray-700 mb-3">Search Results</h3>
          <div class="space-y-3">
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
        {:else if searchQuery}
          <div class="text-center py-8">
            <FileText class="mx-auto h-12 w-12 text-gray-400" />
            <p class="mt-2 text-sm text-gray-600">No results found for "{searchQuery}"</p>
          </div>
        {/if}
      </div>
    </div>

    <!-- Center Panel: Map + drawing tools -->
    <div class="layout-center">
      <div class="p-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Map & Site Analysis</h2>
        
        <!-- Site Selection -->
        <div class="mb-4">
          <label for="site-select" class="block text-sm font-medium text-gray-700 mb-2">Select Site</label>
          <select id="site-select" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">Select a site to analyze...</option>
            {#each mockSites as site}
              <option value={site.id}>{site.id} - {site.name}</option>
            {/each}
          </select>
        </div>
      </div>

      <!-- Map Placeholder -->
      <div class="flex-1 bg-gray-100 flex items-center justify-center">
        <div class="text-center">
          <MapPin size={48} class="mx-auto mb-4 text-gray-400" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">Interactive Map</h3>
          <p class="text-gray-600 max-w-md">
            MapLibre GL JS map will be implemented here showing:
          </p>
          <ul class="text-sm text-gray-500 mt-2 space-y-1">
            <li>• Site boundaries and constraints</li>
            <li>• Green Belt and flood zones</li>
            <li>• Drawing tools for polygon selection</li>
            <li>• Spatial analysis overlays</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Right Panel: AI Q&A / constraint list / export -->
    <div class="layout-right">
      <div class="p-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">AI Q&A & Analysis</h2>
        
        <!-- Chat Interface -->
        <div class="mb-4">
          <label for="chat-query" class="block text-sm font-medium text-gray-700 mb-2">
            Ask Planning Questions
          </label>
          <div class="relative">
            <MessageSquare class="absolute left-3 top-3 text-gray-400" size={20} />
            <textarea
              id="chat-query"
              placeholder="Ask about policies, constraints, or planning requirements..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows="3"
              bind:value={chatQuery}
            ></textarea>
          </div>
          <button
            class="mt-2 btn btn-primary w-full"
            on:click={handleChatQuery}
            disabled={isGenerating || !chatQuery.trim()}
          >
            {isGenerating ? 'Generating...' : 'Ask Question'}
          </button>
        </div>

        <!-- Response -->
        {#if chatResponse}
          <div class="mb-4">
            <span class="block text-sm font-medium text-gray-700 mb-2">Response</span>
            <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p class="text-sm text-gray-800 whitespace-pre-wrap">{chatResponse}</p>
            </div>
          </div>
        {/if}

        <!-- Export Options -->
        <div class="mb-4">
          <span class="block text-sm font-medium text-gray-700 mb-2">Export Options</span>
          <div class="space-y-2">
            <button class="btn btn-secondary w-full">
              <Download size={16} />
              Export Analysis Report
            </button>
            <button class="btn btn-secondary w-full">
              <Download size={16} />
              Export Site Data
            </button>
            <button class="btn btn-secondary w-full">
              <Download size={16} />
              Export Constraints List
            </button>
          </div>
        </div>
      </div>

      <!-- Constraints List -->
      <div class="flex-1 overflow-y-auto p-4">
        <h3 class="text-sm font-medium text-gray-700 mb-3">Site Constraints</h3>
        {#if selectedSite}
          <div class="space-y-2">
            <div class="p-2 bg-red-50 border border-red-200 rounded">
              <span class="text-sm text-red-800">Flood Zone 3</span>
            </div>
            <div class="p-2 bg-yellow-50 border border-yellow-200 rounded">
              <span class="text-sm text-yellow-800">Green Belt</span>
            </div>
            <div class="p-2 bg-blue-50 border border-blue-200 rounded">
              <span class="text-sm text-blue-800">Conservation Area</span>
            </div>
          </div>
        {:else}
          <div class="text-center py-8">
            <p class="text-sm text-gray-500">Select a site to view constraints</p>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
