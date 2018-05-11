/**
 * 路由入口
 * @type {*}
 */
let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let fs = require('fs');
let zTemplate = require("./lib/ZTemplate");
let app = express(); // express实例

// 路由
let routes = require('./routes/index'); // 默认

// 设置模板引擎,初始化
zTemplate(app, {
    views: __dirname + "/views", // 总模板目录
    layouts: 'layouts' // layout模板目录，默认views/layouts
});

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//路由规则
app.use('/', routes);

// 没有挂载路径的中间件，通过该路由的每个请求都会执行该中间件
// 不同路径的请求，路由到不同router里，相同路径的路由，使用next才会往下一个路由执行
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.error("404 not found");
  // render the error page
  res.status(err.status || 500);
  res.render('error.handlebars');
});

module.exports = app;
