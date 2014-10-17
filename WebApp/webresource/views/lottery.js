define(['TuanApp', 'c', 'TuanBaseView', 'cCommonPageFactory'], function (TuanApp, c, TuanBaseView, CommonPageFactory) {
    var PageView = CommonPageFactory.create("TuanBaseView");
    var View = PageView.extend({
        onCreate: function () {
            
        },
        onShow:function(){
            this.updateTitle();
        },
        updateTitle: function () {
            var self = this;

            this.header.set({
                title: '彩票',
                back: true,
                home:true,
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