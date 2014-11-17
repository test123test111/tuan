/**
 * 温馨提示页面
 * @url: m.ctrip.com/webapp/tuan/detailtips
 */
define(['TuanApp', 'libs', 'TuanBaseView', 'cCommonPageFactory', 'TuanStore', 'text!DetailTipsTpl'], function (TuanApp, libs, TuanBaseView, CommonPageFactory, TuanStore, html) {
    var MSG = {
        pageTitle: '团购温馨提示'
    };
    var tuanDetailsStore = TuanStore.TuanDetailsStore.getInstance();
    var PageView = CommonPageFactory.create("TuanBaseView");
    var View = PageView.extend({
        pageid: '214013',
        events: {
        },
        onCreate: function () {
            this.htmlfun = _.template(html);
        },
        onLoad: function () {
            var detailData = tuanDetailsStore.get();
            if (detailData) {
                var tips = detailData.contents.filter(function (d) {
                    return d.type == 4;
                });
                this.$el.html($.trim(this.htmlfun({ data: tips[0] })));
            } else {
                this.backAction();
            }
            this.setHeader();
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
        onShow: function () { },
        onHide: function () { },
        backAction: function () {
            this.back();
        },
        backHome: function (e) {
            TuanApp.tHome();
        }
    });

    return View;
});