/**
 * @author: xuweichen
 * @date: 2014/12/15 16:33
 * @descriptions 给模版渲染提供工具函数，不用依赖框架和BOM,DOM, 后期可能会给服务器端使用
 */
define(function(){
    var Helper,
        imgServers = ['images4', 'images5', 'images6', 'images7', 'images8'],
        host = typeof window === 'undefined' ? global : window;

    Helper = {
        imgShowering: function(url){
            
            return newurl;
        }
    };

    host.Helper = Helper;
    return Helper;
});