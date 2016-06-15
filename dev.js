/**
 * Created by yvan on 16/6/5.
 */
var webpack = require('webpack');
var path = require('path');
var WebpackDevServer = require('webpack-dev-server');
var makeConfig = require('./webpack/make-wp-config');

var serverConfig = {
	mode: 'dev',  //编译模式(dev,prod)
	dir : __dirname,
	host : "localhost",
	port : "3000",
	srcPath : './src', //静态资源的目录 相对路径
	mainFile : path.join(__dirname, './src/js/app.jsx'), //程序入口主文件
	outputPath : path.join(__dirname, "dist"),  //编译输出文件目录
	outputPublicPath : "/", //服务路径,用于热替换服务器,用于配置文件发布路径，如CDN或本地服务器,默认当前根目录
	needbabelPath : 'src/js/'//指定作用范围,这里可不写,但是范围越小速度越快,默认跟目录
};

var webpackConfig = makeConfig(serverConfig);

console.log(webpackConfig);

new WebpackDevServer(webpack(webpackConfig), {
	historyApiFallback: true,
	hot: true, //自动刷新
	inline: true,
	progress: true,
	contentBase: serverConfig.srcPath, //静态资源的目录 相对路径,相对于当前路径 默认为当前config所在的目录
	publicPath: serverConfig.outputPublicPath
}).listen(serverConfig.port, serverConfig.host, function (err, result) {
	if (err) {
		return console.log(err);
	}

	console.log('Listening at http://'+serverConfig.host+':'+serverConfig.port+'/');
});


