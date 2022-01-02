export default {
    mode: 'development',
    entry: '/src/index.js',
    output: {
        filename: '[name].js',
        library: 'collaborativeTextarea',
        libraryTarget: 'umd',
    },
};