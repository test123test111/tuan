/*jshint -W030 */
/**
 * Created by li.xx on 14-11-6.
 * @contact li.xx@ctrip.com
 * @description 封装一下打电话的模块
 * @usage
 *  <%var phones = _.map(phoneList, function(p) {return p.phone;});%>
 *  <li id="J_hotelTel" data-phone="<%=phones.join(',')%>">
    <span class="subb_phone i_bef">
        <%_.each(phones, function(t) {%><span><%=t %></span><%}); %>
    </span>
    <i class="icon_txt">
        <a <%if (phones.length === 1) {%>href="tel:<%=phones[0]%>"<%} else {%>href="javascript:void(0);" <%}%>>预约/咨询</a>
    </i></li>
 */
define(['libs', 'c', 'cWidgetFactory', 'cWidgetGuider', 'cUtility'], function(libs, c, WidgetFactory, WidgetGuider, Util) {
    'use strict';
    var Guider = WidgetFactory.create('Guider');
    var isInApp = Util.isInApp();
    function CallPhone(options) {
        var Noop = function() {},
            defaultOpt = {
                tpl: '<%_.each(data, function(t) {%> <div class="base_btn02 J_phoneItem" data-phone="<%=t %>"><a href="tel:<%=t %>" style="display: inline-block;width: 100%;"><%=t %></a></div> <%});%><div class="base_btn02 J_cancelPhone">取消</div>',
                wrap:'<div class="wrapBottom J_phoneListPanel" style="z-index: 9999"></div>',
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
                        self.hidePanel();
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
            isInApp && e.preventDefault();
            var phoneList = $(e.currentTarget).attr(this.dataName);
            phoneList && (phoneList = phoneList.split(','));
            if (phoneList && phoneList.length) {
                if (isInApp || phoneList.length > 1) {
                    this._initMask();
                    this._initPanel();
                    this._updatePhoneList(phoneList);
                }
                //if (phoneList.length === 1) {
                //    this.makePhoneCall(phoneList[0]);
                //} else {
                //
                //}
            }
        },
        _phoneItemHandler: function(e) {
            isInApp && e.preventDefault();
            this.hideMask();
            this.hidePanel();
            var phone = $(e.currentTarget).attr('data-phone');
            phone && this.makePhoneCall(phone);
            this.opt.onSelect && this.opt.onSelect.apply(this);
        },
        _initPanel: function() {
            this.phonePanel = this.view.$el.find('.J_phoneListPanel');
            if (!this.phonePanel || (this.phonePanel && this.phonePanel.length === 0)) {
                this.view.$el.append(this.opt.wrap);
                this.phonePanel = this.view.$el.find('.J_phoneListPanel');
                this.phonePanel.on('click', '.J_phoneItem', this._phoneItemHandler.bind(this));
                this.phonePanel.on('click', '.J_cancelPhone', function() {this.hideMask();this.hidePanel();}.bind(this));
            }
        },
        hidePanel: function() {
            this.phonePanel && this.phonePanel.hide();
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
