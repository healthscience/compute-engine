import os from 'os'
import path from 'path'

let BaseModel;

if (os.platform() === 'win32') {
  console.log('window path');
  const baseModelPath = path.resolve('./base/base-model.js');
  BaseModel = (await import(baseModelPath)).default;
} else {
  console.log('non windows');
  BaseModel = (await import('../base/base-model.js')).default;
}

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