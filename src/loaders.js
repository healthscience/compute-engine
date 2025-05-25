import { generateHash } from './utils/hash.js';
import fs from 'fs';
import path from 'path';

/**
 * JavaScript model loader
 * @param {Object} contract - The model contract
 * @returns {Promise<Object>} - The loaded model
 */
export async function loadJavaScriptModel(contract) {
  const { name, source, hash } = contract.value.computational;

  // Construct the file path based on the contract details
  const filePath = `./models/statistics/${name}.js`;

  try {
    // Generate hash for the file path
    const fileHash = generateHash(filePath);
    // Verify the hash
    if (fileHash !== hash) {
      throw new Error(`Hash mismatch for JavaScript model: expected ${hash}, got ${fileHash}`);
    }
    // Dynamically import the model file
    const module = await import(filePath);

    return module.default || module;
  } catch (error) {
    throw new Error(`Failed to load JavaScript model from path: ${filePath}. Error: ${error.message}`);
  }
}

/**
 * WebAssembly model loader
 * @param {Object} contract - The model contract
 * @returns {Promise<Object>} - The loaded model
 */
export async function loadWasmModel(contract) {
  const { name, source, hash } = contract.value.computational;

  // TEMP two file method, check source wasm file and higher level helper file
  // Construct the file path based on the contract details
  const filePathWASM = path.resolve(`./src/models/wasm/statistics/${name}.wasm`);
  const filePathHelper = `./models/statistics/${'average'}.js`;
  try {
    // Generate hash for the file path
    const fileHashWasm = generateHash(filePathWASM);
    const fileHashHelper = generateHash(filePathHelper)

    // Verify the hash
    if (fileHashWasm !== hash) {
      throw new Error(`Hash mismatch for WASM model: expected ${hash}, got ${fileHashWasm}`);
    }

    // use the average prepared file for now
    // Dynamically import the model file
    const module = await import(filePathHelper);

    return module.default || module;

  } catch (error) {
     throw new Error(`Failed to load WASM model from path: ${filePathHelper}. Error: ${error.message}`);
  }
}

/**
 * PyScript model loader
 * @param {Object} contract - The model contract
 * @returns {Promise<Object>} - The loaded model
 */
export async function loadPyScriptModel(contract) {
  console.log('python loader');
  const { name, source, hash } = contract.value.computational;

  // Construct the file path based on the contract details
  const filePath = `./models/python/statistics/${name}.py`;

  try {
    // Ensure PyScript is loaded
    await ensurePyScriptLoaded();
    // Create a Python environment with the code
    const pyodide = await globalThis.loadPyodide();
    if (source.code) {
      await pyodide.loadPackagesFromImports(source.code);
      pyodide.runPython(source.code);
    } else if (source.url) {
      const response = await fetch(source.url);
      const code = await response.text();
      await pyodide.loadPackagesFromImports(code);
      pyodide.runPython(code);
    } else {
      throw new Error('PyScript source must specify code or url');
    }

    // Generate hash for the file path
    const fileHash = generateHash(filePath);

    // Verify the hash
    if (fileHash !== hash) {
      throw new Error(`Hash mismatch for PyScript model: expected ${hash}, got ${fileHash}`);
    }

    // Return a wrapper that calls the Python compute function
    return createPyScriptModelWrapper(pyodide);
  } catch (error) {
    throw new Error(`Failed to load PyScript model: ${error.message}`);
  }
}

// Helper functions

/**
 * Create a model from JavaScript code string
 * @param {string} code - The JavaScript code
 * @returns {Object} - The model object
 */
function createModelFromCode(code) {
  // IMPORTANT: This needs proper sandboxing in production!
  // Options include VM2, isolated-vm, or a Worker-based approach
  try {
    // Wrap the code to create a proper compute function
    const wrappedCode = `
      return {
        compute: async function(inputs, options = {}) {
          ${code}
        }
      };
    `;
    // Use Function constructor to create a function from the code
    // This is not secure for untrusted code!
    const createModelFn = new Function(wrappedCode);
    return createModelFn();
  } catch (error) {
    throw new Error(`Failed to create model from code: ${error.message}`);
  }
}

/**
 * Create a model wrapper for a WebAssembly module
 * @param {WebAssembly.Instance} wasmModule - The instantiated WASM module
 * @param {Object} contract - The model contract
 * @returns {Object} - The model object
 */
function createWasmModelWrapper(wasmModule, contract) {
  const instance = wasmModule.instance;
  const exportName = contract.exportName || 'average';
  if (!instance.exports[exportName]) {
    throw new Error(`WASM module does not export '${exportName}' function`);
  }
  return {
    compute: (inputs, options = {}) => {
      // This is a simplified implementation - would need to be
      // expanded based on the specific WASM interface
      if (Array.isArray(inputs)) {
        // Convert inputs to the appropriate format for WASM
        // This depends on your specific WASM module interface
        return instance.exports[exportName](inputs.length, ...inputs);
      } else {
        return instance.exports[exportName](inputs);
      }
    }
  };
}

/**
 * Create a model wrapper for a PyScript model
 * @param {Object} pyodide - The Pyodide instance
 * @returns {Object} - The model object
 */
function createPyScriptModelWrapper(pyodide) {
  return {
    compute: async (inputs, options = {}) => {
      // Convert inputs to Python format
      const pyInputs = pyodide.toPy(inputs);
      const pyOptions = pyodide.toPy(options || {});
      // Call the compute function
      try {
        const result = pyodide.runPython(`
          compute(${pyInputs}, ${pyOptions})
        `);
        // Convert result back to JavaScript
        return result.toJs();
      } catch (error) {
        throw new Error(`PyScript computation failed: ${error.message}`);
      }
    }
  };
}

/**
 * Ensure PyScript is loaded
 * @returns {Promise<void>}
 */
async function ensurePyScriptLoaded() {
  if (globalThis.loadPyodide) return;
  // This is a browser-only implementation
  if (typeof window === 'undefined') {
    throw new Error('PyScript is only supported in browser environments');
  }
  // Load PyScript dynamically
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.22.0/full/pyodide.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}