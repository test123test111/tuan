/**
 * 首页
 * @url: m.ctrip.com/webapp/tuan 或 m.ctrip.com/webapp/taun/home
 */
define(['TuanApp', 'c', 'cUIAlert', 'TuanBaseView', 'cCommonPageFactory', 'StoreManage', 'StringsData', 'cHybridFacade', 'cWidgetGuider', 'cUtility', 'cGeoService', 'cWidgetFactory', 'TuanStore', 'TuanModel', 'LazyLoad', 'text!HomeTpl', 'cWidgetGeolocation'],
function (TuanApp, c, cUIAlert, TuanBaseView, CommonPageFactory, StoreManage, StringsData, Facade, WidgetGuider, Util, cGeoService, WidgetFactory, TuanStore, TuanModels, LazyLoad, html) {

    var isInApp = Util.isInApp(),
        listModel = TuanModels.TuanHotListModel.getInstance(),
        searchStore = TuanStore.GroupSearchStore.getInstance(),
        categoryfilterStore = TuanStore.GroupCategoryFilterStore.getInstance(), //团购类型
        customFiltersStore = TuanStore.GroupCustomFilters.getInstance(), //团购自定义筛选项
        historyCityListStore = TuanStore.TuanHistoryCityListStore.getInstance(), //历史选择城市
        geolocationStore = TuanStore.GroupGeolocation.getInstance(), //经纬度信息
        positionStore = TuanStore.TuanPositionStore.getInstance(), //定位信息
        getLocalCityInfoModel = TuanModels.TuanLocalCityInfo.getInstance(),
        historyKeySearchtore = TuanStore.TuanHistoryKeySearchStore.getInstance(),
        bannerModel = TuanModels.BannerSearch.getInstance(),
        bannerClassModel = TuanModels.BannerClassModel.getInstance(),
        View,
        Guider = WidgetFactory.create('Guider'),
        adTpl = _.template('<%_.each(ads, function(ad){%><li data-id="<%=ad.toUrl%>"><a href="javascript:;"><img src="<%=ad.imgUrl%>" /></a></li><%})%>'),
        IGNORE_CITY_CHANGE_KEY = 'TUAN_IGNORE_CITY_CHANGE',
        DOWNLOAD_LINK = 'http://m.ctrip.com/m/c312', //android app下载地址
        SOURCE_ID_FOR_TUAN = '55559355', //下单统计sourceid
        EMPTY = '',
        GeoLocation = cGeoService.GeoLocation,
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
                TuanApp.initVoiceSearch && TuanApp.initVoiceSearch(wrap.find('#J_voiceTrigger'));
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
                        //isInApp ? Guider.home() : self.jump("/html5/");
                        isInApp ? Guider.home() : TuanApp.tHome();
                    },
                    homeHandler: $.proxy(self.homeHandler, self),
                    citybtnHandler: function () { //click citybtn按钮的回调
                        self.showCityPage();
                    }
                }
            });
            this.header.show();
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
            this.hideLoading();
        },
        onLoad: function (refer) {
            this.tplLoading = Lizard.T('J_Loading');
            this.tplReload = Lizard.T('J_Reload');
            this.tplNoproduct = Lizard.T('J_NoGroupProduct');
            this.listWrap.html(this.tplLoading);
            this._refer = refer;
            refer = this.getLastViewName();
            if (+searchStore.getAttr('ctyId') <= 0) {
                searchStore.setAttr('ctyId', StringsData.defaultCity.id);
                searchStore.setAttr('ctyName', StringsData.defaultCity.name);
            }
            var self = this,
                searchData = searchStore.get(),
                cityId = searchData.ctyId || StringsData.defaultCity.id,
                cityName = searchData.ctyName || StringsData.defaultCity.name;

            this.setHeader(cityName || (self.isNearBy() && '我附近的') || StringsData.defaultCity.name);
            this.header.root.find('#J_cityBtn').on('click', $.proxy(self.showCityPage, this));
            this.getBannerSearch(cityId);
            //有时候在某些机器会报错导致页面空白
            try {
                self.getGroupListData();
            } catch (e) { }

            //首页之后的页面回到首页，不需要提示切换城市，保持原有选择城市
            //或者已经点击过取消切换城市            
            var noneedswitchcity = refer == "citylist" || refer == "detail" || refer == "list" || refer == "keywordsearch" || sessionStorage.getItem(IGNORE_CITY_CHANGE_KEY) == 1;
            if (!noneedswitchcity) {
                this.geoCallback.type = 0;
                this.locateInterface();
            }
            isInApp && Facade.request({ name: Facade.METHOD_SET_NAVBAR_HIDDEN, isNeedHidden: false });
            //更新广告信息
            this.updateAdInfo();

        },
        /**
        * @param {Object} searchData 所有查询条件键值对
        * @param {Object} cityListData 城市列表
        * @return {Object} 城市对象
        */
        getCurrentCity: function (searchData) {
            var city = {
                id: searchData && searchData.ctyId || 2,
                name: searchData && searchData.ctyName || '上海'
            },
                cityId = this.getQuery('cityid'); //从QueryString中获取cityid

            if (cityId && +cityId > 0) {
                city = StoreManage.findCityInfoById(cityId);
            } else if ((+city.id) > 0) {
                city = StoreManage.findCityInfoById(city.id);
            };
            if (!city || !city.id) {
                city = StringsData.defaultCity;
            };
            return city;
        },

        getSelectedCity: function () {
            return {
                id: searchStore.getAttr('ctyId') || StringsData.defaultCity.id,
                name: searchStore.getAttr('ctyName') || StringsData.defaultCity.name
            };
        },

        createGPS: function () {
            this.gps = WidgetFactory.create('Geolocation');
        },
        getLocalCityInfo: function (lng, lat, cityName) {
            var self = this,
                cityId = StoreManage.getCityIdByName(cityName),
                cityData;

            if (cityId) {
                cityData = {
                    CityName: cityName,
                    CityID: cityId
                };
                if (StoreManage.setCurrentCity(cityData)) {
                    this.alertCityChange({
                        name: cityName || '',
                        id: cityId
                    });
                    //如果cityid有效，则停止想服务器发换取cityid请求
                    return;
                };
            };
            /* 发起获取cityid请求 */
            getLocalCityInfoModel.setParam({
                lng: lng,
                lat: lat,
                cityname: encodeURIComponent(cityName)
            });

            getLocalCityInfoModel.excute(_.bind(function (data) {
                var currentCity;

                self.checkParentCity(data);
                //更新当前城市信息
                if (typeof data != undefined && StoreManage.setCurrentCity(data)) {
                    currentCity = StoreManage.getCurrentCity();
                    this.alertCityChange({
                        name: currentCity.CityName || currentCity.city,
                        id: currentCity.CityId || currentCity.CityID //已经搞不清楚大小写了
                    });
                } else {
                    if (this._autoGPSRequest != true) {
                        this.alertErrorMsg("提示", "定位失败，无效的定位信息！");
                    }
                }
            }, this));
        },
        /**
        * 检查是否上级城市ID
        * @param data
        */
        checkParentCity: function (data) {
            //默认非上级城市
            geolocationStore.setAttr('isParentCity', false);
            if (data.IsParentCity) {
                if (data.HasGroupProduct) {
                    //10公里查询，提供setter getter工具类
                    geolocationStore.setAttr('isParentCity', true);
                } else {
                    //如果没有则到跳到上海
                    data.CityID = StringsData.defaultCity.id;
                };
            };
        },
        getGeolocation: function (autoGPSRequest) {
            this._autoGPSRequest = autoGPSRequest;
            if (!this.gps) {
                this.createGPS();
            };
            if (this._autoGPSRequest != true) {
                this.alertErrorMsg("", "正在定位，请稍候。");
            }
            if (this._gpsrequest != true) {
                this._gpsrequest = true;
                this.gps.requestCityInfo(_.bind(function (gpsInfo) {
                    this._gpsrequest = false;
                    gpsInfo.city = gpsInfo.city.replace('市市', '市');
                    if (gpsInfo.city.length > 2) gpsInfo.city = gpsInfo.city.replace('市', '');
                    geolocationStore.setAttr('gps', gpsInfo);
                    this.getLocalCityInfo(gpsInfo.lng, gpsInfo.lat, gpsInfo.CityName || gpsInfo.city);

                }, this), _.bind(function (err) {
                    this._gpsrequest = false;
                    if (this._autoGPSRequest != true) {
                        this.alertErrorMsg("提示", "无法获取位置信息，您可在设置中开启定位服务，开启wifi；或重新查实定位");
                    }
                }, this));

            }
        },
        alertErrorMsg: function (title, message) {
            var alertMsg = new cUIAlert({
                title: title,
                message: message,
                buttons: [{
                    text: '知道了',
                    click: function () {
                        this.hide();
                    }
                }]
            });
            alertMsg.show();
        },
        alertCityChange: function (data) {
            var self = this,
                currentCity = self.getSelectedCity();

            //如果用户点击取消，则不再提醒用户切换城市
            //if (sessionStorage.getItem(IGNORE_CITY_CHANGE_KEY) != 1 && !currentCity.ctyId && currentCity.ctyId != data.id) {
            if (sessionStorage.getItem(IGNORE_CITY_CHANGE_KEY) != 1 && (currentCity.id > 0 && currentCity.id != data.id)) {
                var alertMsg = new cUIAlert({
                    title: '提示',
                    message: '目前您的定位在' + data.name + '，是否切换?',
                    buttons: [
                        {
                            text: '取消',
                            click: function () {
                                sessionStorage.setItem(IGNORE_CITY_CHANGE_KEY, 1);
                                this.hide();
                            }
                        },
                        {
                            text: '切换',
                            click: function () {
                                if (self._autoGPSRequest == true) {
                                    var cityId = data.id;

                                    searchStore.setAttr('ctyId', cityId);
                                    searchStore.setAttr('ctyName', data.name);
                                    self.setHeader(data.name);
                                    self.getGroupListData();
                                    self.getBannerSearch(cityId)
                                } else {
                                    self.switchCity(data);
                                }
                                this.hide();
                            }
                        }
                    ]
                });
                this.isCurrentView() && alertMsg.show();
            } else {
                if (self._autoGPSRequest != true) {
                    self.switchCity(data);
                }
            }
        },
        isCurrentView: function () {
            //return TuanApp.app.curView === this;
        },
        /*
        * "我的附近"查询模式: 酒店、美食、门票、娱乐、附近团购
        */
        goNearbyGroup: function (data, category) {
            var searchData = searchStore.get();

            StoreManage.clearAll();
            historyCityListStore.setAttr('nearby', true);
            qparams = StoreManage.getGroupQueryParam();
            searchStore.setAttr('qparams', qparams);
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
            }
            historyKeySearchtore.remove();
            this.forwardJump('list', '/webapp/tuan/list');
        },

        switchCity: function (data) {
            var self = this,
                isQueryByParentCity = geolocationStore.getAttr('isParentCity'),
                id = data.id,
                name = data.name,
                gps = geolocationStore.getAttr('gps');

            StoreManage.clearAll();
            StoreManage.setCurrentCity({
                CityID: id
            });
            historyCityListStore.setAttr('nearby', true);
            qparams = StoreManage.getGroupQueryParam();
            searchStore.setAttr('qparams', qparams);
            searchStore.setAttr('ctyId', id);
            searchStore.setAttr('ctyName', name);
            searchStore.setAttr('pos', {
                posty: StringsData.MAP_SOURCE_ID, //数据来源，默认3为高德
                lon: gps.lng,
                lat: gps.lat,
                distance: self.isQueryByParentCity ? 10 : StringsData.SEARCH_DISTANCE//数据的半径，默认4，如果上级城市则按照10公里
            });
            //历史选择 处理start----------
            StoreManage.addHistoryCity(id, name);
            historyKeySearchtore.remove();
            self.forwardJump('list', '/webapp/tuan/list');
        },
        /**
        * 获取团购列表
        * @param {Boolean} notClearAll 不清除现有团购列表
        */
        getGroupListData: function () {
            this.listWrap.html(this.tplLoading);
            var searchData = searchStore.get(),
                gpsInfo = geolocationStore.getAttr('gps'),
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
                    self.renderList(list);
                } else {
                    this.listWrap.html(this.tplNoproduct);
                }

            }, function (err) {
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
            var url, self = this;
            if (category === 'feature') {
                this.getBannerClass(function (urls) {
                    var url = urls[searchData.ctyId];

                    if (url) {
                        TuanApp.jumpToPage(url,self);
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
            var self = this;
            var item = $(e.currentTarget);

            if (!item.attr('data-category')) item = item.parent("li");

            var category = item.attr('data-category');

            if (category == 'hotel' || category == 'catering' || category == 'ticket' || category == 'entertainment' || category == 'nearby') {
                this.geoCallback.type = category;
                this.geoCallback.cancelNearby = 0;
                this.showLoading();
                this.locateInterface();
            } else if (category == 'lottery') {
                this.forwardJump('lottery', '/webapp/tuan/lottery');
            } else {
                this.goList(category);
            }
        },
        showCityPage: function () {
            this.forwardJump('citylist', '/webapp/tuan/citylist');
        },
        showKeywordSearch: function (e) {
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
                var list = data,
                    bannerWrap = this.$el.find('.ad_link'),
                    banners = data && data.banners;

                //支持展示2个或4个广告位，4个广告位尺寸相同
                if (banners && (banners.length == 2 || banners.length == 4)) {
                    bannerWrap.html(adTpl({ ads: banners }));
                    bannerWrap.show();
                } else {
                    bannerWrap.hide();
                    bannerWrap.html('');
                }

            }, function (err) {

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
            };
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

        /*
        *检查是否有定位缓存， 如果有定位缓存， 就不需要发起定位了
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
        /*
        * 检查网络
        */
        checkNetwork: function (callback) {
            var self = this;
            isInApp ? Guider.app_check_network_status({
                callback: function (json_obj) {
                    var hasNetwork = json_obj && json_obj.hasNetwork;
                    if (!hasNetwork) { //无网络提示
                        var alertMsg = new cUIAlert({
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
                        alertMsg.show();
                        return;
                    }
                    callback && callback.call(self);
                }
            }) : callback && callback.call(self);
        },
        /**
        * 发起定位
        */
        getPosition: function (hasNetwork) {
            var self = this;

            //点击“我的附近”， 提示定位中
            if (this.geoCallback.type == 1) {
                this.geoCallback.cancelNearby = 0;
                loadingLayer = new c.ui.LoadingLayer(function () { self.geoCallback.cancelNearby = 1; this.hide(); }, '定位中...');
                loadingLayer.show();
            }
            //已经在定位了
            if (this.locating == true) { return; }

            //开始定位中....
            this.locating = true;

            GeoLocation.Subscribe('tuan/home', {
                onComplete: function (address) {
                    this.locating = false;
                    address.city = address.city.replace('市市', '市');
                    if (address.city.length > 2) address.city = address.city.replace('市', '');
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
                onPosComplete: function (lng, lat) {
                },
                onPosError: this.geoError
            }, this, true);
        },
        /**
        * 定位失败,反查城市失败
        */
        geoError: function () {
            var type = this.geoCallback.type;
            //定位失败时，酒店、美食、门票、娱乐按非同城查询
            if (type && (type == 'hotel' || type == 'catering' || type == 'ticket' || type == 'entertainment')) {
                this.goList(type);
                return;
            }
            this.locating = false;
            var self = this;
            positionStore.set(null);
            loadingLayer && loadingLayer.hide();
            var alertMsg = new cUIAlert({
                title: '提示',
                message: '无法获取您的城市，您可以选择其他城市',
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
            alertMsg.show();
            this.hideLoading();
        },
        /**
        *反查城市
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
                self.locating = false;
                var cityData;
                if (data && data.CityID && data.CityID > 0) { //有效的城市ID
                    StoreManage.setCurrentCity(data)
                    cityData = { "cityId": data.CityID, "cityName": data.CityName, "hasGroupProduct": data.HasGroupProduct };
                    positionStore.setAttr("cityId", data.CityID);
                    positionStore.setAttr("cityName", data.CityName);
                    positionStore.setAttr("hasGroupProduct", data.HasGroupProduct);
                }
                self.geoCallback.status = 1;
                typeof callback === 'function' && callback.call(self, cityData);
            }, function (err) {
                self.geoCallback.status = 0;
                typeof callback === 'function' && callback.call(self);
            }, false, this);
        },

        getCityFailed: function () {
            var self = this;
            self.locating = false;
            positionStore.setAttr("cityId", null);
            positionStore.setAttr("cityName", null);
            var alertMsg = new cUIAlert({
                title: '提示',
                message: '无法获取您的城市，您可以选择其他城市',
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
                            self.showCityPage();
                            self.recordSwitchCityFlag();
                            this.hide();
                        }
                    }
                ]
            });
            alertMsg.show();
        },
        /**
        *提示是否需要城市切换
        * @param {object} cityData 成功后的回调
        */
        promptSwitchCity: function (cityData) {
            var self = this,
                currentCity = self.getSelectedCity(),
                alertMsg;

            //如果用户点击取消，则不再提醒用户切换城市            
            if (sessionStorage.getItem(IGNORE_CITY_CHANGE_KEY) == 1) {
                return;
            }
            //有效的城市信息
            if (cityData && cityData.cityId && cityData.cityName) {
                //如果用户点击取消，则不再提醒用户切换城市            
                if (sessionStorage.getItem(IGNORE_CITY_CHANGE_KEY) != 1 && (currentCity.id > 0 && currentCity.id != cityData.cityId)) {
                    if (cityData.hasGroupProduct) {
                        alertMsg = new cUIAlert({
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
                        alertMsg.show();
                    } else {
                        alertMsg = new cUIAlert({
                            title: '提示',
                            message: '您所在的城市暂无团购产品<br/>您可以选择其他城市',
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
                        alertMsg.show();
                    }
                }
                //已经是同城了
                if (currentCity.id != cityData.cityId) {
                    self.recordSwitchCityFlag();
                }
            } else {
                alertMsg = new cUIAlert({
                    title: '提示',
                    message: '无法获取您的城市，您可以选择其他城市',
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
                alertMsg.show();
            }
        },
        /*
        * 记录不再需要切换城市的标记
        */
        recordSwitchCityFlag: function () {
            sessionStorage.setItem(IGNORE_CITY_CHANGE_KEY, 1);
        },
        /**
        * 定位回调
        */
        locatedCallback: function (data) {
            var type = this.geoCallback.type, //0: 表示：首页定位
                status = this.geoCallback.status, //0: 表示定位失败， 1：表示定位成功
                cancelnearby = this.geoCallback.cancelNearby, //1:表示取消'我的附近'定位（其实定位不会取消，后台继续定位，但是后续操作没有callback），0：正常状态
                self = this;
            if (type == 0) { //首页定位
                if (status == 1) {  //首页定位成功， 提示切换城市
                    self.promptSwitchCity(data);
                } else if (status == 0) { //首页定位失败， 提示错误信息
                    self.getCityFailed();
                }
            } else {
                if (cancelnearby) { //取消 “我的附近”定位, 不操作
                    return;
                }
                loadingLayer && loadingLayer.hide();
                if (status == 1) {  //定位成功， 进入列表页，展示我附近的团购
                    if (type == 'nearby') {
                        self.goNearbyGroup(data, type);
                    } else {
                        if (data.cityId == searchStore.getAttr('ctyId')) {//同城，按附近团购查询
                            self.goNearbyGroup(data, type);
                        } else { //非同城，按非同城查询
                            self.goList(type);
                        }
                    }
                } else if (status == 0) { //定位失败， 提示错误信息
                    if (type == 'nearby') { //点击的是"附近团购"，提示定位失败
                        self.getCityFailed();
                    } else {//点击的是"酒店、美食、娱乐"等，按非同城查询
                        self.goList(type);
                    }
                }
            }
        },
        getBannerClass: function (complete, error) {
            this.showLoading();
            bannerClassModel.excute(function (data) {
                this.hideLoading();
                var urls = {};
                _.each(_.filter(data.Banner || [], function (o) { return o.type === 14; }), function (o) {
                    return urls[o.cityid] = o.url;
                });
                complete && complete(urls);
            }, function () {
                this.hideLoading();
                error && error();
            }, false, this, function () {
                this.hideLoading();
            });
        }
    });
    return View;
});
