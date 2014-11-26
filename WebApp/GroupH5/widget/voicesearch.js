/*jshint -W030*/
/**
 * @author: xuweichen
 * @date: 2014/7/25 16:18
 * @descriptions 语音搜索入口
 */
define(['cBase', 'cWidgetFactory','cWidgetGuider', 'libs'], function(cBase, WidgetFactory){
    var WIDGET_NAME = 'VoiceSearch',
        Guider = WidgetFactory.create('Guider'),
        VoiceSearch;

    // 如果WidgetFactory已经注册了VoiceSearch，就无需重复注册
    if (WidgetFactory.hasWidget(WIDGET_NAME)) {
        return;
    }
    VoiceSearch = new cBase.Class({
        __propertys__: function(){
            this.trigger = null;
        },
        initialize: function(trigger){

            this.trigger = trigger;
            if(trigger && trigger.length){
                this._bindEvents();
            }
        },

        _bindEvents: function(){
            var self = this;
            this.trigger.on('click', function(){
                self.showPanel();
            });
        },
        showPanel: function(){
            Guider.show_voice_search({bussinessType: VoiceSearch.TUAN});
        }
    });
    /**
     * 团购的bussinessType
     * @static
     * @type {number}
     */
    VoiceSearch.TUAN = 70;

    WidgetFactory.register({
        name: WIDGET_NAME,
        fn: VoiceSearch
    });
});
