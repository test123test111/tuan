/**
 * @author: xuweichen
 * @date: 14-2-13 上午11:07
 * @descriptions
 */
define(['cBase'], function (Base) {
    var NOOP = function () { },
        Switch,
        mix = $.extend;


    function Switch(options) {
        this.options = {
            wrap: null,
            cursor: null,
            cursorCls: '',
            turnOnCls: 'active',
            html: '<i>关</i>',
            isTurnOn: false,
            onChange: NOOP
        };
        this.initialize(options);
        this.turn(this.isTurnOn, true);
    };
    Switch.prototype = {
        initialize: function (options) {
            mix(this.options, options);
            this.isTurnOn = this.options.isTurnOn;
            this.wrap = this.options.wrap;
            this.wrap && this.renderHTML();
            if (this.options.cursor) {
                this.cursor = this.options.cursor;
            } else {
                this.cursor = this.wrap.find(this.options.cursorCls);
            };
            this.bindEvents();
        },
        renderHTML: function () {
            this.wrap.html(this.options.html);
        },
        bindEvents: function () {
            var cursor = this.cursor,
                self = this;

            this._clickHandler = function () {
                self.turn();
            };
            cursor && cursor.length && cursor.parent().bind('click', this._clickHandler);
        },
        unbindEvents: function () {
            this.cursor.parent().unbind('click', this._clickHandler);
        },
        turn: function (isOn) {
            var isTurnOn,
                options = this.options;

            if (isOn === undefined) {
                isTurnOn = !this.isTurnOn;
            } else {
                isTurnOn = isOn;
            };
            try{
                this.wrap && this.wrap[isTurnOn ? 'addClass' : 'removeClass'](options.turnOnCls);
                options.onChange.call(this, isTurnOn);
                this.isTurnOn = isTurnOn;
             }catch(ex){TuanApp.app.curView.showToast(ex);}
        },
        on: function () {
            this.turn(true);
        },
        off: function () {
            this.turn(false);
        }
    };
    return Switch;
});