define(['cStore', 'cBase', 'cUtility'], function (AbstractStore, cBase, cUtility) {
    var T = {}, VERSION = 6.11;
    //当前团购详情（zhang_f）
    T.TuanDetailsStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'TUAN_DETAILS';
            this.lifeTime = '30M';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //房态信息
    T.TuanStatusStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'TUAN_STATUS';
            this.lifeTime = '30M';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //酒店分店信息
    T.TuanBranchOfficeStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'TUAN_BRANCH_OFFICE';
            this.lifeTime = '30M';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //酒店评论信息
    T.TuanHotelCommentListStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'TUAN_HOTEL_COMMENT';
            this.lifeTime = '1D';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    /**
    * 发票相关(l_wang)
    */
    T.TuanInvoiceStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'GROUP_INVOICE';
            this.lifetime = '30M';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    //我的团购订单列表(l_wang)
    T.TuanOrderListStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'TUAN_ORDER_LIST';
            this.lifeTime = '3M';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    //预定订单页的订单信息(l_wang)
    T.TuanOrderInfoStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'TUAN_ORDER_INFO';
            this.lifeTime = '30M';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    //酒店团购列表页(产品聚合)Storage （caof 2013-08-06）
    T.GroupListStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'TUAN_LIST'; //Storage名称
            this.lifeTime = '30M'; //缓存30分钟
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //酒店团购列表页(商户聚合)Storage （junyizhang 2014-08-04）
    T.GroupHotelListStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'TUAN_HOTEL_LIST'; //Storage名称
            this.lifeTime = '30M'; //缓存30分钟
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //全城热卖Storage
    T.GroupHotListStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'TUAN_HOT_LIST'; //Storage名称
            this.lifeTime = '30M'; //缓存30分钟
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //酒店团购搜索Storage （caof 2013-08-07）
    T.GroupSearchStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'TUAN_SEARCH'; //Storage名称
            this.lifeTime = '1D'; //缓存1天
            this.defaultData = {
                pageIdx: '1', //页码
                ctyId: '2', //城市编号
                ctyName: '上海',
                bdate: cBase.Date.format(cUtility.getServerDate(), 'Y-m-d H:i:s'), //时间
                edate: cBase.Date.format(cUtility.getServerDate(), 'Y-m-d H:i:s'),
                flag: 0,
                productType: '0', //1: 马上团标识,0： 0元购
                qparams: [], //查询参数列表
                sortRule: '2', //排序规则 2标识默认排序
                sortType: '0', //排序方式 1标识降序
                ver: VERSION,
                ctype: 0 //团购类型，默认全部
            };
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //酒店团购位置筛选Storage （caof 2013-08-07）
    T.GroupPositionFilterStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'TUAN_POSITIONFILTER'; //Storage名称
            this.lifeTime = '1D'; //缓存1天
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    //酒店团购团购过滤条件获取(位操作) 1:品牌集团; 2:行政区; 4:商业区; 若为0则不返回数据Storage （caof 2013-08-07）
    T.GroupConditionStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'TUAN_CONDITIONFILTER'; //Storage名称
            this.lifeTime = '3D'; //缓存3天
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //我的团购订单详情(l_wang)
    T.TuanOrderDetailStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'TUAN_ORDER_DETAIL';
            this.lifeTime = '30M';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //用户订单参数Storage add by caof 2013-08-24
    T.GroupOrderParamStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'USER_GROUP_ORDERPARAM';
            this.lifeTime = '15M'; //缓存15分钟，离开团购订单详情页时清除
            this.isUserData = true;
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //用户从订单详情返回时，判断跳转至哪页 （add by caof）
    T.OrderDetailReturnPage = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'GROUP_RETURNPAGE';
            this.lifeTime = '15M';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //团购城市列表数据
    T.TuanCityListStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'TUAN_CITY_LIST';
            this.lifeTime = '15D';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //团购历史选择城市列表数据 （add by zhanghd 2014-02-17）
    T.TuanHistoryCityListStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'TUAN_HISTORYCITY_LIST';
            this.lifeTime = '15D';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    //酒店团购团购类型Storage (xuweichen 2014-2-14)
    T.GroupCategoryFilterStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'TUAN_CATEGORYFILTER'; //Storage名称
            this.lifeTime = '1D'; //缓存1天
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //酒店团购排序Storage (xuweichen 2014-2-14)
    T.GroupSortStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'TUAN_SORTFILTER'; //Storage名称
            this.lifeTime = '1D'; //缓存1天
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //团购历史关键词搜索列表数据 （add by zhanghd 2014-02-17）
    T.TuanHistoryKeySearchStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'TUAN_HISTORYKEYSEARCH_LIST';
            this.lifeTime = '15D';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //团购关键词列表数据（add by zhanghd 2014-02-19）
    T.TuanKeyWordListStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'TUAN_KEYWORD_LIST';
            this.lifeTime = '15D';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    T.TuanLocalCityInfoStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'TUAN_LOCAL_CITY_INFO';
            this.lifeTime = '30M'; //缓存30分钟
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    T.GroupGeolocation = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'TUAN_GEOLOCATION'; //Storage名称
            this.lifeTime = '60M'; //缓存60分钟
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //筛选页里的所有筛选条件值 (added by xuweichen 2014-3-14)
    //以后把所有的筛选条件放到一个store方便统一管理
    T.GroupCustomFilters = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'TUAN_CUSTOM_FILTERS'; //Storage名称
            this.lifeTime = '15D'; //缓存1天    
        },
        initialize: function ($super, options) {
            $super(options);    
        }
    });
    T.TuanInvoiceTitleStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = "TuanGou_InvoiceTitle";
            this.lifeTime = '1D';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    }); 
     //图片团购图片列表
    T.TuanImagesListStore = new cBase.Class(AbstractStore, {
        __propertys__: function(){
           this.key = "TUAN_IMAGES_LIST";
           this.lifeTime = '15D';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    T.TuanPOIListStore = new cBase.Class(AbstractStore, {
        __propertys__: function(){
            this.key = "TUAN_POI_LIST";
            this.lifeTime = '15D';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //周边团购请求
    T.TuanNearListStore = new cBase.Class(AbstractStore, {
        __propertys__: function(){
            this.key = "TUAN_NEAR_LIST";
            this.lifeTime = '15D';
        }
    });
    //攻略目的地ID查询
    T.TuanStrategyIDStore = new cBase.Class(AbstractStore, {
        __propertys__: function(){
            this.key = "TUAN_STRATEGY_ID";
            this.lifeTime = '15D';
        }
    });
    //存储优惠券列表
    T.TuanCouponListStore = new cBase.Class(AbstractStore, {
        __propertys__: function(){
            this.key = 'TUAN_COUPON_LIST';
            this.lifeTime = '1D';
        }
    });
    //存储选择的优惠券
    T.TuanSelectedCouponStore = new cBase.Class(AbstractStore, {
        __propertys__: function(){
            this.key = 'TUAN_SELECTED_COUPON';
            this.lifeTime = '1D';
        }
    });
    //果粒橙中奖结果
    T.ColaPrizeStore = new cBase.Class(AbstractStore, {
        __propertys__: function(){
            this.key = 'TUAN_COLA_PRIZE';
            this.lifeTime = '1D';
        }
    });
    //热门搜索关键词结果
    T.TuanHotKeywords = new cBase.Class(AbstractStore, {
        __propertys__: function(){
            this.key = 'TUAN_HOT_KEYWORDS';
            this.lifeTime = '1D';
        }
    });
    //存储省市县信息
    T.TuanRegionInfoStore = new cBase.Class(AbstractStore, {
        __propertys__: function(){
            this.key = 'TUAN_REGION_INFO';
            this.lifeTime = '1D';
        }
    });
    /***********************************
    * @description: 存储定位信息
    * @author: hxren@ctrip.com
    */
    T.TuanPositionStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'TUAN_POSITION';
            this.lifeTime = '2M';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    
    /***********************************
    * @description: 本地团购
    * @author: ouxz@ctrip.com
    */
    T.BannerClassStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'TUAN_BANNER_CLASS';
            this.lifeTime = '1D';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    window.testStore = new cBase.Class(AbstractStore, {
        __propertys__: function(){
            this.key = 'TUAN_TEST';
            this.lifeTime = '1M';
        }
    });

    /**
     *  景点门票预订价格日历
     */
    T.TicketBookingStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'TUAN_TICKET_BOOKING';
            this.lifeTime = '1D';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    return T;
});
