<script lang="ts">
  import { MessageSquare, Send, Loader2, Info, Search } from 'lucide-svelte';
  import type { ChatMessage, PlanningApplication } from './types';
  
  export let selectedApplication: PlanningApplication | null;
  export let onSendMessage: (message: string) => Promise<void>;
  
  let chatMessages: ChatMessage[] = [];
  let currentMessage = '';
  let isLoading = false;
  let searchResults: Array<{ text: string; source: string; score: number }> = [];
  let contextualTips: string[] = [];
  
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
      await onSendMessage(messageToSend);
      
      // Mock response for now
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: `I understand you're asking about "${messageToSend}". Let me help you with that planning question.`,
        timestamp: new Date()
      };
      
      chatMessages = [...chatMessages, assistantMessage];
    } catch (error) {
      console.error('Failed to send message:', error);
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
  
  $: smartPrompts = generateSmartPrompts();
</script>

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
    
    <!-- Quick Prompts -->
    <div class="mb-4">
      <h4 class="text-sm font-medium text-gray-700 mb-2">Quick Prompts</h4>
      <div class="space-y-1">
        {#each smartPrompts.slice(0, 3) as prompt}
          <button 
            class="w-full text-left p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded transition-colors"
            on:click={() => useQuickPrompt(prompt)}
          >
            {prompt}
          </button>
        {/each}
      </div>
    </div>
    
    <!-- Search Interface -->
    <div class="relative">
      <input
        type="text"
        placeholder="Search planning policies..."
        class="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        bind:value={currentMessage}
        on:keydown={handleMessageInput}
      />
      <Search size={16} class="absolute left-3 top-2.5 text-gray-400" />
    </div>
    
    <!-- Search Results -->
    {#if searchResults.length > 0}
      <div class="mt-3 space-y-2 max-h-32 overflow-y-auto">
        {#each searchResults as result}
          <button 
            class="w-full p-2 bg-gray-50 hover:bg-gray-100 rounded text-xs text-left transition-colors"
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
        <p>Ask questions about planning policies,</p>
        <p>applications, or get contextual guidance.</p>
      </div>
    {/if}
    
    {#each chatMessages as message}
      <div class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}">
        <div class="max-w-xs lg:max-w-md">
          <div class="p-3 rounded-lg {message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}">
            <p class="text-sm whitespace-pre-wrap">{message.content}</p>
            <div class="text-xs opacity-70 mt-1">
              {message.timestamp.toLocaleTimeString()}
            </div>
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
