/*jshint -W030*/
/**
 * @author: xuweichen
 * @date: 2014-2-13
 */
define(['cBase', 'cUtility', 'cWidgetFactory', 'cUIMask', 'cUIScroll', 'DropDown', 'Tab', 'StringsData', 'TuanModel', 'TuanStore', 'StoreManage'], function (Base, Util, WidgetFactory, Mask, Scroll, DropDown, Tab, StringsData, TModel, TStore, StoreManage) {
    'use strict';
    var Filters,
        mix = $.extend,
        MSG = {
            weizhiquyu: '位置区域'
        },
        isLoadingCondition = false,
        isYouth = Util.getAppSys() === 'youth', //是否青春版
        categoryfilterStore = TStore.GroupCategoryFilterStore.getInstance(), //团购类型
        sortStore = TStore.GroupSortStore.getInstance(), //团购排序
        searchStore = TStore.GroupSearchStore.getInstance(),
        conditionModel = TModel.TuanConditionModel.getInstance(), //团购筛选Model
        conditionStore = TStore.GroupConditionStore.getInstance(), //团购筛选数据
        customFiltersStore = TStore.GroupCustomFilters.getInstance(), //团购自定义筛选项
        historyCityListStore = TStore.TuanHistoryCityListStore.getInstance(), //历史选择城市
        positionfilterStore = TStore.GroupPositionFilterStore.getInstance(), //区域筛选条件
        RADIO_ITEM = ['price', 'day', 'trait', 'distance', 'brand'], //单选查询条件
        checkboxTpl = _.template([
            '<%if(["all", "hotel", "catering"].indexOf(category)!=-1){%>',
                '<div class="pop_filter_chkitem" data-type="weekendsAvailable" data-text="周末可用">周末可用',
                    '<div class="pop_filter_label">',
                        '<input type="checkbox" id="weekends"<%if(weekendsAvailable==1){%> checked<%}%> /><label for="weekends"></label>',
                    '</div>',
                '</div>',
            '<%}%>',
            '<%if(category=="hotel"){%>',
                '<div class="pop_filter_chkitem" data-type="multiShop" data-text="多店可用">多店可用',
                    '<div class="pop_filter_label">',
                        '<input type="checkbox" id="multiShop"<%if(multiShop==1){%> checked<%}%> /><label for="multiShop"></label>',
                    '</div>',
                '</div>',
                '<div class="pop_filter_chkitem" data-type="voucher" data-text="代金券">代金券',
                    '<div class="pop_filter_label">',
                        '<input type="checkbox" id="voucher"<%if(voucher==1){%> checked<%}%> /><label for="voucher"></label>',
                    '</div>',
                '</div>',
            '<%}%>'
        ].join('')),
        tabLabelTpl = _.template([
            '<ul class="pop_filter_tabs">',
                '<li data-tab="price"><i class="pop_filter_point"<%if(!customdata.price || (customdata.price && customdata.price.val == "1|1")){%> style="display:none"<%}%>></i>价格</li>',
                '<%if(category=="vacation"){%><li data-tab="day"><i class="pop_filter_point"<%if(!customdata.day){%> style="display:none"<%}%>></i>天数</li><%}%>',
                '<%if(category=="hotel"){%><li data-tab="star"><i class="pop_filter_point"<%if(!customdata.star){%> style="display:none"<%}%>></i>星级</li><%}%>',
                '<%if(category=="hotel"){%><li data-tab="brand"><i class="pop_filter_point"<%if(!customdata.brand){%> style="display:none"<%}%>></i>品牌</li><%}%>',
                '<%if(category=="hotel"){%><li data-tab="trait"><i class="pop_filter_point"<%if(!customdata.trait){%> style="display:none"<%}%>></i>特色</li><%}%>',
                '<%if((isNearBy && ["all", "hotel", "catering", "ticket", "entertainment"].indexOf(category)!=-1) || isUniversityNearBy){%><li data-tab="distance"><i class="pop_filter_point"<%if(!customdata.distance){%> style="display:none"<%}%>></i>距离</li><%}%>',
            '</ul>'
        ].join('')),
        brandTpl = _.template([
            '<li data-filter="brand"<%if(!val){%> class="choosed"<%}%>><div class="txt01">不限</div></li>',
            '<%_.each(arr, function(a,i){%>',
            '<li data-filter="brand" data-value="<%=a.val%>" data-text="<%=a.txt%>"<%if(a.val==val){%> class="choosed"<%}%>>',
                '<div class="txt01"><%=a.txt%></div>',
            '</li>',
            '<%})%>'
        ].join('')),
        traitTpl = _.template([
            '<li data-filter="trait"<%if(!val){%> class="choosed"<%}%>><div class="txt01">不限</div></li>',
            '<%_.each(arr, function(a,i){%>',
            '<li data-filter="trait" data-value="<%=a.val%>" data-text="<%=a.txt%>"<%if(a.val==val){%> class="choosed"<%}%>>',
                '<div class="txt01"><%=a.txt%></div>',
            '</li>',
            '<%})%>'
        ].join('')),
        tuanTypeTpl = _.template([
            '<div class="pop_filter_lefttab">',
                '<ul class="pop_filter_tabs">',
                '<%_.each(tuanType, function(v){%>',
                    '<li class="J_categoryTabLabel<%if(v.val==tuanTypeVal){%> choosed<%}%>"><%=v.txt%></li>',
                '<%})%>',
                '</ul>',
            '</div>',
            '<div class="pop_filter_righttab">',
                '<%_.each(tuanType, function(v){%>',
                    '<div class="J_categoryTabPanel" style="height:285px;<%if(v.val!=tuanTypeVal){%>display:none<%}%>">',
                        '<ul class="pop_filter_baselist" style="min-height:285px">',
                            '<li data-type="<%=v.val%>"<%if(v.val==tuanTypeVal && typeof subVal == "undefined"){%> class="choosed"<%}%>><div class="txt01"><%=v.val>0 ? "全部" : ""%><%=v.txt%></div><span class="txt02"><%=v.groupCount%></span></li>',
                            '<%_.each(subTuanType, function(s){%>',
                                '<%if (s.parentType == v.val){%>',
                            '<li data-type="<%=v.val%>" data-value="<%=s.val%>" data-name="<%=s.txt%>"<%if(typeof subVal !== "undefined" && s.val==subVal){%> class="choosed"<%}%>><div class="txt01"><%=s.txt%></div><span class="txt02"><%=s.groupCount%></span></li>',
                                '<%}%>',
                            '<%})%>',
                        '</ul>',
                    '</div>',
                '<%})%>',
            '</div>'
        ].join('')),
        positionTpl = _.template([
            '<div class="pop_filter_lefttab">',
                '<ul class="pop_filter_tabs">',
                    '<%if(Zone.length){%><li class="J_positionTabLabel<%if(curr.type==5){%> choosed<%}%>">商业区</li><%}%>',
                    '<%if(Location.length){%><li class="J_positionTabLabel<%if(curr.type==4){%> choosed<%}%>">行政区</li><%}%>',
                    '<%if(tuanType!=7 && AirportStation.length){%><li class="J_positionTabLabel<%if(curr.type==-4){%> choosed<%}%>">机场车站</li><%}%>',
                    '<%if(tuanType!=7 && SubwayLine.length){%><li class="J_positionTabLabel<%if(curr.type==-3){%> choosed<%}%>">地铁线</li><%}%>',
                    '<%if(tuanType!=7 && Attraction.length){%><li class="J_positionTabLabel<%if(curr.type==-2){%> choosed<%}%>">景点</li><%}%>',
                    '<%if(tuanType!=7 && College.length){%><li class="J_positionTabLabel<%if(curr.type==-1){%> choosed<%}%>">大学周边</li><%}%>',
                '</ul>',
            '</div>',
            '<div class="pop_filter_righttab">',
            '<%if(Zone.length){%>',
                '<div class="J_positionTabPanel"<%if(curr.type!=5){%> style="height:285px;display:none"<%}%>>',
                    '<ul class="pop_filter_baselist" style="min-height:285px">',
                        '<li<%if(!curr.val||curr.type!=5){%> class="choosed"<%}%>><div class="txt01">不限</div></li>',
                    '<%_.each(Zone, function(val){%>',
                        '<li data-type="5" data-value="<%=val.val%>" data-pos=\'<%=JSON.stringify(val.pos)%>\' data-text="<%=val.txt%>"<%if(curr.type==5&&curr.val==val.val){%> class="choosed"<%}%>><div class="txt01"><%=val.txt%></div><span class="txt02"><%=val.groupCount%></span></li>',
                    '<%})%>',
                    '</ul>',
                '</div>',
            '<%}%>',
            '<%if(Location.length){%>',
                '<div class="J_positionTabPanel"<%if(curr.type!=4){%> style="height:285px;display:none"<%}%>>',
                    '<ul class="pop_filter_baselist" style="min-height:285px">',
                        '<li<%if(!curr.val||curr.type!=4){%> class="choosed"<%}%>><div class="txt01">不限</div></li>',
                    '<%_.each(Location, function(val){%>',
                        '<li data-type="4" data-value="<%=val.val%>" data-text="<%=val.txt%>"<%if(curr.type==4&&curr.val==val.val){%> class="choosed"<%}%>><div class="txt01"><%=val.txt%></div><span class="txt02"><%=val.groupCount%></span></li>',
                    '<%})%>',
                    '</ul>',
                '</div>',
            '<%}%>',
            '<%if(tuanType!=7 && AirportStation.length){%>',
                '<div class="J_positionTabPanel"<%if(curr.type!=-4){%> style="height:285px;display:none"<%}%>>',
                    '<ul class="pop_filter_baselist" style="min-height:285px">',
                        '<li<%if(!curr.val||curr.type!=-4){%> class="choosed"<%}%>><div class="txt01">不限</div></li>',
                    '<%_.each(AirportStation, function(val){%>',
                        '<li data-type="-4" data-value="<%=val.val%>" data-pos=\'<%=JSON.stringify(val.pos)%>\' data-text="<%=val.txt%>"<%if(curr.type==-4&&curr.val==val.val){%> class="choosed"<%}%>><div class="txt01"><%=val.txt%></div></li>',
                    '<%})%>',
                    '</ul>',
                '</div>',
            '<%}%>',
            '<%if(tuanType!=7 && SubwayLine.length){%>',
                '<div class="J_positionTabPanel"<%if(curr.type!=19){%> style="height:285px;display:none"<%}%> id="J_subwayLine">',
                    '<ul class="pop_filter_baselist" style="min-height:285px">',
                        '<li<%if(!curr.line){%> class="backwards"<%}%>><div class="txt01">不限</div></li>',
                    '<%_.each(SubwayLine, function(val){%>',
                        '<li data-type="-5" data-value="<%=val.val%>" data-text="<%=val.txt%>" class="arr_r<%if(curr.line==val.val){%> backwards<%}%>"><div class="txt01"><%=val.txt%></div><span class="txt03"><%if(curr.line==val.val&&curr.type==-3){%><%=curr.name%><%}%></span></li>',
                    '<%})%>',
                    '</ul>',
                '</div>',
            '<%}%>',
            '<%if(tuanType!=7 && Attraction.length){%>',
                '<div class="J_positionTabPanel"<%if(curr.type!=-2){%> style="height:285px;display:none"<%}%>>',
                    '<ul class="pop_filter_baselist" style="min-height:285px">',
                        '<li<%if(!curr.val||curr.type!=-2){%> class="choosed"<%}%>><div class="txt01">不限</div></li>',
                    '<%_.each(Attraction, function(val){%>',
                        '<li data-type="-2" data-value="<%=val.val%>" data-pos=\'<%=JSON.stringify(val.pos)%>\' data-text="<%=val.txt%>"<%if(curr.type==-2&&curr.val==val.val){%> class="choosed"<%}%>><div class="txt01"><%=val.txt%></div></li>',
                    '<%})%>',
                    '</ul>',
                '</div>',
            '<%}%>',
            '<%if(tuanType!=7 && College.length){%>',
                '<div class="J_positionTabPanel"<%if(curr.type!=-1){%> style="height:285px;display:none"<%}%>>',
                    '<ul class="pop_filter_baselist" style="min-height:285px">',
                        '<li<%if(!curr.pos||curr.type!=-1){%> class="choosed"<%}%>><div class="txt01">不限</div></li>',
                    '<%_.each(College, function(val){%>',
                        '<li data-type="-1" data-pos=\'<%=JSON.stringify(val.pos)%>\' data-text="<%=val.txt%>"<%if(curr.type==-1&&curr.pos.lat==val.lat&&curr.pos.lon==val.lon){%> class="choosed"<%}%>><div class="txt01"><%=val.txt%></div></li>',
                    '<%})%>',
                    '</ul>',
                '</div>',
            '<%}%>',
                '<div class="J_positionTabPanel" style="height:285px;overflow:hidden;display:none" id="J_subwayStation">',
                    '<ul class="pop_filter_baselist" style="min-height:285px;"></ul>',
                '</div>',
            '</div>'
        ].join('')),
        subwayStationTpl = _.template([
            '<li data-type="-3"><div class="pop_filter_back">返回</div></li>',
            '<li data-type="19" data-line="<%=lineId%>"<%if(curr.val==lineId&&curr.type==19){%> class="choosed"<%}%> data-text="<%=lineName%>"><div class="txt01">全线</div></li>',
            '<%_.each(arr, function(a,i){%>',
            '<li data-type="-3" data-value="<%=a.val%>" data-line="<%=lineId%>" data-pos=\'<%=JSON.stringify(a.pos)%>\' data-text="<%=a.txt%>"<%if(curr.val==a.val){%> class="choosed"<%}%>>',
                '<div class="txt01"><%=a.txt%></div>',
            '</li>',
            '<%})%>'
        ].join(''));

    Filters = new Base.Class({
        __propertys__: function () {
            var self = this;
            this.options = {};
            this.page = null;
            this.mask = new Mask({
                onCreate: function () {
                    var scope = this;
                    this.root.on('click', function () {
                        self.options.categoryPanel.hide();
                        self.options.positionPanel.hide();
                        self.options.filterPanel.hide();
                        self._categoryStatus = false;
                        self._positionStatus = false;
                        self._customFilterStatus = false;
                        scope.hide();
                    });
                }
            });
        },
        /**
        * 初始化排序
        */
        initSort: function () {
            var self = this;
            var sortIndex = sortStore.getAttr('sortTypeIndex') || 0,
                sortRule = searchStore.getAttr('sortRule'),
                sortType = searchStore.getAttr('sortType');
            var options = self.options;

            this.sort = new DropDown({
                trigger: options.sortTrigger,
                panel: options.sortPanel,
                label: options.sortLabel,
                selectedIndex: sortIndex,
                selectedItemCls: 'choosed',
                onShow: function () {
                    options.categoryPanel.hide();
                    options.positionPanel.hide();
                    options.filterPanel.hide();
                    self.mask.hide();
                    self._categoryStatus = false;
                    self._positionStatus = false;
                    self._customFilterStatus = false;
                },
                onSelect: function (item) {
                    var target = $(item),
                        sortRule = target.attr('data-id'),
                        sortType = target.attr('data-type'),
                        index = +this.selectedIndex >= 0 ? this.selectedIndex : 0;

                    sortStore.setAttr('sortTypeIndex', index);
                    searchStore.setAttr('sortRule', sortRule);
                    //最受欢迎排序且App是青春版
                    if (sortRule == 2 && isYouth) {
                        sortType = 8;
                    }
                    searchStore.setAttr('sortType', sortType);
                    self.getListData();
                }
            });
            var item = this.sort.panel.find('[data-id="' + sortRule + '"][data-type="' + sortType + '"]');
            item = item && item[0] || $(this.sort.getItemByIndex(sortIndex))[0];
            this.sort.select(item, true);
            options.sortPanel.on('touchmove', function (e) {
                e.preventDefault();
            });
        },
        /**
        * 初始化团购分类
        */
        initCategory: function () {
            var self = this;
            var trigger = this.options.categoryTrigger;
            var panel = this.options.categoryPanel;

            this.renderCategory();

            trigger.on('click', function () {
                if (!self._categoryStatus) {
                    self.options.positionPanel.hide();
                    self.options.filterPanel.hide();
                    self._positionStatus = false;
                    self._customFilterStatus = false;
                    self.sort.hide();
                    panel.show();
                    self.mask.show();
                    panel.css({
                        '-webkit-transform': 'translate(0, 30px) translateZ(0)',
                        'opacity': 0
                    });
                    panel.animate({
                        '-webkit-transform': 'translate(0, -8px) translateZ(0)',
                        'opacity': 1
                    });
                    self._categoryStatus = true;
                    if (self._categoryInited === undefined) {
                        self.initCategoryTab();
                        self._categoryInited = true;
                    }
                } else {
                    panel.hide();
                    self.mask.hide();
                    self._categoryStatus = false;
                }
            });
            panel.on('touchmove', function (e) {
                e.preventDefault();
            });
        },
        initCategoryTab: function () {
            var self = this;
            var viewWrap = this.page.$el;
            var label = viewWrap.find('.J_categoryTabLabel');
            var panel = viewWrap.find('.J_categoryTabPanel');

            this.categoryTab = new Tab({
                label: label,
                panel: panel,
                isScroll: true,
                labelSelectedClass: 'choosed',
                labelSelectedIndex: categoryfilterStore.getAttr('tuanTypeIndex') || 0,
                itemClass: '.pop_filter_baselist li',
                itemSelectedClass: 'choosed',
                onSelect: function (item) {
                    var tuanType = item.data('type');
                    var subVal = item.data('value') || '';
                    var subName = item.data('name');
                    var currType = StringsData.groupType[tuanType];
                    panel.find('.choosed').removeClass('choosed');
                    item.addClass('choosed');

                    self.page.updateTitle(currType.name);
                    self.page.searchKeywordInput.val('');

                    if (tuanType == 7) { //“旅游度假”分类不按“附近团购”查询
                        historyCityListStore.removeAttr('nearby');
                    }

                    var distance = customFiltersStore.getAttr('distance');
                    //清除除团购类型和城市外的所有查询条件
                    StoreManage.clearSpecified(false);
                    if (distance && StoreManage.isNearBy()) { //我的附近查询时，恢复已清除距离筛选条件
                        customFiltersStore.setAttr('distance', distance);
                    }
                    //切换团购类型时，恢复默认的排序
                    self.clearCustomFilter(true);

                    categoryfilterStore.setAttr('tuanType', tuanType);
                    categoryfilterStore.setAttr('category', currType.category);
                    categoryfilterStore.setAttr('name', currType.name);
                    categoryfilterStore.setAttr('tuanTypeIndex', currType.index);
                    categoryfilterStore.setAttr('subVal', subVal);
                    categoryfilterStore.setAttr('subName', subName);

                    searchStore.setAttr('qparams', StoreManage.getGroupQueryParam());
                    searchStore.setAttr('ctype', tuanType);
                    self.options.categoryTrigger.html(subName || StringsData.groupType[tuanType].name);
                    self.resetPosition(tuanType);
                    self.getListData();

                    self.renderFilter(currType.category);
                    self.mask.hide();
                    self.options.categoryPanel.hide();
                    self._categoryStatus = false;
                }
            });
        },
        renderCategory: function () {
            var ret = {};
            var conditionData = conditionStore.get();
            var categoryData = categoryfilterStore.get() || {};
            var categoryTrigger = this.options.categoryTrigger;
            ret.tuanTypeVal = categoryData.tuanType || searchStore.getAttr('ctype') || 0;
            categoryData.subVal && (ret.subVal = categoryData.subVal);
            categoryTrigger.html(categoryData.subName || StringsData.groupType[ret.tuanTypeVal].name);

            if (conditionData && $.isArray(conditionData.categroy) && conditionData.categroy.length > 0) {
                var groupCondition = conditionData.categroy[0].groupCondition;
                if (groupCondition && $.isArray(groupCondition) && groupCondition.length > 0) {
                    ret.tuanType = $.grep(groupCondition, function (v) { return v.type == 16; });
                    ret.subTuanType = $.grep(groupCondition, function (v) { return v.type == 32; });
                    this.options.categoryPanel.html(tuanTypeTpl(ret));
                }
            }
        },
        updateCategoryName: function () {
            var tuanTypeIndex = categoryfilterStore.getAttr('tuanTypeIndex') || 0;
            var ctype = categoryfilterStore.getAttr('tuanType') || 0;
            if (this.categoryTab) {
                //团购分类Tab已初始化，直接切换分类
                this.categoryTab.switch(tuanTypeIndex);
            } else {
                //团购分类Tab未初始化，重现渲染分类
                this.renderCategory();
            }
            this.options.categoryTrigger.html(StringsData.groupType[ctype].name);
        },
        /**
        * 初始化位置区域
        */
        initPosition: function () {
            var self = this;
            var trigger = this.options.positionTrigger;
            var panel = this.options.positionPanel;

            this.renderPosition();

            trigger.on('click', function () {
                if (isLoadingCondition){ return; }//正在加载数据时，位置区域不能点 TODO(提示用户)
                if (!self._positionStatus) {
                    self.options.categoryPanel.hide();
                    self.options.filterPanel.hide();
                    self._categoryStatus = false;
                    self._customFilterStatus = false;
                    self.sort.hide();
                    panel.show();
                    self.mask.show();
                    panel.css({
                        '-webkit-transform': 'translate(0, 30px) translateZ(0)',
                        'opacity': 0
                    });
                    panel.animate({
                        '-webkit-transform': 'translate(0, -8px) translateZ(0)',
                        'opacity': 1
                    });
                    if (self._positionInited === undefined) {
                        self.initPositionTab();
                        self._positionInited = true;
                    }
                    self._positionStatus = true;
                } else {
                    panel.hide();
                    self.mask.hide();
                    self._positionStatus = false;
                }
            });
            panel.on('touchmove', function (e) {
                e.preventDefault();
            });
        },
        initPositionTab: function () {
            var self = this;
            var viewWrap = this.page.$el;
            var label = viewWrap.find('.J_positionTabLabel');
            var panel = viewWrap.find('.J_positionTabPanel');
            var subwayLineWrap = viewWrap.find('#J_subwayLine');
            var subwayStationWrap = viewWrap.find('#J_subwayStation');
            var index = {
                '5':  0,
                '4':  1,
                '-4': 2,
                '-3': 3,
                '19': 3,
                '-2': 4,
                '-1': 5
            };

            function resetPanel(item) {
                panel.find('.choosed').removeClass('choosed'); //清除已选
                panel.find('li:first-child').addClass('choosed'); //选中不限
                item.addClass('choosed').siblings().removeClass('choosed');
            }
            function resetSubwayLine() {
                subwayLineWrap.find('.backwards').removeClass('backwards');
                subwayLineWrap.find('.txt03').text('');//清理已选的地铁站
            }
            function resetAll(item) {
                resetPanel(item);
                resetSubwayLine();
            }

            this.positionTab = new Tab({
                label: label,
                panel: panel,
                isScroll: true,
                labelSelectedClass: 'choosed',
                labelSelectedIndex: index[positionfilterStore.getAttr('type')] || 0,
                itemClass: '.pop_filter_baselist li',
                itemSelectedClass: 'choosed',
                onSwitch: function () {
                    subwayStationWrap.hide();
                },
                onSelect: function (item) {
                    var line, currLine;
                    var type = item.data('type');
                    var name = item.data('text');
                    var searchData = searchStore.get();
                    var currentKeyword = StoreManage.getCurrentKeyWord();

                    if (StoreManage.isNearBy()) {
                        historyCityListStore.setAttr('nearby', false); //清除我附近的团 筛选条件
                        customFiltersStore.removeAttr('distance');
                        var distanceLabel = self.page.$el.find('#J_filterTabLabel li[data-tab="distance"]');
                        var distancePanel = self.page.$el.find('#J_filterTabPanel div[data-tab="distance"]');
                        distanceLabel.hide();
                        distancePanel.hide();
                        distanceLabel.find('i').hide();
                        self.updateCustomFilterIcon();
                        searchStore.removeAttr('pos');
                    }

                    if (currentKeyword) { //移除搜索关键词里重复的条件
                        //@since 20141124 移除老逻辑(currentKeyword.type == 'zone' || currentKeyword.type == 'markland')
                        if ((type < 0 || type == '5')) {
                            StoreManage.removeCurrentKeyWord();
                        }
                        if (type == '4' && currentKeyword.type == 'location') {
                            StoreManage.removeCurrentKeyWord();
                        }
                    }
                    if (searchData) {
                        //清除我附近的团 显示为城市名称
                        if (+searchData.ctyId > 0) {
                            var info = StoreManage.findCityInfoById(searchData.ctyId);
                            info && searchStore.setAttr('ctyName', info.name);
                        }
                        if (!searchData.edate) {
                            searchStore.setAttr('edate', searchData.bdate);
                        }
                    }
                    //4、5、19要传给接口，-1、-2、-3、-4页面自己用的
                    if (name) {
                        switch (type) {
                            case 5: //商业区
                                resetAll(item);
                                positionfilterStore.set({
                                    'type': 5,
                                    'name': name,
                                    'val': item.data('value'),
                                    'pos': item.data('pos')
                                });
                                break;
                            case 4: //行政区
                                resetAll(item);
                                positionfilterStore.set({
                                    'type': 4,
                                    'name': name,
                                    'val': item.data('value')
                                });
                                break;
                            case 19: //选择地铁全线
                                resetAll(item);
                                line = item.data('line');
                                currLine = subwayLineWrap.find('li[data-value="' + line + '"]');
                                positionfilterStore.set({
                                    'type': 19,
                                    'name': name,
                                    'line': line,
                                    'val': line
                                });
                                //返回到地铁线列
                                subwayStationWrap.hide();
                                subwayLineWrap.show();
                                subwayLineWrap.find('.txt03').text('');
                                subwayLineWrap.find('li:first-child').removeClass('choosed');
                                currLine.addClass('backwards').siblings().removeClass('backwards');
                                break;
                            case -5: //地铁线，进入地铁站列表
                                line = item.data('value');
                                if (line == subwayStationWrap.data('line')) {
                                    subwayLineWrap.hide();
                                    subwayStationWrap.show();
                                    return;
                                }
                                var data = self.getSubwayStation(line, name);
                                var scroller = subwayStationWrap.find('ul');
                                subwayLineWrap.hide();
                                subwayStationWrap.data('line', line).show();
                                scroller.html(subwayStationTpl(data));
                                var s = new Scroll({
                                    wrapper: subwayStationWrap,
                                    scroller: scroller
                                });
                                s.scrollTo(0, 0, 0);
                                return;//点击地铁线，展开地铁站列表即可，后面的代码无需执行
                            case -3: //地铁站
                            case -4: //机场车站
                            case -2: //景点
                            case -1: //大学周边
                                var obj = {'type': type, 'name': name, 'pos': item.data('pos')};
                                var val = item.data('value');
                                if (val) {
                                    obj.val = val;
                                }
                                if (type == -3) {//选择地铁站
                                    line = item.data('line');
                                    currLine = subwayLineWrap.find('li[data-value="' + line + '"]');
                                    obj.line = line;
                                    //返回到地铁线列
                                    subwayLineWrap.show();
                                    subwayStationWrap.hide();
                                    subwayLineWrap.find('li:first-child').removeClass('choosed');
                                    subwayLineWrap.find('.txt03').text('');
                                    currLine.addClass('backwards').siblings().removeClass('backwards');
                                    currLine.find('.txt03').text(name);//把地铁站回显到地铁线右侧
                                    item.addClass('choosed').siblings().removeClass('choosed');
                                } else {
                                    resetAll(item);
                                }
                                positionfilterStore.set(obj);
                                customFiltersStore.setAttr('distance', {
                                    val: 1,
                                    txt: '1公里内'
                                });
                                break;
                        }
                    } else if (type == -3) {//从地铁站返回到地铁线
                        subwayLineWrap.show();
                        subwayStationWrap.hide();
                        return;
                    } else {//点击"不限"
                        resetAll(item);
                        positionfilterStore.remove();
                        customFiltersStore.removeAttr('distance');
                    }

                    self.updatePositionName(name || MSG.weizhiquyu);

                    //地铁站、机场车站、景点、大学周边按经纬度查询， 默认1公里，故放出"距离"筛选条件
                    var ctype = searchStore.getAttr('ctype');
                    if (type < 0) {
                        self.renderFilter(StringsData.groupType[ctype].category, true);
                    } else {
                        customFiltersStore.removeAttr('distance');
                        self.renderFilter(StringsData.groupType[ctype].category, false);
                    }
                    self.updateCustomFilterIcon();

                    //设置查询条件
                    var qparams = StoreManage.getGroupQueryParam();
                    searchStore.setAttr('qparams', qparams);
                    positionfilterStore.setAttr('ctyId', searchData.ctyId);
                    self.getListData();

                    self.mask.hide();
                    self.options.positionPanel.hide();
                    self._positionStatus = false;
                }
            });
        },
        renderPosition: function (tuanType, callback) {
            var ret = {
                Zone: [],
                Location: [],
                College: [],
                AirportStation: [],
                SubwayLine: [],
                Attraction: []
            };
            var positionPanel = this.options.positionPanel;
            var positionTrigger = this.options.positionTrigger;
            var conditionData = conditionStore.get();
            ret.curr = positionfilterStore.get() || {};
            this.updatePositionName();
            tuanType = tuanType || searchStore.getAttr('ctype') || 0;
            ret.tuanType = tuanType;

            if (conditionData && $.isArray(conditionData.categroy) && conditionData.categroy.length > 0) {
                var categroy = $.grep(conditionData.categroy, function (v) { return v.ctype == tuanType; });
                if (categroy && $.isArray(categroy) && categroy.length > 0) {
                    var groupCondition = conditionData.categroy[0].groupCondition;
                    if (groupCondition && $.isArray(groupCondition) && groupCondition.length > 0) {
                        $.each(groupCondition, function(i, v) {
                            switch(v.type) {
                                case 2: ret.Location.push(v); break;
                                case 4: ret.Zone.push(v); break;
                                case 8: ret.College.push(v); break;
                                case 256:
                                case 512: ret.AirportStation.push(v); break;
                                case 1024: ret.SubwayLine.push(v); break;
                                case 4096: ret.Attraction.push(v); break;
                            }
                        });
                    }
                } else {
                    positionTrigger.hide();
                }

                if (+tuanType === 7) { //旅游度假分类不需要显示景点、机场车站、地铁
                    if (ret.Zone.length || ret.Location.length || ret.College.length) {
                        positionTrigger.show();
                        positionPanel.html(positionTpl(ret));
                        callback && callback();
                    } else {
                        positionTrigger.hide();
                    }
                } else {
                    if (ret.Zone.length || ret.Location.length || ret.College.length || ret.AirportStation.length || ret.SubwayLine.length || ret.Attraction.length) {
                        positionTrigger.show();
                        positionPanel.html(positionTpl(ret));
                        callback && callback();
                    } else {
                        positionTrigger.hide();
                    }
                }
            }
        },
        resetPosition: function (tuanType) {
            var self = this;
            var type = 1; //品牌 Brand
            type |= 2;    //行政区 Location
            type |= 4;    //商业区 Zone
            type |= 8;    //大学周边 School
            //type |= 16; //团购类型(一级分类) Category
            //type |= 32; //团购类型(二级分类) SubCategory
            type |= 64;   //团购类型(一级分类) NewCategory
            type |= 128;  //团购类型(二级分类) NewSubCategory
            type |= 256;  //火车站 RailwayStation
            type |= 512;  //飞机场 Airport
            type |= 1024; //地铁线路 SubwayLine
            type |= 2048; //地铁站点 SubwayStation
            type |= 4096; //景点 Attraction
            type |= 8192; //酒店特色 HotelFeature

            isLoadingCondition = true;
            this.options.positionTrigger.html(MSG.weizhiquyu);
            conditionModel.setParam({
                ctyId: searchStore.getAttr('ctyId'),
                categroy: tuanType,
                type: type
            });
            conditionModel.excute(function () {
                self.renderPosition(tuanType, function () {
                    isLoadingCondition = false;
                    //把_positionInited设为undefined，以便重新初始化positionTab
                    self._positionInited = undefined;
                });
            }, function () {
            }, false, this);
        },
        updatePositionName: function(name) {
            var positionTrigger = this.options.positionTrigger;
            if (!name) {
                var curr = positionfilterStore.get() || {};
                var text = curr.name;
                if (curr.type == -6) {//地图中心点不回显在位置区域
                    text = MSG.weizhiquyu;
                }
                positionTrigger.html(text || MSG.weizhiquyu);
            } else {
                positionTrigger.html(name);
            }
        },
        /**
        * 初始化筛选条件
        */
        initCustomFilter: function () {
            var self = this;
            var customFilter = self.options.customFilter;
            var viewWrap = this.page.$el;
            var panel = viewWrap.find('#J_filterPanel');
            // var pricePanel = viewWrap.find('#J_pricePanel');
            var checkboxWrap = viewWrap.find('#J_checkboxWrap');
            var cancelBtn = viewWrap.find('.pop_filter_cancel');
            var sureBtn = viewWrap.find('.pop_filter_sure');
            var clearBtn = viewWrap.find('.pop_filter_clear');

            this.renderFilter(categoryfilterStore.getAttr('category'));
            this.updateCustomFilterIcon();

            customFilter.on('click', function () {
                if (!self._customFilterStatus) {
                    self.sort.hide();
                    self.options.categoryPanel.hide();
                    self.options.positionPanel.hide();
                    self._categoryStatus = false;
                    self._positionStatus = false;
                    panel.show();
                    self.mask.show();
                    panel.css({
                        '-webkit-transform': 'translate(0, 30px) translateZ(0)',
                        'opacity': 0
                    });
                    panel.animate({
                        '-webkit-transform': 'translate(0, -8px) translateZ(0)',
                        'opacity': 1
                    });
                    if (self._customFilterInited === undefined) {
                        self.initFilterTab();
                        self._customFilterInited = true;
                    }
                    self._customFilterStatus = true;
                } else {
                    panel.hide();
                    self.mask.hide();
                    self._customFilterStatus = false;
                }
            });
            cancelBtn.on('click', function () {
                panel.hide();
                self.mask.hide();
                self._customFilterStatus = false;
            });
            sureBtn.on('click', function () {
                panel.hide();
                self.mask.hide();
                self.sureCustomFilter();
                self._customFilterStatus = false;
            });
            clearBtn.on('click', function () {
                self.clearCustomFilter();
                self._customFilterStatus = false;
            });
            checkboxWrap.on('click', 'div[data-type]', function (e) {
                if (e.target.tagName == 'LABEL') { return; }
                var currentTarget = $(e.currentTarget);
                var type = currentTarget.data('type');
                var isChecked = currentTarget.find('input:checked').length;
                if (type == 'weekendsAvailable') {
                    searchStore.setAttr('weekendsAvailable', isChecked ? 1 : 0);
                } else {
                    customFiltersStore.setAttr(type, isChecked ? 1 : 0);
                }
                clearBtn[self.customFilterSelectedCount() ? 'removeClass' : 'addClass']('sta-disabled');
            });
            panel.on('touchmove', function (e) {
                e.preventDefault();
            });
        },
        initFilterTab: function () {
            var self = this;
            var viewWrap = this.page.$el;
            var label = viewWrap.find('#J_filterTabLabel');
            var panel = viewWrap.find('#J_filterTabPanel');
            var stars = viewWrap.find('input[data-value]');
            var clearBtn = viewWrap.find('.pop_filter_clear');

            label.on('click', 'li', function (e) {
                var currentTarget = $(e.currentTarget);
                if (currentTarget.hasClass('choosed')) { return; }
                var tab = currentTarget.data('tab');
                label.find('.choosed').removeClass('choosed');
                currentTarget.addClass('choosed');
                panel.find('div[data-tab]').hide();
                self.renderTabWrap(tab, panel, true);
            });

            panel.on('click', '.pop_filter_baselist li', function (e) {
                var item = $(e.currentTarget);
                var val = item.data('value');
                var txt = item.data('text');
                var filter = item.data('filter');
                if (RADIO_ITEM.indexOf(filter) > -1) {//单选
                    item.addClass('choosed').siblings('.choosed').removeClass('choosed');
                    if (val) {
                        customFiltersStore.setAttr(filter, { val: val, txt: txt });
                    } else {
                        customFiltersStore.removeAttr(filter);
                    }
                    label.find('li[data-tab="' + filter + '"]>i')[val ? 'show' : 'hide']();
                } else if (filter == 'star') {//多选
                    if (!val) {//不限星级
                        stars.each(function (i, input) {
                            i > 0 && (input.checked = false);
                        });
                        customFiltersStore.removeAttr('star');
                        label.find('li[data-tab="star"]>i').hide();
                    } else {
                        val = val.toString();
                        var star = customFiltersStore.getAttr('star') || {};
                        if (item.parent().find('input:checked').length) {
                            stars[0].checked = false;
                        } else {
                            stars[0].checked = true;
                        }
                        if (item.find('input:checked').length) {
                            star[val] = txt;
                        } else {
                            delete star[val];
                        }
                        customFiltersStore.setAttr('star', star);
                        label.find('li[data-tab="star"]>i')[!$.isEmptyObject(star) ? 'show' : 'hide']();
                    }
                }
                clearBtn[self.customFilterSelectedCount() ? 'removeClass' : 'addClass']('sta-disabled');
            });
        },
        /**
        * param {String} tab
        * param {Zepto Dom} panel
        * param {Boolean} isShowPanel
        */
        renderTabWrap: function (tab, panel, isShowPanel) {
            var brandSroll, traitScroll, distanceSroll;
            var customdata = customFiltersStore.get();
            var wrap = panel.find('div[data-tab="' + tab + '"]');
            isShowPanel && wrap.show();
            switch (tab) {
                case 'price':
                    if (searchStore.getAttr('ctype') == 7) {//旅游出行时， 显示较大价格范围
                        wrap.find('li[data-ptype="0"]').hide();
                        wrap.find('li[data-ptype="1"]').show();
                    } else {
                        wrap.find('li[data-ptype="0"]').show();
                        wrap.find('li[data-ptype="1"]').hide();
                    }
                    wrap.find('.choosed').removeClass('choosed');
                    if (customdata && customdata.price) {
                        wrap.find('li[data-value="' + customdata.price.val + '"]').addClass('choosed');
                    } else {
                        wrap.find('li[data-value=""]').addClass('choosed');
                    }
                    break;
                case 'day':
                    wrap.find('.choosed').removeClass('choosed');
                    if (customdata && customdata.day) {
                        wrap.find('li[data-value="' + customdata.day.val + '"]').addClass('choosed');
                    } else {
                        wrap.find('li[data-value=""]').addClass('choosed');
                    }
                    break;
                case 'star':
                    if (customdata && customdata.star) {
                        var obj = customdata.star;
                        wrap.find('input:checked')[0].checked = false;
                        _.each(obj, function (v, i) {
                            wrap.find('input[data-value="' + i + '"]')[0].checked = true;
                        });
                    } else {
                        wrap.find('input[data-value]').each(function (i, input) {
                            input.checked = (i <= 0);
                        });
                    }
                    break;
                case 'brand':
                    var brandSroller = wrap.find('#J_brand');
                    if (brandSroller.length) {
                        var brandWrapper = brandSroller.parent();
                        brandWrapper.css({ 'overflow': 'hidden', 'max-height': '295px' });
                        brandSroller.html(brandTpl(this.getDataFromCondition('brand', 1)));
                        brandSroll = new Scroll({
                            wrapper: brandWrapper,
                            scroller: brandSroller
                        });
                    }
                    break;
                case 'trait':
                    var traitScroller = wrap.find('#J_trait');
                    if (traitScroller.length) {
                        var traitWrapper = traitScroller.parent();
                        traitWrapper.css({ 'overflow': 'hidden', 'max-height': '295px' });
                        traitScroller.html(traitTpl(this.getDataFromCondition('trait', 8192)));
                        traitScroll = new Scroll({
                            traitWrapper: traitWrapper,
                            scroller: traitScroller
                        });
                    }
                    break;
                case 'distance':
                    if (!wrap.data('scrolled')) {
                        distanceSroll = new Scroll({
                            wrapper: wrap,
                            scroller: wrap.find('ul')
                        });
                        wrap.data('scrolled', 'true');
                    }
                    wrap.find('.choosed').removeClass('choosed');
                    if (customdata && customdata.distance) {
                        wrap.find('li[data-value="' + customdata.distance.val + '"]').addClass('choosed');
                    } else {
                        wrap.find('li[data-value=""]').addClass('choosed');
                    }
                    break;
            }
        },
        /**
         * @param {String} cate 团购分类
         * @param {Boolean} isUniversityNearBy 是否大学周边
         */
        renderFilter: function (cate, isUniversityNearBy) {
            var viewWrap = this.page.$el;
            var customdata = customFiltersStore.get();
            var checkboxWrap = viewWrap.find('#J_checkboxWrap');
            var label = viewWrap.find('#J_filterTabLabel');
            var panel = viewWrap.find('#J_filterTabPanel');
            var data = {
                category: cate,
                weekendsAvailable: searchStore.getAttr('weekendsAvailable'),
                multiShop: customdata && customdata.multiShop,
                voucher: customdata && customdata.voucher
            };

            var html = checkboxTpl(data);
            if (html) {
                checkboxWrap.show().html(html);
            } else {
                checkboxWrap.hide();
            }
            label.html(tabLabelTpl({ category: cate || 'all', isNearBy: StoreManage.isNearBy(), customdata: customdata || {}, isUniversityNearBy: isUniversityNearBy }));

            panel.find('div[data-tab]').hide();
            this.renderTabWrap(label.find('li:first-child').addClass('choosed').data('tab'), panel, true);
        },
        /**
        * 从ConditionList取出特定类型的数据
        * @param {String} typeKey
        * @param {Number} typeVal
        */
        getDataFromCondition: function (typeKey, typeVal) {
            var ret = { val: '', arr: [] };
            var conditionData = conditionStore.get();
            var data = customFiltersStore.getAttr(typeKey);
            if (data && data.val) {
                ret.val = data.val;
            }
            if (conditionData && $.isArray(conditionData.categroy) && conditionData.categroy.length > 0) {
                var groupCondition = conditionData.categroy[0].groupCondition;
                if (groupCondition && $.isArray(groupCondition) && groupCondition.length > 0) {
                    ret.arr = $.grep(groupCondition, function (v) { return (v.type == typeVal); });
                }
            }
            return ret;
        },
        /**
        * 从ConditionList取出地铁站数据
        * @param {Number} lineId 地铁线ID
        * @param {String} lineName 地铁线
        */
        getSubwayStation: function (lineId, lineName) {
            var ret = {lineId: lineId, lineName: lineName, arr: []};
            var conditionData = conditionStore.get();
            ret.curr = positionfilterStore.get() || {};
            if (conditionData && $.isArray(conditionData.categroy) && conditionData.categroy.length > 0) {
                var groupCondition = conditionData.categroy[0].groupCondition;
                if (groupCondition && $.isArray(groupCondition) && groupCondition.length > 0) {
                    ret.arr = $.grep(groupCondition, function (v) { return (v.parentType == lineId); });
                }
            }
            return ret;
        },
        /**
        * 清空筛选条件
        * @param {Boolean} isSwitchTuanType 是否切换团购类型
        */
        clearCustomFilter: function (isSwitchTuanType) {
            var self = this;
            var isNearBy = StoreManage.isNearBy();
            var viewWrap = this.page.$el;
            var clearBtn = viewWrap.find('.pop_filter_clear');
            if (clearBtn.hasClass('sta-disabled')) { return; }
            var label = viewWrap.find('#J_filterTabLabel');
            var panel = viewWrap.find('#J_filterTabPanel');
            searchStore.removeAttr('weekendsAvailable');
            customFiltersStore.removeAttr('multiShop');
            customFiltersStore.removeAttr('voucher');
            var arr = RADIO_ITEM.concat(['star']);
            if (isSwitchTuanType && isNearBy) {//我的附近查询时，切换团购类型，不清除距离筛选条件
                arr.splice(arr.indexOf('distance'), 1);
            }

            _.each(arr, function (v) {
                customFiltersStore.removeAttr(v);
                self.renderTabWrap(v, panel, false);
            });
            label.find('.choosed').removeClass('choosed');
            label.find('li i').hide();
            panel.find('div[data-tab]').hide();
            this.renderTabWrap(label.find('li:first-child').addClass('choosed').data('tab'), panel, true);

            viewWrap.find('#J_checkboxWrap input:checked').each(function (i, input) { input.checked = false; });

            this.updateCustomFilterIcon();
        },
        sureCustomFilter: function () {
            var searchData = searchStore.get();
            var qparams = StoreManage.getGroupQueryParam();
            if (searchData) {
                if (!searchData.edate) {
                    searchStore.setAttr('edate', searchData.bdate);
                }
            }
            searchStore.setAttr('qparams', qparams);
            this.getListData();
            this.updateCustomFilterIcon();
        },
        /**
        * 统计选择的筛选条件的数量
        */
        customFilterSelectedCount: function () {
            var isHasNearByDistance = false, //是否有“我的附近”带进来的默认距离（4公里）
                filterParams = StoreManage.getGroupQueryParam(),
                weekendsAvailable = searchStore.getAttr('weekendsAvailable'),
                count = filterParams && filterParams.length > 0 && filterParams.filter(function (item) {
                    !isHasNearByDistance && (isHasNearByDistance = parseInt(item.type, 10) === 9);
                    //价格：1，星级：2，品牌：3，距离：9，多店可用、小时房、天数：14
                    var type = parseInt(item.type, 10);
                    if (type == 14 && item.value == categoryfilterStore.getAttr('subVal')) {
                        return false;
                    } else {
                        return [1, 2, 3, 9, 14].indexOf(type) !== -1;
                    }
                }).length;

            if (weekendsAvailable == 1) {
                count += 1;
            }
            //恢复默认后，去掉对“我的附近”的统计
            if (!customFiltersStore.getAttr('distance') && isHasNearByDistance) {
                count -= 1;
            }
            if (customFiltersStore.getAttr('price.val') == '1|1') {
                count -= 1;
            }
            return count > 0 ? count : 0;
        },
        /**
        * 更新筛选项按钮的icon
        */
        updateCustomFilterIcon: function () {
            var self = this;
            var viewWrap = this.page.$el;
            var customFilter = self.options.customFilter;
            var customSelected = self.customFilterSelectedCount();
            var clearBtn = viewWrap.find('.pop_filter_clear');

            customFilter.find('.fil_num').text(customSelected)[customSelected > 0 ? 'show' : 'hide']();
            clearBtn[customSelected > 0 ? 'removeClass' : 'addClass']('sta-disabled');
        },
        getListData: function () {
            searchStore.setAttr('pageIdx', '1');
            this.page.isLoading = true;
            window.scrollTo(0, 0);
            this.page.showLoading();
            this.page.hideBottomLoading();
            this.page.getGroupListData();
        },
        initialize: function (options) {
            mix(this.options, options);
            this.page = this.options.page;
            this.initCategory();
            this.initPosition();
            this.initSort();
            this.initCustomFilter();
        }
    });
    Filters.getInstance = function (options) {
        return new Filters(options);
    };
    return Filters;
});
