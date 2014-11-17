define(['TuanApp', 'c', 'TuanBaseView', 'cCommonPageFactory'], function (TuanApp, c, TuanBaseView, CommonPageFactory) {
    var PageView = CommonPageFactory.create("TuanBaseView");
    var View = PageView.extend({
        onCreate: function () {

        },
        onShow: function () {
            this.updateTitle();
        },
        updateTitle: function () {
            var self = this;

            this.header.set({
                title: '当地特色',
                back: true,
                view: this,
                events: {
                    returnHandler: function () {

                        self.back('home');
                    },
                    homeHandler: $.proxy(self.homeHandler, self)
                }
            });
            this.header.show();
        },
        homeHandler: function () {
            TuanApp.tHome();
        }
    });

    return View;
});