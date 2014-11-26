define(["cBase","cUICore","cWidgetFactory","libs"],function(t,i,n){function e(t){return t===Object(t)}function o(t){if(t&&!$(t).data("loaded")){var i=new Image;i.src=t.dataset["data-src"]||t.getAttribute("data-src"),i.onload=function(){t.src=i.src,$(t).data("loaded",!0)}}}var s,r="SmoothSlide",a=function(){},h=null,c=/\-?[0-9]+\.?[0-9]*/g,u=function(){var t=$.browser,i="";return i=t.webkit?"-webkit-":t.firefox?"-moz-":t.ie?"-ms-":""}(),l=u.replace(/\-/g,"");n.hasWidget(r)||(s=new t.Class({__propertys__:function(){this.options={container:h,autoplay:5e3,currentIndex:0,direction:s.LEFT,animationDuration:300,prefetch:0,placeholder:"",source:h,tpl:'<div class="cui-slide"><div class="cui-slide-imgsouter"><div class="cui-slide-imgsinter" style="width:9999px"><%for(var i=0,len=data.length;i<len;i++){%><%var item = data[i]%><div class="cui-slide-img-item"><img data-href="<%=item.href%>" data-src="<%=item.src%>" data-img-id="<%=item.id%>" data-img-title="<%=item.title%>"/></div><%}%></div></div></div>',itemCls:".cui-slide-img-item",pageSize:1,minSwipe:40,width:0,height:0,onSwitch:a,onSwitchEnd:a,onInit:a}},initialize:function(t){var i;e(t)&&(this.options=$.extend(this.options,t)),i=this.options,this.container=i.container,this.tpl=i.tpl,this.container&&this.container.length&&(this.render(i.source,i.currentIndex),this._isInteractive()&&this._bindEvents(),i.autoplay&&this._autoplay())},_isInteractive:function(){var t=this.options;return t.pageSize<t.source.length},_createLayout:function(){var t=this.source;this.container.html(_.template(this.tpl)({data:t}))},_autoplay:function(){var t=this;clearTimeout(this.__autoplayTimer),this.__autoplayTimer=setTimeout(function(){t.next(!0),t._autoplay()},this.options.autoplay)},_bindEvents:function(){var t=this._runtime,i=this.container;this.__moveHandler=$.proxy(this.__moveHandler,this),i.on("touchmove",this.__moveHandler),this.__touchStartHandler=$.proxy(this.__touchStartHandler,this),i.on("touchstart",this.__touchStartHandler),this.__touchEndHandler=$.proxy(this.__touchEndHandler,this),i.on("touchend",this.__touchEndHandler),this.__transitionEndHandler=$.proxy(this.__transitionEndHandler,this),t.root.on(l+"TransitionEnd",this.__transitionEndHandler)},_unbindEvents:function(){var t=this._runtime,i=this.container;i.off("touchmove",this.__moveHandler),i.on("touchstart",this.__touchStartHandler),i.on("touchend",this.__touchEndHandler),t.root.off(l+"TransitionEnd",this.__transitionEndHandler)},_current:0,count:function(){return this.source.length},render:function(t,i){clearTimeout(this.__autoplayTimer);var n=this.options;return this.source=t,this._createLayout(t),this.items=this.container.find(n.itemCls),this._runtime=this._getRuntimeEnv(),this.items.css("width",this._runtime.width),this._showCurrent(this._runtime.root,i),this._prefetch(n.direction),n.onInit.call(this,this._current),this},current:function(){return this._current},next:function(t){this.goto(this._current+this.options.pageSize,s.LEFT,t)},prev:function(){this.goto(this._current-this.options.pageSize,s.RIGHT)},play:function(){this.options.autoplay&&this._autoplay()},pause:function(){clearTimeout(this.__autoplayTimer)},stop:function(){clearTimeout(this.__autoplayTimer),this.goto(0)},"goto":function(t,i,n){var e=this,o=this._runtime,r=this.options,a=r.direction,h=r.autoplay&&n,c=o.count,u=o.width;h&&(0>t?t=c-1:t>=c&&(t=0)),t>=0&&c>t?(s.animate(o.root,a*u*this._current,a*u*t,this.options.animationDuration),this._current=t,this._prefetch(i),setTimeout(function(){e.options.onSwitch.call(e,t,e.source[t])},10)):this.goto(this._current)},_showCurrent:function(t,i){var n=this._runtime;s.translate(n.root,this.options.direction*n.width*i,0),this._current=i,this._prefetch()},_prefetch:function(t){if(!(this.options.prefetch<0)){t||(t=s.LEFT);var i,n=this._current,e=this.options.prefetch,r=e*t;do i=this.items[n+e-r*t],i=i&&i.children[0],i&&o(i);while(r-=t)}},_getSwipeDirection:function(t,i){var n,e=i-t,o=Math.abs(e);return o>0&&o>this.options.minSwipe&&(n=e/o),n},_getRuntimeEnv:function(){var t=this.items,i=this.options,n=$(t[0]),e=n.parent(),o=e.parent(),s=o.offset(),r=this.count();return{width:i.width||s.width,root:e,stage:o,count:r}},__touchStartHandler:function(t){var i=t.touches[0],n=this._getRuntimeEnv().root,e=n.css(u+"transform").match(c);e=e&&e[0]||0,this.__lastTouchStartPos={left:Number(e),x:i.pageX,y:i.pageY,t:+new Date}},__touchEndHandler:function(t){var i=this.__lastTouchStartPos,n=this._getSwipeDirection(i.x,t.changedTouches[0].pageX);this[n===s.LEFT?"next":n===s.RIGHT?"prev":"goto"]()},__transitionEndHandler:function(t){var i=this._current,n=this;setTimeout(function(){n.options.onSwitchEnd.call(n,t,i,n.source[i])},10)},__moveHandler:function(t){if(t.preventDefault(),!(t.touches.length>1||t.scale&&1!==t.scale)){var i=t.touches[0],n=this._getRuntimeEnv(),e=n.root,o=this.__lastTouchStartPos,r=o.left+i.pageX-o.x;s.translate(e,r,0)}}}),s.LEFT=-1,s.RIGHT=1,s.translate=function(t,i,n){var e=t[0],o=e&&e.style;o&&(t.css(u+"transition",n+"ms ease-out"),t.css(u+"transform","translate("+i+"px,0) translateZ(0)"))},s.animate=function(t,i,n,e){this.translate(t,n,e)},n.register({name:r,fn:s}))});