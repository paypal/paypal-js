import { terser } from 'rollup-plugin-terser';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';

export default {
  input: 'src/main.js',
  output: [
    {
      file: 'dist/esm-bundle.js',
      format: 'esm',
      plugins: [
        getBabelOutputPlugin({
          presets: ['@babel/preset-env']
        })
      ]
    },
    {
      file: 'dist/cjs-bundle.js',
      format: 'cjs'
    },
    {
      file: 'dist/iife-bundle.js',
      format: 'iife',
      name: 'paypalGetScript'
    },
    {
      file: 'dist/iife-bundle.min.js',
      format: 'iife',
      name: 'paypalGetScript',
      plugins: [terser()]
    }
  ]
};
