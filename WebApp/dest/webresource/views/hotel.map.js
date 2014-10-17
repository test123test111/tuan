define(["TuanApp","libs","c","TuanStore","AMapWidget","TuanBaseView","cCommonPageFactory","cUtility","cWidgetFactory","cWidgetGeolocation","TuanModel","CommonStore","text!HotelMapTpl"],function(e,t,n,r,i,s,o,u,a,f,l,c,h){var p,d=r.TuanDetailsStore.getInstance(),v=r.GroupSearchStore.getInstance(),m=a.create("AMapWidget"),g=a.create("Geolocation"),y=o.create("TuanBaseView");return p=y.extend({pageid:"214010",hpageid:"215010",events:{"click #J_return":"returnHandler","click .J_relatedProducts":"gotoProduct","click #J_navigator":"showMapNav"},onCreate:function(){this.$el.html($.trim(h)),this.els={mapContainer:this.$el.find("#J_mapContainer")};var e=Lizard.P("lon"),t=Lizard.P("lat"),n=Lizard.P("hotelName"),r=this.$el.find("#J_navigator");e&&t?(this.mapdata={Longitude:e,Latitude:t,hotelName:n},window.mapdata=this.mapdata):this.returnHandler(),u.isInApp()&&$.os&&$.os.ios&&parseInt($.os.version,10)>=7&&(this.$el.find("#J_hotelmapWrap").css({"padding-top":"20px","background-color":"#b3b3b3"}),this.$el.find("#J_return").css("top","30px"),r.css({top:"30px"})),this.loadMapScript(),!u.isInApp()&&r.css("display","none")},showMapNav:function(){var e=this.mapdata||{},t={latitude:e.Latitude,longitude:e.Longitude,title:e.hotelName};t&&g.show_map(t)},onShow:function(){this.header&&this.header.hide()},onHide:function(){!u.isInApp()&&this.header&&this.header.rootBox&&this.header.rootBox.show(),this.centerMarker&&this.centerMarker.hide()},returnHandler:function(){this.back()},addCenterMarker:function(e){var t=this,n=this.mapdata,r=this.map,i=r.addMarker({position:new r.host.LngLat(n.Longitude,n.Latitude),offset:{x:-7,y:-36},content:_.template(t.$el.find("#J_centerMarkerTpl").html())({title:e})}),s="ontouchstart"in window;this.centerMarker=i,r.addEvent(i,s?"touchstart":"click",function(e){var t,n=e.originalEvent;n.target.tagName.toLowerCase()=="img"&&(t=$(n.currentTarget).find("#J_label"),t.toggle())})},hotelMapInit:function(){var e=this,t,n=e.mapdata;if(!n||!n.Longitude||n.Longitude==1e3||n.Longitude==-1)return;this.map?this.map.map.setCenter(new this.map.host.LngLat(n.Longitude,n.Latitude)):this.map=new m({container:this.els.mapContainer,height:document.body.clientHeight,center:n.Longitude+"|"+n.Latitude,locationButton:'<div class="map_curpos_btn" style="opacity: 0.8"></div>',onReady:function(){},onZoom:function(e,t){},onClick:function(){var t=e.centerMarker;t&&t.tipDOM&&t.tipDOM.hide(),!e.isDetailView&&e.currentMarkerDom&&e.changeMarkerView(!1,e.currentMarkerDom)},onGeoBegin:function(e){e=$(e).children(),e.css("background-color","#1491c5"),t=e},onGeoComplete:function(e){t&&t.css("background-color","rgba(0,0,0,.8)"),this.setFitView()},onGeoError:function(){t&&t.css("background-color","rgba(0,0,0,.8)")}}),this.addCenterMarker(n.shortName||n.hotelName)},setMapHeight:function(){var e=this,t=this.els.mapContainer,n=function(){var e=window.innerHeight||$("html").offset().height,t=e-$("header").height();u.isInApp()&&$.os&&$.os.ios&&parseInt($.os.version,10)>=7&&(t-=20)};$(window).bind("resize",n),n()},loadMapScript:function(){var e=this,t;window.initDetailMap=function(){e.setMapHeight(),e.hotelMapInit(),e.els.mapContainer.click()},t=document.createElement("script"),t.type="text/javascript",t.src="http://webapi.amap.com/maps?v=1.2&key=0b895f63ca21c9e82eb158f46fe7f502&callback=initDetailMap",this.$el.append(t)}}),p});