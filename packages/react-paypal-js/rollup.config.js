import babel, { getBabelOutputPlugin } from "@rollup/plugin-babel";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import cleanup from "rollup-plugin-cleanup";
import preserveDirectivesModule from "rollup-preserve-directives";

import pkg from "./package.json";

const pkgName = pkg.name.split("@paypal/")[1];
const banner = getBannerText();
const tsconfigOverride = {
    exclude: ["node_modules", "**/*.test.ts*"],
    outDir: "./dist",
    target: "es5",
};
const preserveDirectives =
    preserveDirectivesModule.default || preserveDirectivesModule;

export default [
    // CommonJS
    {
        input: "src/index.ts",
        plugins: [
            typescript({
                tsconfig: "./tsconfig.lib.json",
                outputToFilesystem: true,
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
            typescript({
                tsconfig: "./tsconfig.lib.json",
                outputToFilesystem: true,
                ...tsconfigOverride,
            }),
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
                plugins: [getBabelOutputPlugin()],
                banner,
            },
            {
                file: `dist/esm/${pkgName}.min.js`,
                format: "esm",
                globals: {
                    react: "React",
                },
                plugins: [getBabelOutputPlugin(), terser()],
                banner,
            },
        ],
    },

    // V6 ESM build
    // V6 Build Differences:
    // - Uses preserveModules (vs single bundle) to maintain per-file "use client" directives
    // - Externalizes @paypal/paypal-js (vs bundling) to avoid duplicate output files with preserveModules
    // - Externalizes server-only for RSC server/client boundary enforcement
    // - No minified output (consumer bundlers handle minification)
    // - ESM-only (no CJS) as v6 targets modern React/Next.js environments
    {
        input: {
            index: "src/v6/index.ts",
            server: "src/v6/server.ts",
        },
        plugins: [
            typescript({
                tsconfig: "./tsconfig.v6.json",
                outputToFilesystem: true,
            }),
            preserveDirectives(),
            cleanup({
                comments: "none",
            }),
        ],
        external: ["react", /^@paypal\/paypal-js/, "server-only"],
        output: [
            {
                dir: "dist/v6/esm",
                format: "esm",
                preserveModules: true,
                preserveModulesRoot: "src/v6",
                plugins: [getBabelOutputPlugin()],
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
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */`.trim();
}
