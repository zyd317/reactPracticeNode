/**
 * @file 请求代理
 * 数据的解压与压缩。client->server：accept-encoding: gzip, deflate, br 表示支持的压缩方式
 * server->client: content-encoding: gzip。表示服务器使用的压缩方式。Tomcat 开启Gzip
 * client接收到之后自己去解压
 */
'use strict';
let url = require('url');
let https = require('https');
let http = require('http');
let querystring = require('querystring');
let zlib = require('zlib');

/**
 * 接口请求代理，代理接口的地址为: `/api/:key`
 * 给`/api/:key`请求的参数、body以及header信息，会转发给被代理的最终的接口。
 */
module.exports = function (req, res, next) {
    let urlObj = req.url;
    let postData = '';
    let origin = url.parse(req.url); // 解析url
    let originQuery = origin.query; // get查询参数
    let body = req.body; // post查询参数
    let hasQuery = !!urlObj.query; // 有查询参数

    // 处理query参数，将请求的参数追加到最终代理接口上
    if (originQuery) {
        urlObj.path += (hasQuery ? '&' : '?') + originQuery;
        urlObj.query = hasQuery ? urlObj.query + '&' + originQuery : originQuery;
        urlObj.href += (hasQuery ? '&' : '?') + originQuery;
    }

    urlObj.headers = req.headers;
    urlObj.method = req.method;

    urlObj.headers.host = urlObj.host;
    // 处理POST数据的body
    if (req.method === 'POST') {
        if (req.headers['content-type'] === 'application/json') {
            postData = JSON.stringify(body);
        } else {
            postData = querystring.stringify(body);
        }
    }
    urlObj.headers['content-length'] = postData.length; // 纠正content-length

    let client = urlObj.protocol === 'https:' ? https : http; // 获取请求协议

    /**
     * 创建urlObj的请求。
     * 请求到数据之后，保存在日志中，gzip压缩的需要解压，输出正常日志
     * 将response.pipe(res)
     */
    let proxy = client.request(urlObj, function (response) {
        res.status(response.statusCode);
        res.set(response.headers);
        response.pipe(res); // response => res

        let contentType = response.headers['content-type'];
        let encoding = response.headers['content-encoding']; // 获取服务器的压缩方式
        let canUnZip = encoding === 'gzip' || encoding === 'deflate';
        let isTextFile = /(text|xml|html|plain|json|javascript|css)/.test(contentType);
        let _data = '';

        // 开启了服务器压缩模式，需要进行压缩数据的pipe传输，保证日志_data输出不乱码
        if (canUnZip && isTextFile) {
            let unzipStream = encoding === 'gzip' ? zlib.createUnzip() : zlib.createInflate();

            unzipStream.on('data', function (chunk) {
                _data += chunk;
            });
            response.pipe(unzipStream).on('end', logAPI);
        } else {
            // 未开启服务器压缩模式，只需要直接拼接数据即可
            response.on('data', function (data) {
                _data += data.toString();
            });
            // 响应结束之后，在日志中收集_data
            response.on('end', logAPI);
        }

        function logAPI () {
            console.info('接口代理请求完成，请求信息:', JSON.stringify(urlObj), '状态:', response.statusCode, '请求参数: ', postData, '响应的数据：', _data);
        }
    });

    if (req.method === 'POST') {
        proxy.write(postData);
    }

    /**
     * 请求关闭，关闭链接
     */
    res.on('close', function () {
        proxy.abort();
    });

    proxy.end();

    proxy.on('error', function (err) {
        console.error('接口代理请求失败，请求信息:', JSON.stringify(urlObj), '请求参数: ', postData, '错误信息：', err);
        res.json({
            status: 1001,
            message: '网络繁忙，请稍后再试'
        });
    });
};