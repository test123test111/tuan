define(["libs","cUIMask"],function(e,t){function i(e){var i={triggerEvent:"click",trigger:null,panel:null,label:null,itemCls:"li[data-type]",hasEffect:!0,hasMask:!0,selectedIndex:0,activeTriggerCls:"",selectedItemCls:"typecrt",multiple:!1,onShow:n,onHide:n,onSelect:n},s=this;this.options=r(i,e),this.trigger=this.options.trigger,this.panel=this.options.panel,this.label=this.options.label,this.disabled=!1,this.opened=!1,this.items=this.panel.find(this.options.itemCls),this.reset(!0),this.options.hasMask&&(this.mask=new t({onCreate:function(){var e=this;this.root.on("click",function(){s.hide(),e.hide()})}}),this.panel.css("z-index",9999)),this._bindEvents()}var n=function(){},r=$.extend;return i.prototype={constructor:i,_bindEvents:function(){var e=this,t=this.options,n=this.trigger;this._showHandler=$.proxy(function(n){this.opened?(this.hide(),t.onHide.call(e)):(this.show(),t.onShow.call(e))},this),this._selectHandler=$.proxy(function(e){e.preventDefault(),e.stopPropagation(),this.select(e.target),this.hide()},this),this._hideHandler=$.proxy(function(e){var t=this;setTimeout(function(){t.hide()},200)},this),n.on(t.triggerEvent,this._showHandler),n.on("blur",this._hideHandler),this.panel.on("click",t.itemCls,this._selectHandler)},_unbindEvents:function(){var e=this.options;this.trigger.off(e.triggerEvent,this._showHandler),this.panel.off("click",this._selectHandler)},disable:function(){this._unbindEvents(),this.disabled=!0},enable:function(){this._bindEvents(),this.disabled=!1},show:function(){var e=this.panel;e.show(),this.options.hasEffect&&(e.css({"-webkit-transform":"translate(0, 30px) translateZ(0)",opacity:0}),e.animate({"-webkit-transform":"translate(0, -8px) translateZ(0)",opacity:1})),this.mask&&this.mask.show(),this.trigger.addClass(this.options.activeTriggerCls),this.opened=!0},hide:function(){var e=this;e.panel.hide(),e.mask&&e.mask.hide(),e.trigger.removeClass(e.options.activeTriggerCls),e.opened=!1},getItemByAttr:function(e,t){return this.panel.find("[data-"+e+'="'+t+'"]')},getItemByIndex:function(e){return this.items[e]},select:function(e,t){var n=this.options,r=this._selected,i=n.selectedItemCls;r&&r.removeClass(i),e.tagName!="LI"&&(e=e.parentNode),this.selectedIndex=this.items.indexOf(e),e=$(e),this.label.html(e.attr("data-name")||e.text()),e.addClass(i),!t&&this.options.onSelect.call(this,e),this._selected=e},reset:function(e,t){this.select(this.items[typeof t=="number"?t:this.options.selectedIndex],e)}},i});