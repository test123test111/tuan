define(['TuanApp', 'libs', 'c', 'TuanBaseView', 'cCommonPageFactory', 'cWidgetFactory', 'cGeoService', 'TuanModel', 'cDataSource', 'TuanStore', 'StoreManage', 'text!CityListTpl', 'cWidgetGeolocation', 'HttpErrorHelper'],
function (TuanApp, libs, c, TuanBaseView, CommonPageFactory, WidgetFactory,cGeoService, TuanModel, cDataSource, TuanStore, StoreManage, html, cGeolocation, HttpErrorHelper) {
    var cui = c.ui, GeoLocation = cGeoService.GeoLocation;
    var tuanSearchStore = TuanStore.GroupSearchStore.getInstance(),
        geolocationStore = TuanStore.GroupGeolocation.getInstance(), //经纬度信息
        positionStore = TuanStore.TuanPositionStore.getInstance(), //定位信息
        historyCityListStore = TuanStore.TuanHistoryCityListStore.getInstance(), //历史选择城市
        cityListStore = TuanStore.TuanCityListStore.getInstance(), //城市信息
        getLocalCityInfoModel = TuanModel.TuanLocalCityInfo.getInstance(),
        historyKeySearchtore = TuanStore.TuanHistoryKeySearchStore.getInstance();
    var PageView = CommonPageFactory.create("TuanBaseView");
    var View = PageView.extend({
        pageid: '214002',
        hpageid: '215002',
        tuanCityList: TuanModel.TuanCityListModel.getInstance(),
        dateSource: new cDataSource(),
        selectItem: null,
        render: function () {
            this.els = {
                eltuancitylistbox: this.$el.find('#citylist_box'),
                eltuancitykeyword: this.$el.find('.place_search_box>.place_search')
            };
            this.cityListTplfun = _.template(html);
        },
        events: {
            'click .history_close': 'cancelInput',
            'click .city_type': 'cityGroupTitleClick',
            'click .place_search': 'clickInput',
            'input .place_search': 'searchKeyWordInput',
            'click .city-item': 'cityItemOnClick',

            //@since 20140609
            'click .J_cityTagTitle': 'cityTagTitleClick'
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
                $parent = $this.parent();
            $parent.find('.city_list>li').toggle();
            $this.find('.J_cityTagIcon').toggleClass('view_fold view_unfold');
            $this.next().find('.city_list').show();
            $parent[0].scrollIntoView();
            //scrollIntoView 执行需要时间，延时再进行移动
            setTimeout(function () {
                window.scrollBy(0, -45);
            }, 50);
        },

        buildEvent: function () {
            cui.InputClear(this.els.eltuancitykeyword);
            this.onBodyChange = $.proxy(function () {
                this.els.eltuancitykeyword[0].blur();
                this.$el.find(".history_close").hide();
            }, this);
        },
        updatePage: function (callback) {
            this.tuanCityList.excute(function (data) {
                data = cityListStore.get();
                this.createPage(data);
                callback.call(this);
            }, function (e) {
                var msg = HttpErrorHelper.getMessage(e);
                this.showToast(msg); //this.showToast('抱歉! 加载失败,请稍后再试!');
                callback.call(this);
            }, false, this);

        },
        createGPS: function () {
            this.gps = WidgetFactory.create('Geolocation');
        },
        getLocalCityInfo: function (lng, lat, cityName) {//TODO： 抽取到独立模块，与首页公共调用
            var cityId = StoreManage.getCityIdByName(cityName),
                cityData,
                self = this,
                //定位成功回调
                changeSuccessStatus = function (data) {
                    var currentcity = self.$el.find(".current>.currentcity");

                    self.upNearbyBtn(1);
                    if (currentcity.length > 0) {
                        var domhtml = currentcity.html();
                        var gpsInfo = geolocationStore.get();
                        domhtml = domhtml.replace("<!--cityname-->", gpsInfo.gps.CityName);
                        domhtml = domhtml.replace("<!--groups-->", gpsInfo.gps.Groups);
                        currentcity.html(domhtml);
                        currentcity.attr("data-name", gpsInfo.gps.CityName);
                        currentcity.attr("data-id", data.CityID);
                        currentcity.show();
                    }
                };

            if (cityId) {
                cityData = {
                    CityName: cityName,
                    CityID: cityId
                };
                if (StoreManage.setCurrentCity(cityData)) {
                    changeSuccessStatus(cityData);
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
                self.checkParentCity(data);
                //更新当前城市信息
                if (typeof data != undefined && StoreManage.setCurrentCity(data)) {
                    changeSuccessStatus(data);
                } else {
                    this.upNearbyBtn(3);
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
                    data.CityID = defaultCity.id;
                };
            };
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
                        currentnearby.attr("data-name", "我附近的"); //"团购"两字已经有了
                        currentnearby.text("我附近的团购");
                        break;
                    case 2:
                        currentnearby.attr("data-id", "positioning");
                        currentnearby.attr("data-name", "定位中");
                        currentnearby.text("定位中");
                        break;
                    case 3:
                        currentnearby.attr("data-id", "positioning");
                        currentnearby.attr("data-name", "定位失败，请点这里重试");
                        currentnearby.text("定位失败，请点这里重试");
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
            this.turning();
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
            this.updatePage(function () {
                this.hideLoading();
                this.$el.bind('focus', this.onBodyChange);
                this.$el.bind('touchstart', this.onBodyChange);
            });
        },
        cancelInput: function (e) {
            this.hasSearchShow = false;
            this.els.eltuancitykeyword.val('');
            this.$el.find(".history_close").hide();
            //点击取消时显示索引标签ABCD等
            this.els.eltuancitylistbox.find('.J_cityTagTitle').show();
            this.showHotCitys();
        },
        clickInput: function () {
            this.hasSearchShow = true;
            this.$el.find(".history_close").show();
        },
        showHotCitys: function () {
            this.els.eltuancitylistbox.find(".city_list:not(.allcity)").show();
            this.els.eltuancitylistbox.find(".city_type").show();
            this.$el.find('.s_city_num>span').text(this.citycount);
            this.els.eltuancitylistbox.find('.city_list.allcity>li[data-filter]').hide();
        },
        hideHotCitys: function () {
            this.els.eltuancitylistbox.find(".city_list.allcity").show();
            this.els.eltuancitylistbox.find(".city_type").hide();
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
                this.els.eltuancitylistbox.find('.J_cityTagTitle').hide();
                var domlist = this.els.eltuancitylistbox.find('.box-city-all .city_list>li[data-filter*=' + keyword + ']');
                domlist.show();

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
