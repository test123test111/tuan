define(["PageHistory"],function(){var i=/^ctrip:\/\//i,t=/(.*)\/webapp\/(\w+)\/(.*)/,e=/^#\w/i;window._log={stash:[],log:function(i){this.stash.push(i?JSON.stringify(i):i)}};var n={init:function(){this.saveUnion()},showLoading:function(){this.loading.show()},hideLoading:function(){this.loading.hide()},isInternalPage:function(i){return i.toLowerCase().indexOf("/tuan/")>-1},back:function(i){var t=this.lastUrl();t?(this.app.history.pop(),this.isInternalPage(t)?location.hash=t.split("#")[1]||"home":location.replace(t)):(i?(-1==i.indexOf("#")&&(i="#"+i),this.app.curView.jump(i)):window.history.go(-1),this.app.history=[])},lastUrl:function(){var i=this.app.history,t=i.length,e=t&&i[t-2]||"";return e},parsePageURL:function(n){if(!n)return!1;var r,o={module:"",link:n,isNative:!1,isInternal:!1,domain:document.domain};return n.match(e)?(o.module="tuan",o.isInternal=!0,o):n.match(i)?(o.domain="ctrip",o.isNative=!0,o):(r=t.exec(n),r&&(o.module=r[2],o.link=r[3],o.isInternal=!0),o)},gotoExternalPage:function(i,t){require(["cUtility","cWidgetFactory","cWidgetGuider"],function(e,n){var r=n.create("Guider");e.isInApp()?r.cross({path:i,param:t}):location.href=location.protocol+"//"+location.host+"/webapp/"+i+"/"+t})},jumpToPage:function(i,t){if(i){var e=this,n=e.parsePageURL(i);require(["cUtility","cWidgetFactory","cWidgetGuider"],function(e,r){var o=r.create("Guider"),a=e.isInApp();return a?n.isInternal?void("tuan"==n.module?t.forwardJump(n.link.split("/")[0],"/webapp/tuan/"+n.link):o.cross({path:n.module,param:n.link})):void o.jump({targetModel:n.isNative?"app":"h5",url:n.link,title:document.title}):void(location.href=i)})}},getQuery:function(i){return Lizard.P(i)},saveUnion:function(i){require(["CommonStore"],function(t){var e=t.UnionStore&&t.UnionStore.getInstance(),r=n.getQuery("PartnerID"),o=n.getQuery("Source"),a=n.getQuery("AllianceID"),c=n.getQuery("SID"),u=n.getQuery("OUID"),s=e.get();o||a?s&&s.AllianceID==a&&s.SID==c&&s.OUID==u&&s.Source==o&&s.PartnerID==r||e.set({AllianceID:a,SID:c,OUID:u,Source:o,PartnerID:r,targetTuan:!0}):i===!0&&""!==document.referrer&&document.referrer.indexOf("/html5")>0&&s&&s.targetTuan===!0&&e.remove()})},initVoiceSearch:function(i){require(["cWidgetFactory","VoiceSearch"],function(t){var e=t.create("VoiceSearch");return new e(i)})},environment:0,tHome:function(){require(["cUtility","cWidgetFactory","cWidgetGuider"],function(i,t){var e=t.create("Guider"),n=i.isInApp();n?e.home():location.href=location.protocol+"//"+location.host+"/html5"})},backToLastPage:function(){require(["cWidgetFactory","cWidgetGuider"],function(i){var t=i.create("Guider");t.backToLastPage({param:JSON.stringify({biz:"tuan",refresh:"1"})})})},isOverOS7:function(){return $.os&&$.os.ios&&parseInt($.os.version,10)>=7},isProduction:!0};return require(["libs","cUtility","cWidgetFactory","cHybridFacade","cWidgetGuider"],function(i,t,e,r){var o=e.create("Guider");if(n.init(),t.isInApp()&&(_.isFunction(o.app_check_network_status)&&o.app_check_network_status({callback:function(i){n.environment="WIFI"===i.networkType?0:1}}),o.register({tagname:r.METHOD_APP_NETWORK_DID_CHANGED,callback:function(i){n.environment="WIFI"===i.networkType?0:1}})),t.isInApp()){var a=t.isPreProduction();("0"===a||"1"===a||"2"===a)&&(n.isProduction=!1)}else location.host.match(/^(m|3g|wap)\.ctrip\.com/i)||(n.isProduction=!1);!function(){var i,t,e=0;!n.isProduction&&$(document).on("click",function(){e++,i&&clearTimeout(i),i=setTimeout(function(){e>=5&&(!t&&require(["ConsoleDebug"],function(i){t=new i}),t&&t.show()),e=0},350)})}()}),window.noPic=function(i){i&&(i.src="http://pic.c-ctrip.com/common/pic_alpha.gif",i.onerror=null)},n});