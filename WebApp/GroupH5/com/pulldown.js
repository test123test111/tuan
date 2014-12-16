/**
 * @author: xuweichen
 * @date: 2014/12/16 15:52
 * @descriptions 下拉修饰模块
 */
define(['cBase'],function (cBase) {

    var PulldownDecorator,
        CSS3ExpandoPrefix = (function(){
            var browser = $.browser,
                prefix = '';

            prefix = browser.webkit ? '-webkit-' :
                browser.firefox ? '-moz-'   :
                    browser.ie ? '-ms-'         :
                        '';

            return prefix;

        })(),
        NOOP = function(){};

    function isPullDown(y1, y2) {
        return  y1 - y2 <0;
    }

    PulldownDecorator = new cBase.Class({
        initialize: function(view, options){
            this.options = $.extend(this.options, options);
            this.view = view;
        },
        /**
         * 当滚动条在顶部时才支持下拉
         * @returns {boolean}
         */
        ready: function(){
            return !(document.body.scrollTop || document.documentElement.scrollTop);
        },
        __propertys__: function() {
            this.options = {
                /**
                 * @cfg {Number} 手指拖动距离与试图移动距离的比例
                 */
                offsetRatio: 0.3,
                /**
                 * @cfg {int} 拖动到多少位移为有效拖动
                 */
                releasePoint: 100,
                /**
                 * @event 拖动到开始
                 */
                onPullStart: NOOP,
                /**
                 * @event 拖动到结束
                 */
                onPullEnd: NOOP,
                /**
                 * @event 拖动中
                 */
                onPulling: NOOP,
                /**
                 * @event 拖动到有效点
                 */
                onPullMax: NOOP
            };
            this.isPulling = false;
            this.isMax = false;
        },
        _lastTouchStartPos: {pageX:0, pageY:0},
        _translate: function(dom, offset, direction){
            direction = direction || 'Y';

            dom.css(CSS3ExpandoPrefix+'transform', 'translate'+direction.toUpperCase()+'('+offset+'px)');
        },
        _touchstartHandler: function(e){
            var touches = e.touches[0];
            if(this.ready()){
                this.isPulling = true;
                this._lastTouchStartPos.pageX = touches.pageX;
                this._lastTouchStartPos.pageY = touches.pageY;
                this.isMax = false;
                this.options.onPullStart.call(this, e);
            }
            //target.
        },
        _touchmoveHandler: function(event){
            var target = $(event.currentTarget),
                touches,
                pageOffsetY,
                lastTouch = this._lastTouchStartPos,
                options = this.options,
                offset,
                maxpull = options.releasePoint;


            if(!this.isPulling){
                return;
            }
            //判断多指触摸，缩放
            if ( event.touches.length > 1 || event.scale && event.scale !== 1) {
                return;
            }

            touches = event.touches[0];
            pageOffsetY = touches.pageY;
            if(!isPullDown(lastTouch.pageY, pageOffsetY)){
                return;
            }
            event.preventDefault();//必须禁止默认行为，否则拖动卡
            offset = (touches.pageY-lastTouch.pageY) * options.offsetRatio;
            if(offset>=maxpull){
                !this.isMax && options.onPullMax.call(this, event, offset, this.isMax);
                this.isMax = true;
            }else{
                this.isMax = false;
                options.onPulling.call(this, event, offset);
            }
            (pageOffsetY>=0 || offset<maxpull) && this._translate(target, offset, 'y');
        },
        _touchendHandler: function(e){
            var wrap = this.view.$el;
            if(this.isPulling){
                this.isPulling = false;
                wrap.css(CSS3ExpandoPrefix+'transition', '100ms ease-out');
                this._translate(wrap, 0, 'y');
                this.isMax = false;
                this.options.onPullEnd.call(this, e);
            }
        },
        _bindTouchEvents: function(){
            var wrap = this.view.$el,
                self = this;

            self.__onTouchstartHandler = self._touchstartHandler.bind(self);
            self.__onTouchmoveHandler = self._touchmoveHandler.bind(self);
            self.__onTouchendHandler = self._touchendHandler.bind(self);
            wrap.on('touchstart', self.__onTouchstartHandler);
            wrap.on('touchmove', self.__onTouchmoveHandler);
            wrap.on('touchend', self.__onTouchendHandler);
        },
        _unbindTouchEvents: function(){
            var wrap = this.view.$el,
                self = this;

            wrap.off('touchmove', self.__onTouchmoveHandler);
            wrap.off('touchend', self.__onTouchendHandler);
            wrap.off('touchstart', self.__onTouchstartHandler);
        },
        disable: function(){
            this._unbindTouchEvents();
        },
        enable: function(){
            this._bindTouchEvents();
        }
    });
    return PulldownDecorator;
});