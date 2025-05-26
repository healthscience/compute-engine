// src/test/sum.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import SumModel from './src/models/statistics/sum.js';

describe('Sum Model', () => {
  let model;

  beforeEach(() => {
    model = new SumModel();
  });

  it('should compute sum correctly', async () => {
    const data = [1, 2, 3, 4, 5];
    const result = await model.compute(data);
    
    expect(result.result).toBe(15);
    expect(result.metadata.count).toBe(5);
  });

  it('should verify model integrity', async () => {
    const isValid = await model.verify();
    expect(isValid).toBe(true);
  });
});