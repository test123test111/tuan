define(["TuanApp","libs","c","cUtility","cWidgetFactory","CommonStore","cWidgetGuider","cWidgetMember","TuanModel","TuanBaseView","cCommonPageFactory","text!RefundTpl"],function(e,t,n,r,i,s,o,u,a,f,l,c){var h=l.create("TuanBaseView"),p=i.create("Member"),d={confirmContent:"退款一旦提交，团购券将不能恢复。请问您是否需要继续退款？",confirmNoLabel:"取消",confirmYesLabel:"继续退款",timeoutTip:"加载超时，请重试"},v=r.isInApp(),m=a.TuanOrderDetailModel.getInstance(),g=s.UserStore.getInstance(),y=a.TuanRefundlTicketModel.getInstance(),b=function(e,t){var n=parseFloat(e)*t;return Math.round(n*100)/100},w=i.create("Guider"),E=h.extend({pageid:"260004",hpageid:"261004",render:function(){this.$el.html($.trim(c)),this.els={productName:this.$el.find("#J_productName"),iscCount:this.$el.find("#J_iscCount"),refundCount:this.$el.find("#J_refundCount"),refundAmount:this.$el.find("#J_refundAmount"),refundCouponWrap:this.$el.find("#J_refundCouponWrap"),refundCouponAmount:this.$el.find("#J_refundCouponAmount"),refundInvoiceWrap:this.$el.find("#J_refundInvoiceWrap"),refundInvoiceAmount:this.$el.find("#J_refundInvoiceAmount"),btnMinus:this.$el.find("#J_minus"),btnPlus:this.$el.find("#J_plus")}},onCreate:function(){this.render()},events:{"click .btn_blue":"onSubmitRefund","click .minus":"onCouponMinus","click .plus":"onCouponPlus","click .apply_refund_reason>li":"onRefundReasonChange"},onCouponMinus:function(e){var t=$(e.currentTarget),n=this.tuanCouponPrice,r=this.promoCouponPrice,i=this.els.refundCount,s=+i.text();if(s<=1){this.els.btnMinus.addClass("num_invalid");return}s=s<=0?0:s-1,i.text(s),s<this.maxCoupons&&this.els.btnPlus.removeClass("num_invalid"),r?n=b(n-r>0?n-r:0,s):n=b(n,s),this.refundable&&(s>=this.maxCoupons&&r?(this.els.refundCouponWrap.show(),this.els.refundCouponAmount.text(r)):this.els.refundCouponWrap.hide(),this.invoiceAmt>0&&(s>=this.maxCoupons?(this.els.refundInvoiceWrap.show(),this.els.refundInvoiceAmount.text(this.invoiceAmt)):this.els.refundInvoiceWrap.hide())),this.els.refundAmount.text(n)},onCouponPlus:function(e){var t=$(e.currentTarget),n=this.tuanCouponPrice,r=this.promoCouponPrice,i=this.els.refundCount,s=+i.text();if(s>=this.maxCoupons){this.els.btnPlus.addClass("num_invalid");return}s=s>=this.maxCoupons?this.maxCoupons:s+1,i.text(s),s>1&&this.els.btnMinus.removeClass("num_invalid"),r?n=b(n-r>0?n-r:0,s):n=b(n,s),this.refundable&&(s>=this.maxCoupons&&r?(this.els.refundCouponWrap.show(),this.els.refundCouponAmount.text(r)):this.els.refundCouponWrap.hide(),this.invoiceAmt>0&&(s>=this.maxCoupons?(this.els.refundInvoiceWrap.show(),this.els.refundInvoiceAmount.text(this.invoiceAmt)):this.els.refundInvoiceWrap.hide())),this.els.refundAmount.text(n)},onRefundReasonChange:function(e){var t=$(e.currentTarget),n=t.text();t.parent().find("li").removeClass("choosed"),t.addClass("choosed"),n=="其他"?this.$el.find(".reason_other_text").show():this.$el.find(".reason_other_text").hide()},loadDetail:function(){this.showLoading(),m.setParam({oid:this.orderId,head:m.getHead().get()}),m.execute(function(e){this.createPage(e),this.hideLoading()},function(e){this.hideLoading(),e&&e.statusText=="timeout"&&this.showToast(d.timeoutTip)},this,!0)},checkLogin:function(){var e=this,t=g.isLogin();return t||(this.showLoading(),p.memberLogin({domain:"//"+document.domain,param:"?t=1&from="+encodeURIComponent("/webapp/tuan/refund"+this.orderId+".html"),callback:function(){e.onLoad()}})),t},createPage:function(e){this.invoiceAmt=e.invoiceAmt,this.maxCoupons=0,this.tuanCouponList=[],this.tuanCouponPrice=0,this.refundable=!0,this.promoCouponPrice=e.couponPrice;if(e.coupons&&e.coupons.length>0)for(var t=0;t<e.coupons.length;t++)e.coupons[t].isc==1&&(this.maxCoupons++,this.tuanCouponPrice=e.coupons[t].amt,this.tuanCouponList.push(e.coupons[t].val)),e.coupons[t].status===2&&(this.refundable=!1);e.product&&e.product.category&&e.product.category.ctgoryid===6&&e.product.category.subctgory===2&&this.$el.find(".J_needHideInTicket").remove();if(this.maxCoupons<=0)this.alertErrorMsg("","此订单不支持退款！");else{this.els.productName.text(e.pname),this.els.iscCount.text(this.maxCoupons),this.els.refundCount.text(1);if(e.couponAmt>0){var n=this.tuanCouponPrice-this.promoCouponPrice;this.els.refundAmount.text(n>0?n:0),this.refundable&&this.maxCoupons==1&&(this.els.refundCouponWrap.show(),this.els.refundCouponAmount.text(this.promoCouponPrice))}else this.els.refundAmount.text(this.tuanCouponPrice);this.refundable&&this.maxCoupons==1&&(this.els.refundInvoiceWrap.show(),this.els.refundInvoiceAmount.text(this.invoiceAmt))}},alertErrorMsg:function(e,t){var n=this;this.alert.setViewData({title:e,message:t,buttons:[{text:"知道了",click:function(){this.hide(),n.back()}}]}),this.alert.show()},onLoad:function(){this.orderId=Lizard.P("orderid"),this.header.set({title:"申请退款",view:this,back:!0,home:!0,events:{returnHandler:function(){this.back()},homeHandler:function(){e.tHome()}}}),this.from=decodeURIComponent(Lizard.P("from")||""),this.checkLogin()&&this.loadDetail()},onSubmitRefund:function(){var e=this,t=new n.ui.Alert({title:d.alertTitle,message:d.confirmContent,buttons:[{text:d.confirmNoLabel,click:function(){this.hide()}},{text:d.confirmYesLabel,click:function(){this.hide(),e.submitRefund()}}]});t.show()},submitRefund:function(){var e=this,t="",n=[],r=+this.els.refundCount.text();if(+r<=0){this.showToast("请输入需要回退的数量！");return}if(this.maxCoupons<=0||this.tuanCouponList.length<=0)return;var i=this.$el.find(".apply_refund_reason").find(".choosed");if(i){t=i.text();if(t=="其他"){var o=this.$el.find(".reason_other_text>textarea");o&&o.val()!=""&&(t=o.val())}}for(var u=0;u<+r;u++)n.push({TicketNO:this.tuanCouponList[u],OrderType:1,Trmk:t||""});y.setParam({head:s.HeadStore.getInstance().get(),AllianceInfo:null,Operator:null,CancelTicketList:n}),y.execute(function(t){if(t&&t.ResponseStatus.Ack.toLowerCase()=="failure"){e.showToast("退款失败请重试！");return}if(e.from){var n=decodeURIComponent(e.from);v?w.cross({path:"myctrip",param:n.replace(/^\/webapp\/myctrip\//i,"")}):location.href=location.protocol+"//"+location.host+n}else e.back({orderid:e.orderId})},function(){this.showToast("申请退款失败！")},this,!0)},onShow:function(){},onHide:function(){}});return E});