import { expect, it, describe, beforeAll } from 'vitest';
import computeEngine, { registerModelLoader } from '../../src/index.js';
import { loadJavaScriptModel, loadWasmModel } from '../../src/loaders.js'; 

describe('Dynamic Model Loading', () => {

  it('look at compute contract and bring model to life based upon compute mode e.g wasm or js', async () => {
    let contractArray = []
    // Prepare a sample contract using the new structure
    const sampleContractW = {
      key: 'd3440d075d29268bb4bfd4653642dd0cd9bd5991',
      value: {
        refcontract: 'compute',
        concept: {},
        computational: {
          primary: true,
          name: 'average-statistics',
          description: 'WASM model',
          dtprefix: 'null',
          code: '', // WASM models do not use code
          hash: '3e86e9b9b5a7402e8066b58ae06f4599a1cc73f6852db1d7530a1e530bb95dd1',
          mode: 'wasm', // Specify the mode
          source: {
            url: 'path/to/wasm/module.wasm' // URL to the WASM module
          }
        }
      }
    };

    // Prepare a sample contract using the new structure
    const sampleContractJ = {
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
          hash: 'afe8619d1f5fc2dbbb69ca333b537121915de07ab511b03c287f67d1909b471b',
          mode: 'javascript' // Specify the mode
        }
      }
    };

    contractArray.push(sampleContractW)
    contractArray.push(sampleContractJ)

    for (let contract of contractArray) {
      // logic to register and load
      if (contract.value.computational.mode === 'javascript') {
         registerModelLoader(contract.value.computational.hash, await loadJavaScriptModel(contract));
      } else if (contract.value.computational.mode === 'wasm') {
        registerModelLoader(contract.value.computational.hash, await loadWasmModel(contract));
      }
      // make assertion base on contract base on
      // Load the model from the contract
      const model = await computeEngine.loadModelFromContract(contract);

      // Test the model
      const result = await model.compute([1, 2, 3, 4, 5]);
      expect(result.result).toBe(3);
    }

  });
});
