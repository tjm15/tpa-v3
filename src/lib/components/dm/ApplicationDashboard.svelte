<script lang="ts">
  import { Building, Clock, CheckCircle, User, AlertTriangle } from 'lucide-svelte';
  import type { PlanningApplication } from './types';
  
  export let applications: PlanningApplication[];
  export let onSelectApplication: (app: PlanningApplication) => void;
  
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
  
  function getTimeToTarget(targetDate: Date): string {
    const now = new Date();
    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    return `${diffDays} days remaining`;
  }
</script>

<div class="p-6">
  <!-- Dashboard Header -->
  <div class="mb-6">
    <h2 class="text-xl font-semibold text-gray-900 mb-4">Application Dashboard</h2>
    
    <!-- Summary Cards -->
    <div class="grid grid-cols-5 gap-4 mb-6">
      <div class="bg-white p-4 rounded-lg border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Total Applications</p>
            <p class="text-2xl font-semibold text-gray-900">{applications.length}</p>
          </div>
          <Building class="text-blue-600" size={24} />
        </div>
      </div>
      <div class="bg-white p-4 rounded-lg border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Under Review</p>
            <p class="text-2xl font-semibold text-gray-900">{applications.filter(a => a.status === 'under_review').length}</p>
          </div>
          <Clock class="text-yellow-600" size={24} />
        </div>
      </div>
      <div class="bg-white p-4 rounded-lg border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">In Consultation</p>
            <p class="text-2xl font-semibold text-gray-900">{applications.filter(a => a.status === 'consultation').length}</p>
          </div>
          <User class="text-purple-600" size={24} />
        </div>
      </div>
      <div class="bg-white p-4 rounded-lg border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Overdue</p>
            <p class="text-2xl font-semibold text-gray-900">{applications.filter(a => a.targetDate < new Date()).length}</p>
          </div>
          <AlertTriangle class="text-red-600" size={24} />
        </div>
      </div>
      <div class="bg-white p-4 rounded-lg border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Decided</p>
            <p class="text-2xl font-semibold text-gray-900">{applications.filter(a => a.status === 'decided').length}</p>
          </div>
          <CheckCircle class="text-green-600" size={24} />
        </div>
      </div>
    </div>
  </div>
  
  <!-- Applications List -->
  <div class="bg-white rounded-lg border border-gray-200">
    <div class="p-4 border-b border-gray-200">
      <h3 class="font-medium text-gray-900">Recent Applications</h3>
    </div>
    <div class="divide-y divide-gray-200">
      {#each applications.slice(0, 10) as application}
        <button 
          class="w-full p-4 text-left hover:bg-gray-50 transition-colors"
          on:click={() => onSelectApplication(application)}
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <span class="font-medium text-gray-900">{application.reference}</span>
                <span class="px-2 py-1 text-xs rounded-full {getStatusColor(application.status)}">
                  {application.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <p class="text-sm text-gray-600 mb-1">{application.description}</p>
              <p class="text-xs text-gray-500">{application.address}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium text-gray-900">{application.officer}</p>
              <p class="text-xs text-gray-500">{getTimeToTarget(application.targetDate)}</p>
            </div>
          </div>
        </button>
      {/each}
    </div>
  </div>
</div>
