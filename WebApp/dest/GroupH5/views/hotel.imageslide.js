define(["TuanApp","TuanBaseView","TuanModel","TuanStore","text!HotelImageSlideTpl","cWidgetFactory","cCommonPageFactory","SmoothSlide"],function(t,e,i,n,a,o,c){var s,d,r=n.TuanDetailsStore.getInstance(),h=n.TuanImagesListStore.getInstance(),u=i.TuanImagesListModel.getInstance(),l=o.create("SmoothSlide"),f=c.create("TuanBaseView");return d=f.extend({pageid:"260003",hpageid:"261003",events:{},onCreate:function(){},onLoad:function(){var t=this;this.pid=Lizard.P("pid");var e=r.getAttr("images"),i=h.getAttr("images");e&&+r.getAttr("id")===+this.pid?this.createSlide(e):i&&+h.getAttr("id")===+this.pid?this.createSlide(i):(t.showLoading(),u.setParam({id:this.pid}),u.excute(function(e){e=e&&e.images,t.hideLoading(),e&&e.length&&t.createSlide(e)},function(){t.hideLoading(),t.showToast("图片数据获取失败！")}))},setHeader:function(t,e){var i=this;this.header.set({title:t+"/"+e+"张",back:!0,home:!0,view:this,events:{returnHandler:function(){i.backAction()},homeHandler:function(){i.backHome()}}})},onShow:function(){},onHide:function(){},backAction:function(){this.back({pid:this.pid})},backHome:function(){t.tHome()},createSlide:function(t){var e,i=this,n=Lizard.P("index"),o=i.$el.find("#J_sliderWrap"),c=[],d=t&&t.length,r=function(t,n,a){e.html(a),i.setHeader(t+1,n)};if(n=n>0?n-1:0,d)for(var h=0;d>h;h++)c.push({title:t[h].title,src:t[h].large,href:"#",desc:t[h].desc});c.length&&(o.parent().parent().css("height","100%"),s=new l({container:o,source:c,itemCls:".pics_show_box_items",autoplay:0,prefetch:3,currentIndex:n,width:$("body").offset().width,tpl:a,onSwitchEnd:function(){},onSwitch:function(t,e){r(t,this.count(),e.title)},onInit:function(t){e=$(this.container).find("#J_picDesc"),r(t,this.count(),this.source[t].title)}}),this.slider=s)}})});