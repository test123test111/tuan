/**
 * Created by li.xx on 14-11-12.
 * @contact li.xx@ctrip.com
 * @description
 */
define(['c', 'cBase', 'cWidgetFactory', 'cUtility','libs'], function(c, cBase, WidgetFactory){
    var WIDGET_NAME = 'VoiceSearch',
        CONSOLE,
        tpl = _.template('<button id="J_clearStorage">Clear</button>');

    // 如果WidgetFactory已经注册了VoiceSearch，就无需重复注册
    if (WidgetFactory.hasWidget(WIDGET_NAME)) {
        return;
    };
    CONSOLE = new cBase.Class({
        __propertys__: function(){

        },
        initialize: function(wrap){
            var btn,
                env,
                hasClear,
                toast,
                $con;
            if (Util.isInApp()) {
                //Hybrid， 非生产环境
                env = Util.isPreProduction();
                if (env === '0' || env === '1' || env === '2') {
                    hasClear = true;
                }
            } else {
                //H5, 非生产环境
                if (!location.host.match(/^(m|3g|wap)\.ctrip\.com/i)) {
                    hasClear = true;
                }
            }

            if (hasClear) {
                btn = $('<i style="position:fixed;bottom:100px;color:green;z-index:9999;">CL</i>').appendTo('#main');
                btn.on('click', function() {localStorage && localStorage.clear();!toast && (toast = new c.ui.Toast());toast.show('Clear', 1);});
                //测试提的需求： 测试环境中清空footer里的广告
                var fn = setInterval(function() {
                    var ads = $('.dl_panel-bg .dl_btn-close');
                    if (ads && ads.length) {ads.trigger('click');clearInterval(fn);}
                }, 100);

                $con = $('<div id="J_console" style="height:50px;border:1px solid red;"><i class="dl_btn-close"></i><textarea></textarea></div>').appendTo('body');
            }
        },
        render: function() {
        },
        onShow: function() {},
        onHide: function() {},

        _bindEvents: function(){

        }
    });

    WidgetFactory.register({
        name: WIDGET_NAME,
        fn: CONSOLE
    });
});