/**
 * @depends underscore
 */
define(['cBase', 'cUICore', 'cWidgetFactory', 'libs'], function(cBase, cUICore, WidgetFactory){
    // "use strict";
    var WIDGET_NAME = 'POIWidget',
        NOOP = function(){},
        NULL = null,
        POIWidget;


    /**
     * 目标是否为object
     * @param o
     * @returns {boolean}
     */
    function isObject(o){
        return o === Object(o);
    }

    POIWidget = new cBase.Class({
        __propertys__: function(){
            this.options = {
                /**
                 * @cfg {Model} poi请求的model实例
                 */
                model: NULL,
                /**
                 * @cfg {int} 数据来源，默认为高德数据source: 3
                 */
                source: 3,
                /**
                 * @cfg {Object} 请求的参数
                 */
                params: {},
                /**
                 * @event poi查询成功
                 */
                onSuccess: NOOP,
                /**
                 * @event poi查询失败
                 */
                onError: NOOP
            };
        },
        initialize: function(options){
            var opts;

            if(isObject(options)){
                this.options = $.extend(this.options, options);
            }
            opts = this.options;
            this.model = opts.model;

        },
        /**
         * 查询poi
         * @param params 查询参数
         */
        query: function(params, onSuccess, onError){
            var self = this,
                options = self.options,
                defaultParams = options.params;

            if(isObject(params)){
                params = $.extend(defaultParams, params);
            }
            this.model.param = params;
            this.model.excute(function(data){
                (onSuccess||options.onSuccess).call(self, data);
            }, function(err){
                (onError || options.onError).call(self, err);
            }, false, self);
        },
        abort: function(){
            this.options.model.abort();
        }
    });

    WidgetFactory.register({
        name: WIDGET_NAME,
        fn: POIWidget
    });

});
