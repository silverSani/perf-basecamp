const path = require('path');
const zlib = require('zlib');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// build:prod 스크립트의 --node-env=production 으로 설정됩니다.
const isProduction = process.env.NODE_ENV === 'production';

// 히어로 이미지(LCP)는 JS가 실행된 뒤에야 요청되므로, HTML에 preload 태그를 넣어 바로 받기 시작하게 합니다.
// 파일명에 해시가 붙기 때문에 빌드 결과에서 실제 이름을 찾아 넣습니다.
class PreloadHeroImagePlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('PreloadHeroImagePlugin', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tap(
        'PreloadHeroImagePlugin',
        (data) => {
          const assets = Object.keys(compilation.assets);
          const large = assets.find((name) => /^static\/hero\.[^/]*webp$/.test(name));
          const small = assets.find((name) => /^static\/hero-800\.[^/]*webp$/.test(name));
          if (!large || !small) return data;

          data.headTags.unshift({
            tagName: 'link',
            voidTag: true,
            meta: { plugin: 'PreloadHeroImagePlugin' },
            attributes: {
              rel: 'preload',
              as: 'image',
              href: large,
              // Home.tsx의 srcSet/sizes와 같아야 같은 이미지를 두 번 받지 않습니다.
              imagesrcset: `${small} 800w, ${large} 1600w`,
              imagesizes: '100vw',
              fetchpriority: 'high'
            }
          });
          return data;
        }
      );
    });
  }
}

// Keep the assignment's compressed asset size targets from regressing in production builds.
class PerformanceBudgetPlugin {
  apply(compiler) {
    // HtmlWebpackPlugin creates a child compiler; only inspect the page build.
    if (compiler.parentCompilation) return;

    compiler.hooks.compilation.tap('PerformanceBudgetPlugin', (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'PerformanceBudgetPlugin',
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT
        },
        () => {
          if (!compilation.entrypoints.has('main')) return;

          const entrypointFiles = compilation.entrypoints
            .get('main')
            ?.getFiles()
            .filter((file) => file.endsWith('.js')) ?? [];
          const initialJsBytes = entrypointFiles.reduce((total, file) => {
            const asset = compilation.getAsset(file);
            return total + zlib.brotliCompressSync(asset.source.source()).length;
          }, 0);
          const hero = Object.keys(compilation.assets).find((file) => /^static\/hero\.[^/]*webp$/.test(file));
          const heroBytes = hero ? compilation.getAsset(hero).source.size() : 0;

          compilation.getLogger('PerformanceBudgetPlugin').info(
            `Initial JavaScript: ${initialJsBytes} B Brotli (${entrypointFiles.join(', ')})`
          );
          compilation.getLogger('PerformanceBudgetPlugin').info(
            `Hero image: ${heroBytes} B${hero ? ` (${hero})` : ''}`
          );

          if (initialJsBytes >= 60000) {
            compilation.errors.push(
              new Error(`Initial JavaScript budget exceeded: ${initialJsBytes} B Brotli (limit: 60000 B)`)
            );
          }
          if (!hero || heroBytes >= 120 * 1024) {
            compilation.errors.push(
              new Error(`Hero image budget exceeded or asset missing: ${heroBytes} B (limit: ${120 * 1024} B)`)
            );
          }
        }
      );
    });
  }
}

module.exports = {
  entry: './src/index.tsx',
  resolve: { extensions: ['.ts', '.tsx', '.js', '.jsx'] },
  output: {
    // [contenthash]: 내용이 바뀔 때만 파일명이 바뀌므로 CDN·브라우저에 오래 캐시해도 안전합니다.
    filename: isProduction ? '[name].[contenthash:8].js' : '[name].js',
    path: path.join(__dirname, '/dist'),
    clean: true
  },
  devServer: {
    hot: true,
    open: true,
    historyApiFallback: true
  },
  // 프로덕션에서는 1.4MB짜리 소스맵을 배포하지 않습니다.
  devtool: isProduction ? false : 'eval-cheap-module-source-map',
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      meta: {
        description: 'Memegle - 원하는 GIF를 빠르게 검색하는 GIF 검색 엔진'
      }
    }),
    new PreloadHeroImagePlugin(),
    ...(isProduction ? [new PerformanceBudgetPlugin()] : []),
    new CopyWebpackPlugin({
      patterns: [{ from: './public', to: './public' }]
    }),
    new Dotenv()
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/i,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader'
        }
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif|webp|mp4)$/i,
        loader: 'file-loader',
        options: {
          name: isProduction ? 'static/[name].[contenthash:8].[ext]' : 'static/[name].[ext]'
        }
      }
    ]
  },
  optimization: {
    // production 빌드에서 Terser로 JS를 압축(minify/uglify)합니다.
    minimize: isProduction,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // 자주 바뀌지 않는 라이브러리를 분리해 앱 코드만 바뀐 배포에서도 캐시를 재사용합니다.
        vendor: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler|@remix-run)[\\/]/,
          name: 'vendor',
          chunks: 'all'
        }
      }
    }
  }
};
