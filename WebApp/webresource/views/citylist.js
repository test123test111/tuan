/**
 * @description 团购城市列表页
 */
define(['TuanApp', 'libs', 'c', 'TuanBaseView', 'cCommonPageFactory', 'cGeoService', 'TuanModel', 'TuanStore', 'StoreManage', 'text!CityListTpl', 'HttpErrorHelper', 'cUtility'],
function (TuanApp, libs, c, TuanBaseView, CommonPageFactory, GeoService, TuanModel, TuanStore, StoreManage, html, HttpErrorHelper, Util) {
    var cui = c.ui, GeoLocation = GeoService.GeoLocation;
    var tuanSearchStore = TuanStore.GroupSearchStore.getInstance(),
        geolocationStore = TuanStore.GroupGeolocation.getInstance(), //经纬度信息
        positionStore = TuanStore.TuanPositionStore.getInstance(), //定位信息
        historyCityListStore = TuanStore.TuanHistoryCityListStore.getInstance(), //历史选择城市
        cityListStore = TuanStore.TuanCityListStore.getInstance(), //城市信息
        getLocalCityInfoModel = TuanModel.TuanLocalCityInfo.getInstance(),
        tuanCityList = TuanModel.TuanCityListModel.getInstance(),
        historyKeySearchtore = TuanStore.TuanHistoryKeySearchStore.getInstance();

    var PageView = CommonPageFactory.create("TuanBaseView");
    var isInApp = Util.isInApp();
    var ICON = {up: 'arr_up', down: 'arr_down'};
    var filterCls = 'J_filterResultCity'; //给筛结果增加class标记
    var View = PageView.extend({
        pageid: '214002',
        hpageid: '215002',
        render: function () {
            this.els = {
                eltuancitylistbox: this.$el.find('#citylist_box'),
                eltuancitykeyword: this.$el.find('#J_searchCityInput'),
                searchBox: this.$el.find('.J_searchWrap')
            };
            this.cityListTplfun = _.template(html);
        },
        events: {
            'click .history_close': 'cancelInput',
            'click .J_cityType': 'cityGroupTitleClick',
            'focus #J_searchCityInput': 'clickInput',
            'input #J_searchCityInput': 'searchKeyWordInput',
            'click .J_cityItem': 'cityItemOnClick',

            //@since 20140609
            'click .J_cityTagTitle': 'cityTagTitleClick',
            'submit #J_citySearchForm': 'redirectByResult'
        },
        backAction: function () {
            this.back();
        },
        cityItemOnClick: function (e) {
            //清除所有查询相关本地存储
            var searchData = tuanSearchStore.get();

            StoreManage.clearAll();

            var qparams = [],
                self = this,
                cur = $(e.currentTarget),
                loc,
                id = cur.attr('data-id'),
                name = cur.attr('data-name');

            if (id.toLowerCase() == "nearby") {
                loc = StoreManage.getCurrentCity();
                if (loc) {
                    historyCityListStore.setAttr('nearby', true);
                    tuanSearchStore.setAttr('ctyId', loc.CityId);
                    qparams = StoreManage.getGroupQueryParam();
                    tuanSearchStore.setAttr('qparams', qparams);
                    StoreManage.addHistoryCity(loc.CityId, loc.CityName);
                } else {
                    historyCityListStore.setAttr('nearby', false);
                    tuanSearchStore.setAttr('ctyId', searchData.ctyId); //定位失败取原先选择的城市Id
                    tuanSearchStore.setAttr('ctyName', searchData.ctyName);
                }
                self.forwardJump('list', '/webapp/tuan/list');
                return;

            } else if (id.toLowerCase() == "positioning") {
                this.getGeolocation();
                this.upNearbyBtn(2);
                return;
            } else {
                historyCityListStore.setAttr('nearby', false);
                geolocationStore.setAttr('isParentCity', false);
                tuanSearchStore.setAttr('ctyId', id);
                tuanSearchStore.setAttr('ctyName', name);
                //历史选择 处理start----------
                StoreManage.addHistoryCity(id, name);
                //历史选择 处理end-------------
            }

            historyKeySearchtore.remove();
            //返回列表页
            setTimeout(function () {
                self.forwardJump('home', '/webapp/tuan/home');
            }, 100);
        },
        cityGroupTitleClick: function (e) {
            var cur = $(e.currentTarget);
            cur.parent().find('.city_list').hide();
            cur.next('ul').toggle(200);
        },
        cityTagTitleClick: function (e) {
            var $this = $(e.currentTarget),
                $parent = $this.parent(),
                isUp = $this.hasClass(ICON.up),
                x;
            this.els.$allCityBox.find('.J_cityTagTitle').removeClass(ICON.up).addClass(ICON.down);
            if (!isUp) {
                $this.toggleClass(ICON.down + ' ' +ICON.up);
            }
            $parent.siblings().find('.city_list>li').hide();
            $parent.find('.city_list>li').show();

            x = isInApp ? $parent.offset().top : $parent.offset().top - 45;
            window.scrollTo(0, x);
        },
        redirectByResult: function(e) {
            e.preventDefault();
            //如果筛选结果只有一个的话选中此城市并跳转到首页
            var $res = this.$el.find('.' + filterCls);
            if ($res && $res.length === 1) {
                $res.trigger('click');
            } else {
                this.els.eltuancitykeyword.blur();
            }
        },
        buildEvent: function () {
            cui.InputClear(this.els.eltuancitykeyword);
            this.onBodyChange = $.proxy(function () {
                this.els.eltuancitykeyword[0].blur();
                this.$el.find(".history_close").hide();
            }, this);
        },
        updatePage: function (callback) {
            tuanCityList.excute(function (data) {
                data = cityListStore.get();
                this.createPage(data);
                callback.call(this);
            }, function (e) {
                var msg = HttpErrorHelper.getMessage(e);
                this.showToast(msg); //this.showToast('抱歉! 加载失败,请稍后再试!');
                callback.call(this);
            }, false, this);
        },
        getGeolocation: function () {
            var self = this;

            //定位成功回调
            changeSuccessStatus = function (data) {
                var currentcity = self.$el.find(".current>.currentcity");

                self.upNearbyBtn(1);
                if (currentcity.length > 0) {
                    var domhtml = currentcity.html();
                    var gpsInfo = geolocationStore.get();
                    var groups = gpsInfo.gps.Groups; //该城市团购产品数量
                    if (!groups) {
                        //从团购城市列表获取城市信息，团购数量
                        var cityinfo = StoreManage.findCityInfoById(data.cityId);
                        if (cityinfo) {
                            groups = cityinfo.cGroups || 0;
                        }
                    }
                    domhtml = domhtml.replace("<!--cityname-->", data.cityName);
                    domhtml = domhtml.replace("<!--groups-->", groups);
                    currentcity.html(domhtml);
                    currentcity.attr("data-name", data.cityName);
                    currentcity.attr("data-id", data.cityId);
                    currentcity.show();
                }
            };


            //定位信息还存在，未过期， cityid, cityname缓存有值, 不需要重新发起定位
            var cachedPositionStore = positionStore.get();
            if (cachedPositionStore && cachedPositionStore.cityId && cachedPositionStore.cityName) {
                var cityData = {
                    "cityId": cachedPositionStore.cityId,
                    "cityName": cachedPositionStore.cityName,
                    "hasGroupProduct": cachedPositionStore.hasGroupProduct
                };
                changeSuccessStatus(cityData);
                return;
            }

            GeoLocation.Subscribe('tuan/citylist', {
                onComplete: function (address) {
                    //把定位信息存储到store中
                    positionStore.set(address);
                    address.city = address.city.replace('市市', '市');
                    if (address.city.length > 2) address.city = address.city.replace('市', '');
                    geolocationStore.setAttr('gps', address);
                    var geoInfo = {
                        lng: address.lng,
                        lat: address.lat,
                        district: address.district,
                        city: address.city,
                        province: address.province,
                        isOverseas: address.country != '中国'
                    };
                    self.getCityInfo(geoInfo, changeSuccessStatus);
                },
                onError: this.geoError,
                onPosComplete: function (lng, lat) {
                },
                onPosError: this.geoError
            }, this, true);
        },
        geoError: function () {
            this.upNearbyBtn(3);
        },
        getCityCount: function (data) {
            return StoreManage.getCityCount(data);
        },
        upNearbyBtn: function (flag) {
            var currentnearby = this.$el.find(".current>li").first();
            if (currentnearby) {
                switch (flag) {
                    case 1:
                        currentnearby.attr("data-id", "nearby");
                        currentnearby.attr("data-name", "附近"); //"团购"两字已经有了
                        currentnearby.text("附近团购");
                        break;
                    case 2:
                        currentnearby.attr("data-id", "positioning");
                        currentnearby.attr("data-name", "正在获取您的位置…");
                        currentnearby.text("正在获取您的位置…");
                        break;
                    case 3:
                        currentnearby.attr("data-id", "positioning");
                        currentnearby.attr("data-name", "定位失败，点击重试");
                        currentnearby.text("定位失败，点击重试");
                        break;
                }
            }
        },
        createPage: function (data) {
            var searchData = tuanSearchStore.get();
            var historyCityData = historyCityListStore.get();
            var ctyId = searchData.ctyId;
            var ctyName = searchData.ctyName;
            var currentCityName, currentCityId, currentGroups;
            var nearby = false; //城市列表不会有选中"我的附近"

            this.citycount = this.getCityCount(data);
            var hcitylist = StoreManage.findHistoryCity(data.cities);

            var html = this.cityListTplfun({
                data: data.cities,
                history: hcitylist,
                cityid: ctyId,
                currentcityid: currentCityId,
                currentcityname: currentCityName,
                currentgroups: currentGroups,
                nearby: nearby
            });

            this.els.eltuancitylistbox.html($.trim(html));
            this.els.$allCityBox = this.$el.find('#J_allCitiesBox');
            this.els.$cityTags = this.$el.find('.J_cityTagTitle');

            if (data.cities.length <= 0) {
                this.els.eltuancitylistbox.find('.city_noresult').show();
            } else {
                this.els.eltuancitylistbox.find('.city_noresult').hide();
            }

            this.getGeolocation();
            //定位成功，默认选中 我附近的团购
            if (nearby == true && typeof currentCityId != "undefined" && currentCityId != null && currentCityId != "") {
                nearby = true;
                historyCityListStore.setAttr("nearby", nearby);
                tuanSearchStore.setAttr('ctyId', currentCityId);
                ctyId = 0;
            } else {
                nearby = false;
                historyCityListStore.setAttr("nearby", nearby);
                tuanSearchStore.setAttr('ctyId', ctyId);
            }

            this.$el.find('.s_city_num>span').text(this.citycount);
            this.$el.find('.s_city_loading').hide();
            this.$el.find('.s_city_num').show();
        },
        //首次记载view，创建view
        onCreate: function () {
            this.render();
            this.buildEvent();
        },
        //加载数据时
        onLoad: function (referUrl) {
            this.setHeader();
            this.updatePage(function () {
                this.hideLoading();
                this.$el.bind('focus', this.onBodyChange);
                this.$el.bind('touchstart', this.onBodyChange);
            });
        },
        setHeader: function() {
            var self = this;
            this.header.set({
                title: '选择城市',
                back: true,
                view: this,
                tel: null,
                events: {
                    returnHandler: function () {
                        self.backAction();
                    }
                }
            });
            this.header.show();
            !isInApp && this.header.rootBox.show();
        },
        cancelInput: function (e) {
            this.hasSearchShow = false;
            this.els.eltuancitykeyword.val('');
            this.$el.find(".history_close").hide();
            this.$el.find('.' + filterCls).removeClass(filterCls);
            //点击取消时显示索引标签ABCD等
            this.els.$cityTags
                .addClass(ICON.down).removeClass(ICON.up)
                .show();
            this.showHotCitys();
            this.updateZIndex(false);
            this.mask && this.mask.hide();
            this.setHeader();
            if (isInApp && TuanApp.isOverOS7()) {
                this.els.searchBox.css('border-top', '0');
            }
        },
        clickInput: function () {
            this.hasSearchShow = true;
            this.$el.find(".history_close").show();
            this.els.$cityTags
                .addClass(ICON.up).removeClass(ICON.down);
            //隐藏头部
            if (this.header) {
                this.header.hide();
                this.header.rootBox && this.header.rootBox.hide();
                if (isInApp && TuanApp.isOverOS7()) {
                    this.els.searchBox.css('border-top', '20px solid #b3b3b3');
                }
            }
            this.updateZIndex(true);
            !this.mask && (this.mask = new c.ui.Mask());
            this.mask.show();
        },
        /**
         * @param flag
         * flag = true =====> show
         */
        updateZIndex: function(flag) {
            if (flag) {
                this.els.searchBox.css({zIndex: 4000});
                this.els.$allCityBox.css({position: 'relative', zIndex: 4000});
                this.els.eltuancitykeyword.focus();
            } else {
                this.els.searchBox.css({zIndex: 'auto'});
                this.els.$allCityBox.css({position: 'static', zIndex: 'auto'});
            }
        },
        showHotCitys: function () {
            this.els.eltuancitylistbox.find(".city_list:not(.allcity)").show();
            this.els.eltuancitylistbox.find(".J_cityType").show();
            this.$el.find('.s_city_num>span').text(this.citycount);
            this.els.eltuancitylistbox.find('.city_list.allcity>li[data-filter]').hide();
        },
        hideHotCitys: function () {
            this.els.eltuancitylistbox.find(".city_list.allcity").show();
            this.els.eltuancitylistbox.find(".J_cityType").hide();
            this.els.eltuancitylistbox.find(".city_list:not(.allcity)").hide();
        },
        searchKeyWordInput: function (e) {
            var cur = $(e.currentTarget), keyword = cur.val();
            if (keyword) {
                keyword = keyword.replace(/\.|\{|\}|\[|\]|\*|\^|\'/img, '');
                keyword = keyword.toLowerCase().trim();
                this.hideHotCitys();
                this.els.eltuancitylistbox.find(".city_list.allcity>li").hide();
                //EditBy zhanghd 2014-2-19 关键字搜索准确度优化，data-filter属性中各关键字以"_"分隔，执行find时需在关键字前加上"_"；

                //Eidt by li.xx @since 20140609 增加所有城市之后调整 选择器
                //筛选时隐藏索引标签ABCD等
                this.els.$cityTags.hide();

                this.els.$allCityBox.find('.J_cityItem').removeClass(filterCls);
                var domlist = this.els.$allCityBox.find('.city_list>li[data-filter*=' + keyword + ']');

                domlist.addClass(filterCls).show();

                if (domlist.length <= 0) {
                    this.els.eltuancitylistbox.find('.city_noresult').show();
                    this.$el.find('.s_city_num>span').text(0);
                } else {
                    this.els.eltuancitylistbox.find('.city_noresult').hide();
                    this.$el.find('.s_city_num>span').text(domlist.length);
                }
            } else {
                this.showHotCitys();
                this.els.eltuancitylistbox.find('.city_noresult').hide();
            }
        },
        onShow: function () {
        },
        onHide: function () {
            //查询视图是否未hide.
            if (this.hasSearchShow == true) {
                this.cancelInput();
            }
            GeoLocation.UnSubscribe('tuan/citylist');
            this.$el.unbind('focus', this.onBodyChange);
            this.$el.unbind('touchstart', this.onBodyChange);
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
                    cityData = { "cityId": data.CityID, "cityName": data.CityName, "hasGroupProduct": data.HasGroupProduct };
                    positionStore.setAttr("cityId", data.CityID);
                    positionStore.setAttr("cityName", data.CityName);
                    positionStore.setAttr("hasGroupProduct", data.HasGroupProduct);
                    StoreManage.setCurrentCity(data)
                }
                typeof callback === 'function' && callback.call(self, cityData);
            }, function (err) {
                self.locating = false;
                positionStore.setAttr("cityId", null);
                positionStore.setAttr("cityName", null);
                self.upNearbyBtn(3);
            }, false, this);
        }
    });
    return View;
});

/**
 * @changelog:
 *  v2.6: 1. dom更新，替换js中用到的样式class为JS专用。 2. 交互优化. 注意： CSSer帮忙隐藏了arr_down下面的城市列表
 */
