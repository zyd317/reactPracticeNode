/**
 * Created by yidi.zhao on 2018/5/11.
 *
 * bigpipe，监听service事件，渲染页面模版
 */
"use strict";
let Abstract = require('./../../Abstract');
let zTemplate = require("../../../lib/ZTemplate");
let co = require('co');

class Action extends Abstract {
    constructor(attr, service){
        super(attr);
        this.service = service;
    }

    toModuleScript(data){
        return '<script type="text/javascript">window.receive('+ JSON.stringify(data) +')</script>';
    }

    /**
     * 入口，监听service触发的on("data")，on("end")，on("error")，将页面write到html中
     * 并且渲染页面模版
     * @param req
     * @param res
     */
    execute(req, res){
        let self = this;
        this.service.on("data", function(data){
            res.write(self.toModuleScript(data));
        });

        this.service.on("end", function(data){
            res.write(self.toModuleScript(data));
            res.end("</html>");
        });

        this.service.on("error", function(data){
            let errorInfo = data.config.errorInfo;
            if(errorInfo && errorInfo.stack) {
                // 程序报错
                errorInfo = JSON.stringify(errorInfo.stack);
            } else {
                // 后端报错
                errorInfo = JSON.stringify(errorInfo);
            }
            self.logger.error('请求失败,' + errorInfo);
            res.write(self.toModuleScript(data));
            res.end("</html>");
        });

        /**
         * 渲染index模版
         */
        co(function *(){
            //渲染模版-ota页-先获取模版渲染信息，模版渲染-
            let layout = yield zTemplate.render('pages/index', {
                serverTime: new Date().getTime(),
                pageId: self.attr.pageId,
                title: 'index'
            });
            res.write(layout);
            self.service.start(req);

        }).catch(function(error){
            self.logger.error(error);
            res.end(error.stack);
        });
    }
}
module.exports = Action;