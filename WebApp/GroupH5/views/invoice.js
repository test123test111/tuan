/*jshint -W030*/
/**
 * 优惠券页面
 * @url: m.ctrip.com/webapp/tuan/invoice
 */
define(['TuanApp', 'libs', 'c', 'cUIScrollRadio', 'cUIScrollRadioList', 'TuanStore', 'TuanModel', 'Switch', 'CommonStore', 'TuanBaseView', 'cCommonPageFactory', 'cWidgetFactory', 'text!InvoiceTpl'], function (TuanApp, libs, c, ScrollRadio, ScrollRadioList, TStore, TModel, Switch, CStore, TuanBaseView, CommonPageFactory, WidgetFactory, html) {
    'use strict';

    var invoiceStore = TStore.TuanInvoiceStore.getInstance(),
        regionInfoModel = TModel.TuanRegionInfoModel.getInstance(),
        regionInfoStore = TStore.TuanRegionInfoStore.getInstance(),
        MSG = {
            pageTitle: '发票',
            titleLessTip: '发票抬头不能为空',
            titleMoreTip: '发票抬头不能超过50个汉字',
            recipientNullTip: '收件人姓名不能为空',
            recipientLessTip: '收件人姓名不可少于2个汉字',
            recipientMoreTip: '收件人姓名不可多于10个汉字',
            selectRegion: '请选择所在地区',
            addrLessTip: '请填写详细地址',
            addrMoreTip: '详细地址不可多于50个汉字',
            zipLessTip: '邮政编码不能为空',
            zipIncorrectTip: '请输入正确的邮政编码'
        },
        deliveryData =  [
            {key: '平信(免费)', tip: '发票在您的团购券使用后10个工作日内以平信方式送达。'},
            {key: '快递(￥10)', tip: '发票在您的团购券使用后5个工作日内以快递方式送达。'}
        ];
    var PageView = CommonPageFactory.create("TuanBaseView"),
        View;
    View = PageView.extend({
        tpl: html,
        events: {
            'click #J_region': 'showRegion',
            'click #J_delivery': 'showDelivery'
        },
        onCreate: function () {
            this.$el.html($.trim(this.tpl));
            this.els = {
                needInvoice: this.$el.find('#J_needInvoice'),
                invoiceWrap: this.$el.find('#J_invoiceWrap'),
                invoiceTitle: this.$el.find('#J_invoiceTitle'),
                recipient: this.$el.find('#J_recipient'),
                region: this.$el.find('#J_region'),
                regionText: this.$el.find('#J_regionText'),
                addr: this.$el.find('#J_addr'),
                zip: this.$el.find('#J_zip'),
                delivery: this.$el.find('#J_delivery'),
                deliveryText: this.$el.find('#J_deliveryText'),
                deliveryTips: this.$el.find('#J_deliveryTips')
            };
        },
        _setPageView: function () {
            var self = this;
            this.header.set({
                title: MSG.pageTitle,
                back: true,
                view: this,
                btn: { title: '完成', id: 'J_submitOrder', classname: 'rightblue' },
                events: {
                    returnHandler: function () {
                        self.back();
                    },
                    commitHandler: function () {
                        self.saveInvoiceInfo() && self.back();
                    }
                }
            });
            this.header.show();
        },
        onLoad: function () {
            var invoice = invoiceStore.get();
            this.setTitle(MSG.pageTitle);
            if (invoice) {
                if (invoice.needed) {
                    this._needInvoice();
                    this.invoiceSwitch(true);
                } else {
                    this._noNeedInvoice();
                    this.invoiceSwitch(false);
                }
                this.fillValue(invoice);
            } else {
                this._noNeedInvoice();
                this.invoiceSwitch(false);
            }

            this._setPageView();
        },
        onShow: function () { },
        onHide: function () { },
        invoiceSwitch: function (isTurnOn) {
            var self = this;
            return new Switch({
                cursor: this.els.needInvoice,
                isTurnOn: isTurnOn,
                onChange: function (rs) {
                    try { this.cursor[rs ? 'attr' : 'removeAttr']('checked', 'checked'); } catch (ex) { }
                    rs ? self._needInvoice() : self._noNeedInvoice();
                }
            });
        },
        fillValue: function (invoice) {
            var deliveryMethod = invoice.deliveryMethod ? invoice.deliveryMethod: '0';
            this.els.invoiceTitle.val(invoice.title ? invoice.title : '');
            this.els.recipient.val(invoice.recipient ? invoice.recipient : '');
            this.els.region.data('region-index', invoice.regionIndex ? invoice.regionIndex : '2,2,2');
            this.els.regionText.text(invoice.regionText ? invoice.regionText : '');
            this.els.addr.val(invoice.addr ? invoice.addr : '');
            this.els.zip.val(invoice.zip ? invoice.zip : '');
            this.els.delivery.data('delivery-method', deliveryMethod);
            this.els.deliveryText.text(deliveryData[deliveryMethod].key);
            this.els.deliveryTips.text(deliveryData[deliveryMethod].tip);
        },
        _noNeedInvoice: function () {
            this.els.invoiceWrap.hide();
            this.els.deliveryTips.hide();
            invoiceStore.remove();
            this.fillValue({});
        },
        _needInvoice: function () {
            this.els.invoiceWrap.show();
            this.els.deliveryTips.show();
            !regionInfoStore.get() && this.getRegionInfo();
        },
        saveInvoiceInfo: function () {
            var invoice = {
                needed: this.els.needInvoice[0].checked,
                title: this.els.invoiceTitle.val().trim(),
                recipient: this.els.recipient.val().trim(),
                regionIndex: this.els.region.data('regionIndex'),
                regionText: this.els.regionText.text(),
                addr: this.els.addr.val().trim(),
                zip: this.els.zip.val().trim(),
                deliveryMethod: this.els.delivery.data('deliveryMethod')
            };
            if (invoice.needed) {
                //发票抬头验证
                if (invoice.title.length === 0) {
                    this.showMessage(MSG.titleLessTip);
                    return false;
                } else if (this._length(invoice.title) > 100) {
                    this.showMessage(MSG.titleMoreTip);
                    return false;
                }
                //收件人
                if (invoice.recipient.length === 0) {
                    this.showMessage(MSG.recipientNullTip);
                    return false;
                } else {
                    if (this._length(invoice.recipient) < 4) {
                        this.showMessage(MSG.recipientLessTip);
                        return false;
                    }
                    if (this._length(invoice.recipient) > 20) {
                        this.showMessage(MSG.recipientMoreTip);
                        return false;
                    }
                }
                //所在地区
                if (invoice.regionText.length === 0) {
                    this.showMessage(MSG.selectRegion);
                    return false;
                }
                //详细地址验证
                if (invoice.addr.length === 0) {
                    this.showMessage(MSG.addrLessTip);
                    return false;
                } else if (this._length(invoice.addr) > 100) {
                    this.showMessage(MSG.addrMoreTip);
                    return false;
                }
                //邮编
                if (invoice.zip.length === 0) {
                    this.showMessage(MSG.zipLessTip);
                    return false;
                } else {
                    if (!/^\d{6}$/.test(invoice.zip)) {
                        this.showMessage(MSG.zipIncorrectTip);
                        return false;
                    }
                }
                invoiceStore.set(invoice);
            } else {
                invoiceStore.remove();
            }
            return true;
        },
        //得到汉字字符串的长度
        _length: function (s) {
            var reg = s.match(/[^ -~]/g);
            return reg === null ? s.length : s.length + reg.length;
        },
        //加载省市县数据
        getRegionInfo: function(callback) {
            regionInfoModel.setParam({
                head: regionInfoModel.getHead().get()
            });
            regionInfoModel.excute(function(data) {
                callback && callback(data);
            }, function () {
                this.showMessage('抱歉，数据加载失败，请重试!');
            }, false, this);
        },
        showRegion: function () {
            var data = regionInfoStore.get();
            if (data) {
                this._displayRegionScroll(data);
            } else {
                this.getRegionInfo(this._displayRegionScroll);
            }
        },
        _displayRegionScroll: function (d) {
            var d1 = d.provinces,
                d2 = [],
                d3 = [],
                region = $('#J_region'),
                regionText = $('#J_regionText'),
                index = region.data('regionIndex').split(',');
            _.each(d.cities, function(v) {
                if (v.pid == d1[index[0]].pid) {
                    d2.push(v);
                }
            });
            _.each(d.zones, function(v) {
                if (v.cid == d2[index[1]].cid) {
                    d3.push(v);
                }
            });

            var c2 = function(item) {
                var  arr = [];
                _.each(d.zones, function(v) {
                    if (v.cid == item.cid) {
                        arr.push(v);
                    }
                });
                this.scroll[2].reload(arr);
            };
            var c1 = function(item) {
                var arr = [];
                _.each(d.cities, function(v) {
                    if (v.pid == item.pid) {
                        arr.push(v);
                    }
                });
                this.scroll[1].reload(arr);
                c2.call(this, arr[this.scroll[1].selectedIndex]);
            };

            function c3() {}
            var scrollRadio = new ScrollRadio({
                title: '选择所在地区',
                data: [d1, d2, d3],
                index: index,
                okClick: function (item) {
                    var t1 = item[0], t2 = item[1], t3 = item[2],
                        text = t1.key + ' ' + t2.key + ' ' + t3.key,
                        index = t1.index + ',' + t2.index + ',' + t3.index;
                    regionText.text(text);
                    region.data('regionIndex', index);
                },
                changed: [c1, c2, c3]
            });
            scrollRadio.show();
            scrollRadio.scroll[0].wrapper.find('.cui-flex2').removeClass('cui-flex2');//去掉多余的cui-flex2
        },
        showDelivery: function (e) {
            var currentTarget = $(e.currentTarget),
                radio,
                deliveryText = this.els.deliveryText,
                deliveryTips = this.els.deliveryTips,
                deliveryMethod = currentTarget.data('deliveryMethod');
            radio = new c.ui.ScrollRadioList({
                title: '选择配送方式',
                index: deliveryMethod ,     //默认定位到第几个item上
                data: deliveryData,         //要展示到item的数组
                disItemNum: 2,              //显示的item数量
                itemClick: function (item) {//选中item触发的事件
                    deliveryText.html(item.key);
                    deliveryTips.html(item.tip);
                    currentTarget.data('deliveryMethod', item.index);
                }
            });
            radio.show();
        }
    });

    return View;
});
