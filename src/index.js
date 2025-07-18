import os from 'os'
import path from 'path';
// Construct the path to the models folder standard home dictory HOP implementation
let modelsPath = ''
if (os.platform() === 'win32') {
  console.log('window path')
  modelsPath = path.join(os.homedir(), 'hop-models', '', 'index.js');
} else {
  console.log('non windows')
  modelsPath = path.join(os.homedir(), '.hop-models', '', 'index.js');
}
console.log('modelsPath')
console.log(modelsPath)
// Function to dynamically import the models
async function loadModels() {
  try {
    const models = await import(modelsPath);
    return models;
  } catch (error) {
    console.error('Error loading models:', error);
    throw error;
  }
}

// Immediately invoke the function to load the models and re-export them
const modelsPromise = loadModels();

// Re-export the models dynamically
export const models = await modelsPromise;


// import * as models from os.homedir() +  '.hop-models/models/index.js' // + './models/index.js';
import { loadJavaScriptModel, loadWasmModel, loadPyScriptModel } from './loaders.js';
import { mode } from 'simple-statistics';

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

  /**
  * detect model mode
  * @method exectureContract
  *
  */
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

  /**
  * check if compute model is registered already?
  * @method checkRegistered
  *
  */
  checkRegistered(contract) {
    let registered = false
    for (let regMod of this.loaders) {
      if (regMod[0] === contract.value.computational.hash) {
        registered = true
      }
    }
    return registered
  }

  /**
  * check if compute model is live?
  * @method checkLoaded
  *
  */
  checkLoaded(contract) {
    let registered = false
    for (let regMod of this.models) {
      if (regMod[0] === contract.value.computational.hash + '@latest') {
        registered = true
        break;
      }
    }
    return registered
  }

  /**
  * detect model mode
  * @method detectModelType
  *
  */
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

// export * from './models/index.js';

const computeEngine = new ComputeEngine();
export default computeEngine;