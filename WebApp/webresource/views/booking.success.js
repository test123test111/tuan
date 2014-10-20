/**
 * 订单完成页面
 * @url: m.ctrip.com/webapp/tuan/bookingsuccess/{orderid}.html
 */
define(['TuanApp', 'libs', 'cUtility', 'TuanStore', 'c', 'cWidgetGuider', 'cWidgetFactory', 'TuanModel', 'TuanBaseView', 'cCommonPageFactory', 'CommonStore', 'Payment', 'text!BookingSuccessTpl', 'text!RecommendTpl'],
    function (TuanApp, libs, Util, TStore, c, WidgetGuider, WidgetFactory, TModel, TuanBaseView, CommonPageFactory, CStore, Payment, html, recommendTpl) {
        'use strict';
        //返回目标页面, 订单号, 团购订单列表, 订单详情Model, 用户相关, 提示信息
        var resultStore, orderId, listStore, detailModel, userStore, MSG,
            Payment = WidgetFactory.create('Payment'),
            Guider = WidgetFactory.create('Guider'),
            Member = WidgetFactory.create('Member'),
            cui = c.ui,
            isInApp = Util.isInApp(),
            EXT = encodeURIComponent('source=groupon'),
            resultStore = TStore.OrderDetailReturnPage.getInstance(),
            submitOrderModel = TModel.TuanSubmitOrder.getInstance(),
            applyOrderModel = TModel.TuanApplyOrder.getInstance(),
            listStore = TStore.TuanOrderListStore.getInstance(),
            detailModel = TModel.TuanOrderDetailModel.getInstance(),
            searchStore = TStore.GroupSearchStore.getInstance(),
            userStore = CStore.UserStore.getInstance(),
            crossRecommendModel = TModel.CrossRecommendModel.getInstance(),
            MSG = {
                pageTitle: '订单完成',
                warningTip: '没有检索到数据!',
                needLoginTip: '需要先登录才能查看订单信息'
            };

        //保留两位有效数字
        function retainTwoDecimal(str) {
            var num = parseFloat(str);
            if (isNaN(num)) {
                return str;
            }

            return Math.round(num * 100) / 100;
        }
        var PageView = CommonPageFactory.create("TuanBaseView");
        var View = PageView.extend({
            pageid: '214016',
            hpageid: '215016',
            hasAd: true,
            render: function () {
                var self = this,
                    user = userStore.getUser(),
                    tpl = _.template(html);

                if (orderId && orderId > 0) {
                    detailModel.setParam({
                        oid: orderId,
                        module: '1', //module 1: 订单完成页   2: 订单详情页
                        auth: user ? user.Auth : '',
                        cityid: searchStore.getAttr('ctyId'),
                        head: CStore.HeadStore.getInstance().get()
                    });
                    detailModel.execute(function (data) {
                        if (data) {
                            if (!data.oid) {
                                self.forwardJump('list', '/webapp/tuan/list');
                                return;
                            }
                            data.user = self.user;
                            data.retainTwoDecimal = retainTwoDecimal;
                            self.$el.html($.trim(tpl(data)));
                            if (data.product && data.product.id) {
                                self.getCrossRecommend(data.product.id);
                            }
                        }
                    }, function () {
                        self.showToast(MSG.needLoginTip, 3, function () {
                            self.redirectToLogin();
                        }, true);
                        return;
                    }, true, this);
                } else {
                    var data = {};
                    data.user = user;
                    data.oid = orderId;
                    data.retainTwoDecimal = retainTwoDecimal;
                    this.$el.html($.trim(tpl(data)));
                }
            },
            events: {
                'click #J_orderDetail': 'viewOrderDetail',
                'click #J_registerBtn': 'redirectToRegister',
                'click #J_tel': 'callPhone',
                'click #J_destLink': 'gotoDestnation',
                'click .J_viewDetail': 'gotoDetail',
                'click .link-more': 'gotoNearList',
                'click #J_tabNav>li': 'recommendSwitch'
            },
            onCreate: function () {
            },
            onLoad: function () {
                orderId = Lizard.P('orderid');
                //如果用户没有登陆，跳转到登陆页面
                if (!userStore.getUser()) {
                    this.redirectToLogin();
                    return;
                }

                var payType = this.getQuery('paytype');
                //支付方式是信用卡或者礼品卡或者混付的，需要调用SubmitOrder接口
                //1: 礼品卡，2: 信用卡, 第三方支付成功
                if (payType == 1 || (payType & 2) == 2 || parseInt(this.getQuery('success'), 10)) {
                    this.submitOrder(function () {
                        this.render();
                    });
                } else {
                    this.render();
                }
                listStore.remove();
                this.setHeader();

                $('#bf_ubt_orderid').val(orderId);
            },
            onShow: function () {
            },
            onHide: function () {
            },
            setHeader: function () {
                var self = this;
                this.header.set({
                    title: MSG.pageTitle,
                    back: true,
                    home: true,
                    view: this,
                    tel: 4000086666,
                    events: {
                        returnHandler: function () {
                            self.forwardJump('home', '/webapp/tuan/home');
                        },
                        homeHandler: function () {
                            self.redirectToIndex();
                        }
                    }
                });
                this.header.show();
            },
            /**
            * 获取交叉推荐
            */
            getCrossRecommend: function (pid) {
                var self = this;
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
                if (currentTarget.hasClass('sta-on')) return;
                currentTarget.addClass('sta-on').siblings().removeClass('sta-on');
                this.$el.find('#J_tabCon .ui-item').hide().eq(index).show();
            },
            /**
            * 跳转到攻略社区
            */
            gotoDestnation: function (e) {
                var target = $(e.target),
                    id = target.attr('data-dest-id'),
                    name = target.attr('data-dest-name');

                Guider.apply({
                    hybridCallback: function () {
                        Guider.jump({
                            module: 'destination/toDestMain',
                            param: {
                                districtId: id,
                                districtName: name
                            },
                            targetModel: 'app'
                        });
                    },
                    callback: function () {
                        location.href = 'http://m.ctrip.com/you/summary/' + id + '.html';
                    }
                });
            },
            callPhone: function (e) {
                e.preventDefault();
                //初始化alert
                this.alert = new cui.Alert({
                    title: '拨打电话',
                    message: '<a href="tel:4008216666">拨打携程客服</a>',
                    buttons: [
                        {
                            text: '取消',
                            click: function () {
                                this.hide();
                            }
                        },
                        {
                            text: '<a href="tel:4008216666" data-phone="4008216666">拨打</a>',
                            click: function (e) {
                                this.hide();
                                Guider.callService();
                            }
                        }
                    ]
                });
                this.alert.show();
            },
            submitOrder: function (callback) {
                var uStore = userStore.getUser(), //用户Store
                    param = {
                        head: CStore.HeadStore.getInstance().get(),
                        SubmitOrder: {
                            OrderID: +this.getQuery('orderid') || this.getPath(0),
                            Ver: 3
                        },
                        Operator: {
                            UID: uStore.UserID,
                            SourceForm: 1
                        }
                    };

                this.showLoading();
                submitOrderModel.setParam(param);
                submitOrderModel.execute(function (data) {
                    this.hideLoading();
                    callback.call(this);
                }, function () {
                    this.hideLoading();
                    callback.call(this);
                }, this, this);
            },
            redirectToIndex: function () {
                TuanApp.tHome();
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
            },
            viewOrderDetail: function () {
                var userInfo = userStore.getUser();
                if (orderId && userInfo && userInfo.Auth) {
                    //记录用户选择的订单号
                    this.showLoading();
                    var data = {
                        Id: orderId,
                        page: 'bookingsuccess'
                    };
                    resultStore.set(data);
                    //跳转到详情页面
                    this.forwardJump('tuanorderdetail', '/webapp/tuan/tuanorderdetail/' + orderId + '.html');
                }
            },
            //跳转到注册页面
            redirectToRegister: function () {
                Member.register();
            },
            //跳转到登陆页面，登陆成功后跳转回来
            redirectToLogin: function () {
                var returnargs = 'from=' + encodeURIComponent('/webapp/tuan/bookingsuccess/' + orderId + '.html');
                Member.memberLogin({ param: returnargs });
            }
        });
        return View;
    });
