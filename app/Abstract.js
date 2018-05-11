/**
 * Abstract-service，保存attr，统一zRequest／logger
 */
"use strict";

let Logger = require("../lib/Logger");
let ZRequest = require("../lib/ZRequest");
let EventEmitter = require('events').EventEmitter;

class Abstract extends EventEmitter{
    constructor(attr){
        super();
        this.attr = attr;
        this.uid = attr && attr.uid;
        this.logger = new Logger(attr);
        this.zRequest = new ZRequest(attr);
    }
    // 快速判断登录
    isLoginQuick(req) {
        return false;
    }
}

module.exports = Abstract;