export default {
    entry: 'src/ExperimentJS.js',
    // dest: 'build/js/experimentJS.min.js',
    format: 'iife',
    sourceMap: 'inline',
    targets: [
        {
            format: 'umd',
            moduleName: 'ExperimentJS',
            dest: 'build/experimentJS.js'
        }

    ]
};