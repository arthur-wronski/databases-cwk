const webpack = require('webpack');

module.exports = {
  // other webpack configurations...

  plugins: [
    // ... other plugins
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ],
};