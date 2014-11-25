/**
 * 列表地图页面
 * @url: m.ctrip.com/webapp/tuan/listmap
 */
define(['TuanApp', 'c', 'TuanBaseView', 'cCommonPageFactory', 'StringsData', 'TuanStore', 'MemCache', 'AMapWidget', 'POIWidget', 'cUtility', 'cWidgetFactory', 'TuanModel', 'CommonStore', 'StoreManage'],
    function (TuanApp, c, TuanBaseView, CommonPageFactory, StringsData, TuanStore, MemCache, AMapWidget, POIWidget, Util, WidgetFactory, TuanModel, CommonStore, StoreManage) {
        var MARKERS_CLS = {1: 'landmarks_hotel', 8: 'landmarks_dining', 7: 'landmarks_vacation', 6: 'landmarks_ticket', 9: 'landmarks_recreation'},
            GROUP_TEXT = {'0': '团购商户', '1': '酒店团购', '8': '美食团购', '7': '旅游度假团购', '6': '门票团购', '9': '娱乐团购'},
            CURRENT_CATEGORY_CLS = 'current',
            GRAY_CLS = 'gray',
            SHOW_DETAIL_ZOOM_LEVEL = 15,
            MARKER_SHOW_ANI = 'map_pshow', //detail marker显示动画
            ROTATION_ANI_CLS = 'ani_rotation', //旋转动画
            View,
            AMapWidget = WidgetFactory.create('AMapWidget'),
            POI = WidgetFactory.create('POIWidget'),
            searchStore = TuanStore.GroupSearchStore.getInstance(),
            geolcationStore = TuanStore.GroupGeolocation.getInstance(),
            listStore = TuanStore.GroupListStore.getInstance(),
            tuanPOIModel = TuanModel.TuanPOIListModel.getInstance(),
            historyCityListStore = TuanStore.TuanHistoryCityListStore.getInstance(), //历史选择城市
            positionfilterStore = TuanStore.GroupPositionFilterStore.getInstance(), //区域筛选条件
            categoryfilterStore = TuanStore.GroupCategoryFilterStore.getInstance(), //团购类型
            customFiltersStore = TuanStore.GroupCustomFilters.getInstance(), //团购自定义筛选项
            getLocalCityInfoModel = TuanModel.TuanLocalCityInfo.getInstance(),
            infoTpl = _.template([
                '查询：<%=place%>，',
                '<%if(count>0){%>',
                    '共<%=count%>家商户<%if(count>50){%>，展示前<%=length%>家<%}%>',
                '<%}else{%>',
                    '无<%=ctext%>，请滑动地图后查询',
                '<%}%>',
            ].join('')),
            markerTpl = _.template([
                '<div class="J_dotMarker" data-pid="<%=obj.id%>" style="width:21px; height:31px;">',
                    '<div class="ico_map2 J_detailMarker" style="display:none; -webkit-transform:translate(-50%, 0%)">',
                        '<p><%=obj.shortName||obj.name%></p>',
                        '<p><dfn>¥</dfn><%=obj.price%></p>',
                    '</div>',
                    '<div class="<%=MARKERS_CLS[obj.ctype] || MARKERS_CLS[1]%> J_simpleMarker"></div>',
                '</div>',
                '<div class="J_popMarker" data-pid="<%=obj.id%>" style="width:21px; height:31px;display:none">',
                    '<div class="ico_map" style="background-color:#fff;-webkit-transform:translate(-41%, -20px)">',
                        '<p class="ui-title"><%=obj.shortName||obj.name%></p>',
                        '<p class="ui-price"><dfn>¥</dfn><%=obj.price%></p>',
                    '</div>',
                '</div>'
            ].join('')),
            centerMarkerTpl = _.template([
                '<img class="fx-drop" src="http://pic.c-ctrip.com/h5/tuan/hotel-map-locate2.png" style="width:14px;height:36px;">',
                '<div class="ico_map2 J_centerMarkerTip" style="-webkit-transform:translate(-50%,-45px) !important;left:50%;max-width:none;display:none;"><p><%=obj.name%></p></div>'
            ].join(''));

        var PageView = CommonPageFactory.create("TuanBaseView");
        View = PageView.extend({
            pageid: '260002',
            hpageid: '261002',
            isScreenQuery: false, //是否"查询屏幕范围内的团购"
            poiMarkers: [],
            render: function () {
                this.mapWrap = this.$el.find('#J_map');
                this.infoWrap = this.$el.find('#J_infoWrap');
                this.btnSearch = this.$el.find('#J_btnSearch');
                this.categoryWrap = this.$el.find('#J_category');

                //ios7, 显示头部电信网络信息
                if (Util.isInApp() && $.os && $.os.ios && parseInt($.os.version, 10) >= 7) {
                    this.$el.find('#J_listmapWrap').css({
                        'padding-top': '20px',
                        'background-color': '#b3b3b3'
                    });
                    this.$el.find('#J_return').css('top', '30px');
                    this.infoWrap.css('top', '30px');
                }
            },
            events: {
                'click #J_return': 'returnHandler',
                'click #J_btnSearch': 'searchHandler',
                'click #J_category>li': 'categorySelectHandler'
            },
            returnHandler: function () {
                this.back("list");
            },
            /**
             * 查询屏幕范围内的酒店
             */
            searchHandler: function () {
                var self = this;
                var isNearBy = StoreManage.isNearBy();
                if (isNearBy) {
                    //按屏幕内查询，不再是附近团购模式
                    historyCityListStore.setAttr('nearby', false); //清除我附近的团 筛选条件
                }
                this.getDistance();
                this.isScreenQuery = true;
                this.loadingLayer.show();
                var center = this.getCenterMarkerData();
                this.reverseGeocode(center, function(name) {
                    center.name = name;
                    self.center = center;
                    self.selectCategory();
                });
            },
            getDistance: function () {
                var mapWidget = this.mapWidget;
                var map = mapWidget.map;
                var host = mapWidget.host;
                var center = map.getCenter();
                var bounds = map.getBounds();
                var northeast = bounds.northeast;
                var north = new host.LngLat(center.getLng(), northeast.getLat());
                var distance = center.distance(north);
                //转成KM，并保留两位小数
                this.distance = Math.round(distance/10)/100;
            },
            onCreate: function () {
                //渲染页面
                this.render();
                //创建地图
                this.createMap();
            },
            createPOI: function () {
                this.poi = new POI({
                    model: tuanPOIModel,
                    onSuccess: $.proxy(this.onPoiSuccess, this)
                });
            },
            onPoiSuccess: function (data) {
                var self = this;
                var btnSearch = this.btnSearch;
                if (!data.count || !data.products.length) {
                    btnSearch.hide();
                } else {
                    btnSearch.show();
                }
                this.clearPOIMarkers();
                this.loadingLayer.hide();
                this.addPOIMarkers(data.products);
                MemCache.setItem('POIDATA', data);
                if (!this.center) {
                    this.center = this.getCenterMarkerData();
                }

                this.addCenterMarker(this.center);
                if (!this.isScreenQuery) {
                    this.mapWidget.setFitView();
                }
                this.getDistance();
                var place = '';
                if (this.isScreenQuery) {
                    place = this.distance + '公里内';
                } else {
                    var pos = positionfilterStore.get();
                    if (pos && pos.type) {
                        if (pos.type == 4 || pos.type == 5) {
                            place = pos.name;
                        } else if ((pos.type < 0 && pos.type != -6) || pos.type == 19) {
                            place = pos.name + '周边';
                        } else if (pos.type == -6) {
                            place = pos.pos.distance + '公里内';
                        }
                    } else {
                        place = searchStore.getAttr('ctyName');
                    }
                }
                var infoText = infoTpl({
                    place: place,
                    count: data.count,
                    ctext: GROUP_TEXT[this.category],
                    length: data.products.length
                });
                if (!this.isTooLarge) {
                    this.infoWrap.show().text(infoText);
                }
            },
            renderMarkerDOM: function (data) {
                data.MARKERS_CLS = MARKERS_CLS;
                return markerTpl(data);
            },
            removeCurrentLocationTool: function () {
                var mapWidget = this.mapWidget,
                    geo = mapWidget && mapWidget.geolocation;

                if (geo) {
                    geo._marker && geo._marker.setMap(null);
                    geo._circle && geo._circle.setMap(null);
                };
            },
            clearPOIMarkers: function () {
                var mapWidget = this.mapWidget,
                    self = this,
                    poiMarkers = this.poiMarkers;

                poiMarkers.forEach(function (marker) {
                    mapWidget.removeMarker(marker);
                    mapWidget.removeEvent(marker, 'click', self.markerClickHandler);
                });
                this.poiMarkers = [];
                return this;
            },
            addPOIMarkers: function (data) {
                var mapWidget = this.mapWidget,
                    self = this,
                    host = mapWidget.host,
                    poiMarkers = this.poiMarkers,
                    curPos,
                    marker;

                // 展示前50家
                (data || []).slice(0, 50).forEach(function (item) {
                    curPos = item.pos;
                    marker = mapWidget.addMarker({
                        position: new host.LngLat(curPos.lon, curPos.lat),
                        content: self.renderMarkerDOM(item)
                    });
                    mapWidget.addEvent(marker, 'click', (function(marker) {
                        return function(e) {
                            self.markerClickHandler(e, marker);
                        }
                    })(marker), self);
                    poiMarkers.push(marker);
                });
                this.poiMarkers = poiMarkers;
            },
            markerClickHandler: function (e, marker) {
                var evt = e.originalEvent,
                    lastMarker = this.currentMarker,
                    lastMarkerDom = this.currentMarkerDom,
                    centerMarker = this.centerMarker,
                    target = $(evt.currentTarget || evt.srcElement).children();

                if (!this.isDetailView && !target.data('isDetailView')) {
                    lastMarker && lastMarker.setzIndex(1);
                    lastMarkerDom && this.changeMarkerView(false, lastMarkerDom);
                    marker.setzIndex(9999);
                    target.find('.J_detailMarker').show();
                    target.addClass(MARKER_SHOW_ANI);
                    target.data('isDetailView', true);
                    this.currentMarker = marker;
                    this.currentMarkerDom = target;
                    centerMarker && centerMarker.tipDOM && centerMarker.tipDOM.hide();
                } else if (this.isDetailView || $(evt.target).parent('.J_detailMarker').length) {
                    this.gotoDetailPage(target.attr('data-pid'));
                }
            },
            gotoDetailPage: function (pid) {
                this.forwardJump('detail', '/webapp/tuan/detail/' + pid + '.html')
            },
            formatPOIData: function (data) {
                var host = this.mapWidget.host;

                return data.map(function (item) {
                    return {
                        position: new host.LngLat(item.lon, item.lat),
                        content: item.shortName || item.name
                    }
                });
            },
            categorySelectHandler: function (e) {
                var target = $(e.target);

                if (this.isTooLarge) return; //屏幕范围过大时，不查询POI
                this.clearPOIMarkers();
                this.category = target.attr('data-type');
                searchStore.setAttr('ctype', this.category);
                categoryfilterStore.setAttr('tuanType', this.category);
                categoryfilterStore.setAttr('category', target.attr('data-category'));
                categoryfilterStore.setAttr('name', target.attr('data-name'));
                categoryfilterStore.setAttr('tuanTypeIndex', target.attr('data-index'));
                this.selectCategory();
            },
            selectCategory: function () {
                var categoryWrap = this.categoryWrap,
                    type = this.category,
                    selectedCategoryItem = categoryWrap.find('li[data-type="' + (type) + '"]');

                if (type != 0) {
                    categoryWrap.find('li').addClass(GRAY_CLS);
                    selectedCategoryItem.removeClass(GRAY_CLS);
                } else {
                    categoryWrap.find('li').removeClass(GRAY_CLS);
                };
                //取消正在发送的请求
                this.poi && this.poi.abort();
                this.centerMarker && this.centerMarker.setMap(null);
                this.selectedCategoryItem && this.selectedCategoryItem.removeClass(CURRENT_CATEGORY_CLS);
                selectedCategoryItem.addClass(CURRENT_CATEGORY_CLS);
                this.poi.query(this.getParams());
                this.selectedCategoryItem = selectedCategoryItem;
            },
            /**
             * 因地图上只能按商户展示团购产品，所以只能和列表页的商户聚合模式保持
             * 同步，对于列表页产品聚合模式，这里统一改成商户聚合模式，即传经纬度
             * 参数(pos)
             */
            getParams: function() {
                var searchData = searchStore.get();
                var positionData = positionfilterStore.get();
                var cityId = searchData.ctyId;
                if (positionData && positionData.name) {//选择了位置区域
                    if (positionData.ctyId == cityId && searchData.sortRule != 8) {
                        var t = positionData && positionData.type;
                        if (t == 5) {
                            searchData.pos = positionData.pos;
                        }
                        if (t == 4 || t == 19) {
                            var cityInfo = StoreManage.findCityInfoById(cityId); //取市中心的经纬度
                            var gps = cityInfo && cityInfo.pos || {};
                            searchData.pos = {
                                posty: StringsData.MAP_SOURCE_ID,
                                lon: gps.lon || 0,
                                lat: gps.lat || 0,
                                name: cityInfo.name + StringsData.CITY_CENTER
                            };
                        }
                    }
                } else {//没有选择位置区域，则传市中心的经纬度
                    var cityInfo = StoreManage.findCityInfoById(cityId); //取市中心的经纬度
                    var gps = cityInfo && cityInfo.pos || {};
                    searchData.pos = {
                        posty: StringsData.MAP_SOURCE_ID,
                        lon: gps.lon || 0,
                        lat: gps.lat || 0,
                        name: cityInfo.name + StringsData.CITY_CENTER
                    };
                }
                return searchData;
            },
            getCenterMarkerData: function () {
                var isNearBy = StoreManage.isNearBy(),
                    cityInfo,
                    cityId,
                    center,
                    cityCenterPos,
                    gpsInfo = geolcationStore.getAttr('gps'),
                    pos = positionfilterStore.getAttr('pos'),
                    posType = positionfilterStore.getAttr('type'),
                    posName = positionfilterStore.getAttr('name'),
                    info;

                if (this.isScreenQuery) {
                    center = this.mapWidget.map.getCenter();
                    info = {
                        lon: center.getLng(),
                        lat: center.getLat(),
                        distance: this.distance
                    };
                    return info;
                }

                if (isNearBy) {
                    info = gpsInfo;
                    info.name = gpsInfo.address || '';
                    delete info.address;
                } else {
                    if (!pos || posType == '4' || posType == '19') { //不限或行政区、地铁线
                        cityId = searchStore.getAttr('ctyId');
                        cityInfo = StoreManage.findCityInfoById(cityId); //取市中心的经纬度
                        if (cityInfo) {
                            info = cityInfo.pos;
                            info.name = cityInfo.name + StringsData.CITY_CENTER;
                        }
                    } else if (posType < 0 || posType == '5') { //地图屏幕内查询、地铁站、机场车站、景点、大学周边或商业区
                        info = pos;
                        info.name = posName;
                    }
                }

                if (info && !info.lon) {
                    info.lon = info.lng || 0;
                };
                return info || {};
            },
            needShowMarkerDetail: function (zoom) {
                return zoom >= SHOW_DETAIL_ZOOM_LEVEL;
            },
            /**
            * 创建地图
            */
            createMap: function () {
                var self = this,
                    compass, layer,
                    curpos = listStore.getAttr('curpos'),
                    btnSearch = self.btnSearch,
                    infoWrap = self.infoWrap,
                    mapWrap = self.mapWrap;

                self.container = mapWrap;
                self.mapWidget = new AMapWidget({
                    container: mapWrap,
                    height: document.body.clientHeight + (Util.isInApp() ? 48 : 0),
                    center: curpos ? curpos.lon + '|' + curpos.lat : '116.397428|39.90923',
                    locationButton: '<div class="map_curpos_btn" style="opacity: 0.8; cursor: pointer;"></div>',
                    onReady: function () {
                        setTimeout(function() {
                            self.createPOI();
                            self.selectCategory();
                        }, 0);
                    },
                    onZoom: function (e, zoom) {
                        if (self.needShowMarkerDetail(zoom)) {
                            //隐藏当前被点击的marker
                            self.changeMarkerView(false, self.currentMarkerDom);
                            self.changeMarkerView(true);
                        } else {
                            self.changeMarkerView(false);
                        };
                        if (zoom < 10) {
                            infoWrap.show();
                            infoWrap.addClass('map_tips02');
                            infoWrap.text('当前范围过大，请放大地图查询');
                            self.isTooLarge = true;
                            btnSearch.hide();
                        } else {
                            if (self.isTooLarge) {
                                infoWrap.hide();
                            }
                            self.isTooLarge = false;
                            if (self.isScreenQuery) {
                                infoWrap.hide();
                            }
                            infoWrap.removeClass('map_tips02');
                            btnSearch.show();
                        }
                    },
                    onMovestart: function () {
                        /*
                         * 查询无结果，出提示，且“查询屏幕范围内的团购“隐藏
                         * 再次移动地图后，重新显示”查询屏幕范围内的团购“控件
                         */
                        if (!self.poiMarkers.length && !self.isTooLarge) {
                            btnSearch.show();
                        }
                    },
                    onClick: function () {
                        var centerMarker = self.centerMarker;

                        centerMarker && centerMarker.tipDOM && centerMarker.tipDOM.hide();
                        !self.isDetailView && self.currentMarkerDom && self.changeMarkerView(false, self.currentMarkerDom);
                    },
                    onGeoBegin: function (wrap) {
                        wrap = $(wrap).children();
                        wrap.css('background-color', '#1491c5');
                        compass = wrap;
                        layer = new c.ui.LoadingLayer(function () { this.hide(); }, '定位中...');
                    },
                    onGeoComplete: function (e) {
                        layer && layer.hide();
                        compass && compass.css('background-color', 'rgba(0,0,0,.8)');
                        //当前位置点自适应
                        this.setFitView();
                    },
                    onGeoError: function () {
                        self.showToast('无法获取您的位置，请稍后重试');
                        compass && compass.css('background-color', 'rgba(0,0,0,.8)');
                    }
                });
            },
            /**
            * @param showDetail
            * @param target
            */
            changeMarkerView: function (showDetail, target) {
                var isDetailView = this.isDetailView,
                    container = this.container;

                if (target) {
                    container = target;
                    isDetailView = target.data('isDetailView');
                    target.data('isDetailView', !!showDetail);
                    target[showDetail ? 'addClass' : 'removeClass'](MARKER_SHOW_ANI);
                } else {
                    this.isDetailView = !!showDetail;
                };
                if (isDetailView === showDetail) return;
                container.find('.J_detailMarker')[showDetail ? 'show' : 'hide']();
                container.find('.J_simpleMarker')[showDetail ? 'hide' : 'show']();
                //点状marker
                container.find('.J_dotMarker')[showDetail ? 'hide' : 'show']();
                //气泡marker
                container.find('.J_popMarker')[showDetail ? 'show' : 'hide']();
            },
            addCenterMarker: function (data) {
                var self = this,
                    mapWidget = this.mapWidget,
                    lng = Number(data.lon),
                    lat = Number(data.lat),
                    marker;
                //如有一个坐标为空，则不显示
                if (!lng || !lat) {
                    //按城市查询，未获取到城市中心经纬度：显示中国地图
                    mapWidget.map.setCenter(new mapWidget.host.LngLat(103.38861111111, 35.563611111111));
                    mapWidget.map.setZoom(3);
                    return;
                }
                //防止出现多个中心点
                this.centerMarker && this.centerMarker.setMap(null);
                marker = mapWidget.addMarker({
                    position: new mapWidget.host.LngLat(lng, lat), //基点位置
                    offset: { x: -7, y: -36 }, //相对于基点的位置
                    content: centerMarkerTpl({ name: data.name || data.address })
                });
                mapWidget.addEvent(marker, 'click', this.centerMarkerHandler, this);
                this.centerMarker = marker;
            },
            centerMarkerHandler: function (e) {
                var tip = $(e.originalEvent.currentTarget).find('.J_centerMarkerTip');
                var currMarker = this.currentMarker;
                var currMarkerDom = this.currentMarkerDom;

                //隐藏当前显示的Marker
                currMarker && currMarker.setzIndex(1);
                currMarkerDom && this.changeMarkerView(false, currMarkerDom);

                tip.show();
                e.target.tipDOM = tip;
            },
            onShow: function () {
                this.refer = this.getLastViewName();
                this.header && this.header.hide();
                this.category = searchStore.getAttr('ctype');
                this.loadingLayer = new c.ui.LoadingLayer(function () {
                    this.hide();
                    //取消正在发送的请求
                    this.poi && this.poi.abort();
                }, '查询中...');
                this.isScreenQuery = false;
            },
            onHide: function () {
                if (!Util.isInApp() && this.header && this.header.rootBox) this.header.rootBox.show();
                this.clearPOIMarkers();
                // this.centerMarker && this.centerMarker.hide();
                //隐藏页面移除当前位置定位点
                this.removeCurrentLocationTool();
            },
            /**
             * 是否从详情页返回
             */
            isDetailBack: function () {
                var refer = this.refer;
                return refer && refer.match(/detail/i);
            },
            /**
             * 逆地理编码(经纬度反查地址)
             * @param {Object} center 经纬度
             */
            reverseGeocode: function (center, callback) {
                var self = this;
                var map = this.mapWidget.map;
                var lnglat =  new this.mapWidget.host.LngLat(center.lon, center.lat);
                map.plugin(['AMap.Geocoder'], function() {
                    var MGeocoder = new AMap.Geocoder({
                        radius: 1000,
                        extensions: 'all'
                    });
                    AMap.event.addListener(MGeocoder, 'complete', function(msg) {
                        self.getCityInfo(center, msg.regeocode, callback);
                    });
                    MGeocoder.getAddress(lnglat);
                })
            },
            /**
            * 反查城市
            * @param {JSON} lnglat  经纬度
            * @param {JSON} regeocode 省市县
            */
            getCityInfo: function (lnglat, regeocode, callback) {
                var self = this;
                getLocalCityInfoModel.setParam({
                    lng: lnglat.lon,
                    lat: lnglat.lat,
                    district: encodeURIComponent(regeocode.addressComponent.district),
                    cityname: encodeURIComponent(regeocode.addressComponent.city),
                    province: encodeURIComponent(regeocode.addressComponent.province),
                    isOverseas: !regeocode.formattedAddress //高德对海外的经纬度，返回的formattedAddress为空，故把formattedAddress为空认为是海外
                });
                getLocalCityInfoModel.excute(function (data) {
                    var cityData;
                    if (data && data.CityID && data.CityID > 0) { //有效的城市ID
                        StoreManage.setCurrentCity(data)
                        searchStore.setAttr('ctyId', data.CityID);
                        searchStore.setAttr('ctyName', data.CityName);
                        var pos = {
                            lat: lnglat.lat,
                            lon: lnglat.lon,
                            name: regeocode.formattedAddress,
                            distance: self.distance
                        };
                        searchStore.setAttr('pos', pos);
                        positionfilterStore.set({
                            type: -6, //用-6标识是地图屏幕内查询
                            name: regeocode.formattedAddress,
                            pos: pos
                        });
                        var qparams = searchStore.getAttr('qparams') || [];
                        //清除qparams里面已有的商业区、行政区、地铁线、距离等参数
                        for (var i = 0, l = qparams.length; i < l; i++) {
                            var t = qparams[i].type;
                            if (t == 5 || t == 4 || t == 19 || t == 9) {
                                qparams.splice(i, 1);
                                break;
                            }
                        }
                        customFiltersStore.removeAttr('distance');
                        searchStore.setAttr('qparams', qparams);
                    }
                    typeof callback === 'function' && callback.call(self, regeocode.formattedAddress);
                }, function (err) {
                    //TODO
                }, false, this);
            }
        });
        return View;
    });
