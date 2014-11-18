define(["TuanApp","libs","c","cUtility","cWidgetFactory","cGeoService","TuanStore","TuanBaseView","cCommonPageFactory","TuanModel","CommonStore","StoreManage","text!HotelSubbranchTpl","CallPhone","cWidgetGeolocation"],function(e,t,n,r,i,s,o,u,a,f,l,c,h,p){function T(e){return e.toISOString().substring(0,10).replace(/-/g,"")}var d={pageTitle:"商户列表"},v=n.ui,m=n.base,g=r.isInApp(),y="ani_rotation",b=o.GroupGeolocation.getInstance(),w=o.TuanDetailsStore.getInstance(),E=f.TuanBranchOfficeModel.getInstance(),S=s.GeoLocation,x=i.create("Guider"),N=a.create("TuanBaseView"),C=N.extend({events:{"click .J_showMap":"showMap","click .J_jumpHotel":"jumpHotel","click .J_busiCity":"showHotel","click #J_relocation":"relocation"},onCreate:function(){this.htmlfun=_.template(h)},onLoad:function(){this.cityId=Lizard.P("cityid"),w.get()!=null?this.showBranch():this.backAction(),this.setHeader()},setHeader:function(){var e=this;this.header.set({title:d.pageTitle,back:!0,home:!0,view:this,tel:4000086666,events:{returnHandler:function(){e.backAction()},homeHandler:function(){e.backHome()}}})},showBranch:function(e){var t=this,n=this.cityId,r,i=e||b.getAttr("gps")||{};this.showLoading(),r={id:w.get().id,pos:{lon:i.lng,lat:i.lat,type:3,name:i.city}},n&&(r.cityid=n),E.setParam(r),E.excute(function(e){t.hideLoading();if(!e.groups.length){t.showMessage("抱歉，数据加载失败，请重试!");return}var r=c.getCurrentCity();r.CityName&&(i.CityName=r.CityName),t.$el.html($.trim(t.htmlfun({data:e.groups,gps:i,cityId:n}))),t.CallPhone=new p({view:this})},function(e){var t=e.msg?e.msg:"啊哦,数据加载出错了!",n=this;this.showHeadWarning("团购分店信息",t,function(){n.backAction()}),this.hideLoading()},!0,this)},showPhone:function(e){var t=new Array,n,r=$(e.currentTarget).data("tel").toString();r=r.replace(/，/g,","),_.each(r.split(","),function(e){t.push(" <a href='tel:"+e+"'>"+e+"</a>");if(!n||n=="")n=e}),this.alert=new v.Alert({title:"拨打电话",message:' <div id="tuan_tel">'+t.join("")+"</div>",buttons:[{text:"取消",click:function(){this.hide()}},{text:'<a href="tel:'+n+'" data-phone="'+n+'">拨打</a>',click:function(e){this.hide(),x.apply({hybridCallback:function(){var t="data-phone",n=$(e.target);return n.attr(t)||(n=n.find("["+t+"]")),e.preventDefault(),x.callPhone({tel:n.attr(t)}),!1},callback:function(){return!0}})}}]}),this.alert.show()},onShow:function(){},onHide:function(){S.UnSubscribe("tuan/subbranch")},backAction:function(){var e={},t=w.getAttr("id"),n=this.cityId;t&&(e.id=t),n&&(e.cityid=n),this.back(e)},backHome:function(){e.tHome()},showMap:function(e){var t=$(e.currentTarget),n=t.attr("data-coords").split(","),r=t.attr("data-hotel-name");window.mapdata={Longitude:n[0],Latitude:n[1],hotelName:r},this.forwardJump("hotelmap","/webapp/tuan/hotelmap?lon="+n[0]+"&lat="+n[1]+"&hotelName="+r)},jumpHotel:function(t){var n=$(t.currentTarget).data("id");if(!n)return;var r=new Date,i=new Date(r.setDate(r.getDate()+1)),s=encodeURIComponent(location.href),o=g?"ctrip://wireless/InlandHotel?hotelDataType=1&checkInDate="+T(new Date)+"&checkOutDate="+T(i)+"&hotelId="+n+"&from="+s:"http://m.ctrip.com/webapp/hotel/hoteldetail/"+n+".html?from="+s,u=this.getHistory();u.stack.pop(),e.jumpToPage(o,this)},showHotel:function(e){var t=$(e.currentTarget),n,r=t.find(".J_arrow");r.hasClass("arrow_skin01_up")?(r.toggleClass("arrow_skin01_up arrow_skin01_down"),t.removeClass("J_sticky").removeClass("busi_fixed").css("top","0").next().hide(),t.parent().css("padding-top","0"),document.removeEventListener("scroll",this.onScroll)):(n=this.$el.find(".arrow_skin01_up"),n.toggleClass("arrow_skin01_up arrow_skin01_down"),n.parent().removeClass("J_sticky").removeClass("busi_fixed").css("top","0").next().hide(),n.parent().parent().css("padding-top","0"),r.toggleClass("arrow_skin01_down arrow_skin01_up"),t.addClass("J_sticky").next().show(),document.addEventListener("scroll",this.onScroll)),this.onScroll()},onScroll:function(){var e=document.querySelector(".J_sticky");if(!e)return;window.scrollY>=e.parentNode.offsetTop?(e.classList.add("busi_fixed"),e.parentNode.style.paddingTop="45px",!g&&(e.style.top="48px")):(e.classList.remove("busi_fixed"),e.parentNode.style.paddingTop="0",!g&&(e.style.top="0"))},relocation:function(e){var t=this,n=$(e.target),r=this.$el.find("#J_gpsAddr");n.addClass(y),S.Subscribe("tuan/subbranch",{onComplete:function(e){n.removeClass(y),r.html("您的位置："+(e.address||"未知位置")),t.showBranch(e)},onError:function(){n.removeClass(y),r.html("暂无定位信息"),t.showToast("抱歉，获取不到当前位置，请打开GPS后重试!")},onPosComplete:function(e,t){},onPosError:function(){n.removeClass(y),r.html("暂无定位信息"),t.showToast("抱歉，获取不到当前位置，请打开GPS后重试!")}},this,!0)}});return C});