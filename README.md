# 工程
### 描述
    基于react搭建。主要是为了学习react包括redux,webpack,node等知识。
    对应的前端工程地址为：https://github.com/zyd317/reactPractice#readme

### 使用
    npm i
    node ./bin/start node作为服务器
    访问demo页：http://m.flight.qunar.com/demoName

### 目录搭建
```bash
.
├── LICENSE
├── app
│── └── index 页面
├── └── action 将数据输入到页面中
├── ├── service 为页面提供服务，请求页面需要的数据
├── ├── parses 数据清洗
├── ├── Abstract.js 抽象类，继承logger,request等工具
├── bin
│   └── start 入口js
├── lib 公共函数
├── app.js 路由
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
- [X] 增加数据清洗模块
- [X] bigpipe输出页面数据
- [X] 请求代理，middleware
- [ ] 增加日志收集,引入log4j模块 - ZLogger.js