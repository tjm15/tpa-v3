import type { ChatMessage } from './geminiClient';
import type { ChunkEntity } from '../db/entityDb';
import type { SpatialIntersection } from '../spatial/intersect';

export interface PromptContext {
  chunks?: ChunkEntity[];
  constraints?: SpatialIntersection[];
  siteInfo?: {
    name: string;
    area: number;
    status: string;
    reference?: string;
  };
  mode?: 'policy' | 'site' | 'development-management';
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  variables: string[];
}

export class PromptBuilder {
  private templates: Map<string, PromptTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    // Policy analysis template
    this.templates.set('policy-analysis', {
      id: 'policy-analysis',
      name: 'Policy Analysis',
      description: 'Analyze planning policies and their implications',
      systemPrompt: `You are a planning policy expert. Analyze the provided policy content and provide clear, actionable insights.

FOCUS AREAS:
- Policy interpretation and application
- Compliance requirements
- Implementation challenges
- Cross-references to other policies
- Practical guidance for planners

Format your response with clear headings and bullet points where appropriate.`,
      variables: ['policy_content', 'question']
    });

    // Site assessment template
    this.templates.set('site-assessment', {
      id: 'site-assessment',
      name: 'Site Assessment',
      description: 'Assess development sites against planning constraints and policies',
      systemPrompt: `You are a development management expert. Assess the development potential of sites considering all relevant constraints and policies.

ASSESSMENT CRITERIA:
- Planning policy compliance
- Physical constraints (flooding, heritage, etc.)
- Accessibility and sustainability
- Infrastructure capacity
- Deliverability factors

Provide a clear recommendation with supporting rationale.`,
      variables: ['site_info', 'constraints', 'policies']
    });

    // Development management template
    this.templates.set('development-management', {
      id: 'development-management',
      name: 'Development Management',
      description: 'Support development management decisions',
      systemPrompt: `You are a development management officer. Evaluate planning applications against relevant policies and material considerations.

EVALUATION FRAMEWORK:
- Policy compliance assessment
- Material planning considerations
- Precedent analysis
- Conditions and obligations
- Appeal risk assessment

Structure your response as a planning report with clear recommendations.`,
      variables: ['application_details', 'policies', 'constraints', 'precedents']
    });
  }

  buildPrompt(
    messages: ChatMessage[],
    context: PromptContext,
    templateId?: string
  ): string {
    const template = templateId ? this.templates.get(templateId) : null;
    
    let prompt = template?.systemPrompt || `You are a planning assistant helping with local plan development and development management.

SYSTEM INSTRUCTIONS:
- Provide accurate, helpful responses based on the provided context
- Always cite sources when referencing plan policies or documents
- Be concise but thorough in your analysis
- Consider planning law, policy, and best practice
- Highlight any conflicts or issues that need attention`;

    prompt += '\n\n';

    // Add relevant plan content
    if (context.chunks && context.chunks.length > 0) {
      prompt += `RELEVANT PLAN CONTENT:\n`;
      context.chunks.forEach((chunk, index) => {
        const source = chunk.metadata?.policy || chunk.metadata?.section || `Page ${chunk.pageNumber}`;
        prompt += `[${index + 1}] ${source}: ${chunk.text}\n\n`;
      });
    }

    // Add constraint information
    if (context.constraints && context.constraints.length > 0) {
      prompt += `SITE CONSTRAINTS:\n`;
      context.constraints.forEach(constraint => {
        const description = this.formatConstraintDescription(constraint);
        prompt += `- ${constraint.layerName}: ${description}\n`;
      });
      prompt += `\n`;
    }

    // Add site information
    if (context.siteInfo) {
      prompt += `SITE INFORMATION:\n`;
      prompt += `- Name: ${context.siteInfo.name}\n`;
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

  private formatConstraintDescription(constraint: SpatialIntersection): string {
    const { intersectionType, area, percentage } = constraint;
    
    let description = intersectionType;
    
    if (area && percentage) {
      description += ` (${area.toFixed(2)} ha, ${percentage.toFixed(1)}% of site)`;
    } else if (intersectionType === 'contains') {
      description += ` feature within site`;
    } else if (intersectionType === 'intersects') {
      description += ` overlaps with site`;
    }

    return description;
  }

  getTemplate(id: string): PromptTemplate | undefined {
    return this.templates.get(id);
  }

  getAllTemplates(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }

  addTemplate(template: PromptTemplate): void {
    this.templates.set(template.id, template);
  }

  buildCitationPrompt(content: string): string {
    return `Please identify and extract all citations from the following text, returning them in a structured format:

TEXT TO ANALYZE:
${content}

Please return citations in this format:
- [1] Policy Reference / Section Title
- [2] Another Reference

CITATIONS:`;
  }

  buildSummaryPrompt(chunks: ChunkEntity[], maxLength: number = 500): string {
    const content = chunks.map(chunk => chunk.text).join('\n\n');
    
    return `Please provide a concise summary of the following planning document content in ${maxLength} words or less:

CONTENT:
${content}

SUMMARY:`;
  }

  buildComparisonPrompt(items: { name: string; content: string }[]): string {
    let prompt = `Compare and contrast the following planning documents or policies:

`;

    items.forEach((item, index) => {
      prompt += `${index + 1}. ${item.name}:\n${item.content}\n\n`;
    });

    prompt += `Please provide a detailed comparison highlighting:
- Key similarities and differences
- Potential conflicts or contradictions
- Recommendations for alignment
- Best practices identified

COMPARISON:`;

    return prompt;
  }
}

export const promptBuilder = new PromptBuilder();
