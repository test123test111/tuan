/**
 * 列表地图页面
 * @url: m.ctrip.com/webapp/tuan/listmap
 */
define(['TuanApp', 'c', 'TuanBaseView', 'cCommonPageFactory', 'TuanStore', 'MemCache', 'AMapWidget', 'POIWidget', 'cUtility', 'cWidgetFactory', 'TuanModel', 'CommonStore', 'StoreManage'],
    function (TuanApp, c, TuanBaseView, CommonPageFactory, TuanStore, MemCache, AMapWidget, POIWidget, Util, WidgetFactory, TuanModel, CommonStore, StoreManage) {
        var MSG = {
                cityCenter: '市中心'
            },
            MARKERS_CLS = {1: 'landmarks_hotel', 8: 'landmarks_dining', 7: 'landmarks_vacation', 6: 'landmarks_ticket', 9: 'landmarks_recreation'},
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
            // categoryfilterStore = TuanStore.GroupCategoryFilterStore.getInstance(), //团购类型
            infoTpl = _.template([
                '查询：<%=distance%>公里内，',
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
            isTapScreen: false, //是否点过"查询屏幕范围内的团购"
            render: function () {
                this.categoryWrap = this.$el.find('#J_category');
                this.mapWrap = this.$el.find('#J_map');
                this.infoWrap = this.$el.find('#J_infoWrap');
                this.btnSearch = this.$el.find('#J_btnSearch');

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
            searchHandler: function () {
                this.getDistance();
                this.isTapScreen = true;
                this.loadingLayer.show();
                this.selectCategory();
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
                var isNearBy = StoreManage.isNearBy();
                if (isNearBy) {
                    historyCityListStore.setAttr('nearby', false); //清除我附近的团 筛选条件
                }
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
                var center = this.getCenterMarkerData();
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

                if (!this.isTapScreen) {
                    this.addCenterMarker(center);
                    this.mapWidget.setFitView();
                } else {
                    this.reverseGeocode(center, function(name) {
                        center.name = name;
                        self.addCenterMarker(center);
                    });
                }
                this.getDistance();
                var infoText = infoTpl({
                    distance: this.distance,
                    count: data.count,
                    ctext: GROUP_TEXT[this.category],
                    length: data.products.length
                });
                if (!this.isTooLarge) {
                    this.infoWrap.show().text(infoText);
                }
            },
            poiMarkers: [],
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
                // TODO：以后要同步到列表页
                // searchStore.setAttr('ctype', this.category);
                // categoryfilterStore.setAttr('tuanType', this.category);
                // categoryfilterStore.setAttr('category', target.attr('data-category'));
                // categoryfilterStore.setAttr('name', target.attr('data-name'));
                // categoryfilterStore.setAttr('tuanTypeIndex', target.attr('data-index'));
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
                this.poi.query(type, this.getParams());
                this.selectedCategoryItem = selectedCategoryItem;
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
                    info;

                if (this.isTapScreen) {
                    var center = this.mapWidget.map.getCenter();
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
                    if (!pos || posType == '4') { //不限或行政区
                        cityId = searchStore.getAttr('ctyId');
                        cityInfo = StoreManage.findCityInfoById(cityId); //取市中心的经纬度
                        info = cityInfo && cityInfo.pos;
                        info.name = cityInfo.name + MSG.cityCenter;
                    } else if (posType == '-1' || posType == '5') { //大学周边或商业区
                        info = pos;
                    }
                }

                if (info && !info.lon) {
                    info.lon = info.lng;
                };
                return info || {};
            },
            needShowMarkerDetail: function (zoom) {
                return zoom >= SHOW_DETAIL_ZOOM_LEVEL;
            },
            /**
            * 获取列表查询参数
            */
            getParams: function () {
                var params = searchStore.get();
                var self = this;
                var isNearBy = StoreManage.isNearBy();

                if (!isNearBy) {
                    params.pos = self.getCenterMarkerData();
                    params.pos.posty = 3; //高德数据sourceid
                    params.qparams = StoreManage.getGroupQueryParam();
                    delete params.ctyId;
                    delete params.ctyName;
                }
                return params;
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
                            if (self.isTapScreen) {
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
                        console.log(0)
                    },
                    onGeoComplete: function (e) {
                        console.log(1)
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
                    return;
                }
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
            /**
            * 显示地图导航
            */
            showMapNav: function () {
                var data = window.mapdata || {},
                    mapWidget = this.mapWidget,
                    hotelMapInfo = {
                        latitude: data.Latitude,
                        longitude: data.Longitude,
                        title: data.hotelName
                    };

                hotelMapInfo && mapWidget.gps.show_map(hotelMapInfo);
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
                this.isTapScreen = false;
            },
            onHide: function () {
                if (!Util.isInApp() && this.header && this.header.rootBox) this.header.rootBox.show();
                this.clearPOIMarkers();
                this.centerMarker && this.centerMarker.hide();
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
             * 逆地理编码
             */
            reverseGeocode: function (center, callback) {
                var map = this.mapWidget.map;
                var lnglat =  new this.mapWidget.host.LngLat(center.lon, center.lat);
                map.plugin(['AMap.Geocoder'], function() {
                    var MGeocoder = new AMap.Geocoder({
                        radius: 1000,
                        extensions: 'all'
                    });
                    AMap.event.addListener(MGeocoder, 'complete', function(msg) {
                        callback(msg.regeocode.formattedAddress);
                    });
                    MGeocoder.getAddress(lnglat);
                })
            }
        });
        return View;
    });
