define(["TuanApp","c","TuanBaseView","cCommonPageFactory","StringsData","TuanStore","MemCache","AMapWidget","POIWidget","cUtility","cWidgetFactory","TuanModel","CommonStore","StoreManage"],function(e,t,r,a,i,n,s,o,c,d,h,l,p,g){var u,m={1:"landmarks_hotel",8:"landmarks_dining",7:"landmarks_vacation",6:"landmarks_ticket",9:"landmarks_recreation"},f={0:"团购商户",1:"酒店团购",8:"美食团购",7:"旅游度假团购",6:"门票团购",9:"娱乐团购"},y="current",k="gray",M=15,v="map_pshow",C=h.create("POIWidget"),w=n.GroupSearchStore.getInstance(),I=n.GroupGeolocation.getInstance(),A=n.GroupListStore.getInstance(),D=l.TuanPOIListModel.getInstance(),L=n.TuanHistoryCityListStore.getInstance(),S=n.GroupPositionFilterStore.getInstance(),b=n.GroupCategoryFilterStore.getInstance(),T=n.GroupCustomFilters.getInstance(),x=l.TuanLocalCityInfo.getInstance(),W=_.template(["查询：<%=place%>，","<%if(count>0){%>","共<%=count%>家商户<%if(count>50){%>，展示前<%=length%>家<%}%>","<%}else{%>","无<%=ctext%>，请滑动地图后查询","<%}%>"].join("")),O=_.template(['<div class="J_dotMarker" data-pid="<%=obj.id%>" style="width:21px; height:31px;">','<div class="ico_map2 J_detailMarker" style="display:none; -webkit-transform:translate(-50%, 0%)">',"<p><%=obj.shortName||obj.name%></p>","<p><dfn>¥</dfn><%=obj.price%></p>","</div>",'<div class="<%=MARKERS_CLS[obj.ctype] || MARKERS_CLS[1]%> J_simpleMarker"></div>',"</div>",'<div class="J_popMarker" data-pid="<%=obj.id%>" style="width:21px; height:31px;display:none">','<div class="ico_map" style="background-color:#fff;-webkit-transform:translate(-41%, -20px)">','<p class="ui-title"><%=obj.shortName||obj.name%></p>','<p class="ui-price"><dfn>¥</dfn><%=obj.price%></p>',"</div>","</div>"].join("")),P=_.template(['<img class="fx-drop" src="http://pic.c-ctrip.com/h5/tuan/hotel-map-locate2.png" style="width:14px;height:36px;">','<div class="ico_map2 J_centerMarkerTip" style="-webkit-transform:translate(-50%,-45px) !important;left:50%;max-width:none;display:none;"><p><%=obj.name%></p></div>'].join(""));o=h.create("AMapWidget");var J=a.create("TuanBaseView");return u=J.extend({pageid:"260002",hpageid:"261002",isScreenQuery:!1,poiMarkers:[],render:function(){this.mapWrap=this.$el.find("#J_map"),this.infoWrap=this.$el.find("#J_infoWrap"),this.btnSearch=this.$el.find("#J_btnSearch"),this.categoryWrap=this.$el.find("#J_category"),d.isInApp()&&e.isOverOS7()&&(this.$el.find("#J_listmapWrap").css({"padding-top":"20px","background-color":"#b3b3b3"}),this.$el.find("#J_return").css("top","30px"),this.infoWrap.css("top","30px"))},events:{"click #J_return":"returnHandler","click #J_btnSearch":"searchHandler","click #J_category>li":"categorySelectHandler"},returnHandler:function(){this.back("list")},searchHandler:function(){var e=this,t=g.isNearBy();t&&L.setAttr("nearby",!1),this.getDistance(),this.isScreenQuery=!0,this.loadingLayer.show();var r=this.getCenterMarkerData();this.reverseGeocode(r,function(t){r.name=t,e.center=r,e.selectCategory()})},getDistance:function(){var e=this.mapWidget,t=e.map,r=e.host,a=t.getCenter(),i=t.getBounds(),n=i.northeast,s=new r.LngLat(a.getLng(),n.getLat()),o=a.distance(s);this.distance=Math.round(o/10)/100},onCreate:function(){this.render(),this.createMap()},createPOI:function(){this.poi=new C({model:D,onSuccess:$.proxy(this.onPoiSuccess,this)})},onPoiSuccess:function(e){var t=this.btnSearch;e.count&&e.products.length?t.show():t.hide(),this.clearPOIMarkers(),this.loadingLayer.hide(),this.addPOIMarkers(e.products),s.setItem("POIDATA",e),this.center||(this.center=this.getCenterMarkerData()),this.addCenterMarker(this.center),this.isScreenQuery||this.mapWidget.setFitView(),this.getDistance();var r="";if(this.isScreenQuery)r=this.distance+"公里内";else{var a=S.get();a&&a.type?4==a.type||5==a.type?r=a.name:a.type<0&&-6!=a.type||19==a.type?r=a.name+"周边":-6==a.type&&(r=a.pos.distance+"公里内"):r=w.getAttr("ctyName")}var i=W({place:r,count:e.count,ctext:f[this.category],length:e.products.length});this.isTooLarge||this.infoWrap.show().text(i)},renderMarkerDOM:function(e){return e.MARKERS_CLS=m,O(e)},removeCurrentLocationTool:function(){var e=this.mapWidget,t=e&&e.geolocation;t&&(t._marker&&t._marker.setMap(null),t._circle&&t._circle.setMap(null))},clearPOIMarkers:function(){var e=this.mapWidget,t=this,r=this.poiMarkers;return r.forEach(function(r){e.removeMarker(r),e.removeEvent(r,"click",t.markerClickHandler)}),this.poiMarkers=[],this},addPOIMarkers:function(e){var t,r,a=this.mapWidget,i=this,n=a.host,s=this.poiMarkers;(e||[]).slice(0,50).forEach(function(e){t=e.pos,r=a.addMarker({position:new n.LngLat(t.lon,t.lat),content:i.renderMarkerDOM(e)}),a.addEvent(r,"click",function(e){return function(t){i.markerClickHandler(t,e)}}(r),i),s.push(r)}),this.poiMarkers=s},markerClickHandler:function(e,t){var r=e.originalEvent,a=this.currentMarker,i=this.currentMarkerDom,n=this.centerMarker,s=$(r.currentTarget||r.srcElement).children();this.isDetailView||s.data("isDetailView")?(this.isDetailView||$(r.target).parent(".J_detailMarker").length)&&this.gotoDetailPage(s.attr("data-pid")):(a&&a.setzIndex(1),i&&this.changeMarkerView(!1,i),t.setzIndex(9999),s.find(".J_detailMarker").show(),s.addClass(v),s.data("isDetailView",!0),this.currentMarker=t,this.currentMarkerDom=s,n&&n.tipDOM&&n.tipDOM.hide())},gotoDetailPage:function(e){this.forwardJump("detail","/webapp/tuan/detail/"+e+".html")},formatPOIData:function(e){var t=this.mapWidget.host;return e.map(function(e){return{position:new t.LngLat(e.lon,e.lat),content:e.shortName||e.name}})},categorySelectHandler:function(e){var t=$(e.target);this.isTooLarge||(this.clearPOIMarkers(),this.category=t.attr("data-type"),w.setAttr("ctype",this.category),b.setAttr("tuanType",this.category),b.setAttr("category",t.attr("data-category")),b.setAttr("name",t.attr("data-name")),b.setAttr("tuanTypeIndex",t.attr("data-index")),this.selectCategory())},selectCategory:function(){var e=this.categoryWrap,t=this.category,r=e.find('li[data-type="'+t+'"]');0!==parseInt(t,10)?(e.find("li").addClass(k),r.removeClass(k)):e.find("li").removeClass(k),this.poi&&this.poi.abort(),this.centerMarker&&this.centerMarker.setMap(null),this.selectedCategoryItem&&this.selectedCategoryItem.removeClass(y),r.addClass(y),this.poi.query(this.getParams()),this.selectedCategoryItem=r},getParams:function(){var e,t,r=w.get(),a=S.get(),n=r.ctyId;if(a&&a.name){if(a.ctyId==n&&8!=r.sortRule){var s=a&&a.type;5==s&&(r.pos=a.pos),(4==s||19==s)&&(e=g.findCityInfoById(n),t=e&&e.pos||{},r.pos={posty:i.MAP_SOURCE_ID,lon:t.lon||0,lat:t.lat||0,name:e.name+i.CITY_CENTER})}}else e=g.findCityInfoById(n),t=e&&e.pos||{},r.pos={posty:i.MAP_SOURCE_ID,lon:t.lon||0,lat:t.lat||0,name:e.name+i.CITY_CENTER};return r},getCenterMarkerData:function(){var e,t,r,a,n=g.isNearBy(),s=I.getAttr("gps"),o=S.getAttr("pos"),c=S.getAttr("type"),d=S.getAttr("name");return this.isScreenQuery?(r=this.mapWidget.map.getCenter(),a={lon:r.getLng(),lat:r.getLat(),distance:this.distance}):(n?(a=s,a.name=s.address||"",delete a.address):o&&"4"!=c&&"19"!=c?(0>c||"5"==c)&&(a=o,a.name=d):(t=w.getAttr("ctyId"),e=g.findCityInfoById(t),e&&(a=e.pos,a.name=e.name+i.CITY_CENTER)),a&&!a.lon&&(a.lon=a.lng||0),a||{})},needShowMarkerDetail:function(e){return e>=M},createMap:function(){var e,r,a=this,i=A.getAttr("curpos"),n=a.btnSearch,s=a.infoWrap,c=a.mapWrap;a.container=c,a.mapWidget=new o({container:c,height:document.body.clientHeight+(d.isInApp()?48:0),center:i?i.lon+"|"+i.lat:"116.397428|39.90923",locationButton:'<div class="map_curpos_btn" style="opacity: 0.8; cursor: pointer;"></div>',onReady:function(){setTimeout(function(){a.createPOI(),a.selectCategory()},0)},onZoom:function(e,t){a.needShowMarkerDetail(t)?(a.changeMarkerView(!1,a.currentMarkerDom),a.changeMarkerView(!0)):a.changeMarkerView(!1),10>t?(s.show(),s.addClass("map_tips02"),s.text("当前范围过大，请放大地图查询"),a.isTooLarge=!0,n.hide()):(a.isTooLarge&&s.hide(),a.isTooLarge=!1,a.isScreenQuery&&s.hide(),s.removeClass("map_tips02"),n.show())},onMovestart:function(){a.poiMarkers.length||a.isTooLarge||n.show()},onClick:function(){var e=a.centerMarker;e&&e.tipDOM&&e.tipDOM.hide(),!a.isDetailView&&a.currentMarkerDom&&a.changeMarkerView(!1,a.currentMarkerDom)},onGeoBegin:function(a){a=$(a).children(),a.css("background-color","#1491c5"),e=a,r=new t.ui.LoadingLayer(function(){this.hide()},"定位中...")},onGeoComplete:function(){r&&r.hide(),e&&e.css("background-color","rgba(0,0,0,.8)"),this.setFitView()},onGeoError:function(){a.showToast("无法获取您的位置，请稍后重试"),e&&e.css("background-color","rgba(0,0,0,.8)")}})},changeMarkerView:function(e,t){var r=this.isDetailView,a=this.container;t?(a=t,r=t.data("isDetailView"),t.data("isDetailView",!!e),t[e?"addClass":"removeClass"](v)):this.isDetailView=!!e,r!==e&&(a.find(".J_detailMarker")[e?"show":"hide"](),a.find(".J_simpleMarker")[e?"hide":"show"](),a.find(".J_dotMarker")[e?"hide":"show"](),a.find(".J_popMarker")[e?"show":"hide"]())},addCenterMarker:function(e){var t,r=this.mapWidget,a=Number(e.lon),i=Number(e.lat);return a&&i?(this.centerMarker&&this.centerMarker.setMap(null),t=r.addMarker({position:new r.host.LngLat(a,i),offset:{x:-7,y:-36},content:P({name:e.name||e.address})}),r.addEvent(t,"click",this.centerMarkerHandler,this),void(this.centerMarker=t)):(r.map.setCenter(new r.host.LngLat(103.38861111111,35.563611111111)),void r.map.setZoom(3))},centerMarkerHandler:function(e){var t=$(e.originalEvent.currentTarget).find(".J_centerMarkerTip"),r=this.currentMarker,a=this.currentMarkerDom;r&&r.setzIndex(1),a&&this.changeMarkerView(!1,a),t.show(),e.target.tipDOM=t},onShow:function(){this.refer=this.getLastViewName(),this.header&&this.header.hide(),this.category=w.getAttr("ctype"),this.loadingLayer=new t.ui.LoadingLayer(function(){this.hide(),this.poi&&this.poi.abort()},"查询中..."),this.isScreenQuery=!1},onHide:function(){!d.isInApp()&&this.header&&this.header.rootBox&&this.header.rootBox.show(),this.clearPOIMarkers(),this.removeCurrentLocationTool()},isDetailBack:function(){var e=this.refer;return e&&e.match(/detail/i)},reverseGeocode:function(e,t){var r=this,a=this.mapWidget.map,i=new this.mapWidget.host.LngLat(e.lon,e.lat);a.plugin(["AMap.Geocoder"],function(){var a=new AMap.Geocoder({radius:1e3,extensions:"all"});AMap.event.addListener(a,"complete",function(a){r.getCityInfo(e,a.regeocode,t)}),a.getAddress(i)})},getCityInfo:function(e,t,r){var a=this;x.setParam({lng:e.lon,lat:e.lat,district:encodeURIComponent(t.addressComponent.district),cityname:encodeURIComponent(t.addressComponent.city),province:encodeURIComponent(t.addressComponent.province),isOverseas:!t.formattedAddress}),x.excute(function(i){if(i&&i.CityID&&i.CityID>0){g.setCurrentCity(i),w.setAttr("ctyId",i.CityID),w.setAttr("ctyName",i.CityName);var n={lat:e.lat,lon:e.lon,name:t.formattedAddress,distance:a.distance};w.setAttr("pos",n),S.set({type:-6,name:t.formattedAddress,pos:n});for(var s=w.getAttr("qparams")||[],o=0,c=s.length;c>o;o++){var d=s[o].type;if(5==d||4==d||19==d||9==d||7==d){s.splice(o,1),7==d&&g.removeCurrentKeyWord();break}}T.removeAttr("distance"),w.setAttr("qparams",s)}"function"==typeof r&&r.call(a,t.formattedAddress)},function(){},!1,this)}})});