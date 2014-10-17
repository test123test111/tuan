define(["TuanApp","libs","c","cUtilityCrypt","TuanBaseView","cCommonPageFactory","cWidgetFactory","cUtility","cWidgetGuider","Payment","cWidgetTipslayer","CommonStore","TuanStore","TuanModel","text!TuanOrderDetailTpl","text!OrderDetailItemTpl","text!RecommendTpl"],function(e,t,n,r,i,s,o,u,a,f,l,c,h,p,d,v,m){function P(e){var t=parseFloat(e);return isNaN(t)?e:Math.round(t*100)/100}var g,y,b,w,E,S,x,T,N,C,k,L,A=u.isInApp(),O=encodeURIComponent("source=groupon"),M=s.create("TuanBaseView"),f=o.create("Payment"),D=o.create("Guider");return S=p.TuanCancelOrderModel.getInstance(),x=p.TuanDeleteOrderModel.getInstance(),g=h.OrderDetailReturnPage.getInstance(),y=c.UserStore.getInstance(),b=h.TuanOrderDetailStore.getInstance(),w=p.TuanOrderDetailModel.getInstance(),E=p.TuanSendMsgModel.getInstance(),T=p.TuanRetryPayment.getInstance(),N=p.CrossRecommendModel.getInstance(),C={unavailableOrder:"无效订单",pageTitle:"订单详情",timeoutTip:"非常抱歉，由于您刚才提交的服务已超时，请稍后在“我的携程”中查看订单信息或拨打服务电话400-008-6666，以确认您的订单是否提交成功。",sendMsgTitle:"发送券号密码到手机",sendMsg:"发送短信",needOrderID:"必须选择券号哦，亲",alreadySend:"券号和密码已发送至您的手机",sendMsgFailed:"抱歉，发送失败！",pleaseWait:"请等待",sendAgain:"秒后重新发送",orderPending:"正在紧张的为您处理中，请休息一下再来查看吧！",makeCallTitle:"拨打电话",cancel:"取消"},k=M.extend({pageid:"214018",hpageid:"215018",hasAd:!0,tpl:d,cooling:!1,coolingSec:0,render:function(){var t=this,n=y.getUser();this.orderId=Lizard.P("orderid"),this.orderId||this.showToast(C.unavailableOrder,3,function(){g.get()?t.forwardJump("tuanorderdetail","/webapp/tuan/tuanorderdetail/"+t.orderId+".html"):n&&!n.IsNonUser?e.gotoExternalPage("myctrip",t.from.replace(/^\/webapp\/myctrip\//i,"")||"index.html#orders/tuanorderlist"):t.forwardJump("home","/webapp/tuan/home")},!0),n||Lizard.goTo("/webapp/myctrip/#account/login?from="+encodeURIComponent("/webapp/tuan/tuanorderdetail/"+this.orderId+".html")),this.showLoading(),b.remove(),w.setParam({oid:this.orderId}),w.param.head=w.getHead().get(),w.excute(function(e){var n=e,r=n.coupons&&n.coupons.length,i=!1,s=e.product,o=s&&s.channelInfo,u=o&&o.isCorrectChannel;t.hideLoading(),L=e.contact&&e.contact.mphone,t.store=e;if(r){var a=0;_.each(n.coupons,function(e){e.isc==1&&a++}),a&&y.isLogin()&&(i=!0)}e.canRefund=i,e.canDelete=e.isdel,e.appNonsupport=u,e.retainTwoDecimal=P,t.$el.html($.trim(_.template(t.tpl,e))),e&&e.pid&&t.getCrossRecommend(e.pid),u||t.showMessage("订单仅供查看，需要进行相关操作请使用电脑登录携程。"),t.couponsWrap=t.$el.find("#J_couponsWrap"),e.mooncakeStatus!=4&&t._loadCoupon(t.couponsWrap,n.coupons,u,n.status)},function(e){t.hideLoading(),e&&e.statusText=="timeout"&&t.showToast(C.timeoutTip)},!0,this)},sortCoupons:function(e){var t={},n=[],r;if(e&&e.length)return e.forEach(function(e){r=t[e.status]||[],r.push(e),t[e.status]=r}),[1,3,5,4,2].forEach(function(e){r=t[e],r&&(n=n.concat(r))}),n},gotoListPage:function(){var t=this,n=Lizard.P("from");if(n){var r=decodeURIComponent(n).replace(/^\/webapp\/myctrip\//i,""),i=this.getHistory();i.stack.pop(),e.gotoExternalPage("myctrip",r)}else t.back()},events:{"click #J_tuanDetail":"viewTuanDetail","click #J_refund":"goToRefundPage","click #J_hotelTel":"showHotelTel","click #J_hotelMap":"showHotelMap","click #J_retryPayment":"retryPayment","click .J_sendToPhone":"sendCouponToPhone","click #J_cancelOrder":"cancelOrder","click #J_deleteOrder":"deleteOrder","click #J_viewCoupon":"jumpPromocode","click #J_immediateUse":"gotoMooncake","click .J_viewDetail":"gotoDetail","click .link-more":"gotoNearList","click #J_tabNav>li":"recommendSwitch"},onCreate:function(){},onLoad:function(){var t=this,n=this.getQuery("ftype")||"";this.from=decodeURIComponent(Lizard.P("from")||""),this.setTitle(C.pageTitle),this.header.set({title:C.pageTitle,back:!0,view:this,tel:{number:4000086666},home:!0,events:{homeHandler:function(){var t=y.getUser();t&&t.IsNonUser&&y.remove(),e.tHome()},returnHandler:function(){t.gotoListPage()}}}),this.header.show(),this.render()},onShow:function(){},onHide:function(){this.hideLoading(),this._confirm&&this._confirm.hide()},getCrossRecommend:function(t){var n=this,r=_.template(m),i=this.$el.find("#J_recommendWrap");N.setParam({id:t,isInApp:A,environment:e.environment,head:c.HeadStore.getInstance().get()}),N.execute(function(e){var n=e&&e.RecommendGroups;n.length?(i.show(),i.html(r({data:n,pid:t,city:e.city}))):i.hide()},function(){i.hide()},this,this)},recommendSwitch:function(e){var t=$(e.currentTarget),n=t.data("index");if(t.hasClass("sta-on"))return;t.addClass("sta-on").siblings().removeClass("sta-on"),this.$el.find("#J_tabCon .ui-item").hide().eq(n).show()},_loadCoupon:function(e,t,n,r){e[0]&&t&&(e.html(_.template(v,{list:t,orderStatus:r|0})),n||e.find(".J_sendToPhone").hide())},_sendMsg:function(e){var t=this,r=[];r.push({code:e.attr("data-id")});if(r.length===0){this.showMessage(C.needOrderID);return}E.setParam({head:c.HeadStore.getInstance().get(),mphone:L,coupons:r,oid:this.orderId});var i=new n.ui.LoadingLayer(function(){E.ajax.abort(),this.hide();return});i.show(),E.execute(function(e){t.hideLoading(),i.hide(),e.res&&(t.cooling=!0,t.coolingSec=60),t.showMessage(C.alreadySend)},function(){i.hide(),t.showToast(C.sendMsgFailed,3),t.hideLoading()},!1,function(){i.hide(),t.showToast(C.sendMsgFailed,3),t.hideLoading()})},sendCouponToPhone:function(e){if(this.store&&this.store.status&&this.store.status==3)return;this._sendMsg($(e.currentTarget))},_checkChange:function(){this.msgBox.show(),this.msgBox.hide();var e,t,n;if(!this.msgBox)return;e=this.msgBox.root.find("#ticket_list"),t=e.find(".code"),n=this.msgBox.root.find(".cui-btns-sure").eq(0),t.off("click"),t.on("click",function(t){var r=$(t.target),i=r.hasClass("checked")?"removeClass":"addClass";r[i]("checked"),n.addClass("disable_btn"),e.find("i.checked")[0]&&n.removeClass("diabled_btn")})},viewTuanDetail:function(){var e=this.store;e&&this.forwardJump("detail","/webapp/tuan/detail/"+e.pid+".html")},fixHistoryBug:function(){var t=e.app.history,n=location.href,r=t.length;t[r-1]!==n&&t.push(n),e.app.history=t},goToRefundPage:function(){this.forwardJump("refund","/webapp/tuan/refund/"+this.orderId+".html")},_showPhone:function(e){var t;if(!e||e==""){this.showToast("没有留下电话号，无法拨打！");return}t=new n.ui.Alert({title:C.makeCallTitle,message:e,buttons:[{text:C.cancel,click:function(){this.hide()}},{text:'<a href="tel:'+e+'" data-phone="'+e+'">拨打</a>',click:function(e){var t=this;t.hide(),D.apply({hybridCallback:function(){var t="data-phone",n=$(e.target);return n.attr(t)||(n=n.find("["+t+"]")),e.preventDefault(),D.callPhone({tel:n.attr(t)}),!1},callback:function(){return!0}})}}]}),t.show()},showHotelTel:function(e){this._showPhone($(e.currentTarget).attr("data-phone"))},showHotelMap:function(e){var t=$(e.currentTarget),n=t.attr("data-coords").split(","),r=t.attr("data-hotel-name");window.mapdata={Longitude:n[0],Latitude:n[1],hotelName:r},this.forwardJump("hotelmap","/webapp/tuan/hotelmap?lon="+n[0]+"&lat="+n[1]+"&hotelName="+r)},getAppUrl:function(){return"ctrip://wireless/GrouponHotelOrder?orderId="+this.orderId},retryPayment:function(e){var t=this;if($(e.currentTarget).hasClass("btm_tuan_btn_dis"))return;T.setParam({oids:this.orderId+"",head:w.getHead().get()}),T.execute(function(e){var n=e.result&&e.result.length?e.result[0]:{};t.hideLoading();if(n.CanPay){var r=JSON.parse(n.ToUrl),i=JSON.parse(n.Extend);i&&(r.payTypeList=i.payTypeList||0,r.subPayTypeList=i.subPayTypeList||0),r.from=A?"/webapp/tuan/index.html#tuanorderdetail!"+t.orderId:"/webapp/tuan/tuanorderdetail/"+t.orderId+".html",r.islogin=y.isLogin()?0:1,f.submit(t,r)}else t.showToast("此订单不支持继续支付！")},function(e){t.showToast("继续支付失败！"),t.hideLoading()},!0,t)},showConfirm:function(e,t){this._confirm=new n.ui.Alert({message:e,buttons:[{text:"否",click:function(){this.hide()}},{text:"是",click:function(e){t(),this.hide()}}]}),this._confirm.show()},_sendCancelOrder:function(){var e=this,t="申请取消订单";S.setParam({oid:e.orderId}),e.showLoading(),S.excute(function(n){e.hideLoading(),n.status==1?(e.showToast(t+"成功！"),e.onLoad()):e.showToast(t+"失败！")},function(){e.hideLoading(),e.showToast(t+"失败！")})},cancelOrder:function(){var e=this;e.showConfirm("是否确认取消订单？",function(){e._sendCancelOrder()})},_sendDeleteOrder:function(){var e=this,t="申请删除订单",n=e.from||"/webapp/myctrip/index.html#orders/tuanorderlist";x.setParam({oid:e.orderId}),e.showLoading(),x.excute(function(r){e.hideLoading(),r.status==1?(e.showToast(t+"成功！"),A?D.cross({path:"myctrip",param:n.replace(/^\/webapp\/myctrip\//i,"")}):location.href=location.protocol+"//"+location.host+n):e.showToast(t+"失败！")},function(){e.hideLoading(),e.showToast(t+"失败！")})},deleteOrder:function(){var e=this;e.showConfirm("是否确认删除订单？",function(){e._sendDeleteOrder()})},jumpPromocode:function(){var e="https://sinfo.ctrip.com/webapp/promocode/#index";if(location.host.match(/^(localhost|172\.16|127\.0)/i)||location.host.match(/^waptest\.ctrip|^210\.13\.100\.191|fat\d*\.qa\.nt\.ctripcorp\.com/i))e="https://sinfo.fat19.qa.nt.ctripcorp.com/webapp/promocode/#index";var t=JSON.parse(localStorage.getItem("USERINFO"));if(t&&t.data&&t.data.Auth){var n={auth:t.data.Auth};A?D.cross({path:"promocode",param:"index.html#index?token="+encodeURIComponent(r.Base64.encode(JSON.stringify(n)))}):Lizard.goTo(e+"?token="+encodeURIComponent(r.Base64.encode(JSON.stringify(n))))}else Lizard.goTo("/webapp/myctrip/#account/login?from="+encodeURIComponent(location.href))},gotoMooncake:function(){this.forwardJump("home","/webapp/tuan/home")},gotoDetail:function(e){var t=$(e.currentTarget),n=t.data("pid");t.data("type")==99?A?D.cross({path:"activity",param:"index.html#/dest/t"+n+".html?ext="+O}):location.href=location.protocol+"//"+location.host+"/webapp/activity/dest/t"+n+".html?from="+encodeURIComponent(location.href)+"&ext="+O:this.forwardJump("detail","/webapp/tuan/detail/"+n+".html")},gotoNearList:function(e){var t=$(e.currentTarget),n=t.data("pid"),r=t.data("cityid"),i=t.data("cityname"),s=t.data("type"),o=t.data("title");t.data("type")==99?A?D.cross({path:"activity",param:"index.html#/dest/ct-"+i+"-"+r+"?ext="+O}):location.href=location.protocol+"//"+location.host+"/webapp/activity/dest/ct-"+i+"-"+r+".html?from="+encodeURIComponent(location.href)+"&ext="+O:this.forwardJump("nearlist","/webapp/tuan/nearlist?pid="+n+"&category="+s+"&title="+o)}}),k});