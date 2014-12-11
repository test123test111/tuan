/*jshint -W030 */
define(['c', 'cStore', 'cPageView', 'cCommonListPage', 'cUtility', 'cHybridFacade', 'cCommonPageFactory', 'PageHistory', 'cWidgetFactory', 'cWidgetGuider'],
function (c, AbstractStore, BasePageView, CommonListPage, Util, Facade, CommonPageFactory, History, WidgetFactory) {

    var PAGE_NAME = 'TuanBaseView';
    var PAGE_NAMELIST = 'TuanBaseListView';
    var isInApp = Util.isInApp();
    var Guider = WidgetFactory.create('Guider');
    //注册IOS手势事件
    // isInApp && Facade.registerOne('METHOD_WEB_VIEW_DID_APPEAR', 'web_view_did_appear');
    // isInApp && Guider.register({
        // tagname: 'METHOD_WEB_VIEW_DID_APPEAR',
        // callback: function () {
            // CtripPage.app_enable_drag_animation(true);
        // }
    // });
    if (CommonPageFactory.hasPage(PAGE_NAME) || CommonPageFactory.hasPage(PAGE_NAMELIST)) {
        return;
    }
    //阅后即焚Store
    var BurnAfterReadingStore = new c.base.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'P_TUAN_BURN_AFTER_READING';
            this.lifeTime = '1H';
            this.defaultData = {};
        },
        initialize: function ($super) {
            $super();
        },
        setOneMessage: function (id, message) {
            this.setAttr(id, message);
        },
        getOneMessage: function (id) {
            var message = this.getAttr(id);
            if (message) {
                this.setAttr(id, '');
            }
            return message;
        }
    });
    var burnAfterReadingStore = BurnAfterReadingStore.getInstance();
    var options = options || {};
    options = {
        super: BasePageView.prototype,
        show: function () {
            var lastViewId = History.getLatelyView(this.getViewName()) || '';
            this.lastViewId = lastViewId;

            this.__onLoad(lastViewId);
            this.super.show.apply(this, arguments);
            this.__onShow(lastViewId);
        },
        hide: function () {
            this.super.hide.apply(this, arguments);
            this.__onHide(arguments);
        },
        getViewName: function () {
            return this.config && this.config.viewName;
        },
        __onLoad: function () {
            History.confirmForward(this.getViewName());
            History.addHistory(this.getViewName(), location.href, 2);
        },
        __onShow: function () {

        },
        __onHide: function (/*viewname*/) {

        },
        getHistory: function () {
            return History;
        },
        back: function (args, cache) {
            //判断是否从app进入，如果是则返回app by ouxz
            if (isInApp && Lizard.P('from_native_page') == 1) {
                Guider.backToLastPage({ 'param': JSON.stringify({ "biz": "tuan", "refresh": "1" }) });
                return;
            }
            this.setOneMessage('__lastViewName__', this.getViewName());
            var urlNode = History.back(this.getViewName(), args);

            if (cache === undefined) {
                cache = false;
            }
            if (urlNode.jump) {
                location.href = urlNode.fullurl;
            } else {
                if (Util.isInApp()) {
                    var surl = /#(.*)$/.exec(urlNode.fullurl);
                    if (surl && surl.length > 1 && surl[1]) {
                        Lizard.goTo(surl[1], { viewName: urlNode.id, cache: urlNode.id == 'list' ? true : cache });
                    } else {
                        Lizard.goTo(urlNode.fullurl, { viewName: urlNode.id, cache: urlNode.id == 'list' ? true : cache });
                    }

                } else {
                    Lizard.goTo(urlNode.fullurl, { viewName: urlNode.id, cache: urlNode.id == 'list' ? true : cache });
                }
            }
        },
        popById: function (viewname) {
            var list = History.popById(viewname);
            if (!list) {
                History.clearHistory();
            }
        },
        clearHistory: function (id, url) {
            History.clearHistory(id, url);
        },
        forwardJump: function (viewname, url, jump, replace, useCache) {
            this.setOneMessage('__lastViewName__', this.getViewName());
            if (_.isObject(jump)) {
                jump = false;
            }
            if (jump) {
                url = History.forward(viewname, url, 1, replace);
                this.jump(url);
            } else {
                url = History.forward(viewname, url, 2, replace);
                var ops = { viewName: viewname };
                if (useCache) {
                    ops.cache = true;
                }
                ops.loading = false; //默认不出现loading框

                Lizard.goTo(url, ops);
            }
        },
        //获得前一次viewname
        getLastViewName: function () {
            return this.getOneMessage('__lastViewName__');
        },
        setOneMessage: function (id, message) {
            burnAfterReadingStore.setOneMessage(id, message);
        },
        getOneMessage: function (id) {
            return burnAfterReadingStore.getOneMessage(id);
        },
        showMessage: function (message, title) {
            this.alert.setViewData({
                message: message,
                title: title,
                buttons: [{
                    text: '知道了',
                    click: function () {
                        this.hide();
                    }
                }]
            });
            this.alert.show();
        },
        /**
         *
         * @param title {String} marker文本
         * @param lng {Number} 经度
         * @param lat {Number} 纬度
         */
        showCommonMap: function(title, lng, lat){
            var geolocation = this.geolocation;

            if(!geolocation){
                geolocation = WidgetFactory.create('Geolocation');
                this.geolocation = geolocation;
            }
            if(isInApp){
                geolocation.show_map({
                    latitude: lat,
                    longitude: lng,
                    title: title
                });
            }else{
                this.forwardJump('hotelmap','/webapp/tuan/hotelmap?lon=' + lng + '&lat=' + lat + '&hotelName=' + title);
            }
        }

    };
    var TuanBaseView = BasePageView.extend(options);

    CommonPageFactory.register({
        name: PAGE_NAME,
        fn: TuanBaseView
    });

    CommonListPage = CommonPageFactory.create('CommonListPage');
    var TuanBaseListView = CommonListPage.extend(options);

    CommonPageFactory.register({
        name: PAGE_NAMELIST,
        fn: TuanBaseListView
    });
});
