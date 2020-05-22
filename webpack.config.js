const CircularDependencyPlugin = require("circular-dependency-plugin");
const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "helena.js",
    library: "helena",
    libraryTarget: "umd",
  },

  mode: "development",

  // Enable sourcemaps for debugging webpack's output.
  devtool: "cheap-module-source-map",

  resolve: {
    extensions: [".ts", ".js"],
  },

  module: {
    rules: [
      {
        test: /\.ts(x?)$/i,
        exclude: /node_modules/,
        use: [
          {
            loader: "awesome-typescript-loader",
          },
        ],
      },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader",
      },
    ],
  },

  plugins: [
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      include: /src/,
      failOnError: true,
      cwd: process.cwd(),
    }),
    // to fix problem with `later` node module loading
    new webpack.DefinePlugin({
      "process.env": { LATER_COV: false },
    }),
  ],
};
