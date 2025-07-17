/**
 * Generate a unique chunk ID based on plan ID, page number, and position
 */
export function generateChunkId(planId: string, pageNumber: number, chunkIndex: number): string {
  return `${planId}_p${pageNumber}_c${chunkIndex}`;
}

/**
 * Parse a chunk ID to extract its components
 */
export function parseChunkId(chunkId: string): {
  planId: string;
  pageNumber: number;
  chunkIndex: number;
} | null {
  const match = chunkId.match(/^(.+)_p(\d+)_c(\d+)$/);
  if (!match) return null;
  
  return {
    planId: match[1],
    pageNumber: parseInt(match[2], 10),
    chunkIndex: parseInt(match[3], 10)
  };
}

/**
 * Generate a short, human-readable reference for a chunk
 */
export function generateChunkReference(chunkId: string): string {
  const parsed = parseChunkId(chunkId);
  if (!parsed) return chunkId;
  
  return `#${parsed.pageNumber}.${parsed.chunkIndex}`;
}

/**
 * Generate a unique ID for any entity
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}

/**
 * Generate a plan ID from filename
 */
export function generatePlanId(filename: string): string {
  const sanitized = filename
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[^a-zA-Z0-9]/g, '_') // Replace special chars with underscores
    .toLowerCase();
  
  return `plan_${sanitized}_${Date.now()}`;
}

/**
 * Generate a site ID from name or reference
 */
export function generateSiteId(name: string): string {
  const sanitized = name
    .replace(/[^a-zA-Z0-9]/g, '_')
    .toLowerCase();
  
  return `site_${sanitized}_${Date.now()}`;
}

/**
 * Generate a goal ID from title
 */
export function generateGoalId(title: string): string {
  const sanitized = title
    .replace(/[^a-zA-Z0-9]/g, '_')
    .toLowerCase();
  
  return `goal_${sanitized}_${Date.now()}`;
}

/**
 * Generate a scenario ID from name
 */
export function generateScenarioId(name: string): string {
  const sanitized = name
    .replace(/[^a-zA-Z0-9]/g, '_')
    .toLowerCase();
  
  return `scenario_${sanitized}_${Date.now()}`;
}

/**
 * Extract page number from chunk ID for sorting
 */
export function getPageFromChunkId(chunkId: string): number {
  const parsed = parseChunkId(chunkId);
  return parsed ? parsed.pageNumber : 0;
}

/**
 * Sort chunk IDs by page number and chunk index
 */
export function sortChunkIds(chunkIds: string[]): string[] {
  return chunkIds.sort((a, b) => {
    const parsedA = parseChunkId(a);
    const parsedB = parseChunkId(b);
    
    if (!parsedA || !parsedB) return 0;
    
    if (parsedA.pageNumber !== parsedB.pageNumber) {
      return parsedA.pageNumber - parsedB.pageNumber;
    }
    
    return parsedA.chunkIndex - parsedB.chunkIndex;
  });
}
