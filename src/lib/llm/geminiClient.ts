export interface GeminiConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface GenerateResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class GeminiClient {
  private config: GeminiConfig;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

  constructor(config: GeminiConfig) {
    this.config = config;
  }

  async generateContent(
    messages: ChatMessage[],
    context?: {
      chunks?: Array<{ text: string; source: string }>;
      constraints?: string[];
      siteInfo?: any;
    }
  ): Promise<GenerateResponse> {
    const url = `${this.baseUrl}/${this.config.model}:generateContent?key=${this.config.apiKey}`;
    
    const prompt = this.buildPrompt(messages, context);
    
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxTokens,
        candidateCount: 1
      }
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from Gemini API');
      }

      const content = data.candidates[0].content.parts[0].text;
      
      return {
        content,
        model: this.config.model,
        usage: {
          promptTokens: this.estimateTokens(prompt),
          completionTokens: this.estimateTokens(content),
          totalTokens: this.estimateTokens(prompt) + this.estimateTokens(content)
        }
      };
    } catch (error) {
      console.error('Gemini API request failed:', error);
      throw error;
    }
  }

  private buildPrompt(
    messages: ChatMessage[],
    context?: {
      chunks?: Array<{ text: string; source: string }>;
      constraints?: string[];
      siteInfo?: any;
    }
  ): string {
    let prompt = `You are a planning assistant helping with local plan development and development management.

SYSTEM INSTRUCTIONS:
- Provide accurate, helpful responses based on the provided context
- Always cite sources when referencing plan policies or documents
- Be concise but thorough in your analysis
- Consider planning law, policy, and best practice
- Highlight any conflicts or issues that need attention

`;

    // Add context if provided
    if (context?.chunks && context.chunks.length > 0) {
      prompt += `RELEVANT PLAN CONTENT:\n`;
      context.chunks.forEach((chunk, index) => {
        prompt += `[${index + 1}] ${chunk.source}: ${chunk.text}\n\n`;
      });
    }

    if (context?.constraints && context.constraints.length > 0) {
      prompt += `SITE CONSTRAINTS:\n`;
      context.constraints.forEach(constraint => {
        prompt += `- ${constraint}\n`;
      });
      prompt += `\n`;
    }

    if (context?.siteInfo) {
      prompt += `SITE INFORMATION:\n`;
      prompt += `- Area: ${context.siteInfo.area} hectares\n`;
      prompt += `- Status: ${context.siteInfo.status}\n`;
      if (context.siteInfo.reference) {
        prompt += `- Reference: ${context.siteInfo.reference}\n`;
      }
      prompt += `\n`;
    }

    // Add conversation history
    prompt += `CONVERSATION:\n`;
    messages.forEach(message => {
      const roleLabel = message.role === 'user' ? 'USER' : 'ASSISTANT';
      prompt += `${roleLabel}: ${message.content}\n\n`;
    });

    prompt += `ASSISTANT: `;

    return prompt;
  }

  private estimateTokens(text: string): number {
    // Simple token estimation for usage tracking
    return Math.ceil(text.length / 4);
  }

  updateConfig(config: Partial<GeminiConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): GeminiConfig {
    return { ...this.config };
  }
}

export const createGeminiClient = (apiKey: string): GeminiClient => {
  return new GeminiClient({
    apiKey,
    model: 'gemini-2.0-flash-exp',
    temperature: 0.7,
    maxTokens: 4000
  });
};
