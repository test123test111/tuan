define(["TuanApp","libs","c","cUtility","cWidgetFactory","CommonStore","cWidgetGuider","cWidgetMember","TuanModel","TuanBaseView","cCommonPageFactory","text!RefundTpl","NumberStep"],function(e,t,n,o,i,s,r,a,u,c,d,h,l){var p=d.create("TuanBaseView"),f=i.create("Member"),m={confirmContent:"退款一旦提交，团购券将不能恢复。请问您是否需要继续退款？",confirmNoLabel:"取消",confirmYesLabel:"继续退款",timeoutTip:"加载超时，请重试"},C=o.isInApp(),g=u.TuanOrderDetailModel.getInstance(),v=s.UserStore.getInstance(),b=u.TuanRefundlTicketModel.getInstance(),T=function(e,t){var n=parseFloat(e)*t;return Math.round(100*n)/100},x=i.create("Guider"),y="choosed",_="errorli",w=p.extend({pageid:"260004",hpageid:"261004",render:function(){this.$el.html(h),this.els={productName:this.$el.find("#J_productName"),iscCount:this.$el.find("#J_iscCount"),refundCount:this.$el.find("#J_refundCount"),refundAmount:this.$el.find("#J_refundAmount"),refundCouponWrap:this.$el.find("#J_refundCouponWrap"),refundCouponAmount:this.$el.find("#J_refundCouponAmount"),refundInvoiceWrap:this.$el.find("#J_refundInvoiceWrap"),refundInvoiceAmount:this.$el.find("#J_refundInvoiceAmount"),btnMinus:this.$el.find("#J_minus"),btnPlus:this.$el.find("#J_plus"),$types:this.$el.find(".J_refundType"),$numStep:this.$el.find(".J_numberStep")}},onCreate:function(){this.render()},events:{"click .J_btnSubmit":"onSubmitRefund","click .apply_refund_reason>li":"onRefundReasonChange","click .J_refundType":"selectRefundType"},_createNumberStep:function(){var e=this,t=this.maxCoupons,n=1,o=1;this.numberStep=new l({max:t,min:n,initialVal:n>o?n:o,wrap:e.els.$numStep,html:'<i class="minus <%if(initialVal <= min ){ %>num_invalid<%} %>" data-flag="-"></i><span id="J_curNum" class="numtext"><%=initialVal %></span><i data-flag="+" class="plus <%if(initialVal >= max ){ %>num_invalid<%} %>"></i>',onChange:function(){var n=e.tuanCouponPrice,o=e.promoCouponPrice,i=e.couponType,s=parseInt(this.getCurrentNum());n=o?2===i?Math.round(s===t?n*s-o:n*s):T(n-o>0?n-o:0,s):T(n,s),e.refundable&&(s>=t&&o?e.showCouponLabel(o):e.els.refundCouponWrap.hide(),e.invoiceAmt>0&&(s>=t?e.showInvoiceLabel(e.invoiceAmt):e.els.refundInvoiceWrap.hide())),e.els.refundAmount.text(n)}})},showCouponLabel:function(e){this.els.refundCouponWrap.show(),this.els.refundCouponAmount.text(e)},showInvoiceLabel:function(){this.els.refundInvoiceWrap.show(),this.els.refundInvoiceAmount.text(this.invoiceAmt)},onRefundReasonChange:function(e){var t=$(e.currentTarget),n=t.text();t.parent().find("li").removeClass("choosed"),t.addClass("choosed"),"其他"==n?this.$el.find(".reason_other_text").show():this.$el.find(".reason_other_text").hide()},loadDetail:function(){this.showLoading(),g.setParam({oid:this.orderId,head:g.getHead().get()}),g.execute(function(e){this.createPage(e),this.hideLoading()},function(e){this.hideLoading(),e&&"timeout"==e.statusText&&this.showToast(m.timeoutTip)},this,!0)},checkLogin:function(){var e=this,t=v.isLogin();return t||(this.showLoading(),f.memberLogin({domain:"//"+document.domain,param:"?t=1&from="+encodeURIComponent("/webapp/tuan/refund"+this.orderId+".html"),callback:function(){e.onLoad()}})),t},createPage:function(e){if(this.invoiceAmt=e.invoiceAmt,this.maxCoupons=0,this.tuanCouponList=[],this.tuanCouponPrice=0,this.refundable=!0,e.orderCoupons&&(this.promoCouponPrice=e.orderCoupons.price,this.couponType=e.orderCoupons.couponType),e.coupons&&e.coupons.length>0)for(var t=0;t<e.coupons.length;t++)1==e.coupons[t].isc&&(this.maxCoupons++,this.tuanCouponPrice=e.coupons[t].amt,this.tuanCouponList.push(e.coupons[t].val)),2===e.coupons[t].status&&(this.refundable=!1);e.product&&e.product.category&&6===e.product.category.ctgoryid&&2===e.product.category.subctgory&&this.$el.find(".J_needHideInTicket").remove(),this.maxCoupons<=0?this.alertErrorMsg("","此订单不支持退款！"):(this.els.productName.text(e.pname),this.els.iscCount.text(this.maxCoupons),this._createNumberStep(),e.couponAmt>0?this.numberStep.triggerChange():this.els.refundAmount.text(this.tuanCouponPrice),this.refundable&&1==this.maxCoupons&&(this.els.refundInvoiceWrap.show(),this.els.refundInvoiceAmount.text(this.invoiceAmt))),this.els.$types.filter('[data-type="1"]')[e.isFastRefund?"show":"hide"]()},alertErrorMsg:function(e,t){var n=this;this.alert.setViewData({title:e,message:t,buttons:[{text:"知道了",click:function(){this.hide(),n.back()}}]}),this.alert.show()},onLoad:function(){this.orderId=Lizard.P("orderid"),this.header.set({title:"申请退款",view:this,back:!0,home:!0,events:{returnHandler:function(){this.back()},homeHandler:function(){e.tHome()}}}),this.from=decodeURIComponent(Lizard.P("from")||""),this.checkLogin()&&this.loadDetail()},selectRefundType:function(e){var t=$(e.target);this.els.$types.removeClass(_).removeClass(y),t.closest(".J_refundType").addClass(y)},onSubmitRefund:function(){var e,t=this;return this.els.$types.filter("."+y).length?(e=new n.ui.Alert({title:m.alertTitle,message:m.confirmContent,buttons:[{text:m.confirmNoLabel,click:function(){this.hide()}},{text:m.confirmYesLabel,click:function(){this.hide(),t.submitRefund()}}]}),void e.show()):(this.showToast("请选择退款方式",3,function(){t.els.$types.addClass(_)}),!1)},submitRefund:function(){var e,t=this,n="",o=[],i=this.numberStep.getCurrentNum(),r=this.els.$types.filter("."+y).attr("data-type");if(0>=+i)return void this.showToast("请输入需要退回的数量！");if(!(this.maxCoupons<=0||this.tuanCouponList.length<=0)){var a=this.$el.find(".apply_refund_reason").find(".choosed");if(a&&(n=a.text(),"其他"==n)){var u=this.$el.find(".reason_other_text>textarea");u&&""!=u.val()&&(n=u.val())}for(var c=0;+i>c;c++)e={TicketNO:this.tuanCouponList[c],OrderType:1,Trmk:n||""},r&&(e.PayBackType=parseInt(r,10)),o.push(e);b.setParam({head:s.HeadStore.getInstance().get(),AllianceInfo:null,Operator:null,CancelTicketList:o}),b.execute(function(e){if(e&&"failure"==e.ResponseStatus.Ack.toLowerCase())return void t.showToast("退款失败请重试！");if(t.from){var n=decodeURIComponent(t.from);C?x.cross({path:"myctrip",param:n.replace(/^\/webapp\/myctrip\//i,"")}):location.href=location.protocol+"//"+location.host+n}else t.back({orderid:t.orderId})},function(){this.showToast("申请退款失败！")},this,!0)}},onShow:function(){},onHide:function(){}});return w});