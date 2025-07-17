<script lang="ts">
  import { onMount } from 'svelte';
  import { Building, MapPin, Clock, AlertTriangle, CheckCircle, XCircle, FileText, Users } from 'lucide-svelte';
  
  // Mock application data
  let applications = [
    {
      id: 'APP/2024/001',
      address: '45 High Street, Town Center',
      proposal: 'Change of use from retail (A1) to residential (C3) - 4 flats',
      applicant: 'Urban Developments Ltd',
      agent: 'Planning Solutions',
      received: '2024-01-15',
      target: '2024-03-15',
      status: 'Under Review',
      caseOfficer: 'Sarah Johnson',
      ward: 'Town Center',
      siteArea: 0.08,
      floorArea: 280,
      dwellings: 4,
      parking: 2,
      policyCompliance: {
        'H1': { status: 'compliant', note: 'Appropriate housing mix for town center' },
        'H2': { status: 'non-compliant', note: 'No affordable housing provision' },
        'T1': { status: 'compliant', note: 'Sustainable transport location' },
        'TC1': { status: 'concern', note: 'Loss of retail unit in primary frontage' },
        'DM1': { status: 'compliant', note: 'Acceptable design standards' }
      },
      constraints: [
        { type: 'Conservation Area', impact: 'medium' },
        { type: 'Flood Zone 2', impact: 'low' },
        { type: 'Town Center Boundary', impact: 'high' }
      ],
      consultations: [
        { consultee: 'Highway Authority', status: 'no-objection', received: '2024-01-28' },
        { consultee: 'Conservation Officer', status: 'pending', received: null },
        { consultee: 'Environmental Health', status: 'conditions', received: '2024-02-05' }
      ],
      representations: [
        { type: 'Support', count: 2 },
        { type: 'Objection', count: 12 },
        { type: 'Comment', count: 3 }
      ],
      keyIssues: [
        'Loss of retail unit in primary shopping frontage',
        'Parking provision below policy requirement',
        'Impact on conservation area character'
      ],
      recommendations: [
        'Require retail marketing evidence',
        'Secure car club membership',
        'Heritage impact assessment needed'
      ]
    },
    {
      id: 'APP/2024/002',
      address: 'Land at Greenfield Farm, Rural Road',
      proposal: 'Residential development - 45 dwellings with access',
      applicant: 'Green Valley Homes',
      agent: 'Planning Plus',
      received: '2024-02-01',
      target: '2024-05-01',
      status: 'Major Application',
      caseOfficer: 'Michael Chen',
      ward: 'Rural North',
      siteArea: 2.1,
      floorArea: 4500,
      dwellings: 45,
      parking: 90,
      policyCompliance: {
        'H1': { status: 'compliant', note: 'Appropriate housing mix provided' },
        'H2': { status: 'compliant', note: '35% affordable housing secured' },
        'G1': { status: 'non-compliant', note: 'Development in designated Green Belt' },
        'T2': { status: 'concern', note: 'Rural location with limited transport' },
        'DM5': { status: 'compliant', note: 'Adequate landscaping proposed' }
      },
      constraints: [
        { type: 'Green Belt', impact: 'high' },
        { type: 'Agricultural Land Grade 2', impact: 'medium' },
        { type: 'Tree Preservation Order', impact: 'medium' }
      ],
      consultations: [
        { consultee: 'Highway Authority', status: 'objection', received: '2024-02-12' },
        { consultee: 'Natural England', status: 'no-objection', received: '2024-02-15' },
        { consultee: 'Parish Council', status: 'objection', received: '2024-02-10' }
      ],
      representations: [
        { type: 'Support', count: 8 },
        { type: 'Objection', count: 47 },
        { type: 'Comment', count: 12 }
      ],
      keyIssues: [
        'Inappropriate development in Green Belt',
        'Highway safety concerns at site access',
        'Impact on local infrastructure capacity'
      ],
      recommendations: [
        'Demonstrate very special circumstances',
        'Provide transport assessment',
        'Secure infrastructure contributions'
      ]
    },
    {
      id: 'APP/2024/003',
      address: 'Former Gas Works, Industrial Estate',
      proposal: 'Mixed use development - 120 homes and 500sqm commercial',
      applicant: 'Phoenix Regeneration',
      agent: 'Major Projects Ltd',
      received: '2024-01-08',
      target: '2024-04-08',
      status: 'Committee',
      caseOfficer: 'Emma Williams',
      ward: 'Industrial',
      siteArea: 3.2,
      floorArea: 12000,
      dwellings: 120,
      parking: 180,
      policyCompliance: {
        'H1': { status: 'compliant', note: 'Good housing mix and density' },
        'H2': { status: 'compliant', note: 'Viability assessment accepted' },
        'E1': { status: 'compliant', note: 'Replacement employment provided' },
        'CC1': { status: 'compliant', note: 'Renewable energy provision' },
        'DM3': { status: 'concern', note: 'Ground contamination issues' }
      },
      constraints: [
        { type: 'Contaminated Land', impact: 'high' },
        { type: 'Noise from Railway', impact: 'medium' },
        { type: 'Employment Area', impact: 'medium' }
      ],
      consultations: [
        { consultee: 'Environmental Agency', status: 'conditions', received: '2024-01-25' },
        { consultee: 'Network Rail', status: 'no-objection', received: '2024-01-30' },
        { consultee: 'Economic Development', status: 'support', received: '2024-01-22' }
      ],
      representations: [
        { type: 'Support', count: 15 },
        { type: 'Objection', count: 8 },
        { type: 'Comment', count: 5 }
      ],
      keyIssues: [
        'Ground contamination remediation required',
        'Noise mitigation for residential units',
        'Delivery of employment floorspace'
      ],
      recommendations: [
        'Condition contamination remediation',
        'Require noise assessment',
        'Secure employment delivery'
      ]
    }
  ];
  
  let selectedApplication = applications[0];
  let filteredApplications = applications;
  let searchQuery = '';
  let selectedStatus = 'all';
  let selectedWard = 'all';
  
  let statuses = ['all', 'Under Review', 'Major Application', 'Committee', 'Delegated', 'Decided'];
  let wards = ['all', 'Town Center', 'Rural North', 'Industrial', 'Residential East', 'Residential West'];
  
  function selectApplication(app: any) {
    selectedApplication = app;
  }
  
  function filterApplications() {
    filteredApplications = applications.filter(app => {
      const matchesSearch = !searchQuery.trim() || 
        app.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.proposal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = selectedStatus === 'all' || app.status === selectedStatus;
      const matchesWard = selectedWard === 'all' || app.ward === selectedWard;
      
      return matchesSearch && matchesStatus && matchesWard;
    });
  }
  
  function getComplianceColor(status: string) {
    switch (status) {
      case 'compliant': return 'green';
      case 'non-compliant': return 'red';
      case 'concern': return 'yellow';
      default: return 'gray';
    }
  }
  
  function getComplianceIcon(status: string) {
    switch (status) {
      case 'compliant': return CheckCircle;
      case 'non-compliant': return XCircle;
      case 'concern': return AlertTriangle;
      default: return Clock;
    }
  }
  
  function getConstraintColor(impact: string) {
    switch (impact) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'blue';
      default: return 'gray';
    }
  }
  
  function getConsultationColor(status: string) {
    switch (status) {
      case 'support': return 'green';
      case 'no-objection': return 'blue';
      case 'conditions': return 'yellow';
      case 'objection': return 'red';
      case 'pending': return 'gray';
      default: return 'gray';
    }
  }
  
  $: {
    searchQuery, selectedStatus, selectedWard;
    filterApplications();
  }
</script>

<!-- Application Mode - Three Pane Layout -->
<div class="layout-left">
  <div class="p-4 border-b border-gray-200">
    <h3 class="font-medium text-gray-900 mb-3">Planning Applications</h3>
    
    <div class="space-y-3">
      <input
        type="text"
        placeholder="Search applications..."
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
      
      <select
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        bind:value={selectedWard}
      >
        {#each wards as ward}
          <option value={ward}>{ward === 'all' ? 'All Wards' : ward}</option>
        {/each}
      </select>
    </div>
  </div>
  
  <div class="flex-1 overflow-y-auto">
    <div class="p-4 space-y-3">
      {#each filteredApplications as app}
        <button
          class="list-item {app.id === selectedApplication.id ? 'selected' : ''} slide-in-left"
          on:click={() => selectApplication(app)}
        >
          <div class="flex items-center justify-between mb-2">
            <span class="font-medium text-gray-900">{app.id}</span>
            <div class="status-indicator info">{app.status}</div>
          </div>
          <div class="text-sm text-gray-600 mb-2">{app.address}</div>
          <div class="text-xs text-gray-500 mb-2">{app.proposal}</div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-500">{app.ward}</span>
            <span class="text-xs text-gray-500">Target: {new Date(app.target).toLocaleDateString()}</span>
          </div>
        </button>
      {/each}
    </div>
  </div>
</div>

<!-- Center Panel: Application Detail -->
<div class="layout-center">
  <div class="p-6">
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">{selectedApplication.id}</h2>
          <p class="text-gray-600">{selectedApplication.address}</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="icon-chip icon-chip-blue">{selectedApplication.status}</span>
          <button class="btn btn-secondary">View Documents</button>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="card p-4">
          <p class="text-sm text-gray-600 mb-1">Proposal</p>
          <p class="text-sm text-gray-900">{selectedApplication.proposal}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-600 mb-1">Case Officer</p>
          <p class="text-sm text-gray-900">{selectedApplication.caseOfficer}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-600 mb-1">Received</p>
          <p class="text-sm text-gray-900">{new Date(selectedApplication.received).toLocaleDateString()}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-600 mb-1">Target Decision</p>
          <p class="text-sm text-gray-900">{new Date(selectedApplication.target).toLocaleDateString()}</p>
        </div>
      </div>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="card p-4">
          <p class="text-sm text-gray-600 mb-1">Site Area</p>
          <p class="text-lg font-bold text-gray-900">{selectedApplication.siteArea} ha</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-600 mb-1">Dwellings</p>
          <p class="text-lg font-bold text-gray-900">{selectedApplication.dwellings}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-600 mb-1">Floor Area</p>
          <p class="text-lg font-bold text-gray-900">{selectedApplication.floorArea.toLocaleString()} m²</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-600 mb-1">Parking</p>
          <p class="text-lg font-bold text-gray-900">{selectedApplication.parking} spaces</p>
        </div>
      </div>
    </div>
    
    <!-- Policy Compliance -->
    <div class="card p-6 mb-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Policy Compliance</h3>
      <div class="space-y-3">
        {#each Object.entries(selectedApplication.policyCompliance) as [policy, compliance]}
          <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <svelte:component 
              this={getComplianceIcon(compliance.status)} 
              size={16} 
              class="text-{getComplianceColor(compliance.status)}-500 mt-0.5" 
            />
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-medium text-gray-900">Policy {policy}</span>
                <span class="icon-chip icon-chip-{getComplianceColor(compliance.status)}">{compliance.status}</span>
              </div>
              <p class="text-sm text-gray-600">{compliance.note}</p>
            </div>
          </div>
        {/each}
      </div>
    </div>
    
    <!-- Constraints -->
    <div class="card p-6 mb-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Site Constraints</h3>
      <div class="space-y-3">
        {#each selectedApplication.constraints as constraint}
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-3">
              <MapPin size={16} class="text-{getConstraintColor(constraint.impact)}-500" />
              <span class="text-sm text-gray-900">{constraint.type}</span>
            </div>
            <span class="icon-chip icon-chip-{getConstraintColor(constraint.impact)}">{constraint.impact} impact</span>
          </div>
        {/each}
      </div>
    </div>
    
    <!-- Consultations -->
    <div class="card p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Consultations</h3>
      <div class="space-y-3">
        {#each selectedApplication.consultations as consultation}
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-3">
              <Users size={16} class="text-{getConsultationColor(consultation.status)}-500" />
              <span class="text-sm text-gray-900">{consultation.consultee}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="icon-chip icon-chip-{getConsultationColor(consultation.status)}">{consultation.status}</span>
              {#if consultation.received}
                <span class="text-xs text-gray-500">{new Date(consultation.received).toLocaleDateString()}</span>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<!-- Right Panel: Assessment Summary -->
<div class="layout-right">
  <div class="p-4">
    <h3 class="font-medium text-gray-900 mb-4">Assessment Summary</h3>
    
    <div class="mb-6">
      <h4 class="text-sm font-medium text-gray-700 mb-3">Public Representations</h4>
      <div class="space-y-2">
        {#each selectedApplication.representations as rep}
          <div class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <span class="text-sm text-gray-700">{rep.type}</span>
            <span class="text-sm font-medium text-gray-900">{rep.count}</span>
          </div>
        {/each}
      </div>
    </div>
    
    <div class="border-t border-gray-200 pt-4 mb-6">
      <h4 class="text-sm font-medium text-gray-700 mb-3">Key Issues</h4>
      <div class="space-y-2">
        {#each selectedApplication.keyIssues as issue}
          <div class="p-2 bg-red-50 rounded-lg">
            <p class="text-sm text-red-800">{issue}</p>
          </div>
        {/each}
      </div>
    </div>
    
    <div class="border-t border-gray-200 pt-4 mb-6">
      <h4 class="text-sm font-medium text-gray-700 mb-3">Recommendations</h4>
      <div class="space-y-2">
        {#each selectedApplication.recommendations as recommendation}
          <div class="p-2 bg-green-50 rounded-lg">
            <p class="text-sm text-green-800">{recommendation}</p>
          </div>
        {/each}
      </div>
    </div>
    
    <div class="border-t border-gray-200 pt-4">
      <h4 class="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
      <div class="space-y-2">
        <button class="btn btn-primary w-full">Create Assessment</button>
        <button class="btn btn-secondary w-full">Schedule Site Visit</button>
        <button class="btn btn-secondary w-full">Request Information</button>
        <button class="btn btn-secondary w-full">Generate Report</button>
      </div>
      
      <div class="mt-4 p-3 bg-gray-50 rounded-lg">
        <p class="text-sm text-gray-700">
          <strong>Next Steps:</strong> 
          {#if selectedApplication.status === 'Under Review'}
            Complete policy assessment and consultation review
          {:else if selectedApplication.status === 'Major Application'}
            Prepare committee report and recommendation
          {:else}
            Finalize decision and conditions
          {/if}
        </p>
      </div>
    </div>
  </div>
</div>
