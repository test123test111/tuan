define(["c","cStore","cPageView","cCommonListPage","cUtility","cCommonPageFactory","PageHistory","cWidgetGuider","cUtility"],function(e,t,i,a,s,n,o,r,c){var g="TuanBaseView",u="TuanBaseListView",h=c.isInApp();if(!n.hasPage(g)&&!n.hasPage(u)){var f=new e.base.Class(t,{__propertys__:function(){this.key="P_TUAN_BURN_AFTER_READING",this.lifeTime="1H",this.defaultData={}},initialize:function($super){$super()},setOneMessage:function(e,t){this.setAttr(e,t)},getOneMessage:function(e){var t=this.getAttr(e);return t&&this.setAttr(e,""),t}}),l=f.getInstance(),d=d||{};d={"super":i.prototype,show:function(){var e=o.getLatelyView(this.getViewName())||"";this.lastViewId=e,this.__onLoad(e),this.super.show.apply(this,arguments),this.__onShow(e)},hide:function(){this.super.hide.apply(this,arguments),this.__onHide(arguments)},getViewName:function(){return this.config&&this.config.viewName},__onLoad:function(){o.confirmForward(this.getViewName()),o.addHistory(this.getViewName(),location.href,2)},__onShow:function(){},__onHide:function(){},getHistory:function(){return o},back:function(e,t){if(h&&1==Lizard.P("from_native_page"))return void r.backToLastPage({param:JSON.stringify({biz:"tuan",refresh:"1"})});this.setOneMessage("__lastViewName__",this.getViewName());var i=o.back(this.getViewName(),e);if(void 0===t&&(t=!1),i.jump)location.href=i.fullurl;else if(s.isInApp()){var a=/#(.*)$/.exec(i.fullurl);a&&a.length>1&&a[1]?Lizard.goTo(a[1],{viewName:i.id,cache:"list"==i.id?!0:t}):Lizard.goTo(i.fullurl,{viewName:i.id,cache:"list"==i.id?!0:t})}else Lizard.goTo(i.fullurl,{viewName:i.id,cache:"list"==i.id?!0:t})},popById:function(e){var t=o.popById(e);t||o.clearHistory()},clearHistory:function(e,t){o.clearHistory(e,t)},forwardJump:function(e,t,i,a,s){if(this.setOneMessage("__lastViewName__",this.getViewName()),_.isObject(i)&&(i=!1),i)t=o.forward(e,t,1,a),this.jump(t);else{t=o.forward(e,t,2,a);var n={viewName:e};s&&(n.cache=!0),Lizard.goTo(t,n)}},getLastViewName:function(){return this.getOneMessage("__lastViewName__")},setOneMessage:function(e,t){l.setOneMessage(e,t)},getOneMessage:function(e){return l.getOneMessage(e)},showMessage:function(e,t){this.alert.setViewData({message:e,title:t,buttons:[{text:"知道了",click:function(){this.hide()}}]}),this.alert.show()}};var m=i.extend(d);n.register({name:g,fn:m});var a=n.create("CommonListPage"),w=a.extend(d);n.register({name:u,fn:w})}});