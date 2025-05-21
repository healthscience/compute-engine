// test/dynamic/dynamic-loading.test.js
import { expect, test, describe, beforeAll } from 'vitest';
import computeEngine, { registerModelLoader } from '../../src/index.js';
import { loadJavaScriptModel } from '../../src/loaders.js';

describe('Dynamic Model Loading', () => {
  beforeAll(() => {
    // Register the JavaScript model loader
    registerModelLoader('js', loadJavaScriptModel);
  });

  test('should load and execute a JavaScript model from code string', async () => {
    const jsContract = {
      id: 'dynamic-sum',
      name: 'DynamicSumModel',
      version: '1.0.0',
      type: 'js',
      source: {
        code: `
          // Compute sum of inputs
          return inputs.reduce((a, b) => a + b, 0);
        `
      }
    };
    
    // Load the model
    const model = await computeEngine.loadModelFromContract(jsContract);
    expect(model).toBeDefined();
    
    // Test the model
    const result = await model.compute([1, 2, 3, 4, 5]);
    expect(result).toBe(15);
    
    // Test using executeContract
    const contractResult = await computeEngine.executeContract(jsContract, [1, 2, 3, 4, 5]);
    expect(contractResult.result).toBe(15);
    expect(contractResult.metadata).toBeDefined();
    expect(contractResult.metadata.modelId).toBe('dynamic-sum');
  });
  
  test('should detect model type correctly', () => {
    // JavaScript
    expect(computeEngine.detectModelType({ url: 'model.js' })).toBe('js');
    expect(computeEngine.detectModelType({ code: 'return x + y;' })).toBe('js');
    
    // WASM
    expect(computeEngine.detectModelType({ url: 'model.wasm' })).toBe('wasm');
    
    // PyScript
    expect(computeEngine.detectModelType({ url: 'model.py' })).toBe('pyscript');
    expect(computeEngine.detectModelType({ 
      code: 'import numpy as np\ndef compute(x): return np.sum(x)' 
    })).toBe('pyscript');
  });
  
  test('should handle model cache appropriately', async () => {
    const jsContract = {
      id: 'cached-model',
      version: '1.0.0',
      type: 'js',
      source: {
        code: 'return inputs[0] * 2;'
      }
    };
    
    // Load model the first time
    const model1 = await computeEngine.loadModelFromContract(jsContract);
    
    // Load again - should return the cached instance
    const model2 = await computeEngine.loadModelFromContract(jsContract);
    
    // Should be the same instance
    expect(model1).toBe(model2);
    
    // Test the model
    const result = await model1.compute([10]);
    expect(result).toBe(20);
  });
  
  test('should throw appropriate errors for invalid contracts', async () => {
    // Missing source
    const invalidContract1 = {
      id: 'invalid-model',
      type: 'js'
      // No source property
    };
    
    await expect(computeEngine.loadModelFromContract(invalidContract1))
      .rejects.toThrow('missing source');
    
    // Invalid loader
    const invalidContract2 = {
      id: 'invalid-type',
      type: 'invalid-type',
      source: { code: 'return 42;' }
    };
    
    await expect(computeEngine.loadModelFromContract(invalidContract2))
      .rejects.toThrow('No loader registered');
  });
});