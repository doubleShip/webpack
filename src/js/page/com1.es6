/**
 * Created by yvan on 16/4/29.
 */

require('./../../sass/header');
//let $ = require('jQuery');
let aa = "1";
const tt = "test";

window.onload = function(){

	var dom = document.getElementById('test');
	dom.addEventListener("click",function(){
		console.log("nihao");
		require.ensure(['jquery'], function() { // 异步调用方式
			var $ = require("jquery");
			$('#test').html("上帝1111");
		});
	},false);
};