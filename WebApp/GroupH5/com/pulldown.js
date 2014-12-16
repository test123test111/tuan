/**
 * @author: xuweichen
 * @date: 2014/12/16 15:52
 * @descriptions 下拉修饰模块
 */
define(['cBase'],function (cBase) {

    var PulldownDecorator,
        NOOP = function(){};

    function isPullDown(y1, y2) {
        return  y1 - y2 <0;
    }

    PulldownDecorator = new cBase.Class({
        initialize: function(view, options){
            this.options = $.extend(this.options, options);
            this.view = view;
            this._bindTouchEvents();
        },
        ready: function(){
            return !(document.body.scrollTop || document.documentElement.scrollTop);
        },
        __propertys__: function() {
            this.options = {
                offsetRatio: 0.3,
                releasePoint: 100,
                onPullRelease: NOOP,
                onPullStart: NOOP,
                onPullEnd: NOOP,
                onPulling: NOOP,
                onPullMax: NOOP
            };
            this.isPulling = false;
        },
        __lastTouchStartPos: {pageX:0, pageY:0},
        _translate: function(dom, offset, direction){
            direction = direction || 'Y';

            dom.css('transform', 'translate'+direction.toUpperCase()+'('+offset+'px)');
        },
        _touchstartHandler: function(e){
            var touches = e.touches[0];
            if(this.ready()){
                this.isPulling = true;
                this.__lastTouchStartPos.pageX = touches.pageX;
                this.__lastTouchStartPos.pageY = touches.pageY;
                this.options.onPullStart.call(this, e);
            }
            //target.
        },
        _touchmoveHandler: function(event){
            var target = $(event.currentTarget),
                touches,
                pageOffsetY,
                lastTouch = this.__lastTouchStartPos,
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
                options.onPullMax.call(this, event, offset);
            }else{

                options.onPulling.call(this, event, offset);
            }
            (pageOffsetY>=0 || offset<maxpull) && this._translate(target, offset, 'y');
        },
        _touchendHandler: function(e){
            var wrap = this.view.$el;

            this.isPulling = false;
            wrap.css({
                'transition': '100ms ease-out'
            });
            this._translate(wrap, 0, 'y');
            this.options.onPullEnd.call(this, e);
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
        }
    });
    return PulldownDecorator;
});