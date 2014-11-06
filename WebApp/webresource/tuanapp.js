"use strict";
define(['PageHistory'], function (PageHistory) {
    var RE_NATIVE_PAGE_URL = /^ctrip:\/\//i, //native页面url正则
        RE_H5_PAGE_URL = /(.*)\/webapp\/(\w+)\/(.*)/, //h5页面
        RE_H5_TUAN_PAGE = /^#\w/i;

    var TuanApp = {
        init: function () {
            //检查来源，并做保存来源数据
            this.saveUnion();
        },
        isSEO: Lizard.renderAt === 'server',
        showLoading: function () {
            this.loading.show();
        },
        hideLoading: function () {
            this.loading.hide();
        },
        /**
        * 是否是内部url
        */
        isInternalPage: function (url) {
            return url.toLowerCase().indexOf('/tuan/') > -1;
        },
        back: function (url) {
            var referer = this.lastUrl();

            if (referer) {
                this.app.history.pop();

                if (this.isInternalPage(referer)) {
                    location.hash = referer.split('#')[1] || 'home';
                } else {
                    location.replace(referer);
                };

            } else {
                if (url) {
                    if (url.indexOf('#') == -1) {
                        url = '#' + url;
                    };
                    this.app.curView.jump(url)
                } else {
                    window.history.go(-1);
                }
                this.app.history = [];
            };
        },
        lastUrl: function () {
            var history = this.app.history,
                historyLen = history.length,
                referer = historyLen && history[historyLen - 2] || '';

            return referer;
        },
        /**
        * 解析url, 返回页面相关环境参数
        */
        parsePageURL: function (url) {
            if (!url) return false;

            var urlObj = {
                module: '',
                link: url,
                isNative: false,
                isInternal: false,
                domain: document.domain
            },
                parsed;
            if (url.match(RE_H5_TUAN_PAGE)) {
                urlObj.module = 'tuan';
                urlObj.isInternal = true;
                //urlObj.link = 'index.html'+ url;
                return urlObj;
            };
            if (url.match(RE_NATIVE_PAGE_URL)) {
                urlObj.domain = 'ctrip';
                urlObj.isNative = true;
                return urlObj;
            };

            parsed = RE_H5_PAGE_URL.exec(url);
            if (parsed) {
                urlObj.module = parsed[2];
                urlObj.link = parsed[3];
                urlObj.isInternal = true;
            };
            return urlObj;
        },
        gotoExternalPage: function (module, fromUrl) {
            //var view = this.app.curView;

            require(['cUtility', 'cWidgetFactory', 'cWidgetGuider'], function (Util, WidgetFactory) {
                var Guider = WidgetFactory.create('Guider');
                //Util.isInApp() ? Guider.cross({path: module, param: fromUrl}) : Lizard.goTo('/webapp/' + module + '/' + fromUrl);
                Util.isInApp() ? Guider.cross({ path: module, param: fromUrl }) : location.href = (location.protocol + '//' + location.host + '/webapp/' + module + '/' + fromUrl);
            });
        },
        /**
        * 跳到指定页
        */
        jumpToPage: function (url, curView) {
            if (!url) return;

            var self = this,
                urlParsed = self.parsePageURL(url);

            require(['cUtility', 'cWidgetFactory', 'cWidgetGuider'], function (Util, WidgetFactory) {
                var Guider = WidgetFactory.create('Guider'),
                    isInApp = Util.isInApp();

                if (!isInApp) {
                    //self.app.curView.jump(url);
                    //Lizard.goTo(url);
                    location.href = url;
                    return;
                }
                ;
                if (urlParsed.isInternal) {
                    if (urlParsed.module == 'tuan') {
                        curView.forwardJump(urlParsed.link.split('/')[0], '/webapp/tuan/' + urlParsed.link);
                    } else {
                        Guider.cross({
                            path: urlParsed.module,
                            param: urlParsed.link
                        });
                    }
                    ;

                    return;
                }
                ;
                Guider.jump({
                    targetModel: urlParsed.isNative ? 'app' : 'h5',
                    url: urlParsed.link, //如果ctrip域下，会在当前webview打开，如果第三方链接，会自动启动浏览器打开
                    title: document.title
                });
            });
        },
        getQuery: function (e) {
            return Lizard.P(e);
        },
        /**
        *@Param {bool}remove 设为true时，当检查来源为空时，删除的来源数据集
        *@Description 检查来源，并做保存来源数据  create by zhanghd
        *@Example TuanApp.saveUnion();
        */
        saveUnion: function (remove) {
            require(['CommonStore'], function (CStore) {
                var unionStore = CStore.UnionStore && CStore.UnionStore.getInstance(), //订单存储相关
                    PartnerID = TuanApp.getQuery('PartnerID'),
                    Source = TuanApp.getQuery('Source'),
                    AllianceID = TuanApp.getQuery('AllianceID'),
                    SID = TuanApp.getQuery('SID'),
                    OUID = TuanApp.getQuery('OUID'),
                    uniondata = unionStore.get();

                //检查来源，并做保存
                if (!Source && !AllianceID) {
                    //启用失效原先的来源(只当来源跳转目标页为团购页面时 targetTuan==true)
                    if (remove == true && (document.referrer != "" && document.referrer.indexOf("/html5") > 0) && uniondata && uniondata.targetTuan == true) unionStore.remove();
                } else {
                    //当与上次来源不一样时才做存储。
                    if (!uniondata || uniondata.AllianceID != AllianceID || uniondata.SID != SID || uniondata.OUID != OUID || uniondata.Source != Source || uniondata.PartnerID != PartnerID) {
                        unionStore.set({
                            "AllianceID": AllianceID,
                            "SID": SID,
                            "OUID": OUID,
                            "Source": Source,
                            "PartnerID": PartnerID,
                            "targetTuan": true
                        });
                    }
                }
            });
        },
        initVoiceSearch: function (trigger) {
            require(['cWidgetFactory', 'VoiceSearch'], function (WidgetFactory) {
                var VoiceSearch = WidgetFactory.create('VoiceSearch');
                new VoiceSearch(trigger);
            });
        },
        /**
        * 网络环境，根据它来请求不同图片
        */
        environment: 0,
        tHome: function () {
            require(['cUtility', 'cWidgetFactory', 'cWidgetGuider'], function (Util, WidgetFactory) {
                var Guider = WidgetFactory.create('Guider');
                var isInApp = Util.isInApp();
                isInApp ? Guider.home() : (location.href = location.protocol + '//' + location.host + '/html5');
            });
        },
        /**
         * @usage back to last native page
         * @runtime hybrid
         */
        backToLastPage: function(){
            require(['cWidgetFactory', 'cWidgetGuider'], function (WidgetFactory) {
                var Guider = WidgetFactory.create('Guider');

                Guider.backToLastPage({ 'param': JSON.stringify({ "biz": "tuan", "refresh": "1" }) });
            });
        },
        /**
         * 判断是够是IOS，而且系统是IOS7及以上
         */
        isOverOS7: function() {
            return $.os && $.os.ios && parseInt($.os.version, 10) >= 7;
        }
    };

    require(['libs', 'cUtility', 'cWidgetFactory', 'cHybridFacade', 'cWidgetGuider'], function (libs, Util, WidgetFactory, Facade) {
        var Guider = WidgetFactory.create("Guider");

        TuanApp.init();

        if (Util.isInApp()) {
            if (_.isFunction(Guider.app_check_network_status)) {
                //获取现在的网络状况
                Guider.app_check_network_status({
                    callback: function (network) {
                        TuanApp.environment = network['networkType'] === 'WIFI' ? 0 : 1;
                    }
                });
            }

            //监听APP网络状况
            Guider.register({
                tagname: Facade.METHOD_APP_NETWORK_DID_CHANGED, callback: function (network) {
                    TuanApp.environment = network['networkType'] === 'WIFI' ? 0 : 1;
                }
            });
        }
    });

    //for pic Lazyload
    window.noPic = function (img) {
        if (img) {
            img.src = 'http://pic.c-ctrip.com/common/pic_alpha.gif';
            img.onerror = null;
        }
    };

    return TuanApp;
});
