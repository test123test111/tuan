/**
 * Created by li.xx on 14-11-14.
 * @contact li.xx@ctrip.com
 * @description 导航页面
 * @since tuan v2.6
 */
define(['TuanApp', 'libs', 'TuanBaseView', 'cCommonPageFactory', 'text!MapNavTpl'],
function (TuanApp, libs, TuanBaseView, CommonPageFactory, html) {
    'use strict';
    var View,
        MAP_KEY = '0b895f63ca21c9e82eb158f46fe7f502',
        urlTpl = 'http://mo.amap.com/navi/?dest=<%=dest%>&destName=<%=destName %>&key='+MAP_KEY;

    var PageView = CommonPageFactory.create("TuanBaseView");

    View = PageView.extend({
        tpl: html,
        events: {},
        onShow: function() {
            var self = this,
                p = Lizard.P,
                url = _.template(urlTpl, {dest: (p('lng')+','+p('lat')), destName: p('title')});
            this.$el.attr('style', 'height:100%');
            this.$el.html(_.template(this.tpl, {url: url}));
            this.header.set({
                title: '导航页面',
                view: this,
                back: true,
                events: {
                    returnHandler: function () {
                         self.back();
//                        self.forwardJump('hotelmap','/webapp/tuan/hotelmap?lon=' + p('lng') + '&lat=' + p('lat') + '&hotelName=' + p('title'));
                    }
                }
            });
        },
        onHide: function() {
            this.$el.removeAttr('style');
        },
        onCreate: function() {

        }
    });


    return View;
});
