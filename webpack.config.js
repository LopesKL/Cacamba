const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin'); // Importando o Compression Plugin

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    return {
        entry: './src/index.jsx',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: isProduction ? 'bundle.[contenthash].js' : 'bundle.js',
            clean: true,
            publicPath: '/', // Adicione esta linha
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env', '@babel/preset-react'],
                        },
                    },
                },
                {
                    test: /\.css$/,
                    use: [
                        isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                        'css-loader',
                    ],
                },
                {
                    test: /\.(png|jpg|jpeg|gif|svg)$/,
                    type: 'asset/resource',
                },
            ],
        },
        resolve: {
            extensions: ['.js', '.jsx'],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './public/index.html',
                favicon: './public/favicon.ico'  // Certifique-se de fornecer o caminho correto para o favicon
            }),
            ...(isProduction ? [
                new MiniCssExtractPlugin({ filename: 'styles.[contenthash].css' }),
                new BundleAnalyzerPlugin(), // Adiciona o plugin para análise de bundles
                new CompressionPlugin({ // Adiciona a compressão
                    algorithm: 'gzip',
                    test: /\.(js|css|html|svg)$/,
                    threshold: 10240, // Apenas arquivos maiores que 10KB
                    minRatio: 0.8, // Apenas comprime se for 80% ou mais eficaz
                }),
            ] : [
                new webpack.HotModuleReplacementPlugin(), // Adicione o plugin aqui se não estiver funcionando
            ]),
        ],
        devServer: {
            static: {
                directory: path.join(__dirname, 'dist'),
            },
            compress: true, // Habilita compressão no DevServer
            port: 3000,
            open: true,
            hot: true,
            historyApiFallback: true, // Isso garante que o servidor devolve o index.html para URLs não encontradas
        },
        devtool: isProduction ? 'source-map' : 'eval-source-map',
        mode: isProduction ? 'production' : 'development',
        optimization: {
            splitChunks: {
                chunks: 'all', // Divide todos os pacotes possíveis
            },
            runtimeChunk: 'single', // Cria um chunk separado para o runtime
            minimize: isProduction,
            minimizer: [new TerserPlugin()],
            usedExports: true, // Tree shaking para exportações não usadas
        },
    };
};