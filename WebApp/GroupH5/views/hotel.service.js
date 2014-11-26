/**
 * 服务优势
 * @url: m.ctrip.com/webapp/tuan/hotelservice
 */
define(['TuanApp', 'libs', 'c', 'TuanBaseView', 'cCommonPageFactory', 'text!HotelServiceTpl'], function (TuanApp, libs, c, TuanBaseView, CommonPageFactory, html) {
    var MSG = {
        pageTitle: "服务优势"
    };

    var PageView = CommonPageFactory.create("TuanBaseView");
    var View = PageView.extend({
        pageid: '214012',
        hpageid: '215012',
        events: {
        },
        onCreate: function () {
            this.$el.html($.trim(html));
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
                        self.backAction();
                    },
                    homeHandler: function () {
                        self.backHome();
                    }
                }
            });
            this.header.show();
        },
        onShow: function () {
            this.setHeader();
        },
        onHide: function () {},
        backAction: function () {
            this.back();
        },
        backHome:function(){
            TuanApp.tHome();
        }
    });
    return View;
});