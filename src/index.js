// src/index.js
import * as models from './models/index.js';

/**
 * Main compute engine class that manages model loading and computation
 */
class ComputeEngine {
  constructor() {
    this.models = new Map();
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
    return model.compute(data, options);
  }
}

// Export all models
export * from './models/index.js';

// Export the main compute engine
export { ComputeEngine };

// Export default as the compute engine
export default new ComputeEngine();