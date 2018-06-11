/**
 * Created by yidi.zhao on 2018/5/11.
 */
let express = require('express');
let router = express.Router();
let Action = require('../app/index/action');
let Service = require('../app/index/service');
let proxy = require('../middleware/proxy');

/**
 * 首页
 */
router.get("/index", function(req, res, next){
    let attr = {
        test: false,
        pageId: "index_page"
    };
    let service = new Service(attr);
    new Action(attr, service).execute(req, res, next);
});

// 列表页，不使用bigpipe。因为node没办法获取设备信息
router.get("/list", function(req, res, next){
    res.render('pages/flightList');
});

/**
 * 接口代理，处理跨域请求
 */
router.get("/interface/api/:key", proxy);
router.post("/interface/api/:key", proxy);

module.exports = router;