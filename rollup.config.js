import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import pkg from './package.json';

export default {
    input: 'src/main.js',
    plugins: [
        getBabelOutputPlugin({
            presets: ['@babel/preset-env']
        }),
        replace({
            '__VERSION__': pkg.version
        })
    ],
    output: [
        {
            file: pkg.module,
            format: 'esm'
        },
        {
            file: pkg.main,
            format: 'cjs'
        }
    ]
};
