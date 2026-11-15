const path = require('path');
const fs = require('fs');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

function copyModels() {
  const srcDir = path.resolve(__dirname, 'src/models');
  const destDir = path.resolve(__dirname, 'dist/models');
  fs.mkdirSync(destDir, { recursive: true });
  for (const name of fs.readdirSync(srcDir)) {
    const from = path.join(srcDir, name);
    if (!fs.statSync(from).isFile()) continue;
    fs.copyFileSync(from, path.join(destDir, name));
  }
}

// file-loader never emits .obj/.mtl. Copy the Townscaper export next to the
// built page, which is where main.js requests ./models/.
class CopyModelsPlugin {
  apply(compiler) {
    const copy = (compiler, callback) => {
      try {
        copyModels();
        callback();
      } catch (err) {
        callback(err);
      }
    };
    compiler.hooks.beforeRun.tapAsync('CopyModelsPlugin', copy);
    compiler.hooks.watchRun.tapAsync('CopyModelsPlugin', copy);
  }
}

module.exports = (env, argv) => {
  const mode = (argv && argv.mode) || 'development';
  const isProd = mode === 'production';

  return {
    entry: {
      main: './src/javascripts/main.js'
    },
    mode,
    devtool: isProd ? false : 'inline-source-map',
    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      compress: true,
      port: 8080
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'javascripts/[name].js'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          query: { presets: ['@babel/preset-env'] }
        }, {
          test: /\.glsl$/,
          use: 'raw-loader'
        }, {
          test: /\.css$/,
          use: ['style-loader', MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
        }, {
          test: /\.scss$/,
          use: [
            'style-loader',
            MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader',
            {
              loader: 'sass-loader',
              options: {
                implementation: require('sass')
              }
            }
          ]
        }, {
          test: /\.(html|json|txt|dat|gif|jpg|png|svg|eot|ttf|woff|woff2)$/i,
          use: [{
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: (url, resourcePath, context) => {
                return resourcePath.includes(`${path.sep}images${path.sep}`) ? `images/${url}` : url
              }
            }
          }]
        }
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'stylesheets/main.css',
      }),
      new CopyModelsPlugin()
    ]
  };
};
