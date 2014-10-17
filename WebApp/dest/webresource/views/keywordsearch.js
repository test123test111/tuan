define(["TuanApp","libs","c","TuanBaseView","cWidgetFactory","cCommonPageFactory","cUtility","TuanModel","cDataSource","TuanStore","StoreManage","FilterXss","text!KeywordSearchTpl","HttpErrorHelper","TabSlide"],function(e,t,n,r,i,s,o,u,a,f,l,c,h,p){var d=n.ui,v=f.GroupSearchStore.getInstance(),m=f.TuanHistoryKeySearchStore.getInstance(),g=f.GroupPositionFilterStore.getInstance(),y=f.GroupCustomFilters.getInstance(),b=f.GroupCategoryFilterStore.getInstance(),w=f.GroupSearchStore.getInstance(),E=f.TuanHistoryCityListStore.getInstance(),S=i.create("TabSlide"),x,T=s.create("TuanBaseView");return x=T.extend({pageid:"214001",hpageid:"215001",tuankeyWordList:u.TuanKeyWordListModel.getInstance(),tuanHotKeywords:u.TuanHotKeywordsModel.getInstance(),dateSource:new a,selectItem:null,isComplete:!1,isLoading:!1,isScrolling:!1,render:function(){this.$el.html($.trim(h)),this.els={keywordSuggestBox:this.$el.find("#J_keywordSuggestWrap"),keywordSuggestTpl:this.$el.find("#J_keywordSuggestTpl"),keywordSuggestWrap:this.$el.find("#js_historykeysearch"),hotKeywordsTpl:this.$el.find("#J_hotKeywordsTpl"),hotKeywordsWrap:this.$el.find("#js_hotkeyword"),keywordInput:this.$el.find("#J_keywordInput"),keywordSearch:this.$el.find("#J_keywordSearch")},this.cityListTplfun=_.template(this.els.keywordSuggestTpl.html()),this.hotKeywordsTplfun=_.template(this.els.hotKeywordsTpl.html()),o.isInApp()&&$.os&&$.os.ios&&parseInt($.os.version,10)>=7&&(this.els.keywordSearch.css("border-top","20px solid #b3b3b3"),this.els.keywordSearch.css("padding-top","10px"),this.els.keywordSuggestBox.css("padding-top","20px"))},events:{"input #J_keywordInput":"tuanKeyWordInput","submit .search_wrap>form":"onSubmitSearch","click .city_item":"onKeywordItemClick","click #J_cancel":"onCancelInput","click .J_clearhistory":"onClearHistory","click #js_hotkeyword .sw_con>li":"goHotSearch"},onCancelInput:function(e){l.clearSpecified(!0),l.setCurrentKeyWord(!1),this.back()},onClearHistory:function(e){m.remove(),this.createPage({}),this.els.keywordInput.val("")},doSubmit:function(){var e=l.getGroupQueryParam(),t=this;v.setAttr("qparams",e),setTimeout(_.bind(function(){t.forwardJump("list","/webapp/tuan/list")},this),100)},onKeywordItemClick:function(e){l.clearSpecified(!0);var t=$(e.currentTarget),n=t.attr("data-id"),r=t.attr("data-name"),i=t.attr("data-type");l.addHistoryKeyWord(n,r,i),this.doSubmit()},onSubmitSearch:function(){var e=c.filterXSS(this.els.keywordInput.val());return typeof e=="undefined"||e==""||e==null?!1:(this.els.keywordInput[0].blur(),l.clearSpecified(!0),l.addHistoryKeyWord(e,e,7),this.doSubmit(),!1)},tuanKeyWordInput:function(e){var t=$(e.currentTarget),n=c.filterXSS(t.val()),r=this.els.keywordSuggestWrap,i=this.els.hotKeywordsWrap,s=t.attr("inputwait")||300;t.attr("waitsend",(new Date).getTime()),n?setTimeout(_.bind(function(e,t){if(e){var n=e.attr("waitsend");n&&(new Date).getTime()-parseInt(n)>parseInt(t)-10&&(r.find(".J_historykeysearch").hide(),r.find(".J_clearhistory").hide(),i.hide(),this.doQueryData(c.filterXSS(e.val())))}},this,t,s),s):(r.find(".J_historykeysearch").show(),r.find(".J_clearhistory").show(),r.find(".city_list.searchresult>li[data-filter]").hide(),r.find(".city_noresult").hide(),i.show())},buildEvent:function(){d.InputClear(this.els.keywordInput),this.onBodyChange=$.proxy(function(){this.els.keywordInput[0].blur()},this)},doQueryData:function(e){try{if(typeof e=="undefined"||e==""||e==null)return;var t=v.get();this.lastinputkey=e,this.$el.find(".s_city_loading").show(),this.getKeywordListData(e,t.ctyId,function(){this.$el.find(".s_city_loading").hide()})}catch(n){}},isVisible:function(){return this.$el.css("display").toLowerCase()!="none"},getKeywordListData:function(e,t,n){var r=this;r.tuankeyWordList.setParam("cityid",t),r.tuankeyWordList.setParam("keyword",e),r.tuankeyWordList.excute(function(e){r.createPage(e),n.call(this)},function(e){var t=p.getMessage(e);r.isVisible()&&this.showToast(t),n.call(this)},!1,this)},createPage:function(e){try{var t,n,r=l.getHistoryKeyWord(),i=v.get(),s=this;r.length>0&&(t=r[0].id,e.history||(e.history=[]),e.history=e.history.concat.apply(e.history,r)),n=this.cityListTplfun({data:e,keyid:t}),this.els.keywordSuggestWrap.html(n),e.Results&&(this.els.keywordSuggestWrap.find(".J_historykeysearch").hide(),this.els.keywordSuggestWrap.find(".J_clearhistory").hide())}catch(o){}},onCreate:function(){this.render(),this.buildEvent()},onLoad:function(e){this._refer=e,this.turning(),this.els.keywordInput.val(""),this.els.keywordInput[0].focus(),setTimeout(_.bind(function(){this.els.keywordInput[0].focus()},this),1e3),this.renderHotkeyword(),this.createPage({}),this.header&&this.header.rootBox&&(this.header.set({title:"",view:this,tel:null,events:{returnHandler:function(){this.back()}}}),this.header.show(),this.header.rootBox.hide()),this.hideLoading(),this.$el.bind("focus",this.onBodyChange),this.$el.bind("touchstart",this.onBodyChange)},onShow:function(){this.header.hide()},onHide:function(){this.header.show(),this.hotkeywordsSlide&&this.hotkeywordsSlide.destroy(),this.tuankeyWordList.abort(),this.$el.unbind("focus",this.onBodyChange),this.$el.unbind("touchstart",this.onBodyChange)},renderHotkeyword:function(){var e=this,t=v.get();this.tuanHotKeywords.setParam("cityid",t.ctyId),this.tuanHotKeywords.excute(_.bind(function(t){t&&t.hotWords&&t.hotWords.length>0&&(e.hotkeywordsSlide=new S({container:e.els.hotKeywordsWrap,source:t.hotWords,tpl:e.els.hotKeywordsTpl.html()}))},this))},goHotSearch:function(e){var t=$(e.currentTarget),n=decodeURIComponent(t.attr("data-json"));n=JSON.parse(n);if(n){var r=w.get(),i;l.clearAll(),E.removeAttr("nearby");if(n.pos){var s=n.pos.type,o=n.pos.val,u=n.pos.lat,a=n.pos.lon,f=n.pos.name;g.set({type:s,val:o,name:f,pos:{type:3,lat:u,lon:a,name:f}})}var c={"0|99":"&yen; 100 以下","100|250":"&yen; 100-250","250|400":"&yen; 250-400","400|600":"&yen; 400-600","601|":"&yen; 600 以上","0|1999":"&yen; 2000 以下","2000|3000":"&yen; 2000-3000","3001|":"&yen; 3000 以上"},h={"103|101":"一元酒店","103|10303":"别墅轰趴","103|10304":"住店游玩","103|10305":"情侣酒店"},p={2:"二星/经济",3:"三星/舒适",4:"四星/高档",5:"五星/豪华"},d={0:{index:0,name:"全部团购",category:"all"},1:{index:1,name:"酒店",category:"hotel"},8:{index:2,name:"美食",category:"catering"},7:{index:3,name:"旅游度假",category:"vacation"},6:{index:4,name:"门票",category:"ticket"},9:{index:5,name:"娱乐",category:"entertainment"}};n.price&&c[n.price]&&y.setAttr("price",{val:n.price,txt:c[n.price]}),n.trait&&h[n.trait]&&y.setAttr("trait",{val:n.trait,txt:h[n.trait]});if(n.star){var v=n.star.split(","),S={};for(var x in v)x=v[x],p[x]&&(S[x]=p[x]);S&&y.setAttr("star",S)}if(n.brand&&n.brand.length>0)for(var T in n.brand)T=n.brand[T],T&&T.val&&T.key&&y.setAttr("brand",{flag:1,val:T.val,txt:T.key});n.markland&&m.setAttr("key",{id:n.markland.id,word:n.markland.name,type:"markland"}),n.hotel&&m.setAttr("key",{id:n.hotel.id,word:n.hotel.name,type:"hotelid"}),n.keyword&&m.setAttr("key",{word:n.keyword}),n.activity&&m.setAttr("key",{id:n.activity.id,word:n.activity.name,type:"activity"}),n.district&&m.setAttr("key",{id:n.district.id,word:n.district.name,type:"district"}),n.isweekend&&w.setAttr("weekendsAvailable",n.isweekend),n.multishop&&y.setAttr("multiShop",n.multishop),n.voucher&&y.setAttr("voucher",n.voucher),n.sort&&(w.setAttr("sortRule",n.sort.stype),w.setAttr("sortType",n.sort.sval));if(n.classty){var N,C,k,L;n.classty.parent?(N=n.classty.parent.val,C=d[N],k=n.classty.val,L=n.classty.key):(N=n.classty.val,C=d[N]),b.setAttr("tuanType",N),C&&(b.setAttr("category",C.category),b.setAttr("name",C.name),b.setAttr("tuanTypeIndex",C.index)),b.setAttr("subVal",k),b.setAttr("subName",L),w.setAttr("ctype",N)}i=l.getGroupQueryParam(),w.setAttr("qparams",i),w.setAttr("ctyId",r.ctyId),w.setAttr("ctyName",r.ctyName),this.forwardJump("list","/webapp/tuan/list")}}}),x});