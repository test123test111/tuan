define(["TuanApp","c","cUIInputClear","TuanBaseView","cCommonPageFactory","cUIScrollRadioList","cWidgetGuider","cWidgetMember","cUserModel","cUtility","cWidgetFactory","CommonStore","TuanStore","TuanModel","text!BookingTpl","NumberStep","cHolidayPriceCalendar","ValidatorUtil","FieldUtil","Payment"],function(e,t,i,o,n,s,a,r,c,u,d,l,h,m,p,f,g,v,I){function b(e){var t=parseFloat(e);return isNaN(t)?e:Math.round(100*t)/100}function L(e){return!!e}var P,T,C,y=h.TuanOrderInfoStore.getInstance(),w=h.TuanInvoiceStore.getInstance(),O=l.UserStore.getInstance(),x=h.TuanDetailsStore.getInstance(),k=l.UnionStore&&l.UnionStore.getInstance(),D=m.TuanCreateOrder.getInstance(),S=m.TuanDetailModel.getInstance(),U=m.TuanCouponListModel.getInstance(),N=h.TuanSelectedCouponStore.getInstance(),A=c.NotUserLoginModel.getInstance(),M=u.isInApp(),R=l.HeadStore.getInstance(),J=d.create("Payment"),E=d.create("Guider"),H=d.create("Member"),B={max:9,min:1},F={100:"操作成功",101:"节点数据验证不通过",102:"系统程序错误",201999:"产品不处于可售状态，不能生成订单",201e3:"产品没有供应商,生成订单失败",201001:"产品已团完,生成订单失败",201002:"产品无分销商,生成订单失败",201003:"电话格式不符合规范（例：021-10106666-），未能生成订单",201004:"产品属0元团购，分销联盟不能生成订单",201005:"产品属马上订产品，分销联盟不能生成订单",201006:"超过此产品的最大购买数量，不能生成订单",201007:"小于此产品的最少购买数量，不能生成订单",201008:"本产品携程不开发票，不能生成订单",201009:"发票创建失败，不能生成订单",201010:"发票信息有误，不能生成订单",201012:"本产品每个手机号码仅限购买一次",201011:"产品属0元团购，一个手机号只能预订一次",301e3:"订单取消成功",301001:"订单不属于用户或订单不存在",301002:"订单状态为非新订单",301003:"取消订单失败,订单状态修改失败",301004:"订单删除失败",301005:"订单删除成功",301006:"生成订单失败",301007:"订单状态修改失败",301008:"订单未查到支付记录",301009:"订单不存在",301010:"该订单已在处理中",401e3:"券号或者订单不存在或已更新，券取消失败",401001:"更新订单失败，券取消失败",401002:"更新券号失败，券取消失败",401003:"券使用失败",401004:"现渠道和此张券应属于的渠道不同，不能取消券",401005:"券取消失败",401006:"此张券已使用，不能取消券",401007:"此张券已取消，不能再次取消券",401008:"此张券已作废，不能取消券",401009:"券号已有预约记录,不能使用",401010:"券状态:已过期超过两天,不可使用",401011:"订单类型错误(1为携程收款，2为对方收款)",501e3:"联盟信息错误，无法取消券",501001:"更新联盟信息失败，未能生成订单",501002:"生成券号时发生异常，未能生成订单",601e3:"信用卡发送扣款请求失败",601001:"存在重复流水号",601002:"保存信用卡信息错误",601003:"增加支付记录失败",601004:"调用支付接口失败"};return P={submitTitle:"订单提交",submitTip:"由于您长时间未提交订单，数据可能已经过时，请返回重新选择",pageTitle:"订单填写",giftCard:"携程礼品卡",cash:"现金",alertTitle:"提示信息",leaveTips:"您的订单尚未完成，确定要离开吗？",cancel:"取消",sure:"离开",telTips:"请填写正确的手机号码",failTips:"抱歉，订单未能成功提交，请重试！",timeoutTips:"非常抱歉，由于您刚才提交的服务已超时，请稍后在“我的携程”中查看订单信息或拨打服务电话400-008-6666，以确认您的订单是否提交成功。",couponCount:"(<%=count%>张)",phoneListTitle:"选择手机号",dateNone:"请选择游玩日期",telNone:"请输入手机号码",telError:"请输入正确的手机号码",nameNone:"请输入取票人姓名",nameError:"请输入正确的取票人姓名",submitting:"提交中...",selectDateTitle:"选择日期",submitError:"网络不给力，请稍后再试"},T=n.create("TuanBaseView"),C=T.extend({pageid:"214015",hpageid:"215015",tpl:p,latlon:null,render:function(){var e=this,t=x.get(),i=O.getUser(),o=N.get(),n=y.get();this.store=t,t&&t.id?(t.min=t.min>B.min?t.min:B.min,t.max=t.max<B.max?t.max:B.max,t.curNum=n&&n.curNum||t.min,t.tel=n&&n.tel||i&&(i.BMobile||i.Mobile)||"",t.retainTwoDecimal=b,t.user=i,t.isLogin=O.isLogin(),t.invoice=w.get(),t.invoiceText=t.invoiceText||null,t.isInApp=M,t.coupon=o&&o.pid===t.id?o:void 0,this.pid=t.id,this.price=t.price.dPrice,this.$el.html($.trim(_.template(this.tpl,t))),this.els={curNumDom:this.$el.find("#J_curNum"),numStepDom:this.$el.find(".J_numberStep"),pPriceDom:this.$el.find("#J_pPrice"),totalPriceDom:this.$el.find("#J_totalPrice"),telDom:this.$el.find("#J_tel"),submitBtn:this.$el.find("#J_submitOrder"),couponCount:this.$el.find("#J_couponCount"),couponAmount:this.$el.find("#J_couponAmount"),selectDate:this.$el.find(".J_selectDate"),ticketUserDom:this.$el.find("#J_ticketUser")},O.isLogin()&&this.getCouponList(function(t){e.els.couponCount.html(_.template(P.couponCount,{count:t}))}),this._createNumberStep(),this.initValidator()):(this.alert.setViewData({title:P.submitTitle,message:P.submitTip,buttons:[{text:"知道了",click:function(){var t=x.get();t&&t.id?e.forwardJump("detail","/webapp/tuan/detail/"+t.id+".html"):e.forwardJump("list","/webapp/tuan/list"),this.hide()}}]}),this.alert.show())},isFreeProduct:function(){return this.price<=0},events:{"click #J_submitOrder":"goNextStep","click #J_invoice":function(){this.forwardJump("invoice","/webapp/tuan/invoice")},"click #J_coupon":function(){this.forwardJump("coupon","/webapp/tuan/coupon")},"click .J_loginBtn":"loginAction","click #J_selectContact":"selectContactNew","click .J_selectDate":"selectDate"},initValidator:function(){var e=this;this.validator.removeAllFields(),this.els.selectDate.length&&this.validator.addField(new I({dom:e.els.selectDate,rules:[L],onCheck:function(t,i){t?e._addOrRemoveHighLight(i.dom,!1):e.showToast(P.dateNone,3,function(){e._addOrRemoveHighLight(i.dom,!0),i.dom.focus()})}})),this.els.ticketUserDom.length&&this.validator.addField(new I({dom:e.els.ticketUserDom,rules:[L,function(e){return e.length<=10}],onCheck:function(t,i){var o="";t?e._addOrRemoveHighLight(i.dom,!1):(o=0==i.rule?P.nameNone:P.nameError,e.showToast(o,3,function(){e._addOrRemoveHighLight(i.dom,!0),i.dom.focus()}))}})),this.validator.addField(new I({dom:e.els.telDom,rules:[L,t.utility.validate.isMobile],onCheck:function(t,i){var o="";t?e._addOrRemoveHighLight(i.dom,!1):(o=0==i.rule?P.telNone:P.telError,e.showToast(o,3,function(){e._addOrRemoveHighLight(i.dom,!0),i.dom.focus()}))}}))},_addOrRemoveHighLight:function(e,t){e.closest("li")[t?"addClass":"removeClass"]("errorli")},onCreate:function(){this.validator=new v},getTuanDetail:function(t,i){var o=this,i="function"===$.type(i)?i.bind(this):function(){};S.setParam({id:t,environment:e.environment}),this.showLoading(),S.excute(function(){i(),o.hideLoading()},function(e){var t=e.msg?e.msg:"啊哦,数据加载出错了!";o.showToast(t,3,function(){o.cancelOrder()}),o.hideLoading(),i()},!1,this)},loadTuan:function(){this.render(),this.isFreeProduct()&&(this.numberStep.disable(),this.$el.find("#J_invoice").hide()),this.store&&this.store.id&&(this._fixIOS7Bug(),i(this.els.telDom))},onLoad:function(t){var i=Lizard.P("productid")||Lizard.P("detailid");this.refer=t,this._setPageView(),i&&+i>0?(e.saveUnion(),this.getTuanDetail(i,this.loadTuan)):this.loadTuan()},selectContactNew:function(){var e=this;E.chooseContactFromAddressbook({callback:function(t){var i;t&&!_.isEmpty(t)&&(void 0===t.name&&t.phoneList&&!t.phoneList.length?e.showToast("无法访问通讯录，导入失败"):t.phoneList&&t.phoneList.length&&(i=e._formatPhoneList(t.phoneList),1===i.length?e.selectPhoneItem(i[0]):new s({data:i,title:P.phoneListTitle,itemClick:$.proxy(e.selectPhoneItem,e),key:i[0].key}).show()))}})},selectDate:function(){this.forwardJump("calendar","/webapp/tuan/calendar",{})},_formatPhoneList:function(e){return e.map(function(e,t){return e=_.values(e)[0],e=e.replace(/-| /g,""),e.length>11&&(e=e.substr(-11,11)),{key:t+"",val:e}})},selectPhoneItem:function(e){var t=e.val;t&&(this.els.telDom.val(t),this.changeBtnState())},isIOS7:function(){var e=$.os;return e.ios&&7===Math.floor(e.version)},_fixIOS7Bug:function(){var e=$(".J_orderbtnbox");this.els.telDom.add(this.els.ticketUserDom).on("focus",function(){e.css({position:"absolute",bottom:"0px"})}).on("blur",function(){e.css({position:"fixed",bottom:"0px"})})},_setPageView:function(){var e=this;this.header.set({title:P.pageTitle,back:!0,home:!0,view:this,tel:4000086666,events:{returnHandler:function(){e.cancelOrder()},homeHandler:function(){e.redirectToIndex()}}})},onShow:function(){this.setTitle(P.pageTitle),this.hideLoading(),M&&this.$el.find("#J_selectContact").show()},onHide:function(){this.hideLoading(),this.hideLoadingLayer()},redirectToIndex:function(){e.tHome()},cancelOrder:function(){var e=this,i=x.get(),o=new t.ui.Alert({title:P.alertTitle,onShow:function(){e.isCanceling=!0},onHide:function(){e.isCanceling=!1},message:P.leaveTips,buttons:[{text:P.cancel,click:function(){this.hide()}},{text:P.sure,click:function(){x.get();this.hide(),e.showLoading(),i&&i.id?e.back({did:i.id}):e.back()}}]})||this.returnAlert;e.isCanceling||o.show()},changeBtnState:function(){return!1},showLoadingLayer:function(e,i){!this.loadingLayer&&(this.loadingLayer=new t.ui.LoadingLayer(function(){e&&e()},i||P.submitting)),this.loadingLayer.show()},hideLoadingLayer:function(){this.loadingLayer&&this.loadingLayer.hide()},goNextStep:function(){var e=O.getUser();this.validator.validate()&&(this.showLoadingLayer(function(){A.abort(),D.abort()}),e&&e.Auth&&!e.IsNonUser?this.submitOrder():this.noMemberLogin($.proxy(this.submitOrder,this)))},submitOrder:function(){var i,o,n=this,s=e.getQuery("from"),a=this.els.telDom.val(),r=this.numberStep.getCurrentNum(),c={OInfo:{User:{UID:""},Product:{Price:{Price:1,CurCode:"RMB"},ProductID:0,Quantity:1},Contact:{Mobile:"13802200000",Email:"",Phone:""},Invoice:{InvoiceHead:"",InvoiceDesc:"",RevAddr:"",RevPerName:"",PostCode:"",ExType:0,ExInfo:{PName:"",CName:"",LName:"",ExpressAmount:{Price:0,CurCode:"RMB"}}},CouponInfo:null,OrderType:1,PaymentVersion:3,PartnerID:0,IsReturnCute:!1,IsMarketPrice:!1,Source:"1",IsInvoice:!1,MemberType:0,UserIP:""},head:{syscode:"09",lang:"01",auth:"",cid:"",ctok:"",cver:"1.0",sid:"8888"}},u=w.get(),d=x.get(),l=O.getUser(),h=k&&k.get();if(y.setAttr("curNum",r),!a||""===a||!t.utility.validate.isMobile(a))return this.hideLoading(),void this.showMessage(P.telTips);if(y.setAttr("tel",a),!d||!d.id)return this.forwardJump("detial","/webapp/tuan/detail/"+n.pid+".html"),void this.hide();if(d.activities&&d.activities.length>0)for(var m in d.activities){var p=d.activities[m];p&&p.type&&+p.type>0&&1==+p.type&&(c.OInfo.IsMarketPrice=!0)}u&&u.needed&&(c.OInfo.IsInvoice=u.needed,c.OInfo.Invoice.InvoiceHead=u.title,c.OInfo.Invoice.RevPerName=u.recipient,c.OInfo.Invoice.RevAddr=u.addr,c.OInfo.Invoice.PostCode=u.zip,i=u.regionText.split(" "),c.OInfo.Invoice.ExInfo.PName=i[0],c.OInfo.Invoice.ExInfo.CName=i[1],c.OInfo.Invoice.ExInfo.LName=i[2],c.OInfo.ItemType=d.pcId,c.OInfo.Invoice.ExType=u.deliveryMethod||0,c.OInfo.Invoice.ExInfo.ExpressAmount.Price=1==u.deliveryMethod?10:0),c.OInfo.Contact.Mobile=a,c.OInfo.Product.Quantity=r,c.OInfo.Product.ProductID=d.id,o=d.ticketPrice?d.ticketPrice:d.price.dPrice-(this.isCouponUsed()?this.store.coupon.amount:0),c.OInfo.Product.Price.Price=parseFloat(o>0?o:0),R.getAttr("auth")&&(c.head.auth=R.getAttr("auth"),c.OInfo.User.UID=l.UserID,c.LoginToken=l.loginToken),h&&(c.OInfo.AllianceInfo={AllianceID:h.AllianceID,OUID:h.OUID,SID:h.SID},c.OInfo.PartnerID=h.PartnerID),s&&(c.url=s),c.OInfo.Source=n._getUAInfo(),this.isCouponUsed()&&(c.OInfo.CouponInfo={CouponCode:this.store.coupon.code});var f=x.getAttr("ckintime"),g=n.els.ticketUserDom.val();f&&g&&(c.OInfo.binfo={name:g,ckintime:f}),this._sendOrderRequest(c)},_getUAInfo:function(){var e=$.os,t=M?"Hybird":"H5",i="other";return e.ios?e.iphone?i="iphone":e.ipad&&(i="ipad"):e.android&&(i=e.tablet?"android":"androidpad"),"client/"+i+"/"+t},_createNumberStep:function(){var e=this,t=e.store.max<B.max?e.store.max:B.max,i=e.store.min>B.min?e.store.min:B.min,o=x.getAttr("curNum")||1;this.numberStep=new f({max:t,min:i,initialVal:i>o?i:o,wrap:e.els.numStepDom,html:'<i class="minus <%if(initialVal <= min ){ %>num_invalid<%} %>" data-flag="-"></i><span id="J_curNum" class="numtext"><%=initialVal %></span><i data-flag="+" class="plus <%if(initialVal >= max ){ %>num_invalid<%} %>"></i>',onChange:function(){var t,i,o,n,s,a=e.store,r=w.get(),c=parseInt(e.$el.find("#J_curNum").text().trim()),u=e.price;e.isCouponUsed()?(n=a.coupon.amount,s=a.coupon.couponType):n=0,x.setAttr("curNum",c),a.activities&&a.activities.length>0&&e.els.pPriceDom[0]&&(t=a.activities[0],i=t.arg*c,e.els.pPriceDom.html(i)),o=b(2===s?parseFloat(x.getAttr("ticketPrice")||u)*c-n:(parseFloat(x.getAttr("ticketPrice")||u)-n)*c),o=(o>0?o:0)+(r&&1==r.deliveryMethod?10:0),e.els.totalPriceDom.html(o>0?o:0),e.els.couponAmount.length&&(3===s?e.els.couponAmount.html(b(n*c)):2===s&&e.els.couponAmount.html(b(n)))}}),this.numberStep.triggerChange()},_sendOrderRequest:function(e){var t=this;D.setParam(e),D.excute(function(e){var i,o,n,s,a=11,r=R.getAttr("auth"),c=w.get(),u={};s=O.isLogin()?0:1,"success"===e.Status.toLowerCase()?(i=e.GOrder.OID,n=e.GOrder.Price,o=e.GOrder.Price.TotalAmount.Price,u={oid:i,bustype:a,requestid:e.RequestId,islogin:s,from:"",rback:"",sback:"",eback:"",auth:r,title:t.store.name,recall:"Group.Switch.LTPPayment.LTPOrderProcessWS",amount:o,extno:e.GOrder.ExNo,needInvoice:!!c&&c.needed,payTypeList:e.GOrder.PayType,subPayTypeList:e.GOrder.SubPayType},o>0?J.submit(t,u,{IsRealPay:e.IsRealPay}):t.forwardJump("bookingsuccess","/webapp/tuan/bookingsuccess/"+i+".html")):t.showToast("failure"==e.ResponseStatus.Ack.toLowerCase()&&e.ResponseStatus.Errors&&e.ResponseStatus.Errors.length>0?t.getMsgByCode(e.ResponseStatus.Errors[0].ErrorCode):"订单提交失败请重试!"),t.hideLoadingLayer(),t.hideLoading(),t.isCouponUsed()&&t._clearUsedCoupon()},function(e){t.hideLoading(),t.hideLoadingLayer();var i="timeout"===e.statusText?P.timeoutTips:P.failTips;e.ResponseStatus&&"failure"==e.ResponseStatus.Ack.toLowerCase()&&e.ResponseStatus.Errors&&e.ResponseStatus.Errors.length>0&&(i=t.getMsgByCode(e.ResponseStatus.Errors[0].ErrorCode),i||(i=e.ResponseStatus.Errors[0].Message)),t.showToast(i)},this,!0)},loginAction:function(){var e=this;O.isLogin()||H.memberLogin({domain:"//"+document.domain,param:"?t=1&from="+encodeURIComponent("/webapp/tuan/booking"),callback:function(){e.onLoad(e.refer)}})},h5NoMemberLogin:function(e){var t=this;A.excute(function(){e&&e.call(t)},function(){t.hideLoadingLayer(),t.showToast("自动登录失败")},!1,t,function(){t.hideLoadingLayer()})},noMemberLogin:function(e){M?H.nonMemberLogin({domain:"//"+document.domain,param:"?t=1&from="+encodeURIComponent(location.href),callback:e}):this.h5NoMemberLogin(e)},getMsgByCode:function(e){return F[e]||""},_clearUsedCoupon:function(){delete this.store.coupon,N.remove()},isCouponUsed:function(){var e=this.store.coupon;return e&&"object"==typeof e&&!e.isNotUse},getCouponList:function(e){U.setParam({pid:this.pid,head:U.getHead().get()}),U.execute(function(t){var i=t.coupons&&t.coupons.length;i&&e&&e(i)},function(){},!1,this)}})});