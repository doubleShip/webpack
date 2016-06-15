/**
 * Created by yvan on 16/6/5.
 */
var webpack = require('webpack');
var path = require('path');
var makeConfig = require('./webpack/make-wp-config');

var serverConfig = {
	mode: 'prod',  //编译模式(dev,prod)
	dir : __dirname,
	srcPath : './src', //静态资源的目录 相对路径
	mainFile : path.join(__dirname, './src/js/app.jsx'), //程序入口主文件
	outputPath : path.join(__dirname, "dist"),  //编译输出文件目录
	outputPublicPath : "/", //服务路径,用于热替换服务器,用于配置文件发布路径，如CDN或本地服务器,默认当前根目录
	needbabelPath : 'src/js/', //指定作用范围,这里可不写,但是范围越小速度越快,默认跟目录
	vendor : ['react','react-dom','moment','react-redux','react-tap-event-plugin','material-ui','react-data-components','react-highcharts'], // 第三方库单独文件打包
	htmlTemplet : { //根据模板插入css/js等生成最终HTML
		title: "测试",//页面标题
		//favicon: './dist/img/favicon.ico', //favicon路径，通过webpack引入同时可以生成hash值
		filename: 'index.html', //生成的html存放路径，相对于path
		template: './src/templet/index.html', //html模板路径
		inject: 'body', //js插入的位置，true/'head'/'body'/false
		hash: true, //为静态资源生成hash值
		chunks: ["js/app","js/vendor"],//需要引入的chunk，不配置就会引入所有页面的资源
		minify: { //压缩HTML文件
			removeComments: true, //移除HTML中的注释
			collapseWhitespace: true //删除空白符与换行符
		}
	}
};



var webpackConfig = makeConfig(serverConfig);

//console.log(webpackConfig);
webpack(webpackConfig, function(err, stats){
	if(err) {
		console.log(err);
	}
	else {
		console.log("success")
	}
});


