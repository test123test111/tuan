/*jshint -W030*/
/**
 * 订单详情页
 * @url: m.ctrip.com/webapp/tuan/tuanorderdetail/{orderid}.html
 * @author: li.xx
 * @date: 2014-02-14
 */
define(['TuanApp', 'libs', 'c', 'cUtilityCrypt', 'TuanBaseView', 'cCommonPageFactory', 'cWidgetFactory', 'cUtility', 'cWidgetGuider', 'Payment', 'cWidgetTipslayer', 'CommonStore', 'TuanStore', 'TuanModel', 'text!TuanOrderDetailTpl', 'text!OrderDetailItemTpl', 'text!RecommendTpl', 'CallPhone'],
function (TuanApp, libs, c, Crypt, TuanBaseView, CommonPageFactory, WidgetFactory, Util, WidgetGuider, Payment, t, CStore, TStore, TModel, html, htmlItem, recommendTpl, CallPhone) {
    'use strict';
    //订单详情返回页，用户Store，订单详情Store，订单详情模型，发送信息模型，提示信息
    var resultStore,
        userStore,
        detailStore,
        detailModel,
        msgModel,
        cancelOrderModel,
        deleteOrderModel,
        retryModel,
        crossRecommendModel,
        MSG,
        View,
        contactPhone,
        isInApp = Util.isInApp(),
        EXT = encodeURIComponent('source=groupon'),
        BasePage = CommonPageFactory.create("TuanBaseView"),
        Guider = WidgetFactory.create('Guider');

    Payment = WidgetFactory.create('Payment');
    cancelOrderModel = TModel.TuanCancelOrderModel.getInstance();
    deleteOrderModel = TModel.TuanDeleteOrderModel.getInstance();
    resultStore = TStore.OrderDetailReturnPage.getInstance();
    userStore = CStore.UserStore.getInstance();
    detailStore = TStore.TuanOrderDetailStore.getInstance();
    detailModel = TModel.TuanOrderDetailModel.getInstance();
    msgModel = TModel.TuanSendMsgModel.getInstance();
    retryModel = TModel.TuanRetryPayment.getInstance();
    crossRecommendModel = TModel.CrossRecommendModel.getInstance();

    MSG = {
        'unavailableOrder': '无效订单',
        'pageTitle': '订单详情',
        'timeoutTip': '非常抱歉，由于您刚才提交的服务已超时，请稍后在“我的携程”中查看订单信息或拨打服务电话400-008-6666，以确认您的订单是否提交成功。',
        'sendMsgTitle': '发送券号密码到手机',
        'sendMsg': '发送短信',
        'needOrderID': '必须选择券号哦，亲',
        'alreadySend': '券号和密码已发送至您的手机',
        'sendMsgFailed': '抱歉，发送失败！',
        'pleaseWait': '请等待',
        'sendAgain': '秒后重新发送',
        'orderPending': '正在紧张的为您处理中，请休息一下再来查看吧！',
        'makeCallTitle': '拨打电话',
        'cancel': '取消'
    };
    //保留两位有效数字
    function retainTwoDecimal(str) {
        var num = parseFloat(str);
        if (isNaN(num)) {return str;}
        return Math.round(num * 100) / 100;
    }
    
    View = BasePage.extend({
        pageid: '214018',
        hpageid: '215018',
        hasAd: true,
        tpl: html,
        cooling: false, //是否处于冷却时间
        coolingSec: 0, //冷却剩余时间
        render: function () {
            var self = this,
                userInfo = userStore.getUser();

            this.orderId = Lizard.P('orderid');
            //如果无法获取订单号
            if (!this.orderId) {
                this.showToast(MSG.unavailableOrder, 3, function () {
                    if (resultStore.get()) {
                        self.forwardJump('tuanorderdetail', '/webapp/tuan/tuanorderdetail/' + self.orderId + '.html');
                    } else {
                        if (userInfo && !userInfo.IsNonUser) {
                            //跳转到tuanorderlist
                            TuanApp.gotoExternalPage('myctrip', self.from.replace(/^\/webapp\/myctrip\//i, '') || 'index.html#orders/tuanorderlist');
                        } else {
                            //跳转到首页
                            self.forwardJump('home', '/webapp/tuan/home');
                        }
                    }
                }, true);
            }
            //如果用户没有登陆，跳转到登陆页面
            if (!userInfo) {
                Lizard.goTo('/webapp/myctrip/#account/login?from=' + encodeURIComponent('/webapp/tuan/tuanorderdetail/' + this.orderId+'.html'));
            }

            this.showLoading();
            detailStore.remove();
            detailModel.setParam({ oid: this.orderId, module: 2 }); //module 1: 订单完成页   2: 订单详情页
            //head丢掉了，重新设置
            detailModel.param.head = detailModel.getHead().get();
            detailModel.excute(function (data) {
                var store = data,
                    hasCoupons = store.coupons && store.coupons.length,
                    canRefund = false,
                    product = data.product,
                    channelInfo = product && product.channelInfo,
                    //APP不支持售卖产品，隐藏: 发送券号密码到手机，申请退款，继续支付，取消订单，删除订单
                    appNonsupport = channelInfo && channelInfo.isCorrectChannel;
                self.hideLoading();
                contactPhone = data.contact && data.contact.mphone;
                self.store = data;

                //有券，用户已经登录，且订单不是"支付中", 则显示退款
                //订单状态(status) 1:待支付 2:支付中 3:支付失败 4:支付成功 5:已取消
                if (userStore.isLogin() && data.status != 2) {
                    if (hasCoupons) {
                        var maxCoupons = 0;
                        _.each(store.coupons, function (item) {
                            if (item.isc === true) {
                                maxCoupons++;
                            }
                        });
                        if (maxCoupons) {
                            canRefund = true;
                        }
                        //如果是门票订单，不显示券
                        if (product && product.category &&
                            product.category.ctgoryid === 6 &&
                            product.category.subctgory === 2) {
                            store.coupons = [];
                        }
                    }
                }

                data.canRefund = canRefund;
                data.canDelete = data.isdel;
                data.appNonsupport = appNonsupport;
                data.retainTwoDecimal = retainTwoDecimal;
                self.$el.html($.trim(_.template(self.tpl, data)));

                self.CallPhone = new CallPhone({view: self, ele: '#J_hotelTel'});

                if (data && data.pid) {
                    self.getCrossRecommend(data.pid);
                }
                if (!appNonsupport) {
                    self.showMessage('订单仅供查看，需要进行相关操作请使用电脑登录携程。');
                }
                self.couponsWrap = self.$el.find('#J_couponsWrap');

                if (data.mooncakeStatus != 4) {//当mooncakeStatus==4，是秋季大促销，不需要显示券信息
                    //加载券相关信息
                    self._loadCoupon(self.couponsWrap, store.coupons, appNonsupport, store.status, data.btn);
                }
            }, function (error) {
                // error = {statusText: 'timeout'};
                self.hideLoading();
                if (error && error.statusText == 'timeout') {
                    self.showToast(MSG.timeoutTip);
                }
            }, true, this);
        },
        sortCoupons: function (coupons) {
            var sorted = {},
                newCoupons = [],
                temp;

            if (coupons && coupons.length) {

                coupons.forEach(function (coupon) {
                    temp = sorted[coupon.status] || [];
                    temp.push(coupon);
                    sorted[coupon.status] = temp;
                });

                //未使用>已过期>退款成功>退款中>已使用；
                [1, 3, 5, 4, 2].forEach(function (key) {
                    temp = sorted[key];
                    temp && (newCoupons = newCoupons.concat(temp));
                });
                return newCoupons;
            }
        },
        gotoListPage: function () {
            var self = this;
            var fromUrl = Lizard.P('from'); //url来源
            if (fromUrl) {
                var url = decodeURIComponent(fromUrl).replace(/^\/webapp\/myctrip\//i, '');
                var history = this.getHistory();
                history.stack.pop();
                TuanApp.gotoExternalPage('myctrip', url);
            } else {
                self.back();
            }
        },
        events: {
            'click #J_tuanDetail': 'viewTuanDetail',
            'click #J_refund': 'goToRefundPage',
            'click #J_hotelMap': 'showHotelMap',
            'click #J_retryPayment': 'retryPayment',
            'click .J_sendToPhone': 'sendCouponToPhone',
            'click #J_cancelOrder': 'cancelOrder',
            'click #J_deleteOrder': 'deleteOrder',
            'click #J_viewCoupon': 'jumpPromocode',
            'click #J_immediateUse': 'gotoMooncake',
            'click .J_viewDetail': 'gotoDetail',
            'click .link-more': 'gotoNearList',
            'click #J_tabNav>li': 'recommendSwitch'
        },
        onCreate: function () {
        },
        onLoad: function () {
            var self = this;
                //ftype = this.getQuery('ftype') || '';

            this.from = decodeURIComponent(Lizard.P('from') || '');
            this.setTitle(MSG.pageTitle);
            this.header.set({
                title: MSG.pageTitle,
                back: true,
                view: this,
                tel: { number: 4000086666 },
                home: true,
                events: {
                    homeHandler: function () {
                        var userInfo = userStore.getUser();
                        //移除非会员信息
                        if (userInfo && userInfo.IsNonUser) {
                            userStore.remove();
                        }
                        TuanApp.tHome();
                    },
                    returnHandler: function () {
                        self.gotoListPage();
                    }
                }
            });

            this.header.show();
            this.render();
        },
        onShow: function () { },
        onHide: function () {
            this.hideLoading();
            this._confirm && this._confirm.hide();
            this.CallPhone && this.CallPhone.hideMask();
        },
        /**
        * 获取交叉推荐
        */
        getCrossRecommend: function (pid) {
            var tmpl = _.template(recommendTpl);
            var wrap = this.$el.find('#J_recommendWrap');

            crossRecommendModel.setParam({
                id: pid,
                isInApp: isInApp,
                environment: TuanApp.environment,
                head: CStore.HeadStore.getInstance().get()
            });
            crossRecommendModel.execute(function (data) {
                var groups = data && data.RecommendGroups;
                if (groups.length) {
                    wrap.show();
                    wrap.html(tmpl({ data: groups, pid: pid, city: data.city }));
                } else {
                    wrap.hide();
                }
            }, function () {
                wrap.hide();
            }, this, this);
        },
        recommendSwitch: function (e) {
            var currentTarget = $(e.currentTarget);
            var index = currentTarget.data('index');
            if (currentTarget.hasClass('sta-on')) {return;}
            currentTarget.addClass('sta-on').siblings().removeClass('sta-on');
            this.$el.find('#J_tabCon .ui-item').hide().eq(index).show();
        },
        // nOrderStatus {number} 订单状态
        // update by liwl
        _loadCoupon: function (wrap, coupons, isCorrectChannel, nOrderStatus, btns) {
            if (wrap[0] && coupons) {
                wrap.html(_.template(htmlItem, {
                    isShow: btns && btns.send,  //@since v2.6
                    list: coupons,
                    orderStatus: nOrderStatus | 0
                }));
                if (!isCorrectChannel) {//隐藏: 发送券号密码到手机
                    wrap.find('.J_sendToPhone').hide();
                }
            }
        },
        _sendMsg: function (obj) {
            var self = this,
                coupons = [];

            coupons.push({ 'code': obj.attr('data-id') });
            if (coupons.length === 0) {
                this.showMessage(MSG.needOrderID);
                return;
            }
            //发送信息到手机
            msgModel.setParam({
                head: CStore.HeadStore.getInstance().get(),
                mphone: contactPhone,
                coupons: coupons,
                oid: this.orderId
            });

            var loadingBox = new c.ui.LoadingLayer(function () {
                msgModel.ajax.abort();
                this.hide();
                return;
            });

            loadingBox.show();
            msgModel.execute(function (data) {

                self.hideLoading();
                loadingBox.hide();
                //TODO: 需要验证返回数据类型
                if (data.res) {
                    self.cooling = true;
                    self.coolingSec = 60;
                }
                self.showMessage(MSG.alreadySend);
            }, function () {
                loadingBox.hide();
                self.showToast(MSG.sendMsgFailed, 3);
                self.hideLoading();
            }, false, function () {
                loadingBox.hide();
                self.showToast(MSG.sendMsgFailed, 3);
                self.hideLoading();
            });
        },
        sendCouponToPhone: function (e) {
            // 当订单状态支付失败时不可点击
            if (this.store && this.store.status && this.store.status == 3){
                return;
            }
        
            this._sendMsg($(e.currentTarget));
        },
        _checkChange: function () {
            this.msgBox.show();
            this.msgBox.hide();
            var $rootList, $codeEle, $btn;
            if (!this.msgBox) {
                return;
            }
            $rootList = this.msgBox.root.find('#ticket_list');
            $codeEle = $rootList.find('.code');
            $btn = this.msgBox.root.find('.cui-btns-sure').eq(0);
            $codeEle.off('click');
            //切换勾选状态
            $codeEle.on('click', function (event) {
                var _this = $(event.target),
                method = _this.hasClass('checked') ? 'removeClass' : 'addClass';
                _this[method]('checked');
                $btn.addClass('disable_btn');
                if ($rootList.find('i.checked')[0]) {
                    $btn.removeClass('diabled_btn');
                }
            });
        },
        viewTuanDetail: function () {
            var store = this.store;

            if (store) {
                this.forwardJump('detail', '/webapp/tuan/detail/' + store.pid + '.html');
            }
        },
        /**
        * 从其他BU跳转过来，TuanApp.app.history不会把当前页面添加到历史
        */
        fixHistoryBug: function () {
            var history = TuanApp.app.history,
                curUrl = location.href,
                len = history.length;
            //如果最后一条记录不是当前URL，则任务没有添加到history中
            if (history[len - 1] !== curUrl) {
                history.push(curUrl);
            }
            TuanApp.app.history = history;
        },
        goToRefundPage: function () {
            this.forwardJump('refund', '/webapp/tuan/refund/' + this.orderId + '.html');
        },

        showHotelMap: function (e) {
            var target = $(e.currentTarget),
                coords = target.attr('data-coords').split(','),
                lng = coords[0],
                lat = coords[1],
                hotelName = target.attr('data-hotel-name');

            this.showCommonMap(hotelName, lng, lat);
        },
        getAppUrl: function () {
            return "ctrip://wireless/GrouponHotelOrder?orderId=" + this.orderId;
        },
        /**
        * 重新支付
        */
        retryPayment: function (e) {
            var self = this;
            if ($(e.currentTarget).hasClass('btm_tuan_btn_dis')) {return;}
            retryModel.setParam({
                oids: this.orderId + "",
                head: detailModel.getHead().get()
            });
            retryModel.execute(function (data) {
                var res = data.result && data.result.length ? data.result[0] : {};
                self.hideLoading();
                if (res.CanPay) {
                    var json = JSON.parse(res.ToUrl);
                    var ext = JSON.parse(res.Extend);
                    if (ext) {
                        json.payTypeList = ext.payTypeList || 0;
                        json.subPayTypeList = ext.subPayTypeList || 0;
                    }
                    json.from = isInApp ? '/webapp/tuan/index.html#tuanorderdetail!' + self.orderId : '/webapp/tuan/tuanorderdetail/' + self.orderId + '.html';
                    json.islogin = userStore.isLogin() ? 0 : 1;
                    Payment.submit(self, json, {IsRealPay: data.IsRealPay});
                } else {
                    self.showToast('此订单不支持继续支付！');
                }
            }, function () {
                self.showToast('继续支付失败！');
                self.hideLoading();
            }, true, self);
        },
        showConfirm: function (msg, onConfirm) {
            this._confirm = new c.ui.Alert({
                message: msg,
                buttons: [{
                    text: '否',
                    click: function () {
                        this.hide();
                    }
                }, {
                    text: '是',
                    click: function () {
                        onConfirm();
                        this.hide();
                    }
                }]
            });
            this._confirm.show();
        },
        _sendCancelOrder: function () {
            var self = this,
                title = '申请取消订单';

            cancelOrderModel.setParam({
                oid: self.orderId
            });
            self.showLoading();
            cancelOrderModel.excute(function (data) {
                self.hideLoading();
                if (data.status == 1) {
                    self.showToast(title + '成功！');
                    self.onLoad();
                } else {
                    self.showToast(title + '失败！');
                }
            }, function () {
                self.hideLoading();
                self.showToast(title + '失败！');
            });
        },
        /**
        * 取消订单
        */
        cancelOrder: function () {
            var self = this;

            self.showConfirm('是否确认取消订单？', function () {
                self._sendCancelOrder();
            });
        },
        _sendDeleteOrder: function () {
            var self = this,
                title = '申请删除订单',
                url = self.from || '/webapp/myctrip/index.html#orders/tuanorderlist';

            deleteOrderModel.setParam({
                oid: self.orderId
            });
            self.showLoading();
            deleteOrderModel.excute(function (data) {
                self.hideLoading();
                if (data.status == 1) {
                    self.showToast(title + '成功！');
                    if (isInApp) {
                        Guider.cross({ path: 'myctrip', param: url.replace(/^\/webapp\/myctrip\//i, '') });
                    } else {
                        location.href = (location.protocol + '//' + location.host + url);
                    }
                } else {
                    self.showToast(title + '失败！');
                }
            }, function () {
                self.hideLoading();
                self.showToast(title + '失败！');
            });
        },
        /**
        * 删除订单
        */
        deleteOrder: function () {
            var self = this;

            self.showConfirm('是否确认删除订单？', function () {
                self._sendDeleteOrder();
            });
        },
        /**
         * 跳到我携的优惠券页面
         */
        jumpPromocode: function () {
            var url = 'https://sinfo.ctrip.com/webapp/promocode/#index';
            if (location.host.match(/^(localhost|172\.16|127\.0)/i) || location.host.match(/^waptest\.ctrip|^210\.13\.100\.191|fat\d*\.qa\.nt\.ctripcorp\.com/i)) {
                url = 'https://sinfo.fat19.qa.nt.ctripcorp.com/webapp/promocode/#index';
            }

            var userInfo = JSON.parse(localStorage.getItem('USERINFO'));
            if (userInfo && userInfo.data && userInfo.data.Auth) {
                var tokenJson = {
                    auth: userInfo.data.Auth
                };
                if (isInApp) {
                    Guider.cross({
                        path: 'promocode',
                        param: 'index.html#index?token=' + encodeURIComponent(Crypt.Base64.encode(JSON.stringify(tokenJson)))
                    });
                } else {
                    Lizard.goTo(url + '?token=' + encodeURIComponent(Crypt.Base64.encode(JSON.stringify(tokenJson))));
                }
            } else {
                Lizard.goTo('/webapp/myctrip/#account/login?from=' + encodeURIComponent(location.href));
            }
        },
        gotoMooncake: function () {
            this.forwardJump('home', '/webapp/tuan/home');
        },
        gotoDetail: function (e) {
            var currentTarget = $(e.currentTarget);
            var pid = currentTarget.data('pid');
            if (currentTarget.data('type') == 99) { //当地特色玩乐
                if (isInApp) {
                    Guider.cross({
                        path: 'activity',
                        param: 'index.html#/dest/t' + pid + '.html?ext=' + EXT
                    });
                } else {
                    //跳转到当地玩乐详情页
                    location.href = location.protocol + '//' + location.host + '/webapp/activity/dest/t' + pid + '.html?from=' + encodeURIComponent(location.href) + '&ext=' + EXT;
                }
            } else {
                this.forwardJump('detail', '/webapp/tuan/detail/' + pid + '.html');
            }
        },
        gotoNearList: function (e) {
            var currentTarget = $(e.currentTarget);
            var pid = currentTarget.data('pid');
            var cityId = currentTarget.data('cityid');
            var cityName = currentTarget.data('cityname');
            var type = currentTarget.data('type');
            var title = currentTarget.data('title');
            if (currentTarget.data('type') == 99) { //当地特色玩乐
                if (isInApp) {
                    Guider.cross({
                        path: 'activity',
                        param: 'index.html#/dest/ct-' + cityName + '-' + cityId + '?ext=' + EXT
                    });
                } else {
                    //跳转到当地玩乐列表页
                    location.href = location.protocol + '//' + location.host + '/webapp/activity/dest/ct-' + cityName + '-' + cityId + '.html?from=' + encodeURIComponent(location.href) + '&ext=' + EXT;
                }
            } else {
                this.forwardJump('nearlist', '/webapp/tuan/nearlist?pid=' + pid + '&category=' + type + '&title=' + title);
            }
        }
    });

    return View;
});

/**
 * changelog:
 *  v2.6 新增btns节点，控制按钮（发送券号按钮，退款按钮，取消订单按钮，删除按钮，继续支付按钮）的显示
 */
