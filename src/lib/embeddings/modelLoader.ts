import { embeddingsService } from './embedStrings';

export interface ModelLoadingProgress {
  phase: 'downloading' | 'loading' | 'ready' | 'error';
  progress: number; // 0-100
  message: string;
  error?: string;
}

export class ModelLoader {
  private loadingPromise: Promise<void> | null = null;
  private isLoaded = false;
  private progressCallbacks: ((progress: ModelLoadingProgress) => void)[] = [];

  async loadModels(
    onProgress?: (progress: ModelLoadingProgress) => void
  ): Promise<void> {
    if (onProgress) {
      this.progressCallbacks.push(onProgress);
    }

    if (this.isLoaded) {
      onProgress?.({
        phase: 'ready',
        progress: 100,
        message: 'Models ready'
      });
      return;
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = this.loadModelsInternal();
    return this.loadingPromise;
  }

  private async loadModelsInternal(): Promise<void> {
    try {
      this.notifyProgress({
        phase: 'downloading',
        progress: 0,
        message: 'Downloading embedding model...'
      });

      await embeddingsService.initialize();

      this.notifyProgress({
        phase: 'loading',
        progress: 50,
        message: 'Loading embedding model...'
      });

      // Test the model is working
      await embeddingsService.embedSingle('test');

      this.notifyProgress({
        phase: 'ready',
        progress: 100,
        message: 'Models ready'
      });

      this.isLoaded = true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.notifyProgress({
        phase: 'error',
        progress: 0,
        message: 'Failed to load models',
        error: errorMessage
      });
      throw error;
    }
  }

  private notifyProgress(progress: ModelLoadingProgress): void {
    this.progressCallbacks.forEach(callback => callback(progress));
  }

  isReady(): boolean {
    return this.isLoaded;
  }

  getModelInfo(): {
    embedding: {
      name: string;
      dimensions: number;
      maxTokens: number;
    };
  } {
    return {
      embedding: embeddingsService.getModelInfo()
    };
  }
}

export const modelLoader = new ModelLoader();
