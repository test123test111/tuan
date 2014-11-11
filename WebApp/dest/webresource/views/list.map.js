define(["TuanApp","c","TuanBaseView","cCommonPageFactory","StringsData","TuanStore","MemCache","AMapWidget","POIWidget","cUtility","cWidgetFactory","TuanModel","CommonStore","StoreManage"],function(e,t,n,r,i,s,o,u,a,f,l,c,h,p){var d={1:"landmarks_hotel",8:"landmarks_dining",7:"landmarks_vacation",6:"landmarks_ticket",9:"landmarks_recreation"},v={0:"团购商户",1:"酒店团购",8:"美食团购",7:"旅游度假团购",6:"门票团购",9:"娱乐团购"},m="current",g="gray",y=15,b="map_pshow",w="ani_rotation",E,u=l.create("AMapWidget"),S=l.create("POIWidget"),x=s.GroupSearchStore.getInstance(),T=s.GroupGeolocation.getInstance(),N=s.GroupListStore.getInstance(),C=c.TuanPOIListModel.getInstance(),k=s.TuanHistoryCityListStore.getInstance(),L=s.GroupPositionFilterStore.getInstance(),A=s.GroupCategoryFilterStore.getInstance(),O=c.TuanLocalCityInfo.getInstance(),M=_.template(["查询：<%=distance%>公里内，","<%if(count>0){%>","共<%=count%>家商户<%if(count>50){%>，展示前<%=length%>家<%}%>","<%}else{%>","无<%=ctext%>，请滑动地图后查询","<%}%>"].join("")),D=_.template(['<div class="J_dotMarker" data-pid="<%=obj.id%>" style="width:21px; height:31px;">','<div class="ico_map2 J_detailMarker" style="display:none; -webkit-transform:translate(-50%, 0%)">',"<p><%=obj.shortName||obj.name%></p>","<p><dfn>¥</dfn><%=obj.price%></p>","</div>",'<div class="<%=MARKERS_CLS[obj.ctype] || MARKERS_CLS[1]%> J_simpleMarker"></div>',"</div>",'<div class="J_popMarker" data-pid="<%=obj.id%>" style="width:21px; height:31px;display:none">','<div class="ico_map" style="background-color:#fff;-webkit-transform:translate(-41%, -20px)">','<p class="ui-title"><%=obj.shortName||obj.name%></p>','<p class="ui-price"><dfn>¥</dfn><%=obj.price%></p>',"</div>","</div>"].join("")),P=_.template(['<img class="fx-drop" src="http://pic.c-ctrip.com/h5/tuan/hotel-map-locate2.png" style="width:14px;height:36px;">','<div class="ico_map2 J_centerMarkerTip" style="-webkit-transform:translate(-50%,-45px) !important;left:50%;max-width:none;display:none;"><p><%=obj.name%></p></div>'].join("")),H=r.create("TuanBaseView");return E=H.extend({pageid:"260002",hpageid:"261002",isScreenQuery:!1,render:function(){this.mapWrap=this.$el.find("#J_map"),this.infoWrap=this.$el.find("#J_infoWrap"),this.btnSearch=this.$el.find("#J_btnSearch"),this.categoryWrap=this.$el.find("#J_category"),f.isInApp()&&$.os&&$.os.ios&&parseInt($.os.version,10)>=7&&(this.$el.find("#J_listmapWrap").css({"padding-top":"20px","background-color":"#b3b3b3"}),this.$el.find("#J_return").css("top","30px"),this.infoWrap.css("top","30px"))},events:{"click #J_return":"returnHandler","click #J_btnSearch":"searchHandler","click #J_category>li":"categorySelectHandler"},returnHandler:function(){this.back("list")},searchHandler:function(){var e=this,t=p.isNearBy();t&&k.setAttr("nearby",!1),this.getDistance(),this.isScreenQuery=!0,this.loadingLayer.show();var n=this.getCenterMarkerData();this.reverseGeocode(n,function(t){n.name=t,e.center=n,e.selectCategory()})},getDistance:function(){var e=this.mapWidget,t=e.map,n=e.host,r=t.getCenter(),i=t.getBounds(),s=i.northeast,o=new n.LngLat(r.getLng(),s.getLat()),u=r.distance(o);this.distance=Math.round(u/10)/100},onCreate:function(){this.render(),this.createMap()},createPOI:function(){this.poi=new S({model:C,onSuccess:$.proxy(this.onPoiSuccess,this)})},onPoiSuccess:function(e){var t=this,n=this.btnSearch;!e.count||!e.products.length?n.hide():n.show(),this.clearPOIMarkers(),this.loadingLayer.hide(),this.addPOIMarkers(e.products),o.setItem("POIDATA",e),this.center||(this.center=this.getCenterMarkerData()),this.addCenterMarker(this.center),this.isScreenQuery||this.mapWidget.setFitView(),this.getDistance();var r=M({distance:this.isScreenQuery?this.distance:50,count:e.count,ctext:v[this.category],length:e.products.length});this.isTooLarge||this.infoWrap.show().text(r)},poiMarkers:[],renderMarkerDOM:function(e){return e.MARKERS_CLS=d,D(e)},removeCurrentLocationTool:function(){var e=this.mapWidget,t=e&&e.geolocation;t&&(t._marker&&t._marker.setMap(null),t._circle&&t._circle.setMap(null))},clearPOIMarkers:function(){var e=this.mapWidget,t=this,n=this.poiMarkers;return n.forEach(function(n){e.removeMarker(n),e.removeEvent(n,"click",t.markerClickHandler)}),this.poiMarkers=[],this},addPOIMarkers:function(e){var t=this.mapWidget,n=this,r=t.host,i=this.poiMarkers,s,o;(e||[]).slice(0,50).forEach(function(e){s=e.pos,o=t.addMarker({position:new r.LngLat(s.lon,s.lat),content:n.renderMarkerDOM(e)}),t.addEvent(o,"click",function(e){return function(t){n.markerClickHandler(t,e)}}(o),n),i.push(o)}),this.poiMarkers=i},markerClickHandler:function(e,t){var n=e.originalEvent,r=this.currentMarker,i=this.currentMarkerDom,s=this.centerMarker,o=$(n.currentTarget||n.srcElement).children();!this.isDetailView&&!o.data("isDetailView")?(r&&r.setzIndex(1),i&&this.changeMarkerView(!1,i),t.setzIndex(9999),o.find(".J_detailMarker").show(),o.addClass(b),o.data("isDetailView",!0),this.currentMarker=t,this.currentMarkerDom=o,s&&s.tipDOM&&s.tipDOM.hide()):(this.isDetailView||$(n.target).parent(".J_detailMarker").length)&&this.gotoDetailPage(o.attr("data-pid"))},gotoDetailPage:function(e){this.forwardJump("detail","/webapp/tuan/detail/"+e+".html")},formatPOIData:function(e){var t=this.mapWidget.host;return e.map(function(e){return{position:new t.LngLat(e.lon,e.lat),content:e.shortName||e.name}})},categorySelectHandler:function(e){var t=$(e.target);if(this.isTooLarge)return;this.clearPOIMarkers(),this.category=t.attr("data-type"),x.setAttr("ctype",this.category),A.setAttr("tuanType",this.category),A.setAttr("category",t.attr("data-category")),A.setAttr("name",t.attr("data-name")),A.setAttr("tuanTypeIndex",t.attr("data-index")),this.selectCategory()},selectCategory:function(){var e=this.categoryWrap,t=this.category,n=e.find('li[data-type="'+t+'"]');t!=0?(e.find("li").addClass(g),n.removeClass(g)):e.find("li").removeClass(g),this.poi&&this.poi.abort(),this.centerMarker&&this.centerMarker.setMap(null),this.selectedCategoryItem&&this.selectedCategoryItem.removeClass(m),n.addClass(m),this.poi.query(t,x.get()),this.selectedCategoryItem=n},getCenterMarkerData:function(){var e=p.isNearBy(),t,n,r,s,o=T.getAttr("gps"),u=L.getAttr("pos"),a=L.getAttr("type"),f;if(this.isScreenQuery)return r=this.mapWidget.map.getCenter(),f={lon:r.getLng(),lat:r.getLat(),distance:this.distance},f;if(e)f=o,f.name=o.address||"",delete f.address;else if(!u||a=="4"||a=="19")n=x.getAttr("ctyId"),t=p.findCityInfoById(n),f=t&&t.pos,f.name=t.name+i.CITY_CENTER;else if(a<0||a=="5")f=u;return f&&!f.lon&&(f.lon=f.lng||0),f||{}},needShowMarkerDetail:function(e){return e>=y},createMap:function(){var e=this,n,r,i=N.getAttr("curpos"),s=e.btnSearch,o=e.infoWrap,a=e.mapWrap;e.container=a,e.mapWidget=new u({container:a,height:document.body.clientHeight+(f.isInApp()?48:0),center:i?i.lon+"|"+i.lat:"116.397428|39.90923",locationButton:'<div class="map_curpos_btn" style="opacity: 0.8; cursor: pointer;"></div>',onReady:function(){setTimeout(function(){e.createPOI(),e.selectCategory()},0)},onZoom:function(t,n){e.needShowMarkerDetail(n)?(e.changeMarkerView(!1,e.currentMarkerDom),e.changeMarkerView(!0)):e.changeMarkerView(!1),n<10?(o.show(),o.addClass("map_tips02"),o.text("当前范围过大，请放大地图查询"),e.isTooLarge=!0,s.hide()):(e.isTooLarge&&o.hide(),e.isTooLarge=!1,e.isScreenQuery&&o.hide(),o.removeClass("map_tips02"),s.show())},onMovestart:function(){!e.poiMarkers.length&&!e.isTooLarge&&s.show()},onClick:function(){var t=e.centerMarker;t&&t.tipDOM&&t.tipDOM.hide(),!e.isDetailView&&e.currentMarkerDom&&e.changeMarkerView(!1,e.currentMarkerDom)},onGeoBegin:function(e){e=$(e).children(),e.css("background-color","#1491c5"),n=e,r=new t.ui.LoadingLayer(function(){this.hide()},"定位中..."),console.log(0)},onGeoComplete:function(e){console.log(1),r&&r.hide(),n&&n.css("background-color","rgba(0,0,0,.8)"),this.setFitView()},onGeoError:function(){e.showToast("无法获取您的位置，请稍后重试"),n&&n.css("background-color","rgba(0,0,0,.8)")}})},changeMarkerView:function(e,t){var n=this.isDetailView,r=this.container;t?(r=t,n=t.data("isDetailView"),t.data("isDetailView",!!e),t[e?"addClass":"removeClass"](b)):this.isDetailView=!!e;if(n===e)return;r.find(".J_detailMarker")[e?"show":"hide"](),r.find(".J_simpleMarker")[e?"hide":"show"](),r.find(".J_dotMarker")[e?"hide":"show"](),r.find(".J_popMarker")[e?"show":"hide"]()},addCenterMarker:function(e){var t=this,n=this.mapWidget,r=Number(e.lon),i=Number(e.lat),s;if(!r||!i)return;this.centerMarker&&this.centerMarker.setMap(null),s=n.addMarker({position:new n.host.LngLat(r,i),offset:{x:-7,y:-36},content:P({name:e.name||e.address})}),n.addEvent(s,"click",this.centerMarkerHandler,this),this.centerMarker=s},centerMarkerHandler:function(e){var t=$(e.originalEvent.currentTarget).find(".J_centerMarkerTip"),n=this.currentMarker,r=this.currentMarkerDom;n&&n.setzIndex(1),r&&this.changeMarkerView(!1,r),t.show(),e.target.tipDOM=t},onShow:function(){this.refer=this.getLastViewName(),this.header&&this.header.hide(),this.category=x.getAttr("ctype"),this.loadingLayer=new t.ui.LoadingLayer(function(){this.hide(),this.poi&&this.poi.abort()},"查询中..."),this.isScreenQuery=!1},onHide:function(){!f.isInApp()&&this.header&&this.header.rootBox&&this.header.rootBox.show(),this.clearPOIMarkers(),this.removeCurrentLocationTool()},isDetailBack:function(){var e=this.refer;return e&&e.match(/detail/i)},reverseGeocode:function(e,t){var n=this,r=this.mapWidget.map,i=new this.mapWidget.host.LngLat(e.lon,e.lat);r.plugin(["AMap.Geocoder"],function(){var r=new AMap.Geocoder({radius:1e3,extensions:"all"});AMap.event.addListener(r,"complete",function(r){n.getCityInfo(e,r.regeocode,t)}),r.getAddress(i)})},getCityInfo:function(e,t,n){var r=this;O.setParam({lng:e.lon,lat:e.lat,district:encodeURIComponent(t.addressComponent.district),cityname:encodeURIComponent(t.addressComponent.city),province:encodeURIComponent(t.addressComponent.province),isOverseas:!t.formattedAddress}),O.excute(function(i){var s;if(i&&i.CityID&&i.CityID>0){p.setCurrentCity(i),x.setAttr("ctyId",i.CityID),x.setAttr("ctyName",i.CityName);var o={lat:e.lat,lon:e.lon,name:t.formattedAddress,distance:r.distance};x.setAttr("pos",o),L.setAttr({type:-6,name:t.formattedAddress,pos:o})}typeof n=="function"&&n.call(r,t.formattedAddress)},function(e){},!1,this)}}),E});