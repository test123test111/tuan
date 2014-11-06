/**
 * Created by li.xx on 14-11-6.
 * @contact li.xx@ctrip.com
 * @description 封装一下打电话的模块
 */
define(['libs', 'c', 'cWidgetFactory', 'cWidgetGuider'], function(libs, c, WidgetFactory, WidgetGuider) {
    'use strict';
    var Guider = WidgetFactory.create('Guider');
    function CallPhone(options) {
        var Noop = function() {},
            defaultOpt = {
                tpl: '<ul class="pop_filter_baselist2"><%_.each(data, function(t) {%> <li class="J_phoneItem" data-phone="<%=t %>"><a href="tel:<%=t %>" style="display: inline-block;width: 100%;"><%=t %></a></li> <%});%></ul>',
                wrap:'<div class="pop_filter J_phoneListPanel" style="bottom: 36px; width: 100%; position: fixed; list-style: none; z-index: 9999; -webkit-transform: translate(0px, -8px) translateZ(0px); opacity: 1; display: none; "></div>',
                ele: '.J_phone',
                onSelect: Noop,
                onHide: Noop,
                onShow: Noop,
                dataName: 'data-phone',
                view: ''
            };
        this.opt = $.extend(defaultOpt, options);
        this.view = this.opt.view;
        this.ele = $(this.opt.ele);
        this.dataName = this.opt.dataName;
        this.bindEvents();
    }

    CallPhone.prototype = {
        _initMask: function() {
            var self = this;
            !this.mask && (this.mask = new c.ui.Mask({
                onCreate: function() {
                    this.root.on('click', function() {
                        self.phonePanel.hide();
                        self.hideMask();
                    });
                }
            }));
            this.showMask();
        },
        showMask: function() {
            this.mask && this.mask.show();
            this.opt.onShow && this.opt.onShow.apply(this);
        },
        hideMask: function() {
            this.mask && this.mask.hide();
            this.opt.onHide && this.opt.onHide.apply(this);
        },
        bindEvents: function() {
            this.ele.on('click', this._clickHandler.bind(this));
        },
        _clickHandler: function(e) {
            var phoneList = $(e.currentTarget).attr(this.dataName);
            phoneList && (phoneList = phoneList.split(','));
            if (phoneList && phoneList.length) {
                if (phoneList.length === 1) {
                    this.makePhoneCall(phoneList[0]);
                } else {
                    this._initMask();
                    this._initPanel();
                    this._updatePhoneList(phoneList);
                }
            }
        },
        _phoneItemHandler: function(e) {
            this.hideMask();
            var phone = $(e.currentTarget).attr('data-phone');
            phone && this.makePhoneCall(phone);
            this.phonePanel && this.phonePanel.hide();

            this.opt.onSelect && this.opt.onSelect.apply(this);
        },
        _initPanel: function() {
            this.phonePanel = this.view.$el.find('.J_phoneListPanel');
            if (!this.phonePanel || (this.phonePanel && this.phonePanel.length === 0)) {
                this.view.$el.append(this.opt.wrap);
                this.phonePanel = this.view.$el.find('.J_phoneListPanel');
                this.phonePanel.on('click', '.J_phoneItem', this._phoneItemHandler.bind(this));
            }
        },
        _updatePhoneList: function(phones) {
            this.phonePanel.html(_.template(this.opt.tpl, {data: phones}));
            this.phonePanel.show();
        },
        makePhoneCall: function(phone) {
            Guider.apply({
                hybridCallback: function () {
                    Guider.callPhone({tel:phone});
                    return false;
                },
                callback: function () {
                    return true;
                }
            });
        },
        updateDom: function(dom) {
            this.ele = $(dom);
            this.bindEvents();
        }
    };

    return CallPhone;
});