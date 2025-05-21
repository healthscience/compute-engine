// src/index.js - Enhanced with dynamic loading
import * as models from './models/index.js';

/**
 * Main compute engine class that manages model loading and computation
 */
class ComputeEngine {
  constructor() {
    this.models = new Map();
    this.loaders = new Map();
    
    // We'll initialize the loaders, but we'll implement them separately
    // to avoid breaking existing functionality
  }

  /**
   * Load a specific model by name
   * @param {string} modelName - Name of the model to load
   * @returns {Promise<*>} - The loaded model instance
   */
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

  /**
   * Compute using a specific model
   * @param {string} modelName - Name of the model to use
   * @param {any[]} data - Data to process
   * @param {Object} options - Computation options
   * @returns {Promise<*>} - Computation result
   */
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

  /**
   * Register a model loader for a specific language/format
   * @param {string} type - Type of model (js, wasm, pyscript)
   * @param {Function} loaderFn - Loader function for this type
   */
  registerLoader(type, loaderFn) {
    this.loaders.set(type, loaderFn);
  }

  /**
   * Load a model from a contract specification
   * @param {Object} contract - The model contract specification
   * @returns {Promise<Object>} - The loaded model
   */
  async loadModelFromContract(contract) {
    if (!contract || !contract.source) {
      throw new Error('Invalid model contract: missing source information');
    }
    
    // Generate a unique identifier for this model
    const modelId = contract.id || contract.name || `model-${Date.now()}`;
    const modelVersion = contract.version || 'latest';
    const modelKey = `${modelId}@${modelVersion}`;
    
    // Check if already loaded
    if (this.models.has(modelKey)) {
      return this.models.get(modelKey);
    }
    
    // Determine the model type
    const modelType = contract.type || this.detectModelType(contract.source);

    // Get the appropriate loader
    const loader = this.loaders.get(modelType);
    if (!loader) {
      throw new Error(`No loader registered for model type: ${modelType}`);
    }

    // Load the model
    try {
      const model = await loader(contract);
      this.models.set(modelKey, model);
      return model;
    } catch (error) {
      throw new Error(`Failed to load model ${modelKey}: ${error.message}`);
    }
  }

  /**
   * Execute a compute contract
   * @param {Object} contract - The compute contract
   * @param {Array|Object} inputs - The input data
   * @param {Object} options - Computation options
   * @returns {Promise<Object>} - Computation result with metadata
   */
  async executeContract(contract, inputs, options = {}) {
    // Load the model from the contract
    const model = await this.loadModelFromContract(contract);

    // Execute the computation
    const startTime = Date.now();
    const result = await model.compute(inputs, options);

    // Return result with metadata
    return {
      result,
      metadata: {
        modelId: contract.id || contract.name,
        version: contract.version || 'latest',
        type: contract.type,
        count: Array.isArray(inputs) ? inputs.length : 1,
        timestamp: startTime
      }
    };
  }
  
  /**
   * Detect the type of model from its source
   * @param {Object} source - The model source specification
   * @returns {string} - The detected model type
   */
  detectModelType(source) {
    if (source.url) {
      if (source.url.endsWith('.wasm')) return 'wasm';
      if (source.url.endsWith('.py')) return 'pyscript';
      return 'js';
    }
    if (source.code) {
      // Simple heuristic - could be improved
      if (source.code.includes('import numpy') || source.code.includes('import pandas')) {
        return 'pyscript';
      }
      return 'js';
    }
    return 'js'; // Default
  }
}

// Create convenience functions for library-hop to use
export function executeComputeContract(contract, inputs, options = {}) {
  return computeEngine.executeContract(contract, inputs, options);
}

export function registerModelLoader(type, loaderFn) {
  computeEngine.registerLoader(type, loaderFn);
}

// Export all models
export * from './models/index.js';
// Export the main compute engine
export { ComputeEngine };
// Export default as the compute engine
const computeEngine = new ComputeEngine();
export default computeEngine;