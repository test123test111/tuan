define(["TuanApp","libs","c","TuanBaseView","cCommonPageFactory","TuanStore","TuanModel","text!HotelImagesTpl"],function(e,t,n,r,i,s,o,u){var a=s.TuanDetailsStore.getInstance(),f=o.TuanImagesListModel.getInstance(),l=i.create("TuanBaseView"),l=i.create("TuanBaseView"),c=l.extend({pageid:"260001",hpageid:"261001",events:{"click .detail_pics_in>li":"gotoImageSlider"},getImagesList:function(){var e=this,t=a.getAttr("images");t?e.renderImagesList(t):(e.showLoading(),f.setParam({id:Lizard.P("pid")}),f.excute(function(t){t=t&&t.images,e.hideLoading();if(!t||!t.length)return;e.renderImagesList(t)},function(t){e.hideLoading(),e.showToast("图片数据获取失败！")}))},renderImagesList:function(e){e=e||[];var t=_.template(u);this.$el.html($.trim(t(e))),this.setHeader(e.length||0)},gotoImageSlider:function(e){var t=$(e.currentTarget).attr("data-index");this.forwardJump("hotelimageslide","/webapp/tuan/hotelimageslide?index="+t,{viewName:"hotelimageslide"})},isFromSlidePage:function(e){return e&&e.match(/imageslide/i)},onCreate:function(){},onLoad:function(){this.isFromSlidePage(this.referer)?window.scrollTo(this.scrollPos.x,this.scrollPos.y):this.getImagesList()},setHeader:function(e){var t=this;this.header.set({title:"共"+e+"张",back:!0,home:!0,view:this,events:{returnHandler:function(){t.backAction()},homeHandler:function(){t.backHome()}}})},onShow:function(){},onHide:function(){},backAction:function(){this.back()},backHome:function(t){e.tHome()}});return c});