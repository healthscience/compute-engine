import { expect, it, describe, beforeAll } from 'vitest';
import computeEngine, { registerModelLoader } from '../../src/index.js';
import { loadJavaScriptModel } from '../../src/loaders.js'; 

describe('Dynamic Model Loading', () => {
  beforeAll(async () => {
    const sampleContract = {
      key: 'd3440d075d29268bb4bfd4653642dd0cd9bd5991',
      value: {
        refcontract: 'compute',
        concept: {},
        computational: {
          primary: true,
          name: 'average',
          description: 'statistical mean',
          dtprefix: 'null',
          code: 'return inputs.reduce((a, b) => a + b, 0) / inputs.length;',
          hash: '335bc8b13e28cfce6e0a073784cb2c1c14572dae376e374a71ed69c78f5e0247',
          mode: 'javascript' // Specify the mode
        }
      }
    };
    // Register the JavaScript model loader
    registerModelLoader(sampleContract.value.computational.hash, await loadJavaScriptModel(sampleContract));
  });

  it('should load and execute a dynamic average model from contract', async () => {
    console.log('Starting test: should load and execute a dynamic model from contract');

    // Prepare a sample contract using the new structure
    const sampleContract = {
      key: 'd3440d075d29268bb4bfd4653642dd0cd9bd5991',
      value: {
        refcontract: 'compute',
        concept: {},
        computational: {
          primary: true,
          name: 'average',
          description: 'statistical mean',
          dtprefix: 'null',
          code: 'return inputs.reduce((a, b) => a + b, 0) / inputs.length;',
          hash: '335bc8b13e28cfce6e0a073784cb2c1c14572dae376e374a71ed69c78f5e0247', // 'afe8619d1f5fc2dbbb69ca333b537121915de07ab511b03c287f67d1909b471b',
          mode: 'javascript' // Specify the mode
        }
      }
    };

    // Load the model from the contract
    const model = await computeEngine.loadModelFromContract(sampleContract);
    console.log('Model loaded:', model);
    // Test the model
    const result = await model.compute([1, 2, 3, 4, 5]);
    expect(result.result).toBe(3);
  });

  it('should handle invalid model contract', async () => {
    console.log('Starting test: should handle invalid model contract');
    // Prepare an invalid contract
    const invalidContract = {
      key: 'invalid-key',
      value: {
        refcontract: 'compute',
        concept: {},
        computational: {
          primary: true,
          name: 'invalid',
          description: 'invalid model',
          dtprefix: 'null',
          code: '', // Invalid code
          hash: '',
          mode: 'javascript' // Specify the mode
        }
      }
    };

    // Attempt to load the model from the invalid contract
    await expect(computeEngine.loadModelFromContract(invalidContract)).rejects.toThrow('No loader registered for model type');
  });

  it('should handle missing computational information', async () => {
    console.log('Starting test: should handle missing computational information');
    // Prepare a contract with missing computational information
    const missingInfoContract = {
      key: 'missing-info-key',
      value: {
        refcontract: 'compute',
        concept: {},
        computational: null // Missing computational information
      }
    };

    // Attempt to load the model from the contract with missing information
    await expect(computeEngine.loadModelFromContract(missingInfoContract)).rejects.toThrow('Invalid model contract: missing computational information');
  });

  it('should handle unsupported model type', async () => {
    console.log('Starting test: should handle unsupported model type');
    // Prepare a contract with an unsupported model type
    const unsupportedTypeContract = {
      key: 'unsupported-type-key',
      value: {
        refcontract: 'compute',
        concept: {},
        computational: {
          primary: true,
          name: 'unsupported',
          description: 'unsupported model type',
          dtprefix: 'null',
          code: 'return inputs;',
          hash: '',
          mode: 'unsupported' // Unsupported type
        }
      }
    };

    // Attempt to load the model from the contract with an unsupported type
    await expect(computeEngine.loadModelFromContract(unsupportedTypeContract)).rejects.toThrow('No loader registered for model type');
  });
});