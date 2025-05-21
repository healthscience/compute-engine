// src/test/compute-linear-regression.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import LinearRegressionModel from './src/models/statistics/linear-regression.js';

describe('Linear Regression Model', () => {
  let model;

  beforeEach(() => {
    model = new LinearRegressionModel();
  });

  it('should compute linear regression correctly', async () => {
    const data = [
      { x: 1, y: 2 },
      { x: 2, y: 4 },
      { x: 3, y: 6 },
      { x: 4, y: 8 }
    ];
    
    const result = await model.compute(data);
    
    expect(result.result.slope).toBeCloseTo(2);
    expect(result.result.intercept).toBeCloseTo(0);
    expect(result.metadata.count).toBe(4);
  });

  it('should handle timestamp-based data', async () => {
    const data = [
      { timestamp: 1, value: 2 },
      { timestamp: 2, value: 4 },
      { timestamp: 3, value: 6 }
    ];
    
    const result = await model.compute(data);
    
    expect(result.result.slope).toBeCloseTo(2);
    expect(result.result.intercept).toBeCloseTo(0);
    expect(result.metadata.count).toBe(3);
  });

  it('should generate future predictions', async () => {
    const data = [
      { x: 1, y: 2 },
      { x: 2, y: 4 }
    ];
    
    const result = await model.compute(data, { futurePoints: 2 });
    
    expect(result.result.futureData).toHaveLength(2);
    expect(result.result.futureData[0].predicted).toBe(true);
  });

  it('should handle insufficient data', async () => {
    const result1 = await model.compute([]);
    expect(result1.error).toBe('Insufficient data for linear regression');

    const result2 = await model.compute([{ x: 1, y: 2 }]);
    expect(result2.error).toBe('Insufficient data for linear regression');
  });

  it('should verify model integrity', async () => {
    const isValid = await model.verify();
    expect(isValid).toBe(true);
  });
});