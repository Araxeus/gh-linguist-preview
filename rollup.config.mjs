import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default {
    input: 'index.js',
    output: [
        {
            file: 'dist/bundle.js',
            format: 'iife',
        },
        {
            file: 'dist/bundle.min.js',
            format: 'iife',
            plugins: [
                terser({
                    compress: {
                        passes: 2,
                        drop_console: true,
                        drop_debugger: true,
                        pure_funcs: ['console.log'],
                        hoist_funs: true,
                        reduce_vars: true,
                        pure_getters: true,
                        keep_fargs: false,
                        keep_fnames: false,
                    },
                    mangle: {
                        properties: {
                            regex: /^_/,
                        },
                    },
                    output: {
                        comments: false,
                        beautify: false,
                    },
                }),
            ],
        },
    ],
    plugins: [nodeResolve()],
};
