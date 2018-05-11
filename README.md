# 工程
### 描述
    基于react搭建。主要是为了学习react包括redux,webpack,node等知识。
    对应的携程页面：http://m.ctrip.com/html5/flight/swift/domestic/BJS/SHA/2018-02-27 为携程的航班搜索list页
    对应的前端工程地址为：git+https://github.com/zyd317/demo_cp.git

### 启动
    npm i
    node ./bin/start node作为服务器
    访问航班列表页：http://m1.ctrip.com/html5/flight/swift/domestic/BJS/SHA/2018-02-27

### 目录搭建
```bash
.
├── LICENSE
├── app
│   ├── actions 将数据输入到页面中
│   ├── index 页面
│   └── service 为页面提供服务，请求页面需要的数据
├── app.js 路由
├── lib 公共函数
├── bin
│   └── start 入口js
├── middleware 中间件，请求代理
│   ├── apiConfig.js
│   └── proxy.js
├── package.json
├── readme.md
├── routes 路由
│   ├── index.js
└── views 页面
    ├── error.handlebars
    ├── index.handlebars
    ├── partial.handlebars
    └── partials
        └── foot.handlebars
```

### TODOS

- [x] 增加模版渲染 - ZTemplate.js
- [x] 增加统一的请求 - ZRequest.js
- [X] layout
- [ ] 增加数据清洗模块
- [ ] 增加日志收集,引入log4j模块 - ZLogger.js