define(["libs","cUIScroll"],function(e,t){function r(e){var t={};this.options=n(t,e),this.panel=this.options.panel,this.label=this.options.label,this.isScroll=this.options.isScroll,this.inited=!1,this.switch(this.options.labelSelectedIndex),this._bindEvents()}var n=$.extend;return r.prototype={constructor:r,_bindEvents:function(){var e=this.options;this._switchHandler=$.proxy(function(e){var t=this.label.indexOf(e.currentTarget);this.switch(t)},this),this._selectHandler=$.proxy(function(t){e.onSelect($(t.currentTarget))},this),this.label.on("click",this._switchHandler),this.panel.on("click",e.itemClass,this._selectHandler)},_unbindEvents:function(){var e=this.options;this.trigger.off(e.triggerEvent,this._showHandler),this.panel.off("click",this._selectHandler)},"switch":function(e){var n=this.options;$(this.label[n.labelSelectedIndex]).removeClass(n.labelSelectedClass),$(this.label[e]).addClass(n.labelSelectedClass),$(this.panel[n.labelSelectedIndex]).hide();var r=$(this.panel[e]);r.show(),n.isScroll&&(r.css({overflow:"hidden","max-height":"285px","margin-bottom":"5px","margin-top":"5px"}),new t({wrapper:r,scroller:r.find("ul")})),this.options.labelSelectedIndex=e;if(this.inited){var i=r.find(n.itemClass);i.length==1&&n.onSelect(i)}this.inited=!0}},r});