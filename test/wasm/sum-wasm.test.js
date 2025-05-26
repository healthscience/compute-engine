import { describe, it, expect } from 'vitest';
import wasm from './src/models/wasm/wasm-wrapper.js';

describe('Sum WASM', () => {
  it('should calculate sum of array', async () => {
    const values = new Float64Array([1.0, 2.0, 3.0, 4.0, 5.0]);
    const result = await wasm.sum(values);
    expect(result).toBe(15.0);
  });

  it('should handle empty array', async () => {
    const values = new Float64Array([]);
    const result = await wasm.sum(values);
    expect(result).toBe(0.0);
  });

  it('should handle negative numbers', async () => {
    const values = new Float64Array([1.0, -2.0, 3.0, -4.0, 5.0]);
    const result = await wasm.sum(values);
    expect(result).toBe(3.0);
  });

  it('should handle large numbers', async () => {
    const values = new Float64Array([1e10, 2e10, 3e10]);
    const result = await wasm.sum(values);
    expect(result).toBe(6e10);
  });
  
});