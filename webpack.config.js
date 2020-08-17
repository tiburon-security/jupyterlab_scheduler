var path = require('path');

var rules = [
    { test: /\.css$/, use: [
        'style-loader',
        'css-loader'
    ]},
    { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, use: 'url-loader?limit=10000&mimetype=image/svg+xml&publicPath=/voila/static/' }
]

var distRoot = path.resolve(__dirname, '..', 'share', 'jupyter', 'templates', 'base', 'static')

module.exports = [
    {
        entry: ['./lib/plugin.js'],
        output: {
            filename: 'index.js',
            path: distRoot,
            libraryTarget: 'amd'
        },
        module: { rules: rules },
        devtool: 'source-map'
    }
]