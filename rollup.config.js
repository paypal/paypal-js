import { terser } from 'rollup-plugin-terser';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import pkg from './package.json';

export default {
    input: 'src/main.js',
    plugins: [
        replace({
            '__VERSION__': pkg.version
        })
    ],
    output: [
        {
            file: 'dist/paypal.esm.js',
            format: 'esm',
            plugins: [
                getBabelOutputPlugin({
                    presets: ['@babel/preset-env']
                })
            ]
        },
        {
            file: 'dist/paypal.js',
            format: 'cjs'
        },
        {
            file: 'dist/paypal.iife.js',
            format: 'iife',
            name: 'paypalLoader'
        },
        {
            file: 'dist/ipaypal.iife.min.js',
            format: 'iife',
            name: 'paypalLoader',
            plugins: [terser()]
        }
    ]
};
