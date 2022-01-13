let path = require('path')

module.exports = {
    mode: 'development',
    entry: {
        main: path.join(__dirname, '/src/main.js')
    },
    output: {
        path: path.join(__dirname, '/dist'),
        filename: '[name].js',
    },
    devServer: {
        port: 8080,
    },
};