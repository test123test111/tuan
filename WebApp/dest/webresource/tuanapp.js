define(["PageHistory"],function(e){var t=/^ctrip:\/\//i,n=/(.*)\/webapp\/(\w+)\/(.*)/,r=/^#\w/i,i={init:function(){this.saveUnion()},isSEO:Lizard.renderAt==="server",showLoading:function(){this.loading.show()},hideLoading:function(){this.loading.hide()},isInternalPage:function(e){return e.toLowerCase().indexOf("/tuan/")>-1},back:function(e){var t=this.lastUrl();t?(this.app.history.pop(),this.isInternalPage(t)?location.hash=t.split("#")[1]||"home":location.replace(t)):(e?(e.indexOf("#")==-1&&(e="#"+e),this.app.curView.jump(e)):window.history.go(-1),this.app.history=[])},lastUrl:function(){var e=this.app.history,t=e.length,n=t&&e[t-2]||"";return n},parsePageURL:function(e){if(!e)return!1;var i={module:"",link:e,isNative:!1,isInternal:!1,domain:document.domain},s;return e.match(r)?(i.module="tuan",i.isInternal=!0,i):e.match(t)?(i.domain="ctrip",i.isNative=!0,i):(s=n.exec(e),s&&(i.module=s[2],i.link=s[3],i.isInternal=!0),i)},gotoExternalPage:function(e,t){require(["cUtility","cWidgetFactory","cWidgetGuider"],function(n,r){var i=r.create("Guider");n.isInApp()?i.cross({path:e,param:t}):location.href=location.protocol+"//"+location.host+"/webapp/"+e+"/"+t})},jumpToPage:function(e,t){if(!e)return;var n=this,r=n.parsePageURL(e);require(["cUtility","cWidgetFactory","cWidgetGuider"],function(n,i){var s=i.create("Guider"),o=n.isInApp();if(!o){location.href=e;return}if(r.isInternal){r.module=="tuan"?t.forwardJump(r.link.split("/")[0],"/webapp/tuan/"+r.link):s.cross({path:r.module,param:r.link});return}s.jump({targetModel:r.isNative?"app":"h5",url:r.link,title:document.title})})},getQuery:function(e){return Lizard.P(e)},saveUnion:function(e){require(["CommonStore"],function(t){var n=t.UnionStore&&t.UnionStore.getInstance(),r=i.getQuery("PartnerID"),s=i.getQuery("Source"),o=i.getQuery("AllianceID"),u=i.getQuery("SID"),a=i.getQuery("OUID"),f=n.get();!s&&!o?e==1&&document.referrer!=""&&document.referrer.indexOf("/html5")>0&&f&&f.targetTuan==1&&n.remove():(!f||f.AllianceID!=o||f.SID!=u||f.OUID!=a||f.Source!=s||f.PartnerID!=r)&&n.set({AllianceID:o,SID:u,OUID:a,Source:s,PartnerID:r,targetTuan:!0})})},initVoiceSearch:function(e){require(["cWidgetFactory","VoiceSearch"],function(t){var n=t.create("VoiceSearch");new n(e)})},environment:0,tHome:function(){require(["cUtility","cWidgetFactory","cWidgetGuider"],function(e,t){var n=t.create("Guider"),r=e.isInApp();r?n.home():location.href=location.protocol+"//"+location.host+"/html5"})},backToLastPage:function(){require(["cWidgetFactory","cWidgetGuider"],function(e){var t=e.create("Guider");t.backToLastPage({param:JSON.stringify({biz:"tuan",refresh:"1"})})})}};return require(["libs","cUtility","cWidgetFactory","cHybridFacade","cWidgetGuider"],function(e,t,n,r){var s=n.create("Guider");i.init(),t.isInApp()&&(_.isFunction(s.app_check_network_status)&&s.app_check_network_status({callback:function(e){i.environment=e.networkType==="WIFI"?0:1}}),s.register({tagname:r.METHOD_APP_NETWORK_DID_CHANGED,callback:function(e){i.environment=e.networkType==="WIFI"?0:1}}))}),window.noPic=function(e){e&&(e.src="http://pic.c-ctrip.com/common/pic_alpha.gif",e.onerror=null)},i});