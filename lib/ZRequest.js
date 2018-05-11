/**
 * Created by yidi.zhao on 2018/2/7.
 * 封装请求，打印日志
 */
let request = require('request');

const DEFAULT_OPTIONS  = {
    method: 'GET',
    responseDataType: 'json',
    timeout: 10000
};

class ZRequest{

    constructor(attr){
        this.attr = attr || {};
    }

    request(url, options){
        let self = this;
        // 参数兼容, url在options里面
        if(typeof url === "object"){
            options = url;
            url = options.url;
        }

        options = Object.assign({url: url}, DEFAULT_OPTIONS, options);
        return new Promise(function(resolve, reject){
            request(options, function(error, response, body){
                let errorMsg = self._checkError(error, response, body);
                if (!errorMsg) {
                    self._logForSuccess(options, body);
                    try{
                        resolve(JSON.parse(body));
                    }catch(e){
                        resolve(body);
                    }
                }else{
                    self._logForFailure(options, errorMsg);
                    reject(errorMsg);
                }
            });
        })
    }

    _logForFailure(requestOptions, errorMessage) {
        console.error("::请求信息错误" + JSON.stringify(requestOptions), JSON.stringify(errorMessage));
    }

    _logForSuccess(requestOptions, data) {
        console.log(":::请求数据成功：" + JSON.stringify(requestOptions), JSON.stringify(data));
    }

    _checkError(err, response, body) {
        if (err) {
            return '错误:' + err.message;
        }
        if (response.statusCode < 200 || response.statusCode >= 300) {
            //404 500
            return 'http状态码:' + response.statusCode + '  响应实体:' + body;
        }
        if (!body) {
            return '错误:响应实体为空';
        }
    }
}

module.exports = ZRequest;
