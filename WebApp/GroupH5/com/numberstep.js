/*jshint -W030 */
/**
  * @since 20140217
  * @author: li.xx
  * @descriptions 封装增减控件，用于选择购买数量
  
  */
define(['libs'], function() {
    /* 
    config: 最大值,最小值,步长，初始值
    events，单步点击事件，最大值事件，最小值事件
    changeStatus，改变增减控件的+,- 是否可用
    */
    'use strict';
    function NumberStep(options) {
        var NOOP = function() {},
            defaultOptions = {
            max: 9, //默认最大值
            min: 1, //默认最小值
            initialVal: 1, //默认初始值
            step: 1, //默认每次加减的幅度
            html: '<i class="minus <%if(initialVal <= min ){ %>num_invalid<%} %>">-</i><span id="J_curNum"><%=initialVal %></span><i class="plus <%if(initialVal >= max ){ %>num_invalid<%} %>">+</i>', // 默认HTML结构
            wrap: null, //外围容器, dom 对象
            disableClass: 'num_invalid',
            onChange: NOOP, //单次点击事件+/-
            onMax: NOOP, //最大值事件
            onMin: NOOP //最小值事件
        };
      
        this.options = $.extend(defaultOptions, options);
        this.wrap = this.options.wrap;
        this.renderHtml();
        this.els = {
            curNumDom: this.wrap.find('#J_curNum'),
            plusDom: this.wrap.find('.plus'),
            minusDom: this.wrap.find('.minus'),
            flagDom: this.wrap.find('i')
        };
        this.bindEvents();
    }
    
    NumberStep.prototype = {
        constructor: NumberStep,
        bindEvents: function() {
            var self = this;
            this.wrap.on('click', '.plus,.minus', function(event) {
                var _this = $(event.target),
                    num = parseInt(self.els.curNumDom.text().trim()),
                    flag= _this.text().trim() || _this.attr('data-flag');
                if (_this.hasClass(self.options.disableClass)) {
                  return false;
                }
                if ('+' === flag && num < self.options.max) {
                  num++;
                } else if ('-' === flag && num > self.options.min) {
                  num--;
                } else {
                  num = self.options.min;
                }
                //重置不可点击状态
                self.els.flagDom.removeClass(self.options.disableClass);
                if (num === self.options.min) {
                  _this.addClass(self.options.disableClass);
                  self.options.onMin(event);
                }
                
                if (num === self.options.max) {
                  _this.addClass(self.options.disableClass);
                  self.options.onMax(event);
                }
                
                self.els.curNumDom.html(num);
                self.options.onChange.call(self);
            });
        },
        triggerChange: function() {
            this.options.onChange.call(this);
        },
        unbindEvents: function() {
            this.wrap.off('click');
        },
        _changeStatus: function(type, action) {
          var method = action === 'disable' ? 'addClass' : 'removeClass';
          if ('+' === type) {
              this.els.plusDom[method](this.options.disableClass);
          } else if ('-' === type) {
              this.els.minusDom[method](this.options.disableClass);
          } else {
              this.els.flagDom[method](this.options.disableClass);
          }
        },
        disable: function(type) {
          //default: all,
          this._changeStatus(type, 'disable');
        },
        enable: function(type) {
          //default: all,
          this._changeStatus(type, 'enable');
        },
        renderHtml: function() {
          this.wrap.html(_.template(this.options.html, this.options));
        },
        getCurrentNum: function() {
          return this.els.curNumDom.text().trim();
        },
        setCurrentNum: function(num) {
            this.els.curNumDom.text(num);
        },
        setOptions: function(name, val) {
            val && (this.options[name] = val, this.options.onChange.call(this));
        }
      
    };
    
    return NumberStep;
});