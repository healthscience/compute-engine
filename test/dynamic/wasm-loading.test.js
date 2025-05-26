import { expect, it, describe, beforeAll } from 'vitest';
import computeEngine, { registerModelLoader } from '../../src/index.js';
import { loadWasmModel } from '../../src/loaders.js'; // Import the loadWasmModel function

describe('Dynamic Model Loading', () => {
  beforeAll(async () => {
    // Register the WASM model loader
    const wasmContract = {
      key: 'wasm-key',
      value: {
        refcontract: 'compute',
        concept: {},
        computational: {
          primary: true,
          name: 'average-statistics',
          description: 'WASM model',
          dtprefix: 'null',
          code: '', // WASM models do not use code
          hash: '064158be46a97526a800311ff339f0a0b37afd936c0d8859c07ee3b70cbabc0c',
          mode: 'wasm', // Specify the mode
          source: {
            url: 'path/to/wasm/module.wasm' // URL to the WASM module
          }
        }
      }
    };
    registerModelLoader(wasmContract.value.computational.hash, await loadWasmModel(wasmContract));
  });

  it('should load and execute a WASM model from contract', async () => {
    console.log('Starting test: should load and execute a WASM model from contract');
    // Prepare a sample contract for a WASM model
    const wasmContract = {
      key: 'wasm-key',
      value: {
        refcontract: 'compute',
        concept: {},
        computational: {
          primary: true,
          name: 'average-statistics',
          description: 'WASM model',
          dtprefix: 'null',
          code: '', // WASM models do not use code
          hash: '064158be46a97526a800311ff339f0a0b37afd936c0d8859c07ee3b70cbabc0c',
          mode: 'wasm', // Specify the mode
          source: {
            url: 'path/to/wasm/module.wasm' // URL to the WASM module
          }
        }
      }
    };
    // Load the WASM model from the contract
    const wasmModel = await computeEngine.loadModelFromContract(wasmContract);
    // Test the WASM model
    const wasmResult = await wasmModel.compute([1, 2, 3, 4, 5], { useWasm: true });
    expect(wasmResult.result).toBe(3); // Adjust the expected result based on the WASM module's functionality
    console.log('Finished test: should load and execute a WASM model from contract');
  });

  it('should handle invalid WASM model contract', async () => {
    console.log('Starting test: should handle invalid WASM model contract');
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
          mode: 'wasm', // Specify the mode
          source: {} // Missing URL or buffer
        }
      }
    };
    // Attempt to load the model from the invalid contract
    await expect(computeEngine.loadModelFromContract(invalidContract)).rejects.toThrow('No loader registered for model type: ') // 'WASM source must specify url or buffer');
    console.log('Finished test: should handle invalid WASM model contract');
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
    console.log('Finished test: should handle missing computational information');
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
    await expect(computeEngine.loadModelFromContract(unsupportedTypeContract)).rejects.toThrow('No loader registered for model type: ');
    console.log('Finished test: should handle unsupported model type');
  });
});