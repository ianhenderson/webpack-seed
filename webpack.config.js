module.exports = {
    entry: './src/index.js',
    output: {
        path: './dist',
        publicPath: '/assets/',
        filename: 'bundle.js',
        library: 'TestLib',
        libraryTarget: 'umd',
    },
    module: {
        loaders: [
            {
                test: /\.css$/,
                loader: 'style!css!postcss',
            },
            {
                test: /\.less$/,
                loader: 'style!css!postcss!less',
            },
            {
                test: /\.png|jpg|gif$/,
                loader: 'url',
            },
        ]
    },
    devServer: {
        // proxy ajax to real servers
        proxy: {
            '/gen/**': 'http://mlb.com/',
            '/gdcross/**': 'http://mlb.com/',
            '**/shared/**': 'http://mlb.com/',
        },
    }
};