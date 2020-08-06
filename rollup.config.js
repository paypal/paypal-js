import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import pkg from './package.json';

export default {
    input: 'src/main.js',
    plugins: [
        nodeResolve({
            browser: true
        }),
        commonjs(),
        babel({
            babelHelpers: 'bundled',
            exclude: /node_modules/
        }),
        replace({
            '__VERSION__': pkg.version
        }),
        filesize()
    ],
    output: [
        {
            file: pkg.module,
            format: 'esm'
        },
        {
            file: pkg.main,
            format: 'cjs'
        },
        {
            file: 'dist/paypal.browser.js',
            format: 'iife',
            name: 'paypalLoadScript',
            // update the default export to be the loadScript() function
            footer: 'paypalLoadScript = paypalLoadScript.loadScript;'
        }
    ]
};
