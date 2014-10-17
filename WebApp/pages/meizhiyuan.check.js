define(['c', 'cUtilityCrypt', 'cPageView', 'CommonStore', 'TuanModel'], function (c, Crypt, PageView, CStore, TModel) {
    'use strict';
    var userStore = CStore.UserStore.getInstance(); //用户信息
    var addPrize = TModel.ColaAddPrizeModel.getInstance(); //果粒橙绑定券

    var View = PageView.extend({
        onShow: function () {
        },
        onHide: function () {
        },
        onCreate: function () {
            var self = this;
            var url = location.href;
            var qs = this._parseQueryString(url);
            var code = qs.couponcode;
            var isLogin = userStore.isLogin();
            if (!isLogin) {
                this.jump('/webapp/myctrip/#account/login?from=' + encodeURIComponent(url));
            } else {
                addPrize.setParam({
                    code: code,
                    head: addPrize.getHead().get()
                });
                addPrize.execute(function (data) {
                    self.jumpPromocode();
                }, function (err) {

                }, false, this);
            }
        },
        //跳到我携的优惠券页面
        jumpPromocode: function () {
            if (location.host.match(/^(localhost|172\.16|127\.0)/i) || location.host.match(/^waptest\.ctrip|^210\.13\.100\.191|fat\d*\.qa\.nt\.ctripcorp\.com/i)) {
                var url = 'https://sinfo.fat19.qa.nt.ctripcorp.com/webapp/promocode/#index';
            } else {
                var url = 'https://sinfo.ctrip.com/webapp/promocode/#index';
            }

            var userInfo = JSON.parse(localStorage.getItem('USERINFO'));
            if (userInfo && userInfo.data && userInfo.data.Auth) {
                var tokenJson = {
                    auth: userInfo.data.Auth
                };
                window.location.href = url + (url.indexOf('?') > 0 ? '&' : '?') + 'token=' + encodeURIComponent(Crypt.Base64.encode(JSON.stringify(tokenJson)));
            } else {
                this.jump('/webapp/myctrip/#account/login?from=' + encodeURIComponent(location.href));
            }
        },
        //将url里的参数解析成hash对象
        _parseQueryString: function(url) {
            url = url.toLowerCase();
            var rUrl =/^[^\?]+\?([\w\W]+)$/;
            var rPara=/([^&=]+)=([\w\W]*?)(&|$)/g;
            var arr = rUrl.exec(url);
            var ret = {};
            if (arr && arr[1]) {
                var strPara = arr[1], result;
                while ((result = rPara.exec(strPara)) != null) {
                    ret[result[1]] = result[2];
                }
            }
            return ret;
        }
    });
    return View;
});
