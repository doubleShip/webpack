
# READ ME


### webpack打包编译react

- 开发：node dev.js
- 发布：node prod.js

###需要热替换功能
在主文件中增加以下代码：

```
if (module.hot) {
	module.hot.accept();
}
```



