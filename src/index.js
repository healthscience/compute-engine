import * as models from './models/index.js';
import { loadJavaScriptModel, loadWasmModel, loadPyScriptModel } from './loaders.js';

class ComputeEngine {
  constructor() {
    this.models = new Map();
    this.loaders = new Map();
    this.jsLoader = loadJavaScriptModel
    this.wasmLoader = loadWasmModel
  }

  async loadModel(modelName) {
    if (!this.models.has(modelName)) {
      const ModelClass = models[modelName];
      if (!ModelClass) {
        throw new Error(`Model ${modelName} not found`);
      }
      this.models.set(modelName, new ModelClass());
    }
    return this.models.get(modelName);
  }

  async compute(modelName, data, options = {}) {
    const model = await this.loadModel(modelName);
    const startTime = Date.now();
    const result = await model.compute(data, options);
    return {
      result,
      metadata: {
        count: Array.isArray(data) ? data.length : 1,
        timestamp: startTime
      }
    };
  }

  registerLoader(hash, loaderFn) {
    this.loaders.set(hash, loaderFn);
  }

  async loadModelFromContract(contract) {
    if (!contract || !contract.value || !contract.value.computational) {
      throw new Error('Invalid model contract: missing computational information');
    }
    const modelId = contract.value.computational.hash;
    const modelVersion = contract.value.computational.version || 'latest';
    const modelKey = `${modelId}@${modelVersion}`;

    if (this.models.has(modelKey)) {
      return this.models.get(modelKey);
    }

    const loader = this.loaders.get(modelId);

    if (!loader) {
      throw new Error(`No loader registered for model type: ${modelId}`);
    }
    try {
      const model = await new loader(contract);
      this.models.set(modelKey, model);
      return model;
    } catch (error) {
      throw new Error(`Failed to load model ${modelKey}: ${error.message}`);
    }
  }

  async executeContract(contract, inputs, options = {}) {
    const model = await this.loadModelFromContract(contract);
    const startTime = Date.now();
    const result = await model.compute(inputs, options);
    return {
      result,
      metadata: {
        modelId: contract.key,
        version: contract.value.computational.version || 'latest',
        type: contract.value.computational.mode,
        count: Array.isArray(inputs) ? inputs.length : 1,
        timestamp: startTime
      }
    };
  }

  detectModelType(computational) {
    if (computational.url) {
      if (computational.url.endsWith('.wasm')) return 'wasm';
      if (computational.url.endsWith('.py')) return 'pyscript';
      return 'js';
    }
    if (computational.code) {
      if (computational.code.includes('import numpy') || computational.code.includes('import pandas')) {
        return 'pyscript';
      }
      return 'js';
    }
    return 'js'; // Default
  }
}

export function executeComputeContract(contract, inputs, options = {}) {
  return computeEngine.executeContract(contract, inputs, options);
}

export function registerModelLoader(type, loaderFn) {
  computeEngine.registerLoader(type, loaderFn);
}

export * from './models/index.js';

const computeEngine = new ComputeEngine();
export default computeEngine;