/*jshint -W030*/
/**
 * 订单详情页
 * @url: m.ctrip.com/webapp/tuan/keywordsearch
 */
define(['TuanApp', 'libs', 'c', 'TuanBaseView', 'cWidgetFactory', 'cCommonPageFactory', 'cUtility', 'TuanModel', 'cDataSource', 'TuanStore', 'StoreManage', 'StringsData', 'FilterXss', 'text!KeywordSearchTpl', 'HttpErrorHelper', 'TabSlide'],
 function (TuanApp, libs, c, TuanBaseView, cWidgetFactory, CommonPageFactory, Util, TuanModel, CDataSource, TuanStore, StoreManage, StringsData, FilterXss, html, HttpErrorHelper) {
     var cui = c.ui,
        tuanSearchStore = TuanStore.GroupSearchStore.getInstance(),
        historyKeySearchtore = TuanStore.TuanHistoryKeySearchStore.getInstance(),
        positionfilterStore = TuanStore.GroupPositionFilterStore.getInstance(), //区域筛选条件
        customFiltersStore = TuanStore.GroupCustomFilters.getInstance(), //团购自定义筛选项
        categoryfilterStore = TuanStore.GroupCategoryFilterStore.getInstance(), //团购类型
        searchStore = TuanStore.GroupSearchStore.getInstance(),
        historyCityListStore = TuanStore.TuanHistoryCityListStore.getInstance(),
        TabSlide = cWidgetFactory.create('TabSlide'),
        View;
     var BasePage = CommonPageFactory.create("TuanBaseView");
     View = BasePage.extend({
         pageid: '214001',
         hpageid: '215001',
         tuankeyWordList: TuanModel.TuanKeyWordListModel.getInstance(),
         tuanHotKeywords: TuanModel.TuanHotKeywordsModel.getInstance(),
         dateSource: new CDataSource(),
         selectItem: null,
         isComplete: false, //是否完成
         isLoading: false,
         isScrolling: false,
         render: function () {
             this.$el.html($.trim(html));

             this.els = {
                 keywordSuggestBox: this.$el.find('#J_keywordSuggestWrap'),
                 keywordSuggestTpl: this.$el.find('#J_keywordSuggestTpl'),
                 keywordSuggestWrap: this.$el.find('#js_historykeysearch'),
                 hotKeywordsTpl: this.$el.find('#J_hotKeywordsTpl'),
                 hotKeywordsWrap: this.$el.find('#js_hotkeyword'),
                 keywordInput: this.$el.find('#J_keywordInput'),
                 keywordSearch: this.$el.find('#J_keywordSearch')
             };
             this.cityListTplfun = _.template(this.els.keywordSuggestTpl.html());
             this.hotKeywordsTplfun = _.template(this.els.hotKeywordsTpl.html());

             if (Util.isInApp() && TuanApp.isOverOS7()) {
                 this.els.keywordSearch.css('border-top', '20px solid #b3b3b3');
                 this.els.keywordSearch.css('padding-top', '10px');
                 this.els.keywordSuggestBox.css('padding-top', '20px');
             }
         },
         events: {
             'input #J_keywordInput': 'tuanKeyWordInput',
             'submit .search_wrap>form': 'onSubmitSearch',
             'click .J_resultItem': 'onKeywordItemClick',
             'click #J_cancel': 'onCancelInput',
             'click .J_clearhistory': 'onClearHistory',
             'click #js_hotkeyword .sw_con>li': 'goHotSearch'
         },
         onCancelInput: function () {
             StoreManage.clearSpecified(true);
             StoreManage.setCurrentKeyWord(false);
             this.back();
         },
         onClearHistory: function () {
             historyKeySearchtore.remove();
             this.createPage({});
             this.els.keywordInput.val('');
         },
         doSubmit: function () {
             var qparams = StoreManage.getGroupQueryParam();
             var self = this;
             tuanSearchStore.setAttr('qparams', qparams);
             //返回列表页
             setTimeout(_.bind(function () {
                 self.forwardJump("list", '/webapp/tuan/list');
             }, this), 100);
         },
         onKeywordItemClick: function (e) {
             StoreManage.clearSpecified(true);

             var cur = $(e.currentTarget),
                id = cur.attr('data-id'),
                name = cur.attr('data-name'),
                keytype = cur.attr('data-type');
             //历史搜索 处理start----------
             StoreManage.addHistoryKeyWord(id, name, keytype);
             //历史搜索 处理end-------------
             //团购6.1新增， 根据地标查询时， 产品列表按照距离最近排序
             (keytype === 'markland') && (searchStore.setAttr('sortRule', 8));
             this.doSubmit();
         },
         onSubmitSearch: function () {
             var keywordValue = FilterXss.filterXSS(this.els.keywordInput.val()), item;
             if (typeof keywordValue === "undefined" || keywordValue === "" || keywordValue === null) {return false;}
             this.els.keywordInput[0].blur();
             StoreManage.clearSpecified(true);
             //团购6.1 新增，关键字若完全匹配为地标，按距离最近排序
             item = this.els.keywordSuggestWrap.find('[data-name="'+keywordValue+'"]');
             if (item.length && item.attr('data-type') === 'markland') {
                 item[0].click();
             } else {
                 StoreManage.addHistoryKeyWord(keywordValue, keywordValue, 7);
                 this.doSubmit();
             }

             return false;
         },
         tuanKeyWordInput: function (e) {
             var cur = $(e.currentTarget),
                keyword = FilterXss.filterXSS(cur.val()),
                keywordSuggestWrap = this.els.keywordSuggestWrap,
                hotKeywordsWrap = this.els.hotKeywordsWrap,
                inputwait = cur.attr("inputwait") || 300;

             cur.attr("waitsend", new Date().getTime());
             if (keyword) {
                 setTimeout(_.bind(function (target, inputwait) {
                     if (target) {
                         var waitsend = target.attr("waitsend");
                         if (waitsend && (new Date().getTime() - parseInt(waitsend)) > (parseInt(inputwait) - 10)) {
                             keywordSuggestWrap.find('.J_historykeysearch').hide();
                             keywordSuggestWrap.find('.J_clearhistory').hide();
                             hotKeywordsWrap.hide();
                             this.doQueryData(FilterXss.filterXSS(target.val()));
                         }
                     }

                 }, this, cur, inputwait), inputwait);
             } else {
                 keywordSuggestWrap.find('.J_historykeysearch').show();
                 keywordSuggestWrap.find('.J_clearhistory').show();
                 keywordSuggestWrap.find('.city_list.searchresult>li[data-filter]').hide();
                 keywordSuggestWrap.find('.city_noresult').hide();
                 hotKeywordsWrap.show();
             }
         },
         buildEvent: function () {
             cui.InputClear(this.els.keywordInput);
             this.onBodyChange = $.proxy(function () {
                 this.els.keywordInput[0].blur();
             }, this);
         },
         doQueryData: function (keyword) {
             try {
                 if (typeof keyword == "undefined" || keyword === "" || keyword === null) {return;}
                 var searchData = tuanSearchStore.get();

                 this.lastinputkey = keyword;
                 this.$el.find('.s_city_loading').show();
                 this.getKeywordListData(keyword, searchData.ctyId, function () {
                     this.$el.find('.s_city_loading').hide();
                 });
             } catch (ex) { }
         },
         isVisible: function () {
             return this.$el.css('display').toLowerCase() != 'none';
         },
         getKeywordListData: function (keyword, ctyId, callback) {
             var self = this;

             self.tuankeyWordList.setParam('cityid', ctyId);
             self.tuankeyWordList.setParam('keyword', keyword);
             self.tuankeyWordList.excute(function (data) {
                 self.createPage(data);
                 callback.call(this);
             }, function (e) {
                 var msg = HttpErrorHelper.getMessage(e);

                 self.isVisible() && this.showToast(msg); // ('抱歉! 加载失败,请稍后再试!');
                 callback.call(this);
             }, false, this);

         },
         createPage: function (data) {
             try {
                 var keyId,
                    html,
                    hcitylist = StoreManage.getHistoryKeyWord();

                 if (hcitylist.length > 0) {
                     keyId = hcitylist[0].id;
                     (!data.history) && (data.history = []);
                     data.history = data.history.concat.apply(data.history, hcitylist);
                 }

                 //团购6.1新增关键字高亮
                 var inpuKey = this.lastinputkey;
                 if (data.Results && data.Results.length) {
                     _.each(data.Results, function(t) {
                         if (t.word) {
                             t.wordNew = t.word.replace(new RegExp(inpuKey.toLocaleLowerCase(), 'g'), '<em>' + inpuKey.toLocaleLowerCase() + '</em>')
                                .replace(new RegExp(inpuKey.toLocaleUpperCase(), 'g'), '<em>' + inpuKey.toLocaleUpperCase() + '</em>');
                         }
                         t.typeNew = StringsData.typeToName[t.type] || '';
                     });
                 }

                 html = this.cityListTplfun({ data: data, keyid: keyId });

                 this.els.keywordSuggestWrap.html(html);

                 if (data.Results) {
                     this.els.keywordSuggestWrap.find('.J_historykeysearch').hide();
                     this.els.keywordSuggestWrap.find('.J_clearhistory').hide();
                 }
             } catch (ex) { }
         },
         //首次记载view，创建view
         onCreate: function () {
             this.render();
             this.buildEvent();
         },
         //加载数据时
         onLoad: function (refer) {
             this._refer = refer;
             this.turning();
             //@since v2.6 在搜索框中保留搜索关键词
             this.els.keywordInput.val(StoreManage.getCurrentKeyWord() ? StoreManage.getCurrentKeyWord().word : '');
             this.els.keywordInput[0].focus();
             setTimeout(_.bind(function () {
                 this.els.keywordInput[0].focus();
             }, this), 1000);
             this.renderHotkeyword();
             this.createPage({});
             if (this.header && this.header.rootBox) {
                 /** 必须设置事件，否则会回退到全站首页 */
                 this.header.set({
                     title: '',
                     view: this,
                     tel: null,
                     events: {
                         returnHandler: function () {
                             this.back();
                         }
                     }
                 });
                 this.header.show();
                 /** 必须设置事件，否则会回退到全站首页 */
                 this.header.rootBox.hide();
             }
             this.hideLoading();
             this.$el.bind('focus', this.onBodyChange);
             this.$el.bind('touchstart', this.onBodyChange);
         },
         onShow: function () {
             this.header.hide();
             this.els.keywordInput && this.els.keywordInput[0].focus();
         },
         onHide: function () {
             this.header.show();
             this.hotkeywordsSlide && this.hotkeywordsSlide.destroy();
             this.tuankeyWordList.abort(); //停止请求
             this.$el.unbind('focus', this.onBodyChange);
             this.$el.unbind('touchstart', this.onBodyChange);
         },
         /*
         * 渲染 热门关键字
         */
         renderHotkeyword: function () {
             var self = this,
                 searchData = tuanSearchStore.get();
             this.tuanHotKeywords.setParam('cityid', searchData.ctyId);
             this.tuanHotKeywords.excute(_.bind(function (data) {
                 if (data && data.hotWords && data.hotWords.length > 0) {
                     self.hotkeywordsSlide = new TabSlide({
                         container: self.els.hotKeywordsWrap,
                         source: data.hotWords,
                         tpl: self.els.hotKeywordsTpl.html()
                     });
                 }
             }, this));
         },
         goHotSearch: function (e) {
             var cur = $(e.currentTarget);
             var data = decodeURIComponent(cur.attr('data-json'));
             data = JSON.parse(data);
             var searchData = searchStore.get(),
                 qparams;
             if (data) {
                 StoreManage.clearAll();
                 historyCityListStore.removeAttr('nearby');

                 //位置区域
                 if (data.pos) {
                     var type = data.pos.type,
                         val = data.pos.val,
                         lat = data.pos.lat,
                         lon = data.pos.lon,
                         name = data.pos.name;
                     positionfilterStore.set({
                         'type': type,
                         'val': val,
                         'name': name,
                         'pos': { type: 3, lat: lat, lon: lon, name: name }
                     });
                 }

                 if (data.price) {
                     if (StringsData.priceText[data.price]) {
                         customFiltersStore.setAttr('price', { val: data.price, txt: StringsData.priceText[data.price] });
                     }
                 }
                 if (data.trait) {
                     if (StringsData.traitText[data.trait]) {
                         customFiltersStore.setAttr('trait', { val: data.trait, txt: StringsData.traitText[data.trait] });
                     }
                 }
                 if (data.star) {
                     var stars = data.star.split(','), tmpstar = {};
                     for (var s in stars) {
                         s = stars[s];
                         (StringsData.starText[s]) && (tmpstar[s] = StringsData.starText[s]);
                     }
                     if (tmpstar) {
                         customFiltersStore.setAttr('star', tmpstar);
                     }
                 }
                 if (data.brand && data.brand.length > 0) {
                     for (var b in data.brand) {
                         b = data.brand[b];
                         b && b.val && b.key && customFiltersStore.setAttr('brand', { flag: 1, val: b.val, txt: b.key });
                     }
                 }
                 if (data.markland) {
                     StoreManage.setCurrentKeyWord({ id: data.markland.id, word: data.markland.name, type: 'markland' });
                 }
                 if (data.hotel) {
                     StoreManage.setCurrentKeyWord({ id: data.hotel.id, word: data.hotel.name, type: 'hotelid' });
                 }
                 if (data.keyword) {
                     StoreManage.setCurrentKeyWord({ word: data.word });
                 }
                 if (data.activity) {
                     StoreManage.setCurrentKeyWord({ id: data.activity.id, word: data.activity.name, type: 'activity' });
                 }
                 if (data.district) {
                     StoreManage.setCurrentKeyWord({ id: data.district.id, word: data.district.name, type: 'district' });
                 }
                 if (data.isweekend) {
                     searchStore.setAttr('weekendsAvailable', data.isweekend);
                 }
                 if (data.multishop) {
                     customFiltersStore.setAttr('multiShop', data.multishop);
                 }
                 if (data.voucher) {
                     customFiltersStore.setAttr('voucher', data.voucher);
                 }
                 if (data.sort) {
                     searchStore.setAttr('sortRule', data.sort.stype);
                     searchStore.setAttr('sortType', data.sort.sval);
                 }
                 if (data.classty) {
                     var tuanType, currType, subVal, subName;
                     if (data.classty.parent) {
                         tuanType = data.classty.parent.val;
                         currType = StringsData.groupType[tuanType];
                         subVal = data.classty.val;
                         //subName = data.classty.key;
                         subName = data.word;
                     } else {
                         tuanType = data.classty.val;
                         currType = StringsData.groupType[tuanType];
                     }
                     categoryfilterStore.setAttr('tuanType', tuanType);
                     if (currType) {
                         categoryfilterStore.setAttr('category', currType.category);
                         categoryfilterStore.setAttr('name', currType.name);
                         categoryfilterStore.setAttr('tuanTypeIndex', currType.index);
                     }
                     categoryfilterStore.setAttr('subVal', subVal);
                     categoryfilterStore.setAttr('subName', subName);
                     searchStore.setAttr('ctype', tuanType);
                 }

                 qparams = StoreManage.getGroupQueryParam();
                 searchStore.setAttr('qparams', qparams);
                 searchStore.setAttr('ctyId', searchData.ctyId);
                 searchStore.setAttr('ctyName', searchData.ctyName);
                 this.forwardJump('list', '/webapp/tuan/list');
             }
         }
     });
     return View;
 });

/*
changelog:  @date: 20141128   1. 团购6.1新增关键字高亮 2. 地标查询按距离最近展示；
 */
