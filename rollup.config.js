import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import { terser } from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';
import pkg from './package.json';

const banner = getBannerText();
const outputConfigForBrowserBundle = {
    format: 'iife',
    name: 'paypalLoadScript',
    // update the default export to be the loadScript() function
    footer: 'paypalLoadScript = paypalLoadScript.loadScript;',
    banner
};
const tsconfigOverride = { exclude: ['node_modules', '**/*.test.ts'] };

export default [
    {
        input: 'src/index.ts',
        plugins: [
            typescript({ ...tsconfigOverride }),
            babel({
                babelHelpers: 'bundled',
                exclude: /node_modules/,
                extensions: ['.ts', '.js']
            }),
            replace({
                '__VERSION__': pkg.version
            }),
            filesize()
        ],
        output: [
            {
                file: pkg.module,
                format: 'esm',
                banner
            },
            {
                file: pkg.main,
                format: 'cjs',
                banner
            },
            {
                file: 'dist/paypal.browser.js',
                ...outputConfigForBrowserBundle
            },
            {
                file: 'dist/paypal.browser.min.js',
                ...outputConfigForBrowserBundle,
                plugins: [terser()]
            }
        ]
    },
    {
        input: 'src/legacy/index.ts',
        plugins: [
            typescript({ ...tsconfigOverride }),
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
                file: 'dist/paypal.legacy.browser.js',
                ...outputConfigForBrowserBundle
            },
            {
                file: 'dist/paypal.legacy.browser.min.js',
                ...outputConfigForBrowserBundle,
                plugins: [terser()]
            }
        ]
    }
];

function getBannerText() {
    const banner = `
/*!
 * paypal-js v${pkg.version} (${new Date().toISOString()})
 * Copyright 2020-present, PayPal, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */`.trim();

    return banner;
}
