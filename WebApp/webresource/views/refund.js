/**
 * 申请退款
 * @url: m.ctrip.com/webapp/tuan/refund/{orderid}.html
 */
define(['TuanApp', 'libs', 'c', 'cUtility', 'cWidgetFactory', 'CommonStore', 'cWidgetGuider', 'cWidgetMember', 'TuanModel', 'TuanBaseView', 'cCommonPageFactory', 'text!RefundTpl'], function (TuanApp, libs, c, Util, WidgetFactory, CStore, WidgetGuider, WidgetMember, TuanModels, TuanBaseView, CommonPageFactory, html) {
    'use strict';
    var PageView = CommonPageFactory.create("TuanBaseView");
    var Member = WidgetFactory.create('Member'),
        MSG = {
            confirmContent: '退款一旦提交，团购券将不能恢复。请问您是否需要继续退款？',
            confirmNoLabel: '取消',
            confirmYesLabel: '继续退款',
            timeoutTip: '加载超时，请重试'
        },
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

        View = PageView.extend({
            pageid: '260004',
            hpageid: '261004',
            render: function () {
                this.$el.html($.trim(html));
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
                    btnPlus: this.$el.find('#J_plus')
                };
            },
            onCreate: function () {
                this.render();
            },
            events: {
                'click .btn_blue': 'onSubmitRefund',
                'click .minus': 'onCouponMinus',
                'click .plus': 'onCouponPlus',
                'click .apply_refund_reason>li': 'onRefundReasonChange'
            },
            onCouponMinus: function (e) {
                var cur = $(e.currentTarget),
                    tmpPrice = this.tuanCouponPrice,
                    promoCouponPrice = this.promoCouponPrice,
                    num = this.els.refundCount,
                    refundNum = (+num.text()); //退回数量
                if (refundNum <= 1) {
                    this.els.btnMinus.addClass('num_invalid');
                    return;
                }
                refundNum = refundNum <= 0 ? 0 : refundNum - 1;
                num.text(refundNum);
                if (refundNum < this.maxCoupons) {
                    this.els.btnPlus.removeClass('num_invalid');
                }
                if (promoCouponPrice) {
                    tmpPrice = customMult(tmpPrice - promoCouponPrice > 0 ? tmpPrice - promoCouponPrice : 0, refundNum);
                } else {
                    tmpPrice = customMult(tmpPrice, refundNum);
                }
                if (this.refundable) {
                    if (refundNum >= this.maxCoupons && promoCouponPrice) {
                        this.els.refundCouponWrap.show();
                        this.els.refundCouponAmount.text(promoCouponPrice);
                    } else {
                        this.els.refundCouponWrap.hide();
                    }
                    if (this.invoiceAmt > 0) {
                        if (refundNum >= this.maxCoupons) {
                            this.els.refundInvoiceWrap.show();
                            this.els.refundInvoiceAmount.text(this.invoiceAmt);
                        } else {
                            this.els.refundInvoiceWrap.hide();
                        }
                    }
                }
                this.els.refundAmount.text(tmpPrice);
            },
            onCouponPlus: function (e) {
                var cur = $(e.currentTarget),
                    tmpPrice = this.tuanCouponPrice,
                    promoCouponPrice = this.promoCouponPrice, //优惠券单价
                    num = this.els.refundCount,
                    refundNum = (+num.text()); //退回数量
                if (refundNum >= this.maxCoupons) {
                    this.els.btnPlus.addClass('num_invalid');
                    return;
                }
                refundNum = refundNum >= this.maxCoupons ? this.maxCoupons : refundNum + 1;
                num.text(refundNum);
                if (refundNum > 1) {
                    this.els.btnMinus.removeClass('num_invalid');
                }
                if (promoCouponPrice) {
                    tmpPrice = customMult(tmpPrice - promoCouponPrice > 0 ? tmpPrice - promoCouponPrice : 0, refundNum);
                } else {
                    tmpPrice = customMult(tmpPrice, refundNum);
                }
                if (this.refundable) {
                    if (refundNum >= this.maxCoupons && promoCouponPrice) {
                        this.els.refundCouponWrap.show();
                        this.els.refundCouponAmount.text(promoCouponPrice);
                    } else {
                        this.els.refundCouponWrap.hide();
                    }
                    if (this.invoiceAmt > 0) {
                        if (refundNum >= this.maxCoupons) {
                            this.els.refundInvoiceWrap.show();
                            this.els.refundInvoiceAmount.text(this.invoiceAmt);
                        } else {
                            this.els.refundInvoiceWrap.hide();
                        }
                    }
                }
                this.els.refundAmount.text(tmpPrice);
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
                this.promoCouponPrice = data.couponPrice; //优惠券单价

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
                    this.els.refundCount.text(1); //默认退一张

                    if (data.couponAmt > 0) {
                        var tmp = this.tuanCouponPrice - this.promoCouponPrice;
                        this.els.refundAmount.text(tmp > 0 ? tmp : 0);

                        //显示优惠券
                        if (this.refundable && this.maxCoupons == 1) {
                            this.els.refundCouponWrap.show();
                            this.els.refundCouponAmount.text(this.promoCouponPrice);
                        }
                    } else {
                        this.els.refundAmount.text(this.tuanCouponPrice);
                    }
                    //显示快递费用
                    if (this.refundable && this.maxCoupons == 1) {
                        this.els.refundInvoiceWrap.show();
                        this.els.refundInvoiceAmount.text(this.invoiceAmt);
                    }
                }

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
            onSubmitRefund: function () {
                var self = this,
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
                var num = +this.els.refundCount.text(); //退回数量

                if (+num <= 0) {
                    this.showToast("请输入需要回退的数量！");
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
                    ticketlist.push({
                        TicketNO: this.tuanCouponList[i],
                        OrderType: 1,
                        Trmk: reasonText || ''
                    });
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

