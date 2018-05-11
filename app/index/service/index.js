/**
 * Created by yidi.zhao on 2018/5/11.
 */
let Abstract = require('../../Abstract');
let FetchData = require('./fetchData');
let Parser = require('../parses/Parser');
let co = require('co');

let moduleMap = {
    index: Parser
};

class Service extends Abstract{
    constructor(attr){
        super(attr);
        this.FetchData = new FetchData(attr);
    }

    requestAll(req) {
        let self = this;
        return Promise.resolve(
            self.FetchData.getData(req)
        );
    }

    start(req) {
        let self = this;
        co(function *(){
            let otaData = yield self.requestAll(req); // 得到 所需数据
            let dataObj = {};
            for(let module in moduleMap){
                dataObj[module] = {
                    module: module,
                    config: moduleMap[module].parse.call(self, otaData)
                };
                self.emit("data", dataObj[module]);

                let end = {
                    module: "home",
                    config: {
                        loaded: true,
                        error: false,
                        errorInfo:''
                    }
                };
                self.emit("end", end);
            }
        }).catch(function(error){
            let data = {
                module: "home",
                config: {
                    loaded: true,
                    error: true,
                    errorInfo: error
                }
            };
            self.emit("error", data);
        });
    }
}
module.exports = Service;