import babel, { getBabelOutputPlugin } from "@rollup/plugin-babel";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import cleanup from "rollup-plugin-cleanup";
import pkg from "./package.json";

const pkgName = pkg.name.split("@paypal/")[1];
const banner = getBannerText();
const tsconfigOverride = {
    exclude: ["node_modules", "**/*.test.ts"],
    target: "es5",
};

export default [
    // CommonJS
    {
        input: "src/index.ts",
        plugins: [
            typescript({
                declaration: true,
                declarationDir: "dist/",
                rootDir: "src/",
                ...tsconfigOverride,
            }),
            nodeResolve(),
            babel({
                babelHelpers: "bundled",
                presets: ["@babel/preset-react"],
            }),
            cleanup({
                comments: "none",
            }),
        ],
        external: ["react"],
        output: [
            {
                file: `dist/cjs/${pkgName}.js`,
                format: "cjs",
                globals: {
                    react: "React",
                },
                banner,
            },
            {
                file: `dist/cjs/${pkgName}.min.js`,
                format: "cjs",
                globals: {
                    react: "React",
                },
                plugins: [terser()],
                banner,
            },
        ],
    },

    // ESM
    {
        input: "src/index.ts",
        plugins: [
            typescript({ ...tsconfigOverride }),
            nodeResolve(),
            cleanup({
                comments: "none",
            }),
        ],
        external: ["react"],
        output: [
            {
                file: `dist/esm/${pkgName}.js`,
                format: "esm",
                globals: {
                    react: "React",
                },
                plugins: [
                    getBabelOutputPlugin({
                        presets: ["@babel/preset-env"],
                    }),
                ],
                banner,
            },
            {
                file: `dist/esm/${pkgName}.min.js`,
                format: "esm",
                globals: {
                    react: "React",
                },
                plugins: [
                    getBabelOutputPlugin({
                        presets: ["@babel/preset-env"],
                    }),
                    terser(),
                ],
                banner,
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
