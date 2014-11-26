/*jshint -W030*/
/**
 * 酒店地图页面
 * @url: m.ctrip.com/webapp/tuan/hotelmap
 */
define(['TuanApp', 'libs', 'c', 'TuanStore', 'AMapWidget', 'TuanBaseView', 'cCommonPageFactory', 'cUtility', 'cWidgetFactory', 'cWidgetGeolocation', 'TuanModel', 'CommonStore', 'text!HotelMapTpl'],
function (TuanApp, libs, c, TuanStore, AMapWidget, TuanBaseView, CommonPageFactory, Util, WidgetFactory, Geolocation, TuanModel, CommonStore, html) {
    var View,
        Map = WidgetFactory.create('AMapWidget'),
        geolocation = WidgetFactory.create('Geolocation');
    var PageView = CommonPageFactory.create("TuanBaseView");
    View = PageView.extend({
        pageid: '214010',
        hpageid: '215010',
        events: {
            'click #J_return': 'returnHandler',
            'click .J_relatedProducts': 'gotoProduct',
            'click #J_navigator': 'showMapNav'
        },
        onCreate: function () {
            this.$el.html($.trim(html));

            this.els = {
                mapContainer: this.$el.find('#J_mapContainer')
            };

            var lon = Lizard.P('lon'),
                lat = Lizard.P('lat'),
                hotelName = Lizard.P('hotelName'),
                navigator = this.$el.find('#J_navigator');

            if (lon && lat) {
                this.mapdata = {
                    Longitude: lon,
                    Latitude: lat,
                    hotelName: hotelName
                };
                window.mapdata = this.mapdata;
            } else {
                //如果本地存储也没有，则返回上一层
                this.returnHandler();
            }

            // ios7 显示电信信息
            if (Util.isInApp() && TuanApp.isOverOS7()) {
                this.$el.find('#J_hotelmapWrap').css({
                    'padding-top': '20px',
                    'background-color': '#b3b3b3'
                });
                this.$el.find('#J_return').css('top', '30px');
                navigator.css({ 'top': '30px' });
            }

            this.loadMapScript();
            !Util.isInApp() && navigator.css('display', 'none');
        },
        /**
        * 显示地图导航
        */
        showMapNav: function () {
            var data = this.mapdata || {},
                hotelMapInfo = {
                    latitude: data.Latitude,
                    longitude: data.Longitude,
                    title: data.hotelName
                };
            hotelMapInfo && geolocation.show_map(hotelMapInfo);

            //this.forwardJump('hotelmapnav', '/webapp/tuan/hotelmapnav?lat='+data.Latitude+'&lng='+data.Longitude+'&title='+data.hotelName);
        },

        onShow: function () {
            if (this.header) {
                this.header.hide();
            }
        },
        onHide: function () {
            if (!Util.isInApp() && this.header && this.header.rootBox) {
                this.header.rootBox.show();
            }
            this.centerMarker && this.centerMarker.hide();
        },
        returnHandler: function () {
            this.back();
        },
        addCenterMarker: function (title) {
            var self = this,
                mapdata = this.mapdata,
                map = this.map,
                centerMarker = map.addMarker({
                    position: new map.host.LngLat(mapdata.Longitude, mapdata.Latitude), //基点位置
                    offset: { x: -7, y: -36 }, //相对于基点的位置
                    content: _.template(self.$el.find('#J_centerMarkerTpl').html())({ title: title })
                }),
                hasTouch = 'ontouchstart' in window;

            this.centerMarker = centerMarker;
            map.addEvent(centerMarker, hasTouch ? 'touchstart' : 'click', function (e) {
                var label,
                    oriEvent = e.originalEvent;
                if (oriEvent.target.tagName.toLowerCase() == 'img') {
                    label = $(oriEvent.currentTarget).find('#J_label');
                    label.toggle();
                }
            });
        },
        hotelMapInit: function () {
            var self = this,
                compass,
                mapdata = self.mapdata;

            if (!mapdata || !mapdata.Longitude || mapdata.Longitude == 1000 || mapdata.Longitude == -1) {return;}

            if (!this.map) {
                this.map = new Map({
                    container: this.els.mapContainer,
                    height: document.body.clientHeight,
                    center: mapdata.Longitude + '|' + mapdata.Latitude,
                    locationButton: '<div class="map_curpos_btn" style="opacity: 0.8"></div>',
                    onReady: function () {
                    },
                    onZoom: function () {},
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
                    onGeoComplete: function () {
                        compass && compass.css('background-color', 'rgba(0,0,0,.8)');
                        //当前位置点自适应
                        this.setFitView();
                    },
                    onGeoError: function () {
                        compass && compass.css('background-color', 'rgba(0,0,0,.8)');
                    }
                });
            } else {
                //将当前POI的位置设为地图的中心点
                this.map.map.setCenter(new this.map.host.LngLat(mapdata.Longitude, mapdata.Latitude));
            }

            //中心点操作
            this.addCenterMarker(mapdata.shortName || mapdata.hotelName);
        },
        setMapHeight: function () {
            var onResize = function () {
                    var ws = window.innerHeight || $('html').offset().height;
                    var nH = ws - ($('header').height());
                    if (Util.isInApp() && TuanApp.isOverOS7()) {
                        nH -= 20;
                    }
                };

            $(window).bind('resize', onResize);
            onResize();
        },
        loadMapScript: function () {
            var self = this,
                script;
            window.initDetailMap = function () {
                self.setMapHeight();
                self.hotelMapInit();
                self.els.mapContainer.click();
            };
            script = document.createElement('script');
            script.type = "text/javascript";
            script.src = 'http://webapi.amap.com/maps?v=1.2&key=0b895f63ca21c9e82eb158f46fe7f502&callback=initDetailMap';
            this.$el.append(script);
        }
    });
    return View;
});
