import babel, { getBabelOutputPlugin } from "@rollup/plugin-babel";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import pkg from "./package.json";

export default {
    input: "src/index.js",
    plugins: [nodeResolve(), babel({ presets: ["@babel/preset-react"] })],
    external: ["react", "prop-types"],
    output: [
        {
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
        {
            file: pkg.main,
            format: "cjs",
            globals: {
                react: "React",
            },
        },
    ],
};
