define(['c', 'cPageView', 'TuanStore', 'TuanModel'], function (c, PageView, TStore, TModel) {
    'use strict';
    var colaDraw = TModel.ColaDrawModel.getInstance(); //果粒橙抽奖验证
    var colaPrize = TStore.ColaPrizeStore.getInstance(); //果粒橙中奖结果
    var rPhoneNum = /^1[3458]\d{9}$/; //手机号正则表达式
    var rDrawCode = /^[A-Za-z0-9]{13}$/; //抽奖码正则表达式
    var DOWNLOAD_LINK = 'http://m.ctrip.com/m/c312'; //android app下载地址
    var SOURCE_ID_FOR_COLA = '55559355'; //可乐活动sourceid

    var View = PageView.extend({
        bindEvent: function () {
            var self = this;
            $('#J_phoneNum').bind('focus', function () {
                self.els.phoneNum.parent().removeClass('onerror');
            });
            $('#J_drawCode').bind('focus', function () {
                self.els.drawCode.parent().removeClass('onerror');
            });
            $('#J_openDraw').bind('click', $.proxy(this.openDraw, this));
        },
        pageid: '260005',
        hasAd: true,
        /**
        * 根据业务需求更新sourceid和app下载地址
        */
        updateAdInfo: function () {
            var footer = this.footer,
                rootBox = footer && footer.rootBox,
                wrap = rootBox && rootBox.find('#dl_app');

            if (wrap && wrap.length) {
                wrap.attr('data-appurl', 'ctrip://wireless?v=2&extendSourceID=' + SOURCE_ID_FOR_COLA); //唤醒APP
                rootBox.find('#app_link').attr('href', DOWNLOAD_LINK);
            };

        },
        onCreate: function () {
            this.els = {
                phoneNum: $('#J_phoneNum'),
                drawCode: $('#J_drawCode'),
                drawAnim: $('#J_drawAnim')
            }
            this.bindEvent();
            this._networkMonitor();
            //更新广告信息
            this.updateAdInfo();
        },
        onShow: function () {
        },
        onHide: function () {
        },
        openDraw: function () {
            var self = this;
            var phoneNum = $.trim(this.els.phoneNum.val());
            var drawCode = $.trim(this.els.drawCode.val());
            if (!rPhoneNum.test(phoneNum)) {
                this.els.phoneNum.parent().addClass('onerror');
                this.showToast('请输入正确的手机号码');
                return;
            }
            if (!rDrawCode.test(drawCode)) {
                this.els.drawCode.parent().addClass('onerror');
                this.showToast('请输入正确的抽奖码');
                return;
            }

            colaDraw.setParam({
                tel: phoneNum,
                pin: drawCode
            });
            colaDraw.execute(function (data) {
                var err;
                if (data.ResponseStatus.Ack === 'Success') {
                    colaPrize.set(data);
                    self.els.drawAnim.show(); //动画持续0.5s
                    setTimeout(function () { //动画结束后跳到领奖页面
                        self.jump('/webapp/tuan/pages/cola.prize.html');
                    }, 500);
                } else {
                    err = data.ResponseStatus.Errors[0];
                    self.showToast(err ? err.Message : '亲，服务器错误，请您再抽一次');
                }
            }, function (err) {
                self.showToast('亲，服务器错误，请您再抽一次');
            }, false, this);
        },
        _networkTips: function () {
            if (!this.networktips) {
                this.networktips = new c.ui.Alert({
                    message: '喝前摇一摇<br><br>检查网络再试一次',
                    buttons: [{
                        text: '知道了',
                        click: function () {
                            this.hide();
                        }
                    }]
                });
            }
            this.networktips.show();
        },
        _networkMonitor: function () {
            var self = this;
            window.addEventListener('online', function () {
                self.showToast('亲，您网络恢复了');
            });
            window.addEventListener('offline', function () {
                self._networktips();
            });
        }
    });
    return View;
});
