define(["TuanApp","c","TuanBaseView","cCommonPageFactory","cWidgetGuider","MemCache","StringsData","cUtility","cGeoService","cWidgetFactory","cUIToast","TuanStore","TuanModel","TuanFilters","StoreManage","LazyLoad","ScrollObserver","text!ListProductTpl","text!ListBusinessTpl","cWidgetGeolocation"],function(e,t,n,r,i,s,o,u,a,f,l,c,h,p,d,v,m,g,y){var b="ani_rotation",w="PAGE_LIST_POSITION",E=t.ui,S=u.isInApp(),x=h.TuanListModel.getInstance(),T=h.TuanHotelListModel.getInstance(),N=c.GroupSortStore.getInstance(),C=h.TuanLocalCityInfo.getInstance(),k=c.GroupSearchStore.getInstance(),L=c.GroupCategoryFilterStore.getInstance(),A=c.OrderDetailReturnPage.getInstance(),O=h.TuanCityListModel.getInstance(),M=c.GroupPositionFilterStore.getInstance(),D=c.GroupCustomFilters.getInstance(),P=h.TuanConditionModel.getInstance(),H=c.GroupConditionStore.getInstance(),B=c.GroupGeolocation.getInstance(),j=c.TuanPositionStore.getInstance(),F=c.TuanHistoryCityListStore.getInstance(),I=c.GroupGeolocation.getInstance(),q,R={tuangou:"团购",youAreHere:"您的位置 "},U=f.create("Guider"),z=a.GeoLocation,W=r.create("TuanBaseView");return q=W.extend({pageid:"214001",hpageid:"215001",totalPages:null,isComplete:!1,isLoading:!1,isScrolling:!1,pageSize:25,render:function(){var e=this.$el;this.listWrap=e.find("#J_listWrap"),this.filterWrap=e.find(".J_filtersAndSortPanel"),this.productListTpl=_.template(g),this.businessListTpl=_.template(y),this.gpsInfoWrap=e.find("#J_gpsInfoWrap")},events:{"click li[data-id]":"detailHandler","click #J_reloadGPS":"refreshGeolocation","click #J_keywordSearch":"showKeywordSearch","click .cui-btns-retry":"reloadPage","click .J_showMore":"showMore","click .J_phone":"callPhone","click #J_deleteFilter li":"deleteFilter"},callPhone:function(e){U.apply({hybridCallback:function(){var t="data-phone",n=$(e.target);return n.attr(t)||(n=n.find("["+t+"]")),e.preventDefault(),U.callPhone({tel:n.attr(t)}),!1},callback:function(){return!0}})},getLocalCityInfo:function(e,t){var n=this,r,i,s=this.gpsReloadBtn;r=function(e){s.removeClass(b),d.setCurrentCity(e),j.setAttr("cityId",e.CityID),j.setAttr("cityName",e.CityName),j.setAttr("hasGroupProduct",e.HasGroupProduct),k.setAttr("ctyId",e.CityID),k.setAttr("ctyName",e.CityName),t&&t()},i=function(){s.removeClass(b),j.setAttr("cityId",null),j.setAttr("cityName",null),n.showToast("抱歉，获取不到当前位置!")},C.setParam({lng:e.lng,lat:e.lat,district:encodeURIComponent(e.district),cityname:encodeURIComponent(e.city),province:encodeURIComponent(e.province),isOverseas:e.isOverseas}),C.excute(r,i,!1,this)},isCurrentCityChange:function(){var e=d.getCurrentCity(),t=e.CityId;return t&&t!=k.getAttr("ctyId")},positionSearchPanel:function(e){var t=this,n=e.direction;n.toLowerCase()=="up"&&e.y>30?(t.keywordPanel.addClass("list_s_fixed"),t.keywordPanel.css("top",!S&&t.isNearBy()?"78px":S?"0":"48px")):(t.keywordPanel.removeClass("list_s_fixed"),t.keywordPanel.css("top","0"))},refreshGeolocation:function(e){var t=$(e.target),n=this;t.addClass(b),this.getGeolocation(function(){n.getGroupListData()})},getGeolocation:function(e){var t=this,n=this.$el.find("#J_gpsInfo"),r,i;r=function(n){t.displayGPSInfo(n,!0,e)},i=function(){j.set(null),n.parent().find("."+b).removeClass(b),t.showToast("抱歉，获取不到当前位置，请打开GPS后重试!")},z.Subscribe("tuan/list",{onComplete:function(e){r(e)},onError:i,onPosComplete:function(e,t){},onPosError:i},this,!0)},displayGPSInfo:function(e,t,n){var r=this.gpsInfoWrap,i=this.gpsReloadBtn,s=k.getAttr("ctyName")||"",u=M.get(),a="距离: ";e=e||{},i[t?"show":"hide"](),t&&e?a+=R.youAreHere+e.address:u&&u.name?u.type!=4?a+=u.pos&&u.pos.name||u.name:a+=s+o.CITY_CENTER:e.address?a+=e.address==s?s+o.CITY_CENTER:e.address:a+=(s||"")+o.CITY_CENTER,r.html(a);if(t){e.city=e.city&&e.city.replace("市",""),j.set(e),B.setAttr("gps",e);var f={lng:e.lng,lat:e.lat,district:e.district,city:e.city,province:e.province,isOverseas:e.country!="中国"};this.getLocalCityInfo(f,n)}},initTuanFilters:function(){var e=this.$el;this.tuanfilters?(this.hideFilterDropDowns(),this.updateFilterCategory()):(this.tuanfilters=p.getInstance({sortTrigger:e.find("#J_sortTrigger"),sortPanel:e.find("#J_sortPanel"),sortLabel:e.find("#J_sortTrigger"),categoryTrigger:e.find("#J_categoryTrigger"),categoryPanel:e.find("#J_categoryPanel"),positionTrigger:e.find("#J_positionTrigger"),positionPanel:e.find("#J_positionPanel"),customFilter:e.find("#J_customFilters"),filterPanel:e.find("#J_filterPanel"),page:this,sortDefaultIndex:N.getAttr("sortTypeIndex")||0}),this.filterWrap.show(),this.filterWrap.css({"-webkit-transform":"translate(0, 30px) translateZ(0)",opacity:0}),this.filterWrap.animate({"-webkit-transform":"translate(0, 0px) translateZ(0)",opacity:1}))},updateFilterCategory:function(){var e=this.tuanfilters;if(!e)return;var t=L.getAttr("tuanTypeIndex")||0,n=L.getAttr("tuanType")||0;this.tuanfilters.categoryTab?this.tuanfilters.categoryTab.switch(t):this.tuanfilters.renderCategory(),this.tuanfilters.options.categoryTrigger.html(o.groupType[n].name)},hideFilterDropDowns:function(){var e=this.tuanfilters;e.sort.hide()},onCreate:function(){var t=this.$el;k.setAttr("pageIdx",1),this.onWindowScroll=$.proxy(this._onWindowScroll,this),this.render(),e.saveUnion(!0),this.gpsInfoWrap.css("top",S?"0px":"48px"),S&&(t.find("#J_searchBoxWrap").addClass("hybrid"),e.initVoiceSearch&&e.initVoiceSearch(t.find("#J_voiceTrigger")))},isFromDetail:function(e){return e&&e.match(/detail/i)},isFromListMap:function(e){return e&&e.match(/listmap/i)},controlGPSInfoWrap:function(e){this.gpsInfoWrap.css("display",e?"":"none")},getCurrentCity:function(e){var t={id:e.ctyId,name:e.ctyName},n=this.getQuery("cityid");return n&&+n>0&&(t=d.findCityInfoById(n)),+t.id||(t=o.defaultCity),t},isNearBy:function(){return k.getAttr("nearby")||F.getAttr("nearby")},isFromHybridFavorPage:function(){return S&&Lizard.P("from_native_page")==1},isOneYuan:function(){return D.getAttr("price.val")=="1|1"},updateTitle:function(t){var n=this;this.header.set({title:t.indexOf(R.tuangou)>-1?t:t+R.tuangou,back:!0,view:this,events:{returnHandler:function(){n.isNearBy()&&(k.removeAttr("nearby"),F.removeAttr("nearby")),n.clearPagePos();if(n.isFromHybridFavorPage()){U.backToLastPage({param:JSON.stringify({biz:"tuan",refresh:"1"})});return}var t=Lizard.P("from");t?e.jumpToPage(t,n):n.back("home")},homeHandler:$.proxy(n.homeHandler,n),commitHandler:function(){n.gotoMapPage()}},btn:{title:"地图",id:"J_gotoMapPage",classname:"rightblue"}}),this.header.show()},gotoMapPage:function(){this.isDataReady&&this.forwardJump("listmap","/webapp/tuan/listmap")},createPage:function(){var e=k.get(),t=e.ctype,n=e.ctyId||o.defaultCity.id,r=this.isNearBy(),i=this.isOneYuan(),s=o.groupType[t].name||o.groupType[0].name;i&&(s="一元团购"),this.updateTitle(s),this.initKeywordSearch(),this.hideForbiddens(!r,".J_forbidden"),this.keywordPanel=this.$el.find("#J_keywordSearchPanel");if(r)this.getGroupListData(),this.isFromListMap(this.referUrl)&&this.updateFilterCategory();else{if(Lizard.P("cityid")){var u=d.getGroupQueryParam();k.setAttr("qparams",u)}this.getGroupListData(),i?this.filterWrap.hide():(this.tuanfilters&&this.filterWrap.show(),this.getConditionData(n))}},hideForbiddens:function(e,t){this.$el.find(t)[e?"hide":"show"]()},getConditionData:function(e){P.setParam("ctyId",e);var t=1;t|=2,t|=4,t|=8,t|=64,t|=128,t|=256,t|=512,t|=1024,t|=2048,t|=4096,t|=8192,P.setParam("type",t),P.setParam("categroy",k.getAttr("ctype")),P.excute(function(e){this.initTuanFilters()},function(e){},!1,this)},renderPageByCity:function(){var e=this;O.excute(function(t){e.createPage(t)},function(t){e.createPage(t)},!1,this)},onHide:function(){z.UnSubscribe("tuan/list"),this.$el.find("#J_reloadGPS").removeClass(b);var e=this.tuanfilters,t=e&&e.sort;this.LazyLoad&&this.LazyLoad.unbindEvents(),$(window).unbind("scroll",this.onWindowScroll),this.hideWarning404(),this.hideLoading(),this.scrollObserver&&this.scrollObserver.disable(),this.alert&&this.alert.hide(),t&&t.mask.root&&t.mask.root.hide(),e&&e.mask&&e.mask.hide()},onShow:function(e){this.referUrl=e||this.getLastViewName(),this.gpsInfoWrap=this.$el.find("#J_gpsInfo"),this.gpsReloadBtn=this.$el.find("#J_reloadGPS");var t=this,n;A&&A.remove();if(k.getAttr("from_feature")){this.emptyPage("当地特色",k.getAttr("ctyName"));return}if(!this.isFromDetail(this.referUrl)||!s.getItem("hasListData"))this.showLoading(),this.listWrap.empty(),k.setAttr("pageIdx",1),d.saveQueryString(function(){n=t.isNearBy();var e=B.getAttr("gps");if(n&&e){var r=t.gpsInfoWrap,i=t.gpsReloadBtn,s=I.getAttr("gps"),o="距离: ";i.show(),o+=R.youAreHere+s.address,r.html(o)}if(N.getAttr("sortTypeIndex")==null&&t.isNearBy()){k.setAttr("sortRule",8),N.setAttr("sortTypeIndex",1);if(t.tuanfilters){var u=$(t.tuanfilters.sort.getItemByIndex(1))[0];t.tuanfilters.sort.select(u,!0)}}t.renderPageByCity()});else{var r=k.getAttr("ctype"),i=o.groupType[r].name||o.groupType[0].name;this.isOneYuan()&&(i="一元团购"),this.updateTitle(i),this._restoreScrollPos()}this.LazyLoad=new v({wrap:this.$el,animate:"opacity-fade-in"}),$(window).bind("scroll",this.onWindowScroll),this.scrollObserver&&this.scrollObserver.enable()},_onWindowScroll:function(){var e=t.ui.Tools.getPageScrollPos(),n=k.get(),r=isNaN(n.pageIdx)?1:n.pageIdx;n.pageIdx<this.totalPages&&this.totalPages>1&&(this.isComplete=!1);var i=e.pageHeight-(e.top+e.height);if(i<=300&&!this.isComplete&&!this.isLoading){this.isLoading=!0;if(n.pageIdx>=this.totalPages){this.isComplete=!0;return}n.pageIdx=++r,k.setAttr("pageIdx",n.pageIdx),this.getGroupListData(!0)}},showBottomLoading:function(){this.bottomLoading||(this.bottomLoading=$('<div style="bottom: 48px;" class="cui-zl-load"> <div class="cui-i cui-b-loading"></div><div class="cui-i cui-mb-logo"></div> <p>加载中…</p></div>'),this.$el.append(this.bottomLoading)),this.bottomLoading.show()},hideBottomLoading:function(){this.bottomLoading&&this.bottomLoading.hide()},reloadPage:function(){this.showLoading(),this.getGroupListData(!1,!0)},renderList:function(e){var t=k.get(),n=t.sortRule;e.pageIdx=t.pageIdx;var r=$.trim(this[n=="8"?"businessListTpl":"productListTpl"](e));e.count&&+e.count>0&&this.totalPages&&+this.totalPages>1?n=="8"?this.listWrap.append(r):e.pageIdx>1?this.listWrap.find("ul").append(r):this.listWrap.append(r):(!this.totalPages||+this.totalPages<1||!t.pageIdx||+t.pageIdx<=1)&&this.listWrap.html(r),e.count>0&&e.pageIdx>=this.totalPages&&this.listWrap.append('<p class="sec-waiting" style="display:block;">没有更多结果了</p>')},isDataReady:!1,getGroupListData:function(t,n){var r,i,u,a,f=this,l=f.isNearBy(),c=I.getAttr("gps"),h=k.getAttr("sortRule"),p=M.getAttr("pos"),v=M.getAttr("type");h=="8"?(a=T,u="hotels",l?k.removeAttr("pos"):!p||v=="4"?(i=k.getAttr("ctyId"),r=d.findCityInfoById(i),c=r&&r.pos||{},k.setAttr("pos",{posty:o.MAP_SOURCE_ID,lon:c.lon||0,lat:c.lat||0,name:r.name+o.CITY_CENTER})):(v<0||v=="5")&&k.setAttr("pos",p)):(a=x,u="products",p&&v<0?k.setAttr("pos",p):(i=k.getAttr("ctyId"),r=d.findCityInfoById(i),c=r&&r.pos||{},k.setAttr("pos",{posty:o.MAP_SOURCE_ID,lon:c.lon||0,lat:c.lat||0,name:r.name+o.CITY_CENTER}))),t&&f.showBottomLoading(),k.setAttr("environment",e.environment),a.param=k.get(),l&&k.getAttr("ctype")==0&&(a.param.ctyId=0,a.param.ctyName="");var m=a.param.pageIdx;a.excute(function(e){var n=e;this.isLoading=!1,f.hideLoading(),t&&f.hideBottomLoading();if(e&&e[u]&&e[u].length&&e.count&&+e.count>0){this.isDataReady=!0,this.totalPages=Math.ceil(e.count/this.pageSize),this.totalPages>1&&$(window).bind("scroll",this.onWindowScroll),n.isNearBy=l,!t&&this.listWrap.empty(),this.renderList(n);if(l&&h=="8"&&m<=1){var r=e&&e.city&&e.city.cityid,i=e&&e.city&&e.city.cityName;r&&i&&(k.setAttr("ctyId",r),k.setAttr("ctyName",i),this.tuanfilters||this.getConditionData(r))}s.setItem("hasListData",!0),k.getAttr("pageIdx")<=1&&!l&&f.displayGPSInfo(e.curpos||{},l)}else{if(k.getAttr("pageIdx")>1)f.showToast("亲，数据加载完毕");else if(this.totalPages||this.totalPages<=0){var o=D.get()||{},a=o&&o.distance&&o.distance.val,c={};c.msg=(a?a+"公里内":"")+"没找到符合条件的结果，请修改条件重新查询",c[u]=null,c.count=0,c.customFilter=o,c.positionFilter=M.get(),c.weekendsAvailable=k.getAttr("weekendsAvailable"),c.keywordData=d.getCurrentKeyWord(),this.renderList(c)}k.setAttr("pageIdx",1),this.isComplete=!0,$(window).unbind("scroll",this.onWindowScroll),l||f.displayGPSInfo(e.curpos||{},l)}this.LazyLoad&&this.LazyLoad.updateDom()},function(e){this.hideLoading(),this.isLoading=!1,this.isComplete=!0;var t={},n=D.get()||{},r=n&&n.distance&&n.distance.val;this.totalPages<=0&&(t.msg=e.msg?e.msg:(r?r+"公里内":"")+"没找到符合条件的结果，请修改条件重新查询",t[u]=null,t.count=0,t.customFilter=n,t.positionFilter=M.get(),t.weekendsAvailable=k.getAttr("weekendsAvailable"),t.keywordData=d.getCurrentKeyWord(),this.listWrap.empty(),this.renderList(t)),k.setAttr("pageIdx",1),$(window).unbind("scroll",this.onWindowScroll)},!!n,f)},emptyPage:function(e,t){var n=D.get()||{},r={};r.msg="没找到符合条件的结果，请修改条件重新查询",r.hotels=null,r.count=0,r.customFilter={feature:{val:"",txt:e}},r.positionFilter=M.get(),r.weekendsAvailable=k.getAttr("weekendsAvailable"),r.keywordData=d.getCurrentKeyWord(),this.renderList(r),this.updateTitle(e),this.gpsInfoWrap.text("距离："+t+o.CITY_CENTER)},initKeywordSearch:function(){var e=this.$el.find("#J_keywordSearch"),t=d.getCurrentKeyWord();this.searchKeywordInput=e,E.InputClear(e),e.val(t&&t.word||"")},detailHandler:function(e){var t=$(e.currentTarget).attr("data-id"),n=k.getAttr("ctyId");this._saveScrollPos(),this.forwardJump("detail","/webapp/tuan/detail/"+t+".html"+(n?"?cityid="+n:""))},clearPagePos:function(){s.setItem(w,null)},_restoreScrollPos:function(){var e=s.getItem(w);e&&e.y&&setTimeout(function(){window.scrollTo(e.x,e.y)},0)},_saveScrollPos:function(){s.setItem(w,{x:window.scrollX,y:window.scrollY})},deleteFilter:function(e){var t=$(e.currentTarget),n=t.data("type"),r=this.$el.find("#J_filterTabLabel"),i=this.$el.find("#J_filterTabPanel");switch(n){case"position":M.remove(),this.tuanfilters&&this.tuanfilters.renderPosition(),this.tuanfilters&&(this.tuanfilters._positionInited=undefined);break;case"star":var s=D.getAttr("star");delete s[t.data("value")],$.isEmptyObject(s)?(D.removeAttr("star"),r.find('li[data-tab="star"] i').hide()):D.setAttr("star",s);break;case"weekendsAvailable":k.setAttr("weekendsAvailable",0),this.$el.find("#weekends")[0].checked=!1;break;case"voucher":D.removeAttr("voucher"),this.$el.find("#voucher")[0].checked=!1;break;case"multiShop":D.removeAttr("multiShop"),this.$el.find("#multiShop")[0].checked=!1;break;case"keyword":d.removeCurrentKeyWord(),this.$el.find("#J_keywordSearch").val("");break;case"feature":k.removeAttr("from_feature"),this.updateTitle(o.groupType[0].name);break;case"price":k.setAttr("qparams",[]),r.find('li[data-tab="price"] i').hide(),D.removeAttr("price"),this.updateTitle(o.groupType[0].name);break;default:D.removeAttr(n),r.find('li[data-tab="'+n+'"] i').hide()}this.tuanfilters&&(this.tuanfilters.renderTabWrap(n,i,!1),this.tuanfilters.updateCustomFilterIcon()),k.setAttr("qparams",d.getGroupQueryParam()),k.setAttr("pageIdx","1"),this.isLoading=!0,window.scrollTo(0,0),this.listWrap.empty(),this.showLoading(),this.hideBottomLoading(),this.getGroupListData()},homeHandler:function(){k.setAttr("pageIdx",1),$(window).unbind("scroll",this.onWindowScroll),d.clearSpecified(),e.tHome()},showCityPage:function(){this.forwardJump("citylist","/webapp/tuan/citylist")},showKeywordSearch:function(e){this.forwardJump("keywordsearch","/webapp/tuan/keywordsearch")},showMore:function(e){$(e.currentTarget).hide().siblings("li").show()},getAppUrl:function(){var e=k.get(),t=e.ctype;return"ctrip://wireless/hotel_groupon_list?c1="+e.ctyId+"&c2="+t}}),q});
