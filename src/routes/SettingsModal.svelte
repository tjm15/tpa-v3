<script lang="ts">
  import { onMount } from 'svelte';
  import { X, Key, Database, Zap, Info } from 'lucide-svelte';
  import { showSettings } from '../lib/stores/ui';
  import { db } from '../lib/db/settingsDexie';
  import { vectorDB } from '../lib/db/entityDb';
  import { embeddingsService } from '../lib/embeddings/embedStrings';
  
  let apiKey = '';
  let useWebGPU = true;
  let modelInfo = { name: '', dimensions: 0, maxTokens: 0 };
  let dbStats = { plans: 0, chunks: 0, vectorCount: 0 };
  let isSaving = false;
  let isClearing = false;
  
  onMount(async () => {
    // Load saved settings
    try {
      const savedApiKey = await db.settings.where('key').equals('gemini_api_key').first();
      if (savedApiKey) {
        apiKey = savedApiKey.value;
      }
      
      const savedWebGPU = await db.settings.where('key').equals('use_webgpu').first();
      if (savedWebGPU) {
        useWebGPU = savedWebGPU.value;
      }
      
      // Get model info
      if (embeddingsService.isReady()) {
        modelInfo = embeddingsService.getModelInfo();
      }
      
      // Get database stats
      await updateDbStats();
      
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  });
  
  async function updateDbStats() {
    try {
      const planCount = await db.plans.count();
      const chunkCount = await db.chunks.count();
      const vectorCount = await vectorDB.count();
      
      dbStats = { plans: planCount, chunks: chunkCount, vectorCount };
    } catch (error) {
      console.error('Failed to get database stats:', error);
    }
  }
  
  async function saveSettings() {
    isSaving = true;
    try {
      // Save API key
      await db.settings.put({
        key: 'gemini_api_key',
        value: apiKey,
        updatedAt: new Date()
      });
      
      // Save WebGPU preference
      await db.settings.put({
        key: 'use_webgpu',
        value: useWebGPU,
        updatedAt: new Date()
      });
      
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      isSaving = false;
    }
  }
  
  async function clearCache() {
    if (!confirm('This will delete all cached data including uploaded plans and embeddings. Are you sure?')) {
      return;
    }
    
    isClearing = true;
    try {
      await db.plans.clear();
      await db.chunks.clear();
      await vectorDB.clear();
      
      await updateDbStats();
      console.log('Cache cleared successfully');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    } finally {
      isClearing = false;
    }
  }
  
  function closeModal() {
    showSettings.set(false);
  }
  
  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      closeModal();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div 
  class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  role="dialog"
  aria-modal="true"
  aria-labelledby="settings-title"
  tabindex="-1"
  on:click={handleBackdropClick}
  on:keydown={handleKeydown}
>
  <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
    <!-- Header -->
    <div class="flex items-center justify-between p-6 border-b border-gray-200">
      <h2 id="settings-title" class="text-xl font-semibold text-gray-900">Settings</h2>
      <button
        class="text-gray-400 hover:text-gray-600 transition-colors"
        on:click={closeModal}
      >
        <X size={24} />
      </button>
    </div>
    
    <!-- Content -->
    <div class="p-6 space-y-6">
      <!-- API Configuration -->
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <Key size={20} class="text-gray-600" />
          <h3 class="text-lg font-medium text-gray-900">API Configuration</h3>
        </div>
        
        <div>
          <label for="gemini-api-key" class="block text-sm font-medium text-gray-700 mb-2">
            Google Gemini API Key
          </label>
          <input
            id="gemini-api-key"
            type="password"
            placeholder="Enter your Gemini API key"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            bind:value={apiKey}
          />
          <p class="text-xs text-gray-500 mt-1">
            Required for AI question answering. Get your key from 
            <a href="https://makersuite.google.com/app/apikey" target="_blank" class="text-primary-500 hover:text-primary-600">
              Google AI Studio
            </a>
          </p>
        </div>
      </div>
      
      <!-- Performance Settings -->
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <Zap size={20} class="text-gray-600" />
          <h3 class="text-lg font-medium text-gray-900">Performance</h3>
        </div>
        
        <div>
          <label class="flex items-center gap-2">
            <input
              type="checkbox"
              class="rounded"
              bind:checked={useWebGPU}
            />
            <span class="text-sm text-gray-700">Use WebGPU when available</span>
          </label>
          <p class="text-xs text-gray-500 mt-1">
            Enables GPU acceleration for embeddings. Falls back to CPU if unavailable.
          </p>
        </div>
      </div>
      
      <!-- Model Information -->
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <Info size={20} class="text-gray-600" />
          <h3 class="text-lg font-medium text-gray-900">Model Information</h3>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="font-medium text-gray-700">Embedding Model:</span>
              <div class="text-gray-600">{modelInfo.name || 'Not loaded'}</div>
            </div>
            <div>
              <span class="font-medium text-gray-700">Dimensions:</span>
              <div class="text-gray-600">{modelInfo.dimensions || 0}</div>
            </div>
            <div>
              <span class="font-medium text-gray-700">Max Tokens:</span>
              <div class="text-gray-600">{modelInfo.maxTokens || 0}</div>
            </div>
            <div>
              <span class="font-medium text-gray-700">Status:</span>
              <div class="text-gray-600">
                {embeddingsService.isReady() ? 'Ready' : 'Loading...'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Data Management -->
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <Database size={20} class="text-gray-600" />
          <h3 class="text-lg font-medium text-gray-900">Data Management</h3>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="grid grid-cols-3 gap-4 text-sm mb-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">{dbStats.plans}</div>
              <div class="text-gray-600">Plans</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">{dbStats.chunks}</div>
              <div class="text-gray-600">Chunks</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">{dbStats.vectorCount}</div>
              <div class="text-gray-600">Vectors</div>
            </div>
          </div>
          
          <button
            class="btn btn-secondary w-full flex items-center justify-center gap-2"
            on:click={clearCache}
            disabled={isClearing}
          >
            {#if isClearing}
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
            {:else}
              <Database size={16} />
            {/if}
            Clear All Data
          </button>
          
          <p class="text-xs text-gray-500 mt-2">
            This will permanently delete all uploaded plans, chunks, and embeddings.
          </p>
        </div>
      </div>
      
      <!-- About -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium text-gray-900">About</h3>
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="text-sm text-gray-600 space-y-2">
            <div>
              <span class="font-medium">Version:</span> 0.1.0
            </div>
            <div>
              <span class="font-medium">Build:</span> Local development
            </div>
            <div>
              <span class="font-medium">Storage:</span> Browser IndexedDB
            </div>
            <div>
              <span class="font-medium">AI Processing:</span> Client-side only
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
      <button
        class="btn btn-secondary"
        on:click={closeModal}
      >
        Cancel
      </button>
      <button
        class="btn btn-primary flex items-center gap-2"
        on:click={saveSettings}
        disabled={isSaving}
      >
        {#if isSaving}
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        {/if}
        Save Settings
      </button>
    </div>
  </div>
</div>
