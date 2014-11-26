/**
 * 退款说明页面
 * @url: m.ctrip.com/webapp/tuan/refundtip
 */
define(['TuanApp', 'libs', 'c', 'cWidgetFactory', 'cWidgetGuider', 'TuanBaseView', 'cCommonPageFactory', 'text!RefundTipTpl'], function (TuanApp, libs, c, WidgetFactory, WidgetGuider, TuanBaseView, CommonPageFactory, html) {
    'use strict';
    var Guider = WidgetFactory.create('Guider');
    var PageView = CommonPageFactory.create("TuanBaseView");
    var View = PageView.extend({
        onCreate: function () {
            this.$el.html($.trim(html));
        },
        events: {
            'click .J_contactService': 'callService'
        },
        callService: function () {
            var phone = '4000086666',
                html = '<a href="tel:' + phone + '" data-phone="' + phone + '">' + phone + '</a>';
            //初始化alert
            this.alert = new c.ui.Alert({
                title: '拨打电话',
                message: html,
                buttons: [{
                    text: '取消',
                    click: function () {
                        this.hide();
                    }
                },{
                    text: '<a href="tel:' + phone + '" data-phone="' + phone + '">拨打</a>',
                    click: function (e) {
                        var self = this;

                        self.hide();
                        Guider.apply({
                            hybridCallback: function () {
                                var PHONE_ATTR_STR = 'data-phone',
                                    target = $(e.target);

                                if (!target.attr(PHONE_ATTR_STR)) {
                                    target = target.find('[' + PHONE_ATTR_STR + ']');
                                }
                                e.preventDefault();
                                Guider.callPhone({ tel: target.attr(PHONE_ATTR_STR) });
                                return false;
                            },
                            callback: function () {
                                return true;
                            }
                        });
                    }
                }]
            });
            this.alert.show();


        },
        onLoad: function () {
            this.header.set({
                title: '退款说明',
                view: this,
                back: true,
                home: true,
                events: {
                    returnHandler: function () {
                        this.back("list");
                    },
                    homeHandler: function () {
                        this.back("home");
                    }
                }
            });
            this.header.show();
        },
        onShow: function () { },
        onHide: function () { }
    });

    return View;
});
