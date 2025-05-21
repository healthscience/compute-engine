// src/loaders.js - Loader implementations
/**
 * JavaScript model loader
 * @param {Object} contract - The model contract
 * @returns {Promise<Object>} - The loaded model
 */
export async function loadJavaScriptModel(contract) {
  const { source } = contract;
  
  // Handle different source types
  if (source.url) {
    try {
      // Load from URL
      const module = await import(source.url);
      return module.default || module;
    } catch (error) {
      throw new Error(`Failed to load JavaScript model from URL: ${error.message}`);
    }
  } 
  else if (source.code) {
    // Load from code string (with security measures)
    return createModelFromCode(source.code);
  }
  else if (source.path) {
    try {
      // Load from local file system (if running in Node.js)
      const module = await import(source.path);
      return module.default || module;
    } catch (error) {
      throw new Error(`Failed to load JavaScript model from path: ${error.message}`);
    }
  }
  
  throw new Error('Invalid JavaScript model source');
}

/**
 * WebAssembly model loader
 * @param {Object} contract - The model contract
 * @returns {Promise<Object>} - The loaded model
 */
export async function loadWasmModel(contract) {
  const { source } = contract;
  
  try {
    // Fetch and instantiate WASM module
    let wasmModule;
    
    if (source.url) {
      wasmModule = await WebAssembly.instantiateStreaming(
        fetch(source.url),
        contract.importObject || {}
      );
    } else if (source.buffer) {
      wasmModule = await WebAssembly.instantiate(
        source.buffer,
        contract.importObject || {}
      );
    } else {
      throw new Error('WASM source must specify url or buffer');
    }
    
    // Create a wrapper with a standard interface
    return createWasmModelWrapper(wasmModule, contract);
  } catch (error) {
    throw new Error(`Failed to load WASM model: ${error.message}`);
  }
}

/**
 * PyScript model loader
 * @param {Object} contract - The model contract
 * @returns {Promise<Object>} - The loaded model
 */
export async function loadPyScriptModel(contract) {
  const { source } = contract;
  
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
  const exportName = contract.exportName || 'compute';
  
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