/**
 * Created by yvan on 16/4/29.
 */

require('./../../sass/header');
//let $ = require('jQuery');
let aa = "1";
const tt = "test";
//$(function(){
//	console.log(aa);
//	$('#test').on('click',function(){
//		console.log('ok');
//		require.ensure(['zepto'], function() {
//			require('/com4.es6');
//		});
//	});
//});

window.onload = function(){

	var dom = document.getElementById('test');
	dom.addEventListener("click",function(){
		console.log("nihao");
		require.ensure(['jQuery'], function() {
			var $ = require("jQuery");
			$('#test').html("woshi");
		});
	},false);
};