define(["cBase","cUICore","cWidgetFactory","libs"],function(o,t,n){function e(o){return o===Object(o)}var i,s="POIWidget",r=function(){},c=null;i=new o.Class({__propertys__:function(){this.options={model:c,source:3,params:{},onSuccess:r,onError:r}},initialize:function(o){var t;e(o)&&(this.options=$.extend(this.options,o)),t=this.options,this.model=t.model},query:function(o,t,n,s){var r=this,c=r.options,a=c.params;e(t)&&(t=$.extend(a,t)),a.posty=c.source,a.ctype=o||i.ALL,this.model.setParam(t),this.model.excute(function(o){(n||c.onSuccess).call(r,o)},function(o){(s||c.onError).call(r,o)},!1,r)},abort:function(){this.options.model.abort()}}),i.ALL=0,i.HOTEL=1,i.CATERING=2,i.VACATION=3,i.TICKIT=4,n.register({name:s,fn:i})});