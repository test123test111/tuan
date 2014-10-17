/**
 * @author: xuweichen
 * @date: 2014-2-13
 */
define(['cBase', 'cWidgetFactory', 'cUIMask', 'cUIScroll', 'DropDown', 'Tab', 'TuanModel', 'TuanStore', 'StoreManage'], function (Base, WidgetFactory, Mask, Scroll, DropDown, Tab, TModel, TStore, StoreManage) {
    'use strict';
    var Filters,
        mix = $.extend,
        MSG = {
            weizhiquyu: '位置区域'
        },
        SEARCH_DISTANCE = 4, //附近团购查询的距离
        SEARCH_DISTANCE_TEXT = SEARCH_DISTANCE + '公里内',
        categoryfilterStore = TStore.GroupCategoryFilterStore.getInstance(), //团购类型
        sortStore = TStore.GroupSortStore.getInstance(), //团购排序
        searchStore = TStore.GroupSearchStore.getInstance(),
        conditionModel = TModel.TuanConditionModel.getInstance(), //团购筛选Model
        conditionStore = TStore.GroupConditionStore.getInstance(), //团购筛选数据
        customFiltersStore = TStore.GroupCustomFilters.getInstance(), //团购自定义筛选项
        historyCityListStore = TStore.TuanHistoryCityListStore.getInstance(), //历史选择城市
        positionfilterStore = TStore.GroupPositionFilterStore.getInstance(), //区域筛选条件
        RADIO_ITEM = ['price', 'day', 'trait', 'distance'], //单选查询条件
        GROUP_TYPE = {
            '0': { 'index': 0, 'name': '全部团购', 'category': 'all' },
            '1': { 'index': 1, 'name': '酒店', 'category': 'hotel' },
            '8': { 'index': 2, 'name': '美食', 'category': 'catering' },
            '7': { 'index': 3, 'name': '旅游度假', 'category': 'vacation' },
            '6': { 'index': 4, 'name': '门票', 'category': 'ticket' },
            '9': { 'index': 5, 'name': '娱乐', 'category': 'entertainment' },
            '106': { 'index': 6, 'name': '一元团购', 'category': 'onepaygroup' },
            '108': { 'index': 7, 'name': '当地特色', 'category': 'feature' }
        },
        checkboxTpl = _.template([
            '<%if(["all", "hotel", "catering"].indexOf(category)!=-1){%>',
                '<div class="pop_filter_chkitem" data-type="weekendsAvailable" data-text="周未可用">周未可用',
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
            '<li data-filter="brand" data-value=""><div class="pop_filter_back">返回</div></li>',
            '<%_.each(arr, function(a,i){%>',
            '<li data-filter="brand" data-flag="<%=a.flag%>" data-value="<%=a.val%>"<%if(a.val==val){%> class="choosed"<%}%> data-text="<%=a.text%>">',
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
                    '<%if(lstZone && lstZone.length){%><li class="J_positionTabLabel<%if(curr.type==5){%> choosed<%}%>">商业区</li><%}%>',
                    '<%if(lstLocation && lstLocation.length){%><li class="J_positionTabLabel<%if(curr.type==4){%> choosed<%}%>">行政区</li><%}%>',
                    '<%if(tuanType==1 && lstCollege && lstCollege.length){%><li class="J_positionTabLabel<%if(curr.type==-1){%> choosed<%}%>">大学周边</li><%}%>',
                '</ul>',
            '</div>',
            '<div class="pop_filter_righttab">',
            '<%if(lstZone && lstZone.length){%>',
                '<div class="J_positionTabPanel"<%if(curr.type!=5){%> style="height:285px;display:none"<%}%>>',
                    '<ul class="pop_filter_baselist" style="min-height:285px">',
                        '<li<%if(!curr.val||curr.type!=5){%> class="choosed"<%}%>><div class="txt01">不限</div></li>',
                    '<%_.each(lstZone, function(val){%>',
                        '<li data-type="5" data-value="<%=val.val%>" data-pos=\'<%=JSON.stringify(val.pos)%>\' data-text="<%=val.txt%>"<%if(curr.type==5&&curr.val==val.val){%> class="choosed"<%}%>><div class="txt01"><%=val.txt%></div><span class="txt02"><%=val.groupCount%></span></li>',
                    '<%})%>',
                    '</ul>',
                '</div>',
            '<%}%>',
            '<%if(lstLocation && lstLocation.length){%>',
                '<div class="J_positionTabPanel"<%if(curr.type!=4){%> style="height:285px;display:none"<%}%>>',
                    '<ul class="pop_filter_baselist" style="min-height:285px">',
                        '<li<%if(!curr.val||curr.type!=4){%> class="choosed"<%}%>><div class="txt01">不限</div></li>',
                    '<%_.each(lstLocation, function(val){%>',
                        '<li data-type="4" data-value="<%=val.val%>" data-text="<%=val.txt%>"<%if(curr.type==4&&curr.val==val.val){%> class="choosed"<%}%>><div class="txt01"><%=val.txt%></div><span class="txt02"><%=val.groupCount%></span></li>',
                    '<%})%>',
                    '</ul>',
                '</div>',
            '<%}%>',
            '<%if(tuanType==1 && lstCollege && lstCollege.length){%>',
                '<div class="J_positionTabPanel"<%if(curr.type!=-1){%> style="height:285px;display:none"<%}%>>',
                    '<ul class="pop_filter_baselist" style="min-height:285px">',
                        '<li<%if(!curr.pos||curr.type!=-1){%> class="choosed"<%}%>><div class="txt01">不限</div></li>',
                    '<%_.each(lstCollege, function(val){%>',
                        '<li data-type="-1" data-pos=\'<%=JSON.stringify(val.pos)%>\' data-text="<%=val.txt%>"<%if(curr.type==-1&&curr.pos.lat==val.lat&&curr.pos.lon==val.lon){%> class="choosed"<%}%>><div class="txt01"><%=val.txt%></div></li>',
                    '<%})%>',
                    '</ul>',
                '</div>',
            '<%}%>',
            '</div>'
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
                    searchStore.setAttr('sortType', sortType);
                    self.getListData();
                }
            });
            var item = this.sort.panel.find('[data-id="' + sortRule + '"][data-type="' + sortType + '"]');
            item = item && item[0] || $(this.sort.getItemByIndex(sortIndex))[0];
            this.sort.select(item, true);
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
                    if (self._categoryInited == undefined) {
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

            var categoryTab = new Tab({
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
                    var currType = GROUP_TYPE[tuanType];
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
                    self.options.categoryTrigger.html(subName || GROUP_TYPE[tuanType]['name']);
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
            categoryTrigger.html(categoryData.subName || GROUP_TYPE[ret.tuanTypeVal]['name']);

            if (conditionData && $.isArray(conditionData.categroy) && conditionData.categroy.length > 0) {
                var groupCondition = conditionData.categroy[0].groupCondition;
                if (groupCondition && $.isArray(groupCondition) && groupCondition.length > 0) {
                    ret.tuanType = $.grep(groupCondition, function (v, j) { return v.type == 16; });
                    ret.subTuanType = $.grep(groupCondition, function (v, j) { return v.type == 32; });
                    this.options.categoryPanel.html(tuanTypeTpl(ret));
                }
            }
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
                    if (self._positionInited == undefined) {
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
            var index = { '5': 0, '4': 1, '-1': 2 };

            var positionTab = new Tab({
                label: label,
                panel: panel,
                isScroll: true,
                labelSelectedClass: 'choosed',
                labelSelectedIndex: index[positionfilterStore.getAttr('type') || 5],
                itemClass: '.pop_filter_baselist li',
                itemSelectedClass: 'choosed',
                onSelect: function (item) {
                    var type = item.data('type');
                    var name = item.data('text');
                    var searchData = searchStore.get();
                    var currentKeyword = StoreManage.getCurrentKeyWord();

                    panel.find('.choosed').removeClass('choosed'); //清除已选
                    panel.find('li:first-child').addClass('choosed'); //选中不限
                    item.addClass('choosed').siblings().removeClass('choosed');

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
                        if ((type == '-1' || type == '5') && (currentKeyword.type == 'zone' || currentKeyword.type == 'markland')) {
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
                    if (name) {
                        switch (type) {
                            case 5: //商业区
                                positionfilterStore.set({
                                    'type': 5,
                                    'name': name,
                                    'val': item.data('value'),
                                    'pos': item.data('pos')
                                });
                                break;
                            case 4: //行政区
                                positionfilterStore.set({
                                    'type': 4,
                                    'name': name,
                                    'val': item.data('value')
                                });
                                break;
                            case -1: //大学周边
                                positionfilterStore.set({
                                    'type': -1,
                                    'name': name,
                                    'pos': item.data('pos')
                                });
                                customFiltersStore.setAttr('distance', {
                                    val: SEARCH_DISTANCE,
                                    txt: SEARCH_DISTANCE_TEXT
                                })
                                break;
                        }
                    } else {
                        positionfilterStore.remove();
                    }
                    self.options.positionTrigger.html(name || MSG.weizhiquyu);

                    if (type == -1) { //选择"大学周边"，默认4公里，故放出"距离"筛选条件
                        self.renderFilter(searchStore.getAttr('ctype'), true);
                        self.updateCustomFilterIcon();
                    }

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
            var ret = {};
            var positionPanel = this.options.positionPanel;
            var positionTrigger = this.options.positionTrigger;
            var conditionData = conditionStore.get();
            ret.curr = positionfilterStore.get() || {};
            positionTrigger.html(ret.curr.name || MSG.weizhiquyu);
            tuanType = tuanType || searchStore.getAttr('ctype');
            ret.tuanType = tuanType;

            if (conditionData && $.isArray(conditionData.categroy) && conditionData.categroy.length > 0) {
                var categroy = $.grep(conditionData.categroy, function (v, j) { return v.ctype == tuanType; });
                if (categroy && $.isArray(categroy) && categroy.length > 0) {
                    var groupCondition = conditionData.categroy[0].groupCondition;
                    if (groupCondition && $.isArray(groupCondition) && groupCondition.length > 0) {
                        ret.lstZone = $.grep(groupCondition, function (v, j) { return v.type == 4; });
                        ret.lstLocation = $.grep(groupCondition, function (v, j) { return v.type == 2; });
                        ret.lstCollege = $.grep(groupCondition, function (v, j) { return v.type == 8; });

                        if (ret.lstZone.length || ret.lstLocation.length || ret.lstCollege.length) {
                            positionTrigger.show();
                            positionPanel.html(positionTpl(ret));
                            callback && callback();
                        } else {
                            positionTrigger.hide();
                        }
                    }
                } else {
                    positionTrigger.hide();
                }
            }
        },
        resetPosition: function (tuanType) {
            var self = this;
            var type = 1; //品牌
            type |= 2; //行政区
            type |= 4; //商业区
            type |= 8; //大学周边
            //type |= 16; //团购类型(一级分类)
            //type |= 32; //团购类型(二级分类)
            type |= 64; //团购类型(一级分类)
            type |= 128; //团购类型(二级分类)

            this.options.positionTrigger.html(MSG.weizhiquyu);
            conditionModel.setParam({
                ctyId: searchStore.getAttr('ctyId'),
                categroy: tuanType,
                type: type
            });
            conditionModel.excute(function () {
                self.renderPosition(tuanType, function () {
                    //把_positionInited设为undefined，以便重新初始化positionTab
                    self._positionInited = undefined;
                });
            }, function (err) {
            }, false, this);
        },
        /**
        * 初始化筛选条件
        */
        initCustomFilter: function () {
            var self = this;
            var customFilter = self.options.customFilter;
            var viewWrap = this.page.$el;
            var panel = viewWrap.find('#J_filterPanel');
            var pricePanel = viewWrap.find('#J_pricePanel');
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
                    if (self._customFilterInited == undefined) {
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
                if (e.target.tagName == 'LABEL') return;
                var currentTarget = $(e.currentTarget);
                var type = currentTarget.data('type');
                var isChecked = currentTarget.find('input:checked').length;
                if (type == 'weekendsAvailable') {
                    searchStore.setAttr('weekendsAvailable', isChecked ? 1 : 0)
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
                if (currentTarget.hasClass('choosed')) return;
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
                        var val = val.toString();
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
                } else if (filter == 'brand') {
                    self.selectBrand(item, label);
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
                    var brand = customdata && customdata.brand;
                    if (brand && brand.flag == 1) {
                        wrap.find('li:first-child').removeClass('choosed');
                        wrap.find('li:nth-child(3)').removeClass('backwards').find('.txt03').text('');
                        wrap.find('li:nth-child(2)').addClass('backwards').find('.txt03').text(brand.txt);
                    } else if (brand && brand.flag == 2) {
                        wrap.find('li:first-child').removeClass('choosed');
                        wrap.find('li:nth-child(2)').removeClass('backwards').find('.txt03').text('');
                        wrap.find('li:nth-child(3)').addClass('backwards').find('.txt03').text(brand.txt);
                    } else {
                        wrap.find('li:first-child').addClass('choosed');
                        wrap.find('li').removeClass('backwards').find('.txt03').text('');
                        wrap.find('#J_brand').show();
                        wrap.find('#J_subBrand').hide();
                    }
                    break;
                case 'trait':
                    wrap.find('.choosed').removeClass('choosed');
                    if (customdata && customdata.trait) {
                        wrap.find('li[data-value="' + customdata.trait.val + '"]').addClass('choosed');
                    } else {
                        wrap.find('li[data-value=""]').addClass('choosed');
                    }
                    break;
                case 'distance':
                    if (!wrap.data('scrolled')) {
                        new Scroll({
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
        selectBrand: function (item, label) {
            var viewWrap = this.page.$el;
            var brand = viewWrap.find('#J_brand');
            var subBrand = viewWrap.find('#J_subBrand');
            var flag = item.data('flag');
            var value = item.data('value');
            var txt = item.text();

            if (item.hasClass('arr_r')) {//一级
                var wrapper = brand.parent();
                brand.hide();
                wrapper.css({ 'overflow': 'hidden', 'max-height': '295px' });
                subBrand.html(brandTpl(this.renderSubBrand(flag)));
                subBrand.show();

                new Scroll({
                    wrapper: wrapper,
                    scroller: subBrand
                });
            } else if (value != undefined) {//二级
                subBrand.hide();
                brand.show();
                if (value != '') {
                    item.addClass('choosed').siblings('.choosed').removeClass('choosed');
                    if (flag == 1) {
                        brand.find('li:first-child').removeClass('choosed');
                        brand.find('li:nth-child(3)').removeClass('backwards').find('.txt03').text('');
                        brand.find('li:nth-child(2)').addClass('backwards').find('.txt03').text(txt);
                    } else if (flag == 2) {
                        brand.find('li:first-child').removeClass('choosed');
                        brand.find('li:nth-child(2)').removeClass('backwards').find('.txt03').text('');
                        brand.find('li:nth-child(3)').addClass('backwards').find('.txt03').text(txt);
                    }
                    customFiltersStore.setAttr('brand', { flag: flag, val: value, txt: txt });
                    label.find('li[data-tab="brand"]>i').show();
                }
            } else { //点击“不限”
                brand.find('li:first-child').addClass('choosed');
                brand.find('li').removeClass('backwards').find('.txt03').text('');
                customFiltersStore.removeAttr('brand');
                label.find('li[data-tab="brand"]>i').hide();
            }
        },
        /**
         * @param {Number} cate 团购分类
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
        * 渲染品牌
        * @param {String} flag 1:快捷连锁 2:其他品牌
        */
        renderSubBrand: function (flag) {
            var ret = { val: '', arr: [] };
            var conditionData = conditionStore.get();
            var brandData = customFiltersStore.getAttr('brand');
            if (brandData && brandData.val) {
                ret.val = brandData.val;
            }
            if (conditionData && $.isArray(conditionData.categroy) && conditionData.categroy.length > 0) {
                var groupCondition = conditionData.categroy[0].groupCondition;
                if (groupCondition && $.isArray(groupCondition) && groupCondition.length > 0) {
                    ret.arr = $.grep(groupCondition, function (v, j) { return (v.type == 1 && v.flag == flag); });
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
            if (clearBtn.hasClass('sta-disabled')) return;
            var label = viewWrap.find('#J_filterTabLabel');
            var panel = viewWrap.find('#J_filterTabPanel');
            searchStore.removeAttr('weekendsAvailable')
            customFiltersStore.removeAttr('multiShop');
            customFiltersStore.removeAttr('voucher');
            var arr = RADIO_ITEM.concat(['star', 'brand']);
            if (isSwitchTuanType && isNearBy) {//我的附近查询时，切换团购类型，不清除距离筛选条件
                arr.splice(arr.indexOf('distance'), 1);
            }

            _.each(arr, function (v, i) {
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
