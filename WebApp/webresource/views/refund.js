/**
 * 申请退款
 * @url: m.ctrip.com/webapp/tuan/refund/{orderid}.html
 */
define(['TuanApp', 'libs', 'c', 'cUtility', 'cWidgetFactory', 'CommonStore', 'cWidgetGuider', 'cWidgetMember', 'TuanModel', 'TuanBaseView', 'cCommonPageFactory', 'text!RefundTpl', 'NumberStep'], function (TuanApp, libs, c, Util, WidgetFactory, CStore, WidgetGuider, WidgetMember, TuanModels, TuanBaseView, CommonPageFactory, html, NumberStep) {
    'use strict';
    var PageView = CommonPageFactory.create("TuanBaseView");
    var Member = WidgetFactory.create('Member'),
        MSG = {
            confirmContent: '退款一旦提交，团购券将不能恢复。请问您是否需要继续退款？',
            confirmNoLabel: '取消',
            confirmYesLabel: '继续退款',
            timeoutTip: '加载超时，请重试'
        },
        NUM_INVALID_CLS = 'num_invalid',
        isInApp = Util.isInApp(),
        detailModel = TuanModels.TuanOrderDetailModel.getInstance(),
        //订单详情信息
        userStore = CStore.UserStore.getInstance(),
        //用户信息
        refundTicketModel = TuanModels.TuanRefundlTicketModel.getInstance(),
        customMult = function (num, int) {
            var ret = parseFloat(num) * int;
            return Math.round(ret * 100) / 100;
        },
        Guider = WidgetFactory.create('Guider'),
        chooseCls = 'choosed',
        errorCls = 'errorli',

        View = PageView.extend({
            pageid: '260004',
            hpageid: '261004',
            render: function () {
                this.$el.html(html);
                this.els = {
                    productName: this.$el.find('#J_productName'),
                    iscCount: this.$el.find('#J_iscCount'),
                    refundCount: this.$el.find('#J_refundCount'),
                    refundAmount: this.$el.find('#J_refundAmount'),
                    refundCouponWrap: this.$el.find('#J_refundCouponWrap'),
                    refundCouponAmount: this.$el.find('#J_refundCouponAmount'),
                    refundInvoiceWrap: this.$el.find('#J_refundInvoiceWrap'),
                    refundInvoiceAmount: this.$el.find('#J_refundInvoiceAmount'),
                    btnMinus: this.$el.find('#J_minus'),
                    btnPlus: this.$el.find('#J_plus'),
                    $types: this.$el.find('.J_refundType'),
                    $numStep: this.$el.find('.J_numberStep')
                };
            },
            onCreate: function () {
                this.render();
            },
            events: {
                'click .J_btnSubmit': 'onSubmitRefund',
                'click .apply_refund_reason>li': 'onRefundReasonChange',
                'click .J_refundType': 'selectRefundType'
            },
            _createNumberStep: function() {
                var self = this,
                    max = this.maxCoupons,
                    min = 1,
                    curNum = 1;
                this.numberStep = new NumberStep({
                    max: max,
                    min: min,
                    initialVal: curNum < min ? min : curNum,
                    wrap: self.els.$numStep,
                    html: '<i class="minus <%if(initialVal <= min ){ %>num_invalid<%} %>" data-flag="-"></i><span id="J_curNum" class="numtext"><%=initialVal %></span><i data-flag="+" class="plus <%if(initialVal >= max ){ %>num_invalid<%} %>"></i>',
                    onChange: function () {
                        var tmpPrice = self.tuanCouponPrice,
                            promoCouponPrice = self.promoCouponPrice,
                            couponType = self.couponType,
                            num = parseInt(this.getCurrentNum());

                        if (promoCouponPrice) {
                            if (couponType === 2) {
                                if (num === max) {
                                    //单次券，退最后一张的时候需要减去优惠券的价格
                                    tmpPrice = Math.round(tmpPrice * num - promoCouponPrice);
                                } else {
                                    tmpPrice = Math.round(tmpPrice * num);
                                }
                            } else{
                                tmpPrice = customMult(tmpPrice - promoCouponPrice > 0 ? tmpPrice - promoCouponPrice : 0, num);
                            }
                        } else {
                            tmpPrice = customMult(tmpPrice, num);
                        }
                        if (self.refundable) {
                            if (num >= max && promoCouponPrice) {
                                self.showCouponLabel(promoCouponPrice);
                            } else {
                                self.els.refundCouponWrap.hide();
                            }
                            if (self.invoiceAmt > 0) {
                                if (num >= max) {
                                    self.showInvoiceLabel(self.invoiceAmt);
                                } else {
                                    self.els.refundInvoiceWrap.hide();
                                }
                            }
                        }

                        self.els.refundAmount.text(tmpPrice);
                    }
                });
            },
            showCouponLabel: function(price) {
                this.els.refundCouponWrap.show();
                this.els.refundCouponAmount.text(price);
            },
            showInvoiceLabel: function(invoice) {
                this.els.refundInvoiceWrap.show();
                this.els.refundInvoiceAmount.text(this.invoiceAmt);
            },
            onRefundReasonChange: function (e) {
                var cur = $(e.currentTarget),
                reasontext = cur.text();
                cur.parent().find("li").removeClass("choosed");
                cur.addClass("choosed");
                if (reasontext == "其他") {
                    this.$el.find(".reason_other_text").show();
                } else {
                    this.$el.find(".reason_other_text").hide();
                }
            },
            loadDetail: function () {
                this.showLoading();
                detailModel.setParam({
                    oid: this.orderId,
                    head: detailModel.getHead().get() //head丢掉了，重新设置
                });
                detailModel.execute(function (data) {
                    this.createPage(data);
                    this.hideLoading();
                }, function (error) {
                    this.hideLoading();
                    if (error && error.statusText == 'timeout') {
                        this.showToast(MSG.timeoutTip);
                    }
                }, this, true);
            },
            checkLogin: function () {
                var self = this,
                isLogin = userStore.isLogin();

                //若未登录，则点击按钮就进行登录
                if (!isLogin) {
                    this.showLoading();
                    Member.memberLogin({
                        domain: '//' + document.domain,
                        param: '?t=1&from=' + encodeURIComponent('/webapp/tuan/refund' + this.orderId + '.html'),
                        callback: function () {
                            self.onLoad();
                        }
                    });
                };
                return isLogin;
            },
            createPage: function (data) {
                this.invoiceAmt = data.invoiceAmt;
                this.maxCoupons = 0;  //可退券的数量
                this.tuanCouponList = [];
                this.tuanCouponPrice = 0; //团购券单价
                this.refundable = true; //优惠券、快递费用是否可退

                //优惠券单价,@since20141112 修改为从orderCoupons取数据
                if (data.orderCoupons) {
                    this.promoCouponPrice = data.orderCoupons.price;
                    this.couponType = data.orderCoupons.couponType;
                }

                if (data.coupons && data.coupons.length > 0) {
                    for (var i = 0; i < data.coupons.length; i++) {
                        if (data.coupons[i].isc == true) {
                            this.maxCoupons++;
                            this.tuanCouponPrice = data.coupons[i].amt;
                            this.tuanCouponList.push(data.coupons[i].val);
                        }
                        if (data.coupons[i].status === 2) {
                            //如果有已使用的团购券，则优惠券、快递费用不再可退
                            this.refundable = false;
                        }
                    }
                }

                //如果是门票对接产品
                if (data.product && data.product.category
                    && data.product.category.ctgoryid === 6 && data.product.category.subctgory === 2) {
                    this.$el.find('.J_needHideInTicket').remove();
                }

                if (this.maxCoupons <= 0) {
                    this.alertErrorMsg("", "此订单不支持退款！");
                } else {
                    this.els.productName.text(data.pname);
                    this.els.iscCount.text(this.maxCoupons);

                    this._createNumberStep();
                    //优惠券总额
                    if (data.couponAmt > 0) {
                        this.numberStep.triggerChange();
                    } else {
                        this.els.refundAmount.text(this.tuanCouponPrice);
                    }
                    //显示快递费用
                    if (this.refundable && this.maxCoupons == 1) {
                        this.els.refundInvoiceWrap.show();
                        this.els.refundInvoiceAmount.text(this.invoiceAmt);
                    }
                }

                //是否支持急速退
                this.els.$types.filter('[data-type="1"]')[!!data.isFastRefund ? 'show' : 'hide']();

            },
            alertErrorMsg: function (title, message) {
                var self = this;
                this.alert.setViewData({
                    title: title,
                    message: message,
                    buttons: [{
                        text: '知道了',
                        click: function () {
                            this.hide();
                            self.back();
                        }
                    }]
                });
                this.alert.show();
            },
            onLoad: function () {
                this.orderId = Lizard.P('orderid');
                this.header.set({
                    title: '申请退款',
                    view: this,
                    back: true,
                    home: true,
                    events: {
                        returnHandler: function () {
                            this.back();
                        },
                        homeHandler: function () {
                            TuanApp.tHome();
                        }
                    }
                });

                this.from = decodeURIComponent(Lizard.P('from') || '');
                this.checkLogin() && this.loadDetail();
            },
            selectRefundType: function(e) {
                var $this = $(e.target);
                this.els.$types.removeClass(errorCls)
                    .removeClass(chooseCls);
                $this.closest('.J_refundType').addClass(chooseCls);
            },
            onSubmitRefund: function () {
                var self = this,
                    confirmAlert;

                if (!this.els.$types.filter('.' + chooseCls).length) {
                    this.showToast('请选择退款方式',3, function() {
                        self.els.$types.addClass(errorCls);
                    });
                    return false;
                }

                confirmAlert = new c.ui.Alert({
                        title: MSG.alertTitle,
                        message: MSG.confirmContent,
                        buttons: [{
                            text: MSG.confirmNoLabel,
                            click: function () {
                                this.hide();
                            }
                        }, {
                            text: MSG.confirmYesLabel,
                            click: function () {
                                this.hide();
                                self.submitRefund();
                            }
                        }]
                    });

                confirmAlert.show();
            },
            submitRefund: function () {
                var self = this;
                var reasonText = "";
                var ticketlist = [];
                var num = this.numberStep.getCurrentNum(); //退回数量
                var refundType = this.els.$types.filter('.'+chooseCls).attr('data-type'),
                    ticket;

                if (+num <= 0) {
                    this.showToast("请输入需要退回的数量！");
                    return;
                }
                if (this.maxCoupons <= 0 || this.tuanCouponList.length <= 0) {
                    return;
                }

                var reason = this.$el.find(".apply_refund_reason").find(".choosed");
                if (reason) {
                    reasonText = reason.text();
                    if (reasonText == "其他") {
                        var reasonother = this.$el.find(".reason_other_text>textarea");
                        if (reasonother && reasonother.val() != "") reasonText = reasonother.val();
                    }
                };
                for (var i = 0; i < +num; i++) {
                    ticket = {
                        TicketNO: this.tuanCouponList[i],
                        OrderType: 1,
                        Trmk: reasonText || ''
                    };
                    if (refundType) {
                        ticket.PayBackType = parseInt(refundType, 10);
                    }
                    ticketlist.push(ticket);
                };
                refundTicketModel.setParam({
                    head: CStore.HeadStore.getInstance().get(),
                    AllianceInfo: null,
                    Operator: null,
                    CancelTicketList: ticketlist
                });
                refundTicketModel.execute(function (data) {
                    if (data && data.ResponseStatus.Ack.toLowerCase() == 'failure') {
                        self.showToast('退款失败请重试！');
                        return;
                    }
                    if (self.from) {
                        var url = decodeURIComponent(self.from);
                        if (isInApp) {
                            Guider.cross({ path: 'myctrip', param: url.replace(/^\/webapp\/myctrip\//i, '') });
                        } else {
                            location.href = (location.protocol + '//' + location.host + url);
                        }
                    } else {
                        self.back({orderid: self.orderId});
                    }
                }, function () {
                    this.showToast("申请退款失败！");
                }, this, true)
            },
            onShow: function () { },
            onHide: function () { }
        });

    return View;
});

