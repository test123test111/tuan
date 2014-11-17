/**
 * 列表页面
 * @url: m.ctrip.com/webapp/tuan/list
 */
define(['TuanApp', 'c', 'TuanBaseView', 'cCommonPageFactory', 'cWidgetGuider', 'MemCache', 'StringsData', 'cUtility', 'cGeoService', 'cWidgetFactory', 'cUIToast', 'TuanStore', 'TuanModel', 'TuanFilters', 'StoreManage', 'LazyLoad', 'ScrollObserver', 'text!ListProductTpl', 'text!ListBusinessTpl', 'cWidgetGeolocation'],
function (TuanApp, c, TuanBaseView, CommonPageFactory, WidgetGuider, MemCache, StringsData, Util, GeoService, WidgetFactory, Toast, TuanStore, TuanModels, TuanFilters, StoreManage, LazyLoad, ScrollObserver, listProduct, listBusiness) {
    'use strict';
    var REFRESH_GPS_LOADING_CLS = 'ani_rotation',
        PAGE_POSITION = 'PAGE_LIST_POSITION',
        CUI = c.ui,
        isInApp = Util.isInApp(),
        listModel = TuanModels.TuanListModel.getInstance(), //团购列表(产品聚合)
        hotelListModel = TuanModels.TuanHotelListModel.getInstance(), //团购列表(商户聚合)
        sortStore = TuanStore.GroupSortStore.getInstance(), //团购排序
        getLocalCityInfoModel = TuanModels.TuanLocalCityInfo.getInstance(),
        searchStore = TuanStore.GroupSearchStore.getInstance(),
        categoryfilterStore = TuanStore.GroupCategoryFilterStore.getInstance(),  //团购类型
        returnPageStore = TuanStore.OrderDetailReturnPage.getInstance(),
        tuanCityListModel = TuanModels.TuanCityListModel.getInstance(), //团购城市
        positionfilterStore = TuanStore.GroupPositionFilterStore.getInstance(), //区域筛选条件
        customFiltersStore = TuanStore.GroupCustomFilters.getInstance(), //团购自定义筛选项
        conditionModel = TuanModels.TuanConditionModel.getInstance(), //团购筛选Model
        conditionStore = TuanStore.GroupConditionStore.getInstance(), //团购筛选数据
        geolcationStore = TuanStore.GroupGeolocation.getInstance(), //经纬度信息
        positionStore = TuanStore.TuanPositionStore.getInstance(), //定位信息
        historyCityListStore = TuanStore.TuanHistoryCityListStore.getInstance(), //历史选择城市
        geolocationStore = TuanStore.GroupGeolocation.getInstance(), //经纬度信息
        View,
        MSG = {
            tuangou: '团购',
            youAreHere: '您的位置 '
        },
        Guider = WidgetFactory.create('Guider'),
        GeoLocation = GeoService.GeoLocation;

    var PageView = CommonPageFactory.create("TuanBaseView");
    View = PageView.extend({
        pageid: '214001',
        hpageid: '215001',
        totalPages: null, //总页数
        isComplete: false, //是否完成
        isLoading: false,
        isScrolling: false,
        pageSize: 25, //每页加载数
        render: function () {
            var wrap = this.$el;
            //团购列表容器
            this.listWrap = wrap.find('#J_listWrap');
            //筛选项容器
            this.filterWrap = wrap.find('.J_filtersAndSortPanel');
            //产品聚合模版渲染函数
            this.productListTpl = _.template(listProduct);
            //商户聚合模版渲染函数
            this.businessListTpl = _.template(listBusiness);
            //当前位置容器
            this.gpsInfoWrap = wrap.find('#J_gpsInfoWrap');
        },
        events: {
            'click li[data-id]': 'detailHandler', //详情页
            'click #J_reloadGPS': 'refreshGeolocation',
            'click #J_keywordSearch': 'showKeywordSearch',
            'click .cui-btns-retry': 'reloadPage',
            'click .J_showMore': 'showMore',
            'click .J_phone': 'callPhone',
            'click #J_deleteFilter li': 'deleteFilter'
        },
        callPhone: function (e) {
            Guider.apply({
                hybridCallback: function () {
                    var PHONE_ATTR_STR = 'data-phone',
                        target = $(e.target);

                    if (!target.attr(PHONE_ATTR_STR)) {
                        target = target.find('[' + PHONE_ATTR_STR + ']');
                    };

                    e.preventDefault();
                    Guider.callPhone({ tel: target.attr(PHONE_ATTR_STR) });
                    return false;
                },
                callback: function () {
                    return true;
                }
            });
        },
        /**
        * 获取本地城市信息
        * @param {float} lng 经度
        * @param {float} lat 纬度
        * @param {string} district 区
        * @param {string} city 城市名称
        * @param {string} province 省
        * @param {isOverseas} 是否是海外吗true为海外false为国内
        * @param {function} callback 成功后的回调
        */
        getLocalCityInfo: function (geoInfo, callback) {
            var self = this,
                successFn,
                errorFn,
                reloadBtn = this.gpsReloadBtn;

            successFn = function (data) {
                reloadBtn.removeClass(REFRESH_GPS_LOADING_CLS);
                StoreManage.setCurrentCity(data);
                //存储city信息
                positionStore.setAttr("cityId", data.CityID);
                positionStore.setAttr("cityName", data.CityName);
                positionStore.setAttr("hasGroupProduct", data.HasGroupProduct);
                searchStore.setAttr("ctyId", data.CityID);
                searchStore.setAttr("ctyName", data.CityName);
                callback && callback();
            };
            errorFn = function () {
                reloadBtn.removeClass(REFRESH_GPS_LOADING_CLS);
                positionStore.setAttr("cityId", null);
                positionStore.setAttr("cityName", null);
                self.showToast('抱歉，获取不到当前位置!');
            };
            getLocalCityInfoModel.setParam({
                lng: geoInfo.lng,
                lat: geoInfo.lat,
                district: encodeURIComponent(geoInfo.district),
                cityname: encodeURIComponent(geoInfo.city),
                province: encodeURIComponent(geoInfo.province),
                isOverseas: geoInfo.isOverseas
            });

            getLocalCityInfoModel.excute(successFn, errorFn, false, this);
        },
        isCurrentCityChange: function () {
            var currentCity = StoreManage.getCurrentCity(),
                cityId = currentCity.CityId;

            return cityId && cityId != searchStore.getAttr('ctyId');
        },
        positionSearchPanel: function (data) {
            var self = this,
                direction = data.direction;
            //向上传，出现关键词浮层，当滚动下于50，则不浮动
            if (direction.toLowerCase() == 'up' && data.y > 30) {
                self.keywordPanel.addClass('list_s_fixed');
                self.keywordPanel.css('top', !isInApp && self.isNearBy() ? '78px' : isInApp ? '0' : '48px'); //如果在app中head被native头取代
            } else {
                self.keywordPanel.removeClass('list_s_fixed');
                self.keywordPanel.css('top', '0');
            };
        },
        /**
        * 重新定位
        * @param {Event} e 当前点击事件
        */
        refreshGeolocation: function (e) {
            var target = $(e.target),
                self = this;

            target.addClass(REFRESH_GPS_LOADING_CLS);
            this.getGeolocation(function () {
                self.getGroupListData();
            });
        },
        /**
        * @param {function} callback 执行回调
        */
        getGeolocation: function (callback) {
            var self = this,
                infoWrap = this.$el.find('#J_gpsInfo'),
                successFn, errorFn;

            successFn = function (gpsInfo) {
                self.displayGPSInfo(gpsInfo, true, callback);
            };
            errorFn = function () {
                positionStore.set(null);
                infoWrap.parent().find('.' + REFRESH_GPS_LOADING_CLS).removeClass(REFRESH_GPS_LOADING_CLS);
                self.showToast('抱歉，获取不到当前位置，请打开GPS后重试!');
            };

            GeoLocation.Subscribe('tuan/list', {
                onComplete: function (address) {
                    successFn(address);
                },
                onError: errorFn,
                onPosComplete: function (lng, lat) {
                },
                onPosError: errorFn
            }, this, true);
        },
        /**
        * 展示当前位置信息
        * @param gpsInfo
        * @param isNearBy 是否是附近的团购
        */
        displayGPSInfo: function (gpsInfo, isNearBy, callback) {
            var infoWrap = this.gpsInfoWrap,
                reloadBtn = this.gpsReloadBtn,
                cityName = searchStore.getAttr('ctyName') || '',
                positionData = positionfilterStore.get(),
                text = '距离: ';

            gpsInfo = gpsInfo || {};
            reloadBtn[isNearBy ? 'show' : 'hide']();
            if (isNearBy && gpsInfo) { //我的附近
                text += (MSG.youAreHere + gpsInfo.address);
            } else {
                if (positionData && positionData.name) { //位置区域
                    if (positionData.type != 4) { //商业区、大学周边
                        text += (positionData.pos && positionData.pos.name) || positionData.name;
                    } else { //行政区
                        text += cityName + StringsData.CITY_CENTER;
                    }
                } else {
                    if (gpsInfo.address) {
                        text += gpsInfo.address == cityName ? cityName + StringsData.CITY_CENTER : gpsInfo.address;
                    } else {
                        text += (cityName || '') + StringsData.CITY_CENTER;
                    }
                }
            }
            infoWrap.html(text);

            if (isNearBy) {
                gpsInfo.city = gpsInfo.city && gpsInfo.city.replace('市', ''); //不显示"市";
                positionStore.set(gpsInfo);
                geolcationStore.setAttr('gps', gpsInfo);
                var geoInfo = {
                    lng: gpsInfo.lng,
                    lat: gpsInfo.lat,
                    district: gpsInfo.district,
                    city: gpsInfo.city,
                    province: gpsInfo.province,
                    isOverseas: gpsInfo.country != '中国'
                };
                this.getLocalCityInfo(geoInfo, callback);
            };
        },
        initTuanFilters: function () {
            var wrap = this.$el;
            //必须判断，否则会重复绑定事件
            if (!this.tuanfilters) {
                this.tuanfilters = TuanFilters.getInstance({
                    sortTrigger: wrap.find('#J_sortTrigger'),
                    sortPanel: wrap.find('#J_sortPanel'),
                    sortLabel: wrap.find('#J_sortTrigger'),
                    categoryTrigger: wrap.find('#J_categoryTrigger'),
                    categoryPanel: wrap.find('#J_categoryPanel'),
                    positionTrigger: wrap.find('#J_positionTrigger'),
                    positionPanel: wrap.find('#J_positionPanel'),
                    customFilter: wrap.find('#J_customFilters'),
                    filterPanel: wrap.find('#J_filterPanel'),
                    page: this,
                    sortDefaultIndex: sortStore.getAttr('sortTypeIndex') || 0
                });

                this.filterWrap.show();
                this.filterWrap.css({'-webkit-transform': 'translate(0, 30px) translateZ(0)', 'opacity': 0});
                this.filterWrap.animate({'-webkit-transform': 'translate(0, 0px) translateZ(0)', 'opacity': 1});
            } else {
                this.hideFilterDropDowns();
                this.tuanfilters.updateCategoryName();
                this.tuanfilters.updatePositionName();
                this.tuanfilters.updateCustomFilterIcon();
            }
        },
        hideFilterDropDowns: function () {
            var tuanfilters = this.tuanfilters;

            tuanfilters.sort.hide();
        },
        onCreate: function () {
            var wrap = this.$el;
            searchStore.setAttr('pageIdx', 1);
            //滚动加载下一页数据
            this.onWindowScroll = $.proxy(this._onWindowScroll, this);
            // this.isNearBy() && this.createGPS();
            this.render();

            //检查来源，并做保存来源数据
            TuanApp.saveUnion(true);

            this.gpsInfoWrap.css('top', isInApp ? '0px' : '48px');
            if (isInApp) {
                wrap.find('#J_searchBoxWrap').addClass('hybrid');
                //如果是hybrid初始化语音功能
                TuanApp.initVoiceSearch && TuanApp.initVoiceSearch(wrap.find('#J_voiceTrigger'));
            }
        },
        isFromDetail: function (refer) {
            return refer && refer.match(/detail/i);
        },
        isFromListMap: function (refer) {
            return refer && refer.match(/listmap/i);
        },
        controlGPSInfoWrap: function (visible) {
            this.gpsInfoWrap.css('display', visible ? '' : 'none');
        },
        /**
        * @param {Object} searchData 所有查询条件键值对
        * @return {Object} 城市对象
        */
        getCurrentCity: function (searchData) {
            var city = {
                id: searchData.ctyId,
                name: searchData.ctyName
            },
                cityId = this.getQuery('cityid'); //从QueryString中获取cityid

            if (cityId && +cityId > 0) {
                //判断是否有搜过过的城市记录，有则不替换
                city = StoreManage.findCityInfoById(cityId);
            };
            if (!(+city.id)) {
                city = StringsData.defaultCity;
            };
            return city;
        },
        /**
        * 是否是选择了附近的团购
        * @return {Boolean}
        */
        isNearBy: function () {
            //return true;
            return searchStore.getAttr('nearby') || historyCityListStore.getAttr('nearby');
        },
        /**
        * 判断是否从hybrid的公共收藏列表页过来
        * @returns {*|boolean}
        */
        isFromHybridFavorPage: function () {
            return isInApp && Lizard.P('from_native_page') == 1;
        },
        /**
        * 是否1元团购
        */
        isOneYuan: function () {
            return customFiltersStore.getAttr('price.val') == '1|1';
        },
        /**
        * 更新header
        * @param title
        */
        updateTitle: function (title) {
            var self = this;

            this.header.set({
                title: title.indexOf(MSG.tuangou) > -1 ? title : title + MSG.tuangou,
                back: true,
                view: this,
                events: {
                    returnHandler: function () {
                        if (self.isNearBy()) {
                            searchStore.removeAttr('nearby');
                            historyCityListStore.removeAttr('nearby');
                        }
                        self.clearPagePos();

                        if (self.isFromHybridFavorPage()) {
                            Guider.backToLastPage({ 'param': JSON.stringify({ "biz": "tuan", "refresh": "1" }) });
                            return;
                        } else {
                            var from = Lizard.P('from');
                            if (from) {
                                TuanApp.jumpToPage(from, self);
                            } else {
                                self.back('home');
                            }
                        }
                    },
                    homeHandler: $.proxy(self.homeHandler, self),
                    commitHandler: function () {
                        self.gotoMapPage();
                    }
                },
                btn: { title: "地图", id: 'J_gotoMapPage', classname: 'rightblue' }
            });
            this.header.show();
        },
        gotoMapPage: function () {
            if (this.isDataReady) {
                //地图的widget只会实例化一次，这里需要使用缓存
                this.forwardJump('listmap', '/webapp/tuan/listmap');
            };
        },
        createPage: function () {
            var searchData = searchStore.get(),
                ctype = searchData.ctype,
                cityId = searchData.ctyId || StringsData.defaultCity.id,
                isNearby = this.isNearBy(),
                isOneYuan = this.isOneYuan();
            var title = StringsData.groupType[ctype]['name'] || StringsData.groupType[0]['name'];
            if (isOneYuan) {
                title = '一元团购';
            }
            this.updateTitle(title);
            this.initKeywordSearch(); //初始化关键词搜索框
            this.hideForbiddens(!isNearby, '.J_forbidden');
            this.keywordPanel = this.$el.find('#J_keywordSearchPanel');

            if (isNearby) { //'我的附近'进入
                this.getGroupListData();

                //地图页可能更改了团购分类
                if (this.isFromListMap(this.referUrl)) {
                    this.tuanfilters && this.tuanfilters.updateCategoryName();
                }
            } else {
                if (Lizard.P('cityid')) {//有cityid，则是直接从外部通过url传参进入，要把url里面的参数存入searchStroe
                    var qparams = StoreManage.getGroupQueryParam();
                    searchStore.setAttr('qparams', qparams);
                }
                this.getGroupListData();
                //1元团购频道显示纯列表，隐藏底部筛选项
                if (isOneYuan) {
                    this.filterWrap.hide();
                } else {
                    if (this.tuanfilters) {
                        this.filterWrap.show();
                    }
                    this.getConditionData(cityId);
                }
            }
        },
        hideForbiddens: function (isHidden, targetCS) {
            this.$el.find(targetCS)[isHidden ? 'hide' : 'show']();
        },
        getConditionData: function (cityId) {
            conditionModel.setParam('ctyId', cityId);
            var type = 1; //品牌 Brand
            type |= 2;    //行政区 Location
            type |= 4;    //商业区 Zone
            type |= 8;    //大学周边 School
            //type |= 16; //团购类型(一级分类) Category
            //type |= 32; //团购类型(二级分类) SubCategory
            type |= 64;   //团购类型(一级分类) NewCategory
            type |= 128;  //团购类型(二级分类) NewSubCategory
            type |= 256;  //火车站 RailwayStation
            type |= 512;  //飞机场 Airport
            type |= 1024; //地铁线路 SubwayLine
            type |= 2048; //地铁站点 SubwayStation
            type |= 4096; //景点 Attraction
            type |= 8192; //酒店特色 HotelFeature
            conditionModel.setParam('type', type);
            conditionModel.setParam('categroy', searchStore.getAttr('ctype'));
            conditionModel.excute(function (data) {
                this.initTuanFilters();
            }, function (err) {
            }, false, this);
        },
        renderPageByCity: function () {
            var self = this;
            tuanCityListModel.excute(function (data) {
                self.createPage(data);
            }, function (err) {
                self.createPage(err);
            }, false, this);
        },
        onHide: function () {
            GeoLocation.UnSubscribe('tuan/list');
            this.$el.find('#J_reloadGPS').removeClass(REFRESH_GPS_LOADING_CLS);
            var tuanfilters = this.tuanfilters,
                sort = tuanfilters && tuanfilters.sort;

            this.LazyLoad && this.LazyLoad.unbindEvents();
            $(window).unbind('scroll', this.onWindowScroll);
            this.hideWarning404();
            this.hideLoading();
            this.scrollObserver && this.scrollObserver.disable();
            this.alert && this.alert.hide();
            sort && sort.mask.root && sort.mask.root.hide();
            tuanfilters && tuanfilters.mask && tuanfilters.mask.hide();
        },
        onShow: function (refer) {
            this.referUrl = refer || this.getLastViewName();
            //定位提示容
            this.gpsInfoWrap = this.$el.find('#J_gpsInfo');
            this.gpsReloadBtn = this.$el.find('#J_reloadGPS');

            var self = this;
            var isNearBy;

            // TODO: 补充注释
            if (returnPageStore) { returnPageStore.remove(); }

            if (searchStore.getAttr('from_feature')) {

                this.emptyPage('当地特色', searchStore.getAttr('ctyName'));
                return;
            }

            //如果从详情页后退不请求数据
            if (!this.isFromDetail(this.referUrl) || !MemCache.getItem('hasListData')) {
                //显示loading
                this.showLoading();
                //清空列表
                this.listWrap.empty();

                //初始化页码
                searchStore.setAttr('pageIdx', 1);
                //解析query参数
                StoreManage.saveQueryString(function () {
                    isNearBy = self.isNearBy();
                    //调整代码执行，原先位置会导致从攻略过来，一直显示定位中
                    var gpsInfo = geolcationStore.getAttr('gps');
                    if (isNearBy && gpsInfo) {
                        var infoWrap = self.gpsInfoWrap,
                            reloadBtn = self.gpsReloadBtn,
                            gps = geolocationStore.getAttr('gps'),
                            text = '距离: ';

                        reloadBtn.show();
                        text += (MSG.youAreHere + gps.address);
                        infoWrap.html(text);
                    };

                    //我的附近默认按距离最近排序
                    if (sortStore.getAttr('sortTypeIndex') == null && self.isNearBy()) {
                        searchStore.setAttr('sortRule', 8);
                        sortStore.setAttr('sortTypeIndex', 1);

                        //第二次进入list页面时，选中距离最近
                        if (self.tuanfilters) {
                            var item = $(self.tuanfilters.sort.getItemByIndex(1))[0];
                            self.tuanfilters.sort.select(item, true);
                        }
                    }
                    //获取当前城市切请求数据
                    self.renderPageByCity();
                });
            } else {
                var ctype = searchStore.getAttr('ctype');
                var title = StringsData.groupType[ctype]['name'] || StringsData.groupType[0]['name'];
                if (this.isOneYuan()) {
                    title = '一元团购';
                }
                this.updateTitle(title);
                this._restoreScrollPos();
            };

            //图片延迟加载插件
            this.LazyLoad = new LazyLoad({ wrap: this.$el, animate: 'opacity-fade-in' });
            $(window).bind('scroll', this.onWindowScroll);
            this.scrollObserver && this.scrollObserver.enable();
        },
        _onWindowScroll: function () {
            var pos = c.ui.Tools.getPageScrollPos(),
                param = searchStore.get(), //获取查询参数
                pageNum = isNaN(param.pageIdx) ? 1 : param.pageIdx; //当前页码

            if (param.pageIdx < this.totalPages && this.totalPages > 1) {
                this.isComplete = false;
            };

            var h = pos.pageHeight - (pos.top + pos.height);
            if (h <= 300 && !this.isComplete && !this.isLoading) {
                this.isLoading = true;
                if (param.pageIdx >= this.totalPages) {
                    this.isComplete = true;
                    return;
                };
                param.pageIdx = ++pageNum;
                searchStore.setAttr('pageIdx', param.pageIdx);
                this.getGroupListData(true);
            };
        },
        showBottomLoading: function () {
            if (!this.bottomLoading) {
                this.bottomLoading = $('<div style="bottom: 48px;" class="cui-zl-load"> <div class="cui-i cui-b-loading"></div><div class="cui-i cui-mb-logo"></div> <p>加载中…</p></div>');
                this.$el.append(this.bottomLoading);
            }
            this.bottomLoading.show();
        },
        hideBottomLoading: function () {
            if (this.bottomLoading) {
                this.bottomLoading.hide();
            }
        },
        reloadPage: function () {
            this.showLoading();
            this.getGroupListData(false, true);
        },
        renderList: function (data) {
            var searchData = searchStore.get();
            var sortRule = searchData.sortRule;
            data.pageIdx = searchData.pageIdx;
            var item = $.trim(this[sortRule == '8' ? 'businessListTpl' : 'productListTpl'](data)); //距离最近时，按商户聚合显示
            if (data.count && +data.count > 0 && this.totalPages && +this.totalPages > 1) {
                if (sortRule == '8') {
                    this.listWrap.append(item);
                } else {
                    if (data.pageIdx > 1) {
                        this.listWrap.find('ul').append(item);
                    } else {
                        this.listWrap.append(item);
                    }
                }
            } else {
                if (!this.totalPages || +this.totalPages < 1 || !searchData.pageIdx || +searchData.pageIdx <= 1) {
                    this.listWrap.html(item);
                };
            };
            if (data.count > 0 && data.pageIdx >= this.totalPages) {
                this.listWrap.append('<p class="sec-waiting" style="display:block;">没有更多结果了</p>');
            }
        },
        /**
        * 是否请求到了数据
        */
        isDataReady: false,
        /**
        * 获取团购列表
        * @param {Boolean} notClearAll 不清除现有团购列表
        */
        getGroupListData: function (notClearAll, fromServer) {
            var cityInfo, cityId, key, model,
                self = this,
                isNearBy = self.isNearBy(),
                gps = geolocationStore.getAttr('gps'),
                sortRule = searchStore.getAttr('sortRule'),
                pos = positionfilterStore.getAttr('pos'),
                posType = positionfilterStore.getAttr('type');

            if (sortRule == '8') {//距离最近排序时，按商户聚合显示
                model = hotelListModel;
                key = 'hotels';
                if (isNearBy) {
                    searchStore.removeAttr('pos'); //因为qparams里面已有地位的经纬度，故不需再传pos
                } else {
                    if (!pos || posType == '4') { //不限或行政区
                        cityId = searchStore.getAttr('ctyId');
                        cityInfo = StoreManage.findCityInfoById(cityId); //取市中心的经纬度
                        gps = cityInfo && cityInfo.pos || {};
                        searchStore.setAttr('pos', {
                            posty: StringsData.MAP_SOURCE_ID,
                            lon: gps.lon || 0,
                            lat: gps.lat || 0,
                            name: cityInfo.name + StringsData.CITY_CENTER
                        });
                    } else if (posType < 0 || posType == '5') { //地图屏幕内查询、地铁站、机场车站、景点、大学周边或商业区
                        searchStore.setAttr('pos', pos);
                    }
                }
            } else {
                model = listModel;
                key = 'products';
                if (pos && posType < 0) {//地图屏幕内查询、地铁站、机场车站、景点、大学周边
                    searchStore.setAttr('pos', pos);
                } else {
                    searchStore.removeAttr('pos');
                    // cityId = searchStore.getAttr('ctyId');
                    // cityInfo = StoreManage.findCityInfoById(cityId); //取市中心的经纬度
                    // gps = cityInfo && cityInfo.pos || {};
                    // searchStore.setAttr('pos', {
                        // posty: StringsData.MAP_SOURCE_ID,
                        // lon: gps.lon || 0,
                        // lat: gps.lat || 0,
                        // name: cityInfo.name + StringsData.CITY_CENTER
                    // });
                }
            }

            notClearAll && self.showBottomLoading();
            searchStore.setAttr('environment', TuanApp.environment);
            model.param = searchStore.get();

            //'附近团购'进入，不传cityID
            if (isNearBy && searchStore.getAttr('ctype') == 0) {
                model.param.ctyId = 0;
                model.param.ctyName = '';
            }
            var currPageIndex = model.param.pageIdx;
            model.excute(function (data) {
                var list = data;

                this.isLoading = false;
                self.hideLoading();
                notClearAll && self.hideBottomLoading();
                if (data && data[key] && data[key].length && data.count && +data.count > 0) {
                    this.isDataReady = true;
                    this.totalPages = Math.ceil(data.count / this.pageSize);
                    if (this.totalPages > 1) {
                        $(window).bind('scroll', this.onWindowScroll);
                    };
                    list.isNearBy = isNearBy;
                    !notClearAll && this.listWrap.empty();
                    this.renderList(list);
                    if (isNearBy && sortRule == '8' && currPageIndex <= 1) { //如果是根据经纬度查询，开始时不知道城市ID的，所以通过返回的城市ID，初始化筛选项
                        var cityid = data && data.city && data.city.cityid,
                            cityname = data && data.city && data.city.cityName;
                        if (cityid && cityname) {
                            searchStore.setAttr('ctyId', cityid);
                            searchStore.setAttr('ctyName', cityname);
                            //判断是否已经初始化过，底部筛选项， 如果没有初始化，执行初始化
                            if (!this.tuanfilters) {
                                this.getConditionData(cityid);
                            }
                        }
                    }
                    MemCache.setItem('hasListData', true);
                    if (searchStore.getAttr('pageIdx') <= 1 && !isNearBy) {
                        self.displayGPSInfo(data.curpos || {}, isNearBy);
                    }
                } else {
                    if (searchStore.getAttr('pageIdx') > 1) {
                        self.showToast('亲，数据加载完毕');
                    } else if (this.totalPages || this.totalPages <= 0) {
                        this.renderNoResult('', key);
                    }
                    searchStore.setAttr('pageIdx', 1);
                    this.isComplete = true;
                    $(window).unbind('scroll', this.onWindowScroll);
                    if (!isNearBy) {
                        self.displayGPSInfo(data.curpos || {}, isNearBy);
                    }
                };
                this.LazyLoad && this.LazyLoad.updateDom();
            }, function (err) {
                this.hideLoading();
                this.isLoading = false;
                this.isComplete = true;
                if (this.totalPages <= 0) {
                    this.listWrap.empty();
                    this.renderNoResult(err.msg, key);
                }
                searchStore.setAttr('pageIdx', 1);
                $(window).unbind('scroll', this.onWindowScroll);
            }, !!fromServer, self);
        },
        emptyPage: function (title, cityName) {
            this.updateTitle(title);
            this.renderNoResult('', 'hotels', {'feature': {val: '', txt: title}});
            this.gpsInfoWrap.text('距离：' + cityName + StringsData.CITY_CENTER);
        },
        renderNoResult: function (msg, key, customdata) {
            var lst = {
                count: 0,
                positionFilter: positionfilterStore.get() || {},
                weekendsAvailable: searchStore.getAttr('weekendsAvailable'),
                keywordData: StoreManage.getCurrentKeyWord()
            };
            customdata = customdata || customFiltersStore.get() || {};
            var distance = customdata && customdata.distance && customdata.distance.val;
            distance = distance || lst.positionFilter.pos && lst.positionFilter.pos.distance;
            lst[key] = null;
            if (msg) {
                lst.msg = msg;
            } else {
                lst.msg = (distance ? distance + '公里内' : '') + '没找到符合条件的结果，请修改条件重新查询';
            }
            lst.customFilter = customdata;
            this.renderList(lst);
        },
        initKeywordSearch: function () {
            var searchBox = this.$el.find('#J_keywordSearch'),
                lastSearchKeyword = StoreManage.getCurrentKeyWord();

            this.searchKeywordInput = searchBox;
            CUI.InputClear(searchBox);
            searchBox.val(lastSearchKeyword && lastSearchKeyword.word || ''); //关键词字段，TODO：转存到另一个localstorage
        },
        detailHandler: function (e) {
            var id = $(e.currentTarget).attr('data-id'),
                cid = searchStore.getAttr('ctyId');
            this._saveScrollPos();
            this.forwardJump('detail', '/webapp/tuan/detail/' + id + '.html' + (cid ? '?cityid=' + cid : ''));
        },
        clearPagePos: function () {
            MemCache.setItem(PAGE_POSITION, null);
        },
        _restoreScrollPos: function () {
            var pos = MemCache.getItem(PAGE_POSITION);

            if (pos && pos.y) {
                setTimeout(function () {
                    window.scrollTo(pos.x, pos.y);
                }, 0);
            };
        },
        _saveScrollPos: function () {
            MemCache.setItem(PAGE_POSITION, { x: window.scrollX, y: window.scrollY });
        },
        deleteFilter: function (e) {
            var t = $(e.currentTarget);
            var type = t.data('type');
            var label = this.$el.find('#J_filterTabLabel');
            var panel = this.$el.find('#J_filterTabPanel');
            switch (type) {
                case 'position':
                    positionfilterStore.remove();
                    this.tuanfilters && this.tuanfilters.renderPosition();
                    this.tuanfilters && (this.tuanfilters._positionInited = undefined);
                    break;
                case 'star':
                    var currStar = customFiltersStore.getAttr('star');
                    delete currStar[t.data('value')];
                    if ($.isEmptyObject(currStar)) {
                        customFiltersStore.removeAttr('star');
                        label.find('li[data-tab="star"] i').hide();
                    } else {
                        customFiltersStore.setAttr('star', currStar);
                    }
                    break;
                case 'weekendsAvailable':
                    searchStore.setAttr('weekendsAvailable', 0);
                    this.$el.find('#weekends')[0].checked = false;
                    break;
                case 'voucher':
                    customFiltersStore.removeAttr('voucher');
                    this.$el.find('#voucher')[0].checked = false;
                    break;
                case 'multiShop':
                    customFiltersStore.removeAttr('multiShop');
                    this.$el.find('#multiShop')[0].checked = false;
                    break;
                case 'keyword':
                    StoreManage.removeCurrentKeyWord();
                    this.$el.find('#J_keywordSearch').val('');
                    break;
                case 'feature':
                    searchStore.removeAttr('from_feature');
                    this.updateTitle(StringsData.groupType[0]['name']);
                    break;
                case 'price':
                    searchStore.setAttr('qparams', []);
                    label.find('li[data-tab="price"] i').hide();
                    customFiltersStore.removeAttr('price');
                    this.updateTitle(StringsData.groupType[0]['name']);
                    break;
                default:
                    customFiltersStore.removeAttr(type);
                    label.find('li[data-tab="' + type + '"] i').hide();
                    break;
            }
            if (this.tuanfilters) {
                this.tuanfilters.renderTabWrap(type, panel, false);
                this.tuanfilters.updateCustomFilterIcon();
            }
            searchStore.setAttr('qparams', StoreManage.getGroupQueryParam());
            searchStore.setAttr('pageIdx', '1');
            this.isLoading = true;
            window.scrollTo(0, 0);
            this.listWrap.empty();
            this.showLoading();
            this.hideBottomLoading();
            this.getGroupListData();
        },
        homeHandler: function () {
            searchStore.setAttr('pageIdx', 1);
            $(window).unbind('scroll', this.onWindowScroll);
            StoreManage.clearSpecified();
            TuanApp.tHome();
        },
        showCityPage: function () {
            this.forwardJump('citylist', '/webapp/tuan/citylist');
        },
        showKeywordSearch: function (e) {
            this.forwardJump('keywordsearch', '/webapp/tuan/keywordsearch');
        },
        showMore: function (e) {
            $(e.currentTarget).hide().siblings('li').show();
        },
        getAppUrl: function () {
            var searchdata = searchStore.get();
            var c2 = searchdata.ctype; //searchdata.ctype==1?2:0;
            return "ctrip://wireless/hotel_groupon_list?c1=" + searchdata.ctyId + "&c2=" + c2;
        }
    });
    return View;
});
