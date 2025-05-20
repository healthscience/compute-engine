// src/models/statistics/sum.js
import BaseModel from '../base/base-model.js';

export default class SumModel extends BaseModel {
  constructor() {
    super();
    this.signature.type = 'sum';
    this.signature.hash = this.generateHash();
  }

  async compute(data) {
    if (!Array.isArray(data) || data.length === 0) {
      return { error: 'Invalid data' };
    }
    
    const sum = data.reduce((a, b) => a + b, 0);
    
    return {
      result: sum,
      metadata: {
        count: data.length,
        timestamp: Date.now()
      }
    };
  }
}