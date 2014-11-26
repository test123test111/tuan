/*jshint -W030*/
/**
 * @depends underscore
 */
define(['cBase', 'cUICore', 'cWidgetFactory', 'libs'], function(cBase, cUICore, WidgetFactory){
    var WIDGET_NAME = 'TabSlide',
        NOOP = function(){},
        NULL = null,
        RE_CSS_VAL = /\-?[0-9]+\.?[0-9]*/g,
        TabSlide,
        CSS3ExpandoPrefix = (function(){
            var browser = $.browser,
                prefix = '';

            prefix = browser.webkit ? '-webkit-' :
                     browser.firefox ? '-moz-'   :
                     browser.ie ? '-ms-'         :
                                                 '';

            return prefix;
        })(),
        JSCSS3Prefix = CSS3ExpandoPrefix.replace(/\-/g, '');

    /**
     * 目标是否为object
     * @param o
     * @returns {boolean}
     */
    function isObject(o){
        return o === Object(o);
    }

    // 如果WidgetFactory已经注册了ListView，就无需重复注册
    if (WidgetFactory.hasWidget(WIDGET_NAME)) {
        return;
    }

    TabSlide = new cBase.Class({
        __propertys__: function(){
            this.options = {
                /**
                 * @cfg {DOM} 轮播容器
                 */
                container: NULL,
                /**
                 * @cfg {int} 当前索引
                 */
                currentIndex: 0,
                /**
                 * @cfg {int} 播放方向, TabSlide.LEFT|TabSlide.RIGHT
                 */
                direction: TabSlide.LEFT,
                /**
                 * @cfg {int} 动画时长，默认300ms
                 */
                animationDuration: 300,
                /**
                 * @cfg {int} 预取数量, 默认0，不预取
                 */
                prefetch: 0,

                placeholder: '',
                /**
                 * @cfg {JSON} 数据
                 */
                source: NULL,
                /**
                 * @cfg {string} 轮播模版
                 */
                tpl:    '<div class="sw_clip">'+
                            '<%var num =Math.ceil(data.length / 6);%>'+
                            '<%for(var i = 1; i <= num ; i++){%>'+
                            '<ul class="sw_con" js_index="<%=i%>"  >'+
                                '<%for(var j = 1; j <= 6 ; j++){ var index = (i-1)*6 + (j-1); if(index >=data.length){break;}%>'+
                                '<li data-json=<%=JSON.stringify(data[index])%>><%=data[index].word%></li>'+
                                '<%}%>'+
                            '</ul>'+
                            '<%}%>'+
                        '</div>'+
                        '<%if(num > 1){%>'+
                        '<p class="sw_nav">'+
                            '<%for(var ni=1; ni<= num; ni++){%>'+
                            '<i js_index="<%=ni%>" class="<%if(ni==1){%>current<%}%>"></i>'+
                            '<%}%>'+
                        '</p>'+
                        '<%}%>',
                itemCls: '.sw_con',

                pageSize: 1,
                /**
                 * @cfg {int} 最小有效滑动距离
                 */
                minSwipe: 40,
                /**
                 * @cfg {int}轮播宽度
                 */
                width: 0,
                /**
                 * @cfg {int}轮播高度
                 */
                height: 0,
                /**
                 * @event 图片切换时触发
                 */
                onSwitch: NOOP,
                /**
                 * @event 切换动画结束
                 */
                onSwitchEnd: NOOP,
                /**
                 * @event 初始化完
                 */
                onInit: NOOP
            };
        },
        initialize: function(options){
            var opts;

            if(isObject(options)){
                this.options = $.extend(this.options, options);
            }
            opts = this.options;
            this.container = opts.container;
            this.tpl = opts.tpl;
            //有容器再执行初始化
            if(this.container && this.container.length){
                this.render(opts.source, opts.currentIndex);
                var self = this;
                window.addEventListener('resize', $.proxy(self._resize, self));
                this._isInteractive() && this._bindEvents();
            }else{
                console.error('no container!');
            }
        },
        /**
         * 是否可交互，轮播，滑动等
         * @returns {boolean}
         * @private
         */
        _isInteractive: function(){
            var options = this.options;

            return options.source.length / 6 > 1 ;
        },
        _createLayout: function(){
            var data=this.source;

            this.container.html(_.template(this.tpl)({data: data}));

        },
        _bindEvents: function(){
            var env = this._runtime,
                container = this.container;
            //绑定触摸事件
            this.__moveHandler = $.proxy(this.__moveHandler, this);
            container.on('touchmove', this.__moveHandler);
            //绑定touchStart
            this.__touchStartHandler = $.proxy(this.__touchStartHandler, this);
            container.on('touchstart', this.__touchStartHandler);

            //绑定touchEnd
            this.__touchEndHandler = $.proxy(this.__touchEndHandler, this);
            container.on('touchend', this.__touchEndHandler);
            //绑定动画结束事件
            this.__transitionEndHandler = $.proxy(this.__transitionEndHandler, this);
            env.root.on(JSCSS3Prefix+'TransitionEnd', this.__transitionEndHandler);
        },
        _unbindEvents: function(){
            var env = this._runtime,
                container = this.container;

            container.off('touchmove', this.__moveHandler);
            container.on('touchstart', this.__touchStartHandler);
            container.on('touchend', this.__touchEndHandler);
            env.root.off(JSCSS3Prefix+'TransitionEnd', this.__transitionEndHandler);
        },
        destroy: function () {
            var self = this;
            self.container.innerHTML = '';
            window.removeEventListener('resize', self._resize);
        },
        /**
         * 当前播放索引
         * @private
         */
        _current: 0,
        /**
         * 返回轮播图片个数
         * @returns {*}
         */
        count: function(){
            return Math.ceil(this.source.length / 6);
        },
        /**
         * 用数据渲染新对象
         * @param source
         * @param currentIndex
         * @returns {TabSlide}
         */
        render: function(source, currentIndex){
            var opts = this.options;

            this.source = source;
            this._createLayout(source);
            this.items = this.container.find(opts.itemCls);
            this._runtime = this._getRuntimeEnv();
            this.items.css('width', this._runtime.width);
            this._runtime.root.css('width', (this._runtime.width * this._runtime.count) + 'px');
            this._showCurrent(this._runtime.root, currentIndex);

            return this;
        },
        /**
         * 获取当前播放索引
         * @returns {number}
         */
        current: function(){
            return this._current;
        },
        next: function (isAutoplay) {
            this.goto(this._current + this.options.pageSize, TabSlide.LEFT, isAutoplay);
        },
        prev: function () {
            this.goto(this._current - this.options.pageSize, TabSlide.RIGHT);
        },
        play: function () {
            this.options.autoplay && this._autoplay();
        },
        pause: function () {
            clearTimeout(this.__autoplayTimer);
        },
        stop: function () {
            clearTimeout(this.__autoplayTimer);
            this.goto(0);
        },
        goto: function (index) {
            var env = this._runtime,
                options = this.options,
                direction = options.direction,
                max = env.count,
                width = env.width;
            //边界判断
            if (index >= 0 && index < max) {
                TabSlide.animate(env.root, direction * width * this._current, direction * width * index, this.options.animationDuration);
                this._current = index;
                _.each(this.container.find('.sw_nav>i'), function (item) {
                    if ($(item).attr('js_index') == index) {
                        $(item).addClass("current");
                    } else {
                        $(item).removeClass("current");
                    }
                });
            }
        },
        _resize: function () {
            this._runtime = this._getRuntimeEnv();
            this.items.css('width', this._runtime.width);
            this._runtime.root.css('width', (this._runtime.width * this._runtime.count) + 'px');
            this._showCurrent(this._runtime.root, this._current);
        },
        _showCurrent: function(root, index){
            var env = this._runtime;
            TabSlide.translate(env.root, this.options.direction * env.width * index, 0);
            this._current = index;
        },
        _getSwipeDirection: function(start, end){
            var offset = end - start,
                offsetABS = Math.abs(offset),
                direction;

            if(offsetABS>0 && offsetABS >this.options.minSwipe){
                direction = offset/offsetABS;
            }
            return direction;
        },
        _getRuntimeEnv: function(){
            var items = this.items,
                options = this.options,
                sample = $(items[0]),
                root = sample.parent(),
                stage = root.parent(),
                stageOffset = stage.offset(),
                itemsCount = this.count();

            return {
                width: options.width || stageOffset.width,
                root: root,
                stage: stage,
                count: itemsCount
            };
        },
        __touchStartHandler: function(event){
            var touches = event.touches[0],
                root = this._getRuntimeEnv().root,//不能直接用zepto的offset()，有偏移
                translateX = root.css(CSS3ExpandoPrefix+'transform').match(RE_CSS_VAL);

            translateX = translateX && translateX[0] || 0;
            this.__lastTouchStartPos = {
                left: Number(translateX),
                x   : touches.pageX,
                y   : touches.pageY,
                t   : +new Date() //时间戳
            };
        },
        __touchEndHandler: function(event){
            var lastPos = this.__lastTouchStartPos,
                swipeDirection = this._getSwipeDirection(lastPos.x, event.changedTouches[0].pageX);//touchEnd没有pageX

            this[
                    swipeDirection === TabSlide.LEFT ? 'next'  :
                    swipeDirection === TabSlide.RIGHT? 'prev'  :
                                                            'goto'
                ]();
        },
        __transitionEndHandler: function(){
            //var current = this._current,
                //self = this;

            //setTimeout(function(){
                //self.options.onSwitchEnd.call(self, event, current, self.source[current]);
            //}, 10);
        },
        __moveHandler: function(event){
            event.preventDefault();//必须禁止默认行为，否则拖动卡
            //判断多指触摸，缩放
            if ( event.touches.length > 1 || event.scale && event.scale !== 1) { return; }

            //var touches = event.touches[0],
                //env = this._getRuntimeEnv(),
                //root = env.root,
                //start = this.__lastTouchStartPos;
                //offsetX = start.left + touches.pageX - start.x;
        }
    });
    /**
     * 向左滑动
     * @static
     * @type {number}
     */
    TabSlide.LEFT = -1;
    /**
     * 向右滑动
     * @static
     * @type {number}
     */
    TabSlide.RIGHT = 1;
    /**
     *
     * @param dom
     * @param dist
     * @param duration
     */
    //TabSlide.translate = function(dom, dist, duration){
    TabSlide.translate = function(dom, dist){
        var slide = dom[0],
            style = slide && slide.style;

        if (!style) { return; }

        //dom.css(CSS3ExpandoPrefix+'transition', duration + 'ms ease-out');//不要用translateX，在chrome下卡
        //dom.css(CSS3ExpandoPrefix + 'transform', 'translate(' + dist + 'px,0) translateZ(0)');
        dom.css(CSS3ExpandoPrefix + 'transform', "translate3d(" + dist + "px, 0, 0)");
    };
    /**
     *
     * @param dom
     * @param from
     * @param to
     * @param duration
     */
    TabSlide.animate = function (dom, from, to, duration) {
        this.translate(dom, to, duration);
    };


    // return TabSlide;
    WidgetFactory.register({
        name: WIDGET_NAME,
        fn: TabSlide
    });
});
