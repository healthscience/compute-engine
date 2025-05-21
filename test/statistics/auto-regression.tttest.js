// src/test/compute-auto-regression.test.js
/*
import { describe, it, expect, beforeEach } from 'vitest';
import AutoRegressionModel from '../../models/statistics/auto-regression.js';

describe('Auto Regression Model', () => {
  let model;

  beforeEach(() => {
    model = new AutoRegressionModel();
  });

  it('should verify model integrity', async () => {
    const result = await model.verifyIntegrity();
    expect(result).toBe(true);
  });

  it('should handle insufficient data', async () => {
    const result = await model.compute([1]);
    expect(result.error).toBe('Insufficient data for auto-regression');
  });

  it('should handle invalid options', async () => {
    // Test with negative lag
    const result1 = await model.compute([1, 2, 3], { lag: -1 });
    expect(result1.error).toBe('Lag and order must be positive integers');

    // Test with negative order
    const result2 = await model.compute([1, 2, 3], { order: -1 });
    expect(result2.error).toBe('Lag and order must be positive integers');
  });

  it('should compute auto-regression with default parameters', async () => {
    const data = [1, 2, 3, 4, 5];
    const result = await model.compute(data);

    expect(result.error).toBeUndefined();
    expect(result.metadata.count).toBe(5);
    expect(result.metadata.lag).toBe(1);
    expect(result.metadata.order).toBe(1);

    // Check coefficients
    expect(result.result.coefficients.length).toBe(2); // Intercept + 1 coefficient
    expect(result.result.coefficients[0]).toBeCloseTo(1); // Intercept
    expect(result.result.coefficients[1]).toBeCloseTo(1); // Coefficient

    // Check future predictions
    expect(result.result.futureData.length).toBe(10);
    expect(result.result.futureData[0].predicted).toBe(true);
  });

  it('should compute auto-regression with custom lag and order', async () => {
    const data = [1, 2, 4, 7, 11, 16, 22];
    const result = await model.compute(data, { lag: 2, order: 2 });

    expect(result.error).toBeUndefined();
    expect(result.metadata.count).toBe(7);
    expect(result.metadata.lag).toBe(2);
    expect(result.metadata.order).toBe(2);

    // Check coefficients
    expect(result.result.coefficients.length).toBe(3); // Intercept + 2 coefficients
    expect(result.result.coefficients[0]).toBeCloseTo(0); // Intercept
    expect(result.result.coefficients[1]).toBeCloseTo(1); // First coefficient
    expect(result.result.coefficients[2]).toBeCloseTo(1); // Second coefficient

    // Check future predictions
    expect(result.result.futureData.length).toBe(10);
    expect(result.result.futureData[0].predicted).toBe(true);
    // Verify the pattern continues (n^2/2 + n/2)
    expect(result.result.futureData[0].y).toBeCloseTo(29);
    expect(result.result.futureData[1].y).toBeCloseTo(37);
  });

  it('should handle timestamp-based data', async () => {
    const data = [
      { timestamp: 1, value: 1 },
      { timestamp: 2, value: 2 },
      { timestamp: 3, value: 3 },
      { timestamp: 4, value: 4 }
    ];
    const result = await model.compute(data);

    expect(result.error).toBeUndefined();
    expect(result.metadata.count).toBe(4);
    expect(result.metadata.lag).toBe(1);
    expect(result.metadata.order).toBe(1);

    // Check future predictions
    expect(result.result.futureData[0].x).toBe(5);
    expect(result.result.futureData[0].y).toBeCloseTo(5);
  });

  it('should generate accurate future predictions', async () => {
    const data = [1, 3, 6, 10, 15];
    const result = await model.compute(data, { futurePoints: 5 });

    expect(result.error).toBeUndefined();
    expect(result.result.futureData.length).toBe(5);

    // Verify the triangular number sequence continues
    expect(result.result.futureData[0].y).toBeCloseTo(21);
    expect(result.result.futureData[1].y).toBeCloseTo(28);
    expect(result.result.futureData[2].y).toBeCloseTo(36);
    expect(result.result.futureData[3].y).toBeCloseTo(45);
    expect(result.result.futureData[4].y).toBeCloseTo(55);
  });
});

*/