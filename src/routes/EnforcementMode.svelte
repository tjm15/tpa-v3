<script lang="ts">
  import { onMount } from 'svelte';
  import { Shield, AlertTriangle, Clock, MapPin, Camera, FileText, Calendar, User } from 'lucide-svelte';
  
  // Mock enforcement data
  let enforcementCases = [
    {
      id: 'ENF/2024/001',
      address: '12 Residential Avenue, Suburbia',
      breach: 'Unauthorized extension to dwelling',
      category: 'Development',
      priority: 'Medium',
      reported: '2024-01-10',
      investigator: 'John Smith',
      status: 'Investigation',
      ward: 'Residential East',
      complainant: 'Neighbor',
      description: 'Single-story rear extension constructed without planning permission',
      planning_history: [
        { ref: 'APP/2023/045', decision: 'Refused', date: '2023-09-15', reason: 'Overdevelopment' }
      ],
      site_visits: [
        { date: '2024-01-15', officer: 'John Smith', findings: 'Extension confirmed as built' },
        { date: '2024-02-01', officer: 'John Smith', findings: 'No response to enforcement notice' }
      ],
      actions_taken: [
        'Initial site visit completed',
        'Photographs taken',
        'Enforcement notice served',
        'Awaiting compliance'
      ],
      time_limits: {
        immunity: '4 years (dwelling)',
        action_deadline: '2024-05-15'
      },
      next_steps: [
        'Follow-up site visit scheduled',
        'Consider prosecution if no compliance',
        'Explore retrospective application'
      ]
    },
    {
      id: 'ENF/2024/002',
      address: 'Industrial Unit 5, Business Park',
      breach: 'Change of use to waste processing without consent',
      category: 'Change of Use',
      priority: 'High',
      reported: '2024-01-20',
      investigator: 'Sarah Wilson',
      status: 'Formal Action',
      ward: 'Industrial',
      complainant: 'Environmental Health',
      description: 'B2 industrial unit changed to waste processing facility without planning permission',
      planning_history: [
        { ref: 'APP/2022/123', decision: 'Approved', date: '2022-06-10', reason: 'B2 Industrial Use' }
      ],
      site_visits: [
        { date: '2024-01-25', officer: 'Sarah Wilson', findings: 'Active waste processing observed' },
        { date: '2024-02-10', officer: 'Sarah Wilson', findings: 'Continued unauthorized use' }
      ],
      actions_taken: [
        'Stop Notice served',
        'Enforcement Notice issued',
        'Prosecution proceedings initiated',
        'Temporary Stop Notice in effect'
      ],
      time_limits: {
        immunity: '10 years (operational)',
        action_deadline: '2024-03-01'
      },
      next_steps: [
        'Court hearing scheduled',
        'Seek compliance order',
        'Consider direct action'
      ]
    },
    {
      id: 'ENF/2024/003',
      address: 'Green Belt Farm, Rural Lane',
      breach: 'Unauthorized mobile home placement',
      category: 'Green Belt',
      priority: 'High',
      reported: '2024-02-05',
      investigator: 'Mike Johnson',
      status: 'Notice Served',
      ward: 'Rural North',
      complainant: 'Parish Council',
      description: 'Mobile home placed on agricultural land without planning permission',
      planning_history: [
        { ref: 'APP/2023/089', decision: 'Refused', date: '2023-11-20', reason: 'Green Belt policy' }
      ],
      site_visits: [
        { date: '2024-02-08', officer: 'Mike Johnson', findings: 'Mobile home and utility connections' },
        { date: '2024-02-20', officer: 'Mike Johnson', findings: 'Permanent residential occupation' }
      ],
      actions_taken: [
        'Enforcement Notice served',
        'Breach of Condition Notice issued',
        'Monitoring compliance period',
        'Aerial photography obtained'
      ],
      time_limits: {
        immunity: 'None (Green Belt)',
        action_deadline: '2024-04-01'
      },
      next_steps: [
        'Compliance deadline approaching',
        'Prepare prosecution file',
        'Consider injunction if required'
      ]
    }
  ];
  
  let selectedCase = enforcementCases[0];
  let filteredCases = enforcementCases;
  let searchQuery = '';
  let selectedStatus = 'all';
  let selectedPriority = 'all';
  let selectedCategory = 'all';
  
  let statuses = ['all', 'Investigation', 'Formal Action', 'Notice Served', 'Prosecution', 'Closed'];
  let priorities = ['all', 'High', 'Medium', 'Low'];
  let categories = ['all', 'Development', 'Change of Use', 'Green Belt', 'Listed Building', 'Advertisement'];
  
  function selectCase(caseItem: any) {
    selectedCase = caseItem;
  }
  
  function filterCases() {
    filteredCases = enforcementCases.filter(caseItem => {
      const matchesSearch = !searchQuery.trim() || 
        caseItem.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        caseItem.breach.toLowerCase().includes(searchQuery.toLowerCase()) ||
        caseItem.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = selectedStatus === 'all' || caseItem.status === selectedStatus;
      const matchesPriority = selectedPriority === 'all' || caseItem.priority === selectedPriority;
      const matchesCategory = selectedCategory === 'all' || caseItem.category === selectedCategory;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }
  
  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'High': return 'red';
      case 'Medium': return 'yellow';
      case 'Low': return 'green';
      default: return 'gray';
    }
  }
  
  function getStatusColor(status: string) {
    switch (status) {
      case 'Investigation': return 'blue';
      case 'Formal Action': return 'orange';
      case 'Notice Served': return 'purple';
      case 'Prosecution': return 'red';
      case 'Closed': return 'gray';
      default: return 'gray';
    }
  }
  
  function getCategoryIcon(category: string) {
    switch (category) {
      case 'Development': return '🏗️';
      case 'Change of Use': return '🔄';
      case 'Green Belt': return '🌱';
      case 'Listed Building': return '🏛️';
      case 'Advertisement': return '📢';
      default: return '⚠️';
    }
  }
  
  function daysSinceReported(date: string) {
    const reported = new Date(date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - reported.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  $: {
    searchQuery, selectedStatus, selectedPriority, selectedCategory;
    filterCases();
  }
</script>

<!-- Enforcement Mode - Three Pane Layout -->
<div class="layout-left">
  <div class="p-4 border-b border-gray-200">
    <h3 class="font-medium text-gray-900 mb-3">Enforcement Cases</h3>
    
    <div class="space-y-3">
      <input
        type="text"
        placeholder="Search cases..."
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        bind:value={searchQuery}
      />
      
      <select
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        bind:value={selectedStatus}
      >
        {#each statuses as status}
          <option value={status}>{status === 'all' ? 'All Status' : status}</option>
        {/each}
      </select>
      
      <div class="flex gap-2">
        <select
          class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          bind:value={selectedPriority}
        >
          {#each priorities as priority}
            <option value={priority}>{priority === 'all' ? 'All Priority' : priority}</option>
          {/each}
        </select>
        
        <select
          class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          bind:value={selectedCategory}
        >
          {#each categories as category}
            <option value={category}>{category === 'all' ? 'All Categories' : category}</option>
          {/each}
        </select>
      </div>
    </div>
  </div>
  
  <div class="flex-1 overflow-y-auto">
    <div class="p-4 space-y-3">
      {#each filteredCases as caseItem}
        <button
          class="w-full text-left p-3 rounded-lg border transition-all {caseItem.id === selectedCase.id ? 'bg-primary-50 border-primary-200' : 'bg-white border-gray-200 hover:bg-gray-50'}"
          on:click={() => selectCase(caseItem)}
        >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="text-lg">{getCategoryIcon(caseItem.category)}</span>
              <span class="font-medium text-gray-900">{caseItem.id}</span>
            </div>
            <span class="icon-chip icon-chip-{getPriorityColor(caseItem.priority)}">{caseItem.priority}</span>
          </div>
          <div class="text-sm text-gray-600 mb-2">{caseItem.address}</div>
          <div class="text-xs text-gray-500 mb-2">{caseItem.breach}</div>
          <div class="flex items-center justify-between">
            <span class="icon-chip icon-chip-{getStatusColor(caseItem.status)}">{caseItem.status}</span>
            <span class="text-xs text-gray-500">{daysSinceReported(caseItem.reported)} days ago</span>
          </div>
        </button>
      {/each}
    </div>
  </div>
</div>

<!-- Center Panel: Case Detail -->
<div class="layout-center">
  <div class="p-6">
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <span class="text-2xl">{getCategoryIcon(selectedCase.category)}</span>
          <div>
            <h2 class="text-xl font-semibold text-gray-900">{selectedCase.id}</h2>
            <p class="text-gray-600">{selectedCase.address}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="icon-chip icon-chip-{getPriorityColor(selectedCase.priority)}">{selectedCase.priority} Priority</span>
          <span class="icon-chip icon-chip-{getStatusColor(selectedCase.status)}">{selectedCase.status}</span>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="card p-4">
          <p class="text-sm text-gray-600 mb-1">Alleged Breach</p>
          <p class="text-sm text-gray-900">{selectedCase.breach}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-600 mb-1">Investigating Officer</p>
          <p class="text-sm text-gray-900">{selectedCase.investigator}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-600 mb-1">Reported Date</p>
          <p class="text-sm text-gray-900">{new Date(selectedCase.reported).toLocaleDateString()}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-600 mb-1">Complainant</p>
          <p class="text-sm text-gray-900">{selectedCase.complainant}</p>
        </div>
      </div>
      
      <div class="card p-4 mb-6">
        <h3 class="text-sm font-medium text-gray-700 mb-2">Description</h3>
        <p class="text-sm text-gray-900">{selectedCase.description}</p>
      </div>
    </div>
    
    <!-- Time Limits -->
    <div class="card p-6 mb-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Time Limits & Deadlines</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 bg-yellow-50 rounded-lg">
          <div class="flex items-center gap-2 mb-2">
            <Clock size={16} class="text-yellow-600" />
            <h4 class="font-medium text-yellow-800">Immunity Period</h4>
          </div>
          <p class="text-sm text-yellow-700">{selectedCase.time_limits.immunity}</p>
        </div>
        <div class="p-4 bg-red-50 rounded-lg">
          <div class="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} class="text-red-600" />
            <h4 class="font-medium text-red-800">Action Deadline</h4>
          </div>
          <p class="text-sm text-red-700">{new Date(selectedCase.time_limits.action_deadline).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
    
    <!-- Planning History -->
    <div class="card p-6 mb-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Planning History</h3>
      <div class="space-y-3">
        {#each selectedCase.planning_history as app}
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-3">
              <FileText size={16} class="text-gray-400" />
              <div>
                <span class="font-medium text-gray-900">{app.ref}</span>
                <p class="text-sm text-gray-600">{app.reason}</p>
              </div>
            </div>
            <div class="text-right">
              <span class="icon-chip icon-chip-{app.decision === 'Approved' ? 'green' : 'red'}">{app.decision}</span>
              <p class="text-xs text-gray-500 mt-1">{new Date(app.date).toLocaleDateString()}</p>
            </div>
          </div>
        {/each}
      </div>
    </div>
    
    <!-- Site Visits -->
    <div class="card p-6 mb-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Site Visits</h3>
      <div class="space-y-3">
        {#each selectedCase.site_visits as visit}
          <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Camera size={16} class="text-gray-400 mt-1" />
            <div class="flex-1">
              <div class="flex items-center justify-between mb-2">
                <span class="font-medium text-gray-900">{visit.officer}</span>
                <span class="text-sm text-gray-500">{new Date(visit.date).toLocaleDateString()}</span>
              </div>
              <p class="text-sm text-gray-600">{visit.findings}</p>
            </div>
          </div>
        {/each}
      </div>
    </div>
    
    <!-- Actions Taken -->
    <div class="card p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Actions Taken</h3>
      <div class="space-y-2">
        {#each selectedCase.actions_taken as action}
          <div class="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span class="text-sm text-blue-800">{action}</span>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<!-- Right Panel: Case Management -->
<div class="layout-right">
  <div class="p-4">
    <h3 class="font-medium text-gray-900 mb-4">Case Management</h3>
    
    <div class="mb-6">
      <h4 class="text-sm font-medium text-gray-700 mb-3">Case Progress</h4>
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Days since reported</span>
          <span class="text-sm font-medium text-gray-900">{daysSinceReported(selectedCase.reported)}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Site visits</span>
          <span class="text-sm font-medium text-gray-900">{selectedCase.site_visits.length}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Actions taken</span>
          <span class="text-sm font-medium text-gray-900">{selectedCase.actions_taken.length}</span>
        </div>
      </div>
    </div>
    
    <div class="border-t border-gray-200 pt-4 mb-6">
      <h4 class="text-sm font-medium text-gray-700 mb-3">Next Steps</h4>
      <div class="space-y-2">
        {#each selectedCase.next_steps as step}
          <div class="p-2 bg-green-50 rounded-lg">
            <p class="text-sm text-green-800">{step}</p>
          </div>
        {/each}
      </div>
    </div>
    
    <div class="border-t border-gray-200 pt-4 mb-6">
      <h4 class="text-sm font-medium text-gray-700 mb-3">Case Actions</h4>
      <div class="space-y-2">
        <button class="btn btn-primary w-full">Schedule Site Visit</button>
        <button class="btn btn-secondary w-full">Send Notice</button>
        <button class="btn btn-secondary w-full">Update Case</button>
        <button class="btn btn-secondary w-full">Add Photos</button>
        <button class="btn btn-secondary w-full">Create Report</button>
      </div>
    </div>
    
    <div class="border-t border-gray-200 pt-4">
      <h4 class="text-sm font-medium text-gray-700 mb-3">Case Summary</h4>
      <div class="p-3 bg-gray-50 rounded-lg">
        <p class="text-sm text-gray-700">
          <strong>Status:</strong> {selectedCase.status} case in {selectedCase.ward} ward. 
          {#if selectedCase.priority === 'High'}
            High priority - immediate action required.
          {:else if selectedCase.priority === 'Medium'}
            Medium priority - monitor progress.
          {:else}
            Low priority - routine investigation.
          {/if}
        </p>
      </div>
      
      <div class="mt-4 p-3 bg-yellow-50 rounded-lg">
        <p class="text-sm text-yellow-800">
          <strong>Deadline:</strong> Action must be taken by {new Date(selectedCase.time_limits.action_deadline).toLocaleDateString()}
        </p>
      </div>
    </div>
  </div>
</div>
