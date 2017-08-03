export default {
    entry: 'src/ExperimentJS.js',
    // dest: 'dist/js/experimentJS.min.js',
    format: 'iife',
    sourceMap: 'inline',
    targets: [
        {
            format: 'umd',
            moduleName: 'ExperimentJS',
            dest: 'dist/experimentJS.js'
        }

    ]
};