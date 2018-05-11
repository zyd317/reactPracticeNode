/**
 * Created by yidi.zhao on 2018/5/11.
 */
let Abstract = require('../../Abstract');

class FetchData extends Abstract{
    requestData(){
        let self = this;
        return new Promise(function(resolve, reject){
            let url = 'http://127.0.0.1/mock/index.js';
            self.zRequest.request(url).then(function(data){
                if(data && data.result && data.code === 0){
                    resolve(data.result);
                } else {
                    reject(data);
                }
            }, function(error){
                reject(error);
            });
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
