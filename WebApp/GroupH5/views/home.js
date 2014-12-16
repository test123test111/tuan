/*jshint -W030 */
/**
 * 首页
 * @url: m.ctrip.com/webapp/tuan 或 m.ctrip.com/webapp/taun/home
 */
define(['TuanApp', 'c', 'cUtilityCrypt', 'cUIAlert', 'TuanBaseView', 'cCommonPageFactory', 'StoreManage', 'StringsData', 'cHybridFacade','cHybridShell', 'cWidgetGuider', 'cUtility', 'cGeoService', 'cWidgetFactory', 'TuanStore', 'TuanModel', 'LazyLoad', 'text!HomeTpl', 'cWidgetGeolocation','bridge','Helper'],
    function (TuanApp, c, Crypt, UIAlert, TuanBaseView, CommonPageFactory, StoreManage, StringsData, Facade, HybridShell, WidgetGuider, Util, GeoService, WidgetFactory, TuanStore, TuanModels, LazyLoad, html) {
        'use strict';
        var isInApp = Util.isInApp(),
            Mask = c.ui.Mask,
            IS_FIRST_IN_HOME = 'TUAN_FIRST_IN_HOME',
            listModel = TuanModels.TuanHotListModel.getInstance(),
            searchStore = TuanStore.GroupSearchStore.getInstance(),
            categoryfilterStore = TuanStore.GroupCategoryFilterStore.getInstance(), //团购类型
            customFiltersStore = TuanStore.GroupCustomFilters.getInstance(), //团购自定义筛选项
            historyCityListStore = TuanStore.TuanHistoryCityListStore.getInstance(), //历史选择城市
            geolocationStore = TuanStore.GroupGeolocation.getInstance(), //经纬度信息
            positionStore = TuanStore.TuanPositionStore.getInstance(), //定位信息
            getLocalCityInfoModel = TuanModels.TuanLocalCityInfo.getInstance(),
            bannerModel = TuanModels.BannerSearch.getInstance(),
            bannerClassModel = TuanModels.BannerClassModel.getInstance(),
            View,
            Guider = WidgetFactory.create('Guider'),
            adTpl = _.template('<%_.each(ads, function(ad){%><li data-id="<%=ad.toUrl%>"><a href="javascript:;"><img src="<%=ad.imgUrl%>" /></a></li><%})%>'),
            IGNORE_CITY_CHANGE_KEY = 'TUAN_IGNORE_CITY_CHANGE',
            DOWNLOAD_LINK = 'http://m.ctrip.com/m/c312', //android app下载地址
            SOURCE_ID_FOR_TUAN = '55559355', //下单统计sourceid
            EMPTY = '',
            NOOP = function(){},
            PAGE_TITLE = '携程旅行网触屏版-酒店团购',
            GeoLocation = GeoService.GeoLocation,
            loadingLayer;
        var PageView = CommonPageFactory.create("TuanBaseView");

        View = PageView.extend({
            pageid: '214019',
            hpageid: '215019',
            hasAd: true,
            locating: false, //是否正在定位中
            geoCallback: { status: 0, type: 0, cancelNearby: 0 }, //定位相关操作记录
            events: {
                'click .pro_list>li[data-id]': 'detailHandler', //详情页
                'click .list_s>.list_s_input': 'showKeywordSearch',
                'click .js_qr_link>li': 'goListByType',
                'click .base_btn01': 'goList',
                'click #J_allTuan': 'goList',
                'click .ad_link>li': 'onBannerClick',
                'click #js_reload': 'getGroupListData'
            },
            onCreate: function () {
                var wrap = this.$el;
                //团购列表容器
                this.listWrap = wrap.find('#J_hotSaleWrap');

                //列表渲染函数
                this.itemRenderFn = _.template(html);
                if (isInApp) {
                    //控制首页搜索框浮动和语音按钮
                    wrap.find('#J_searchBoxWrap').addClass('hybrid');
                    //如果是hybrid初始化语音功能
                    if(TuanApp.initVoiceSearch){
                        TuanApp.initVoiceSearch(wrap.find('#J_voiceTrigger'));
                    }
                }
            },
            isNearBy: function () {
                return searchStore.getAttr('nearby') || historyCityListStore.getAttr('nearby');
            },
            /**
             * 设置页面头部信息
             * @param {String} cityName 城市名称
             */
            setHeader: function (cityName) {
                var self = this;
                var cityTitle = cityName + '团购';

                //修改首页的title
                this.setTitle(PAGE_TITLE);

                this.header.set({
                    customtitle: '<h1 id="J_headerTitle"><div id="J_cityBtn" class="list_hd_button"><em class="header_mutrow">' + cityTitle + '</em><i class="i_tri"></i></div></h1>',
                    citybtn: cityTitle,
                    back: true,
                    view: this,
                    tel: null,
                    home: true,
                    //btn: !isInApp, //如果在app里，btn: true会隐藏home按钮，bug!
                    events: {
                        returnHandler: function () {
                            return isInApp ? TuanApp.backToLastPage() : TuanApp.tHome();
                        },
                        homeHandler: $.proxy(self.homeHandler, self),
                        citybtnHandler: function () { //click citybtn按钮的回调(Hybrid)
                            self.showCityPage();
                        }
                    }
                });
                this.header.show();
                //click citybtn按钮的回调(H5)
                !isInApp && this.header.root.find('#J_cityBtn').on('click', $.proxy(self.showCityPage, this));
            },
            onShow: function () {
                this.LazyLoad = new LazyLoad({ wrap: this.$el });
            },
            onHide: function () {
                GeoLocation.UnSubscribe('tuan/home');
                listModel.abort();
                this.alert.hide();
                this.listWrap.html(EMPTY);
                this.LazyLoad.unbindEvents();
                //this.hideLoading();
                this.$el.find('.ad_link').hide(); //默认不显示广告
                this.hideOfflineAlert();
                this.hideSwitchAlert();
            },
            getCityFromAppCached: function(cb) {
                if (!isInApp) {
                    cb();
                    return;
                }
                HybridShell.Fn('get_cached_ctrip_city', function(result){
                    var city;
                    if (result) {
                        city = result.CityEntities[0];
                        //iphone6渲染异常，先让app和JS交互完成再渲染
                        setTimeout(function(){
                            cb({id: city.CityID, name: city.CityName});
                        }, 0);
                    } else {
                        cb();
                    }
                }).run();
            },
            onLoad: function (refer) {
                this.tplLoading = Lizard.T('J_Loading');
                this.tplReload = Lizard.T('J_Reload');
                this.tplNoproduct = Lizard.T('J_NoGroupProduct');
                this.listWrap.html(this.tplLoading);
                refer = this.getLastViewName();
                var self = this;
                this.getCityFromAppCached(function(city) {
                    city && (StringsData.defaultCity = city);

                    var defaultCity = StringsData.defaultCity;
                    var searchData = searchStore.get();
                    var cityId = searchData.ctyId || defaultCity.id;
                    var cityName = searchData.ctyName || defaultCity.name;
                    //首页之后的页面回到首页，不需要提示切换城市，保持原有选择城市
                    //或者已经点击过取消切换城市
                    var noneedswitchcity = refer == "citylist" || refer == "detail" || refer == "list" || refer == "keywordsearch" || sessionStorage.getItem(IGNORE_CITY_CHANGE_KEY) == 1;

                    if (+searchStore.getAttr('ctyId') <= 0) {
                        searchStore.setAttr('ctyId', defaultCity.id);
                        searchStore.setAttr('ctyName', defaultCity.name);
                    }

                    //self.setHeader(cityName || (self.isNearBy() && '我附近的') || StringsData.defaultCity.name);
                    //返回到首页始终显示城市团购
                    self.setHeader(cityName);
                    self.getBannerSearch(cityId);

                    //有时候在某些机器会报错导致页面空白ft
                    try {
                        self.getGroupListData();
                    } catch (e) { }

                    if (!noneedswitchcity) {
                        self.geoCallback.type = 0;
                        self.locateInterface();
                    }
                    isInApp && Facade.request({ name: Facade.METHOD_SET_NAVBAR_HIDDEN, isNeedHidden: false });
                    //更新广告信息
                    self.updateAdInfo();

                    !localStorage.getItem(IS_FIRST_IN_HOME) && self.initWelcomeLayer();
                });
            },
            getSelectedCity: function () {
                return {
                    id: searchStore.getAttr('ctyId') || StringsData.defaultCity.id,
                    name: searchStore.getAttr('ctyName') || StringsData.defaultCity.name
                };
            },
            /*
             * "我的附近"查询模式: 酒店、美食、门票、娱乐、本周新单、一元团购、附近团购
             */
            goNearbyGroup: function (data, category) {
                var searchData = searchStore.get(),
                    index,
                    qparams,
                    tuanType;

                StoreManage.clearAll();
                if (category) {
                    if (category == 'nearby') {//只有“附近团购”才默认4公里
                        //设置距离条件
                        customFiltersStore.setAttr("distance", { "val": StringsData.SEARCH_DISTANCE, "txt": StringsData.SEARCH_DISTANCE_TEXT });
                    } else {
                        var item = this.$el.find('.js_qr_link li[data-category="' + category + '"]');
                        index = item.attr('data-id');
                        tuanType = item.attr('data-type');
                        searchStore.setAttr('ctype', tuanType);
                        searchStore.setAttr('ctyId', searchData.ctyId);
                        searchStore.setAttr('ctyName', searchData.ctyName);
                        categoryfilterStore.setAttr('tuanType', tuanType);
                        categoryfilterStore.setAttr('category', item.attr('data-category'));
                        categoryfilterStore.setAttr('name', item.attr('data-name'));
                        categoryfilterStore.setAttr('tuanTypeIndex', +index > 0 ? +index : 0);
                    }

                    if (category == 'onepaygroup') {
                        searchStore.setAttr('ctype', 0);
                        customFiltersStore.setAttr('price.val', '1|1');
                        customFiltersStore.setAttr('price.txt', '一元团购');
                    }

                    if (category == 'weeknew') {
                        searchStore.setAttr('sortRule', '1');
                        searchStore.setAttr('sortType', '1');
                    }
                }
                historyCityListStore.setAttr('nearby', true);
                qparams = StoreManage.getGroupQueryParam();
                searchStore.setAttr('qparams', qparams);
                this.forwardJump('list', '/webapp/tuan/list');
            },
            /**
             * 获取团购列表
             * @param {Boolean} notClearAll 不清除现有团购列表
             */
            getGroupListData: function () {
                this.listWrap.html(this.tplLoading);
                var searchData = searchStore.get(),
                    self = this,
                    param = {};

                param.ctyId = searchData.ctyId;
                param.environment = TuanApp.environment;

                listModel.abort();
                listModel.setParam(param);
                listModel.excute(function (data) {
                    var list = data;
                    this.isLoading = false;
                    if (data && data.products && data.count && +data.count > 0) {
                        data.ctype = searchData.ctype;
                        self.renderList(list);
                    } else {
                        this.listWrap.html(this.tplNoproduct);
                    }

                }, function () {
                    this.listWrap.html(this.tplReload);
                }, true, this);
            },
            renderList: function (data) {
                var item = this.itemRenderFn(data);
                if (data.count && +data.count > 0) {
                    this.listWrap.html(item);
                    this.LazyLoad && this.LazyLoad.updateDom();
                }
            },
            detailHandler: function (e) {
                var id = $(e.currentTarget).attr('data-id'),
                    cid = searchStore.getAttr('ctyId');

                this.forwardJump('detail', '/webapp/tuan/detail/' + id + '.html' + (cid ? '?cityid=' + cid : ''));
                //Lizard.goTo('/webapp/tuan/detail/' + id + '.html' + (cid ? '?cityid=' + cid : ''), { viewName: 'detail' });
            },
            homeHandler: function () {
                TuanApp.tHome();
            },
            goList: function (category) {
                var qparams, tuanType, index, item, searchData = searchStore.get();
                searchStore.setAttr('from_feature', 0);
                StoreManage.clearAll();
                historyCityListStore.removeAttr('nearby');
                if (category) {
                    item = this.$el.find('.js_qr_link li[data-category="' + category + '"]');
                    index = item.attr('data-id');
                    tuanType = item.attr('data-type');
                    if (category != 'onepaygroup') {
                        searchStore.setAttr('ctype', tuanType);
                        categoryfilterStore.setAttr('tuanType', tuanType);
                        categoryfilterStore.setAttr('category', item.attr('data-category'));
                        categoryfilterStore.setAttr('name', item.attr('data-name'));
                        categoryfilterStore.setAttr('tuanTypeIndex', +index > 0 ? +index : 0);
                    }

                    if (category == 'onepaygroup') {
                        customFiltersStore.setAttr('price.val', '1|1');
                        customFiltersStore.setAttr('price.txt', '一元团购');
                    }
                    if (category == 'weeknew') {
                        searchStore.setAttr('sortRule', '1');
                        searchStore.setAttr('sortType', '1');
                    }
                }
                qparams = StoreManage.getGroupQueryParam();
                searchStore.setAttr('qparams', qparams);
                searchStore.setAttr('ctyId', searchData.ctyId);
                searchStore.setAttr('ctyName', searchData.ctyName);
                //处理当地特色逻辑
                var self = this;
                if (category === 'feature') {
                    this.getBannerClass(function (urls) {
                        var url = urls[searchData.ctyId];

                        if (url) {
                            TuanApp.jumpToPage(url, self);
                        } else {
                            self.forwardJump('localfeature', '/webapp/tuan/localfeature');
                        }
                    }, function () {
                        self.forwardJump('localfeature', '/webapp/tuan/localfeature');
                    });
                    return;
                }
                this.forwardJump('list', '/webapp/tuan/list');
            },
            goListByType: function (e) {
                var item = $(e.currentTarget);

                if (!item.attr('data-category')) {
                    item = item.parent("li");
                }

                var category = item.attr('data-category');

                if (category == 'hotel' || category == 'catering' || category == 'ticket' || category == 'entertainment' || category == 'weeknew' || category == 'onepaygroup' || category == 'nearby') {
                    this.geoCallback.type = category;
                    this.geoCallback.cancelNearby = 0;
                    this.showLoading();
                    this.locateInterface();
                } else if (category == 'redenvelope') {
                    this.goRedEnvelope();
                } else {
                    this.goList(category);
                }
            },
            goRedEnvelope: function () {
                var domain = 'http://' + (TuanApp.isProduction ? 'pages.ctrip.com' : 'pages.dev.sh.ctriptravel.com');
                var url = domain + '/commerce/promote/201411/hotel/hbh5/packet.html?t=' + new Date().getTime();
                var userInfo = JSON.parse(localStorage.getItem('USERINFO'));
                if (userInfo && userInfo.data && userInfo.data.Auth) {
                    url += '&token=' + encodeURIComponent(Crypt.Base64.encode(JSON.stringify({auth: userInfo.data.Auth})));
                }
                TuanApp.jumpToPage(url, self);
            },
            showCityPage: function () {
                this.forwardJump('citylist', '/webapp/tuan/citylist');
            },
            showKeywordSearch: function () {
                var searchData = searchStore.get();
                StoreManage.clearAll();
                var qparams = StoreManage.getGroupQueryParam();
                searchStore.setAttr('qparams', qparams);
                searchStore.setAttr('ctyId', searchData.ctyId);
                searchStore.setAttr('ctyName', searchData.ctyName);
                this.forwardJump('keywordsearch', '/webapp/tuan/keywordsearch');
            },
            onBannerClick: function (e) {
                var cur = $(e.currentTarget),
                    toUrl = cur.attr('data-id');

                toUrl && TuanApp.jumpToPage(toUrl, this);
            },
            getBannerSearch: function (ciyId) {
                bannerModel.setParam('cid', ciyId);
                bannerModel.excute(function (data) {
                    var bannerWrap = this.$el.find('.ad_link'),
                        banners = data && data.banners;
                    //支持展示2个或4个广告位，4个广告位尺寸相同
                    if (banners && (banners.length == 2 || banners.length == 4)) {
                        bannerWrap.html(adTpl({ ads: banners }));
                        bannerWrap.show();
                    } else {
                        bannerWrap.hide();
                        bannerWrap.html('');
                    }

                }, function () {
                }, true, this);
            },
            /**
             * 根据业务需求更新sourceid和app下载地址
             */
            updateAdInfo: function () {
                var footer = this.footer,
                    rootBox = footer && footer.rootBox,
                    wrap = rootBox && rootBox.find('#dl_app');

                if (wrap && wrap.length) {
                    wrap.attr('data-appurl', 'ctrip://wireless?v=2&extendSourceID=' + SOURCE_ID_FOR_TUAN); //唤醒APP
                    rootBox.find('#app_link').attr('href', DOWNLOAD_LINK);
                }
            },
            /**
             * 定位
             */
            locateInterface: function () {
                //reset
                this.geoCallback.cancelNearby = 0;
                //检查是否有缓存
                if (!this.checkPositionCache()) {
                    this.checkNetwork(this.getPosition);
                }
            },
            /**
             * 检查是否有定位缓存， 如果有定位缓存， 就不需要发起定位了
             */
            checkPositionCache: function () {
                var cached = false;
                //定位信息还存在，未过期， cityid, cityname缓存有值, 不需要重新发起定位
                var cachedPositionStore = positionStore.get();
                if (cachedPositionStore && cachedPositionStore.cityId && cachedPositionStore.cityName) {
                    var cityData = {
                        "cityId": cachedPositionStore.cityId,
                        "cityName": cachedPositionStore.cityName,
                        "hasGroupProduct": cachedPositionStore.hasGroupProduct
                    };
                    this.geoCallback.status = 1;
                    this.locatedCallback(cityData);
                    cached = true;
                }
                return cached;
            },
            /**
             * 检查网络
             */
            checkNetwork: function (callback) {
                var self = this;
                isInApp ? Guider.app_check_network_status({
                    callback: function (json_obj) {
                        var hasNetwork = json_obj && json_obj.hasNetwork;
                        if (!hasNetwork) { //无网络提示
                            self.showOfflineAlert();
                            return;
                        }
                        callback && callback.call(self);
                    }
                }) : callback && callback.call(self);
            },
            /**
             * 发起定位
             */
            getPosition: function () {
                var self = this;

                //点击“我的附近”， 提示定位中
                if (this.geoCallback.type == 1) {
                    this.geoCallback.cancelNearby = 0;
                    loadingLayer = new c.ui.LoadingLayer(function () { self.geoCallback.cancelNearby = 1; this.hide(); }, '定位中...');
                    loadingLayer.show();
                }
                //已经在定位了
                if (this.locating === true) { return; }

                //开始定位中....
                this.locating = true;

                GeoLocation.Subscribe('tuan/home', {
                    onComplete: function (address) {
                        this.locating = false;
                        address.city = address.city.replace('市市', '市');
                        if (address.city.length > 2) {
                            address.city = address.city.replace('市', '');
                        }
                        //把定位信息存储到store中
                        positionStore.set(address);
                        geolocationStore.setAttr('gps', address);
                        var geoInfo = {
                            lng: address.lng,
                            lat: address.lat,
                            district: address.district,
                            city: address.city,
                            province: address.province,
                            isOverseas: address.country != '中国'
                        };
                        //点击了‘我的附近’, 直接进入列表，不需要在搜索城市了
                        if (self.geoCallback.type == 'nearby') {
                            self.geoCallback.status = 1;
                            self.locatedCallback(geoInfo);
                        } else {
                            self.getCityInfo(geoInfo, self.locatedCallback);
                        }
                    },
                    onError: this.geoError,
                    onPosComplete: NOOP,
                    onPosError: this.geoError
                }, this, true);
            },
            /**
             * 定位失败,反查城市失败
             */
            geoError: function () {
                var type = this.geoCallback.type;
                //定位失败时，酒店、美食、门票、娱乐、本周新单、1元团购按非同城查询
                if (type && (type == 'hotel' || type == 'catering' || type == 'ticket' || type == 'entertainment' || type == 'weeknew' || type == 'onepaygroup')) {
                    this.goList(type);
                    return;
                }
                this.locating = false;
                positionStore.set(null);
                loadingLayer && loadingLayer.hide();
                this.showSwitchCityAlert('无法获取您的城市，您可以选择其他城市');
                this.hideLoading();
            },
            /**
             * 反查城市
             * @param {float} lng 经度
             * @param {float} lat 纬度
             * @param {string} district 区
             * @param {string} cityname 城市名称
             * @param {string} province 省
             * @param {isOverseas} 是否是海外吗true为海外false为国内
             * @param {function} callback 成功后的回调
             */
            getCityInfo: function (geoInfo, callback) {
                var self = this;
                /* 发起获取cityid请求 */
                getLocalCityInfoModel.setParam({
                    lng: geoInfo.lng,
                    lat: geoInfo.lat,
                    district: encodeURIComponent(geoInfo.district),
                    cityname: encodeURIComponent(geoInfo.city),
                    province: encodeURIComponent(geoInfo.province),
                    isOverseas: geoInfo.isOverseas
                });
                getLocalCityInfoModel.excute(function (data) {
                    var cityData;

                    self.locating = false;
                    if (data && data.CityID && data.CityID > 0) { //有效的城市ID
                        StoreManage.setCurrentCity(data);
                        cityData = { "cityId": data.CityID, "cityName": data.CityName, "hasGroupProduct": data.HasGroupProduct };
                        positionStore.setAttr("cityId", data.CityID);
                        positionStore.setAttr("cityName", data.CityName);
                        positionStore.setAttr("hasGroupProduct", data.HasGroupProduct);
                    }
                    self.geoCallback.status = 1;
                    typeof callback === 'function' && callback.call(self, cityData);
                }, function () {
                    self.geoCallback.status = 0;
                    typeof callback === 'function' && callback.call(self);
                }, false, this);
            },
            getCityFailed: function () {
                this.locating = false;
                positionStore.setAttr("cityId", null);
                positionStore.setAttr("cityName", null);
                this.showSwitchCityAlert('无法获取您的城市，您可以选择其他城市');
            },
            /**
             * 提示是否需要城市切换
             * @param {object} cityData 成功后的回调
             */
            promptSwitchCity: function (cityData) {
                var self = this,
                    currentCity = self.getSelectedCity();

                //如果用户点击取消，则不再提醒用户切换城市
                if (sessionStorage.getItem(IGNORE_CITY_CHANGE_KEY) == 1) {
                    return;
                }
                //有效的城市信息
                if (cityData && cityData.cityId && cityData.cityName) {
                    //如果用户点击取消，则不再提醒用户切换城市
                    if (sessionStorage.getItem(IGNORE_CITY_CHANGE_KEY) != 1 && (currentCity.id > 0 && currentCity.id != cityData.cityId)) {
                        if (cityData.hasGroupProduct) {
                            this.switchCity1 = new UIAlert({
                                title: '提示',
                                message: '目前您的定位在' + cityData.cityName + '，是否切换?',
                                buttons: [
                                    {
                                        text: '取消',
                                        click: function () {
                                            self.recordSwitchCityFlag();
                                            this.hide();
                                        }
                                    },
                                    {
                                        text: '切换',
                                        click: function () {
                                            self.recordSwitchCityFlag();
                                            var cityId = cityData.cityId;
                                            searchStore.setAttr('ctyId', cityId);
                                            searchStore.setAttr('ctyName', cityData.cityName);
                                            self.setHeader(cityData.cityName);
                                            self.getGroupListData();
                                            self.getBannerSearch(cityId);
                                            this.hide();
                                        }
                                    }
                                ]
                            });
                            this.switchCity1.show();
                        } else {
                            this.showSwitchCityAlert('您所在的城市暂无团购产品<br/>您可以选择其他城市');
                        }
                    }
                    //已经是同城了
                    if (currentCity.id != cityData.cityId) {
                        self.recordSwitchCityFlag();
                    }
                } else {
                    this.showSwitchCityAlert('无法获取您的城市，您可以选择其他城市');
                }
            },
            /*
             * 记录不再需要切换城市的标记
             */
            recordSwitchCityFlag: function () {
                sessionStorage.setItem(IGNORE_CITY_CHANGE_KEY, 1);
            },
            /**
             *
             * @param type
             * @param status
             * @param data
             */
            otherLocatedHandler: function(type, status, data){
                var self = this;

                if (status === 1) {  //定位成功， 进入列表页，展示我附近的团购
                    if (type == 'nearby') {
                        self.goNearbyGroup(data, type);
                    } else {
                        if (data.cityId == searchStore.getAttr('ctyId')) {//同城，按附近团购查询
                            self.goNearbyGroup(data, type);
                        } else { //非同城，按非同城查询
                            self.goList(type);
                        }
                    }
                } else if (status === 0) { //定位失败， 提示错误信息
                    if (type == 'nearby') { //点击的是"附近团购"，提示定位失败
                        self.getCityFailed();
                    } else {//点击的是"酒店、美食、娱乐"等，按非同城查询
                        self.goList(type);
                    }
                }
            },
            /**
             * 定位回调
             */
            locatedCallback: function (data) {
                var type = this.geoCallback.type, //0: 表示：首页定位
                    status = this.geoCallback.status, //0: 表示定位失败， 1：表示定位成功
                    cancelnearby = this.geoCallback.cancelNearby, //1:表示取消'我的附近'定位（其实定位不会取消，后台继续定位，但是后续操作没有callback），0：正常状态
                    self = this;
                if (type === 0) { //首页定位
                    if (status === 1) {  //首页定位成功， 提示切换城市
                        self.promptSwitchCity(data);
                    } else if (status === 0) { //首页定位失败， 提示错误信息
                        self.getCityFailed();
                    }
                } else {
                    if (cancelnearby) { //取消 “我的附近”定位, 不操作
                        return;
                    }
                    loadingLayer && loadingLayer.hide();
                    //其他操作定位，比如点击品类，我的附近
                    self.otherLocatedHandler(type, status, data);
                }
            },
            getBannerClass: function (complete, error) {
                this.showLoading();
                bannerClassModel.excute(function (data) {
                    this.hideLoading();
                    var urls = {};
                    _.each(_.filter(data.Banner || [], function (o) { return o.type === 14; }), function (o) {
                        return (urls[o.cityid] = $.trim(o.url));
                    });
                    complete && complete(urls);
                }, function () {
                    this.hideLoading();
                    error && error();
                }, false, this, function () {
                    this.hideLoading();
                });
            },
            /**
             * 设备没有联网时出现的alert提示
             */
            showOfflineAlert: function() {
                this.offlineAlert = new UIAlert({
                    title: '提示',
                    message: '未连接到互联网，请检查网络设置<br/>您也可以拨打携程客服电话咨询',
                    buttons: [
                        {
                            text: '知道了',
                            click: function () {
                                this.hide();
                            }
                        },
                        {
                            text: '拨打电话',
                            click: function () {
                                Guider.callService();
                                this.hide();
                            }
                        }
                    ]
                });
                this.offlineAlert.show();
            },
            hideOfflineAlert: function () {
                this.offlineAlert && this.offlineAlert.hide();
            },
            /**
             * 显示 选择城市的Alert
             */
            showSwitchCityAlert: function(title) {
                var self = this;
                this.switchCity = new UIAlert({
                    title: '提示',
                    message: title,
                    buttons: [
                        {
                            text: '取消',
                            click: function () {
                                self.recordSwitchCityFlag();
                                this.hide();
                            }
                        },
                        {
                            text: '选择城市',
                            click: function () {
                                self.recordSwitchCityFlag();
                                self.showCityPage();
                                this.hide();
                            }
                        }
                    ]
                });
                this.switchCity.show();
            },
            hideSwitchAlert: function() {
                this.switchCity && this.switchCity.hide();
                this.switchCity1 && this.switchCity1.hide();
            },
            initWelcomeLayer: function () {
                var self = this;
                var layer = this.$el.find('#J_welcomeLayer');
                var mask = this.welcomeLayerMask = new Mask();
                mask.show();
                layer.show();
                layer.find('.close').on('click', function() {
                    mask.hide();
                    layer.hide();
                    localStorage.setItem(IS_FIRST_IN_HOME, 1);
                });
            }
        });
        return View;
    });
