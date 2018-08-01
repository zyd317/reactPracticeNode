/**
 * Created by yidi.zhao on 2018/5/11.
 *
 * 负责请求数据和清洗数据，使用emit像页面传送数据
 * 数据的格式是，与前端对应的，类似于store的结构，reducerName-key，reducerValue-value.前后端数据都是不可变
 */
let Abstract = require('../../Abstract');
let FetchIndexData = require('./fetchIndexData');
let changeDateParser = require('../parses/changeDateParser');
let flightListParser = require('../parses/flightListParser.js');
let filterParser = require('../parses/filterParser.js');
let co = require('co');

let moduleMap = {
    changeDate: changeDateParser,
    flightList: flightListParser,
    filter: filterParser
};

class Service extends Abstract{
    constructor(attr){
        super(attr);
        this.FetchData = new FetchIndexData(attr);
    }

    /**
     * 请求这个页面需要的所有接口,同步进行
     * @param req
     * @return {Promise.<Promise>}
     */
    requestAll(req) {
        let self = this;
        return Promise.all([
            self.FetchData.getData(req)
        ]);
    }

    start(req) {
        let self = this;
        co(function *(){
            let indexData = yield self.requestAll(req); // 首先同步请求页面所需数据
            let dataObj = {};
            /**
             * 清洗数据，将key作为moduleName，value.parse作为config
             * self.emit("data") 将数据分块发送到页面中
             */
            for(let module in moduleMap){
                dataObj[module] = {
                    module: module,
                    config: moduleMap[module].parse.call(self, indexData[0])
                };
                self.emit("data", dataObj[module]);
            }

            let end = {
                module: "home",
                config: {
                    loading: false,
                    error: false,
                    errorInfo:''
                }
            };
            self.emit("end", end);
        }).catch(function(error){
            let data = {
                module: "home",
                config: {
                    loading: false,
                    error: true,
                    errorInfo: error
                }
            };
            self.emit("error", data);
        });
    }
}
module.exports = Service;