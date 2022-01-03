export default {
    mode: 'production',
    entry: '/src/index.js',
    output: {
        filename: 'CollaborativeTextarea.prod.js',
        library: 'collaborativeTextarea',
        libraryTarget: 'umd',
    },
};