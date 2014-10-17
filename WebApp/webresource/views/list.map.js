/**
 * 列表地图页面
 * @url: m.ctrip.com/webapp/tuan/listmap
 */
define(['TuanApp', 'TuanBaseView', 'cCommonPageFactory', 'TuanStore', 'AMapWidget', 'POIWidget', 'cUtility', 'cWidgetFactory', 'cWidgetGeolocation', 'TuanModel', 'CommonStore', 'StoreManage', 'text!ListMapTpl'],
    function (TuanApp, TuanBaseView, CommonPageFactory, TuanStore, AMapWidget, POIWidget, Util, WidgetFactory, Geolocation, TuanModel, CommonStore, StoreManage, html) {
        var MSG = {
                cityCenter: '市中心',
                pageTitle: '团购地图'
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
            positionfilterStore = TuanStore.GroupPositionFilterStore.getInstance(); //区域筛选条件

        var PageView = CommonPageFactory.create("TuanBaseView");
        View = PageView.extend({
            pageid: '260002',
            hpageid: '261002',
            tpl: html,
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
                'click #J_category>li': 'categorySelectHandler'
            },
            returnHandler: function () {
                this.back("list");
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
            inited: false,
            //数据加载阶段
            onLoad: function () { },
            createPOI: function () {
                var self = this;

                self.poi = new POI({
                    model: tuanPOIModel,
                    onSuccess: function (data) {
                        var center;

                        self.poiData = data;
                        center = self.getCenterMarkerData();
                        self.addPOIMarkers(data.products);

                        if (self.centerMarker && self.centerMarker.getPosition().getLat() == center.lat && self.centerMarker.getPosition().getLng() == center.lon) {
                            self.centerMarker.show();
                            self.mapWidget.setPosition(self.centerMarker, center.lon, center.lat);
                        } else {
                            self.addCenterMarker(center);
                        };
                        self.mapWidget.setFitView();
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
                    mapWidget.addEvent(marker, 'click', self.markerClickHandler, self);
                    poiMarkers.push(marker);
                });
                this.poiMarkers = poiMarkers;
            },
            markerClickHandler: function (e) {
                var evt = e.originalEvent,
                    lastMarkerDom = this.currentMarkerDom,
                    target = $(evt.currentTarget || evt.srcElement).children();

                if (!this.isDetailView && !target.data('isDetailView')) {
                    lastMarkerDom && this.changeMarkerView(false, lastMarkerDom);
                    target.addClass(MARKER_SHOW_ANI).find('.J_detailMarker').show();
                    target.data('isDetailView', true);
                    this.currentMarkerDom = target;
                } else if (this.isDetailView || $(evt.target).parent('.J_detailMarker').length) {
                    this.gotoDetailPage(target.attr('data-pid'));
                };
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
                this.selectCategory(target.attr('data-type'));
            },
            selectCategory: function (typeValue) {
                var categoryWrap = this.categoryWrap,
                    type = typeValue || 0,
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
                    cityCenterPos,
                    gpsInfo = geolcationStore.getAttr('gps'),
                    pos = positionfilterStore.getAttr('pos'),
                    posType = positionfilterStore.getAttr('type'),
                    info;

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
                }
                return params;
            },
            /**
            * 创建地图
            */
            createMap: function () {
                var self = this,
                    compass,
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
                            self.selectCategory(this.category || TuanApp.getQuery('ctype'));
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
                //详细信息marker
                container.find('.J_detailMarker')[showDetail ? 'show' : 'hide']();
                //简单marker
                container.find('.J_simpleMarker')[showDetail ? 'hide' : 'show']();
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
                    offset: { x: -8, y: -34 }, //相对于基点的位置
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
                var category = this.getQuery('ctype');

                if (this.header) {
                    this.header.hide();
                };
                this.category = category;
                this.inited && this.selectCategory(this.category);
            },
            onHide: function () {
                if (!Util.isInApp() && this.header && this.header.rootBox) this.header.rootBox.show();
                this.clearPOIMarkers();
                this.centerMarker && this.centerMarker.hide();
                //隐藏页面移除当前位置定位点
                this.removeCurrentLocationTool();
            }
        });
        return View;
    });
