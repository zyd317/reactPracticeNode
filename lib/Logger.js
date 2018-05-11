/**
 * Created by yidi.zhao on 2018/3/15.
 */
class ZLogger{
    constructor(attr){
        this.attr = attr;
    }
    log(data){
        console.log(data);
    }
    info(data){
        console.info(data);
    }
    error(data){
        console.error(data);
    }
}

module.exports = ZLogger;