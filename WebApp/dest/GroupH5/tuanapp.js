define(["PageHistory"],function(){var e=/^ctrip:\/\//i,i=/(.*)\/webapp\/(\w+)\/(.*)/,t=/^#\w/i;window._log=function(){};var n={init:function(){this.saveUnion()},isSEO:"server"===Lizard.renderAt,showLoading:function(){this.loading.show()},hideLoading:function(){this.loading.hide()},isInternalPage:function(e){return e.toLowerCase().indexOf("/tuan/")>-1},back:function(e){var i=this.lastUrl();i?(this.app.history.pop(),this.isInternalPage(i)?location.hash=i.split("#")[1]||"home":location.replace(i)):(e?(-1==e.indexOf("#")&&(e="#"+e),this.app.curView.jump(e)):window.history.go(-1),this.app.history=[])},lastUrl:function(){var e=this.app.history,i=e.length,t=i&&e[i-2]||"";return t},parsePageURL:function(n){if(!n)return!1;var r,o={module:"",link:n,isNative:!1,isInternal:!1,domain:document.domain};return n.match(t)?(o.module="tuan",o.isInternal=!0,o):n.match(e)?(o.domain="ctrip",o.isNative=!0,o):(r=i.exec(n),r&&(o.module=r[2],o.link=r[3],o.isInternal=!0),o)},gotoExternalPage:function(e,i){require(["cUtility","cWidgetFactory","cWidgetGuider"],function(t,n){var r=n.create("Guider");t.isInApp()?r.cross({path:e,param:i}):location.href=location.protocol+"//"+location.host+"/webapp/"+e+"/"+i})},jumpToPage:function(e,i){if(e){var t=this,n=t.parsePageURL(e);require(["cUtility","cWidgetFactory","cWidgetGuider"],function(t,r){var o=r.create("Guider"),a=t.isInApp();return a?n.isInternal?void("tuan"==n.module?i.forwardJump(n.link.split("/")[0],"/webapp/tuan/"+n.link):o.cross({path:n.module,param:n.link})):void o.jump({targetModel:n.isNative?"app":"h5",url:n.link,title:document.title}):void(location.href=e)})}},getQuery:function(e){return Lizard.P(e)},saveUnion:function(e){require(["CommonStore"],function(i){var t=i.UnionStore&&i.UnionStore.getInstance(),r=n.getQuery("PartnerID"),o=n.getQuery("Source"),a=n.getQuery("AllianceID"),c=n.getQuery("SID"),u=n.getQuery("OUID"),l=t.get();o||a?l&&l.AllianceID==a&&l.SID==c&&l.OUID==u&&l.Source==o&&l.PartnerID==r||t.set({AllianceID:a,SID:c,OUID:u,Source:o,PartnerID:r,targetTuan:!0}):1==e&&""!=document.referrer&&document.referrer.indexOf("/html5")>0&&l&&1==l.targetTuan&&t.remove()})},initVoiceSearch:function(e){require(["cWidgetFactory","VoiceSearch"],function(i){var t=i.create("VoiceSearch");new t(e)})},environment:0,tHome:function(){require(["cUtility","cWidgetFactory","cWidgetGuider"],function(e,i){var t=i.create("Guider"),n=e.isInApp();n?t.home():location.href=location.protocol+"//"+location.host+"/html5"})},backToLastPage:function(){require(["cWidgetFactory","cWidgetGuider"],function(e){var i=e.create("Guider");i.backToLastPage({param:JSON.stringify({biz:"tuan",refresh:"1"})})})},isOverOS7:function(){return $.os&&$.os.ios&&parseInt($.os.version,10)>=7}};return require(["libs","cUtility","cWidgetFactory","cHybridFacade","cWidgetGuider"],function(e,i,t,r){var o=t.create("Guider");n.init(),i.isInApp()&&(_.isFunction(o.app_check_network_status)&&o.app_check_network_status({callback:function(e){n.environment="WIFI"===e.networkType?0:1}}),o.register({tagname:r.METHOD_APP_NETWORK_DID_CHANGED,callback:function(e){n.environment="WIFI"===e.networkType?0:1}})),function(){var e,t,n,r;if(i.isInApp()?(t=i.isPreProduction(),("0"===t||"1"===t||"2"===t)&&(n=!0)):location.host.match(/^(m|3g|wap)\.ctrip\.com/i)||(n=!0),n){e=$('<i style="position:fixed;bottom:300px;color:green;z-index:9999;">CL</i>').appendTo("#main"),e.on("click",function(){!r&&require(["ConsoleDebug"],function(e){r=new e}),r&&r.show()});var o=setInterval(function(){var e=$(".dl_panel-bg .dl_btn-close");e&&e.length&&(e.trigger("click"),clearInterval(o))},100)}}()}),window.noPic=function(e){e&&(e.src="http://pic.c-ctrip.com/common/pic_alpha.gif",e.onerror=null)},n});