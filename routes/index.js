/**
 * Created by yidi.zhao on 2018/5/11.
 */
let express = require('express');
let router = express.Router();
let Action = require('../app/index/action');
let Service = require('../app/index/service');
let proxy = require('../middleware/proxy');


//国内touch填单页-分销填单页面
router.get("/index", function(req, res, next){
    let attr = {
        test: false,
        pageId: "index_page"
    };
    // 获取booking请求
    let service = new Service(attr);
    new Action(attr, service).execute(req, res, next);
});

router.get("/interface/api/:key", proxy);

module.exports = router;