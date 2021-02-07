import babel, { getBabelOutputPlugin } from "@rollup/plugin-babel";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import pkg from "./package.json";

const tsconfigOverride = {
    exclude: ["node_modules", "**/*.test.ts"],
};

export default [
    // CommonJS
    {
        input: "src/index.ts",
        output: {
            dir: "./",
            entryFileNames: pkg.main,
            format: "cjs",
            globals: {
                react: "React",
            },
        },
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
        ],
        external: ["react"],
    },

    // ESM
    {
        input: "src/index.ts",
        output: {
            file: pkg.module,
            format: "esm",
            globals: {
                react: "React",
            },
            plugins: [
                getBabelOutputPlugin({
                    presets: ["@babel/preset-env"],
                }),
            ],
        },
        plugins: [typescript({ ...tsconfigOverride }), nodeResolve()],
        external: ["react"],
    },
];
