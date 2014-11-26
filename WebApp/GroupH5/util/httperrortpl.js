define([], function () {
    var _tpl={
        500:"服务器出错，请稍后再试！",
        404:"连接失败，网络不给力哦！",
        408:"网络不给力哦，请在更好的网络环境下使用！"
    };
    var getTpl=function(code){
        return _tpl[code];
    };
    var Manage = {
        getMessage: function(httperr){
            var status=httperr.status,msg=httperr.statusText;
            if(status>=500){
                switch(status){
                    case 500:
                        msg=getTpl(500,{});
                        break;
                    default:
                        msg=getTpl(500,{});
                        break;
                }
            }else if(status>=400){
                switch(status){
                    case 408:
                        msg=getTpl(408,{});
                        break;
                    case 404:
                        msg=getTpl(404,{});
                        break;
                    default:
                        msg=getTpl(404,{});
                        break;
                }
            }else{
                msg=getTpl(404,{});
            }
            return msg;
        }
    };
    return Manage;
});