/**
 * @file 请求代理
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
  let origin = url.parse(req.url);
  let originQuery = origin.query;
  let body = req.body;
  let hasQuery = !!urlObj.query;

  // 处理query参数，将请求的参数追加到最终代理接口上
  if (originQuery) {
      urlObj.path += (hasQuery ? '&' : '?') + originQuery;
      urlObj.query = hasQuery ? urlObj.query + '&' + originQuery : originQuery;
      urlObj.href += (hasQuery ? '&' : '?') + originQuery;
  }

  urlObj.headers = req.headers;
  urlObj.method = req.method;

  urlObj.headers.host = urlObj.host;
  // 处理POST数据
  if (req.method === 'POST') {
      if (req.headers['content-type'] === 'application/json') {
          postData = JSON.stringify(body);
      } else {
          postData = querystring.stringify(body);
      }
  }
  // 纠正content-length
  urlObj.headers['content-length'] = postData.length;

  let client = urlObj.protocol === 'https:' ? https : http;
  let proxy = client.request(urlObj, function (response) {
    res.status(response.statusCode);
    res.set(response.headers);
    response.pipe(res);

    let contentType = response.headers['content-type'];
    let encoding = response.headers['content-encoding'];
    let canUnZip = encoding === 'gzip' || encoding === 'deflate';
    let isTextFile = /(text|xml|html|plain|json|javascript|css)/.test(contentType);
    let _data = '';

    if (canUnZip && isTextFile) {
      let unzipStream = encoding === 'gzip' ? zlib.createUnzip() : zlib.createInflate();

      unzipStream.on('data', function (chunk) {
        _data += chunk;
      });

      response.pipe(unzipStream).on('end', logAPI);
    } else {
      response.on('data', function (data) {
        _data += data.toString();
      });

      response.on('end', logAPI);
    }

    function logAPI () {
      console.info('接口代理请求完成，请求信息:', JSON.stringify(urlObj), '状态:', response.statusCode, '请求参数: ', postData, '响应的数据：', _data);
    }
  });

  // req.pipe(proxy);

  if (req.method === 'POST') {
    proxy.write(postData);
  }

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
