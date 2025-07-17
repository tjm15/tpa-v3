import { pipeline, env } from '@xenova/transformers';

// Configure transformers.js to use remote models
env.allowRemoteModels = true;
env.allowLocalModels = false;

export interface EmbeddingResult {
  embeddings: Float32Array[];
  processingTime: number;
}

export class EmbeddingsService {
  private pipeline: any = null;
  private isLoading = false;
  private loadingPromise: Promise<any> | null = null;
  private embeddingCache = new Map<string, Float32Array>();
  private maxCacheSize = 1000;

  async initialize(): Promise<void> {
    if (this.pipeline) return;
    
    if (this.isLoading) {
      await this.loadingPromise;
      return;
    }

    this.isLoading = true;
    this.loadingPromise = this.loadModel();
    
    try {
      this.pipeline = await this.loadingPromise;
      console.log('Embeddings model loaded successfully');
    } finally {
      this.isLoading = false;
      this.loadingPromise = null;
    }
  }

  private async loadModel(): Promise<any> {
    try {
      // Use MiniLM for fast, lightweight embeddings
      const pipeline = await import('@xenova/transformers').then(mod => 
        mod.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
      );
      return pipeline;
    } catch (error) {
      console.warn('Failed to load embedding model:', error);
      throw error;
    }
  }

  async embedStrings(
    texts: string[],
    onProgress?: (processed: number, total: number) => void
  ): Promise<EmbeddingResult> {
    if (!this.pipeline) {
      await this.initialize();
    }

    const startTime = performance.now();
    const embeddings: Float32Array[] = [];

    // Process in batches to avoid memory issues
    const batchSize = 32;
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      
      // Generate embeddings for batch
      const batchResults = await this.pipeline(batch, {
        pooling: 'mean',
        normalize: true
      });

      // Convert to Float32Array
      for (let j = 0; j < batch.length; j++) {
        const embedding = batchResults[j];
        embeddings.push(new Float32Array(embedding.data));
      }

      onProgress?.(Math.min(i + batchSize, texts.length), texts.length);
    }

    const processingTime = performance.now() - startTime;

    return {
      embeddings,
      processingTime
    };
  }

  async embedSingle(text: string): Promise<Float32Array> {
    if (!this.pipeline) {
      await this.initialize();
    }

    // Check cache first
    const cacheKey = text.trim();
    if (this.embeddingCache.has(cacheKey)) {
      return this.embeddingCache.get(cacheKey)!;
    }

    const result = await this.pipeline(text, {
      pooling: 'mean',
      normalize: true
    });

    const embedding = new Float32Array(result.data);
    
    // Cache the result
    this.cacheEmbedding(cacheKey, embedding);
    
    return embedding;
  }

  private cacheEmbedding(key: string, embedding: Float32Array): void {
    // Simple LRU cache implementation
    if (this.embeddingCache.size >= this.maxCacheSize) {
      const firstKey = this.embeddingCache.keys().next().value;
      if (firstKey) {
        this.embeddingCache.delete(firstKey);
      }
    }
    this.embeddingCache.set(key, embedding);
  }

  clearCache(): void {
    this.embeddingCache.clear();
  }

  getCacheSize(): number {
    return this.embeddingCache.size;
  }

  isReady(): boolean {
    return this.pipeline !== null;
  }

  getModelInfo(): {
    name: string;
    dimensions: number;
    maxTokens: number;
  } {
    return {
      name: 'all-MiniLM-L6-v2',
      dimensions: 384,
      maxTokens: 512
    };
  }
}

export const embeddingsService = new EmbeddingsService();
