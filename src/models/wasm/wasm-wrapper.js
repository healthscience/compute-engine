// src/models/wasm/wasm-wrapper.js
class WASMWrapper {
  constructor() {
    this.instances = new Map();
    this.defaultMemory = new WebAssembly.Memory({ initial: 256, maximum: 256 });
    this.defaultTable = new WebAssembly.Table({ initial: 0, element: 'anyfunc' });
  }

  async init(moduleName = 'average') {
    if (!this.instances.has(moduleName)) {
      const importObject = {
        env: {
          abort: () => {
            throw new Error('WASM runtime error');
          },
          memory: this.defaultMemory,
          table: this.defaultTable,
          console: {
            log: function(msg) {
              console.log(msg);
            }
          }
        }
      };

      let bytes;
      if (typeof window !== 'undefined' && typeof fetch === 'function') {
        // Browser environment
        const response = await fetch(new URL(`/models/wasm/${moduleName}-statistics.wasm`, window.location.origin));
        bytes = await response.arrayBuffer();
      } else {
        // Node.js environment
        const fs = require('fs');
        const path = require('path');
        const wasmPath = path.join(__dirname, `${moduleName}-statistics.wasm`);
        bytes = fs.readFileSync(wasmPath);
      }

      const result = await WebAssembly.instantiate(bytes, importObject);
      this.instances.set(moduleName, {
        instance: result.instance,
        memory: result.instance.exports.memory
      });
    }
    return this.instances.get(moduleName);
  }

  async callFunction(moduleName, funcName, ...args) {
    const { instance, memory } = await this.init(moduleName);
    if (!instance.exports[funcName]) {
      throw new Error(`Function ${funcName} not found in WASM exports`);
    }

    // Validate input arguments
    if (args.length === 0) {
      throw new Error('No arguments provided');
    }

    // Handle array arguments
    const arrayArgs = args.filter(arg => arg instanceof Array || arg instanceof Float64Array);
    if (arrayArgs.length > 0) {
      const array = arrayArgs[0];
      if (!array.every(Number.isFinite)) {
        throw new Error('Array must contain only finite numbers');
      }

      // console.log('Input array:', array);
      // console.log('Array length:', array.length);
      // console.log('First value:', array[0]);
      
      // Allocate memory in WASM
      const bytesPerElement = 8; // 64-bit floats
      const requiredBytes = array.length * bytesPerElement;
      
      // Check if we have enough memory
      const memorySize = memory.buffer.byteLength;
      if (requiredBytes > memorySize) {
        throw new Error('Not enough memory available for operation');
      }
      
      // Copy the array to WASM memory starting from offset 0
      const memoryView = new Float64Array(memory.buffer);
      memoryView.set(array, 0); // Start from offset 0
      
      try {
        // Pass the offset and length to WASM
        const result = instance.exports[funcName](0, array.length); // Use offset 0
        console.log('Result:', result);
        return result;
      } catch (error) {
        // Reset memory state on error
        this.offset = 0;
        throw error;
      }
    }

    return instance.exports[funcName](...args);
  }

  // Helper methods for common operations
  async sum(values) {
    return this.callFunction('sum', 'sum', values);
  }

  async average(values) {
    return this.callFunction('average', 'average', values);
  }
}

export default new WASMWrapper();