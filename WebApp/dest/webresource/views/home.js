define(["TuanApp","c","cUIAlert","TuanBaseView","cCommonPageFactory","StoreManage","cHybridFacade","cWidgetGuider","cUtility","cGeoService","cWidgetFactory","TuanStore","TuanModel","LazyLoad","LocalFeature","text!HomeTpl","cWidgetGeolocation"],function(e,t,n,r,i,s,o,u,a,f,l,c,h,p,d,v){var m=a.isInApp(),g=h.TuanHotListModel.getInstance(),y=c.GroupSearchStore.getInstance(),b=c.GroupCategoryFilterStore.getInstance(),w=c.GroupCustomFilters.getInstance(),E=c.TuanHistoryCityListStore.getInstance(),S=c.GroupGeolocation.getInstance(),x=c.TuanPositionStore.getInstance(),T=h.TuanLocalCityInfo.getInstance(),N=c.TuanHistoryKeySearchStore.getInstance(),C=h.BannerSearch.getInstance(),k=h.BannerClassModel.getInstance(),L,A=l.create("Guider"),O={id:2,name:"上海"},M=_.template('<%_.each(ads, function(ad){%><li data-id="<%=ad.toUrl%>"><a href="javascript:;"><img src="<%=ad.imgUrl%>" /></a></li><%})%>'),D=4,P=D+"公里内",H=3,B="TUAN_IGNORE_CITY_CHANGE",j="http://m.ctrip.com/m/c312",F="55559355",I="",q=f.GeoLocation,R,U=i.create("TuanBaseView");return L=U.extend({pageid:"214019",hpageid:"215019",hasAd:!0,locating:!1,geoCallback:{status:0,type:0,cancelNearby:0},events:{"click .pro_list>li[data-id]":"detailHandler","click .list_s>.list_s_input":"showKeywordSearch","click .js_qr_link>li":"goListByType","click .base_btn01":"goList","click #J_allTuan":"goList","click .ad_link>li":"onBannerClick","click #js_reload":"getGroupListData"},onCreate:function(){var t=this.$el;this.listWrap=t.find("#J_hotSaleWrap"),this.itemRenderFn=_.template(v),m&&(t.find("#J_searchBoxWrap").addClass("hybrid"),e.initVoiceSearch&&e.initVoiceSearch(t.find("#J_voiceTrigger")))},isNearBy:function(){return y.getAttr("nearby")||E.getAttr("nearby")},setHeader:function(t){var n=this,r=t+"团购";this.header.set({customtitle:'<h1 id="J_headerTitle"><div id="J_cityBtn" class="list_hd_button"><em class="header_mutrow">'+r+'</em><i class="i_tri"></i></div></h1>',citybtn:r,back:!0,view:this,tel:null,home:!0,events:{returnHandler:function(){m?A.home():e.tHome()},homeHandler:$.proxy(n.homeHandler,n),citybtnHandler:function(){n.showCityPage()}}}),this.header.show()},onShow:function(){this.LazyLoad=new p({wrap:this.$el})},onHide:function(){q.UnSubscribe("tuan/home"),g.abort(),this.alert.hide(),this.listWrap.html(I),this.LazyLoad.unbindEvents(),this.hideLoading()},onLoad:function(e){this.tplLoading=Lizard.T("J_Loading"),this.tplReload=Lizard.T("J_Reload"),this.tplNoproduct=Lizard.T("J_NoGroupProduct"),this.listWrap.html(this.tplLoading),this._refer=e,e=this.getLastViewName();var t=this,n=y.get(),r=n.ctyId||O.id,i=n.ctyName||O.name;this.setHeader(i||t.isNearBy()&&"我附近的"||O.name),this.header.root.find("#J_cityBtn").on("click",$.proxy(t.showCityPage,this)),this.getBannerSearch(r);try{t.getGroupListData()}catch(s){}var u=e=="citylist"||e=="detail"||e=="list"||e=="keywordsearch"||sessionStorage.getItem(B)==1;u||(this.geoCallback.type=0,this.locateInterface()),m&&o.request({name:o.METHOD_SET_NAVBAR_HIDDEN,isNeedHidden:!1}),this.updateAdInfo()},getCurrentCity:function(e){var t={id:e&&e.ctyId||2,name:e&&e.ctyName||"上海"},n=this.getQuery("cityid");n&&+n>0?t=s.findCityInfoById(n):+t.id>0&&(t=s.findCityInfoById(t.id));if(!t||!t.id)t=O;return t},getSelectedCity:function(){return{id:y.getAttr("ctyId")||O.id,name:y.getAttr("ctyName")||O.name}},createGPS:function(){this.gps=l.create("Geolocation")},getLocalCityInfo:function(e,t,n){var r=this,i=s.getCityIdByName(n),o;if(i){o={CityName:n,CityID:i};if(s.setCurrentCity(o)){this.alertCityChange({name:n||"",id:i});return}}T.setParam({lng:e,lat:t,cityname:encodeURIComponent(n)}),T.excute(_.bind(function(e){var t;r.checkParentCity(e),typeof e!=undefined&&s.setCurrentCity(e)?(t=s.getCurrentCity(),this.alertCityChange({name:t.CityName||t.city,id:t.CityId||t.CityID})):this._autoGPSRequest!=1&&this.alertErrorMsg("提示","定位失败，无效的定位信息！")},this))},checkParentCity:function(e){S.setAttr("isParentCity",!1),e.IsParentCity&&(e.HasGroupProduct?S.setAttr("isParentCity",!0):e.CityID=O.id)},getGeolocation:function(e){this._autoGPSRequest=e,this.gps||this.createGPS(),this._autoGPSRequest!=1&&this.alertErrorMsg("","正在定位，请稍候。"),this._gpsrequest!=1&&(this._gpsrequest=!0,this.gps.requestCityInfo(_.bind(function(e){this._gpsrequest=!1,e.city=e.city.replace("市市","市"),e.city.length>2&&(e.city=e.city.replace("市","")),S.setAttr("gps",e),this.getLocalCityInfo(e.lng,e.lat,e.CityName||e.city)},this),_.bind(function(e){this._gpsrequest=!1,this._autoGPSRequest!=1&&this.alertErrorMsg("提示","无法获取位置信息，您可在设置中开启定位服务，开启wifi；或重新查实定位")},this)))},alertErrorMsg:function(e,t){var r=new n({title:e,message:t,buttons:[{text:"知道了",click:function(){this.hide()}}]});r.show()},alertCityChange:function(e){var t=this,r=t.getSelectedCity();if(sessionStorage.getItem(B)!=1&&r.id>0&&r.id!=e.id){var i=new n({title:"提示",message:"目前您的定位在"+e.name+"，是否切换?",buttons:[{text:"取消",click:function(){sessionStorage.setItem(B,1),this.hide()}},{text:"切换",click:function(){if(t._autoGPSRequest==1){var n=e.id;y.setAttr("ctyId",n),y.setAttr("ctyName",e.name),t.setHeader(e.name),t.getGroupListData(),t.getBannerSearch(n)}else t.switchCity(e);this.hide()}}]});this.isCurrentView()&&i.show()}else t._autoGPSRequest!=1&&t.switchCity(e)},isCurrentView:function(){},goNearbyGroup:function(e,t){var n=y.get();s.clearAll(),E.setAttr("nearby",!0),qparams=s.getGroupQueryParam(),y.setAttr("qparams",qparams);if(t)if(t=="nearby")w.setAttr("distance",{val:D,txt:P});else{var r=this.$el.find('.js_qr_link li[data-category="'+t+'"]');index=r.attr("data-id"),tuanType=r.attr("data-type"),y.setAttr("ctype",tuanType),y.setAttr("ctyId",n.ctyId),y.setAttr("ctyName",n.ctyName),b.setAttr("tuanType",tuanType),b.setAttr("category",r.attr("data-category")),b.setAttr("name",r.attr("data-name")),b.setAttr("tuanTypeIndex",+index>0?+index:0)}N.remove(),this.forwardJump("list","/webapp/tuan/list")},switchCity:function(e){var t=this,n=S.getAttr("isParentCity"),r=e.id,i=e.name,o=S.getAttr("gps");s.clearAll(),s.setCurrentCity({CityID:r}),E.setAttr("nearby",!0),qparams=s.getGroupQueryParam(),y.setAttr("qparams",qparams),y.setAttr("ctyId",r),y.setAttr("ctyName",i),y.setAttr("pos",{posty:H,lon:o.lng,lat:o.lat,distance:t.isQueryByParentCity?10:D}),s.addHistoryCity(r,i),N.remove(),t.forwardJump("list","/webapp/tuan/list")},getGroupListData:function(){this.listWrap.html(this.tplLoading);var t=y.get(),n=S.getAttr("gps"),r=this,i={};i.ctyId=t.ctyId,i.environment=e.environment,g.abort(),g.setParam(i),g.excute(function(e){var t=e;this.isLoading=!1,e&&e.products&&e.count&&+e.count>0?r.renderList(t):this.listWrap.html(this.tplNoproduct)},function(e){this.listWrap.html(this.tplReload)},!0,this)},renderList:function(e){var t=this.itemRenderFn(e);e.count&&+e.count>0&&(this.listWrap.html(t),this.LazyLoad&&this.LazyLoad.updateDom())},detailHandler:function(e){var t=$(e.currentTarget).attr("data-id"),n=y.getAttr("ctyId");this.forwardJump("detail","/webapp/tuan/detail/"+t+".html"+(n?"?cityid="+n:""))},homeHandler:function(){e.tHome()},goList:function(t){var n,r,i,o,u=y.get();y.setAttr("from_feature",0),s.clearAll(),E.removeAttr("nearby"),t&&(o=this.$el.find('.js_qr_link li[data-category="'+t+'"]'),i=o.attr("data-id"),r=o.attr("data-type"),t!="onepaygroup"&&(y.setAttr("ctype",r),b.setAttr("tuanType",r),b.setAttr("category",o.attr("data-category")),b.setAttr("name",o.attr("data-name")),b.setAttr("tuanTypeIndex",+i>0?+i:0)),t=="onepaygroup"&&(w.setAttr("price.val","1|1"),w.setAttr("price.txt","一元团购")),t=="weeknew"&&(y.setAttr("sortRule","1"),y.setAttr("sortType","1"))),n=s.getGroupQueryParam(),y.setAttr("qparams",n),y.setAttr("ctyId",u.ctyId),y.setAttr("ctyName",u.ctyName);var a,f=this;if(t==="feature"){this.getBannerClass(function(t){var n=t[u.ctyId];n?e.jumpToPage(n,f):f.forwardJump("localfeature","/webapp/tuan/localfeature")},function(){f.forwardJump("localfeature","/webapp/tuan/localfeature")});return}this.forwardJump("list","/webapp/tuan/list")},goListByType:function(e){var t=this,n=$(e.currentTarget);n.attr("data-category")||(n=n.parent("li"));var r=n.attr("data-category");r=="hotel"||r=="catering"||r=="ticket"||r=="entertainment"||r=="nearby"?(this.geoCallback.type=r,this.geoCallback.cancelNearby=0,this.showLoading(),this.locateInterface()):r=="lottery"?this.forwardJump("lottery","/webapp/tuan/lottery"):this.goList(r)},showCityPage:function(){this.forwardJump("citylist","/webapp/tuan/citylist")},showKeywordSearch:function(e){var t=y.get();s.clearAll();var n=s.getGroupQueryParam();y.setAttr("qparams",n),y.setAttr("ctyId",t.ctyId),y.setAttr("ctyName",t.ctyName),this.forwardJump("keywordsearch","/webapp/tuan/keywordsearch")},onBannerClick:function(t){var n=$(t.currentTarget),r=n.attr("data-id");r&&e.jumpToPage(r,this)},getBannerSearch:function(e){C.setParam("cid",e),C.excute(function(e){var t=e,n=this.$el.find(".ad_link"),r=e&&e.banners;!r||r.length!=2&&r.length!=4?(n.hide(),n.html("")):(n.html(M({ads:r})),n.show())},function(e){},!0,this)},updateAdInfo:function(){var e=this.footer,t=e&&e.rootBox,n=t&&t.find("#dl_app");n&&n.length&&(n.attr("data-appurl","ctrip://wireless?v=2&extendSourceID="+F),t.find("#app_link").attr("href",j))},locateInterface:function(){this.geoCallback.cancelNearby=0,this.checkPositionCache()||this.checkNetwork(this.getPosition)},checkPositionCache:function(){var e=!1,t=x.get();if(t&&t.cityId&&t.cityName){var n={cityId:t.cityId,cityName:t.cityName,hasGroupProduct:t.hasGroupProduct};this.geoCallback.status=1,this.locatedCallback(n),e=!0}return e},checkNetwork:function(e){var t=this;m?A.app_check_network_status({callback:function(r){var i=r&&r.hasNetwork;if(!i){var s=new n({title:"提示",message:"未连接到互联网，请检查网络设置<br/>您也可以拨打携程客服电话咨询",buttons:[{text:"知道了",click:function(){this.hide()}},{text:"拨打电话",click:function(){A.callService(),this.hide()}}]});s.show();return}e&&e.call(t)}}):e&&e.call(t)},getPosition:function(e){var n=this;this.geoCallback.type==1&&(this.geoCallback.cancelNearby=0,R=new t.ui.LoadingLayer(function(){n.geoCallback.cancelNearby=1,this.hide()},"定位中..."),R.show());if(this.locating==1)return;this.locating=!0,q.Subscribe("tuan/home",{onComplete:function(e){this.locating=!1,e.city=e.city.replace("市市","市"),e.city.length>2&&(e.city=e.city.replace("市","")),x.set(e),S.setAttr("gps",e);var t={lng:e.lng,lat:e.lat,district:e.district,city:e.city,province:e.province,isOverseas:e.country!="中国"};n.geoCallback.type=="nearby"?(n.geoCallback.status=1,n.locatedCallback(t)):n.getCityInfo(t,n.locatedCallback)},onError:this.geoError,onPosComplete:function(e,t){},onPosError:this.geoError},this,!0)},geoError:function(){var e=this.geoCallback.type;if(!(!e||e!="hotel"&&e!="catering"&&e!="ticket"&&e!="entertainment")){this.goList(e);return}this.locating=!1;var t=this;x.set(null),R&&R.hide();var r=new n({title:"提示",message:"无法获取您的城市，您可以选择其他城市",buttons:[{text:"取消",click:function(){t.recordSwitchCityFlag(),this.hide()}},{text:"选择城市",click:function(){t.recordSwitchCityFlag(),t.showCityPage(),this.hide()}}]});r.show(),this.hideLoading()},getCityInfo:function(e,t){var n=this;T.setParam({lng:e.lng,lat:e.lat,district:encodeURIComponent(e.district),cityname:encodeURIComponent(e.city),province:encodeURIComponent(e.province),isOverseas:e.isOverseas}),T.excute(function(e){n.locating=!1;var r;e&&e.CityID&&e.CityID>0&&(s.setCurrentCity(e),r={cityId:e.CityID,cityName:e.CityName,hasGroupProduct:e.HasGroupProduct},x.setAttr("cityId",e.CityID),x.setAttr("cityName",e.CityName),x.setAttr("hasGroupProduct",e.HasGroupProduct)),n.geoCallback.status=1,typeof t=="function"&&t.call(n,r)},function(e){n.geoCallback.status=0,typeof t=="function"&&t.call(n)},!1,this)},getCityFailed:function(){var e=this;e.locating=!1,x.setAttr("cityId",null),x.setAttr("cityName",null);var t=new n({title:"提示",message:"无法获取您的城市，您可以选择其他城市",buttons:[{text:"取消",click:function(){e.recordSwitchCityFlag(),this.hide()}},{text:"选择城市",click:function(){e.showCityPage(),e.recordSwitchCityFlag(),this.hide()}}]});t.show()},promptSwitchCity:function(e){var t=this,r=t.getSelectedCity(),i;if(sessionStorage.getItem(B)==1)return;e&&e.cityId&&e.cityName?(sessionStorage.getItem(B)!=1&&r.id>0&&r.id!=e.cityId&&(e.hasGroupProduct?(i=new n({title:"提示",message:"目前您的定位在"+e.cityName+"，是否切换?",buttons:[{text:"取消",click:function(){t.recordSwitchCityFlag(),this.hide()}},{text:"切换",click:function(){t.recordSwitchCityFlag();var n=e.cityId;y.setAttr("ctyId",n),y.setAttr("ctyName",e.cityName),t.setHeader(e.cityName),t.getGroupListData(),t.getBannerSearch(n),this.hide()}}]}),i.show()):(i=new n({title:"提示",message:"您所在的城市暂无团购产品<br/>您可以选择其他城市",buttons:[{text:"取消",click:function(){t.recordSwitchCityFlag(),this.hide()}},{text:"选择城市",click:function(){t.recordSwitchCityFlag(),t.showCityPage(),this.hide()}}]}),i.show())),r.id!=e.cityId&&t.recordSwitchCityFlag()):(i=new n({title:"提示",message:"无法获取您的城市，您可以选择其他城市",buttons:[{text:"取消",click:function(){t.recordSwitchCityFlag(),this.hide()}},{text:"选择城市",click:function(){t.recordSwitchCityFlag(),t.showCityPage(),this.hide()}}]}),i.show())},recordSwitchCityFlag:function(){sessionStorage.setItem(B,1)},locatedCallback:function(e){var t=this.geoCallback.type,n=this.geoCallback.status,r=this.geoCallback.cancelNearby,i=this;if(t==0)n==1?i.promptSwitchCity(e):n==0&&i.getCityFailed();else{if(r)return;R&&R.hide(),n==1?t=="nearby"?i.goNearbyGroup(e,t):e.cityId==y.getAttr("ctyId")?i.goNearbyGroup(e,t):i.goList(t):n==0&&(t=="nearby"?i.getCityFailed():i.goList(t))}},getBannerClass:function(e,t){this.showLoading(),k.excute(function(t){this.hideLoading();var n={};_.each(_.filter(t.Banner||[],function(e){return e.type===14}),function(e){return n[e.cityid]=e.url}),e&&e(n)},function(){this.hideLoading(),t&&t()},!1,this,function(){this.hideLoading()})}}),L});