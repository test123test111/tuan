define(['libs', 'cUIScroll'], function(libs, Scroll) {
    var mix = $.extend;

    function Tab(options) {
        var defaultOptions = {};

        this.options = mix(defaultOptions, options);
        this.panel = this.options.panel;
        this.label = this.options.label;
        this.isScroll = this.options.isScroll;//Panel是否可滚动
        this.inited = false;
        this.switch(this.options.labelSelectedIndex);
        this._bindEvents();
    };

    Tab.prototype = {
        constructor: Tab,
        _bindEvents: function() {
            var options = this.options;

            this._switchHandler = $.proxy(function(e) {
                var index = this.label.indexOf(e.currentTarget);
                // if (index != options.labelSelectedIndex) {
                    this.switch(index);
                // }
            }, this);

            this._selectHandler = $.proxy(function(e) {
                options.onSelect($(e.currentTarget));
            }, this);

            this.label.on('click', this._switchHandler)
            this.panel.on('click', options.itemClass, this._selectHandler);
        },
        _unbindEvents: function() {
            var options = this.options;

            this.trigger.off(options.triggerEvent, this._showHandler);
            this.panel.off('click', this._selectHandler);
        },
        switch: function(index) {
            var options = this.options;
            $(this.label[options.labelSelectedIndex]).removeClass(options.labelSelectedClass);
            $(this.label[index]).addClass(options.labelSelectedClass);

            $(this.panel[options.labelSelectedIndex]).hide();
            var currPanel = $(this.panel[index]);
            currPanel.show();
            if (options.isScroll) {
                currPanel.css({'overflow': 'hidden', 'max-height': '285px', 'margin-bottom': '5px', 'margin-top': '5px'});
                new Scroll({
                    wrapper: currPanel,
                    scroller: currPanel.find('ul')
                });
            }
            this.options.labelSelectedIndex = index;

            if (this.inited) {
                //如果只有一个选项，则切换时，就直接选中
                var item = currPanel.find(options.itemClass);
                if (item.length == 1) {
                    options.onSelect(item);
                }
            }
            this.inited = true;
        }
    };
    return Tab;
});
