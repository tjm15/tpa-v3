<script lang="ts">
  import { onMount } from 'svelte';
  import { FileText, Download, Upload, Eye, Edit, ExternalLink } from 'lucide-svelte';
  
  onMount(() => {
    console.log('Document Mode initialized');
  });

  // Mock data for documents
  const documents = [
    {
      id: 'local-plan',
      title: 'Local Plan 2024-2030',
      type: 'Plan Document',
      category: 'Core',
      status: 'Draft',
      lastModified: '2024-01-15',
      sections: ['Vision & Objectives', 'Housing Policies', 'Economic Policies', 'Infrastructure'],
      wordCount: 45000,
      version: '2.1'
    },
    {
      id: 'housing-needs',
      title: 'Housing Needs Assessment',
      type: 'Evidence Base',
      category: 'Housing',
      status: 'Final',
      lastModified: '2024-01-10',
      sections: ['Methodology', 'Demographics', 'Market Analysis', 'Conclusions'],
      wordCount: 12000,
      version: '1.0'
    },
    {
      id: 'sa-report',
      title: 'Sustainability Appraisal',
      type: 'Assessment',
      category: 'Environment',
      status: 'Review',
      lastModified: '2024-01-08',
      sections: ['Baseline', 'Options Assessment', 'Mitigation', 'Monitoring'],
      wordCount: 28000,
      version: '1.2'
    }
  ];

  let selectedDocument = documents[0];
  let filteredDocuments = documents;
  let searchQuery = '';
  let selectedCategory = 'all';
  
  function selectDocument(doc: any) {
    selectedDocument = doc;
  }
  
  function getStatusColor(status: string) {
    switch (status) {
      case 'Final': return 'green';
      case 'Review': return 'amber';
      case 'Draft': return 'blue';
      default: return 'gray';
    }
  }
  
  function getTypeIcon(type: string) {
    switch (type) {
      case 'Plan Document': return '📋';
      case 'Evidence Base': return '📊';
      case 'Assessment': return '🔍';
      default: return '📄';
    }
  }
</script>

<!-- Three-pane layout container -->
<div class="three-pane-layout">
  <!-- Left Panel: Document Library -->
  <div class="layout-left">
    <div class="p-4 border-b border-gray-200">
      <h3 class="font-medium text-gray-900 mb-3">Document Library</h3>
      <button class="btn btn-primary w-full mb-4">
        <Upload size={16} />
        Upload Document
      </button>
      
      <div class="space-y-3">
        <input
          type="text"
          placeholder="Search documents..."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          bind:value={searchQuery}
        />
        
        <select
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          bind:value={selectedCategory}
        >
          <option value="all">All Categories</option>
          <option value="Core">Core Documents</option>
          <option value="Housing">Housing</option>
          <option value="Environment">Environment</option>
          <option value="Economy">Economy</option>
        </select>
      </div>
    </div>
    
    <div class="flex-1 overflow-y-auto">
      <div class="p-4 space-y-3">
        {#each filteredDocuments as doc}
          <button
            class="w-full text-left p-4 rounded-lg border transition-all {doc.id === selectedDocument.id ? 'bg-primary-50 border-primary-200' : 'bg-white border-gray-200 hover:bg-gray-50'}"
            on:click={() => selectDocument(doc)}
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="text-lg">{getTypeIcon(doc.type)}</span>
                <span class="text-xs px-2 py-1 rounded-full bg-{getStatusColor(doc.status)}-100 text-{getStatusColor(doc.status)}-800">
                  {doc.status}
                </span>
              </div>
              <span class="text-xs text-gray-500">v{doc.version}</span>
            </div>
            
            <h4 class="font-medium text-gray-900 mb-1">{doc.title}</h4>
            <p class="text-sm text-gray-600 mb-2">{doc.type}</p>
            
            <div class="flex justify-between text-xs text-gray-500">
              <span>{doc.wordCount.toLocaleString()} words</span>
              <span>{new Date(doc.lastModified).toLocaleDateString()}</span>
            </div>
            
            <div class="mt-2 text-xs text-gray-500">
              {doc.sections.length} sections
            </div>
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Center Panel: Document Viewer/Editor -->
  <div class="layout-center">
    <div class="p-6">
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-xl font-semibold text-gray-900">{selectedDocument.title}</h2>
            <p class="text-gray-600">{selectedDocument.type} - {selectedDocument.category}</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs px-3 py-1 rounded-full bg-{getStatusColor(selectedDocument.status)}-100 text-{getStatusColor(selectedDocument.status)}-800">
              {selectedDocument.status}
            </span>
            <button class="btn btn-secondary">
              <Eye size={16} />
              Preview
            </button>
            <button class="btn btn-secondary">
              <Edit size={16} />
              Edit
            </button>
            <button class="btn btn-primary">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
      </div>

      <!-- Document Info -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="card p-4 text-center">
          <p class="text-lg font-semibold text-gray-900">{selectedDocument.wordCount.toLocaleString()}</p>
          <p class="text-sm text-gray-600">Words</p>
        </div>
        <div class="card p-4 text-center">
          <p class="text-lg font-semibold text-gray-900">{selectedDocument.sections.length}</p>
          <p class="text-sm text-gray-600">Sections</p>
        </div>
        <div class="card p-4 text-center">
          <p class="text-lg font-semibold text-gray-900">v{selectedDocument.version}</p>
          <p class="text-sm text-gray-600">Version</p>
        </div>
        <div class="card p-4 text-center">
          <p class="text-lg font-semibold text-{getStatusColor(selectedDocument.status)}-600">{selectedDocument.status}</p>
          <p class="text-sm text-gray-600">Status</p>
        </div>
      </div>

      <!-- Document Structure -->
      <div class="card p-6 mb-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Document Structure</h3>
        <div class="space-y-2">
          {#each selectedDocument.sections as section, index}
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div class="flex items-center gap-3">
                <span class="text-sm font-medium text-gray-500">{index + 1}.</span>
                <span class="text-sm text-gray-900">{section}</span>
              </div>
              <div class="flex items-center gap-2">
                <button class="text-primary-600 hover:text-primary-800 text-sm">
                  <Edit size={14} />
                </button>
                <button class="text-primary-600 hover:text-primary-800 text-sm">
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Content Preview -->
      <div class="card p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Content Preview</h3>
        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="space-y-4">
            <div>
              <h4 class="font-medium text-gray-900 mb-2">Executive Summary</h4>
              <p class="text-sm text-gray-700 leading-relaxed">
                This Local Plan sets out the planning framework for the borough from 2024 to 2030. 
                It provides policies for housing, employment, infrastructure, and environmental protection 
                to guide sustainable development across the area.
              </p>
            </div>
            
            <div>
              <h4 class="font-medium text-gray-900 mb-2">Key Objectives</h4>
              <ul class="text-sm text-gray-700 space-y-1">
                <li>• Deliver 2,400 new homes including 35% affordable housing</li>
                <li>• Create 1,500 new jobs across all sectors</li>
                <li>• Protect and enhance green infrastructure</li>
                <li>• Improve transport connectivity and sustainability</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Right Panel: Document Management -->
  <div class="layout-right">
    <div class="p-4">
      <h3 class="font-medium text-gray-900 mb-4">Document Management</h3>
      
      <!-- Version History -->
      <div class="mb-6">
        <h4 class="text-sm font-medium text-gray-700 mb-3">Version History</h4>
        <div class="space-y-2">
          <div class="p-2 bg-blue-50 rounded-lg border border-blue-200">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-blue-900">v{selectedDocument.version} (Current)</span>
              <span class="text-xs text-blue-700">{new Date(selectedDocument.lastModified).toLocaleDateString()}</span>
            </div>
            <p class="text-xs text-blue-700">Updated housing policies</p>
          </div>
          
          <div class="p-2 bg-gray-50 rounded-lg">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-900">v2.0</span>
              <span class="text-xs text-gray-600">2024-01-01</span>
            </div>
            <p class="text-xs text-gray-600">Major revision with new evidence</p>
          </div>
          
          <div class="p-2 bg-gray-50 rounded-lg">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-900">v1.0</span>
              <span class="text-xs text-gray-600">2023-12-15</span>
            </div>
            <p class="text-xs text-gray-600">Initial draft version</p>
          </div>
        </div>
      </div>

      <!-- Related Documents -->
      <div class="border-t border-gray-200 pt-4 mb-6">
        <h4 class="text-sm font-medium text-gray-700 mb-3">Related Documents</h4>
        <div class="space-y-2">
          <div class="p-2 bg-gray-50 rounded-lg">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-900">Site Assessments</span>
              <ExternalLink size={14} class="text-primary-600" />
            </div>
            <p class="text-xs text-gray-600">Supporting evidence for allocations</p>
          </div>
          
          <div class="p-2 bg-gray-50 rounded-lg">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-900">Transport Study</span>
              <ExternalLink size={14} class="text-primary-600" />
            </div>
            <p class="text-xs text-gray-600">Infrastructure capacity analysis</p>
          </div>
        </div>
      </div>

      <!-- Collaboration -->
      <div class="border-t border-gray-200 pt-4 mb-6">
        <h4 class="text-sm font-medium text-gray-700 mb-3">Collaboration</h4>
        <div class="space-y-2">
          <div class="p-2 bg-gray-50 rounded-lg">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-900">3 Contributors</span>
              <span class="text-xs text-gray-600">Active</span>
            </div>
            <p class="text-xs text-gray-600">Planning team collaboration</p>
          </div>
          
          <div class="p-2 bg-gray-50 rounded-lg">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-900">12 Comments</span>
              <span class="text-xs text-gray-600">Pending</span>
            </div>
            <p class="text-xs text-gray-600">Review feedback to address</p>
          </div>
        </div>
      </div>

      <!-- Document Actions -->
      <div class="border-t border-gray-200 pt-4">
        <h4 class="text-sm font-medium text-gray-700 mb-3">Actions</h4>
        <div class="space-y-2">
          <button class="btn btn-secondary w-full">Share Document</button>
          <button class="btn btn-secondary w-full">Export PDF</button>
          <button class="btn btn-secondary w-full">Create Template</button>
          <button class="btn btn-primary w-full">Publish Version</button>
        </div>
        
        <div class="mt-4 p-3 bg-blue-50 rounded-lg">
          <p class="text-sm text-blue-700">
            <strong>Next Steps:</strong> Complete stakeholder review and incorporate 
            feedback before final publication.
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
