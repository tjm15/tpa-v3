<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    Search, 
    MapPin, 
    FileText, 
    Gavel, 
    TrendingUp,
    ChevronDown,
    ChevronRight,
    MessageSquare,
    Send,
    Loader2,
    Clock,
    CheckCircle,
    AlertCircle,
    Plus,
    Filter,
    Calendar,
    User,
    Building,
    Eye,
    Edit,
    Download,
    Upload,
    Settings,
    BarChart3,
    Target,
    AlertTriangle,
    Info
  } from 'lucide-svelte';
  import { createGeminiClient, type ChatMessage } from '../lib/llm/geminiClient';
  import { EmbeddingsService } from '../lib/embeddings/embedStrings';
  import { VectorDatabase, type ChunkEntity } from '../lib/db/entityDb';
  
  // Custom interface for our enhanced chunks with source
  interface SearchChunk extends ChunkEntity {
    source: string;
  }
  
  // Application data structure
  interface PlanningApplication {
    id: string;
    reference: string;
    address: string;
    applicant: string;
    description: string;
    type: 'full' | 'outline' | 'reserved' | 'householder' | 'listed' | 'change_of_use';
    status: 'received' | 'under_review' | 'consultation' | 'determination' | 'decided';
    submittedDate: Date;
    targetDate: Date;
    officer: string;
    ward: string;
    parish?: string;
    constraints: string[];
    documents: ApplicationDocument[];
    consultations: Consultation[];
    assessments: {
      siteAssessment?: AssessmentStatus;
      policyCompliance?: AssessmentStatus;
      consultationReview?: AssessmentStatus;
      recommendation?: AssessmentStatus;
    };
  }
  
  interface ApplicationDocument {
    id: string;
    name: string;
    type: 'plan' | 'form' | 'statement' | 'report' | 'photo' | 'other';
    uploadDate: Date;
    size: number;
    processed?: boolean;
  }
  
  interface Consultation {
    id: string;
    consultee: string;
    type: 'statutory' | 'non_statutory' | 'neighbour';
    sentDate: Date;
    responseDate?: Date;
    response?: 'support' | 'object' | 'neutral' | 'no_response';
    comments?: string;
  }
  
  interface AssessmentStatus {
    status: 'not_started' | 'in_progress' | 'complete' | 'review_required';
    assignedTo?: string;
    lastUpdated: Date;
    notes?: string;
    aiInsights?: string[];
  }
  
  // Panel state
  let expandedPanels = new Set<string>(['overview']);
  let selectedApplication: PlanningApplication | null = null;
  let activeWorkspace: 'dashboard' | 'application' | 'search' | 'analytics' = 'dashboard';
  
  // AI Assistant state
  let chatMessages: ChatMessage[] = [];
  let currentMessage = '';
  let isLoading = false;
  let geminiClient: any = null;
  let embeddingsService: EmbeddingsService | null = null;
  let vectorDB: VectorDatabase | null = null;
  let searchQuery = '';
  let searchResults: Array<{ text: string; source: string; score: number }> = [];
  let isSearching = false;
  let contextualTips: string[] = [];
  
  // Mock data for demonstration
  let applications: PlanningApplication[] = [
    {
      id: 'app-001',
      reference: '24/00123/FUL',
      address: '15 Oak Street, Townville, TV1 2AB',
      applicant: 'Smith Development Ltd',
      description: 'Erection of 2 storey rear extension and single storey side extension',
      type: 'householder',
      status: 'under_review',
      submittedDate: new Date('2024-01-15'),
      targetDate: new Date('2024-03-15'),
      officer: 'Sarah Wilson',
      ward: 'Central Ward',
      constraints: ['Conservation Area', 'Article 4 Direction'],
      documents: [
        { id: 'doc-1', name: 'Application Form', type: 'form', uploadDate: new Date('2024-01-15'), size: 2048, processed: true },
        { id: 'doc-2', name: 'Site Plan', type: 'plan', uploadDate: new Date('2024-01-15'), size: 5120, processed: true },
        { id: 'doc-3', name: 'Proposed Plans', type: 'plan', uploadDate: new Date('2024-01-15'), size: 8192, processed: false }
      ],
      consultations: [
        { id: 'con-1', consultee: 'Conservation Officer', type: 'statutory', sentDate: new Date('2024-01-16'), responseDate: new Date('2024-01-25'), response: 'neutral', comments: 'No objections subject to materials condition' },
        { id: 'con-2', consultee: 'Neighbour - 13 Oak Street', type: 'neighbour', sentDate: new Date('2024-01-16'), response: 'no_response' }
      ],
      assessments: {
        siteAssessment: { status: 'complete', assignedTo: 'Sarah Wilson', lastUpdated: new Date('2024-01-20'), notes: 'Site visit completed. No access issues.' },
        policyCompliance: { status: 'in_progress', assignedTo: 'Sarah Wilson', lastUpdated: new Date('2024-01-22') },
        consultationReview: { status: 'not_started', lastUpdated: new Date('2024-01-15') }
      }
    },
    {
      id: 'app-002',
      reference: '24/00156/OUT',
      address: 'Land adjacent to High Street, Townville',
      applicant: 'Greenfield Homes',
      description: 'Outline application for residential development of up to 50 dwellings',
      type: 'outline',
      status: 'consultation',
      submittedDate: new Date('2024-01-20'),
      targetDate: new Date('2024-04-20'),
      officer: 'Michael Chen',
      ward: 'North Ward',
      constraints: ['Green Belt', 'Flood Zone 2', 'Tree Preservation Order'],
      documents: [
        { id: 'doc-4', name: 'Planning Statement', type: 'statement', uploadDate: new Date('2024-01-20'), size: 12288, processed: true },
        { id: 'doc-5', name: 'Transport Assessment', type: 'report', uploadDate: new Date('2024-01-20'), size: 15360, processed: true }
      ],
      consultations: [
        { id: 'con-3', consultee: 'Highways Authority', type: 'statutory', sentDate: new Date('2024-01-22'), response: 'no_response' },
        { id: 'con-4', consultee: 'Environment Agency', type: 'statutory', sentDate: new Date('2024-01-22'), response: 'no_response' }
      ],
      assessments: {
        siteAssessment: { status: 'in_progress', assignedTo: 'Michael Chen', lastUpdated: new Date('2024-01-25') },
        policyCompliance: { status: 'not_started', lastUpdated: new Date('2024-01-20') }
      }
    }
  ];
  
  // Development Management workspaces
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
      description: 'Policy review, compliance checking, and guidance application',
    },
    {
      id: 'consultation',
      title: 'Consultation Management',
      icon: User,
      description: 'Statutory and public consultation tracking and analysis',
    },
    {
      id: 'decision-framework',
      title: 'Decision Framework',
      icon: Target,
      description: 'Planning balance, recommendation drafting, and decision reasoning',
    }
  ];
  
  function togglePanel(panelId: string) {
    if (expandedPanels.has(panelId)) {
      expandedPanels.delete(panelId);
    } else {
      expandedPanels.add(panelId);
    }
    expandedPanels = new Set(expandedPanels);
  }
  
  function selectApplication(app: PlanningApplication) {
    selectedApplication = app;
    activeWorkspace = 'application';
    generateContextualTips(app);
    // Auto-search for relevant policies based on application
    searchQuery = `${app.type} ${app.constraints.join(' ')} planning policy`;
    performSearch();
  }
  
  function generateContextualTips(app: PlanningApplication) {
    contextualTips = [];
    
    if (app.constraints.includes('Conservation Area')) {
      contextualTips.push('Consider heritage impact assessment requirements');
      contextualTips.push('Check for Article 4 directions and permitted development rights');
    }
    
    if (app.constraints.includes('Green Belt')) {
      contextualTips.push('Assess against Green Belt purposes and very special circumstances');
      contextualTips.push('Consider alternatives outside Green Belt');
    }
    
    if (app.type === 'outline') {
      contextualTips.push('Ensure reserved matters are clearly defined');
      contextualTips.push('Consider phasing and infrastructure delivery');
    }
    
    if (app.status === 'consultation') {
      contextualTips.push('Monitor consultation responses and response rates');
      contextualTips.push('Follow up on outstanding statutory consultations');
    }
  }
  
  function getStatusColor(status: string): string {
    switch (status) {
      case 'received': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'consultation': return 'bg-purple-100 text-purple-800';
      case 'determination': return 'bg-orange-100 text-orange-800';
      case 'decided': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  function getAssessmentStatusIcon(status: AssessmentStatus['status']) {
    switch (status) {
      case 'complete': return CheckCircle;
      case 'in_progress': return Clock;
      case 'review_required': return AlertTriangle;
      default: return AlertCircle;
    }
  }
  
  function getAssessmentStatusColor(status: AssessmentStatus['status']): string {
    switch (status) {
      case 'complete': return 'text-green-600';
      case 'in_progress': return 'text-yellow-600';
      case 'review_required': return 'text-red-600';
      default: return 'text-gray-400';
    }
  }
  
  async function initializeAI() {
    try {
      // Initialize Gemini client - in production, this would come from settings
      const apiKey = localStorage.getItem('gemini_api_key');
      if (apiKey) {
        geminiClient = createGeminiClient(apiKey);
      }
      
      // Initialize embeddings service and vector database
      embeddingsService = new EmbeddingsService();
      await embeddingsService.initialize();
      
      vectorDB = new VectorDatabase();
      
      // Load sample data for demonstration
      await loadSampleData();
      
      console.log('AI services initialized');
    } catch (error) {
      console.error('Failed to initialize AI services:', error);
    }
  }
  
  async function loadSampleData() {
    if (!embeddingsService || !vectorDB) return;
    
    const sampleChunks = [
      {
        id: 'policy-h1',
        text: 'Housing policies should ensure adequate provision for affordable housing within new developments. A minimum of 30% affordable housing is required on sites of 10 or more dwellings.',
        source: 'Local Plan Policy H1: Affordable Housing',
        pageNumber: 45,
        planId: 'local-plan-2024',
        createdAt: new Date()
      },
      {
        id: 'policy-dm1',
        text: 'Development management decisions must consider the impact on existing infrastructure including highways, utilities, and community facilities. Adequate capacity must be demonstrated.',
        source: 'Development Management Policy DM1: Infrastructure',
        pageNumber: 78,
        planId: 'local-plan-2024',
        createdAt: new Date()
      },
      {
        id: 'site-assessment',
        text: 'Site assessment should include evaluation of transport links, accessibility to services, environmental constraints, and landscape impact. Heritage assets must be given special consideration.',
        source: 'Site Assessment Methodology',
        pageNumber: 12,
        planId: 'guidance-2024',
        createdAt: new Date()
      },
      {
        id: 'design-standards',
        text: 'New development should achieve high quality design that responds to local character and distinctiveness. Building heights should respect the existing streetscape and surrounding development.',
        source: 'Design Standards SPD',
        pageNumber: 23,
        planId: 'spd-2024',
        createdAt: new Date()
      },
      {
        id: 'green-belt',
        text: 'Development in the Green Belt should be strictly controlled. Very special circumstances must be demonstrated for inappropriate development. The openness of the Green Belt must be preserved.',
        source: 'Green Belt Policy GB1',
        pageNumber: 89,
        planId: 'local-plan-2024',
        createdAt: new Date()
      }
    ];
    
    try {
      // Generate embeddings for sample chunks
      const texts = sampleChunks.map(chunk => chunk.text);
      const embeddings = await embeddingsService.embedStrings(texts);
      
      // Insert chunks with embeddings into vector database
      const chunkEntities: SearchChunk[] = sampleChunks.map((chunk, index) => ({
        ...chunk,
        vector: embeddings.embeddings[index]
      }));
      
      await vectorDB.insertMany(chunkEntities);
      console.log('Sample data loaded successfully');
    } catch (error) {
      console.error('Failed to load sample data:', error);
    }
  }
  
  async function sendMessage() {
    if (!currentMessage.trim() || isLoading) return;
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    };
    
    chatMessages = [...chatMessages, userMessage];
    const messageToSend = currentMessage;
    currentMessage = '';
    isLoading = true;
    
    try {
      if (geminiClient) {
        // Get relevant context from search results if available
        const context = searchResults.length > 0 ? {
          chunks: searchResults.map(r => ({ text: r.text, source: r.source }))
        } : undefined;
        
        const response = await geminiClient.generateContent([userMessage], context);
        
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.content,
          timestamp: new Date()
        };
        
        chatMessages = [...chatMessages, assistantMessage];
      } else {
        // Fallback response if no API key
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: 'AI assistant not configured. Please add your Gemini API key in settings to enable AI responses.',
          timestamp: new Date()
        };
        chatMessages = [...chatMessages, assistantMessage];
      }
    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      chatMessages = [...chatMessages, errorMessage];
    } finally {
      isLoading = false;
    }
  }
  
  async function performSearch() {
    if (!searchQuery.trim() || isSearching) return;
    
    isSearching = true;
    searchResults = [];
    
    try {
      if (embeddingsService && vectorDB) {
        // Generate embedding for the search query
        const queryVector = await embeddingsService.embedSingle(searchQuery);
        
        // Search the vector database
        const results = await vectorDB.query({
          query: searchQuery,
          vector: queryVector,
          k: 5
        });
        
        // Convert results to our format
        searchResults = results.map(result => ({
          text: result.entity.text.substring(0, 150) + '...',
          source: (result.entity as SearchChunk).source || 'Unknown',
          score: result.score
        }));
        
        // If no vector results, fall back to sample results for demo
        if (searchResults.length === 0) {
          searchResults = [
            {
              text: `Sample result for "${searchQuery}": Planning policies should ensure adequate provision...`,
              source: "Local Plan Policy",
              score: 0.85
            },
            {
              text: `Sample result for "${searchQuery}": Development management decisions must consider...`,
              source: "Development Management Guide",
              score: 0.72
            }
          ];
        }
      } else {
        // Fallback demo results
        searchResults = [
          {
            text: `Sample result for "${searchQuery}": Housing policies should ensure adequate provision for affordable housing...`,
            source: "Local Plan Policy H1",
            score: 0.89
          },
          {
            text: `Sample result for "${searchQuery}": Development management decisions must consider the impact on existing infrastructure...`,
            source: "Development Management Guide",
            score: 0.76
          },
          {
            text: `Sample result for "${searchQuery}": Site assessment should include evaluation of transport links and accessibility...`,
            source: "Site Assessment Methodology",
            score: 0.72
          }
        ];
      }
    } catch (error) {
      console.error('Search failed:', error);
      // Show fallback results even on error
      searchResults = [
        {
          text: `Error searching for "${searchQuery}". Please check your configuration.`,
          source: "System Message",
          score: 0.0
        }
      ];
    } finally {
      isSearching = false;
    }
  }
  
  function handleSearchInput(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      performSearch();
    }
  }
  
  function handleMessageInput(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }
  
  function useQuickPrompt(prompt: string) {
    currentMessage = prompt;
    sendMessage();
  }
  
  function addSearchResultToContext(result: any) {
    const contextPrompt = selectedApplication 
      ? `For application ${selectedApplication.reference}, please explain how this policy applies: "${result.text}" from ${result.source}`
      : `Please explain this policy: "${result.text}" from ${result.source}`;
    currentMessage = contextPrompt;
    sendMessage();
  }
  
  function askAIAboutApplication(app: PlanningApplication, question: string) {
    const contextPrompt = `For planning application ${app.reference} (${app.description}) at ${app.address}, ${question}`;
    currentMessage = contextPrompt;
    sendMessage();
  }
  
  function generateSmartPrompts(): string[] {
    if (!selectedApplication) {
      return [
        "What are the current planning policy priorities?",
        "How should I approach Green Belt assessments?",
        "What are the key consultation requirements?",
        "How do I assess heritage impact?",
        "What infrastructure considerations apply?"
      ];
    }
    
    const app = selectedApplication;
    const prompts = [
      `What are the key policy considerations for ${app.type} applications?`,
      `How should I assess the planning balance for this application?`
    ];
    
    if (app.constraints.includes('Conservation Area')) {
      prompts.push('What heritage assessment is required for this conservation area application?');
    }
    
    if (app.constraints.includes('Green Belt')) {
      prompts.push('How do I assess very special circumstances for Green Belt development?');
    }
    
    if (app.type === 'outline') {
      prompts.push('What conditions should I consider for outline planning permission?');
    }
    
    prompts.push(`What consultation requirements apply to ${app.type} applications?`);
    
    return prompts;
  }
  
  onMount(() => {
    console.log('DM Overview initialized');
    initializeAI();
  });
</script>

<div class="dm-overview">
  <!-- Top Navigation Bar -->
  <div class="bg-white border-b border-gray-200 px-6 py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <h1 class="text-xl font-semibold text-gray-900">Development Management</h1>
        {#if selectedApplication}
          <div class="flex items-center gap-2">
            <ChevronRight size={16} class="text-gray-400" />
            <span class="text-lg font-medium text-gray-700">{selectedApplication.reference}</span>
            <span class="px-2 py-1 text-xs rounded-full {getStatusColor(selectedApplication.status)}">
              {selectedApplication.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        {/if}
      </div>
      
      <div class="flex items-center gap-3">
        <button class="btn btn-secondary" on:click={() => { activeWorkspace = 'dashboard'; selectedApplication = null; }}>
          <BarChart3 size={16} />
          Dashboard
        </button>
        <button class="btn btn-secondary" on:click={() => activeWorkspace = 'search'}>
          <Search size={16} />
          Policy Search
        </button>
        <button class="btn btn-primary">
          <Plus size={16} />
          New Application
        </button>
      </div>
    </div>
  </div>

  <div class="flex h-full">
    <!-- Main Content Area -->
    <div class="flex-1 overflow-hidden">
      {#if activeWorkspace === 'dashboard'}
        <!-- Dashboard View -->
        <div class="p-6 space-y-6 overflow-y-auto h-full">
          <!-- Quick Stats -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <p class="text-2xl font-semibold text-red-600">0</p>
                </div>
                <AlertTriangle class="text-red-600" size={24} />
              </div>
            </div>
          </div>

          <!-- Applications List -->
          <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Current Applications</h2>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Officer</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  {#each applications as app}
                    <tr class="hover:bg-gray-50 cursor-pointer" on:click={() => selectApplication(app)}>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{app.reference}</td>
                      <td class="px-6 py-4 text-sm text-gray-900">{app.address}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.type.replace('_', ' ')}</td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 py-1 text-xs rounded-full {getStatusColor(app.status)}">
                          {app.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.officer}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.targetDate.toLocaleDateString()}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <button class="text-blue-600 hover:text-blue-800" on:click|stopPropagation={() => selectApplication(app)}>
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      {:else if activeWorkspace === 'application' && selectedApplication}
        <!-- Application Detail View -->
        <div class="flex h-full">
          <!-- Left Panel - Application Details -->
          <div class="w-2/3 p-6 overflow-y-auto space-y-6">
            <!-- Application Header -->
            <div class="bg-white rounded-lg border border-gray-200 p-6">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h2 class="text-xl font-semibold text-gray-900">{selectedApplication.reference}</h2>
                  <p class="text-gray-600 mt-1">{selectedApplication.description}</p>
                  <p class="text-sm text-gray-500 mt-2">{selectedApplication.address}</p>
                </div>
                <div class="text-right">
                  <span class="px-3 py-1 text-sm rounded-full {getStatusColor(selectedApplication.status)}">
                    {selectedApplication.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <p class="text-sm text-gray-500 mt-2">Target: {selectedApplication.targetDate.toLocaleDateString()}</p>
                </div>
              </div>
              
              <!-- Application Meta -->
              <div class="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span class="text-gray-500">Applicant:</span>
                  <p class="font-medium">{selectedApplication.applicant}</p>
                </div>
                <div>
                  <span class="text-gray-500">Officer:</span>
                  <p class="font-medium">{selectedApplication.officer}</p>
                </div>
                <div>
                  <span class="text-gray-500">Ward:</span>
                  <p class="font-medium">{selectedApplication.ward}</p>
                </div>
              </div>
              
              <!-- Constraints -->
              {#if selectedApplication.constraints.length > 0}
                <div class="mt-4">
                  <span class="text-sm text-gray-500">Constraints:</span>
                  <div class="flex flex-wrap gap-2 mt-2">
                    {#each selectedApplication.constraints as constraint}
                      <span class="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">{constraint}</span>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>

            <!-- Assessment Progress -->
            <div class="bg-white rounded-lg border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Assessment Progress</h3>
              <div class="space-y-4">
                {#each Object.entries(selectedApplication.assessments) as [key, assessment]}
                  {#if assessment}
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div class="flex items-center gap-3">
                        <svelte:component this={getAssessmentStatusIcon(assessment.status)} size={20} class={getAssessmentStatusColor(assessment.status)} />
                        <div>
                          <p class="font-medium text-gray-900">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
                          {#if assessment.assignedTo}
                            <p class="text-sm text-gray-500">Assigned to: {assessment.assignedTo}</p>
                          {/if}
                        </div>
                      </div>
                      <div class="text-right">
                        <p class="text-sm text-gray-500">Last updated: {assessment.lastUpdated.toLocaleDateString()}</p>
                        {#if assessment.notes}
                          <p class="text-xs text-gray-400 mt-1">{assessment.notes}</p>
                        {/if}
                      </div>
                    </div>
                  {/if}
                {/each}
              </div>
            </div>

            <!-- Workspace Panels -->
            <div class="space-y-4">
              {#each dmWorkspaces as workspace}
                <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <button 
                    class="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    on:click={() => togglePanel(workspace.id)}
                  >
                    <div class="flex items-center gap-3">
                      <svelte:component this={workspace.icon} size={20} class="text-blue-600" />
                      <div class="text-left">
                        <h4 class="font-semibold text-gray-900">{workspace.title}</h4>
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
                              <h5 class="font-medium text-gray-900">Documents ({selectedApplication.documents.length})</h5>
                              {#each selectedApplication.documents as doc}
                                <div class="flex items-center justify-between p-2 bg-white rounded border">
                                  <span class="text-sm">{doc.name}</span>
                                  <div class="flex items-center gap-2">
                                    {#if doc.processed}
                                      <CheckCircle size={14} class="text-green-600" />
                                    {:else}
                                      <Clock size={14} class="text-yellow-600" />
                                    {/if}
                                    <button class="text-blue-600"><Eye size={14} /></button>
                                  </div>
                                </div>
                              {/each}
                            </div>
                            <div class="space-y-3">
                              <h5 class="font-medium text-gray-900">Consultations ({selectedApplication.consultations.length})</h5>
                              {#each selectedApplication.consultations as consultation}
                                <div class="p-2 bg-white rounded border">
                                  <div class="flex items-center justify-between">
                                    <span class="text-sm font-medium">{consultation.consultee}</span>
                                    <span class="text-xs px-2 py-1 rounded {consultation.response === 'no_response' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}">
                                      {consultation.response || 'Pending'}
                                    </span>
                                  </div>
                                  <p class="text-xs text-gray-500 mt-1">Sent: {consultation.sentDate.toLocaleDateString()}</p>
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
                            <button class="btn btn-secondary p-4 text-left" on:click={() => selectedApplication && askAIAboutApplication(selectedApplication, 'What site assessment considerations apply?')}>
                              <Search size={20} class="mb-2" />
                              <h6 class="font-medium">AI Site Analysis</h6>
                              <p class="text-sm text-gray-600">Get AI-powered site insights</p>
                            </button>
                          </div>
                          
                        {:else if workspace.id === 'policy-analysis'}
                          <!-- Policy Analysis Tools -->
                          <div class="space-y-3">
                            <button class="btn btn-secondary w-full p-3" on:click={() => selectedApplication && askAIAboutApplication(selectedApplication, 'What policies apply to this application?')}>
                              <FileText size={16} class="mr-2" />
                              Analyze Applicable Policies
                            </button>
                            <button class="btn btn-secondary w-full p-3" on:click={() => selectedApplication && askAIAboutApplication(selectedApplication, 'How do I assess policy compliance?')}>
                              <CheckCircle size={16} class="mr-2" />
                              Check Policy Compliance
                            </button>
                          </div>
                          
                        {:else if workspace.id === 'consultation'}
                          <!-- Consultation Management -->
                          <div class="space-y-3">
                            <button class="btn btn-primary w-full p-3">
                              <Send size={16} class="mr-2" />
                              Send Outstanding Consultations
                            </button>
                            <button class="btn btn-secondary w-full p-3" on:click={() => selectedApplication && askAIAboutApplication(selectedApplication, 'How should I analyze consultation responses?')}>
                              <BarChart3 size={16} class="mr-2" />
                              Analyze Consultation Responses
                            </button>
                          </div>
                          
                        {:else if workspace.id === 'decision-framework'}
                          <!-- Decision Framework -->
                          <div class="space-y-3">
                            <button class="btn btn-secondary w-full p-3" on:click={() => selectedApplication && askAIAboutApplication(selectedApplication, 'Help me assess the planning balance for this application')}>
                              <Target size={16} class="mr-2" />
                              Planning Balance Assessment
                            </button>
                            <button class="btn btn-secondary w-full p-3" on:click={() => selectedApplication && askAIAboutApplication(selectedApplication, 'What should I consider for the recommendation?')}>
                              <Edit size={16} class="mr-2" />
                              Draft Recommendation
                            </button>
                          </div>
                        {/if}
                      </div>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>

          <!-- Right Panel - AI Assistant -->
          <div class="w-1/3 bg-white border-l border-gray-200 flex flex-col">
            <div class="p-4 border-b border-gray-200">
              <div class="flex items-center gap-2 mb-3">
                <MessageSquare size={20} class="text-blue-600" />
                <h3 class="font-semibold text-gray-900">AI Planning Assistant</h3>
              </div>
              
              <!-- Contextual Tips -->
              {#if contextualTips.length > 0}
                <div class="mb-4">
                  <h4 class="text-sm font-medium text-gray-700 mb-2">Contextual Tips</h4>
                  <div class="space-y-2">
                    {#each contextualTips as tip}
                      <div class="flex items-start gap-2 p-2 bg-blue-50 rounded text-sm">
                        <Info size={14} class="text-blue-600 mt-0.5 flex-shrink-0" />
                        <span class="text-blue-800">{tip}</span>
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}
              
              <!-- Search Interface -->
              <div class="relative">
                <input
                  type="text"
                  placeholder="Search planning policies..."
                  class="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  bind:value={searchQuery}
                  on:keydown={handleSearchInput}
                />
                <Search size={16} class="absolute left-3 top-2.5 text-gray-400" />
                {#if isSearching}
                  <Loader2 size={16} class="absolute right-3 top-2.5 text-blue-500 animate-spin" />
                {/if}
              </div>
              
              <!-- Search Results -->
              {#if searchResults.length > 0}
                <div class="mt-3 space-y-2 max-h-32 overflow-y-auto">
                  {#each searchResults as result}
                    <button 
                      class="w-full p-2 bg-gray-50 hover:bg-gray-100 rounded text-xs text-left transition-colors"
                      on:click={() => addSearchResultToContext(result)}
                    >
                      <div class="font-medium text-gray-700 truncate">{result.source}</div>
                      <div class="text-gray-600 truncate">{result.text}</div>
                      <div class="flex items-center gap-1 mt-1">
                        <div class="w-12 h-1 bg-gray-200 rounded">
                          <div class="h-full bg-blue-500 rounded" style="width: {result.score * 100}%"></div>
                        </div>
                        <span class="text-gray-500">{Math.round(result.score * 100)}%</span>
                      </div>
                    </button>
                  {/each}
                </div>
              {/if}
            </div>
            
            <!-- Chat Messages -->
            <div class="flex-1 p-4 space-y-3 overflow-y-auto">
              {#if chatMessages.length === 0}
                <div class="text-center text-gray-500 text-sm mt-4">
                  <MessageSquare size={32} class="mx-auto text-gray-300 mb-2" />
                  <p>Ask me about planning policies, procedures, or this specific application.</p>
                  
                  <div class="mt-4 space-y-2">
                    <p class="text-xs font-medium text-gray-700">Suggested questions:</p>
                    {#each generateSmartPrompts() as prompt}
                      <button 
                        class="block w-full text-left p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded border text-gray-700 transition-colors"
                        on:click={() => useQuickPrompt(prompt)}
                      >
                        {prompt}
                      </button>
                    {/each}
                  </div>
                </div>
              {/if}
              
              {#each chatMessages as message}
                <div class="flex gap-2 {message.role === 'user' ? 'justify-end' : 'justify-start'}">
                  <div class="max-w-[85%] p-3 rounded-lg {message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'}">
                    <div class="text-sm whitespace-pre-wrap">{message.content}</div>
                    <div class="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              {/each}
              
              {#if isLoading}
                <div class="flex justify-start">
                  <div class="bg-gray-100 p-3 rounded-lg">
                    <Loader2 size={16} class="animate-spin text-gray-500" />
                  </div>
                </div>
              {/if}
            </div>
            
            <!-- Message Input -->
            <div class="p-4 border-t border-gray-200">
              <div class="flex gap-2">
                <textarea
                  placeholder="Ask about this application or planning policies..."
                  class="flex-1 p-2 border border-gray-300 rounded-md text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="2"
                  bind:value={currentMessage}
                  on:keydown={handleMessageInput}
                  disabled={isLoading}
                ></textarea>
                <button 
                  class="btn btn-primary px-3"
                  on:click={sendMessage}
                  disabled={isLoading || !currentMessage.trim()}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

      {:else if activeWorkspace === 'search'}
        <!-- Policy Search View -->
        <div class="p-6">
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Policy & Guidance Search</h2>
            <div class="space-y-4">
              <div class="relative">
                <input
                  type="text"
                  placeholder="Search planning policies, guidance, and precedents..."
                  class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  bind:value={searchQuery}
                  on:keydown={handleSearchInput}
                />
                <Search size={24} class="absolute left-4 top-3.5 text-gray-400" />
              </div>
              
              {#if searchResults.length > 0}
                <div class="space-y-3">
                  {#each searchResults as result}
                    <button 
                      class="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
                      on:click={() => addSearchResultToContext(result)}
                    >
                      <div class="flex items-start justify-between">
                        <div class="flex-1">
                          <h4 class="font-medium text-gray-900">{result.source}</h4>
                          <p class="text-gray-600 mt-1">{result.text}</p>
                        </div>
                        <div class="ml-4 text-right">
                          <div class="text-sm text-gray-500">Relevance: {Math.round(result.score * 100)}%</div>
                          <div class="w-16 h-2 bg-gray-200 rounded mt-1">
                            <div class="h-full bg-blue-500 rounded" style="width: {result.score * 100}%"></div>
                          </div>
                        </div>
                      </div>
                    </button>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .dm-overview {
    height: 100%;
    padding: 1.5rem;
    background: #f8fafc;
  }
  
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;
    border: 1px solid transparent;
    font-size: 0.875rem;
    font-weight: 500;
    border-radius: 0.375rem;
    outline: none;
    transition: all 0.15s ease-in-out;
    cursor: pointer;
  }
  
  .btn:focus {
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  .btn-primary {
    color: white;
    background-color: #2563eb;
    border-color: #2563eb;
  }
  
  .btn-primary:hover {
    background-color: #1d4ed8;
    border-color: #1d4ed8;
  }
  
  .btn-secondary {
    color: #374151;
    background-color: #f3f4f6;
    border-color: #d1d5db;
  }
  
  .btn-secondary:hover {
    background-color: #e5e7eb;
  }
  
  .btn-primary:disabled {
    background-color: #d1d5db;
    border-color: #d1d5db;
    cursor: not-allowed;
  }
</style>
