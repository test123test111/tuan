define(["TuanApp","c","TuanBaseView","cCommonPageFactory","cWidgetGuider","MemCache","StringsData","cUtility","cGeoService","cWidgetFactory","cUIToast","cUIScroll","TuanStore","TuanModel","TuanFilters","StoreManage","LazyLoad","ScrollObserver","text!ListTpl","cWidgetGeolocation"],function(t,e,i,r,a,s,o,n,l,c,d,h,u,p,g,f,y,m,v){var w,I="ani_rotation",b="PAGE_LIST_POSITION",P=e.ui.Mask,S=n.isInApp(),A="TUAN_FIRST_IN_LIST",C=p.TuanListModel.getInstance(),T=p.TuanHotelListModel.getInstance(),L=u.GroupSortStore.getInstance(),k=p.TuanLocalCityInfo.getInstance(),W=u.GroupSearchStore.getInstance(),x=u.OrderDetailReturnPage.getInstance(),G=p.TuanCityListModel.getInstance(),J=u.GroupPositionFilterStore.getInstance(),N=u.GroupCustomFilters.getInstance(),F=p.TuanConditionModel.getInstance(),D=u.GroupGeolocation.getInstance(),O=u.TuanPositionStore.getInstance(),R=u.TuanHistoryCityListStore.getInstance(),H=u.GroupGeolocation.getInstance(),B={youAreHere:"您的位置 "},M=c.create("Guider"),E=l.GeoLocation,K=r.create("TuanBaseView");return w=K.extend({pageid:"214001",hpageid:"215001",totalPages:null,isComplete:!1,isLoading:!1,isScrolling:!1,pageSize:25,render:function(){var t=this.$el;this.listWrap=t.find("#J_listWrap"),this.filterWrap=t.find(".J_filtersAndSortPanel"),this.listTpl=_.template(v),this.gpsInfoWrap=t.find("#J_gpsInfoWrap"),this.quickOpBar=t.find("#J_quickOpBar"),this.quickWrapper=t.find("#J_quickWrapper"),this.toolbar=t.find("#J_toolbar"),this.toolbarSpace=t.find("#J_toolbarSpace")},events:{"click li[data-id]":"detailHandler","click #J_reloadGPS":"refreshGeolocation","click #J_keywordSearch":"showKeywordSearch","click .cui-btns-retry":"reloadPage","click .J_showMore":"showMore","click .J_phone":"callPhone","click #J_deleteFilter li":"deleteFilter","click #J_quickWrapper li":"hotWordSearch","click .J_filtersAndSortPanel":function(){this.filterWrap.css("z-index","9999")}},callPhone:function(t){M.apply({hybridCallback:function(){var e="data-phone",i=$(t.target);return i.attr(e)||(i=i.find("["+e+"]")),t.preventDefault(),M.callPhone({tel:i.attr(e)}),!1},callback:function(){return!0}})},getLocalCityInfo:function(t,e){var i,r,a=this,s=this.gpsReloadBtn;i=function(t){s.removeClass(I),f.setCurrentCity(t),O.setAttr("cityId",t.CityID),O.setAttr("cityName",t.CityName),O.setAttr("hasGroupProduct",t.HasGroupProduct),W.setAttr("ctyId",t.CityID),W.setAttr("ctyName",t.CityName),e&&e()},r=function(){s.removeClass(I),O.setAttr("cityId",null),O.setAttr("cityName",null),a.showToast("抱歉，获取不到当前位置!")},k.setParam({lng:t.lng,lat:t.lat,district:encodeURIComponent(t.district),cityname:encodeURIComponent(t.city),province:encodeURIComponent(t.province),isOverseas:t.isOverseas}),k.excute(i,r,!1,this)},isCurrentCityChange:function(){var t=f.getCurrentCity(),e=t.CityId;return e&&e!=W.getAttr("ctyId")},refreshGeolocation:function(t){var e=$(t.target),i=this;e.addClass(I),this.getGeolocation(function(){i.getGroupListData()})},getGeolocation:function(t){var e,i,r=this,a=this.$el.find("#J_gpsInfo");e=function(e){r.displayGPSInfo(e,!0,t)},i=function(){O.set(null),a.parent().find("."+I).removeClass(I),r.showToast("抱歉，获取不到当前位置，请打开GPS后重试!")},E.Subscribe("tuan/list",{onComplete:function(t){e(t)},onError:i,onPosComplete:function(){},onPosError:i},this,!0)},displayGPSInfo:function(t,e,i){var r=this.gpsInfoWrap,a=this.gpsReloadBtn,s=W.getAttr("ctyName")||"",n=J.get(),l="距离: ";if(t=t||{},a[e?"show":"hide"](),l+=e&&t?B.youAreHere+t.address:n&&n.name?4!=n.type?n.pos&&n.pos.name||n.name:s+o.CITY_CENTER:t.address?t.address==s?s+o.CITY_CENTER:t.address:(s||"")+o.CITY_CENTER,r.html(l),e){t.city=t.city&&t.city.replace("市",""),O.set(t),D.setAttr("gps",t);var c={lng:t.lng,lat:t.lat,district:t.district,city:t.city,province:t.province,isOverseas:"中国"!=t.country};this.getLocalCityInfo(c,i)}},initTuanFilters:function(){var t=this.$el;if(this.tuanfilters){this.hideFilterDropDowns(),this.tuanfilters.updateCategoryName();var e=J.get();!e||e&&-6==e.type?(this.tuanfilters.renderPosition(),this.tuanfilters._positionInited=void 0):this.tuanfilters.updatePositionName(),this.tuanfilters.updateCustomFilterIcon(),e||this.tuanfilters.sort.reset()}else this.tuanfilters=g.getInstance({sortTrigger:t.find("#J_sortTrigger"),sortPanel:t.find("#J_sortPanel"),sortLabel:t.find("#J_sortTrigger"),categoryTrigger:t.find("#J_categoryTrigger"),categoryPanel:t.find("#J_categoryPanel"),positionTrigger:t.find("#J_positionTrigger"),positionPanel:t.find("#J_positionPanel"),customFilter:t.find("#J_customFilters"),filterPanel:t.find("#J_filterPanel"),page:this,sortDefaultIndex:L.getAttr("sortTypeIndex")||0}),this.filterWrap.show()},hideFilterDropDowns:function(){var t=this.tuanfilters;t.sort.hide()},onCreate:function(){W.setAttr("pageIdx",1),this.onWindowScroll=$.proxy(this._onWindowScroll,this),this.render(),t.saveUnion(!0);var e=7===+W.getAttr("ctype");this.controlGPSInfoWrap(!e),this.toolbarHeight=e?0:30,this.toolbar.css("top",S?"0px":"48px"),this.toolbarSpace.css("height",this.toolbarHeight)},toolbarObserver:function(t,e){var i=this.toolbar,r=this.toolbarSpace,a=e.direction;"down"==a.toLowerCase()?e.y>this.toolbarHeight&&(i.removeClass("list_s_fixed"),r.hide()):(i.addClass("list_s_fixed"),i.css("top",S?"0px":"48px"),r.show())},setQuickScroll:function(){var t,e=this.quickWrapper,i=e.find("ul"),r=0,a=i.find("li");_.each(a,function(t){r+=$(t).width()+3}),i.css("width",r),t=new h({wrapper:e,scrollbars:!1,scrollX:!0,scrollY:!1})},isFromDetail:function(){var t=this.referUrl;return t&&t.match(/detail/i)},isFromListMap:function(){var t=this.referUrl;return t&&t.match(/listmap/i)},isFromKeywordSearch:function(){var t=this.referUrl;return t&&t.match(/keywordsearch/i)},controlGPSInfoWrap:function(t){this.gpsInfoWrap[t?"show":"hide"]()},getCurrentCity:function(t){var e={id:t.ctyId,name:t.ctyName},i=this.getQuery("cityid");return i&&+i>0&&(e=f.findCityInfoById(i)),e.id&&(e=o.defaultCity),e},isNearBy:function(){return W.getAttr("nearby")||R.getAttr("nearby")},isFromHybridFavorPage:function(){return S&&1==Lizard.P("from_native_page")},isOneYuan:function(){return"1|1"==N.getAttr("price.val")},updateTitle:function(e,i,r){var a=this,s="",o=this.header,n={back:!0,view:this,events:{returnHandler:function(){if(a.isNearBy()&&(W.removeAttr("nearby"),R.removeAttr("nearby")),a.clearPagePos(),a.isFromHybridFavorPage())return void M.backToLastPage({param:JSON.stringify({biz:"tuan",refresh:"1"})});var e=Lizard.P("from");e?t.jumpToPage(e,a):a.back("home")}}},l=W.getAttr("ctype"),c={map:'<b id="J_gotoMapPage" class="i_bef icon_map_w"></b>',search:'<b id="J_gotoSearch" class="i_bef icon_search_w"></b>',down:'<i class="i_tri"></i>',returnico:'<i id="js_return" class="returnico"></i>'},d=this.isFromKeywordSearch()&&f.getCurrentKeyWord();n.moreRightMenus=[{tagname:"tuan_keyword_search",imagePath:"tuan/pic/h5/tuan/icon_search_w.png",pressedImagePath:"tuan/pic/h5/tuan/icon_search_w.png",callback:function(){a.showKeywordSearch()}}],s=d?'<div class="search_title"><span class="word">'+e+'</span><span class="num">'+(void 0!==r?"("+r+")":"")+"</span></div>":'<h2><div id="J_cityBtn" class="list_hd_button2"><em class="header_mutrow">'+e+"</em>"+(i?c.down:"")+"</div></h2>",s+=c.returnico,7===+l?n.customtitle=s+c.search:(n.customtitle=s+c.search+c.map,(n.moreRightMenus||(n.moreRightMenus=[])).unshift({tagname:"tuan_list_map",imagePath:"tuan/pic/h5/tuan/icon_map_w.png",pressedImagePath:"tuan/pic/h5/tuan/icon_map_w.png",callback:function(){a.gotoMapPage()}})),i?(n.citybtn=e,n.events.citybtnHandler=function(){a.showCityPage()}):n.title=e+(d&&void 0!==r?"("+r+")":""),o.set(n),o.show(),S||(i&&o.root.find("#J_cityBtn").on("click",$.proxy(a.showCityPage,this)),o.root.find("#J_gotoSearch").on("click",$.proxy(a.showKeywordSearch,this)),o.root.find("#J_gotoMapPage").on("click",$.proxy(a.gotoMapPage,this)))},gotoMapPage:function(){this.forwardJump("listmap","/webapp/tuan/listmap")},createPage:function(){var t=W.get(),e=t.ctyId||o.defaultCity.id,i=this.isNearBy(),r=this.isOneYuan(),a=f.getCurrentKeyWord();if(this.isFromKeywordSearch()&&a?this.updateTitle(a.word,!1):r?this.updateTitle("一元团购",!1):this.updateTitle(t.ctyName,!0),this.hideForbiddens(!i,".J_forbidden"),i)this.getGroupListData(),this.isFromListMap()&&this.tuanfilters&&this.tuanfilters.updateCategoryName();else{if(Lizard.P("cityid")){var s=f.getGroupQueryParam();W.setAttr("qparams",s)}this.getGroupListData(),r?this.filterWrap.hide():(this.tuanfilters&&this.filterWrap.show(),this.getConditionData(e))}},hideForbiddens:function(t,e){this.$el.find(e)[t?"hide":"show"]()},getConditionData:function(t){F.setParam("ctyId",t);var e=1;e|=2,e|=4,e|=8,e|=64,e|=128,e|=256,e|=512,e|=1024,e|=2048,e|=4096,e|=8192,F.setParam("type",e),F.setParam("categroy",W.getAttr("ctype")),F.excute(function(){this.initTuanFilters()},function(){},!1,this)},renderPageByCity:function(){var t=this;G.excute(function(e){t.createPage(e)},function(e){t.createPage(e)},!1,this)},onHide:function(){E.UnSubscribe("tuan/list"),this.$el.find("#J_reloadGPS").removeClass(I),this.LazyLoad&&this.LazyLoad.unbindEvents(),$(window).unbind("scroll",this.onWindowScroll),this.hideWarning404(),this.hideLoading(),this.scrollObserver&&this.scrollObserver.disable(),this.searchGuiderMask&&this.searchGuiderMask.hide(),this.alert&&this.alert.hide();var t=this.tuanfilters,e=t&&t.mask,i=t&&t.sort;e&&e.hide(),i&&i.mask.root&&i.mask.root.hide(),t&&(t.options.categoryPanel.hide(),t.options.positionPanel.hide(),t.options.filterPanel.hide())},parseSEOPostData:function(){var t=$.trim(this.$el.find("#J_seoPostData").text());t&&W.set(JSON.parse(t))},onShow:function(t){this.referUrl=t||this.getLastViewName(),this.parseSEOPostData(),this.infoWrap=this.$el.find("#J_gpsInfo"),this.gpsReloadBtn=this.$el.find("#J_reloadGPS");var e,i=this;return x&&x.remove(),W.getAttr("from_feature")?(this.updateTitle("当地特色",!1),this.renderNoResult("","hotels",{feature:{val:"",txt:"当地特色"}}),void this.gpsInfoWrap.text("距离："+W.getAttr("ctyName")+o.CITY_CENTER)):(this.isFromDetail()&&s.getItem("hasListData")?(this.isOneYuan()?this.updateTitle("一元团购",!1):this.updateTitle(W.getAttr("ctyName"),!0),this._restoreScrollPos()):(this.showLoading(),this.listWrap.empty(),W.setAttr("pageIdx",1),f.saveQueryString(function(){e=i.isNearBy();var t=D.getAttr("gps");if(e&&t){var r=i.infoWrap,a=i.gpsReloadBtn,s=H.getAttr("gps"),o="距离: ";a.show(),o+=B.youAreHere+s.address,r.html(o)}if(null===L.getAttr("sortTypeIndex")&&i.isNearBy()&&(W.setAttr("sortRule",8),L.setAttr("sortTypeIndex",1),i.tuanfilters)){var n=$(i.tuanfilters.sort.getItemByIndex(1))[0];i.tuanfilters.sort.select(n,!0)}i.renderPageByCity()})),this.LazyLoad=new y({wrap:this.$el,animate:"opacity-fade-in"}),$(window).bind("scroll",this.onWindowScroll),this.scrollObserver=m.init(),this.scrollObserver&&this.scrollObserver.enable(),$(window).bind("customScrollStart",$.proxy(this.toolbarObserver,this)),void(!localStorage.getItem(A)&&this.initSearchGuider()))},_onWindowScroll:function(){var t=e.ui.Tools.getPageScrollPos(),i=W.get(),r=isNaN(i.pageIdx)?1:i.pageIdx;i.pageIdx<this.totalPages&&this.totalPages>1&&(this.isComplete=!1);var a=t.pageHeight-(t.top+t.height);if(300>=a&&!this.isComplete&&!this.isLoading){if(this.isLoading=!0,i.pageIdx>=this.totalPages)return void(this.isComplete=!0);i.pageIdx=++r,W.setAttr("pageIdx",i.pageIdx),this.getGroupListData(!0)}},showBottomLoading:function(){this.bottomLoading||(this.bottomLoading=$('<div style="bottom: 48px;" class="cui-zl-load"> <div class="cui-i cui-b-loading"></div><div class="cui-i cui-mb-logo"></div> <p>加载中…</p></div>'),this.$el.append(this.bottomLoading)),this.bottomLoading.show()},hideBottomLoading:function(){this.bottomLoading&&this.bottomLoading.hide()},reloadPage:function(){this.showLoading(),this.getGroupListData(!1,!0)},renderList:function(t){var e=W.get(),i=e.sortRule;t.pageIdx=e.pageIdx,t.ctype=e.ctype,t.hasPosition=!!J.getAttr("type");var r=$.trim(this.listTpl(t));t.count&&+t.count>0&&this.totalPages&&+this.totalPages>1?"8"==i?this.listWrap.append(r):t.pageIdx>1?this.listWrap.find("ul").append(r):this.listWrap.append(r):(!this.totalPages||+this.totalPages<1||!e.pageIdx||+e.pageIdx<=1)&&this.listWrap.html(r),t.count>0&&t.pageIdx>=this.totalPages&&this.listWrap.append('<p class="sec-waiting" style="display:block;">没有更多结果了</p>');var a=this.isFromKeywordSearch()&&f.getCurrentKeyWord();!a&&t.hotkey&&t.pageIdx<=1?this.renderHotWord(t.hotkey):(this.quickOpBar.hide(),this.toolbarHeight-=this.toolbarHeight>=45?45:0)},isDataReady:!1,getGroupListData:function(e,i){var r,a,n,l,c=this,d=c.isNearBy(),h=H.getAttr("gps"),u=W.getAttr("sortRule"),p=J.getAttr("pos"),g=J.getAttr("type");"8"==u?(l=T,n="hotels",d?W.removeAttr("pos"):p&&"4"!=g?(0>g||"5"==g)&&W.setAttr("pos",p):(a=W.getAttr("ctyId"),r=f.findCityInfoById(a),h=r&&r.pos||{},W.setAttr("pos",{posty:o.MAP_SOURCE_ID,lon:h.lon||0,lat:h.lat||0,name:r.name+o.CITY_CENTER}))):(l=C,n="products",p&&0>g?W.setAttr("pos",p):W.removeAttr("pos")),e&&c.showBottomLoading(),W.setAttr("environment",t.environment),l.param=W.get(),d&&0===W.getAttr("ctype")&&(l.param.ctyId=0,l.param.ctyName="");var y=l.param.pageIdx;l.excute(function(t){var i=t;if(this.isLoading=!1,c.hideLoading(),e&&c.hideBottomLoading(),t&&t[n]&&t[n].length&&t.count&&+t.count>0){var r=f.getCurrentKeyWord();if(c.isFromKeywordSearch()&&r&&c.updateTitle(r.word,!1,t.count),this.isDataReady=!0,this.totalPages=Math.ceil(t.count/this.pageSize),this.totalPages>1&&$(window).bind("scroll",this.onWindowScroll),i.isNearBy=d,!e&&this.listWrap.empty(),this.renderList(i),d&&"8"==u&&1>=y){var a=t&&t.city&&t.city.cityid,o=t&&t.city&&t.city.cityName;a&&o&&(W.setAttr("ctyId",a),W.setAttr("ctyName",o)),a&&o&&!this.tuanfilters&&this.getConditionData(a)}s.setItem("hasListData",!0),W.getAttr("pageIdx")<=1&&!d&&c.displayGPSInfo(t.curpos||{},d)}else W.getAttr("pageIdx")>1?c.showToast("亲，数据加载完毕"):(this.totalPages||this.totalPages<=0)&&this.renderNoResult("",n),W.setAttr("pageIdx",1),this.isComplete=!0,$(window).unbind("scroll",this.onWindowScroll),d||c.displayGPSInfo(t.curpos||{},d);this.LazyLoad&&this.LazyLoad.updateDom()},function(t){this.hideLoading(),this.isLoading=!1,this.isComplete=!0,this.totalPages<=0&&(this.listWrap.empty(),this.renderNoResult(t.msg,n)),W.setAttr("pageIdx",1),$(window).unbind("scroll",this.onWindowScroll)},!!i,c)},renderNoResult:function(t,e,i){var r=f.getCurrentKeyWord();this.isFromKeywordSearch()&&r&&this.updateTitle(r.word,!1,0);var a={count:0,positionFilter:J.get()||{},weekendsAvailable:W.getAttr("weekendsAvailable"),keywordData:r};i=i||N.get()||{};var s=i&&i.distance&&i.distance.val;s=s||a.positionFilter.pos&&a.positionFilter.pos.distance,a[e]=null,a.noresult=t?t:(s?s+"公里内":"")+"没找到符合条件的结果，请修改条件重新查询",a.customFilter=i,this.renderList(a)},detailHandler:function(t){var e=$(t.currentTarget).attr("data-id"),i=W.getAttr("ctyId");this._saveScrollPos(),this.forwardJump("detail","/webapp/tuan/detail/"+e+".html"+(i?"?cityid="+i:""))},clearPagePos:function(){s.setItem(b,null)},_restoreScrollPos:function(){var t=s.getItem(b);t&&t.y&&setTimeout(function(){window.scrollTo(t.x,t.y)},0)},_saveScrollPos:function(){s.setItem(b,{x:window.scrollX,y:window.scrollY})},deleteFilter:function(t){var e=$(t.currentTarget),i=e.data("type"),r=this.$el.find("#J_filterTabLabel"),a=this.$el.find("#J_filterTabPanel");switch(i){case"position":J.remove(),this.tuanfilters&&this.tuanfilters.renderPosition(),this.tuanfilters&&(this.tuanfilters._positionInited=void 0);break;case"star":var s=N.getAttr("star");delete s[e.data("value")],$.isEmptyObject(s)?(N.removeAttr("star"),r.find('li[data-tab="star"] i').hide()):N.setAttr("star",s);break;case"weekendsAvailable":W.setAttr("weekendsAvailable",0);var o=this.$el.find("#weekends");o[0]&&(o[0].checked=!1);break;case"voucher":N.removeAttr("voucher");var n=this.$el.find("#voucher");n[0]&&(n[0].checked=!1);break;case"multiShop":N.removeAttr("multiShop");var l=this.$el.find("#multiShop");l[0]&&(l[0].checked=!1);break;case"keyword":f.removeCurrentKeyWord(),this.$el.find("#J_keywordSearch").val(""),this.updateTitle(W.getAttr("ctyName"),!0);break;case"feature":W.removeAttr("from_feature"),this.updateTitle(W.getAttr("ctyName"),!0);break;case"price":W.setAttr("qparams",[]),r.find('li[data-tab="price"] i').hide(),N.removeAttr("price"),this.updateTitle(W.getAttr("ctyName"),!0);break;default:N.removeAttr(i),r.find('li[data-tab="'+i+'"] i').hide()}this.tuanfilters&&(this.tuanfilters.renderTabWrap(i,a,!1),this.tuanfilters.updateCustomFilterIcon()),W.setAttr("qparams",f.getGroupQueryParam()),W.setAttr("pageIdx","1"),this.isLoading=!0,window.scrollTo(0,0),this.listWrap.empty(),this.showLoading(),this.hideBottomLoading(),this.getGroupListData()},renderHotWord:function(t){var e=W.getAttr("ctype");if($.isArray(t)&&t.length>0){var i=$.grep(t,function(t){return t.ItemType==e});i=i&&i[0],i&&i.KeyWords&&i.KeyWords.length&&(this.quickOpBar.show(),this.toolbarHeight+=this.toolbarHeight<45?45:0,this.toolbarSpace.css("height",this.toolbarHeight),i.CUR_HOTKEY=this.CUR_HOTKEY,this.quickWrapper.html(this.listTpl(i)),this.setQuickScroll())}},hotWordSearch:function(e){var i="",r=$(e.currentTarget);if(!r.hasClass("current")){var a=r.attr("data-type"),s=decodeURIComponent(r.attr("data-val"));if(r.addClass("current").siblings(".current").removeClass("current"),"json"===a){try{i=JSON.parse(s)}catch(o){window.console&&void 0}i&&$.isPlainObject(i)&&(this.CUR_HOTKEY=s,f.parseHotkeyJson(i),this.getGroupListData())}else"url"===a?t.jumpToPage(s,this):(this.CUR_HOTKEY="ALL",f.clearSpecified(!0),this.getGroupListData())}},homeHandler:function(){W.setAttr("pageIdx",1),$(window).unbind("scroll",this.onWindowScroll),f.clearSpecified(),t.tHome()},showCityPage:function(){this.forwardJump("citylist","/webapp/tuan/citylist")},showKeywordSearch:function(){this.forwardJump("keywordsearch","/webapp/tuan/keywordsearch")},showMore:function(t){$(t.currentTarget).hide().siblings("li").show()},getAppUrl:function(){var t=W.get(),e=t.ctype;return"ctrip://wireless/hotel_groupon_list?c1="+t.ctyId+"&c2="+e},initSearchGuider:function(){var t=this,e=this.$el.find("#J_searchGuider");S&&(e.css("background-position","100% -13px"),e.find(".icon_search_w").hide()),this.searchGuiderMask=new P({onCreate:function(){var t=this;this.root.on("click",function(){t.hide(),e.hide(),localStorage.setItem(A,1)})}}),this.searchGuiderMask.show(),e.show(),e.on("click",function(){t.searchGuiderMask.hide(),e.hide(),localStorage.setItem(A,1)})}})});