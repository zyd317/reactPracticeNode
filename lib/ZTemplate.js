/**
 * Created by yidi.zhao on 2018/2/8.
 * 渲染handlebars模版的方法
 * 原理：读取文件，正则匹配，缓存html
 * handlebars只提供了将数据或者模版插入html的功能，但是不负责读取文件等
 */
let fs = require('fs');
let path = require('path');
let handlebars = require('handlebars');
let extend = require('./extend');
let caches = {};
let commonConfig = {
    cache: true
};
/**
 * 初始化模版引擎
 * @type {module.exports}
 */
exports = module.exports = function(app, config) {
    app.engine('handlebars', render());
    app.set('view engine', 'handlebars');
    app.set("views", config.views);
    merge(commonConfig, config);
    // 初始化layout，支持extend
    initLayout(config);
};
/**
 * 渲染页面，解析返回html
 * @return {Function}
 */
function render() {
    return function(viewPath, options, callback) {
        renderView({
            config: commonConfig,
            viewPath: viewPath,
            options: options
        }).then(function(html) {
            callback(null, html);
        }).catch(function(err) {
            callback(err);
        });

    }
}
/**
 * 渲染模版方法，如果caches有走caches，没有的话读文件返回整个html代码段
 * 读文件：readFileSync-->解析extend等特殊字符-->缓存起来解析之后的模版
 * @param conf
 * @return {*} 返回resolve(html)
 */
function renderView(conf) {
    let viewPath = conf.viewPath;
    let options = conf.options;

    let templateFunc = function() {};

    if (commonConfig.cache && caches[viewPath]) {
        templateFunc = caches[viewPath];
    } else {
        // 读取模版文件
        let template = parseExtend(fs.readFileSync(viewPath).toString());
        templateFunc = handlebars.compile(template); // 预编译模板，可以设置模版的数据
        caches[viewPath] = templateFunc;
    }
    let html = '';
    try {
        html = templateFunc(options);
    } catch (e) {
        return Promise.reject(e);
    }
    return Promise.resolve(html);
}
/**
 * 初始化layout组件
 * @param config
 */
function initLayout(config) {
    // 注册layout部件，得到layouts文件夹
    extend.init(path.join(config.views, config.layouts || 'layouts'));
    // 注册partials部件，得到partials文件夹
    registerPartials(path.join(config.views, config.partials || 'partials'));
    // 注册一个helper-"raw helper"，在模板文件里通过{{raw}}即可得到这段代码
    handlebars.registerHelper('raw', function(options) {
        return options.fn();
    });
}
/**
 * 读取该文件夹下面的内容-readdirSync
 * 并且解析extend和partial
 * @param partialsDir
 */
function registerPartials(partialsDir) {
    let walk = function(filePath){
        let files = fs.readdirSync(filePath);
        files.forEach(function(item) {
            let tmpPath = filePath + '/' + item,
                stats = fs.statSync(tmpPath);
            if (stats.isDirectory()) {
                walk(tmpPath);
            } else {
                let isValidTemplate = /\.(html|hbs|handlebars)$/.test(tmpPath);
                if (isValidTemplate) {
                    let ext = path.extname(tmpPath);
                    let templateName = path.relative(partialsDir, tmpPath)
                        .slice(0, -(ext.length)).replace(/[ -]/g, '_').replace(/\\/g, '/');

                    let data = fs.readFileSync(tmpPath, 'utf-8');
                    data = parseExtend(data);
                    // 注册模版，templateName-模版名，data-插入的数据
                    handlebars.registerPartial(templateName, data);
                }
            }
        });
    };
    walk(partialsDir);
}
/**
 * 解析模版中的extend
 * @param content
 */
function parseExtend(content) {
    // 继承解析
    content = extend.parse(content);
    return content;
}
/**
 * 渲染模版,返回html
 * @param templatePath
 * @param data
 * @return {*}
 */
exports.render = function(templatePath, data) {
    let viewPath = path.join(commonConfig.views, templatePath + '.handlebars');
    return renderView({
        config: commonConfig,
        viewPath: viewPath,
        options: data
    });
};
/**
 * 合并配置
 * @param target
 * @param source
 */
function merge(target, source) {
    for (let key in source) {
        if (source.hasOwnProperty(key)) {
            target[key] = source[key];
        }
    }
}