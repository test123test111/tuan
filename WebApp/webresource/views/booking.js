/**
 * 订单填写页面
 * @url: m.ctrip.com/webapp/tuan/booking
 * @author: li.xx
 * @date: 2014-02-12
 */
define(['TuanApp', 'c', 'cUIInputClear', 'TuanBaseView', 'cCommonPageFactory', 'cUIScrollRadioList', 'cWidgetGuider', 'cWidgetMember', 'cUserModel', 'cUtility', 'cWidgetFactory', 'CommonStore', 'TuanStore', 'TuanModel', 'text!BookingTpl', 'NumberStep', 'cHolidayPriceCalendar', 'ValidatorUtil', 'FieldUtil', 'Payment'],
    function (TuanApp, c, InputClear, TuanBaseView, CommonPageFactory, ScrollRadioList, WidgetGuider, WidgetMember, UserModel, Util, WidgetFactory, CStore, TStore, TModel, html, NumberStep, HolidayPriceCalendar, Validator, Field) {
        'use strict';
        var orderInfo = TStore.TuanOrderInfoStore.getInstance(), //订单信息
            invoiceStore = TStore.TuanInvoiceStore.getInstance(), //发票信息,
            userStore = CStore.UserStore.getInstance(), //用户信息
            tuanDetailStore = TStore.TuanDetailsStore.getInstance(), //产品相关信息
            unionStore = CStore.UnionStore && CStore.UnionStore.getInstance(), //订单存储相关
            createOrderModel = TModel.TuanCreateOrder.getInstance(),
            tuanDetailModel = TModel.TuanDetailModel.getInstance(),
            orderDetailStore = TStore.TuanOrderDetailStore.getInstance(),
            couponListModel = TModel.TuanCouponListModel.getInstance(), //获取优惠券列表
            couponListStore = TStore.TuanCouponListStore.getInstance(), //存储的优惠券列表
            selectedCouponStore = TStore.TuanSelectedCouponStore.getInstance(), //选择的优惠券
            notUserLoginModel = UserModel.NotUserLoginModel.getInstance(), //非会员登录
            searchStore = TStore.GroupSearchStore.getInstance(),
            ticketBookingModel = TModel.TicketBookingModel.getInstance(), //门票对接选择日期
            isInApp = Util.isInApp(),
            headStore = CStore.HeadStore.getInstance(),
            Payment = WidgetFactory.create('Payment'),
            Guider = WidgetFactory.create('Guider'),
            Member = WidgetFactory.create('Member'),
            MSG, //提示信息
            PHONE_NUM_KEY = "电话",
            EN_PHONE_NUM_KEY = "Mobile",
            ORDER_NUM = {
                max: 9,
                min: 1
            }, //产品购买数量
            ERROR_MSGS = {
                100: "操作成功",
                101: "节点数据验证不通过",
                102: "系统程序错误",
                201999: "产品不处于可售状态，不能生成订单",
                201000: "产品没有供应商,生成订单失败",
                201001: "产品已团完,生成订单失败",
                201002: "产品无分销商,生成订单失败",
                201003: "电话格式不符合规范（例：021-10106666-），未能生成订单",
                201004: "产品属0元团购，分销联盟不能生成订单",
                201005: "产品属马上订产品，分销联盟不能生成订单",
                201006: "超过此产品的最大购买数量，不能生成订单",
                201007: "小于此产品的最少购买数量，不能生成订单",
                201008: "本产品携程不开发票，不能生成订单",
                201009: "发票创建失败，不能生成订单",
                201010: "发票信息有误，不能生成订单",
                201012: "本产品每个手机号码仅限购买一次",
                201011: "产品属0元团购，一个手机号只能预订一次",
                301000: "订单取消成功",
                301001: "订单不属于用户或订单不存在",
                301002: "订单状态为非新订单",
                301003: "取消订单失败,订单状态修改失败",
                301004: "订单删除失败",
                301005: "订单删除成功",
                301006: "生成订单失败",
                301007: "订单状态修改失败",
                301008: "订单未查到支付记录",
                301009: "订单不存在",
                301010: "该订单已在处理中",
                401000: "券号或者订单不存在或已更新，券取消失败",
                401001: "更新订单失败，券取消失败",
                401002: "更新券号失败，券取消失败",
                401003: "券使用失败",
                401004: "现渠道和此张券应属于的渠道不同，不能取消券",
                401005: "券取消失败",
                401006: "此张券已使用，不能取消券",
                401007: "此张券已取消，不能再次取消券",
                401008: "此张券已作废，不能取消券",
                401009: "券号已有预约记录,不能使用",
                401010: "券状态:已过期超过两天,不可使用",
                401011: "订单类型错误(1为携程收款，2为对方收款)",
                501000: "联盟信息错误，无法取消券",
                501001: "更新联盟信息失败，未能生成订单",
                501002: "生成券号时发生异常，未能生成订单",
                601000: "信用卡发送扣款请求失败",
                601001: "存在重复流水号",
                601002: "保存信用卡信息错误",
                601003: "增加支付记录失败",
                601004: "调用支付接口失败"
            };

        MSG = {
            submitTitle: '订单提交',
            submitTip: '由于您长时间未提交订单，数据可能已经过时，请返回重新选择',
            pageTitle: '订单填写',
            giftCard: '携程礼品卡',
            cash: '现金',
            alertTitle: '提示信息',
            leaveTips: '您的订单尚未完成，确定要离开吗？',
            cancel: '取消',
            sure: '确定',
            telTips: '请填写正确的手机号码',
            failTips: '抱歉，订单未能成功提交，请重试！',
            timeoutTips: '非常抱歉，由于您刚才提交的服务已超时，请稍后在“我的携程”中查看订单信息或拨打服务电话400-008-6666，以确认您的订单是否提交成功。',
            couponCount: '(<%=count%>张)',
            phoneListTitle: '选择手机号',
            dateNone: '请选择游玩日期',
            telNone: '请输入手机号码',
            telError: '请输入正确的手机号码',
            nameNone: '请输入取票人姓名',
            nameError: '请输入正确的取票人姓名',
            submitting: '提交中...',
            selectDateTitle: '选择日期',
            submitError: '网络不给力，请稍后再试'
        };
        //保留两位有效数字
        //TODO: 与原方法不一致.
        function retainTwoDecimal(str) {
            var num = parseFloat(str);
            if (isNaN(num)) {
                return str;
            }

            return Math.round(num * 100) / 100;
        }
        function isNotEmpty(v) {return !!v;}
        var PageView = CommonPageFactory.create("TuanBaseView");
        var View = PageView.extend({
            pageid: '214015',
            hpageid: '215015',
            tpl: html,
            //当前位置的经纬度
            latlon: null,
            render: function () {
                var self = this,
                    store = tuanDetailStore.get(),
                    userInfo = userStore.getUser(),
                    coupon = selectedCouponStore.get(),
                    order = orderInfo.get();

                this.store = store;
                if (store && store.id) {
                    store.min = store.min > ORDER_NUM.min ? store.min : ORDER_NUM.min;
                    store.max = store.max < ORDER_NUM.max ? ORDER_NUM.max : store.max;

                    store.curNum = (order && order.curNum) || store.min;
                    //优先取用户选择的手机号或最后填写的手机号，次取用户绑定的手机号，再取用户未绑定的手机号
                    store.tel = (order && order.tel) || (userInfo && (userInfo.BMobile || userInfo.Mobile)) || '';
                    store.retainTwoDecimal = retainTwoDecimal;
                    store.user = userInfo;
                    store.isLogin = userStore.isLogin();
                    store.invoice = invoiceStore.get();
                    // 此字段服务有可能不下发 by liwl
                    store.invoiceText = store.invoiceText || null;

                    store.isInApp = isInApp;

                    if (coupon && coupon.pid === store.id) {
                        store.coupon = coupon;
                    } else {
                        store.coupon = undefined;
                    }

                    this.pid = store.id;
                    this.price = store.price.dPrice;

                    this.$el.html($.trim(_.template(this.tpl, store)));
                    this.els = {
                        curNumDom: this.$el.find('#J_curNum'),
                        numStepDom: this.$el.find('.J_numberStep'),
                        pPriceDom: this.$el.find('#J_pPrice'),
                        totalPriceDom: this.$el.find('#J_totalPrice'),
                        telDom: this.$el.find('#J_tel'),
                        submitBtn: this.$el.find('#J_submitOrder'),
                        couponCount: this.$el.find('#J_couponCount'),
                        couponAmount: this.$el.find('#J_couponAmount'),
                        selectDate: this.$el.find('.J_selectDate'),
                        ticketUserDom: this.$el.find('#J_ticketUser')
                    };
                    if (userStore.isLogin()) {
                        this.getCouponList(function (count) {
                            self.els.couponCount.html(_.template(MSG.couponCount, { count: count }));
                        });
                    }
                    this._createNumberStep();
                    this.initValidator();
                } else {
                    this.alert.setViewData({
                        title: MSG.submitTitle,
                        message: MSG.submitTip,
                        buttons: [{
                            text: '知道了',
                            click: function () {
                                var store = tuanDetailStore.get();
                                if (store && store.id) {
                                    self.forwardJump('detail', '/webapp/tuan/detail/' + store.id + '.html');
                                } else {
                                    self.forwardJump('list', '/webapp/tuan/list');
                                }
                                this.hide();
                            }
                        }]
                    });
                    this.alert.show();
                }
            },
            isFreeProduct: function () {
                return this.price <= 0;
            },
            events: {
                'click #J_submitOrder': 'goNextStep',
                'click #J_invoice': function () {
                    this.forwardJump('invoice', '/webapp/tuan/invoice');
                },
                'click #J_coupon': function () {
                    this.forwardJump('coupon', '/webapp/tuan/coupon');
                },
                'click .J_loginBtn': 'loginAction',
                'click #J_selectContact': 'selectContactNew',
                'click .J_selectDate': 'selectDate'   //门票选择日期
            },

            /**
             * 初始化表单验证
             */
            initValidator: function() {
                var self = this;
                this.validator.removeAllFields();

                this.els.selectDate.length && (this.validator.addField(new Field({
                    dom: self.els.selectDate,
                    rules: [isNotEmpty],
                    onCheck: function(rs, d) {
                        if (!rs) {
                            self.showToast(MSG.dateNone, 3,function() {
                                self._addOrRemoveHighLight(d.dom, true);
                                d.dom.focus();
                            });
                        } else {
                            self._addOrRemoveHighLight(d.dom, false);
                        }
                    }
                })));

                this.els.ticketUserDom.length && (this.validator.addField(new Field({
                    dom: self.els.ticketUserDom,
                    rules: [isNotEmpty, function(v) {return v.length <= 10}],
                    onCheck: function(rs, d) {
                        var msg = '';
                        if (!rs) {
                            msg = (d.rule == 0) ? MSG.nameNone : MSG.nameError;
                            self.showToast(msg, 3, function() {
                                self._addOrRemoveHighLight(d.dom, true);
                                d.dom.focus();
                            });
                        } else {
                            self._addOrRemoveHighLight(d.dom, false);
                        }
                    }
                })));

                this.validator.addField(new Field({
                    dom: self.els.telDom,
                    rules: [isNotEmpty, c.utility.validate.isMobile],
                    onCheck: function(rs, d) {
                        var msg = '';
                        if (!rs) {
                            msg = (d.rule == 0) ? MSG.telNone : MSG.telError;
                            self.showToast(msg, 3, function() {
                                self._addOrRemoveHighLight(d.dom, true);
                                d.dom.focus();
                            });
                        } else {
                            self._addOrRemoveHighLight(d.dom, false);
                        }
                    }
                }));
            },
            /**
             * flag为true时增加高亮，否则移除高亮
             * @param $el
             * @param flag
             * @private
             */
            _addOrRemoveHighLight: function($el, flag) {
                $el.closest('li')[flag ? 'addClass' : 'removeClass']('errorli');
            },
            onCreate: function () {
                //orderInfo ? orderInfo.remove() : '';
                this.validator = new Validator();
            },
            getTuanDetail: function (detailId, callback) {
                var callback = $.type(callback) === "function" ? callback.bind(this) : function () { };

                tuanDetailModel.setParam({ id: detailId, environment: TuanApp.environment });
                this.showLoading();
                tuanDetailModel.excute(function (data) {
                    callback();
                    this.hideLoading();
                }, function (err) {
                    var msg = err.msg ? err.msg : '啊哦,数据加载出错了!';
                    var self = this;
                    this.showHeadWarning('团购详情', msg, function () {
                        self.cancelOrder();
                    });
                    this.hideLoading();

                    callback();
                }, false, this);
            },

            loadTuan: function () {
                this.render();
                if (this.isFreeProduct()) {
                    this.numberStep.disable();
                    this.$el.find('#J_invoice').hide();
                };
                if (this.store && this.store.id) {
                    this.isIOS7() && this._fixIOS7Bug();
                    InputClear(this.els.telDom);
                };
            },

            onLoad: function (refer) {
                // 增加外部直接打开订单填写页功能 ，detailid为兼容老版本
                var detailId = Lizard.P('productid') || Lizard.P('detailid');

                this.refer = refer;
                this._setPageView();

                if (detailId && +detailId > 0) {
                    //检查来源，并做保存来源数据 
                    TuanApp.saveUnion();

                    this.getTuanDetail(detailId, this.loadTuan);
                } else {
                    this.loadTuan();
                };
            },
            selectContactNew: function() {
                var self = this;
                Guider.chooseContactFromAddressbook({
                    callback: function (info) {
                        var phones;
                        if (!!info && !_.isEmpty(info)) {
                            if (info.name === undefined && info.phoneList && !info.phoneList.length) {
                                self.showToast("无法访问通讯录，导入失败");
                            } else {
                                if (info.phoneList && info.phoneList.length) {
                                    phones = self._formatPhoneList(info.phoneList);
                                    if (phones.length === 1) {
                                        self.selectPhoneItem(phones[0]);
                                    } else {
                                        new ScrollRadioList({
                                            data: phones,
                                            title: MSG.phoneListTitle,
                                            itemClick: $.proxy(self.selectPhoneItem, self),
                                            key: phones[0].key
                                        }).show();
                                    }
                                }
                            }
                        }
                    }
                });
            },
            /**
             * 门票选择日期 日历功能
             */
            selectDate: function() {
                var self = this,
                    date = this.els.selectDate.attr('data-date') || tuanDetailStore.getAttr('ckintime'),
                    selectCls = 'cui_cld_daycrt';

                //daterange: {sdate: '', edate: ''}
                this.showLoading();
                ticketBookingModel.setParam({pid:self.pid, daterange: {sdate: '', edate:''}});
                ticketBookingModel.excute(function(data) {
                    self.hideLoading();
                    var priceDate = data.plist[0].PDList;
                    _.each(priceDate, function(t) {
                        t.dateStr = t.date;
                        t.date = new Date(self._convertTimeString(t.date));
                        t.price = parseInt(t.price, 10);
                    });
                    self.calendar = new HolidayPriceCalendar({
                        monthsNum: 2,
                        voidInvalid: true, //没有价格的日期是否有效可点,false可点
                        priceDate: priceDate,
                        header: {title: MSG.selectDateTitle},
//                        startPriceTime: priceDate[0] && priceDate[0].date,
                        onShow: function() {
                            //隐藏上一个view， 否则会有bug：日历可以左右滑动且滑到最下面的时候会露出上一个view的内容
                            self.hide();
                            this.$el.find('[data-date="' + date + '"]').addClass(selectCls);
                        },
                        onHide: function() {
                            self.show();
                            this.remove();
                        },
                        callback: function(date, dateStyle, target) {
                            var textVal = self._formatCalendarDate(date) + (dateStyle.holiday || dateStyle.days);
                            this.$el.find('.' + selectCls).removeClass(selectCls);
                            target.addClass(selectCls);
                            self.els.selectDate.val(textVal)
                                .attr('data-date', dateStyle.value);
                            tuanDetailStore.setAttr('ckintimetxt', textVal);//刷新页面后用来做显示
                            self._storeDailyPrice(priceDate, dateStyle.value);

                            //价格可能会改变，需要更新总价格和单价
                            self.numberStep.options.onChange();
                            self._addOrRemoveHighLight(self.els.selectDate);
                            this.hide();
                        }
                    });

                    self.calendar.show();
                }, function(err) {
                    self.hideLoading();
                });

            },
            _storeDailyPrice: function(data, date) {
                var price;
                _.each(data, function(t) {
                    if (t.dateStr == date) {
                        price = t.price;
                        return false;
                    }
                });
                tuanDetailStore.setAttr('ckintime', date);
                tuanDetailStore.setAttr('ticketPrice', price || 0);
            },
            _formatCalendarDate: function(date) {
                (typeof date === 'string') && (date = new Date(this._convertTimeString(date)));
                return (date.getMonth()+ 1) +'月' + date.getDate() + '日 ';
            },
            _convertTimeString: function(dateStr) {
                return dateStr && dateStr.replace(/-/g, '/');
            },
            /**
            * 格式化成scrolllistn能展示的格式
            */
            _formatPhoneList: function (data) {
                return data.map(function (t, i) {
                    t = _.values(t)[0];
                    t = t.replace(/-| /g, '');
                    (t.length > 11) && (t = t.substr(-11, 11));
                    return {key: i + '', val: t};
                });
            },
            /**
             * @param data
             * {key: '', val: ''}
             */
            selectPhoneItem: function (data) {
                var val = data.val;
                if (val) {
                    this.els.telDom.val(val);
                    this.changeBtnState();
                }
            },
            isIOS7: function () {
                var ua = $.os;

                return ua.ios && Math.floor(ua.version) === 7;
            },
            /**
            * 修复iphone5 ios7中提交按钮盖住手机号输入框问题
            */
            _fixIOS7Bug: function () {
                var submitBtnPanel = $('.order_btnbox');

                this.els.telDom.add(this.els.ticketUserDom).on('focus', function () {
                    submitBtnPanel.css({
                        position: 'absolute',
                        bottom: '0px'
                    });
                }).on('blur', function () {
                    submitBtnPanel.css({
                        position: 'fixed',
                        bottom: '0px'
                    });
                })
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
                            self.cancelOrder();
                        },
                        homeHandler: function () {
                            self.redirectToIndex();
                        }
                    }
                });
            },

            onShow: function () {
                this.setTitle(MSG.pageTitle);
                this.hideLoading();
                //如果app里显示通讯录选择按钮
                if (isInApp) {
                    this.$el.find('#J_selectContact').show();
                };
            },

            onHide: function () {
                this.hideLoading();
                this.hideLoadingLayer();
            },

            redirectToIndex: function () {
                TuanApp.tHome();
            },

            cancelOrder: function () {
                var self = this,
                    tStore = tuanDetailStore.get(),
                    returnAlert = new c.ui.Alert({
                        title: MSG.alertTitle,
                        onShow: function () {
                            self.isCanceling = true;
                        },
                        onHide: function () {
                            self.isCanceling = false;
                        },
                        message: MSG.leaveTips,
                        buttons: [{
                            text: MSG.cancel,
                            click: function () {
                                this.hide();
                            }
                        }, {
                            text: MSG.sure,
                            click: function () {
                                var store = tuanDetailStore.get();

                                this.hide();
                                self.showLoading();
                                if (tStore && tStore.id) {
                                    self.back({
                                        'did': tStore.id
                                    });
                                } else {
                                    self.back();
                                }
                            }
                        }]
                    }) || this.returnAlert;

                if (!self.isCanceling) {
                    returnAlert.show();
                };
            },

            changeBtnState: function () {
                return false;
                var tel = this.els.telDom.val();
                if ('' === tel) {
                    this.els.submitBtn.addClass('disabled').attr('disabled', 'disabled');
                } else {
                    this.els.submitBtn.removeClass('disabled').removeAttr('disabled');
                }
                orderInfo.setAttr('tel', tel);
            },
            showLoadingLayer: function(fun, msg) {
                !this.loadingLayer && (this.loadingLayer = new c.ui.LoadingLayer(function() {
                    fun && fun();
                }, msg || MSG.submitting));
                this.loadingLayer.show();
            },
            hideLoadingLayer: function() {
                this.loadingLayer && this.loadingLayer.hide();
            },
            goNextStep: function () {
                var uStore = userStore.getUser(); //用户Store
                if (this.validator.validate()) {
                    this.showLoadingLayer(function() {
                        notUserLoginModel.abort();
                        createOrderModel.abort();
                    });
                    //无登录，跳登录页
                    if (!uStore || !uStore.Auth || uStore.IsNonUser) {
                        this.noMemberLogin($.proxy(this.submitOrder, this));
                    } else {
                        this.submitOrder();
                    }
                }
            },
            submitOrder: function () {
                var self = this,
                    regionArr,
                    externalRefer = TuanApp.getQuery('from'),
                    tel = this.els.telDom.val(), //电话号码
                    num = this.numberStep.getCurrentNum(), //购买数量
                    tmpPrice,
                    param = { "OInfo": { "User": { "UID": "" }, "Product": { "Price": { "Price": 1, "CurCode": "RMB" }, "ProductID": 0, "Quantity": 1 }, "Contact": { "Mobile": "13802200000", "Email": "", "Phone": "" }, "Invoice": { "InvoiceHead": "", "InvoiceDesc": "", "RevAddr": "", "RevPerName": "", "PostCode": "", "ExType": 0, "ExInfo": { "PName": "", "CName": "", "LName": "", "ExpressAmount": { "Price": 0, "CurCode": "RMB"}} }, "CouponInfo": null, "OrderType": 1, "PaymentVersion": 3, "PartnerID": 0, "IsReturnCute": false, "IsMarketPrice": false, "Source": "1", "IsInvoice": false, "MemberType": 0, "UserIP": "" }, "head": { "syscode": "09", "lang": "01", "auth": "", "cid": "", "ctok": "", "cver": "1.0", "sid": "8888"} }, //AJAX 请求参数
                    iStore = invoiceStore.get(), //发票Store
                    tStore = tuanDetailStore.get(), //团购详情Store
                    uStore = userStore.getUser(), //用户Store
                    unionData = unionStore && unionStore.get(); //unionStore 数据

                orderInfo.setAttr('curNum', num);
                if (!tel || (tel === '') || !c.utility.validate.isMobile(tel)) {
                    this.hideLoading();
                    this.showMessage(MSG.telTips);
                    return;
                }
                orderInfo.setAttr('tel', tel);

                if (!tStore || !tStore.id) {
                    this.forwardJump('detial', '/webapp/tuan/detail/' + self.pid + '.html');
                    this.hide();
                    return;
                }
                if (tStore.activities && tStore.activities.length > 0) {
                    for (var j in tStore.activities) {
                        var a = tStore.activities[j];
                        if (a && a.type && +a.type > 0) {
                            if (+a.type == 1) {
                                // 立减
                                param.OInfo.IsMarketPrice = true;
                            }
                        }
                    }
                }
                if (iStore && iStore.needed) {
                    param.OInfo.IsInvoice = iStore.needed;
                    param.OInfo.Invoice.InvoiceHead = iStore.title;
                    param.OInfo.Invoice.RevPerName = iStore.recipient;
                    param.OInfo.Invoice.RevAddr = iStore.addr;
                    param.OInfo.Invoice.PostCode = iStore.zip;
                    regionArr = iStore.regionText.split(' ');
                    param.OInfo.Invoice.ExInfo.PName = regionArr[0]; //省
                    param.OInfo.Invoice.ExInfo.CName = regionArr[1]; //市
                    param.OInfo.Invoice.ExInfo.LName = regionArr[2]; //县
                    param.OInfo.ItemType = tStore.pcId; //团购类型
                    param.OInfo.Invoice.ExType = iStore.deliveryMethod || 0;
                    param.OInfo.Invoice.ExInfo.ExpressAmount.Price = iStore.deliveryMethod == 1 ? 10 : 0;
                }

                param.OInfo.Contact.Mobile = tel;
                param.OInfo.Product.Quantity = num;
                param.OInfo.Product.ProductID = tStore.id;
                //门票价格
                if (tStore.ticketPrice) {
                    tmpPrice = tStore.ticketPrice;
                } else {
                    tmpPrice = tStore.price.dPrice - (this.store.coupon ? this.store.coupon.amount : 0);
                }
                param.OInfo.Product.Price.Price = parseFloat(tmpPrice > 0 ? tmpPrice : 0);
                if (headStore.getAttr('auth') /*uStore.IsNonUser == false*/) {
                    param.head.auth = headStore.getAttr('auth');
                    param.OInfo.User.UID = uStore.UserID;
                    param.LoginToken = uStore.loginToken;
                }
                if (unionData) {
                    param.OInfo.AllianceInfo = {
                        AllianceID: unionData.AllianceID,
                        OUID: unionData.OUID,
                        SID: unionData.SID
                    };
                    param.OInfo.PartnerID = unionData.PartnerID;
                };
                //订单来源链接
                if (externalRefer) {
                    param.url = externalRefer;
                }
                param.OInfo.Source = self._getUAInfo();
                if (this.store.coupon) {
                    param.OInfo.CouponInfo = { CouponCode: this.store.coupon.code };
                }

                //门票对接新增binfo
                var ckintime = tuanDetailStore.getAttr('ckintime'),
                    name = self.els.ticketUserDom.val();
                (ckintime && name) && (param.OInfo.binfo = {
                    name: name,
                    ckintime: ckintime
                });
                this._sendOrderRequest(param);

            },
            _getUAInfo: function () {
                var os = $.os,
                clientType = isInApp ? 'Hybird' : 'H5',
                phone = 'other';

                if (os.ios) {
                    if (os.iphone) {
                        phone = 'iphone';
                    } else if (os.ipad) {
                        phone = 'ipad';
                    };
                } else if (os.android) {
                    if (os.tablet) {
                        phone = 'android';
                    } else {
                        phone = 'androidpad';
                    };
                };
                return 'client\/' + phone + '\/' + clientType;
            },
            _createNumberStep: function () {
                var self = this,
                    max = self.store.max < ORDER_NUM.max ? self.store.max : ORDER_NUM.max,
                    min = self.store.min > ORDER_NUM.min ? self.store.min : ORDER_NUM.min,
                    curNum = tuanDetailStore.getAttr('curNum') || 1;
                this.numberStep = new NumberStep({
                    max: max,
                    min: min,
                    initialVal: curNum < min ? min : curNum,
                    wrap: self.els.numStepDom,
                    html: '<i class="minus <%if(initialVal <= min ){ %>num_invalid<%} %>" data-flag="-"></i><span id="J_curNum" class="numtext"><%=initialVal %></span><i data-flag="+" class="plus <%if(initialVal >= max ){ %>num_invalid<%} %>"></i>',
                    onChange: function () {
                        var store = self.store,
                            activity,
                            pPrice,
                            tmpPrice,
                            invoice = invoiceStore.get(),
                            amount = store.coupon ? store.coupon.amount : 0,
                            num = parseInt(self.$el.find('#J_curNum').text().trim()),
                            dPrice = self.price;

//                        window.tuanDetailStore = tuanDetailStore;
                        tuanDetailStore.setAttr('curNum', num);

                        if (store.activities && store.activities.length > 0 &&
                        self.els.pPriceDom[0]) {
                            activity = store.activities[0];
                            pPrice = activity.arg * num;
                            self.els.pPriceDom.html(pPrice);
                        }

                        tmpPrice = retainTwoDecimal((parseFloat(tuanDetailStore.getAttr('ticketPrice') || dPrice) - amount) * num);
                        tmpPrice = (tmpPrice > 0 ? tmpPrice : 0) + (invoice && invoice.deliveryMethod == 1 ? 10 : 0);
                        self.els.totalPriceDom.html(tmpPrice > 0 ? tmpPrice : 0);
                        if (self.els.couponAmount.length) {
                            self.els.couponAmount.html(retainTwoDecimal(amount * num))
                        }
                    }
                });
                this.numberStep.options.onChange(); //初始化调用onChange计算订单金额
            },
            _sendOrderRequest: function (param) {
                var self = this;

                createOrderModel.setParam(param);
                createOrderModel.excute(function (data) {
                    var oid, //订单号
                        bustype = 11, //类型，11代表团购
                        auth = headStore.getAttr('auth'),
                        totalPrice,
	                    tmpPrice,
                        invoice = invoiceStore.get(),
                        token = {},
                        isLogin;

                    isLogin = userStore.isLogin() ? 0 : 1;

                    if (data.Status.toLowerCase() === 'success') {
                        oid = data.GOrder.OID;
                        tmpPrice = data.GOrder.Price;
                        totalPrice = data.GOrder.Price.TotalAmount.Price;
                        token = {
                            oid: oid,
                            bustype: bustype,
                            requestid: data.RequestId,
                            islogin: isLogin,
                            from: '',
                            rback: '', //第三方支付点击返回时跳转的页面URL地址
                            sback: '', //支付成功回调页面
                            eback: '', //错误跳转的处理页面URL地址
                            auth: auth,
                            title: self.store.name,
                            recall: 'Group.Switch.LTPPayment.LTPOrderProcessWS',
                            amount: totalPrice,
                            extno: data.GOrder.ExNo,
                            needInvoice: !!invoice && invoice.needed, //是否需要发票
                            payTypeList: data.GOrder.PayType,
                            subPayTypeList: data.GOrder.SubPayType
                        };
                        totalPrice > 0 ? Payment.submit(self, token) : self.forwardJump('bookingsuccess', '/webapp/tuan/bookingsuccess/' + oid + '.html');

                    } else if (data.ResponseStatus.Ack.toLowerCase() == 'failure' && data.ResponseStatus.Errors && data.ResponseStatus.Errors.length > 0) {//0元团已购买过一次
                        self.showToast(self.getMsgByCode(data.ResponseStatus.Errors[0].ErrorCode))//'您已购买过此0元团产品，一个用户只能购买一次');
                    } else {
                        self.showToast('订单提交失败请重试!');
                    };
                    self.hideLoadingLayer();
                    self.hideLoading();

                    if (self.store.coupon) {
                        //订单创建成功后，该优惠券不可再使用，故清理之
                        self._clearUsedCoupon();
                    };
                }, function (err) {
                    self.hideLoading();
                    self.hideLoadingLayer();
                    var errorMsg = (err.statusText === 'timeout') ? MSG.timeoutTips : MSG.failTips;
                    if (err.ResponseStatus && err.ResponseStatus.Ack.toLowerCase() == 'failure' && err.ResponseStatus.Errors && err.ResponseStatus.Errors.length > 0) {//0元团已购买过一次
                        errorMsg = self.getMsgByCode(err.ResponseStatus.Errors[0].ErrorCode); //'您已购买过此0元团产品，一个用户只能购买一次';
                        if (!errorMsg) {
                            errorMsg = err.ResponseStatus.Errors[0].Message;
                        }
                    }
                    self.showToast(errorMsg);
                }, this, true);
            },

            loginAction: function () {
                var self = this;
                //若未登录，则点击按钮就进行登录
                if (!userStore.isLogin()) {
                    Member.memberLogin({
                        domain: '//' + document.domain,
                        param: '?t=1&from=' + encodeURIComponent('/webapp/tuan/booking'),
                        callback: function () {
                            self.onLoad(self.refer);
                        }
                    });
                }
            },
            h5NoMemberLogin: function (callback) {
                var self = this;
                notUserLoginModel.excute(function (data) {
                    callback && callback.call(self);
                }, function () {
//                    self.hideLoading();
                    self.hideLoadingLayer();
                    self.showToast('自动登录失败');
                }, false, self, function () {
//                    self.hideLoading();
                    self.hideLoadingLayer();
                });
            },
            noMemberLogin: function (callback) {
                isInApp ? Member.nonMemberLogin({
                    domain: '//' + document.domain,
                    param: '?t=1&from=' + encodeURIComponent(location.href),
                    callback: callback
                }) : this.h5NoMemberLogin(callback);
            },
            getMsgByCode: function (code) {
                return ERROR_MSGS[code] || '';
            },
            _clearUsedCoupon: function () {
                delete this.store.coupon;
                selectedCouponStore.remove();
            },
            getCouponList: function (cb) {
                var self = this;
                couponListModel.setParam({
                    pid: this.pid,
                    head: couponListModel.getHead().get()
                });
                couponListModel.execute(function (data) {
                    var len = data.coupons && data.coupons.length;
                    if (len && cb) {
                        cb(len);
                    }
                }, function (err) {
                }, false, this);
            }
        });

        return View;
    });
