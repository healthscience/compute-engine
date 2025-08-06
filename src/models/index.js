import os from 'os'
import path from 'path';

let exports = {};

if (os.platform() === 'win32') {
  console.log('window path');
  const avgPath =  path.join(os.homedir(), 'hop-models', 'statistics', 'average.js');
  const sumPath = path.join(os.homedir(), 'hop-models', 'statistics', 'sum.js');
  const linregPath = path.join(os.homedir(), 'hop-models', 'statistics', 'linear-regression.js');
  const autoregPath = path.join(os.homedir(), 'hop-models', 'statistics', 'auto-regression.js');

  exports = {
    AverageModel: (await import(avgPath)).default,
    SumModel: (await import(sumPath)).default,
    LinearRegression: (await import(linregPath)).default,
    AutoRegression: (await import(autoregPath)).default
  };
} else {
  console.log('non windows');
  exports = {
    AverageModel: (await import('./statistics/average.js')).default,
    SumModel: (await import('./statistics/sum.js')).default,
    LinearRegression: (await import('./statistics/linear-regression.js')).default,
    AutoRegression: (await import('./statistics/auto-regression.js')).default
  };
}

export default exports;

/*
  export { default as AverageModel } from './statistics/average.js';
  export { default as SumModel } from './statistics/sum.js';
  export { default as LinearRegression } from './statistics/linear-regression.js';
  export { default as AutoRegression } from './statistics/auto-regression.js'
*/
