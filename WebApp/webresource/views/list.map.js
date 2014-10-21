/**
 * 列表地图页面
 * @url: m.ctrip.com/webapp/tuan/listmap
 */
define(['TuanApp', 'c', 'TuanBaseView', 'cCommonPageFactory', 'TuanStore', 'AMapWidget', 'POIWidget', 'cUtility', 'cWidgetFactory', 'cWidgetGeolocation', 'TuanModel', 'CommonStore', 'StoreManage', 'text!ListMapTpl'],
    function (TuanApp, c, TuanBaseView, CommonPageFactory, TuanStore, AMapWidget, POIWidget, Util, WidgetFactory, Geolocation, TuanModel, CommonStore, StoreManage, html) {
        var MSG = {
                cityCenter: '市中心'
            },
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
            GROUP_TEXT = {'0': '团购商户', '1': '酒店团购', '8': '美食团购', '7': '旅游度假团购', '6': '门票团购', '9': '娱乐团购'},
            infoTpl = _.template([
                '查询：<%=distance%>公里内，',
                '<%if(count>0){%>',
                    '共<%=count%>家商户<%if(count>50){%>，展示前<%=length%>家<%}%>',
                '<%}else{%>',
                    '无<%=ctext%>，请滑动地图后查询',
                '<%}%>',
            ].join(''));

        var PageView = CommonPageFactory.create("TuanBaseView");
        View = PageView.extend({
            pageid: '260002',
            hpageid: '261002',
            tpl: html,
            inited: false,
            render: function () {
                this.$el.html(this.tpl);

                //ios7, 显示头部电信网络信息
                if (Util.isInApp() && $.os && $.os.ios && parseInt($.os.version, 10) >= 7) {
                    this.$el.find('#J_listmapWrap').css({
                        'padding-top': '20px',
                        'background-color': '#b3b3b3'
                    });
                    this.$el.find('#J_return').css('top', '30px');
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
                this.tapScreen = true;
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
                //poi分类容器
                this.categoryWrap = this.$el.find('#J_category');
                //列表页没有导航， 在native页面显示导航按钮
                //Util.isInApp() && $('#J_navigator').css('display', '');
                this.geolocation = WidgetFactory.create('Geolocation');
                //this.injectHeaderView();
                //创建地图
                this.createMap();

                this.markerTpl = this.$el.find('#J_markerTpl').html();
            },
            //数据加载阶段
            onLoad: function () { },
            createPOI: function () {
                var self = this,
                    infoWrap = self.$el.find('#J_infoWrap');

                self.poi = new POI({
                    model: tuanPOIModel,
                    onSuccess: function (data) {
                        var center = self.getCenterMarkerData();
                        self.clearPOIMarkers();
                        self.loadingLayer.hide();
                        self.addPOIMarkers(data.products);

                        /*
                        if (self.centerMarker && self.centerMarker.getPosition().getLat() == center.lat && self.centerMarker.getPosition().getLng() == center.lon) {
                            self.centerMarker.show();
                            self.mapWidget.setPosition(self.centerMarker, center.lon, center.lat);
                        } else {
                        */
                        /*};*/
                        self.centerMarker && self.centerMarker.setMap(null);
                        if (!self.tapScreen) {
                            self.mapWidget.setFitView();
                            self.addCenterMarker(center);
                        } else {
                            self.reverseGeocode(center, function(name) {
                                center.name = name;
                                self.addCenterMarker(center);
                            });
                        }
                        self.getDistance();
                        infoWrap.text(infoTpl({
                            distance: self.distance,
                            count: data.count || 0,//TODO: 等待接口提供count
                            ctext: GROUP_TEXT[self.category],
                            length: data.products.length
                        }));
                        self.inited = true; //地图初始化完成
                    }
                });
            },
            poiMarkers: [],
            renderMarkerDOM: function (data) {
                return _.template(this.markerTpl)(data);
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

                data.forEach(function (item) {
                    curPos = item.pos;
                    marker = mapWidget.addMarker({
                        position: new host.LngLat(curPos.lon, curPos.lat),
                        content: self.renderMarkerDOM(item)
                    });
                    //mapWidget.addEvent(marker, 'click', self.markerClickHandler, self);
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
                    target.addClass(MARKER_SHOW_ANI).find('.J_detailMarker').show();
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

                this.clearPOIMarkers();
                this.category = target.attr('data-type');
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

                if (this.tapScreen) {
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
                    compass,
                    btnSearch = self.$el.find('#J_btnSearch'),
                    infoWrap = self.$el.find('#J_infoWrap'),
                    curpos = listStore.getAttr('curpos'),
                    mapWrap = self.$el.find('#J_map');

                self.container = mapWrap;
                self.mapWidget = new AMapWidget({
                    container: mapWrap,
                    height: document.body.clientHeight + (Util.isInApp() ? 48 : 0),
                    center: curpos ? curpos.lon + '|' + curpos.lat : '116.397428|39.90923',
                    locationButton: '<div class="map_curpos_btn" style="opacity: 0.8"></div>',
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
                            infoWrap.addClass('map_tips02');
                            infoWrap.text('当前范围过大，请放大地图查询');
                            btnSearch.hide();
                        } else {
                            infoWrap.removeClass('map_tips02');
                            // TODO
                            //infoWrap.text('xx');
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
                    },
                    onGeoComplete: function (e) {
                        compass && compass.css('background-color', 'rgba(0,0,0,.8)');
                        //当前位置点自适应
                        this.setFitView();
                    },
                    onGeoError: function () {
                        compass && compass.css('background-color', 'rgba(0,0,0,.8)');
                    }
                });
            },
            /**
            *
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
                    content: _.template(self.$el.find('#J_centerMarkerTpl').html())({ name: data.name || data.address })
                });
                mapWidget.addEvent(marker, 'click', this.centerMarkerHandler, this);
                this.centerMarker = marker;
            },
            centerMarkerHandler: function (e) {
                var tip = $(e.originalEvent.currentTarget).find('.J_centerMarkerTip');

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
                var refer = this.getLastViewName();
                var category = Lizard.P('ctype') || searchStore.getAttr('ctype');

                if (this.header) {
                    this.header.hide();
                };
                this.category = category;
                this.tapScreen = false;
                this.inited && this.selectCategory();
                this.loadingLayer = new c.ui.LoadingLayer(function () { this.hide(); }, '查询中...');
            },
            onHide: function () {
                if (!Util.isInApp() && this.header && this.header.rootBox) this.header.rootBox.show();
                this.clearPOIMarkers();
                this.centerMarker && this.centerMarker.hide();
                //隐藏页面移除当前位置定位点
                this.removeCurrentLocationTool();
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
