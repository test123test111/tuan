define(["cBase"],function(e){function n(e){this.options={wrap:null,cursor:null,cursorCls:"",turnOnCls:"active",html:"<i>关</i>",isTurnOn:!1,onChange:t},this.initialize(e),this.turn(this.isTurnOn,!0)}var t=function(){},n,r=$.extend;return n.prototype={initialize:function(e){r(this.options,e),this.isTurnOn=this.options.isTurnOn,this.wrap=this.options.wrap,this.wrap&&this.renderHTML(),this.options.cursor?this.cursor=this.options.cursor:this.cursor=this.wrap.find(this.options.cursorCls),this.bindEvents()},renderHTML:function(){this.wrap.html(this.options.html)},bindEvents:function(){var e=this.cursor,t=this;this._clickHandler=function(){t.turn()},e&&e.length&&e.parent().bind("click",this._clickHandler)},unbindEvents:function(){this.cursor.parent().unbind("click",this._clickHandler)},turn:function(e){var t,n=this.options;e===undefined?t=!this.isTurnOn:t=e;try{this.wrap&&this.wrap[t?"addClass":"removeClass"](n.turnOnCls),n.onChange.call(this,t),this.isTurnOn=t}catch(r){TuanApp.app.curView.showToast(r)}},on:function(){this.turn(!0)},off:function(){this.turn(!1)}},n});