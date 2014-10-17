define(["TuanApp","libs","c","TuanBaseView","cCommonPageFactory","cWidgetFactory","cGeoService","TuanModel","cDataSource","TuanStore","StoreManage","text!CityListTpl","cWidgetGeolocation","HttpErrorHelper"],function(e,t,n,r,i,s,o,u,a,f,l,c,h,p){var d=n.ui,v=o.GeoLocation,m=f.GroupSearchStore.getInstance(),g=f.GroupGeolocation.getInstance(),y=f.TuanPositionStore.getInstance(),b=f.TuanHistoryCityListStore.getInstance(),w=f.TuanCityListStore.getInstance(),E=u.TuanLocalCityInfo.getInstance(),S=f.TuanHistoryKeySearchStore.getInstance(),x=i.create("TuanBaseView"),T=x.extend({pageid:"214002",hpageid:"215002",tuanCityList:u.TuanCityListModel.getInstance(),dateSource:new a,selectItem:null,render:function(){this.els={eltuancitylistbox:this.$el.find("#citylist_box"),eltuancitykeyword:this.$el.find(".place_search_box>.place_search")},this.cityListTplfun=_.template(c)},events:{"click .history_close":"cancelInput","click .city_type":"cityGroupTitleClick","click .place_search":"clickInput","input .place_search":"searchKeyWordInput","click .city-item":"cityItemOnClick","click .J_cityTagTitle":"cityTagTitleClick"},backAction:function(){this.back()},cityItemOnClick:function(e){var t=m.get();l.clearAll();var n=[],r=this,i=$(e.currentTarget),s,o=i.attr("data-id"),u=i.attr("data-name");if(o.toLowerCase()=="nearby"){s=l.getCurrentCity(),s?(b.setAttr("nearby",!0),m.setAttr("ctyId",s.CityId),n=l.getGroupQueryParam(),m.setAttr("qparams",n),l.addHistoryCity(s.CityId,s.CityName)):(b.setAttr("nearby",!1),m.setAttr("ctyId",t.ctyId),m.setAttr("ctyName",t.ctyName)),r.forwardJump("list","/webapp/tuan/list");return}if(o.toLowerCase()=="positioning"){this.getGeolocation(),this.upNearbyBtn(2);return}b.setAttr("nearby",!1),g.setAttr("isParentCity",!1),m.setAttr("ctyId",o),m.setAttr("ctyName",u),l.addHistoryCity(o,u),S.remove(),setTimeout(function(){r.forwardJump("home","/webapp/tuan/home")},100)},cityGroupTitleClick:function(e){var t=$(e.currentTarget);t.parent().find(".city_list").hide(),t.next("ul").toggle(200)},cityTagTitleClick:function(e){var t=$(e.currentTarget),n=t.parent();n.find(".city_list>li").toggle(),t.find(".J_cityTagIcon").toggleClass("view_fold view_unfold"),t.next().find(".city_list").show(),n[0].scrollIntoView(),setTimeout(function(){window.scrollBy(0,-45)},50)},buildEvent:function(){d.InputClear(this.els.eltuancitykeyword),this.onBodyChange=$.proxy(function(){this.els.eltuancitykeyword[0].blur(),this.$el.find(".history_close").hide()},this)},updatePage:function(e){this.tuanCityList.excute(function(t){t=w.get(),this.createPage(t),e.call(this)},function(t){var n=p.getMessage(t);this.showToast(n),e.call(this)},!1,this)},createGPS:function(){this.gps=s.create("Geolocation")},getLocalCityInfo:function(e,t,n){var r=l.getCityIdByName(n),i,s=this,o=function(e){var t=s.$el.find(".current>.currentcity");s.upNearbyBtn(1);if(t.length>0){var n=t.html(),r=g.get();n=n.replace("<!--cityname-->",r.gps.CityName),n=n.replace("<!--groups-->",r.gps.Groups),t.html(n),t.attr("data-name",r.gps.CityName),t.attr("data-id",e.CityID),t.show()}};if(r){i={CityName:n,CityID:r};if(l.setCurrentCity(i)){o(i);return}}E.setParam({lng:e,lat:t,cityname:encodeURIComponent(n)}),E.excute(_.bind(function(e){s.checkParentCity(e),typeof e!=undefined&&l.setCurrentCity(e)?o(e):this.upNearbyBtn(3)},this))},checkParentCity:function(e){g.setAttr("isParentCity",!1),e.IsParentCity&&(e.HasGroupProduct?g.setAttr("isParentCity",!0):e.CityID=defaultCity.id)},getGeolocation:function(){var e=this;changeSuccessStatus=function(t){var n=e.$el.find(".current>.currentcity");e.upNearbyBtn(1);if(n.length>0){var r=n.html(),i=g.get(),s=i.gps.Groups;if(!s){var o=l.findCityInfoById(t.cityId);o&&(s=o.cGroups||0)}r=r.replace("<!--cityname-->",t.cityName),r=r.replace("<!--groups-->",s),n.html(r),n.attr("data-name",t.cityName),n.attr("data-id",t.cityId),n.show()}};var t=y.get();if(t&&t.cityId&&t.cityName){var n={cityId:t.cityId,cityName:t.cityName,hasGroupProduct:t.hasGroupProduct};changeSuccessStatus(n);return}v.Subscribe("tuan/citylist",{onComplete:function(t){y.set(t),t.city=t.city.replace("市市","市"),t.city.length>2&&(t.city=t.city.replace("市","")),g.setAttr("gps",t);var n={lng:t.lng,lat:t.lat,district:t.district,city:t.city,province:t.province,isOverseas:t.country!="中国"};e.getCityInfo(n,changeSuccessStatus)},onError:this.geoError,onPosComplete:function(e,t){},onPosError:this.geoError},this,!0)},geoError:function(){this.upNearbyBtn(3)},getCityCount:function(e){return l.getCityCount(e)},upNearbyBtn:function(e){var t=this.$el.find(".current>li").first();if(t)switch(e){case 1:t.attr("data-id","nearby"),t.attr("data-name","我附近的"),t.text("我附近的团购");break;case 2:t.attr("data-id","positioning"),t.attr("data-name","定位中"),t.text("定位中");break;case 3:t.attr("data-id","positioning"),t.attr("data-name","定位失败，请点这里重试"),t.text("定位失败，请点这里重试")}},createPage:function(e){var t=m.get(),n=b.get(),r=t.ctyId,i=t.ctyName,s,o,u,a=!1;this.citycount=this.getCityCount(e);var f=l.findHistoryCity(e.cities),c=this.cityListTplfun({data:e.cities,history:f,cityid:r,currentcityid:o,currentcityname:s,currentgroups:u,nearby:a});this.els.eltuancitylistbox.html($.trim(c)),e.cities.length<=0?this.els.eltuancitylistbox.find(".city_noresult").show():this.els.eltuancitylistbox.find(".city_noresult").hide(),this.getGeolocation(),a==1&&typeof o!="undefined"&&o!=null&&o!=""?(a=!0,b.setAttr("nearby",a),m.setAttr("ctyId",o),r=0):(a=!1,b.setAttr("nearby",a),m.setAttr("ctyId",r)),this.$el.find(".s_city_num>span").text(this.citycount),this.$el.find(".s_city_loading").hide(),this.$el.find(".s_city_num").show()},onCreate:function(){this.render(),this.buildEvent()},onLoad:function(e){this.turning();var t=this;this.header.set({title:"选择城市",back:!0,view:this,tel:null,events:{returnHandler:function(){t.backAction()}}}),this.header.show(),this.updatePage(function(){this.hideLoading(),this.$el.bind("focus",this.onBodyChange),this.$el.bind("touchstart",this.onBodyChange)})},cancelInput:function(e){this.hasSearchShow=!1,this.els.eltuancitykeyword.val(""),this.$el.find(".history_close").hide(),this.els.eltuancitylistbox.find(".J_cityTagTitle").show(),this.showHotCitys()},clickInput:function(){this.hasSearchShow=!0,this.$el.find(".history_close").show()},showHotCitys:function(){this.els.eltuancitylistbox.find(".city_list:not(.allcity)").show(),this.els.eltuancitylistbox.find(".city_type").show(),this.$el.find(".s_city_num>span").text(this.citycount),this.els.eltuancitylistbox.find(".city_list.allcity>li[data-filter]").hide()},hideHotCitys:function(){this.els.eltuancitylistbox.find(".city_list.allcity").show(),this.els.eltuancitylistbox.find(".city_type").hide(),this.els.eltuancitylistbox.find(".city_list:not(.allcity)").hide()},searchKeyWordInput:function(e){var t=$(e.currentTarget),n=t.val();if(n){n=n.replace(/\.|\{|\}|\[|\]|\*|\^|\'/img,""),n=n.toLowerCase().trim(),this.hideHotCitys(),this.els.eltuancitylistbox.find(".city_list.allcity>li").hide(),this.els.eltuancitylistbox.find(".J_cityTagTitle").hide();var r=this.els.eltuancitylistbox.find(".box-city-all .city_list>li[data-filter*="+n+"]");r.show(),r.length<=0?(this.els.eltuancitylistbox.find(".city_noresult").show(),this.$el.find(".s_city_num>span").text(0)):(this.els.eltuancitylistbox.find(".city_noresult").hide(),this.$el.find(".s_city_num>span").text(r.length))}else this.showHotCitys(),this.els.eltuancitylistbox.find(".city_noresult").hide()},onShow:function(){},onHide:function(){this.hasSearchShow==1&&this.cancelInput(),v.UnSubscribe("tuan/citylist"),this.$el.unbind("focus",this.onBodyChange),this.$el.unbind("touchstart",this.onBodyChange)},getCityInfo:function(e,t){var n=this;E.setParam({lng:e.lng,lat:e.lat,district:encodeURIComponent(e.district),cityname:encodeURIComponent(e.city),province:encodeURIComponent(e.province),isOverseas:e.isOverseas}),E.excute(function(e){n.locating=!1;var r;e&&e.CityID&&e.CityID>0&&(r={cityId:e.CityID,cityName:e.CityName,hasGroupProduct:e.HasGroupProduct},y.setAttr("cityId",e.CityID),y.setAttr("cityName",e.CityName),y.setAttr("hasGroupProduct",e.HasGroupProduct),l.setCurrentCity(e)),typeof t=="function"&&t.call(n,r)},function(e){n.locating=!1,y.setAttr("cityId",null),y.setAttr("cityName",null),n.upNearbyBtn(3)},!1,this)}});return T});