import { describe, it, expect, beforeEach } from 'vitest';
import AverageModel from './src/models/statistics/average.js';

describe('Compute Engine', () => {
  let model;
  
  beforeEach(() => {
    model = new AverageModel();
  });
  
  it('should compute average correctly', async () => {
    const data = [1, 2, 3, 4, 5];
    const result = await model.compute(data);
    
    expect(result.result).toBe(3);
    expect(result.metadata.count).toBe(5);
  });
  
  it('should verify model integrity', async () => {
    const isValid = await model.verify();
    expect(isValid).toBe(true);
  });
});
