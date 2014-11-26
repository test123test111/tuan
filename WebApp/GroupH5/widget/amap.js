/*jshint -W030*/
/**
 * @depends underscore
 */
define(['cBase', 'cUICore', 'cUtility', 'cWidgetFactory', 'cGeoService', 'cWidgetGeolocation', 'libs'], function (cBase, cUICore, Util, WidgetFactory, cGeoService) {
    // "use strict";
    var WIDGET_NAME = 'AMapWidget',
    NOOP = function () { },
    NULL = null,
    AMapWidget,
    isArray = $.isArray;


    /**
    * 目标是否为object
    * @param o
    * @returns {boolean}
    */
    function isObject(o) {
        return o === Object(o);
    }

    AMapWidget = new cBase.Class({
        __propertys__: function () {
            this.options = {
                /**
                * @cfg
                * 地图key
                */
                key: '0b895f63ca21c9e82eb158f46fe7f502',
                /**
                * @cfg
                * 地图api地址
                */
                webapi: 'http://webapi.amap.com/maps?v=1.2',
                /**
                * @cfg
                * 默认缩放等级
                */
                level: 13,
                /**
                * @cfg
                * 默认中心点
                */
                center: NULL,
                /**
                * @cfg
                * 地图容器高度
                */
                height: 0,
                /**
                * @cfg
                * 地图容器宽度
                */
                width: 0,
                /**
                * 当前位置按钮
                */
                locationButton: NULL,
                /**
                * @event 地图对象初始化完成
                */
                onReady: NOOP,
                /**
                * @event 地图缩放事件
                */
                onZoom: NOOP,
                /**
                * @event 地图平移开始时触发事件
                */
                onMovestart: NOOP,
                /**
                * @event 当前位置控件定位开始
                */
                onGeoBegin: NOOP,
                /**
                * @event 当前位置控件定位完成
                */
                onGeoComplete: NOOP,
                /**
                * @event 当前位置控件定位出错
                */
                onGeoError: NOOP
            };
            //内部栈
            this.__stacks = [];
        },
        initialize: function (options) {
            var self = this,
            opts;

            if (isObject(options)) {
                opts = $.extend(this.options, options);
            }
            this.options = opts;
            //更新容器大小
            self._updateContainerSize(opts.width, opts.height);
            //加载地图脚本
            self._loadScript($.proxy(self._createMap, self));

            self.gps = cGeoService.GeoLocation;
        },

        /**
        * 添加marker
        * @param markerOptions
        * @returns {*}
        */
        addMarker: function (markerOptions) {
            var self = this,
            host = this.host,
            marker = [];
            //如果地图对象还没有转杯好，先队列起来
            if (!host) {
                this.__stacks.push(markerOptions);
                return;
            }
            if (isArray(markerOptions)) {
                markerOptions.forEach(function (item) {
                    marker.push(self.addMarker(item));
                });
                return marker;
            }
            marker = new host.Marker(markerOptions);
            marker.setMap(this.map);
            return marker;
        },
        /**
        * 删除marker
        * @param marker
        */
        removeMarker: function (marker) {
            marker.setMap(null);
        },
        /**
        * 添加事件
        * @param type
        * @param handler
        */
        addEvent: function (target, type, handler, context) {
            var key, self = this;

            if (isObject(type)) {
                for (key in type) {
                    type.hasOwnProperty(key) && self.addEvent(target, type, type[key], context);
                }
                return;
            }
            self.host.event.addListener(target, type, handler, context);
        },
        /**
        * 删除事件
        * @param type
        * @param handler
        */
        removeEvent: function (target, type, handler) {
            var key,
            self = this;

            if (isObject(type)) {
                for (key in type) {
                    type.hasOwnProperty(key) && self.addEvent(type, type[key]);
                }
                return;
            }
            self.host.event.removeListener(target, type, handler);
        },
        setFitView: function () {
            this.map.setFitView();
        },
        setPosition: function (marker, lng, lat) {
            marker.setPosition(new this.host.LngLat(lng, lat));
        },
        /**
        * @param {Object} controlTool 被移除的control对象，比如geolocation
        */
        removeControl: function (controlTool) {
            this.map.removeControl(controlTool);
        },
        _bindEvents: function () {
            var evt = this.host.event;

            this.__zoomendHandler = $.proxy(this._zoomendHandler, this);
            this.__movestartHandler = $.proxy(this._movestartHandler, this);
            evt.addListener(this.map, 'zoomchange', this.__zoomendHandler);
            evt.addListener(this.map, 'movestart', this.__movestartHandler);

            this.__clickHandler = $.proxy(this._clickHandler, this);
            evt.addListener(this.map, 'click', this.__clickHandler);
        },
        _unbindEvents: function () {
            this.host.event.event.removeListener(this.map, 'zoomchange', this.__zoomendHandler);
            this.host.event.event.removeListener(this.map, 'click', this.__clickHandler);
        },
        _clickHandler: function () {
            this.options.onClick.call(this);
        },
        _zoomendHandler: function (e) {
            var options = this.options;

            options.onZoom.call(this, e, this.map.getZoom());
        },
        _movestartHandler: function (e) {
            var options = this.options;

            options.onMovestart.call(this, e);
        },
        _formatGPSInfo: function (gpsInfo) {
            return {
                coords: {
                    latitude: gpsInfo.lat,
                    longitude: gpsInfo.lng,
                    accuracy: 50
                },
                timestamp: +new Date()
            };
        },
        _addCurrentLocationTool: function (onComplete, onError, onBegin) {
            var self = this,
                mapObj = this.map,
                host = this.host;

            mapObj.plugin('AMap.Geolocation', function () {
                var geolocation = new host.Geolocation({
                    enableHighAccuracy: true, //是否使用高精度定位，默认:true
                    timeout: 10000,          //超过10秒后停止定位，默认：无穷大
                    maximumAge: 0,           //定位结果缓存0毫秒，默认：0
                    convert: true,           //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
                    buttonDom: self.options.locationButton,
                    showButton: true,        //显示定位按钮，默认：true
                    buttonPosition: 'LB',    //定位按钮停靠位置，默认：'LB'，左下角
                    buttonOffset: new host.Pixel(0, 0), //定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
                    showMarker: true,        //定位成功后在定位到的位置显示点标记，默认：true
                    showCircle: true,        //定位成功后用圆圈表示定位精度范围，默认：true
                    panToLocation: false,     //定位成功后将定位到的位置作为地图中心点，默认：true
                    zoomToAccuracy: false      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
                });
                //在hybrid中h5自带的geolocation无法定位，借用app提供的定位模块
                if (Util.isInApp()) {
                    geolocation.onButtonClick = function () {
                        onBegin && onBegin.call(geolocation, geolocation._container);
                        self.gps.Subscribe('tuan/amap', {
                            onComplete: function (gpsInfo) {
                                geolocation.onPositionComplete(self._formatGPSInfo(gpsInfo));
                            },
                            onError: function (error) {
                                geolocation.onPositionError(error);
                            },
                            onPosComplete: function () {
                            },
                            onPosError: function (error) {
                                geolocation.onPositionError(error);
                            }
                        }, self, true);
                    };
                }
                mapObj.addControl(geolocation);
                host.event.addListener(geolocation, 'complete', $.proxy(onComplete, self)); //返回定位信息
                host.event.addListener(geolocation, 'error', $.proxy(onError, self));      //返回定位出错信息
                self.geolocation = geolocation;
            });
        },
        _updateContainerSize: function (width, height) {
            var options = this.options,
            container = options.container,
            body = document.body,
            offset = container.offset();

            if (!width) {
                width = offset.width || body.clientWidth;
            }
            if (!height) {
                height = offset.height || body.clientHeight;
            }
            container.css({
                width: width,
                height: height
            });
        },
        _createMap: function () {
            var host = window.AMap,
                options = this.options,
                stacks = this.__stacks,
                center = options.center.split('|');

            if (host) {
                this.host = host;
                this.map = new host.Map(options.container[0], {
                    level: 11,
                    center: new host.LngLat(center[0], center[1])
                });
                if (stacks.length) {
                    this.addMarker(stacks);
                }

                this._bindEvents();
                options.locationButton && this._addCurrentLocationTool(options.onGeoComplete, options.onGeoError, options.onGeoBegin);
                options.onReady.call(this);
            } else {
                throw new Error('no mapapi!');
            }
        },
        _loadScript: function (callback) {
            if (window.AMap) {
                callback();
                return;
            }

            var script = document.createElement("script"),
            options = this.options,
            callbackName = "__" + WIDGET_NAME + Date.now();

            window[callbackName] = callback;
            script.type = "text/javascript";
            script.src = options.webapi + "&key=" + options.key + "&callback=" + callbackName;
            document.body.appendChild(script);
        }
    });

    // return AMap;
    WidgetFactory.register({
        name: WIDGET_NAME,
        fn: AMapWidget
    });
});
