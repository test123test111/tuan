define(['TuanApp', 'c', 'TuanBaseView', 'cCommonPageFactory'], function (TuanApp, c, TuanBaseView, CommonPageFactory) {
    var PageView = CommonPageFactory.create("TuanBaseView"),
        View;
    View = PageView.extend({
        onCreate: function () {

        },
        onShow: function () {
            this.updateTitle();
        },
        updateTitle: function () {
            var self = this;

            this.header.set({
                title: '城市诱惑',
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
