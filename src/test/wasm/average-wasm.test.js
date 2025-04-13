import { describe, it, expect } from 'vitest';
import wasm from '../../models/wasm/wasm-wrapper.js';

describe('Average WASM', () => {
  it('should calculate average', async () => {
    const values = new Float64Array([1.0, 2.0, 3.0, 4.0, 5.0]);
    const result = await wasm.average(values);
    expect(result).toBe(3.0);
  });

  it('should handle empty array', async () => {
    const values = new Float64Array([]);
    const result = await wasm.average(values);
    expect(result).toBe(0.0);
  });
});