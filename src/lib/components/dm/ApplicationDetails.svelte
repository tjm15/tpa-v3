<script lang="ts">
  import { ChevronRight, ChevronDown, MapPin, Clock, CheckCircle, AlertCircle, User, Calendar, FileText, Building } from 'lucide-svelte';
  import type { PlanningApplication } from './types';
  
  export let application: PlanningApplication;
  
  let expandedPanels = new Set<string>(['overview']);
  
  function togglePanel(panelId: string) {
    if (expandedPanels.has(panelId)) {
      expandedPanels.delete(panelId);
    } else {
      expandedPanels.add(panelId);
    }
    expandedPanels = expandedPanels;
  }
  
  function getStatusColor(status: string) {
    switch (status) {
      case 'received': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'consultation': return 'bg-purple-100 text-purple-800';
      case 'determination': return 'bg-orange-100 text-orange-800';
      case 'decided': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  const dmWorkspaces = [
    {
      id: 'overview',
      title: 'Application Overview',
      icon: Building,
      description: 'Current application details and progress tracking',
    },
    {
      id: 'site-assessment',
      title: 'Site Assessment',
      icon: MapPin,
      description: 'Constraint analysis, site visits, and technical assessments',
    },
    {
      id: 'policy-analysis',
      title: 'Policy Compliance',
      icon: FileText,
      description: 'Policy analysis, compliance checking, and planning balance',
    },
    {
      id: 'consultation',
      title: 'Consultation Management',
      icon: User,
      description: 'Stakeholder responses, public consultation, and engagement tracking',
    }
  ];
</script>

<div class="w-2/3 p-6 overflow-y-auto space-y-6">
  <!-- Application Header -->
  <div class="bg-white rounded-lg border border-gray-200 p-6">
    <div class="flex items-start justify-between mb-4">
      <div>
        <h2 class="text-xl font-semibold text-gray-900">{application.reference}</h2>
        <p class="text-gray-600 mt-1">{application.description}</p>
        <p class="text-sm text-gray-500 mt-2">{application.address}</p>
      </div>
      <div class="text-right">
        <span class="px-3 py-1 text-sm rounded-full {getStatusColor(application.status)}">
          {application.status.replace('_', ' ').toUpperCase()}
        </span>
        <p class="text-sm text-gray-500 mt-2">Target: {application.targetDate.toLocaleDateString()}</p>
      </div>
    </div>
    
    <!-- Application Meta -->
    <div class="grid grid-cols-3 gap-4 text-sm">
      <div>
        <span class="text-gray-500">Applicant:</span>
        <p class="font-medium">{application.applicant}</p>
      </div>
      <div>
        <span class="text-gray-500">Case Officer:</span>
        <p class="font-medium">{application.officer}</p>
      </div>
      <div>
        <span class="text-gray-500">Ward:</span>
        <p class="font-medium">{application.ward}</p>
      </div>
    </div>
  </div>

  <!-- Workspace Panels -->
  <div class="space-y-4">
    {#each dmWorkspaces as workspace}
      <div class="bg-white rounded-lg border border-gray-200">
        <button 
          class="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          on:click={() => togglePanel(workspace.id)}
        >
          <div class="flex items-center gap-3">
            <svelte:component this={workspace.icon} size={20} class="text-gray-600" />
            <div class="text-left">
              <h3 class="font-medium text-gray-900">{workspace.title}</h3>
              <p class="text-sm text-gray-600">{workspace.description}</p>
            </div>
          </div>
          <ChevronRight size={20} class="text-gray-400 transition-transform {expandedPanels.has(workspace.id) ? 'rotate-90' : ''}" />
        </button>
        
        {#if expandedPanels.has(workspace.id)}
          <div class="border-t border-gray-200 bg-gray-50 p-6">
            <div class="space-y-4">
              {#if workspace.id === 'overview'}
                <!-- Application Overview Content -->
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-3">
                    <h5 class="font-medium text-gray-900">Documents ({application.documents.length})</h5>
                    {#each application.documents as doc}
                      <div class="flex items-center justify-between p-2 bg-white rounded border">
                        <span class="text-sm">{doc.name}</span>
                        <div class="flex items-center gap-2">
                          {#if doc.processed}
                            <CheckCircle size={14} class="text-green-600" />
                          {:else}
                            <Clock size={14} class="text-yellow-600" />
                          {/if}
                          <span class="text-xs text-gray-500">{(doc.size / 1024).toFixed(1)}KB</span>
                        </div>
                      </div>
                    {/each}
                  </div>
                  
                  <div class="space-y-3">
                    <h5 class="font-medium text-gray-900">Constraints</h5>
                    {#each application.constraints as constraint}
                      <div class="p-2 bg-amber-50 border border-amber-200 rounded text-sm">
                        <span class="text-amber-800">{constraint}</span>
                      </div>
                    {/each}
                  </div>
                </div>
                
              {:else if workspace.id === 'site-assessment'}
                <!-- Site Assessment Tools -->
                <div class="grid grid-cols-2 gap-4">
                  <button class="btn btn-secondary p-4 text-left">
                    <MapPin size={20} class="mb-2" />
                    <h6 class="font-medium">Constraint Mapping</h6>
                    <p class="text-sm text-gray-600">Identify and analyze site constraints</p>
                  </button>
                  <button class="btn btn-secondary p-4 text-left">
                    <Clock size={20} class="mb-2" />
                    <h6 class="font-medium">Site Visit Scheduler</h6>
                    <p class="text-sm text-gray-600">Schedule and track site visits</p>
                  </button>
                </div>
                
              {:else if workspace.id === 'policy-analysis'}
                <!-- Policy Analysis Tools -->
                <div class="space-y-3">
                  <button class="btn btn-secondary w-full p-3 text-left">
                    <FileText size={16} class="inline mr-2" />
                    Run Policy Compliance Check
                  </button>
                  <button class="btn btn-secondary w-full p-3 text-left">
                    <CheckCircle size={16} class="inline mr-2" />
                    Review Planning Balance
                  </button>
                </div>
                
              {:else if workspace.id === 'consultation'}
                <!-- Consultation Management -->
                <div class="space-y-3">
                  <h5 class="font-medium text-gray-900">Active Consultations ({application.consultations.length})</h5>
                  {#each application.consultations as consultation}
                    <div class="p-3 bg-white rounded border">
                      <div class="flex items-center justify-between">
                        <span class="font-medium text-sm">{consultation.consultee}</span>
                        <span class="text-xs px-2 py-1 rounded-full 
                          {consultation.response === 'support' ? 'bg-green-100 text-green-800' : 
                           consultation.response === 'object' ? 'bg-red-100 text-red-800' :
                           consultation.response === 'neutral' ? 'bg-gray-100 text-gray-800' :
                           'bg-yellow-100 text-yellow-800'}">
                          {consultation.response || 'Pending'}
                        </span>
                      </div>
                      <p class="text-xs text-gray-500 mt-1">
                        Sent: {consultation.sentDate.toLocaleDateString()}
                        {#if consultation.responseDate}
                          • Received: {consultation.responseDate.toLocaleDateString()}
                        {/if}
                      </p>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
