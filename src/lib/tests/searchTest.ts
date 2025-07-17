// Test file for semantic search functionality
// This validates the acceptance criteria from the specification

import { embeddingsService } from '../embeddings/embedStrings';
import { vectorDB } from '../db/entityDb';
import type { ChunkEntity } from '../db/entityDb';

export async function testSemanticSearch() {
  console.log('Testing semantic search functionality...');
  
  // Initialize embeddings service to get proper vector dimensions
  await embeddingsService.initialize();
  
  // Generate proper embeddings for test data
  const testTexts = [
    'Housing policy H2 allows for affordable housing development with up to six storeys in designated areas. The policy requires 30% affordable housing provision.',
    'Policy H2 specifies height restrictions for residential developments. Buildings may not exceed four storeys without special consideration.',
    'Commercial development guidelines require adequate parking provision and retail space activation.'
  ];
  
  const embeddings = await embeddingsService.embedStrings(testTexts);
  
  // Test data - simulated policy chunks with real embeddings
  const testChunks: ChunkEntity[] = [
    {
      id: 'test-chunk-1',
      text: testTexts[0],
      pageNumber: 15,
      planId: 'test-plan-1',
      vector: embeddings.embeddings[0],
      createdAt: new Date()
    },
    {
      id: 'test-chunk-2',
      text: testTexts[1],
      pageNumber: 16,
      planId: 'test-plan-1',
      vector: embeddings.embeddings[1],
      createdAt: new Date()
    },
    {
      id: 'test-chunk-3',
      text: testTexts[2],
      pageNumber: 25,
      planId: 'test-plan-1',
      vector: embeddings.embeddings[2],
      createdAt: new Date()
    }
  ];

  // Insert test data
  await vectorDB.insertMany(testChunks);

  // Test 1: Search for "housing" should return relevant chunks
  console.log('Test 1: Searching for "housing"');
  const startTime = performance.now();
  
  try {
    const queryVector = await embeddingsService.embedSingle('housing');
    const results = await vectorDB.query({
      query: 'housing',
      vector: queryVector,
      k: 10
    });
    
    const searchTime = performance.now() - startTime;
    console.log(`✓ Search completed in ${searchTime.toFixed(2)}ms`);
    console.log(`✓ Found ${results.length} results`);
    
    // Acceptance criteria: should return ≥1 chunk containing "housing" within 500ms
    const hasHousingResults = results.some(r => r.entity.text.toLowerCase().includes('housing'));
    const isUnder500ms = searchTime < 500;
    
    if (hasHousingResults && isUnder500ms) {
      console.log('✓ PASS: Found housing-related results within 500ms');
    } else {
      console.log('✗ FAIL: Either no housing results or search took too long');
      console.log(`  - Has housing results: ${hasHousingResults}`);
      console.log(`  - Under 500ms: ${isUnder500ms} (${searchTime.toFixed(2)}ms)`);
    }
    
  } catch (error) {
    console.error('✗ Search test failed:', error);
  }

  // Test 2: Search for "Policy H2 six storeys" should return relevant policy
  console.log('\nTest 2: Searching for "Policy H2 six storeys"');
  
  try {
    const startTime2 = performance.now();
    const queryVector2 = await embeddingsService.embedSingle('Policy H2 six storeys');
    const results2 = await vectorDB.query({
      query: 'Policy H2 six storeys',
      vector: queryVector2,
      k: 3
    });
    
    const searchTime2 = performance.now() - startTime2;
    console.log(`✓ Search completed in ${searchTime2.toFixed(2)}ms`);
    console.log(`✓ Found ${results2.length} results`);
    
    // Check if we got the expected chunk about H2 and six storeys
    const hasRelevantResult = results2.some(r => 
      r.entity.text.toLowerCase().includes('h2') && 
      r.entity.text.toLowerCase().includes('six storeys')
    );
    
    if (hasRelevantResult) {
      console.log('✓ PASS: Found relevant H2 policy with height information');
    } else {
      console.log('✗ FAIL: Did not find expected H2 policy information');
    }
    
  } catch (error) {
    console.error('✗ Search test failed:', error);
  }

  // Test 3: Keyword fallback test
  console.log('\nTest 3: Testing keyword fallback');
  
  try {
    const startTime3 = performance.now();
    const results3 = await vectorDB.query({
      query: 'affordable housing',
      // No vector provided - should use keyword search
      k: 5
    });
    
    const searchTime3 = performance.now() - startTime3;
    console.log(`✓ Keyword search completed in ${searchTime3.toFixed(2)}ms`);
    console.log(`✓ Found ${results3.length} results`);
    
    const hasAffordableResults = results3.some(r => 
      r.entity.text.toLowerCase().includes('affordable')
    );
    
    if (hasAffordableResults) {
      console.log('✓ PASS: Keyword search found affordable housing results');
    } else {
      console.log('✗ FAIL: Keyword search did not find expected results');
    }
    
  } catch (error) {
    console.error('✗ Keyword search test failed:', error);
  }

  // Clean up
  await vectorDB.clear();
  console.log('\nTest cleanup completed');
}

// Helper function to run tests in browser console
export function runSearchTests() {
  testSemanticSearch().catch(console.error);
}
