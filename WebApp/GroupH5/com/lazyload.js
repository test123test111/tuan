/*jshint -W030 */
//图片延迟加载
define(['libs'], function () {

    function LazyLoad (options) {
        var Noop = function () {
            },
            defOpt = {
                attr: 'data-lazy',   //属性名称
                wrap: window,     //容器, DOM/Selector
                container: window,
                event: ['scroll', 'resize'],   //触发延迟加载的事件,
                time: 100,              //延时,单位ms
                threshold: 180,          //一定距离， 单位px
                vertical: true,
                stateAttr: 'data-load-state',
                onComplete: Noop,
                animateCls: 'fade-in'
            };

        this.options = $.extend(defOpt, options);
        this.container = $(this.options.container);
        this.wrap = $(this.options.wrap);
        this.eles = (this.options.wrap === window) ? $('img') : $('img', this.wrap);
        this.bindEvents();

    }

    LazyLoad.prototype = {
        constructor: LazyLoad,
        bindEvents: function () {
            var events = this.options.event,
                eventHandler = function (e) {
                    this.TimerFun && clearTimeout(this.TimerFun);

                    this.TimerFun = setTimeout(function () {
                        this.triggerEvent(e);
                    }.bind(this), this.options.time);
                }.bind(this);

            for (var i in events) {
                this.container.on(this.options.event[i], eventHandler);
            }

            this.triggerEvent();
        },
        _imgLoaded: function($t, o){
            $t[0].src = $t.attr(o.attr);
            $t.addClass(o.animateCls);
            $t.attr(o.stateAttr, 'true');
        },
        triggerEvent: function (e) {
            var self = this,
                i = 0,
                $t,
                s,
                o = self.options;
            for (; i < self.eles.length; i++) {
                $t = $(self.eles[i]);
                s = $t.attr(o.attr);
                if (!s || $t[0].src.trim() === s.trim()) {
                    continue;
                }else if (this.isReady($t)) {
                    this._loadImage($t, self._imgLoaded);
                }
            }

            o.onComplete.call(this, e);
        },
        _loadImage: function($dom, callback){
            var self = this,
                options = self.options,
                img = new Image();

            img.src = $dom.attr(options.attr);

            if (img.complete) {  // 如果图片已经存在于浏览器缓存，直接调用回调函数

                callback.call(self, $dom, options);
                return; // 直接返回，不用再处理onload事件
            }

            img.onload = function () {
                img.onload = null;
                callback.call(self, $dom, options);

            };
        },
        isReady: function (el) {
            var SCROLL = this.options.vertical ? 'scrollTop' : 'scrollLeft',
                OFFSET = this.options.vertical ? 'top' : 'left',
                t = el.offset()[OFFSET],
                winSize = this.options.vertical ? this.container.height() : this.container.width(),
                scrollSize = this.container[SCROLL]();
            //, docSize = winSize + scrollSize;

            return t >= scrollSize && t <= winSize + scrollSize + this.options.threshold;
        },
        /**
         * 通知插件更新一下异步加载的dom
         */
        updateDom: function () {
            this.eles = (this.options.wrap === window) ? $('img').not('[' + this.options.stateAttr + ' = "true"]') : $('img', this.wrap).not('[' + this.options.stateAttr + '="true"]');
            this.container.trigger(this.options.event[0]);
        },
        unbindEvents: function () {
            for (var i in this.options.event) {
                this.container.off(this.options.event[i]);
            }
        }
    };

    return LazyLoad;
});