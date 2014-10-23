define(["TuanApp","c","TuanBaseView","cCommonPageFactory","cWidgetGuider","MemCache","cUtility","cGeoService","cWidgetFactory","cUIToast","TuanStore","TuanModel","TuanFilters","StoreManage","LazyLoad","ScrollObserver","text!ListProductTpl","text!ListBusinessTpl","cWidgetGeolocation"],function(e,t,n,r,i,s,o,u,a,f,l,c,h,p,d,v,m,g){var y="ani_rotation",b="PAGE_LIST_POSITION",w=t.ui,E=o.isInApp(),S=o.getAppSys()==="youth",x=c.TuanListModel.getInstance(),T=c.TuanHotelListModel.getInstance(),N=l.GroupSortStore.getInstance(),C=c.TuanLocalCityInfo.getInstance(),k=l.GroupSearchStore.getInstance(),L=l.GroupCategoryFilterStore.getInstance(),A=l.OrderDetailReturnPage.getInstance(),O=c.TuanCityListModel.getInstance(),M=l.GroupPositionFilterStore.getInstance(),D=l.GroupCustomFilters.getInstance(),P=c.TuanConditionModel.getInstance(),H=l.GroupConditionStore.getInstance(),B=l.GroupGeolocation.getInstance(),j=l.TuanPositionStore.getInstance(),F=l.TuanHistoryCityListStore.getInstance(),I=l.GroupGeolocation.getInstance(),q,R={tuangou:"团购",youAreHere:"您的位置 ",cityCenter:"市中心",titleArray:{0:"全部团购",1:"酒店",8:"美食",7:"旅游度假",6:"门票",9:"娱乐",106:"一元团购",108:"本周新单"}},U=4,z=U+"公里内",W=3,X=a.create("Guider"),V={id:2,name:"上海"},J=u.GeoLocation,K=r.create("TuanBaseView");return q=K.extend({pageid:"214001",hpageid:"215001",totalPages:null,isComplete:!1,isLoading:!1,isScrolling:!1,pageSize:25,render:function(){var e=this.$el;this.listWrap=e.find("#J_listWrap"),this.filterWrap=e.find(".J_filtersAndSortPanel"),this.productListTpl=_.template(m),this.businessListTpl=_.template(g),this.gpsInfoWrap=e.find("#J_gpsInfoWrap")},events:{"click li[data-id]":"detailHandler","click #J_reloadGPS":"refreshGeolocation","click #J_keywordSearch":"showKeywordSearch","click .cui-btns-retry":"reloadPage","click .J_showMore":"showMore","click .J_phone":"callPhone","click #J_deleteFilter li":"deleteFilter"},callPhone:function(e){X.apply({hybridCallback:function(){var t="data-phone",n=$(e.target);return n.attr(t)||(n=n.find("["+t+"]")),e.preventDefault(),X.callPhone({tel:n.attr(t)}),!1},callback:function(){return!0}})},createGPS:function(){this.gps=a.create("Geolocation")},getLocalCityInfo:function(e,t){var n=this,r,i,s=this.gpsReloadBtn;r=function(e){s.removeClass(y),p.setCurrentCity(e),j.setAttr("cityId",e.CityID),j.setAttr("cityName",e.CityName),j.setAttr("hasGroupProduct",e.HasGroupProduct),k.setAttr("ctyId",e.CityID),k.setAttr("ctyName",e.CityName),t&&t()},i=function(){s.removeClass(y),j.setAttr("cityId",null),j.setAttr("cityName",null),n.showToast("抱歉，获取不到当前位置!")},C.setParam({lng:e.lng,lat:e.lat,district:encodeURIComponent(e.district),cityname:encodeURIComponent(e.city),province:encodeURIComponent(e.province),isOverseas:e.isOverseas}),C.excute(r,i,!1,this)},isCurrentCityChange:function(){var e=p.getCurrentCity(),t=e.CityId;return t&&t!=k.getAttr("ctyId")},positionSearchPanel:function(e){var t=this,n=e.direction;n.toLowerCase()=="up"&&e.y>30?(t.keywordPanel.addClass("list_s_fixed"),t.keywordPanel.css("top",!E&&t.isNearBy()?"78px":E?"0":"48px")):(t.keywordPanel.removeClass("list_s_fixed"),t.keywordPanel.css("top","0"))},refreshGeolocation:function(e){var t=$(e.target),n=this;t.addClass(y),this.getGeolocation(function(){n.getGroupListData()})},getGeolocation:function(e){var t=this,n=this.$el.find("#J_gpsInfo"),r,i;r=function(n){t.displayGPSInfo(n,!0,e)},i=function(){j.set(null),n.parent().find("."+y).removeClass(y),t.showToast("抱歉，获取不到当前位置，请打开GPS后重试!")},J.Subscribe("tuan/list",{onComplete:function(e){r(e)},onError:i,onPosComplete:function(e,t){},onPosError:i},this,!0)},displayGPSInfo:function(e,t,n){var r=this.gpsInfoWrap,i=this.gpsReloadBtn,s=k.getAttr("ctyName")||"",o=M.get(),u="距离: ";e=e||{},i[t?"show":"hide"](),t&&e?u+=R.youAreHere+e.address:o&&o.name?o.type!=4?u+=o.pos&&o.pos.name||o.name:u+=s+R.cityCenter:e.address?u+=e.address==s?s+R.cityCenter:e.address:u+=(s||"")+R.cityCenter,r.html(u);if(t){e.city=e.city&&e.city.replace("市",""),j.set(e),B.setAttr("gps",e);var a={lng:e.lng,lat:e.lat,district:e.district,city:e.city,province:e.province,isOverseas:e.country!="中国"};this.getLocalCityInfo(a,n)}},fallbackAddress:function(e){return(e.city||k.getAttr("ctyName")||"")+R.cityCenter},initTuanFilters:function(){var e=this.$el;this.tuanfilters?this.hideFilterDropDowns():this.tuanfilters=h.getInstance({sortTrigger:e.find("#J_sortTrigger"),sortPanel:e.find("#J_sortPanel"),sortLabel:e.find("#J_sortTrigger"),categoryTrigger:e.find("#J_categoryTrigger"),categoryPanel:e.find("#J_categoryPanel"),positionTrigger:e.find("#J_positionTrigger"),positionPanel:e.find("#J_positionPanel"),customFilter:e.find("#J_customFilters"),filterPanel:e.find("#J_filterPanel"),page:this,sortDefaultIndex:N.getAttr("sortTypeIndex")||0})},hideFilterDropDowns:function(){var e=this.tuanfilters;e.sort.hide()},onCreate:function(){var t=this.$el;k.setAttr("pageIdx",1),this.onWindowScroll=$.proxy(this._onWindowScroll,this),this.isNearBy()&&this.createGPS(),this.render(),e.saveUnion(!0),this.gpsInfoWrap.css("top",E?"0px":"48px"),E&&(t.find("#J_searchBoxWrap").addClass("hybrid"),e.initVoiceSearch&&e.initVoiceSearch(t.find("#J_voiceTrigger")))},isFromDetail:function(e){return e&&e.match(/detail|listmap/i)},controlGPSInfoWrap:function(e){this.gpsInfoWrap.css("display",e?"":"none")},getCurrentCity:function(e){var t={id:e.ctyId,name:e.ctyName},n=this.getQuery("cityid");return n&&+n>0&&(t=p.findCityInfoById(n)),+t.id||(t=V),t},isNearBy:function(){return k.getAttr("nearby")||F.getAttr("nearby")},isFromHybridFavorPage:function(){return E&&Lizard.P("from_native_page")==1},updateTitle:function(t){var n=this;this.header.set({title:t.indexOf(R.tuangou)>-1?t:t+R.tuangou,back:!0,view:this,events:{returnHandler:function(){n.isNearBy()&&(k.removeAttr("nearby"),F.removeAttr("nearby")),n.clearPagePos();if(n.isFromHybridFavorPage()){X.backToLastPage({param:JSON.stringify({biz:"tuan",refresh:"1"})});return}var t=Lizard.P("from");t?e.jumpToPage(t,n):n.back("home")},homeHandler:$.proxy(n.homeHandler,n),commitHandler:function(){n.gotoMapPage()}},btn:{title:"地图",id:"J_gotoMapPage",classname:"rightblue"}}),this.header.show()},gotoMapPage:function(){this.isDataReady&&this.forwardJump("listmap","/webapp/tuan/listmap")},createPage:function(){var e=k.get(),t=e.ctype,n=e.ctyId||V.id,r=this.isNearBy(),i=R.titleArray[t]||R.titleArray[0];D.getAttr("price.val")=="1|1"&&(i="一元团购"),this.updateTitle(i),this.initKeywordSearch(),this.hideForbiddens(!r,".J_forbidden"),this.keywordPanel=this.$el.find("#J_keywordSearchPanel");if(r)this.getGroupListData();else{if(Lizard.P("cityid")){var s=p.getGroupQueryParam();k.setAttr("qparams",s)}this.getGroupListData(),this.getConditionData(n)}},hideForbiddens:function(e,t){this.$el.find(t)[e?"hide":"show"]()},getConditionData:function(e){P.setParam("ctyId",e);var t=1;t|=2,t|=4,t|=8,t|=64,t|=128,P.setParam("type",t),P.setParam("categroy",k.getAttr("ctype")),P.excute(function(e){this.initTuanFilters()},function(e){},!1,this)},renderPageByCity:function(){var e=this;O.excute(function(t){e.createPage(t)},function(t){e.createPage(t)},!1,this)},onHide:function(){J.UnSubscribe("tuan/list"),this.$el.find("#J_reloadGPS").removeClass(y);var e=this.tuanfilters,t=e&&e.sort;this.LazyLoad&&this.LazyLoad.unbindEvents(),$(window).unbind("scroll",this.onWindowScroll),this.hideWarning404(),this.hideLoading(),this.scrollObserver&&this.scrollObserver.disable(),this.alert&&this.alert.hide(),t&&t.mask.root&&t.mask.root.hide(),e&&e.mask&&e.mask.hide()},onShow:function(e){e=e||this.getLastViewName(),this.referUrl=e,this.gpsInfoWrap=this.$el.find("#J_gpsInfo"),this.gpsReloadBtn=this.$el.find("#J_reloadGPS");var t=this,n,r=B.getAttr("gps");A&&A.remove();if(k.getAttr("from_feature")){this.emptyPage("当地特色",k.getAttr("ctyName"));return}if(!this.isFromDetail(e)||!s.getItem("hasListData"))this.showLoading(),this.listWrap.empty(),k.setAttr("pageIdx",1),p.saveQueryString(function(){n=t.isNearBy();if(n&&r){var e=t.gpsInfoWrap,i=t.gpsReloadBtn,s=I.getAttr("gps"),o="距离: ";i.show(),o+=R.youAreHere+s.address,e.html(o)}if(N.getAttr("sortTypeIndex")==null&&t.isNearBy()){k.setAttr("sortRule",8),N.setAttr("sortTypeIndex",1);if(t.tuanfilters){var u=$(t.tuanfilters.sort.getItemByIndex(1))[0];t.tuanfilters.sort.select(u,!0)}}t.renderPageByCity()});else{var i=k.getAttr("ctype"),o=R.titleArray[i]||R.titleArray[0];D.getAttr("price.val")=="1|1"&&(o="一元团购"),this.updateTitle(o),this._restoreScrollPos()}this.LazyLoad=new d({wrap:this.$el,animate:"opacity-fade-in"}),$(window).bind("scroll",this.onWindowScroll),this.scrollObserver&&this.scrollObserver.enable()},_onWindowScroll:function(){var e=t.ui.Tools.getPageScrollPos(),n=k.get(),r=isNaN(n.pageIdx)?1:n.pageIdx;n.pageIdx<this.totalPages&&this.totalPages>1&&(this.isComplete=!1);var i=e.pageHeight-(e.top+e.height);if(i<=300&&!this.isComplete&&!this.isLoading){this.isLoading=!0;if(n.pageIdx>=this.totalPages){this.isComplete=!0;return}n.pageIdx=++r,k.setAttr("pageIdx",n.pageIdx),this.getGroupListData(!0)}},showBottomLoading:function(){this.bottomLoading||(this.bottomLoading=$('<div style="bottom: 48px;" class="cui-zl-load"> <div class="cui-i cui-b-loading"></div><div class="cui-i cui-mb-logo"></div> <p>加载中…</p></div>'),this.$el.append(this.bottomLoading)),this.bottomLoading.show()},hideBottomLoading:function(){this.bottomLoading&&this.bottomLoading.hide()},reloadPage:function(){this.showLoading(),this.getGroupListData(!1,!0)},renderList:function(e){var t=k.get(),n=t.sortRule;e.pageIdx=t.pageIdx;var r=$.trim(this[n=="8"?"businessListTpl":"productListTpl"](e));e.count&&+e.count>0&&this.totalPages&&+this.totalPages>1?n=="8"?this.listWrap.append(r):e.pageIdx>1?this.listWrap.find("ul").append(r):this.listWrap.append(r):(!this.totalPages||+this.totalPages<1||!t.pageIdx||+t.pageIdx<=1)&&this.listWrap.html(r),e.count>0&&e.pageIdx>=this.totalPages&&this.listWrap.append('<p class="sec-waiting" style="display:block;">没有更多结果了</p>')},isDataReady:!1,getGroupListData:function(t,n){var r,i,o,u,a=this,f=a.isNearBy(),l=I.getAttr("gps"),c=k.getAttr("sortRule"),h=M.getAttr("pos"),d=M.getAttr("type");c=="8"?(u=T,o="hotels",f?k.removeAttr("pos"):!h||d=="4"?(i=k.getAttr("ctyId"),r=p.findCityInfoById(i),l=r&&r.pos||{},k.setAttr("pos",{posty:W,lon:l.lon||0,lat:l.lat||0,name:r.name+R.cityCenter})):(d=="-1"||d=="5")&&k.setAttr("pos",h)):(u=x,o="products",h&&d=="-1"?k.setAttr("pos",h):k.removeAttr("pos")),S&&k.setAttr("sortType","8"),t&&a.showBottomLoading(),k.setAttr("environment",e.environment),u.param=k.get(),f&&k.getAttr("ctype")==0&&(u.param.ctyId=0,u.param.ctyName="");var v=u.param.pageIdx;u.excute(function(e){var n=e;this.isLoading=!1,a.hideLoading(),t&&a.hideBottomLoading();if(e&&e[o]&&e[o].length&&e.count&&+e.count>0){this.isDataReady=!0,this.totalPages=Math.ceil(e.count/this.pageSize),this.totalPages>1&&$(window).bind("scroll",this.onWindowScroll),n.isNearBy=f,!t&&this.listWrap.empty(),this.renderList(n);if(f&&c=="8"&&v<=1){var r=e&&e.city&&e.city.cityid,i=e&&e.city&&e.city.cityName;r&&i&&(k.setAttr("ctyId",r),k.setAttr("ctyName",i),this.tuanfilters||this.getConditionData(r))}s.setItem("hasListData",!0),k.getAttr("pageIdx")<=1&&!f&&a.displayGPSInfo(e.curpos||{},f)}else{if(k.getAttr("pageIdx")>1)a.showToast("亲，数据加载完毕");else if(this.totalPages||this.totalPages<=0){var u=D.get()||{},l=u&&u.distance&&u.distance.val;lst={},lst.msg=(l?l+"公里内":"")+"没找到符合条件的结果，请修改条件重新查询",lst[o]=null,lst.count=0,lst.customFilter=u,lst.positionFilter=M.get(),lst.weekendsAvailable=k.getAttr("weekendsAvailable"),lst.keywordData=p.getCurrentKeyWord(),this.renderList(lst)}k.setAttr("pageIdx",1),this.isComplete=!0,$(window).unbind("scroll",this.onWindowScroll),f||a.displayGPSInfo(e.curpos||{},f)}this.LazyLoad&&this.LazyLoad.updateDom()},function(e){this.hideLoading(),this.isLoading=!1,this.isComplete=!0;var t={},n=D.get()||{},r=n&&n.distance&&n.distance.val;this.totalPages<=0&&(t.msg=e.msg?e.msg:(r?r+"公里内":"")+"没找到符合条件的结果，请修改条件重新查询",t[o]=null,t.count=0,t.customFilter=n,t.positionFilter=M.get(),t.weekendsAvailable=k.getAttr("weekendsAvailable"),t.keywordData=p.getCurrentKeyWord(),this.listWrap.empty(),this.renderList(t)),k.setAttr("pageIdx",1),$(window).unbind("scroll",this.onWindowScroll)},!!n,a)},emptyPage:function(e,t){var n=D.get()||{},r={};r.msg="没找到符合条件的结果，请修改条件重新查询",r.hotels=null,r.count=0,r.customFilter={feature:{val:"",txt:e}},r.positionFilter=M.get(),r.weekendsAvailable=k.getAttr("weekendsAvailable"),r.keywordData=p.getCurrentKeyWord(),this.renderList(r),this.updateTitle(e),this.gpsInfoWrap.text("距离："+t+R.cityCenter)},initKeywordSearch:function(){var e=this.$el.find("#J_keywordSearch"),t=p.getCurrentKeyWord();this.searchKeywordInput=e,w.InputClear(e),e.val(t&&t.word||"")},detailHandler:function(e){var t=$(e.currentTarget).attr("data-id"),n=k.getAttr("ctyId");this._saveScrollPos(),this.forwardJump("detail","/webapp/tuan/detail/"+t+".html"+(n?"?cityid="+n:""))},clearPagePos:function(){s.setItem(b,null)},_restoreScrollPos:function(){var e=s.getItem(b);e&&e.y&&setTimeout(function(){window.scrollTo(e.x,e.y)},0)},_saveScrollPos:function(){s.setItem(b,{x:window.scrollX,y:window.scrollY})},deleteFilter:function(e){var t=$(e.currentTarget),n=t.data("type"),r=this.$el.find("#J_filterTabLabel"),i=this.$el.find("#J_filterTabPanel");switch(n){case"position":M.remove(),this.tuanfilters&&this.tuanfilters.renderPosition(),this.tuanfilters&&(this.tuanfilters._positionInited=undefined);break;case"star":var s=D.getAttr("star");delete s[t.data("value")],$.isEmptyObject(s)?(D.removeAttr("star"),r.find('li[data-tab="star"] i').hide()):D.setAttr("star",s);break;case"weekendsAvailable":k.setAttr("weekendsAvailable",0),this.$el.find("#weekends")[0].checked=!1;break;case"voucher":D.removeAttr("voucher"),this.$el.find("#voucher")[0].checked=!1;break;case"multiShop":D.removeAttr("multiShop"),this.$el.find("#multiShop")[0].checked=!1;break;case"keyword":p.removeCurrentKeyWord(),this.$el.find("#J_keywordSearch").val("");break;case"feature":k.removeAttr("from_feature"),this.updateTitle(R.titleArray[0]);break;case"price":k.setAttr("qparams",[]),r.find('li[data-tab="price"] i').hide(),D.removeAttr("price"),this.updateTitle(R.titleArray[0]);break;default:D.removeAttr(n),r.find('li[data-tab="'+n+'"] i').hide()}this.tuanfilters&&(this.tuanfilters.renderTabWrap(n,i,!1),this.tuanfilters.updateCustomFilterIcon()),k.setAttr("qparams",p.getGroupQueryParam()),k.setAttr("pageIdx","1"),this.isLoading=!0,window.scrollTo(0,0),this.listWrap.empty(),this.showLoading(),this.hideBottomLoading(),this.getGroupListData()},homeHandler:function(){k.setAttr("pageIdx",1),$(window).unbind("scroll",this.onWindowScroll),p.clearSpecified(),e.tHome()},showCityPage:function(){this.forwardJump("citylist","/webapp/tuan/citylist")},showKeywordSearch:function(e){this.forwardJump("keywordsearch","/webapp/tuan/keywordsearch")},showMore:function(e){$(e.currentTarget).hide().siblings("li").show()},getAppUrl:function(){var e=k.get(),t=e.ctype;return"ctrip://wireless/hotel_groupon_list?c1="+e.ctyId+"&c2="+t}}),q});