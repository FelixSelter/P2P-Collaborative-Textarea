export default {
    target: 'web',
    mode: 'development',
    entry: '/src/index.js',
    output: {
        filename: 'CollaborativeTextarea.js',
        library: {
            name: 'collaborativeTextarea',
            type: 'window',
        },
    },
    externals: {
        automerge: 'Automerge',
        peerjs: 'peerjs',
    },
};