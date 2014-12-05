define(["TuanApp","c","cUtilityCrypt","cUIAlert","TuanBaseView","cCommonPageFactory","StoreManage","StringsData","cHybridFacade","cHybridShell","cWidgetGuider","cUtility","cGeoService","cWidgetFactory","TuanStore","TuanModel","LazyLoad","text!HomeTpl","cWidgetGeolocation","bridge"],function(t,e,i,a,r,n,o,c,s,l,d,h,u,y,g,p,f,m){var C,w,A=h.isInApp(),v=p.TuanHotListModel.getInstance(),b=g.GroupSearchStore.getInstance(),I=g.GroupCategoryFilterStore.getInstance(),k=g.GroupCustomFilters.getInstance(),S=g.TuanHistoryCityListStore.getInstance(),N=g.GroupGeolocation.getInstance(),L=g.TuanPositionStore.getInstance(),T=p.TuanLocalCityInfo.getInstance(),P=p.BannerSearch.getInstance(),G=p.BannerClassModel.getInstance(),H=y.create("Guider"),x=_.template('<%_.each(ads, function(ad){%><li data-id="<%=ad.toUrl%>"><a href="javascript:;"><img src="<%=ad.imgUrl%>" /></a></li><%})%>'),B="TUAN_IGNORE_CITY_CHANGE",E="http://m.ctrip.com/m/c312",F="55559355",J="",D=function(){},R="携程旅行网触屏版-酒店团购",O=u.GeoLocation,U=n.create("TuanBaseView");return C=U.extend({pageid:"214019",hpageid:"215019",hasAd:!0,locating:!1,geoCallback:{status:0,type:0,cancelNearby:0},events:{"click .pro_list>li[data-id]":"detailHandler","click .list_s>.list_s_input":"showKeywordSearch","click .js_qr_link>li":"goListByType","click .base_btn01":"goList","click #J_allTuan":"goList","click .ad_link>li":"onBannerClick","click #js_reload":"getGroupListData"},onCreate:function(){var e=this.$el;this.listWrap=e.find("#J_hotSaleWrap"),this.itemRenderFn=_.template(m),A&&(e.find("#J_searchBoxWrap").addClass("hybrid"),t.initVoiceSearch&&t.initVoiceSearch(e.find("#J_voiceTrigger")))},isNearBy:function(){return b.getAttr("nearby")||S.getAttr("nearby")},setHeader:function(e){var i=this,a=e+"团购";this.setTitle(R),this.header.set({customtitle:'<h1 id="J_headerTitle"><div id="J_cityBtn" class="list_hd_button"><em class="header_mutrow">'+a+'</em><i class="i_tri"></i></div></h1>',citybtn:a,back:!0,view:this,tel:null,home:!0,events:{returnHandler:function(){return A?t.backToLastPage():t.tHome()},homeHandler:$.proxy(i.homeHandler,i),citybtnHandler:function(){i.showCityPage()}}}),this.header.show(),!A&&this.header.root.find("#J_cityBtn").on("click",$.proxy(i.showCityPage,this))},onShow:function(){this.LazyLoad=new f({wrap:this.$el})},onHide:function(){O.UnSubscribe("tuan/home"),v.abort(),this.alert.hide(),this.listWrap.html(J),this.LazyLoad.unbindEvents(),this.$el.find(".ad_link").hide(),this.hideOfflineAlert(),this.hideSwitchAlert()},getCityFromAppCached:function(t){return A?void l.Fn("get_cached_ctrip_city",function(e){var i;e?(i=e.CityEntities[0],setTimeout(function(){t({id:i.CityID,name:i.CityName})},0)):t()}).run():void t()},onLoad:function(t){this.tplLoading=Lizard.T("J_Loading"),this.tplReload=Lizard.T("J_Reload"),this.tplNoproduct=Lizard.T("J_NoGroupProduct"),this.listWrap.html(this.tplLoading),t=this.getLastViewName();var e=this;this.getCityFromAppCached(function(i){i&&(c.defaultCity=i);var a=c.defaultCity,r=b.get(),n=r.ctyId||a.id,o=r.ctyName||a.name,l="citylist"==t||"detail"==t||"list"==t||"keywordsearch"==t||1==sessionStorage.getItem(B);+b.getAttr("ctyId")<=0&&(b.setAttr("ctyId",a.id),b.setAttr("ctyName",a.name)),e.setHeader(o),e.getBannerSearch(n);try{e.getGroupListData()}catch(d){}l||(e.geoCallback.type=0,e.locateInterface()),A&&s.request({name:s.METHOD_SET_NAVBAR_HIDDEN,isNeedHidden:!1}),e.updateAdInfo()})},getSelectedCity:function(){return{id:b.getAttr("ctyId")||c.defaultCity.id,name:b.getAttr("ctyName")||c.defaultCity.name}},goNearbyGroup:function(t,e){var i,a,r,n=b.get();if(o.clearAll(),e)if("nearby"==e)k.setAttr("distance",{val:c.SEARCH_DISTANCE,txt:c.SEARCH_DISTANCE_TEXT});else{var s=this.$el.find('.js_qr_link li[data-category="'+e+'"]');i=s.attr("data-id"),r=s.attr("data-type"),b.setAttr("ctype",r),b.setAttr("ctyId",n.ctyId),b.setAttr("ctyName",n.ctyName),I.setAttr("tuanType",r),I.setAttr("category",s.attr("data-category")),I.setAttr("name",s.attr("data-name")),I.setAttr("tuanTypeIndex",+i>0?+i:0)}S.setAttr("nearby",!0),a=o.getGroupQueryParam(),b.setAttr("qparams",a),this.forwardJump("list","/webapp/tuan/list")},getGroupListData:function(){this.listWrap.html(this.tplLoading);var e=b.get(),i=this,a={};a.ctyId=e.ctyId,a.environment=t.environment,v.abort(),v.setParam(a),v.excute(function(t){var e=t;this.isLoading=!1,t&&t.products&&t.count&&+t.count>0?i.renderList(e):this.listWrap.html(this.tplNoproduct)},function(){this.listWrap.html(this.tplReload)},!0,this)},renderList:function(t){var e=this.itemRenderFn(t);t.count&&+t.count>0&&(this.listWrap.html(e),this.LazyLoad&&this.LazyLoad.updateDom())},detailHandler:function(t){var e=$(t.currentTarget).attr("data-id"),i=b.getAttr("ctyId");this.forwardJump("detail","/webapp/tuan/detail/"+e+".html"+(i?"?cityid="+i:""))},homeHandler:function(){t.tHome()},goList:function(e){var i,a,r,n,c=b.get();b.setAttr("from_feature",0),o.clearAll(),S.removeAttr("nearby"),e&&(n=this.$el.find('.js_qr_link li[data-category="'+e+'"]'),r=n.attr("data-id"),a=n.attr("data-type"),"onepaygroup"!=e&&(b.setAttr("ctype",a),I.setAttr("tuanType",a),I.setAttr("category",n.attr("data-category")),I.setAttr("name",n.attr("data-name")),I.setAttr("tuanTypeIndex",+r>0?+r:0)),"onepaygroup"==e&&(k.setAttr("price.val","1|1"),k.setAttr("price.txt","一元团购")),"weeknew"==e&&(b.setAttr("sortRule","1"),b.setAttr("sortType","1"))),i=o.getGroupQueryParam(),b.setAttr("qparams",i),b.setAttr("ctyId",c.ctyId),b.setAttr("ctyName",c.ctyName);var s=this;return"feature"===e?void this.getBannerClass(function(e){var i=e[c.ctyId];i?t.jumpToPage(i,s):s.forwardJump("localfeature","/webapp/tuan/localfeature")},function(){s.forwardJump("localfeature","/webapp/tuan/localfeature")}):void this.forwardJump("list","/webapp/tuan/list")},goListByType:function(t){var e=$(t.currentTarget);e.attr("data-category")||(e=e.parent("li"));var i=e.attr("data-category");"hotel"==i||"catering"==i||"ticket"==i||"entertainment"==i||"nearby"==i?(this.geoCallback.type=i,this.geoCallback.cancelNearby=0,this.showLoading(),this.locateInterface()):"redenvelope"==i?this.goRedEnvelope():this.goList(i)},goRedEnvelope:function(){var e="http://"+(t.isProduction?"pages.ctrip.com":"pages.dev.sh.ctriptravel.com"),a=e+"/commerce/promote/201411/hotel/hbh5/packet.html?t="+(new Date).getTime(),r=JSON.parse(localStorage.getItem("USERINFO"));r&&r.data&&r.data.Auth&&(a+="&token="+encodeURIComponent(i.Base64.encode(JSON.stringify({auth:r.data.Auth})))),t.jumpToPage(a,self)},showCityPage:function(){this.forwardJump("citylist","/webapp/tuan/citylist")},showKeywordSearch:function(){var t=b.get();o.clearAll();var e=o.getGroupQueryParam();b.setAttr("qparams",e),b.setAttr("ctyId",t.ctyId),b.setAttr("ctyName",t.ctyName),this.forwardJump("keywordsearch","/webapp/tuan/keywordsearch")},onBannerClick:function(e){var i=$(e.currentTarget),a=i.attr("data-id");a&&t.jumpToPage(a,this)},getBannerSearch:function(t){P.setParam("cid",t),P.excute(function(t){var e=this.$el.find(".ad_link"),i=t&&t.banners;!i||2!=i.length&&4!=i.length?(e.hide(),e.html("")):(e.html(x({ads:i})),e.show())},function(){},!0,this)},updateAdInfo:function(){var t=this.footer,e=t&&t.rootBox,i=e&&e.find("#dl_app");i&&i.length&&(i.attr("data-appurl","ctrip://wireless?v=2&extendSourceID="+F),e.find("#app_link").attr("href",E))},locateInterface:function(){this.geoCallback.cancelNearby=0,this.checkPositionCache()||this.checkNetwork(this.getPosition)},checkPositionCache:function(){var t=!1,e=L.get();if(e&&e.cityId&&e.cityName){var i={cityId:e.cityId,cityName:e.cityName,hasGroupProduct:e.hasGroupProduct};this.geoCallback.status=1,this.locatedCallback(i),t=!0}return t},checkNetwork:function(t){var e=this;A?H.app_check_network_status({callback:function(i){var a=i&&i.hasNetwork;return a?void(t&&t.call(e)):void e.showOfflineAlert()}}):t&&t.call(e)},getPosition:function(){var t=this;1==this.geoCallback.type&&(this.geoCallback.cancelNearby=0,w=new e.ui.LoadingLayer(function(){t.geoCallback.cancelNearby=1,this.hide()},"定位中..."),w.show()),this.locating!==!0&&(this.locating=!0,O.Subscribe("tuan/home",{onComplete:function(e){this.locating=!1,e.city=e.city.replace("市市","市"),e.city.length>2&&(e.city=e.city.replace("市","")),L.set(e),N.setAttr("gps",e);var i={lng:e.lng,lat:e.lat,district:e.district,city:e.city,province:e.province,isOverseas:"中国"!=e.country};"nearby"==t.geoCallback.type?(t.geoCallback.status=1,t.locatedCallback(i)):t.getCityInfo(i,t.locatedCallback)},onError:this.geoError,onPosComplete:D,onPosError:this.geoError},this,!0))},geoError:function(){var t=this.geoCallback.type;return!t||"hotel"!=t&&"catering"!=t&&"ticket"!=t&&"entertainment"!=t?(this.locating=!1,L.set(null),w&&w.hide(),this.showSwitchCityAlert("无法获取您的城市，您可以选择其他城市"),void this.hideLoading()):void this.goList(t)},getCityInfo:function(t,e){var i=this;T.setParam({lng:t.lng,lat:t.lat,district:encodeURIComponent(t.district),cityname:encodeURIComponent(t.city),province:encodeURIComponent(t.province),isOverseas:t.isOverseas}),T.excute(function(t){var a;i.locating=!1,t&&t.CityID&&t.CityID>0&&(o.setCurrentCity(t),a={cityId:t.CityID,cityName:t.CityName,hasGroupProduct:t.HasGroupProduct},L.setAttr("cityId",t.CityID),L.setAttr("cityName",t.CityName),L.setAttr("hasGroupProduct",t.HasGroupProduct)),i.geoCallback.status=1,"function"==typeof e&&e.call(i,a)},function(){i.geoCallback.status=0,"function"==typeof e&&e.call(i)},!1,this)},getCityFailed:function(){this.locating=!1,L.setAttr("cityId",null),L.setAttr("cityName",null),this.showSwitchCityAlert("无法获取您的城市，您可以选择其他城市")},promptSwitchCity:function(t){var e=this,i=e.getSelectedCity();1!=sessionStorage.getItem(B)&&(t&&t.cityId&&t.cityName?(1!=sessionStorage.getItem(B)&&i.id>0&&i.id!=t.cityId&&(t.hasGroupProduct?(this.switchCity1=new a({title:"提示",message:"目前您的定位在"+t.cityName+"，是否切换?",buttons:[{text:"取消",click:function(){e.recordSwitchCityFlag(),this.hide()}},{text:"切换",click:function(){e.recordSwitchCityFlag();var i=t.cityId;b.setAttr("ctyId",i),b.setAttr("ctyName",t.cityName),e.setHeader(t.cityName),e.getGroupListData(),e.getBannerSearch(i),this.hide()}}]}),this.switchCity1.show()):this.showSwitchCityAlert("您所在的城市暂无团购产品<br/>您可以选择其他城市")),i.id!=t.cityId&&e.recordSwitchCityFlag()):this.showSwitchCityAlert("无法获取您的城市，您可以选择其他城市"))},recordSwitchCityFlag:function(){sessionStorage.setItem(B,1)},otherLocatedHandler:function(t,e,i){var a=this;1===e?"nearby"==t?a.goNearbyGroup(i,t):i.cityId==b.getAttr("ctyId")?a.goNearbyGroup(i,t):a.goList(t):0===e&&("nearby"==t?a.getCityFailed():a.goList(t))},locatedCallback:function(t){var e=this.geoCallback.type,i=this.geoCallback.status,a=this.geoCallback.cancelNearby,r=this;if(0===e)1===i?r.promptSwitchCity(t):0===i&&r.getCityFailed();else{if(a)return;w&&w.hide(),r.otherLocatedHandler(e,i,t)}},getBannerClass:function(t,e){this.showLoading(),G.excute(function(e){this.hideLoading();var i={};_.each(_.filter(e.Banner||[],function(t){return 14===t.type}),function(t){return i[t.cityid]=$.trim(t.url)}),t&&t(i)},function(){this.hideLoading(),e&&e()},!1,this,function(){this.hideLoading()})},showOfflineAlert:function(){this.offlineAlert=new a({title:"提示",message:"未连接到互联网，请检查网络设置<br/>您也可以拨打携程客服电话咨询",buttons:[{text:"知道了",click:function(){this.hide()}},{text:"拨打电话",click:function(){H.callService(),this.hide()}}]}),this.offlineAlert.show()},hideOfflineAlert:function(){this.offlineAlert&&this.offlineAlert.hide()},showSwitchCityAlert:function(t){var e=this;this.switchCity=new a({title:"提示",message:t,buttons:[{text:"取消",click:function(){e.recordSwitchCityFlag(),this.hide()}},{text:"选择城市",click:function(){e.recordSwitchCityFlag(),e.showCityPage(),this.hide()}}]}),this.switchCity.show()},hideSwitchAlert:function(){this.switchCity&&this.switchCity.hide(),this.switchCity1&&this.switchCity1.hide()}})});