import os from 'os';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';


let BaseModel;


async function loadBaseModel() {
  try {
    if (os.platform() === 'win32') {
      console.log('window path');
      const baseModelPath = path.join(os.homedir(), 'hop-models', 'base/base-model.js') // path.resolve('./base/base-model.js');
      const baseModelUrl = pathToFileURL(baseModelPath).href;
      console.log(`Attempting to import BaseModel from: ${baseModelUrl}`);
      BaseModel = (await import(baseModelUrl)).default;
    } else {
      console.log('non windows');
      console.log('Attempting to import BaseModel from: ./base/base-model.js');
      BaseModel = (await import('../base/base-model.js')).default;
    }
  } catch (error) {
    console.error('Error loading BaseModel:', error);
    throw error; // Re-throw the error to ensure the test fails
  }
}

await loadBaseModel()

export default class AverageModel extends BaseModel {
  constructor() {
    super();
    this.signature.type = 'average';
    this.signature.version = '1.0.0';
    this.signature.hash = this.generateHash();
  }

  async computeNormal(data, options = {}) {
    if (!Array.isArray(data) || data.length === 0) {
      return { error: 'No data provided' };
    }

    let sum = 0;
    for (const item of data) {
      sum += item.value || item;
    }

    const average = sum / data.length;
    return {
      result: average,
      metadata: {
        count: data.length,
        timestamp: Date.now(),
        options
      }
    };
  }

  async computeWasm(data, options = {}) {
    const wasmLive = await this.initWasm();
    const values = data.map(item => item.value || item);
    // two option call direct or via export short cut
    // one
    // const result = await wasmLive.average(values);
    // two
    const result =  await wasmLive.callFunction('average-statistics', 'average', values);
    return {
      result: result,
      metadata: {
        count: data.length,
        timestamp: Date.now(),
        options
      }
    };
  }
}