// Simple in-memory vector database for chunks
// This will be replaced with @babycommando/entity-db when properly typed
import type { PlanChunk } from './settingsDexie';

export interface ChunkEntity extends PlanChunk {
  vector: Float32Array;
}

export interface QueryResult {
  entity: ChunkEntity;
  score: number;
}

export class VectorDatabase {
  private entities: Map<string, ChunkEntity> = new Map();
  private indexedEntities: ChunkEntity[] = [];
  private needsReindex = false;

  async insert(chunk: ChunkEntity): Promise<void> {
    this.entities.set(chunk.id, chunk);
    this.needsReindex = true;
  }

  async insertMany(chunks: ChunkEntity[]): Promise<void> {
    for (const chunk of chunks) {
      this.entities.set(chunk.id, chunk);
    }
    this.needsReindex = true;
  }

  private reindexIfNeeded(): void {
    if (this.needsReindex) {
      this.indexedEntities = Array.from(this.entities.values());
      this.needsReindex = false;
    }
  }

  async query(options: {
    query: string;
    vector?: Float32Array;
    k?: number;
    filter?: (chunk: ChunkEntity) => boolean;
  }): Promise<QueryResult[]> {
    const { query, vector, k = 10, filter } = options;
    
    this.reindexIfNeeded();
    let entities = this.indexedEntities;
    
    if (filter) {
      entities = entities.filter(filter);
    }

    // Early exit if no entities
    if (entities.length === 0) {
      return [];
    }

    // If no vector provided, fall back to keyword search
    if (!vector) {
      return this.keywordSearch(query, entities, k);
    }

    // Calculate cosine similarity with optimized batch processing
    const results: QueryResult[] = [];
    const batchSize = 100;
    
    for (let i = 0; i < entities.length; i += batchSize) {
      const batch = entities.slice(i, i + batchSize);
      
      for (const entity of batch) {
        const score = this.cosineSimilarity(vector, entity.vector);
        results.push({ entity, score });
      }
      
      // Yield control to prevent blocking
      if (i % (batchSize * 4) === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    // Sort by score (highest first) and return top k
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
  }

  private keywordSearch(query: string, entities: ChunkEntity[], k: number): QueryResult[] {
    const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
    
    if (searchTerms.length === 0) {
      return [];
    }

    const results: QueryResult[] = [];
    
    for (const entity of entities) {
      const text = entity.text.toLowerCase();
      let score = 0;
      
      for (const term of searchTerms) {
        const matches = (text.match(new RegExp(term, 'g')) || []).length;
        score += matches * (1 / text.length); // Normalize by text length
      }
      
      if (score > 0) {
        results.push({ entity, score });
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
  }

  private cosineSimilarity(a: Float32Array, b: Float32Array): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    // Optimized loop with manual unrolling for better performance
    const length = a.length;
    let i = 0;
    
    // Process 4 elements at a time
    for (; i < length - 3; i += 4) {
      dotProduct += a[i] * b[i] + a[i + 1] * b[i + 1] + a[i + 2] * b[i + 2] + a[i + 3] * b[i + 3];
      normA += a[i] * a[i] + a[i + 1] * a[i + 1] + a[i + 2] * a[i + 2] + a[i + 3] * a[i + 3];
      normB += b[i] * b[i] + b[i + 1] * b[i + 1] + b[i + 2] * b[i + 2] + b[i + 3] * b[i + 3];
    }
    
    // Handle remaining elements
    for (; i < length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  async getByPlanId(planId: string, k: number = 100): Promise<ChunkEntity[]> {
    const entities = Array.from(this.entities.values());
    return entities
      .filter(chunk => chunk.planId === planId)
      .slice(0, k);
  }

  async deleteByPlanId(planId: string): Promise<void> {
    for (const [id, chunk] of this.entities) {
      if (chunk.planId === planId) {
        this.entities.delete(id);
      }
    }
  }

  async clear(): Promise<void> {
    this.entities.clear();
  }

  async count(): Promise<number> {
    return this.entities.size;
  }

  async getAll(): Promise<ChunkEntity[]> {
    return Array.from(this.entities.values());
  }
}

export const vectorDB = new VectorDatabase();
