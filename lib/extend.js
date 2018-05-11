/**
 * Created by yidi.zhao on 2018/2/8.
 */
let fs = require('fs');
let path = require('path');
let layoutPath = null;
let layoutCache = {};
/**
 * 缓存layouts文件目录
 * @param path
 */
exports.init = function(path) {
    layoutPath = path;
};
/**
 * 解析模版的extend语法
 * @param content
 * @return {*}
 */
exports.parse = function(content) {
    let extendReg = /\{\{#extend[\s]*"(.*?)"[\s]*?\}\}([\s\S]*?)\{\{\/extend\}\}/g;
    let ret = extendReg.exec(content);
    if (!ret) {
        return content;
    }
    let layout = ret[1]; // 继承的布局模板
    let selfContent = ret[2]; // 自己的模板内容
    content = serializeContent(selfContent); // 判断模版的method

    let layoutFile = path.join(layoutPath, layout + '.handlebars');
    let layoutContent = layoutCache[layoutFile] || serializeLayout(layoutFile);

    let newContent = '';

    for (let i = 0, len = layoutContent.length; i < len; i ++) {
        let item = layoutContent[i];
        if (typeof item === 'string') {
            newContent += item;
        } else {
            let ct = content[item.name];
            let str = ct ? ct.content : '';
            let sc = item.content;

            // 如果block里有内容
            if (ct) {
                switch (ct.method) {
                    case 'append': str = sc + str; break;
                    case 'insert': str = str + sc; break;
                    case 'replace': break;
                    default: str = sc + str;
                }
            }
            newContent += str;
        }
    }
    return newContent;
};
/**
 * 格式化layout
 * @param layout
 * @return {Array}
 */
function serializeLayout(layout) {
    let layoutReg = /\{\{#block[\s]*"(.*?)"[\s]*?\}\}([\s\S]*?)\{\{\/block\}\}/g;
    let data = fs.readFileSync(layout, 'utf-8').toString();

    data = data.replace(layoutReg, function(str, blockName, blockContent) {
        return '||block||' + blockName + '~~block~~' + blockContent + '||block||'
    });

    let temp = data.split('||block||');
    let ret = [];
    temp.forEach(function(item) {
        let arr = item.split('~~block~~');
        if (arr.length === 1) {
            ret.push(item);
        } else {
            ret.push({
                name: arr[0],
                content: arr[1]
            });
        }
    });
    layoutCache[layout] = ret;
    return ret;
}
/**
 * 格式化content，将method解析出来
 * @param content
 * @return {{}}
 */
function serializeContent(content) {
    let contentReg = /\{\{#content[\s]*"(\w+)"[\s]*?[mode="]*?(\w+)*?["]*?[\s]*?\}\}([\s\S]*?)\{\{\/content\}\}/g;
    let ret = {};
    content.replace(contentReg, function(str, contentName, method, con) {
        ret[contentName] = {
            method: method || 'append',
            content: con
        };
        return '';
    });
    return ret;
}