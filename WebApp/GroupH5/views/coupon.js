/**
 * 优惠券页面
 * @url: m.ctrip.com/webapp/tuan/coupon
 * @author: junyizhang
 * @date: 2014-07-04
 */
define(['TuanApp', 'libs', 'c', 'cUtility', 'cUserModel', 'CommonStore', 'TuanStore', 'TuanModel', 'TuanBaseView', 'cCommonPageFactory', 'text!CouponTpl'],
function (TuanApp, libs, c, Util, UserModel, CStore, TStore, TModel, TuanBaseView, CommonPageFactory, html) {
    'use strict';

    var tuanDetailStore = TStore.TuanDetailsStore.getInstance(); //产品相关信息
    var validateCouponModel = TModel.TuanValidateCouponModel.getInstance(); //验证优惠券
    var couponListModel = TModel.TuanCouponListModel.getInstance(); //获取优惠券列表
    var couponListStore = TStore.TuanCouponListStore.getInstance(); //存储的优惠券列表
    var selectedCouponStore = TStore.TuanSelectedCouponStore.getInstance(); //选择的优惠券
    var userStore = CStore.UserStore.getInstance(); //用户信息
    var isInApp = Util.isInApp();
    var CHOOSED = 'choosed';
    var MSG = {
        pageTitle: '使用优惠券',
        invaildCoupon: '优惠券代码无效，请更换优惠券',
        codeNotEmpty: '请输入团购优惠券码',
        errorTry: '发生错误，请重试'
    };

    function dateFormat(date) {
        return new c.base.Date(date).format('Y-m-d');
    }
    var PageView = CommonPageFactory.create("TuanBaseView");
    var View = PageView.extend({
        tpl: html,
        events: {
            'click #J_useCouponToggle': 'useCouponToggle',
            'click #J_clearCoupon': 'clearCoupon',
            'input #J_couponInput': 'showClearIcon',
            'focus #J_couponInput': 'adjustInputPosition',
            'click #J_validateCoupon': 'validateCoupon',
            'click #J_couponList>li': 'selectedCoupon'
        },
        render: function (coupons) {
            coupons = coupons || [];
            var wrap = this.$el;
            var usedCoupon = selectedCouponStore.get();
            var data = {
                coupons: coupons,
                dateFormat: dateFormat,
                notUse: usedCoupon && (usedCoupon.pid == this.pid) && usedCoupon.isNotUse
            };
            this.coupons = coupons;
            wrap.html($.trim(_.template(this.tpl, data)));
            this.els = {
                useCouponToggle: wrap.find('#J_useCouponToggle'),
                couponInput: wrap.find('#J_couponInput'),
                clearCoupon: wrap.find('#J_clearCoupon'),
                couponWrap: wrap.find('#J_couponList'),
                couponList: wrap.find('#J_couponList>li'),
                enterWrap: wrap.find('#J_enterWrap')
            };

            if (coupons.length && usedCoupon && usedCoupon.pid == this.pid) {
                var curr = this.els.couponWrap.find('[data-code="' + usedCoupon.code + '"]');
                if (curr) {
                    curr.addClass(CHOOSED);
                    curr.remove().prependTo('#J_couponList');
                }
            }
        },
        onCreate: function () {
        },
        onLoad: function () {
            this.pid = tuanDetailStore.getAttr('id');
            this._setPageView();
            if (userStore.isLogin()) {
                this.getCouponList();
            } else {
                this.render();
            }
        },
        _setPageView: function () {
            var self = this;
            this.header.set({
                title: MSG.pageTitle,
                back: true,
                home: true,
                view: this,
                tel: 4000086666,
                events: {
                    returnHandler: function () {
                        self.back();
                    },
                    homeHandler: function () {
                        self.redirectToIndex();
                    }
                }
            });
            this.header.show();
        },
        onShow: function () {
            this.setTitle(MSG.pageTitle);
        },
        onHide: function () {
        },
        redirectToIndex: function () {
            TuanApp.tHome();
        },
        useCouponToggle: function (e) {
            var $t = $(e.target);
            if ($t.hasClass(CHOOSED)) {
                //
            } else {
                this.els.couponList.removeClass(CHOOSED);
                selectedCouponStore.remove();
                selectedCouponStore.set({pid: this.pid, isNotUse: true});
                this.back();
            }
        },
        adjustInputPosition: function () {
            this.els.enterWrap[0].scrollIntoView();
            if (!isInApp) {
                document.body.scrollTop = document.body.scrollTop - 48;
            }
        },
        getCouponList: function (cb) {
            var self = this;
            this.showLoading();
            couponListModel.setParam({
                pid: this.pid,
                head: couponListModel.getHead().get()
            });
            couponListModel.execute(function (data) {
                self.render(data.coupons);
                self.hideLoading();
            }, function (err) {
                self.render();
                self.hideLoading();
            }, false, this);
        },
        showClearIcon: function (e) {
            if ($(e.target).val()) {
                this.els.clearCoupon.show();
            } else {
                this.els.clearCoupon.hide();
            }
        },
        clearCoupon: function () {
            this.els.couponInput.val('');
            this.els.clearCoupon.hide();
        },
        validateCoupon: function () {
            var self = this;
            var code = this.els.couponInput.val();
            if (!code) {
                this.showToast(MSG.codeNotEmpty);
                return;
            }

            validateCouponModel.setParam({ code: code, pid: this.pid });
            validateCouponModel.execute(function (data) {
                if (data.res === 1) {
                    var coupon = data.couponInfo;
                    coupon.pid = self.pid;
                    coupon.isInput = true;
                    coupon.code = code;

                    var curr = self.$el.find('li[data-code="' + code + '"]');
                    if (curr) {
                        curr.siblings('.' + CHOOSED).removeClass(CHOOSED);
                        curr.addClass(CHOOSED);
                        //将选择的优惠券移到列表最前
                        curr.remove().prependTo('#J_couponList');
                    }

                    self.els.useCouponToggle.removeClass(CHOOSED);
                    selectedCouponStore.set(coupon);
                    self.back('booking');
                } else {
                    self.showToast(data.msg || MSG.invaildCoupon);
                }
            }, function (err) {
                self.showToast(MSG.errorTry);
            }, false, this);
        },
        selectedCoupon: function (e) {
            var curr = $(e.currentTarget);
            var index = curr.data('index');
            var coupon = this.coupons[index];

            curr.siblings('.' + CHOOSED).removeClass(CHOOSED);
            curr.toggleClass(CHOOSED);
            this.els.useCouponToggle.removeClass(CHOOSED);
            if (!curr.hasClass(CHOOSED)) {
                selectedCouponStore.remove();
            } else {
                if (coupon) {
                    coupon.pid = this.pid;
                    selectedCouponStore.set(coupon);
                }
                this.back('booking');

                //将选择的优惠券移到列表最前
                curr.remove().prependTo('#J_couponList');
            }
        }
    });

    return View;
});
