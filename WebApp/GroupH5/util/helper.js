/**
 * @author: xuweichen
 * @date: 2014/12/15 16:33
 * @descriptions 给模版渲染提供工具函数，不用依赖框架和BOM,DOM, 后期可能会给服务器端使用
 */
define(function(){
    var Helper,
        EMPTY = '',
        RE_IMG_URL = /(.*images)\d+(.*\/([a-z0-9]+)\_.*)/i,
        imgServers = ['4', '5', '6', '7', '8'],
        imgServersCount = imgServers.length,
        host = typeof window === 'undefined' ? global : window;

    function fakemd5(url){
        var rs = RE_IMG_URL.exec(url);
        return rs ? rs[3] : EMPTY;
    }
    /**
     * 等有钱了用真的MD5加密
     * @param str
     * @returns {String} md5串
     */
    function md5(str){
        return fakemd5(str);
    }
    function random(md5){
        return imgServers[md5.charCodeAt(0) % imgServersCount || 0];
    }
    Helper = {
        imgShowering: function(url){
            return url.replace(RE_IMG_URL, '$1'+random(md5(url))+'$2');
        }
    };

    host.Helper = Helper;
    return Helper;
});