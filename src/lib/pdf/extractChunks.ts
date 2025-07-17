import * as pdfjsLib from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js`;

export interface TextChunk {
  text: string;
  pageNumber: number;
  tokenCount: number;
  metadata?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ExtractionProgress {
  page: number;
  totalPages: number;
  chunksCreated: number;
  status: 'loading' | 'extracting' | 'chunking' | 'completed' | 'error';
  error?: string;
}

export class PDFProcessor {
  private readonly MAX_CHUNK_TOKENS = 1000;
  private readonly MIN_CHUNK_TOKENS = 100;
  private readonly OVERLAP_TOKENS = 50;

  async extractChunks(
    file: File,
    onProgress?: (progress: ExtractionProgress) => void
  ): Promise<TextChunk[]> {
    try {
      onProgress?.({ page: 0, totalPages: 0, chunksCreated: 0, status: 'loading' });

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const totalPages = pdf.numPages;

      onProgress?.({ page: 0, totalPages, chunksCreated: 0, status: 'extracting' });

      const allChunks: TextChunk[] = [];
      let previousChunkEnd = '';

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Extract text with positioning
        const pageText = textContent.items
          .filter((item): item is TextItem => 'str' in item)
          .map(item => item.str)
          .join(' ');

        // Create chunks for this page
        const pageChunks = this.createChunks(pageText, pageNum, previousChunkEnd);
        allChunks.push(...pageChunks);

        // Store overlap for next page
        if (pageChunks.length > 0) {
          const lastChunk = pageChunks[pageChunks.length - 1];
          const words = lastChunk.text.split(' ');
          previousChunkEnd = words.slice(-this.OVERLAP_TOKENS).join(' ');
        }

        onProgress?.({ 
          page: pageNum, 
          totalPages, 
          chunksCreated: allChunks.length, 
          status: 'extracting' 
        });
      }

      onProgress?.({ 
        page: totalPages, 
        totalPages, 
        chunksCreated: allChunks.length, 
        status: 'completed' 
      });

      return allChunks;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onProgress?.({ 
        page: 0, 
        totalPages: 0, 
        chunksCreated: 0, 
        status: 'error', 
        error: errorMessage 
      });
      throw error;
    }
  }

  private createChunks(text: string, pageNumber: number, previousEnd: string): TextChunk[] {
    const chunks: TextChunk[] = [];
    const words = text.split(' ').filter(word => word.trim().length > 0);
    
    if (words.length === 0) {
      return chunks;
    }

    let currentChunk = previousEnd ? `${previousEnd} ` : '';
    let currentTokenCount = this.estimateTokens(currentChunk);

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const wordTokens = this.estimateTokens(word);
      
      if (currentTokenCount + wordTokens > this.MAX_CHUNK_TOKENS && currentChunk.trim().length > 0) {
        // Complete current chunk
        chunks.push({
          text: currentChunk.trim(),
          pageNumber,
          tokenCount: currentTokenCount
        });

        // Start new chunk with overlap
        const chunkWords = currentChunk.trim().split(' ');
        const overlapWords = chunkWords.slice(-this.OVERLAP_TOKENS);
        currentChunk = overlapWords.join(' ') + ' ' + word;
        currentTokenCount = this.estimateTokens(currentChunk);
      } else {
        currentChunk += word + ' ';
        currentTokenCount += wordTokens;
      }
    }

    // Add final chunk if it meets minimum size
    if (currentChunk.trim().length > 0 && currentTokenCount >= this.MIN_CHUNK_TOKENS) {
      chunks.push({
        text: currentChunk.trim(),
        pageNumber,
        tokenCount: currentTokenCount
      });
    }

    return chunks;
  }

  private estimateTokens(text: string): number {
    // Simple token estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  async extractMetadata(file: File): Promise<{
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
    pageCount: number;
  }> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const metadata = await pdf.getMetadata();
    
    const info = metadata.info as any;
    
    return {
      title: info?.Title || undefined,
      author: info?.Author || undefined,
      subject: info?.Subject || undefined,
      creator: info?.Creator || undefined,
      producer: info?.Producer || undefined,
      creationDate: info?.CreationDate || undefined,
      modificationDate: info?.ModDate || undefined,
      pageCount: pdf.numPages
    };
  }
}

export const pdfProcessor = new PDFProcessor();
