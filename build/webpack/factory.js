import fs from 'fs';
import path from 'path';
import { identity, noop } from 'lodash-es';
import hash from 'string-hash';
import autoprefixer from 'autoprefixer';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import nodeExternals from 'webpack-node-externals';
import {
  BannerPlugin,
  DefinePlugin,
  HotModuleReplacementPlugin,
  LoaderOptionsPlugin,
  NamedModulesPlugin,
  NoEmitOnErrorsPlugin,
  optimize,
  ProvidePlugin,
} from 'webpack';

import config from '../../config';
import packageJson from '../../package.json';
import WriteManifestPlugin from './plugins/WriteManifestPlugin';


const babelrc = (() => {
  const raw = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', '.babelrc')));
  return {
    ...raw,
    babelrc: false,
    presets: [
      ['es2015', { modules: false }],
      ...raw.presets.filter(name => !name.includes('es2015')),
    ],
  };
})();

const postcssOptions = {
  ident: 'postcss',
  sourceMap: true,
  plugins() {
    return [
      autoprefixer({ browsers: ['last 2 versions'] }),
    ];
  },
};

const stylusLoaders = ({ production, client }) => {
  const options = {
    importLoaders: 2,
    modules: true,
    localIdentName: production ? '[hash:base64:8]' : '[path][name]--[local]--[hash:base64:5]',
  };
  if (client) {
    return production
      ? ExtractTextPlugin.extract({
        use: [
          {
            loader: 'css-loader',
            options,
          },
          {
            loader: 'postcss-loader',
            options: postcssOptions,
          },
          {
            loader: 'stylus-loader',
          },
        ],
      }) : [
        {
          loader: 'style-loader',
          options: { singleton: true },
        },
        {
          loader: 'css-loader',
          options,
        },
        {
          loader: 'postcss-loader',
          options: postcssOptions,
        },
        {
          loader: 'stylus-loader',
        },
      ];
  }
  return [
    {
      loader: 'css-loader/locals',
      options,
    },
    {
      loader: 'postcss-loader',
      options: postcssOptions,
    },
    {
      loader: 'stylus-loader',
    },
  ];
};

const cssLoaders = ({ production, client }) => {
  if (client) {
    return production
      ? ExtractTextPlugin.extract({
        use: 'css-loader',
      }) : [
        {
          loader: 'style-loader',
          options: { singleton: true },
        },
        {
          loader: 'css-loader',
        },
      ];
  }
  return [
    {
      loader: 'css-loader/locals',
    },
  ];
};

const svgoOptions = {
  plugins: [],
  floatPrecision: 2,
};

const svgoCleanupIdsPlugin = resource => ({
  cleanupIDs: {
    // Prevent inline svgs having conflicting ids
    prefix: `svg${hash(path.relative(__dirname, resource))}-`,
  },
});

const urlLoader = {
  loader: 'url-loader',
  options: {
    limit: 5120,
    name: '[name]-[hash:6].[ext]',
  },
};

export default function webpackFactory({ production = false, client = false, writeManifestCallback = noop }) {
  return {
    stats: {
      children: false,
    },

    entry: client ? {
      head: [
        path.resolve(__dirname, '..', '..', 'src', 'client', 'head.js'),
      ],
      vendor: [
        'babel-polyfill',
        path.resolve(__dirname, '..', '..', 'src', 'app', 'shims', 'index.js'),
        'react',
      ],
      bundle: [
        !production && 'webpack-dev-server/client?/',
        !production && 'webpack/hot/only-dev-server',
        'react-hot-loader/patch',
        path.resolve(__dirname, '..', '..', 'src', 'client', 'index.js'),
      ].filter(identity),
    } : {
      server: [
        'babel-polyfill',
        path.resolve(__dirname, '..', '..', 'src', 'server', 'index.js'),
      ],
    },

    output: {
      filename: client
        ? `[name]-[${production ? 'chunkhash' : 'hash'}:6].js`
        : '[name].js',
      path: path.resolve(__dirname, '..', '..', 'dist'),
      publicPath: '/static/',
    },

    target: client ? 'web' : 'node',

    externals: [!client && nodeExternals({
      whitelist: [
        /\.css$/,
        /lodash-es/,
        'webpack-dev-server/ssl/server.pem',
      ],
    })].filter(identity),

    devtool: !production || !client
      ? 'inline-source-map'
      : 'hidden-source-map',

    module: {
      rules: [
        {
          test: /\.js$/,
          include: [
            path.join(__dirname, '..', '..', 'src'),
          ],
          use: [
            !production && {
              loader: 'cache-loader',
            },
            {
              loader: 'thread-loader',
            },
            !production && {
              loader: 'react-hot-loader/webpack',
            },
            {
              loader: 'babel-loader',
              options: babelrc,
            },
          ].filter(identity),
        },
        {
          test: /\.js$/,
          include: [
            path.join(__dirname, '..', '..', 'node_modules', 'lodash-es'),
          ],
          use: [
            {
              loader: 'babel-loader',
              options: {
                babelrc: false,
                presets: [['es2015', { modules: false }]],
              },
            },
          ],
        },
        {
          test: /\.geojson$/,
          use: [
            {
              loader: 'json-loader',
            },
          ],
        },
        {
          test: /\.styl$/,
          use: stylusLoaders({ production, client }),
        },
        {
          test: /\.css$/,
          use: cssLoaders({ production, client }),
        },
        {
          test: /\.(?:jpe?g|png|woff2?|eot|ttf)(?:\?.*$|$)/,
          use: [
            urlLoader,
          ],
        },
        {
          test: /^[^.]+(?!\.icon)\.svg$/,
          use: [
            urlLoader,
            ({ resource }) => ({
              loader: 'svgo-loader',
              options: {
                ...svgoOptions,
                plugins: [
                  ...svgoOptions.plugins,
                  svgoCleanupIdsPlugin(resource),
                  { removeTitle: true },
                ],
              },
            }),
          ],
        },
        {
          test: /\.icon\.svg$/,
          use: [
            {
              loader: 'babel-loader',
              options: babelrc,
            },
            ({ resource }) => ({
              loader: 'react-svg-loader',
              options: {
                svgo: {
                  ...svgoOptions,
                  plugins: [
                    ...svgoOptions.plugins,
                    svgoCleanupIdsPlugin(resource),
                    { removeTitle: false },
                  ],
                },
              },
            }),
          ],
        },
        {
          test: /\.txt$/,
          use: [
            {
              loader: 'text-loader',
            },
          ],
        },
        {
          test: /\.pem$/,
          use: [
            {
              loader: 'raw-loader',
            },
          ],
        },
      ],
    },

    plugins: [
      new DefinePlugin({
        __CLIENT__: client,
        __DEVELOPMENT__: !production,
        __SERVER__: !client,
        'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
        'process.env.PUBLIC_URL': JSON.stringify(process.env.PUBLIC_URL || `http://localhost:${config.port}`),
        'process.env.RECAPTCHA_SITEKEY': JSON.stringify(process.env.RECAPTCHA_SITEKEY),
        'process.env.ANALYTICS_TRACKING_ID': JSON.stringify(process.env.ANALYTICS_TRACKING_ID),
        'process.env.PROJECT_HOMEPAGE': JSON.stringify(packageJson.homepage),
      }),
      !client && new DefinePlugin({
        'process.env.CONTACT_EMAIL': JSON.stringify(process.env.CONTACT_EMAIL),
        'process.env.RECAPTCHA_SECRET': JSON.stringify(process.env.RECAPTCHA_SECRET),
      }),
      new ProvidePlugin({
        fetch: 'isomorphic-fetch',
      }),
      new NoEmitOnErrorsPlugin(),
      new optimize.ModuleConcatenationPlugin(),
      !production && new HotModuleReplacementPlugin(),
      !production && new NamedModulesPlugin(),
      client && new optimize.CommonsChunkPlugin({
        name: 'runtime',
        chunks: ['vendor'],
        minChunks: Infinity,
      }),
      client && new optimize.CommonsChunkPlugin({
        name: 'vendor',
        chunks: ['bundle'],
        minChunks(module) {
          return module.context && module.context.includes('node_modules');
        },
      }),
      client && production && new ExtractTextPlugin({
        filename: '[name]-[contenthash:6].css',
        allChunks: true,
      }),
      !client && !production && new BannerPlugin({
        banner: 'require("source-map-support").install();',
        raw: true,
        entryOnly: false,
      }),
      production && new LoaderOptionsPlugin({
        minimize: true,
      }),
      client && production && new optimize.UglifyJsPlugin({
        sourceMap: true,
      }),
      client && new WriteManifestPlugin({ client, callback: writeManifestCallback }),
    ].filter(identity),

    bail: process.env.CI ? JSON.parse(process.env.CI) : false,

    resolve: {
      extensions: ['.json', '.js', '.styl'],
      modules: [
        'src',
        'node_modules',
      ],
    },
  };
}
