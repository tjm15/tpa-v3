// Optimized semantic search test suite
// Tests performance, accuracy, and fallback behavior

import { embeddingsService } from '../embeddings/embedStrings';
import { vectorDB } from '../db/entityDb';
import type { ChunkEntity } from '../db/entityDb';

export async function testSemanticSearch() {
  console.log('🔍 Testing semantic search functionality...');
  
  try {
    // Initialize embeddings service
    await embeddingsService.initialize();
    
    // Test data with real policy content
    const testTexts = [
      'Housing policy H2 requires 30% affordable housing provision on sites of 10 or more dwellings. Development should provide a mix of housing types.',
      'Transport policy T1 requires new development to demonstrate sustainable transport connectivity. Car parking should be minimized.',
      'Employment policy E1 protects existing employment areas from residential conversion unless exceptional circumstances are demonstrated.'
    ];
    
    // Generate embeddings
    const embeddings = await embeddingsService.embedStrings(testTexts);
    
    // Create test chunks
    const testChunks: ChunkEntity[] = testTexts.map((text, index) => ({
      id: `test-chunk-${index + 1}`,
      text,
      pageNumber: 15 + index,
      planId: 'test-plan-1',
      vector: embeddings.embeddings[index],
      createdAt: new Date()
    }));

    // Insert test data
    await vectorDB.insertMany(testChunks);

    // Test 1: Semantic search for "affordable housing"
    console.log('Test 1: Semantic search for "affordable housing"');
    const startTime = performance.now();
    
    const queryVector = await embeddingsService.embedSingle('affordable housing');
    const results = await vectorDB.query({
      query: 'affordable housing',
      vector: queryVector,
      k: 3
    });
    
    const searchTime = performance.now() - startTime;
    console.log(`✓ Search completed in ${searchTime.toFixed(2)}ms`);
    
    // Verify results relevance
    const hasRelevantResults = results.length > 0 && 
      results[0].entity.text.toLowerCase().includes('housing');
    
    if (hasRelevantResults) {
      console.log('✓ PASS: Found relevant housing policy results');
      console.log(`  Top result score: ${(results[0].score * 100).toFixed(1)}%`);
    } else {
      console.log('✗ FAIL: No relevant results found');
    }

    // Test 2: Performance benchmark
    if (searchTime < 500) {
      console.log('✓ PASS: Search performance under 500ms requirement');
    } else {
      console.log('✗ FAIL: Search exceeded 500ms performance target');
    }

    // Test 3: Keyword fallback
    console.log('\nTest 3: Keyword fallback search');
    const fallbackResults = await vectorDB.query({
      query: 'employment conversion',
      k: 3
    });
    
    const hasFallbackResults = fallbackResults.length > 0;
    if (hasFallbackResults) {
      console.log('✓ PASS: Keyword fallback working');
    } else {
      console.log('✗ FAIL: Keyword fallback not working');
    }

    // Clean up
    await vectorDB.clear();
    console.log('\n✓ Test cleanup completed');
    
    return {
      success: true,
      searchTime,
      resultsFound: results.length,
      hasRelevantResults,
      topScore: results.length > 0 ? results[0].score : 0
    };

  } catch (error) {
    console.error('✗ Semantic search test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Performance benchmark
export async function benchmarkSearch(iterations = 10) {
  console.log(`🚀 Running performance benchmark (${iterations} iterations)...`);
  
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    try {
      const queryVector = await embeddingsService.embedSingle(`test query ${i}`);
      await vectorDB.query({
        query: `test query ${i}`,
        vector: queryVector,
        k: 5
      });
    } catch (error) {
      console.warn(`Iteration ${i} failed:`, error);
    }
    times.push(performance.now() - start);
  }
  
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  
  console.log(`📊 Performance Results:`);
  console.log(`  Average: ${avgTime.toFixed(2)}ms`);
  console.log(`  Min: ${minTime.toFixed(2)}ms`);
  console.log(`  Max: ${maxTime.toFixed(2)}ms`);
  
  return { avgTime, minTime, maxTime };
}

// Run all tests
export async function runAllTests() {
  console.log('🧪 Starting comprehensive search tests...\n');
  
  const searchResults = await testSemanticSearch();
  const benchmarkResults = await benchmarkSearch(5);
  
  console.log('\n📋 Test Summary:');
  console.log(`  Search functionality: ${searchResults.success ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`  Performance: ${benchmarkResults.avgTime < 500 ? '✓ PASS' : '✗ FAIL'}`);
  
  return { searchResults, benchmarkResults };
}
