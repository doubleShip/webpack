var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');//自动生成 HTML 文件
var ExtractTextPlugin = require('extract-text-webpack-plugin'); // 单独打包css插件

module.exports = {
    //插件项
    plugins: [
        //自动生成 HTML 文件
        //new HtmlWebpackPlugin({
        //    //favicon:'./src/img/favicon.ico', //favicon路径
        //    filename:'index.html',    //生成的html存放路径，相对于 path
        //    //template:'./src/view/index.html',    //html模板路径
        //    inject:true,    //允许插件修改哪些内容，包括head与body
        //    hash:true,    //为静态资源生成hash值
        //    minify:{    //压缩HTML文件
        //        removeComments:true,    //移除HTML中的注释
        //        collapseWhitespace:false    //删除空白符与换行符
        //   }
        //}),
        // 单独打包css文件
        new ExtractTextPlugin("css/page/[name].css"),
        // 对应打包公用文件
        new webpack.optimize.CommonsChunkPlugin("js/admin-commons.js", ["page4", "page2"]),
        new webpack.optimize.CommonsChunkPlugin("js/commons.js", ["page3", "admin-commons.js"])
    ],
    //页面入口文件配置
    entry:
    {
        //common: ['jquery','spin'],
        page1 :  path.join(__dirname, 'src/js/page/com1.es6'),
        page3 :  path.join(__dirname, 'src/js/page/com4.es6'),
        page2 :  [path.join(__dirname, 'src/js/page/com2.es6'), path.join(__dirname, 'src/js/page/com3.es6')]//支持数组形式，将加载数组中的所有模块，但以最后一个模块作为输出
    },
    //入口文件输出配置
    output: {
        path: './assets/',
        publicPath: '',
        filename: 'js/page/[name].min.js' // name是基于上边entry中定义的key
    },
    module: {
        //加载器配置,"-loader"其实是可以省略不写的，多个loader之间用“!”连接起来。
        loaders: [
            //{ test: /\.es6$/, loader: 'es6-loader' },
            { test: /\.js?$/, loaders: ['babel'], exclude: /node_modules/ },
            //使用babel-loader来解析js,es6文件
            { test: /\.(js|es6)$/, loader: 'babel-loader', exclude: /node_modules/ },
            //.css 文件使用 style-loader 和 css-loader 来处理
            { test: /\.css$/, loader: 'style!css' },
            //.scss 文件使用 style-loader、css-loader 和 sass-loader 来编译处理
            //对于css文件，默认情况下webpack会把css content内嵌到js里边，运行时会使用style标签内联
            //{ test: /\.scss$/, loader: 'style!css!sass' },
            /////单独编译css文件
            { test: /\.scss$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader!sass-loader") },
            /////
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
        ]
    },
    //其它解决方案配置
    resolve: {
        //查找module的话从这里开始查找
        root: [process.cwd() + '/src', process.cwd() + '/node_modules'], //绝对路径
        //自动扩展文件后缀名，意味着我们require模块可以省略不写后缀名
        extensions: ['', '.js', '.json', '.scss', '.es6', '.css'],
        //模块别名定义，方便后续直接引用别名，无须多写长长的地址
        alias: {
            jQuery: path.join(__dirname,'src/bower_components/jquery/dist/jquery.min.js'),
            zepto: path.join(__dirname,'src/bower_components/zepto/zepto.min.js')
        //    AppStore : 'js/stores/AppStores.js', //后续直接 require('AppStore') 即可
        //    ActionType : 'js/actions/ActionType.js',
        //    AppAction : 'js/actions/AppAction.js',
        //avalon: path.join(__dirname, 'dev/avalon/avalon.shim'), //在正常情况下我们以CommonJS风格引用avalon,以require('avalon')
        //'../avalon': path.join(__dirname, 'dev/avalon/avalon.js')//由于oniui都以是../avalon来引用avalon的，需要在这里进行别名
        }
    }
};