/**
 * Created by yidi.zhao on 2018/5/11.
 *
 * 请求首页数据
 */
let Abstract = require('../../Abstract');
let url = require('url');
let https = require('https');
let querystring = require('querystring');
let zlib = require('zlib');

class FetchData extends Abstract{
    requestData(req){
        let self = this;
        return new Promise(function(resolve, reject){
            let param = JSON.stringify({
                b: Object.assign(req.query, {"t":"f_flightstatus_list"}),
                c: {}
            });
            self.zRequest.request({
                'url': 'https://m.flight.qunar.com/hy/dynamic/api',
                "method":"post",
                "headers":{
                    "content-type":"application/json"
                },
                "body": param
            }).then(function(data){
                resolve(data);
            }).catch(err => {
                reject(err);
            })
        });
    }

    getData(req) {
        let self = this;
        return new Promise(function (resolve, reject) {
            self.requestData(req).then(function (data) {
                resolve(data);
            }, function (error) {
                reject(error);
            })
        })
    }
}
module.exports = FetchData;
