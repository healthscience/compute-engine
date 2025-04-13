// src/models/statistics/average.js
import BaseModel from '../base/base-model.js';

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
    const wasm = await this.initWasm();
    const values = data.map(item => item.value || item);
    const result = await wasm.callFunction('average', values);
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