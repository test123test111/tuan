/*jshint -W030 */
/**
 * @author: xuweichen
 * @date: 14-2-13 上午11:07
 * @descriptions
 */
define(['libs', 'cUIMask'], function (libs, Mask) {
    var NOOP = function () { },
        mix = $.extend;

    function DropDown(options) {
        var defaultOptions = {
            triggerEvent: 'click',
            trigger: null,
            panel: null,
            label: null,
            itemCls: 'li[data-type]',
            hasEffect: true,
            hasMask: true,
            selectedIndex: 0,
            activeTriggerCls: '',
            selectedItemCls: 'typecrt',
            multiple: false,
            onShow: NOOP,
            onHide: NOOP,
            onSelect: NOOP
        };
        var self = this;

        this.options = mix(defaultOptions, options);
        this.trigger = this.options.trigger;
        this.panel = this.options.panel;
        this.label = this.options.label;
        this.disabled = false;
        this.opened = false;
        this.items = this.panel.find(this.options.itemCls);
        this.reset(true);
        if (this.options.hasMask) {
            this.mask = new Mask({
                onCreate: function () {
                    var scope = this;
                    this.root.on('click', function () {
                        self.hide();
                        scope.hide();
                    }); //点击切换activeElement
                }
            });
            this.panel.css('z-index', 9999);
        }
        this._bindEvents();
    }

    DropDown.prototype = {
        constructor: DropDown,
        _bindEvents: function () {
            var self = this,
                options = this.options,
                trigger = this.trigger;

            this._showHandler = $.proxy(function () {
                if (this.opened) {
                    this.hide();
                    options.onHide.call(self);
                } else {
                    this.show();
                    options.onShow.call(self);
                }
            }, this);

            this._selectHandler = $.proxy(function (e) {
                e.preventDefault();
                e.stopPropagation();
                this.select(e.target);
                this.hide();
            }, this);

            this._hideHandler = $.proxy(function () {
                var self = this;
                setTimeout(function () {
                    self.hide();
                }, 200); //做延迟，保证blur触发后，dom短时还能点击
            }, this);
            trigger.on(options.triggerEvent, this._showHandler);
            trigger.on('blur', this._hideHandler);
            this.panel.on('click', options.itemCls, this._selectHandler);

        },
        _unbindEvents: function () {
            var options = this.options;

            this.trigger.off(options.triggerEvent, this._showHandler);
            this.panel.off('click', this._selectHandler);
        },
        disable: function () {
            this._unbindEvents();
            this.disabled = true;
        },
        enable: function () {
            this._bindEvents();
            this.disabled = false;
        },
        show: function () {
            var panel = this.panel;

            panel.show();
            if (this.options.hasEffect) {
                panel.css({
                    '-webkit-transform': 'translate(0, 30px) translateZ(0)',
                    'opacity': 0
                });
                panel.animate({
                    '-webkit-transform': 'translate(0, -8px) translateZ(0)',
                    'opacity': 1
                });
            }
            this.mask && this.mask.show();
            this.trigger.addClass(this.options.activeTriggerCls);
            this.opened = true;
        },
        hide: function () {
            var self = this;

            self.panel.hide();
            self.mask && self.mask.hide();
            self.trigger.removeClass(self.options.activeTriggerCls);
            self.opened = false;
        },
        getItemByAttr: function (type, val) {
            return this.panel.find('[data-' + type + '="' + val + '"]');
        },
        getItemByIndex: function(index){
            return this.items[index];
        },
        /**
        * select item
        * @param item {DOM} , 被选中的选项dom
        * @param noevent {Boolean}, 是否触发选择事件
        */
        select: function (item, noevent) {
            var options = this.options,
                selected = this._selected,
                selectedItemCls = options.selectedItemCls;

            selected && selected.removeClass(selectedItemCls);
            if (item.tagName != "LI") {
                item = item.parentNode;
            }
            this.selectedIndex = this.items.indexOf(item);
            item = $(item);
            this.label.html(item.attr('data-name') || item.text());
            item.addClass(selectedItemCls);
            !noevent && this.options.onSelect.call(this, item);
            this._selected = item;
        },
        reset: function (noevent, index) {
            this.select(this.items[typeof index == 'number' ? index : this.options.selectedIndex], noevent);
        }
    };
    return DropDown;
});