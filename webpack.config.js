const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
        "content/main": "./src/content/main.ts",
        "mainpanel/main": "./src/mainpanel/main.ts",
        "background/main": "./src/background/main.ts"
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },

    mode: "development",

    // Enable sourcemaps for debugging webpack's output.
    devtool: "cheap-module-source-map",

    resolve: {
        extensions: [".ts", ".js"]
    },

    module: {
        rules: [
            {
                test: /\.ts(x?)$/i,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "awesome-typescript-loader"
                    }
                ]
            },
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            }
        ]
    },

    plugins: [
        new CopyPlugin([
            {
                context: './src',
                from: '**/*.js'
            }
        ]),
        // to fix problem with `later` node module loading
        new webpack.DefinePlugin({
            'process.env': { LATER_COV: false }
        }),
    ],

    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    externals: {
        // "react": "React",
        // "react-dom": "ReactDOM"
    }
};
