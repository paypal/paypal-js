import replace from "@rollup/plugin-replace";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import pkg from "./package.json";

const pkgName = pkg.name.split("@paypal/")[1];
const banner = getBannerText();
const outputConfigForBrowserBundle = {
    format: "iife",
    name: "paypalLoadScript",
    banner,
    // declare global variables for loadScript() and loadCustomScript()
    footer:
        "window.paypalLoadCustomScript = paypalLoadScript.loadCustomScript;" +
        "\nwindow.paypalLoadScript = paypalLoadScript.loadScript;",
};
const tsconfigOverride = {
    exclude: ["node_modules", "**/*.test.ts"],
};

export default [
    {
        input: "src/index.ts",
        plugins: [
            typescript({ ...tsconfigOverride }),
            replace({
                __VERSION__: pkg.version,
                preventAssignment: true,
            }),
        ],
        output: [
            {
                file: `dist/v5/esm/${pkgName}.js`,
                format: "esm",
                banner,
            },
            {
                file: `dist/v5/esm/${pkgName}.min.js`,
                format: "esm",
                banner,
                plugins: [terser()],
            },
            {
                file: `dist/v5/cjs/${pkgName}.js`,
                format: "cjs",
                banner,
            },
            {
                file: `dist/v5/cjs/${pkgName}.min.js`,
                format: "cjs",
                banner,
                plugins: [terser()],
            },
            {
                file: `dist/v5/iife/${pkgName}.js`,
                ...outputConfigForBrowserBundle,
            },
            {
                file: `dist/v5/iife/${pkgName}.min.js`,
                ...outputConfigForBrowserBundle,
                plugins: [terser()],
            },
        ],
    },
    {
        input: "src/legacy/index.ts",
        plugins: [
            typescript({ ...tsconfigOverride }),
            nodeResolve({
                browser: true,
            }),
            commonjs(),
            replace({
                __VERSION__: pkg.version,
                preventAssignment: true,
            }),
        ],
        output: [
            {
                file: `dist/v5/iife/${pkgName}.legacy.js`,
                ...outputConfigForBrowserBundle,
            },
            {
                file: `dist/v5/iife/${pkgName}.legacy.min.js`,
                ...outputConfigForBrowserBundle,
                plugins: [terser()],
            },
        ],
    },
    {
        input: "src/index-v6.ts",
        plugins: [
            typescript({
                ...tsconfigOverride,
            }),
            replace({
                __VERSION__: pkg.version,
                preventAssignment: true,
            }),
        ],
        output: [
            {
                file: `dist/v6/esm/${pkgName}.js`,
                format: "esm",
                banner,
            },
            {
                file: `dist/v6/esm/${pkgName}.min.js`,
                format: "esm",
                banner,
                plugins: [terser()],
            },
        ],
    },
];

function getBannerText() {
    return `
/*!
 * ${pkgName} v${pkg.version} (${new Date().toISOString()})
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
}
