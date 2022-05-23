const path = require("path");
const nodeExternals = require("webpack-node-externals");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    index: path.join(__dirname, "src/index.ts"),
    "index.test": path.join(__dirname, "src/index.test.ts"),
  },
  output: {
    filename: "[name].js",
    path: `${__dirname}/build`,
    libraryTarget: "commonjs2",
  },
  externals: [nodeExternals()],
  target: "node",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  optimization: {
    minimize: false,
  },
  performance: {
    hints: false,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.join(__dirname, "src/maps"),
          to: `${__dirname}/build/maps`,
        },
      ],
    }),
  ],
};
