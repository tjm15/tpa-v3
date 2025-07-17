<script lang="ts">
  import { onMount } from 'svelte';
  import { Calculator, TrendingUp, TrendingDown, DollarSign, Building, AlertTriangle, CheckCircle } from 'lucide-svelte';
  
  // Mock viability data
  let viabilityAssessments = [
    {
      id: 'VIA-001',
      application: 'APP/2024/001',
      address: '45 High Street, Town Center',
      proposal: 'Change of use - 4 flats',
      assessor: 'Viability Solutions Ltd',
      submitted: '2024-01-20',
      status: 'Under Review',
      developmentValue: 1200000,
      developmentCosts: 890000,
      landValue: 180000,
      profit: 130000,
      profitMargin: 10.8,
      residualLandValue: 145000,
      benchmarkLandValue: 180000,
      viabilityGap: 35000,
      originalAH: 0,
      proposedAH: 0,
      ahValue: 0,
      s106Contributions: 25000,
      cilLiability: 15000,
      keyAssumptions: {
        salesValues: '£500/sqft',
        buildCosts: '£150/sqft',
        profitTarget: '17.5%',
        financeRate: '7.5%',
        buildPeriod: '18 months'
      },
      sensitivities: [
        { parameter: 'Sales Values', change: '+10%', impact: '+£120,000' },
        { parameter: 'Build Costs', change: '+5%', impact: '-£44,500' },
        { parameter: 'Profit Rate', change: '-2.5%', impact: '+£65,000' }
      ],
      recommendations: [
        'Accept zero affordable housing contribution',
        'Reduce S106 contributions to £15,000',
        'Accept CIL liability as submitted'
      ]
    },
    {
      id: 'VIA-002',
      application: 'APP/2024/002',
      address: 'Land at Greenfield Farm',
      proposal: 'Residential development - 45 dwellings',
      assessor: 'Development Economics',
      submitted: '2024-02-05',
      status: 'Challenged',
      developmentValue: 15750000,
      developmentCosts: 11200000,
      landValue: 2800000,
      profit: 1750000,
      profitMargin: 11.1,
      residualLandValue: 2950000,
      benchmarkLandValue: 2800000,
      viabilityGap: 0,
      originalAH: 1575000, // 35% of GDV
      proposedAH: 945000,   // 21% of GDV
      ahValue: 630000,
      s106Contributions: 450000,
      cilLiability: 225000,
      keyAssumptions: {
        salesValues: '£350/sqft',
        buildCosts: '£120/sqft',
        profitTarget: '17.5%',
        financeRate: '7.0%',
        buildPeriod: '24 months'
      },
      sensitivities: [
        { parameter: 'Sales Values', change: '+5%', impact: '+£787,500' },
        { parameter: 'Build Costs', change: '+10%', impact: '-£560,000' },
        { parameter: 'Infrastructure', change: '+25%', impact: '-£112,500' }
      ],
      recommendations: [
        'Challenge build cost assumptions',
        'Review profit margin expectations',
        'Consider phased AH delivery'
      ]
    },
    {
      id: 'VIA-003',
      application: 'APP/2024/003',
      address: 'Former Gas Works',
      proposal: 'Mixed use - 120 homes + commercial',
      assessor: 'Urban Economics Ltd',
      submitted: '2024-01-10',
      status: 'Accepted',
      developmentValue: 42000000,
      developmentCosts: 31500000,
      landValue: 3200000,
      profit: 7300000,
      profitMargin: 17.4,
      residualLandValue: 3850000,
      benchmarkLandValue: 3200000,
      viabilityGap: 0,
      originalAH: 14700000, // 35% of GDV
      proposedAH: 12600000, // 30% of GDV
      ahValue: 2100000,
      s106Contributions: 1800000,
      cilLiability: 950000,
      keyAssumptions: {
        salesValues: '£425/sqft residential, £200/sqft commercial',
        buildCosts: '£180/sqft residential, £120/sqft commercial',
        profitTarget: '17.5% residential, 15% commercial',
        financeRate: '6.5%',
        buildPeriod: '36 months'
      },
      sensitivities: [
        { parameter: 'Remediation', change: '+20%', impact: '-£630,000' },
        { parameter: 'Commercial Rent', change: '-10%', impact: '-£420,000' },
        { parameter: 'Residential Values', change: '+8%', impact: '+£2,688,000' }
      ],
      recommendations: [
        'Accept 30% affordable housing',
        'Secure full S106 contributions',
        'Monitor remediation costs'
      ]
    }
  ];
  
  let selectedAssessment = viabilityAssessments[0];
  let filteredAssessments = viabilityAssessments;
  let searchQuery = '';
  let selectedStatus = 'all';
  
  let statuses = ['all', 'Under Review', 'Challenged', 'Accepted', 'Rejected'];
  
  function selectAssessment(assessment: any) {
    selectedAssessment = assessment;
  }
  
  function filterAssessments() {
    filteredAssessments = viabilityAssessments.filter(assessment => {
      const matchesSearch = !searchQuery.trim() || 
        assessment.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assessment.application.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assessment.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = selectedStatus === 'all' || assessment.status === selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }
  
  function getStatusColor(status: string) {
    switch (status) {
      case 'Accepted': return 'green';
      case 'Challenged': return 'yellow';
      case 'Under Review': return 'blue';
      case 'Rejected': return 'red';
      default: return 'gray';
    }
  }
  
  function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
  
  function getViabilityStatus(assessment: any) {
    if (assessment.viabilityGap > 0) {
      return { status: 'Not Viable', color: 'red', icon: AlertTriangle };
    } else if (assessment.profitMargin < 15) {
      return { status: 'Marginal', color: 'yellow', icon: AlertTriangle };
    } else {
      return { status: 'Viable', color: 'green', icon: CheckCircle };
    }
  }
  
  $: {
    searchQuery, selectedStatus;
    filterAssessments();
  }
</script>

<!-- Viability Mode - Three Pane Layout -->
<div class="layout-left">
  <div class="p-4 border-b border-gray-200">
    <h3 class="font-medium text-gray-900 mb-3">Viability Assessments</h3>
    
    <div class="space-y-3">
      <input
        type="text"
        placeholder="Search assessments..."
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
    </div>
  </div>
  
  <div class="flex-1 overflow-y-auto">
    <div class="p-4 space-y-3">
      {#each filteredAssessments as assessment}
        <button
          class="w-full text-left p-3 rounded-lg border transition-all {assessment.id === selectedAssessment.id ? 'bg-primary-50 border-primary-200' : 'bg-white border-gray-200 hover:bg-gray-50'}"
          on:click={() => selectAssessment(assessment)}
        >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <Calculator size={16} class="text-gray-400" />
              <span class="font-medium text-gray-900">{assessment.id}</span>
            </div>
            <span class="icon-chip icon-chip-{getStatusColor(assessment.status)}">{assessment.status}</span>
          </div>
          <div class="text-sm text-gray-600 mb-2">{assessment.address}</div>
          <div class="text-xs text-gray-500 mb-2">{assessment.application}</div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-500">{assessment.assessor}</span>
            <span class="text-xs font-medium text-gray-900">{assessment.profitMargin}% profit</span>
          </div>
        </button>
      {/each}
    </div>
  </div>
</div>

<!-- Center Panel: Viability Detail -->
<div class="layout-center">
  <div class="p-6">
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">{selectedAssessment.id}</h2>
          <p class="text-gray-600">{selectedAssessment.address}</p>
        </div>
        <div class="flex items-center gap-2">
          {#if selectedAssessment}
            {@const viabilityStatus = getViabilityStatus(selectedAssessment)}
            <span class="icon-chip icon-chip-{viabilityStatus.color}">{viabilityStatus.status}</span>
          {/if}
          <button class="btn btn-secondary">Download Report</button>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="card p-4">
          <p class="text-sm text-gray-600 mb-1">Application</p>
          <p class="text-sm text-gray-900">{selectedAssessment.application}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-600 mb-1">Assessor</p>
          <p class="text-sm text-gray-900">{selectedAssessment.assessor}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-600 mb-1">Submitted</p>
          <p class="text-sm text-gray-900">{new Date(selectedAssessment.submitted).toLocaleDateString()}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-600 mb-1">Status</p>
          <p class="text-sm text-gray-900">{selectedAssessment.status}</p>
        </div>
      </div>
    </div>
    
    <!-- Financial Summary -->
    <div class="card p-6 mb-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Financial Summary</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div class="text-center">
          <p class="text-sm text-gray-600 mb-1">Development Value</p>
          <p class="text-lg font-bold text-green-600">{formatCurrency(selectedAssessment.developmentValue)}</p>
        </div>
        <div class="text-center">
          <p class="text-sm text-gray-600 mb-1">Development Costs</p>
          <p class="text-lg font-bold text-red-600">{formatCurrency(selectedAssessment.developmentCosts)}</p>
        </div>
        <div class="text-center">
          <p class="text-sm text-gray-600 mb-1">Land Value</p>
          <p class="text-lg font-bold text-blue-600">{formatCurrency(selectedAssessment.landValue)}</p>
        </div>
        <div class="text-center">
          <p class="text-sm text-gray-600 mb-1">Profit</p>
          <p class="text-lg font-bold text-gray-900">{formatCurrency(selectedAssessment.profit)}</p>
        </div>
      </div>
      
      <div class="border-t border-gray-200 pt-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-gray-600">Profit Margin</span>
          <span class="text-sm font-medium text-gray-900">{selectedAssessment.profitMargin}%</span>
        </div>
        <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            class="h-full bg-{selectedAssessment.profitMargin >= 17.5 ? 'green' : selectedAssessment.profitMargin >= 15 ? 'yellow' : 'red'}-500 rounded-full transition-all duration-300"
            style="width: {Math.min(selectedAssessment.profitMargin * 4, 100)}%"
          ></div>
        </div>
        <div class="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>15% (Minimum)</span>
          <span>17.5% (Target)</span>
          <span>25%</span>
        </div>
      </div>
    </div>
    
    <!-- Affordable Housing -->
    <div class="card p-6 mb-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Affordable Housing</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="text-center p-4 bg-blue-50 rounded-lg">
          <p class="text-sm text-gray-600 mb-1">Policy Requirement</p>
          <p class="text-lg font-bold text-blue-600">{formatCurrency(selectedAssessment.originalAH)}</p>
          <p class="text-xs text-gray-500">35% of GDV</p>
        </div>
        <div class="text-center p-4 bg-yellow-50 rounded-lg">
          <p class="text-sm text-gray-600 mb-1">Proposed Contribution</p>
          <p class="text-lg font-bold text-yellow-600">{formatCurrency(selectedAssessment.proposedAH)}</p>
          <p class="text-xs text-gray-500">
            {selectedAssessment.originalAH > 0 ? Math.round((selectedAssessment.proposedAH / selectedAssessment.originalAH) * 35) : 0}% of GDV
          </p>
        </div>
        <div class="text-center p-4 bg-red-50 rounded-lg">
          <p class="text-sm text-gray-600 mb-1">Shortfall</p>
          <p class="text-lg font-bold text-red-600">{formatCurrency(selectedAssessment.ahValue)}</p>
          <p class="text-xs text-gray-500">
            {selectedAssessment.originalAH > 0 ? Math.round(((selectedAssessment.originalAH - selectedAssessment.proposedAH) / selectedAssessment.originalAH) * 100) : 0}% reduction
          </p>
        </div>
      </div>
    </div>
    
    <!-- Key Assumptions -->
    <div class="card p-6 mb-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Key Assumptions</h3>
      <div class="space-y-3">
        {#each Object.entries(selectedAssessment.keyAssumptions) as [key, value]}
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span class="text-sm text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
            <span class="text-sm font-medium text-gray-900">{value}</span>
          </div>
        {/each}
      </div>
    </div>
    
    <!-- Sensitivity Analysis -->
    <div class="card p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Sensitivity Analysis</h3>
      <div class="space-y-3">
        {#each selectedAssessment.sensitivities as sensitivity}
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-3">
              <span class="text-sm text-gray-900">{sensitivity.parameter}</span>
              <span class="text-sm text-gray-600">{sensitivity.change}</span>
            </div>
            <div class="flex items-center gap-2">
              {#if sensitivity.impact.startsWith('+')}
                <TrendingUp size={16} class="text-green-500" />
                <span class="text-sm font-medium text-green-600">{sensitivity.impact}</span>
              {:else}
                <TrendingDown size={16} class="text-red-500" />
                <span class="text-sm font-medium text-red-600">{sensitivity.impact}</span>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<!-- Right Panel: Assessment Tools -->
<div class="layout-right">
  <div class="p-4">
    <h3 class="font-medium text-gray-900 mb-4">Assessment Tools</h3>
    
    <div class="mb-6">
      <h4 class="text-sm font-medium text-gray-700 mb-3">Viability Summary</h4>
      <div class="space-y-3">
        <div class="p-3 bg-gray-50 rounded-lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-600">Residual Land Value</span>
            <span class="text-sm font-medium text-gray-900">{formatCurrency(selectedAssessment.residualLandValue)}</span>
          </div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-600">Benchmark Land Value</span>
            <span class="text-sm font-medium text-gray-900">{formatCurrency(selectedAssessment.benchmarkLandValue)}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Viability Gap</span>
            <span class="text-sm font-medium text-{selectedAssessment.viabilityGap > 0 ? 'red' : 'green'}-600">
              {selectedAssessment.viabilityGap > 0 ? '-' : ''}{formatCurrency(Math.abs(selectedAssessment.viabilityGap))}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="border-t border-gray-200 pt-4 mb-6">
      <h4 class="text-sm font-medium text-gray-700 mb-3">Obligations</h4>
      <div class="space-y-2">
        <div class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
          <span class="text-sm text-gray-600">S106 Contributions</span>
          <span class="text-sm font-medium text-gray-900">{formatCurrency(selectedAssessment.s106Contributions)}</span>
        </div>
        <div class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
          <span class="text-sm text-gray-600">CIL Liability</span>
          <span class="text-sm font-medium text-gray-900">{formatCurrency(selectedAssessment.cilLiability)}</span>
        </div>
      </div>
    </div>
    
    <div class="border-t border-gray-200 pt-4 mb-6">
      <h4 class="text-sm font-medium text-gray-700 mb-3">Recommendations</h4>
      <div class="space-y-2">
        {#each selectedAssessment.recommendations as recommendation}
          <div class="p-2 bg-blue-50 rounded-lg">
            <p class="text-sm text-blue-800">{recommendation}</p>
          </div>
        {/each}
      </div>
    </div>
    
    <div class="border-t border-gray-200 pt-4">
      <h4 class="text-sm font-medium text-gray-700 mb-3">Actions</h4>
      <div class="space-y-2">
        <button class="btn btn-primary w-full">Challenge Assessment</button>
        <button class="btn btn-secondary w-full">Request Clarification</button>
        <button class="btn btn-secondary w-full">Schedule Review</button>
        <button class="btn btn-secondary w-full">Generate Summary</button>
      </div>
      
      <div class="mt-4 p-3 bg-gray-50 rounded-lg">
        <p class="text-sm text-gray-700">
          <strong>Assessment Quality:</strong> 
          {#if selectedAssessment.status === 'Accepted'}
            Assessment accepted with standard assumptions
          {:else if selectedAssessment.status === 'Challenged'}
            Build costs and profit margins under review
          {:else}
            Currently under technical review
          {/if}
        </p>
      </div>
    </div>
  </div>
</div>
