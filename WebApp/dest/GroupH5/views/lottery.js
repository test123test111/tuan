define(["TuanApp","c","TuanBaseView","cCommonPageFactory"],function(e,n,t,a){var o=a.create("TuanBaseView"),i=o.extend({onCreate:function(){},onShow:function(){this.updateTitle()},updateTitle:function(){var e=this;this.header.set({title:"彩票",back:!0,home:!0,view:this,events:{returnHandler:function(){e.back("home")},homeHandler:$.proxy(e.homeHandler,e)}}),this.header.show()},homeHandler:function(){e.tHome()}});return i});