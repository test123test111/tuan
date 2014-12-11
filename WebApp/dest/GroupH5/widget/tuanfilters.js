define(["cBase","cUtility","cWidgetFactory","cUIMask","cUIScroll","DropDown","Tab","StringsData","TuanModel","TuanStore","StoreManage"],function(t,e,a,i,s,o,l,n,r,d,c){var p,u=$.extend,h={weizhiquyu:"位置区域"},v=!1,f="youth"===e.getAppSys(),y=d.GroupCategoryFilterStore.getInstance(),g=d.GroupSortStore.getInstance(),b=d.GroupSearchStore.getInstance(),m=r.TuanConditionModel.getInstance(),x=d.GroupConditionStore.getInstance(),C=d.GroupCustomFilters.getInstance(),T=d.TuanHistoryCityListStore.getInstance(),S=d.GroupPositionFilterStore.getInstance(),A=["price","day","trait","distance","brand"],w=_.template(['<%if(["all", "hotel", "catering"].indexOf(category)!=-1){%>','<div class="pop_filter_chkitem" data-type="weekendsAvailable" data-text="周末可用">周末可用','<div class="pop_filter_label">','<input type="checkbox" id="weekends"<%if(weekendsAvailable==1){%> checked<%}%> /><label for="weekends"></label>',"</div>","</div>","<%}%>",'<%if(category=="hotel"){%>','<div class="pop_filter_chkitem" data-type="multiShop" data-text="多店可用">多店可用','<div class="pop_filter_label">','<input type="checkbox" id="multiShop"<%if(multiShop==1){%> checked<%}%> /><label for="multiShop"></label>',"</div>","</div>",'<div class="pop_filter_chkitem" data-type="voucher" data-text="代金券">代金券','<div class="pop_filter_label">','<input type="checkbox" id="voucher"<%if(voucher==1){%> checked<%}%> /><label for="voucher"></label>',"</div>","</div>","<%}%>"].join("")),k=_.template(['<ul class="pop_filter_tabs">','<li data-tab="price"><i class="pop_filter_point"<%if(!customdata.price || (customdata.price && customdata.price.val == "1|1")){%> style="display:none"<%}%>></i>价格</li>','<%if(category=="vacation"){%><li data-tab="day"><i class="pop_filter_point"<%if(!customdata.day){%> style="display:none"<%}%>></i>天数</li><%}%>','<%if(category=="hotel"){%><li data-tab="star"><i class="pop_filter_point"<%if(!customdata.star){%> style="display:none"<%}%>></i>星级</li><%}%>','<%if(category=="hotel"){%><li data-tab="brand"><i class="pop_filter_point"<%if(!customdata.brand){%> style="display:none"<%}%>></i>品牌</li><%}%>','<%if(category=="hotel"){%><li data-tab="trait"><i class="pop_filter_point"<%if(!customdata.trait){%> style="display:none"<%}%>></i>特色</li><%}%>','<%if((isNearBy && ["all", "hotel", "catering", "ticket", "entertainment"].indexOf(category)!=-1) || isUniversityNearBy){%><li data-tab="distance"><i class="pop_filter_point"<%if(!customdata.distance){%> style="display:none"<%}%>></i>距离</li><%}%>',"</ul>"].join("")),P=_.template(['<li data-filter="brand"<%if(!val){%> class="choosed"<%}%>><div class="txt01">不限</div></li>',"<%_.each(arr, function(a,i){%>",'<li data-filter="brand" data-value="<%=a.val%>" data-text="<%=a.txt%>"<%if(a.val==val){%> class="choosed"<%}%>>','<div class="txt01"><%=a.txt%></div>',"</li>","<%})%>"].join("")),I=_.template(['<li data-filter="trait"<%if(!val){%> class="choosed"<%}%>><div class="txt01">不限</div></li>',"<%_.each(arr, function(a,i){%>",'<li data-filter="trait" data-value="<%=a.val%>" data-text="<%=a.txt%>"<%if(a.val==val){%> class="choosed"<%}%>>','<div class="txt01"><%=a.txt%></div>',"</li>","<%})%>"].join("")),F=_.template(['<div class="pop_filter_lefttab">','<ul class="pop_filter_tabs">',"<%_.each(tuanType, function(v){%>",'<li class="J_categoryTabLabel<%if(v.val==tuanTypeVal){%> choosed<%}%>"><%=v.txt%></li>',"<%})%>","</ul>","</div>",'<div class="pop_filter_righttab">',"<%_.each(tuanType, function(v){%>",'<div class="J_categoryTabPanel" style="height:285px;<%if(v.val!=tuanTypeVal){%>display:none<%}%>">','<ul class="pop_filter_baselist" style="min-height:285px">','<li data-type="<%=v.val%>"<%if(v.val==tuanTypeVal && typeof subVal == "undefined"){%> class="choosed"<%}%>><div class="txt01"><%=v.val>0 ? "全部" : ""%><%=v.txt%></div><span class="txt02"><%=v.groupCount%></span></li>',"<%_.each(subTuanType, function(s){%>","<%if (s.parentType == v.val){%>",'<li data-type="<%=v.val%>" data-value="<%=s.val%>" data-name="<%=s.txt%>"<%if(typeof subVal !== "undefined" && s.val==subVal){%> class="choosed"<%}%>><div class="txt01"><%=s.txt%></div><span class="txt02"><%=s.groupCount%></span></li>',"<%}%>","<%})%>","</ul>","</div>","<%})%>","</div>"].join("")),J=_.template(['<div class="pop_filter_lefttab">','<ul class="pop_filter_tabs">','<%if(Zone.length){%><li class="J_positionTabLabel<%if(curr.type==5){%> choosed<%}%>">商业区</li><%}%>','<%if(Location.length){%><li class="J_positionTabLabel<%if(curr.type==4){%> choosed<%}%>">行政区</li><%}%>','<%if(tuanType!=7 && AirportStation.length){%><li class="J_positionTabLabel<%if(curr.type==-4){%> choosed<%}%>">机场车站</li><%}%>','<%if(tuanType!=7 && SubwayLine.length){%><li class="J_positionTabLabel<%if(curr.type==-3){%> choosed<%}%>">地铁线</li><%}%>','<%if(tuanType!=7 && Attraction.length){%><li class="J_positionTabLabel<%if(curr.type==-2){%> choosed<%}%>">景点</li><%}%>','<%if(tuanType!=7 && College.length){%><li class="J_positionTabLabel<%if(curr.type==-1){%> choosed<%}%>">大学周边</li><%}%>',"</ul>","</div>",'<div class="pop_filter_righttab">',"<%if(Zone.length){%>",'<div class="J_positionTabPanel"<%if(curr.type!=5){%> style="height:285px;display:none"<%}%>>','<ul class="pop_filter_baselist" style="min-height:285px">','<li<%if(!curr.val||curr.type!=5){%> class="choosed"<%}%>><div class="txt01">不限</div></li>',"<%_.each(Zone, function(val){%>",'<li data-type="5" data-value="<%=val.val%>" data-pos=\'<%=JSON.stringify(val.pos)%>\' data-text="<%=val.txt%>"<%if(curr.type==5&&curr.val==val.val){%> class="choosed"<%}%>><div class="txt01"><%=val.txt%></div><span class="txt02"><%=val.groupCount || ""%></span></li>',"<%})%>","</ul>","</div>","<%}%>","<%if(Location.length){%>",'<div class="J_positionTabPanel"<%if(curr.type!=4){%> style="height:285px;display:none"<%}%>>','<ul class="pop_filter_baselist" style="min-height:285px">','<li<%if(!curr.val||curr.type!=4){%> class="choosed"<%}%>><div class="txt01">不限</div></li>',"<%_.each(Location, function(val){%>",'<li data-type="4" data-value="<%=val.val%>" data-text="<%=val.txt%>"<%if(curr.type==4&&curr.val==val.val){%> class="choosed"<%}%>><div class="txt01"><%=val.txt%></div><span class="txt02"><%=val.groupCount || ""%></span></li>',"<%})%>","</ul>","</div>","<%}%>","<%if(tuanType!=7 && AirportStation.length){%>",'<div class="J_positionTabPanel"<%if(curr.type!=-4){%> style="height:285px;display:none"<%}%>>','<ul class="pop_filter_baselist" style="min-height:285px">','<li<%if(!curr.val||curr.type!=-4){%> class="choosed"<%}%>><div class="txt01">不限</div></li>',"<%_.each(AirportStation, function(val){%>",'<li data-type="-4" data-value="<%=val.val%>" data-pos=\'<%=JSON.stringify(val.pos)%>\' data-text="<%=val.txt%>"<%if(curr.type==-4&&curr.val==val.val){%> class="choosed"<%}%>><div class="txt01"><%=val.txt%></div><span class="txt02"><%=val.groupCount || ""%></span></li>',"<%})%>","</ul>","</div>","<%}%>","<%if(tuanType!=7 && SubwayLine.length){%>",'<div class="J_positionTabPanel"<%if(curr.type!=19){%> style="height:285px;display:none"<%}%> id="J_subwayLine">','<ul class="pop_filter_baselist" style="min-height:285px">','<li<%if(!curr.line){%> class="backwards"<%}%>><div class="txt01">不限</div></li>',"<%_.each(SubwayLine, function(val){%>",'<li data-type="-5" data-value="<%=val.val%>" data-text="<%=val.txt%>" class="arr_r<%if(curr.line==val.val){%> backwards<%}%>"><div class="txt01"><%=val.txt%></div><span class="txt03"><%if(curr.line==val.val&&curr.type==-3){%><%=curr.name%><%}%></span><span class="txt02"><%=val.groupCount || ""%></span></li>',"<%})%>","</ul>","</div>","<%}%>","<%if(tuanType!=7 && Attraction.length){%>",'<div class="J_positionTabPanel"<%if(curr.type!=-2){%> style="height:285px;display:none"<%}%>>','<ul class="pop_filter_baselist" style="min-height:285px">','<li<%if(!curr.val||curr.type!=-2){%> class="choosed"<%}%>><div class="txt01">不限</div></li>',"<%_.each(Attraction, function(val){%>",'<li data-type="-2" data-value="<%=val.val%>" data-pos=\'<%=JSON.stringify(val.pos)%>\' data-text="<%=val.txt%>"<%if(curr.type==-2&&curr.val==val.val){%> class="choosed"<%}%>><div class="txt01"><%=val.txt%></div><span class="txt02"><%=val.groupCount || ""%></span></li>',"<%})%>","</ul>","</div>","<%}%>","<%if(tuanType!=7 && College.length){%>",'<div class="J_positionTabPanel"<%if(curr.type!=-1){%> style="height:285px;display:none"<%}%>>','<ul class="pop_filter_baselist" style="min-height:285px">','<li<%if(!curr.pos||curr.type!=-1){%> class="choosed"<%}%>><div class="txt01">不限</div></li>',"<%_.each(College, function(val){%>",'<li data-type="-1" data-pos=\'<%=JSON.stringify(val.pos)%>\' data-text="<%=val.txt%>"<%if(curr.type==-1&&curr.pos.lat==val.lat&&curr.pos.lon==val.lon){%> class="choosed"<%}%>><div class="txt01"><%=val.txt%></div><span class="txt02"><%=val.groupCount || ""%></span></li>',"<%})%>","</ul>","</div>","<%}%>",'<div class="J_positionTabPanel" style="height:285px;overflow:hidden;display:none" id="J_subwayStation">','<ul class="pop_filter_baselist" style="min-height:285px;"></ul>',"</div>","</div>"].join("")),L=_.template(['<li data-type="-3"><div class="pop_filter_back">返回</div></li>','<li data-type="19" data-line="<%=lineId%>"<%if(curr.val==lineId&&curr.type==19){%> class="choosed"<%}%> data-text="<%=lineName%>"><div class="txt01">全线</div></li>',"<%_.each(arr, function(a,i){%>",'<li data-type="-3" data-value="<%=a.val%>" data-line="<%=lineId%>" data-pos=\'<%=JSON.stringify(a.pos)%>\' data-text="<%=a.txt%>"<%if(curr.val==a.val){%> class="choosed"<%}%>>','<div class="txt01"><%=a.txt%></div><span class="txt02"><%=a.groupCount || ""%></span>',"</li>","<%})%>"].join(""));return p=new t.Class({__propertys__:function(){var t=this;this.options={},this.page=null,this.mask=new i({onCreate:function(){var e=this;this.root.on("click",function(){t.options.categoryPanel.hide(),t.options.positionPanel.hide(),t.options.filterPanel.hide(),t._categoryStatus=!1,t._positionStatus=!1,t._customFilterStatus=!1,e.hide()})}})},initSort:function(){var t=this,e=g.getAttr("sortTypeIndex")||0,a=b.getAttr("sortRule"),i=b.getAttr("sortType"),s=t.options;this.sort=new o({trigger:s.sortTrigger,panel:s.sortPanel,label:s.sortLabel,selectedIndex:e,selectedItemCls:"choosed",onShow:function(){s.categoryPanel.hide(),s.positionPanel.hide(),s.filterPanel.hide(),t.mask.hide(),t._categoryStatus=!1,t._positionStatus=!1,t._customFilterStatus=!1},onSelect:function(e){var a=$(e),i=a.attr("data-id"),s=a.attr("data-type"),o=+this.selectedIndex>=0?this.selectedIndex:0;g.setAttr("sortTypeIndex",o),b.setAttr("sortRule",i),2==i&&f&&(s=8),b.setAttr("sortType",s),t.getListData()}});var l=this.sort.panel.find('[data-id="'+a+'"][data-type="'+i+'"]');l=l&&l[0]||$(this.sort.getItemByIndex(e))[0],this.sort.select(l,!0),s.sortPanel.on("touchmove",function(t){t.preventDefault()})},initCategory:function(){var t=this,e=this.options.categoryTrigger,a=this.options.categoryPanel;this.renderCategory(),e.on("click",function(){t._categoryStatus?(a.hide(),t.mask.hide(),t._categoryStatus=!1):(t.options.positionPanel.hide(),t.options.filterPanel.hide(),t._positionStatus=!1,t._customFilterStatus=!1,t.sort.hide(),a.show(),t.mask.show(),a.css({"-webkit-transform":"translate(0, 30px) translateZ(0)",opacity:0}),a.animate({"-webkit-transform":"translate(0, -8px) translateZ(0)",opacity:1}),t._categoryStatus=!0,void 0===t._categoryInited&&(t.initCategoryTab(),t._categoryInited=!0))}),a.on("touchmove",function(t){t.preventDefault()})},initCategoryTab:function(){var t=this,e=this.page.$el,a=e.find(".J_categoryTabLabel"),i=e.find(".J_categoryTabPanel");this.categoryTab=new l({label:a,panel:i,isScroll:!0,labelSelectedClass:"choosed",labelSelectedIndex:y.getAttr("tuanTypeIndex")||0,itemClass:".pop_filter_baselist li",itemSelectedClass:"choosed",onSelect:function(e){var a=e.data("type"),s=e.data("value")||"",o=e.data("name"),l=n.groupType[a],r=7==a,d=t.page;i.find(".choosed").removeClass("choosed"),e.addClass("choosed");var p=C.getAttr("distance");c.clearSpecified(!1),p&&c.isNearBy()&&C.setAttr("distance",p),t.clearCustomFilter(!0),y.setAttr("tuanType",a),y.setAttr("category",l.category),y.setAttr("name",l.name),y.setAttr("tuanTypeIndex",l.index),y.setAttr("subVal",s),y.setAttr("subName",o),b.setAttr("qparams",c.getGroupQueryParam()),b.setAttr("ctype",a),r?(T.removeAttr("nearby"),d.toolbarHeight-=30===d.toolbarHeight||75===d.toolbarHeight?30:0):d.toolbarHeight+=0===d.toolbarHeight||45===d.toolbarHeight?30:0,d.toolbarSpace.css("height",d.toolbarHeight),d.controlGPSInfoWrap(!r),d.updateTitle(b.getAttr("ctyName"),!0),t.options.categoryTrigger.html(o||n.groupType[a].name),t.resetPosition(a),t.getListData(),t.renderFilter(l.category),t.mask.hide(),t.options.categoryPanel.hide(),t._categoryStatus=!1}})},renderCategory:function(){var t={},e=x.get(),a=y.get()||{},i=this.options.categoryTrigger;if(t.tuanTypeVal=a.tuanType||b.getAttr("ctype")||0,a.subVal&&(t.subVal=a.subVal),i.html(a.subName||n.groupType[t.tuanTypeVal].name),e&&$.isArray(e.categroy)&&e.categroy.length>0){var s=e.categroy[0].groupCondition;s&&$.isArray(s)&&s.length>0&&(t.tuanType=$.grep(s,function(t){return 16==t.type}),t.subTuanType=$.grep(s,function(t){return 32==t.type}),this.options.categoryPanel.html(F(t)))}},updateCategoryName:function(){var t=y.getAttr("tuanTypeIndex")||0,e=y.getAttr("tuanType")||0;this.categoryTab?this.categoryTab.switch(t):this.renderCategory(),this.options.categoryTrigger.html(n.groupType[e].name)},initPosition:function(){var t=this,e=this.options.positionTrigger,a=this.options.positionPanel;this.renderPosition(),e.on("click",function(){v||(t._positionStatus?(a.hide(),t.mask.hide(),t._positionStatus=!1):(t.options.categoryPanel.hide(),t.options.filterPanel.hide(),t._categoryStatus=!1,t._customFilterStatus=!1,t.sort.hide(),a.show(),t.mask.show(),a.css({"-webkit-transform":"translate(0, 30px) translateZ(0)",opacity:0}),a.animate({"-webkit-transform":"translate(0, -8px) translateZ(0)",opacity:1}),void 0===t._positionInited&&(t.initPositionTab(),t._positionInited=!0),t._positionStatus=!0))}),a.on("touchmove",function(t){t.preventDefault()})},initPositionTab:function(){function t(t){d.find(".choosed").removeClass("choosed"),d.find("li:first-child").addClass("choosed"),t.addClass("choosed").siblings().removeClass("choosed")}function e(){p.find(".backwards").removeClass("backwards"),p.find(".txt03").text("")}function a(a){t(a),e()}var i=this,o=this.page.$el,r=o.find(".J_positionTabLabel"),d=o.find(".J_positionTabPanel"),p=o.find("#J_subwayLine"),u=o.find("#J_subwayStation"),v={5:0,4:1,"-4":2,"-3":3,19:3,"-2":4,"-1":5};this.positionTab=new l({label:r,panel:d,isScroll:!0,labelSelectedClass:"choosed",labelSelectedIndex:v[S.getAttr("type")]||0,itemClass:".pop_filter_baselist li",itemSelectedClass:"choosed",onSwitch:function(){u.hide()},onSelect:function(t){var e,o,l=t.data("type"),r=t.data("text"),d=b.get(),v=c.getCurrentKeyWord();if(c.isNearBy()){T.setAttr("nearby",!1),C.removeAttr("distance");var f=i.page.$el.find('#J_filterTabLabel li[data-tab="distance"]'),y=i.page.$el.find('#J_filterTabPanel div[data-tab="distance"]');f.hide(),y.hide(),f.find("i").hide(),i.updateCustomFilterIcon(),b.removeAttr("pos")}if(v&&((0>l||"5"==l)&&c.removeCurrentKeyWord(),"4"==l&&"location"==v.type&&c.removeCurrentKeyWord()),d){if(+d.ctyId>0){var g=c.findCityInfoById(d.ctyId);g&&b.setAttr("ctyName",g.name)}d.edate||b.setAttr("edate",d.bdate)}if(r)switch(l){case 5:a(t),S.set({type:5,name:r,val:t.data("value"),pos:t.data("pos")});break;case 4:a(t),S.set({type:4,name:r,val:t.data("value")});break;case 19:a(t),e=t.data("line"),o=p.find('li[data-value="'+e+'"]'),S.set({type:19,name:r,line:e,val:e}),u.hide(),p.show(),p.find(".txt03").text(""),p.find("li:first-child").removeClass("choosed"),o.addClass("backwards").siblings().removeClass("backwards");break;case-5:if(e=t.data("value"),e==u.data("line"))return p.hide(),void u.show();var m=i.getSubwayStation(e,r),_=u.find("ul");p.hide(),u.data("line",e).show(),_.html(L(m));var x=new s({wrapper:u,scroller:_});return void x.scrollTo(0,0,0);case-3:case-4:case-2:case-1:var A={type:l,name:r,pos:t.data("pos")},w=t.data("value");w&&(A.val=w),-3==l?(e=t.data("line"),o=p.find('li[data-value="'+e+'"]'),A.line=e,p.show(),u.hide(),p.find("li:first-child").removeClass("choosed"),p.find(".txt03").text(""),o.addClass("backwards").siblings().removeClass("backwards"),o.find(".txt03").text(r),t.addClass("choosed").siblings().removeClass("choosed")):a(t),S.set(A),C.setAttr("distance",{val:1,txt:"1公里内"})}else{if(-3==l)return p.show(),void u.hide();a(t),S.remove(),C.removeAttr("distance")}i.updatePositionName(r||h.weizhiquyu);var k=b.getAttr("ctype");0>l?i.renderFilter(n.groupType[k].category,!0):(C.removeAttr("distance"),i.renderFilter(n.groupType[k].category,!1)),i.updateCustomFilterIcon();var P=c.getGroupQueryParam();b.setAttr("qparams",P),S.setAttr("ctyId",d.ctyId),i.getListData(),i.mask.hide(),i.options.positionPanel.hide(),i._positionStatus=!1}})},renderPosition:function(t,e){var a={Zone:[],Location:[],College:[],AirportStation:[],SubwayLine:[],Attraction:[]},i=this.options.positionPanel,s=this.options.positionTrigger,o=x.get();if(a.curr=S.get()||{},this.updatePositionName(),t=t||b.getAttr("ctype")||0,a.tuanType=t,o&&$.isArray(o.categroy)&&o.categroy.length>0){var l=$.grep(o.categroy,function(e){return e.ctype==t});if(l&&$.isArray(l)&&l.length>0){var n=o.categroy[0].groupCondition;n&&$.isArray(n)&&n.length>0&&$.each(n,function(t,e){switch(e.type){case 2:a.Location.push(e);break;case 4:a.Zone.push(e);break;case 8:a.College.push(e);break;case 256:case 512:a.AirportStation.push(e);break;case 1024:a.SubwayLine.push(e);break;case 4096:a.Attraction.push(e)}})}else s.hide();7===+t?a.Zone.length||a.Location.length||a.College.length?(s.show(),i.html(J(a)),e&&e()):s.hide():a.Zone.length||a.Location.length||a.College.length||a.AirportStation.length||a.SubwayLine.length||a.Attraction.length?(s.show(),i.html(J(a)),e&&e()):s.hide()}},resetPosition:function(t){var e=this,a=1;a|=2,a|=4,a|=8,a|=64,a|=128,a|=256,a|=512,a|=1024,a|=2048,a|=4096,a|=8192,v=!0,this.options.positionTrigger.html(h.weizhiquyu),m.setParam({ctyId:b.getAttr("ctyId"),categroy:t,type:a}),m.excute(function(){e.renderPosition(t,function(){v=!1,e._positionInited=void 0})},function(){},!1,this)},updatePositionName:function(t){var e=this.options.positionTrigger;if(t)e.html(t);else{var a=S.get()||{},i=a.name;-6==a.type&&(i=h.weizhiquyu),e.html(i||h.weizhiquyu)}},initCustomFilter:function(){var t=this,e=t.options.customFilter,a=this.page.$el,i=a.find("#J_filterPanel"),s=a.find("#J_checkboxWrap"),o=a.find(".pop_filter_cancel"),l=a.find(".pop_filter_sure"),n=a.find(".pop_filter_clear");this.renderFilter(y.getAttr("category")),this.updateCustomFilterIcon(),e.on("click",function(){t._customFilterStatus?(i.hide(),t.mask.hide(),t._customFilterStatus=!1):(t.sort.hide(),t.options.categoryPanel.hide(),t.options.positionPanel.hide(),t._categoryStatus=!1,t._positionStatus=!1,i.show(),t.mask.show(),i.css({"-webkit-transform":"translate(0, 30px) translateZ(0)",opacity:0}),i.animate({"-webkit-transform":"translate(0, -8px) translateZ(0)",opacity:1}),void 0===t._customFilterInited&&(t.initFilterTab(),t._customFilterInited=!0),t._customFilterStatus=!0)}),o.on("click",function(){i.hide(),t.mask.hide(),t._customFilterStatus=!1}),l.on("click",function(){i.hide(),t.mask.hide(),t.sureCustomFilter(),t._customFilterStatus=!1}),n.on("click",function(){t.clearCustomFilter(),t._customFilterStatus=!1}),s.on("click","div[data-type]",function(e){if("LABEL"!=e.target.tagName){var a=$(e.currentTarget),i=a.data("type"),s=a.find("input:checked").length;"weekendsAvailable"==i?b.setAttr("weekendsAvailable",s?1:0):C.setAttr(i,s?1:0),n[t.customFilterSelectedCount()?"removeClass":"addClass"]("sta-disabled")}}),i.on("touchmove",function(t){t.preventDefault()})},initFilterTab:function(){var t=this,e=this.page.$el,a=e.find("#J_filterTabLabel"),i=e.find("#J_filterTabPanel"),s=e.find("input[data-value]"),o=e.find(".pop_filter_clear");a.on("click","li",function(e){var s=$(e.currentTarget);if(!s.hasClass("choosed")){var o=s.data("tab");a.find(".choosed").removeClass("choosed"),s.addClass("choosed"),i.find("div[data-tab]").hide(),t.renderTabWrap(o,i,!0)}}),i.on("click",".pop_filter_baselist li",function(e){var i=$(e.currentTarget),l=i.data("value"),n=i.data("text"),r=i.data("filter");if(A.indexOf(r)>-1)i.addClass("choosed").siblings(".choosed").removeClass("choosed"),l?C.setAttr(r,{val:l,txt:n}):C.removeAttr(r),a.find('li[data-tab="'+r+'"]>i')[l?"show":"hide"]();else if("star"==r)if(l){l=l.toString();var d=C.getAttr("star")||{};s[0].checked=i.parent().find("input:checked").length?!1:!0,i.find("input:checked").length?d[l]=n:delete d[l],C.setAttr("star",d),a.find('li[data-tab="star"]>i')[$.isEmptyObject(d)?"hide":"show"]()}else s.each(function(t,e){t>0&&(e.checked=!1)}),C.removeAttr("star"),a.find('li[data-tab="star"]>i').hide();o[t.customFilterSelectedCount()?"removeClass":"addClass"]("sta-disabled")})},renderTabWrap:function(t,e,a){var i,o,l,n=C.get(),r=e.find('div[data-tab="'+t+'"]');switch(a&&r.show(),t){case"price":7==b.getAttr("ctype")?(r.find('li[data-ptype="0"]').hide(),r.find('li[data-ptype="1"]').show()):(r.find('li[data-ptype="0"]').show(),r.find('li[data-ptype="1"]').hide()),r.find(".choosed").removeClass("choosed"),n&&n.price?r.find('li[data-value="'+n.price.val+'"]').addClass("choosed"):r.find('li[data-value=""]').addClass("choosed");break;case"day":r.find(".choosed").removeClass("choosed"),n&&n.day?r.find('li[data-value="'+n.day.val+'"]').addClass("choosed"):r.find('li[data-value=""]').addClass("choosed");break;case"star":if(n&&n.star){var d=n.star;r.find("input:checked")[0].checked=!1,_.each(d,function(t,e){r.find('input[data-value="'+e+'"]')[0].checked=!0})}else r.find("input[data-value]").each(function(t,e){e.checked=0>=t});break;case"brand":var c=r.find("#J_brand");if(c.length){var p=c.parent();p.css({overflow:"hidden","max-height":"295px"}),c.html(P(this.getDataFromCondition("brand",1))),i=new s({wrapper:p,scroller:c})}break;case"trait":var u=r.find("#J_trait");if(u.length){var h=u.parent();h.css({overflow:"hidden","max-height":"295px"}),u.html(I(this.getDataFromCondition("trait",8192))),o=new s({traitWrapper:h,scroller:u})}break;case"distance":r.data("scrolled")||(l=new s({wrapper:r,scroller:r.find("ul")}),r.data("scrolled","true")),r.find(".choosed").removeClass("choosed"),n&&n.distance?r.find('li[data-value="'+n.distance.val+'"]').addClass("choosed"):r.find('li[data-value=""]').addClass("choosed")}},renderFilter:function(t,e){var a=this.page.$el,i=C.get(),s=a.find("#J_checkboxWrap"),o=a.find("#J_filterTabLabel"),l=a.find("#J_filterTabPanel"),n={category:t,weekendsAvailable:b.getAttr("weekendsAvailable"),multiShop:i&&i.multiShop,voucher:i&&i.voucher},r=w(n);r?s.show().html(r):s.hide(),o.html(k({category:t||"all",isNearBy:c.isNearBy(),customdata:i||{},isUniversityNearBy:e})),l.find("div[data-tab]").hide(),this.renderTabWrap(o.find("li:first-child").addClass("choosed").data("tab"),l,!0)},getDataFromCondition:function(t,e){var a={val:"",arr:[]},i=x.get(),s=C.getAttr(t);if(s&&s.val&&(a.val=s.val),i&&$.isArray(i.categroy)&&i.categroy.length>0){var o=i.categroy[0].groupCondition;o&&$.isArray(o)&&o.length>0&&(a.arr=$.grep(o,function(t){return t.type==e}))}return a},getSubwayStation:function(t,e){var a={lineId:t,lineName:e,arr:[]},i=x.get();if(a.curr=S.get()||{},i&&$.isArray(i.categroy)&&i.categroy.length>0){var s=i.categroy[0].groupCondition;s&&$.isArray(s)&&s.length>0&&(a.arr=$.grep(s,function(e){return e.parentType==t}))}return a},clearCustomFilter:function(t){var e=this,a=c.isNearBy(),i=this.page.$el,s=i.find(".pop_filter_clear");if(!s.hasClass("sta-disabled")){var o=i.find("#J_filterTabLabel"),l=i.find("#J_filterTabPanel");b.removeAttr("weekendsAvailable"),C.removeAttr("multiShop"),C.removeAttr("voucher");var n=A.concat(["star"]);t&&a&&n.splice(n.indexOf("distance"),1),_.each(n,function(t){C.removeAttr(t),e.renderTabWrap(t,l,!1)}),o.find(".choosed").removeClass("choosed"),o.find("li i").hide(),l.find("div[data-tab]").hide(),this.renderTabWrap(o.find("li:first-child").addClass("choosed").data("tab"),l,!0),i.find("#J_checkboxWrap input:checked").each(function(t,e){e.checked=!1}),this.updateCustomFilterIcon()}},sureCustomFilter:function(){var t=b.get(),e=c.getGroupQueryParam();t&&(t.edate||b.setAttr("edate",t.bdate)),b.setAttr("qparams",e),this.getListData(),this.updateCustomFilterIcon()},customFilterSelectedCount:function(){var t=!1,e=c.getGroupQueryParam(),a=b.getAttr("weekendsAvailable"),i=e&&e.length>0&&e.filter(function(e){!t&&(t=9===parseInt(e.type,10));var a=parseInt(e.type,10);return 14==a&&e.value==y.getAttr("subVal")?!1:-1!==[1,2,3,9,14].indexOf(a)}).length;return 1==a&&(i+=1),!C.getAttr("distance")&&t&&(i-=1),"1|1"==C.getAttr("price.val")&&(i-=1),i>0?i:0},updateCustomFilterIcon:function(){var t=this,e=this.page.$el,a=t.options.customFilter,i=t.customFilterSelectedCount(),s=e.find(".pop_filter_clear");a.find(".fil_num").text(i)[i>0?"show":"hide"](),s[i>0?"removeClass":"addClass"]("sta-disabled")},getListData:function(){b.setAttr("pageIdx","1"),this.page.isLoading=!0,window.scrollTo(0,0),this.page.showLoading(),this.page.hideBottomLoading(),this.page.getGroupListData()},initialize:function(t){u(this.options,t),this.page=this.options.page,this.initCategory(),this.initPosition(),this.initSort(),this.initCustomFilter()}}),p.getInstance=function(t){return new p(t)},p});