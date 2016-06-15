var path = require('path');
var webpack = require('webpack');
var merge = require('webpack-merge');
var ProgressBarPlugin = require('progress-bar-webpack-plugin');
var babelMerge = require('./babel-merge');
var ExtractTextPlugin = require("extract-text-webpack-plugin"); //单独打包css
var HtmlWebpackPlugin = require("html-webpack-plugin");//html模板生成插件

//输出HTML和CSS等等文件到路径的插件
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = function(options) {
    var dir = options.dir || __dirname, //根目录
        mainFile = options.mainFile, //程序入口主文件
        outputPath = options.outputPath, //编译输出文件目录
        needbabelPath = options.needbabelPath || "./", //需babel的目录
        outputPublicPath = options.outputPublicPath, //服务路径,用于热替换服务器
        mode = options.mode || process.env.NODE_ENV || 'dev', //编译模式
        host = options.host || "localhost",
        port = options.port,
        vendor = options.vendor || [],
        htmlTemplet = options.htmlTemplet || {}, //html模板配置
        baseUrl = 'http://' + host + ':' + port;

    if (mode === 'development') mode = 'dev';
    if (mode === 'production') mode = 'prod';

    ////////////////////////////////////////////////////////////////////////////////
    // BASE
    ////////////////////////////////////////////////////////////////////////////////

    var babelQueryBase = {
        presets: ["es2015", "stage-1", "react","stage-0"], //es6,es7,react解析器
        //plugins: ["transform-decorators-legacy"], //ES7的方法Decorator的转码器
        cacheDirectory: true // 默认false,当设定后，给定的文件夹会缓存加载器的结果。之后的webpack构建就会优先尝试从缓存中读取来避免安规的Babel编译过程。
    };

    var config = {
        context: dir,
        entry: [],
        output: {
            //绝对路径,用于输出到位置,文件输出目录
            path: outputPath,
            //服务路径,用于热替换服务器,用于配置文件发布路径，如CDN或本地服务器
            publicPath: outputPublicPath,
            pathinfo: true,
            chunkFilename: "[name].chunk.js", //公用文件打包文件
            filename: "[name].js"      //根据入口文件输出的对应多个文件名
        },
        resolve: {
            extensions: ['', '.js', '.jsx', '.json', '.es6'], // 以这些后缀结尾的文件可忽略后缀
            //root: path.join(__dirname, '../app')
            //配置别名，在项目中可缩减引用路径
            alias: {
                //'react': pathToReact
                //moment: "moment/min/moment-with-locales.min.js"
            }
        },
        module: {
            //各种加载器，即让各种文件格式可用require引用
            loaders: [
                //使用babel-loader来解析js,es6文件
                {
                    test: /\.(js|es6|jsx)$/,
                    loader: ['babel-loader'],
                    //指定作用范围,这里可不写,但是范围越小速度越快
                    include: path.resolve(dir, needbabelPath),
                    //排除目录,exclude后将不匹配
                    exclude: /node_modules/,
                    query: babelQueryBase
                },
                //.scss 文件使用 style-loader、css-loader 和 sass-loader 来编译处理
                //对于css文件，默认情况下webpack会把css content内嵌到js里边，运行时会使用style标签内联
                { test: /\.scss$/, loader: 'style!css!sass' },
                //图片文件使用 url-loader 来处理，小于8kb的直接转为base64
                //{ test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'},
                //图片资源在加载时先压缩，然后当内容size小于~10KB时，会自动转成base64的方式内嵌进去
                //当图片大于10KB时，则会在img/下生成压缩后的图片，命名是[hash:8].[name].[ext]的形式
                //hash:8的意思是取图片内容hushsum值的前8位，这样做能够保证引用的是图片资源的最新修改版本，保证浏览器端能够即时更新
                {
                    test: /\.(jpe?g|png|gif|svg)$/i,
                    loaders: [
                        'image?{bypassOnDebug: true, progressive:true, optimizationLevel: 3, pngquant:{quality: "65-80"}}',
                        'url?limit=10000&name=img/[hash:8].[name].[ext]'
                    ]
                },
                {
                    test: /\.(woff|eot|ttf)$/i,
                    loader: 'url?limit=10000&name=fonts/[hash:8].[name].[ext]'
                }
            ],
            noParse: [] //noParse 是 webpack 的另一个很有用的配置项，如果你 确定一个模块中没有其它新的依赖 就可以配置这项，webpack 将不再扫描这个文件中的依赖。
        },
        plugins: [
            new ProgressBarPlugin(),
            //预加载的插件
            new webpack.PrefetchPlugin("react"),
            new webpack.PrefetchPlugin("react/lib/ReactComponentBrowserEnvironment")
        ]
    };

    //////////////////////////////////////////////////////////////////////////////////
    ////  DEVELOPMENT
    //////////////////////////////////////////////////////////////////////////////////
    //
    if (mode === 'dev') {
        config = merge.smart(config, {
            // 生成sourcemap,便于开发调试,正式打包请去掉此行或改成none
            devtool: "eval",// eval生成 sourcemap 的不同方式
            //入口文件,需要处理的文件路径
            entry: [
                'webpack/hot/dev-server',
                'webpack-dev-server/client?'+baseUrl,
                //上面2个是开发的时候用的热替换服务器
                path.resolve(dir, mainFile)
            ],
            module: {
                //各种加载器，即让各种文件格式可用require引用
                loaders: [
                    //使用babel-loader来解析js,es6,jsx文件
                    {
                        test: /\.(js|es6|jsx)$/,
                        loader: 'babel',
                        //指定作用范围,这里可不写,但是范围越小速度越快
                        include: path.resolve(dir, needbabelPath),
                        //排除目录,exclude后将不匹配
                        exclude: /node_modules/,
                        query: babelMerge(babelQueryBase, {
                            "plugins": [
                                //这个插件通过任意转换的方式去封装React组件。可以随心所欲的摆弄组件了
                                ["react-transform", {
                                    "transforms": [
                                        {
                                            //一个React转换装置，该装置通过引用Hot Module Replacement API使热重载 React 的类成为可能
                                            "transform": "react-transform-hmr",
                                            // 如果你使用React Native，這裡要改用"react-native"
                                            "imports": ["react"],
                                            "locals": ["module"]
                                        },
                                        {
                                            //呈现React组件的错误信息
                                            "transform": "react-transform-catch-errors",
                                            //捕获异常时用redbox-react来对错误进行更加友好的反馈
                                            "imports": ["react", "redbox-react"]
                                        }
                                    ]
                                }]
                            ]
                        })
                    }
                ]
            },
            plugins: [
                //热替换插件
                new webpack.HotModuleReplacementPlugin(),
                //允许错误不打断程序
                new webpack.NoErrorsPlugin()
            ]
        })
    }

    ////////////////////////////////////////////////////////////////////////////////
    //  PRODUCTION
    ////////////////////////////////////////////////////////////////////////////////

    if (mode === 'prod') {
        process.env.NODE_ENV = 'production';
        config = merge.smart(config, {
            entry: {
                "js/app": path.join(dir, 'src/js/app.jsx'),
                "js/vendor" : vendor // 第三方库包
            },
            module: {
                loaders: [
                    {
                        test: /\.(js|es6|jsx)$/,
                        loader: 'babel',
                        exclude: /node_modules/,
                        query: babelMerge(babelQueryBase)
                    },
                    {//单独打包css文件
                        test: /\.scss$/,
                        loader:  ExtractTextPlugin.extract('style', 'css!autoprefixer!sass')
                    }
                ],
                //noParse: ["react"]
            },
            resolve: {
                alias: {//重定向
                    //react: "react/dist/react.min.js",
                    //moment: "moment/min/moment-with-locales.min.js"
                }
            },
            //声明一个外部依赖,该文件不会打包进去,但是要在html页面引入
            externals: {
                //'react': 'React'
            },
            autoprefixer: { //浏览器兼容前缀
                browsers: ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4']
            },
            plugins: [
                //js文件的压缩
                new webpack.optimize.UglifyJsPlugin({
                    compressor: {
                        warnings: false
                    }
                    //except: ['$super', '$', 'exports', 'require']    //排除关键字
                }),
                //将公共代码抽离出来合并为一个文件
                new webpack.optimize.CommonsChunkPlugin({
                    name:"js/vendor",
                    filename:"js/vendor.bundle.js",
                    minChunks:3 //// 提取至少3个模块共有的部分
                }),
                //单独打包css
                new ExtractTextPlugin("css/styles.css"),
                //HtmlWebpackPlugin，模板生成相关的配置，每个对于一个页面的配置，有几个写几个
                new HtmlWebpackPlugin(htmlTemplet),
                //减小打包文件大小
                new webpack.DefinePlugin({
                    'process.env.NODE_ENV': '"production"'
                })
            ]
        });
    }

    return config;

};
