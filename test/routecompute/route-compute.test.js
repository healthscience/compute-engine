import { expect, test, describe, vi } from 'vitest';
import computeEngine from '../../src/index.js';

describe('Compute Contract Routing', () => {
  test('should route to the correct compute implementation based on model name', async () => {
    // Test with the sum model
    const sumResult = await computeEngine.compute('SumModel', [1, 2, 3, 4, 5]);
    
    // Verify the result (check the result property)
    expect(sumResult.result.result).toBe(15);
    
    // Test with the average model
    const avgResult = await computeEngine.compute('AverageModel', [1, 2, 3, 4, 5]);
    
    // Verify the result (check the result property)
    expect(avgResult.result.result).toBe(3);
    
    // Test that routing to an unknown model fails
    await expect(computeEngine.compute('NonExistentModel', [1, 2, 3, 4, 5]))
      .rejects.toThrow(/Model.*not found/i);
  });
    
  test('should route using the engine interface appropriately', async () => {
    // First, try a simple arithmetic operation
    const sumData = [1, 2, 3, 4, 5];
    const sumOptions = {};
    
    // Use a spy to track which model gets loaded
    const loadModelSpy = vi.spyOn(computeEngine, 'loadModel');
    
    await computeEngine.compute('SumModel', sumData, sumOptions);
    
    // Check that the SumModel was loaded
    expect(loadModelSpy).toHaveBeenCalledWith('SumModel');
    
    // Reset the spy
    loadModelSpy.mockClear();
    
    // Try a different type of operation
    await computeEngine.compute('AverageModel', sumData, sumOptions);
    
    // Check that the AverageModel was loaded
    expect(loadModelSpy).toHaveBeenCalledWith('AverageModel');
    
    // Reset and restore the spy
    loadModelSpy.mockRestore();
  });
});
