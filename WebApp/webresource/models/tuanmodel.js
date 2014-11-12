define(['cModel', 'cBase', 'TuanStore', 'cUtility'], function (AbstractModel, cBase, TuanStore, Util) {
    /**
     * restapi环境切换自动切换
     */
    AbstractModel.baseurl = function (protocol) {
        var RESTAPI_PATH = {
                test: 'soa2/10101',
                uat: 'restapi/soa2/10101',
                pro: 'restapi/soa2/10101'
            },
            RESTAPI_DOMAIN = {
                test: 'm.fat.ctripqa.com',
                uat: 'm.uat.ctripqa.com',
                pro: 'm.ctrip.com'
            },
            host = location.host,
            domain = RESTAPI_DOMAIN.test,
            path = RESTAPI_PATH.test;

        if (Util.isInApp()) {
            if (Util.isPreProduction() == '1') {   // 定义堡垒环境
                if (protocol == "https") {
                    domain = 'restful.m.ctrip.com';
                } else {
                    domain = RESTAPI_DOMAIN.pro;
                }
                path = RESTAPI_PATH.pro;
            } else if (Util.isPreProduction() == '0') {   // 定义测试环境
                if (protocol == "https") {
                    domain = 'restful.waptest.ctrip.com';
                } else {
                    domain = RESTAPI_DOMAIN.test;
                }
                path = RESTAPI_PATH.test;
            } else if (Util.isPreProduction() == '2') { //uat环境
                domain = RESTAPI_DOMAIN.uat;
                path = RESTAPI_PATH.uat;
            } else {
                if (protocol == "https") {
                    domain = 'restful.m.ctrip.com';
                } else {
                    domain = RESTAPI_DOMAIN.pro;
                }
                path = RESTAPI_PATH.pro;
            }
        } else if (host.match(/^(m|3g|wap)\.ctrip\.com/i)) {
            domain = RESTAPI_DOMAIN.pro;
            path = RESTAPI_PATH.pro;
        } else if (host.match(/^(localhost|172\.16|127\.0)/i) && (location.protocol == "https" || protocol == "https")) {
            domain = 'restful.waptest.ctrip.com';
            path = RESTAPI_PATH.test;
        } else if (host.match(/^(localhost|172\.16|127\.0)/i)) {
            if (protocol == "https") {
                domain = 'restful.waptest.ctrip.com';
                path = RESTAPI_PATH.test;
            } else {
                domain = RESTAPI_DOMAIN.test;
                path = RESTAPI_PATH.test;
            }
        } else if (host.match(/^10\.8\.2\.111/i)) {
            domain = RESTAPI_DOMAIN.pro;
            path = RESTAPI_PATH.pro;
        } else if (host.match(/^waptest\.ctrip|^210\.13\.100\.191/i) && (location.protocol == "https" || protocol == "https")) {
            domain = 'restful.waptest.ctrip.com';
            path = RESTAPI_PATH.test;
        } else if (host.match(/^waptest\.ctrip|^210\.13\.100\.191/i)) {
            domain = 'waptest.ctrip.com';
            path = RESTAPI_PATH.test;
        } else if (host.match(/^m\.uat/i)) {
            domain = RESTAPI_DOMAIN.uat;
            path = RESTAPI_PATH.uat;
        } else {
            domain = RESTAPI_DOMAIN.test;
            path = RESTAPI_PATH.test;
        };
        return {
            //'domain': RESTAPI_DOMAIN.pro,
            'domain': domain,
            //'path': RESTAPI_PATH.pro
            'path': path
        }
    };

    var T = {}, VERSION = 6.0;
    //团购详情Model (zhang_f)
    T.TuanDetailModel = new cBase.Class(AbstractModel, {
        __propertys__: function () {
            this.url = '/json/DetailSearch';
            this.method = 'POST';
            this.param = { ext: "", flag: 0, id: 33483, ver: VERSION };
            this.result = TuanStore.TuanDetailsStore.getInstance();
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //房态信息Model (zhang_f)
    T.TuanStatusModel = new cBase.Class(AbstractModel, {
        __propertys__: function () {
            this.url = '/json/RoomStatusSearch';
            this.method = 'POST';
            this.param = { bdate: "", edate: "", pid: 0, ext: "", flag: 0, ver: VERSION };
            this.result = TuanStore.TuanStatusStore.getInstance();
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //酒店分店信息Model (zhang_f)
    T.TuanBranchOfficeModel = new cBase.Class(AbstractModel, {
        __propertys__: function () {
            this.url = '/json/BranchOffice';
            this.method = 'POST';
            this.param = { ext: "", flag: 0, id: 0, ver: VERSION };
            this.result = TuanStore.TuanBranchOfficeStore.getInstance();
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //酒店评论信息Model (zhang_f)
    T.TuanHotelCommentListModel = new cBase.Class(AbstractModel, {
        __propertys__: function () {
            this.url = '/json/CommentListSearch';
            this.method = 'POST';
            this.param = { ext: "", flag: 0, hotelId: 0, pageIdx: 1, ver: VERSION };
            this.result = TuanStore.TuanHotelCommentListStore.getInstance();
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //我的团购订单(l_wang)
    T.TuanOrderListModel = new cBase.Class(AbstractModel, {
        __propertys__: function () {
            this.url = '/OrderList/Query';
            this.method = 'POST';
            this.isUserData = true;
            this.param = {
                "ext": "",
                "flag": 0,
                "pageIdx": 1,
                "ver": VERSION
            };
            this.result = TuanStore.TuanOrderListStore.getInstance();
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    //我的团购订单详情(l_wang)
    T.TuanOrderDetailModel = new cBase.Class(AbstractModel, {
        __propertys__: function () {
            this.url = '/json/OrderDetailSearch';
            this.method = 'POST';
            this.usehead = true;
            this.param = {
                "ext": "",
                "flag": 0,
                "ver": VERSION
            };
            this.result = TuanStore.TuanOrderDetailStore.getInstance();
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    //发送团购券号
    T.TuanSendMsgModel = new cBase.Class(AbstractModel, {
        __propertys__: function () {
            this.url = '/json/MessageSend';
            this.method = 'POST';
            this.usehead = true;
            this.param = {
                "ext": "",
                "flag": 0,
                "ver": VERSION
            };
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    //酒店团购列表(产品聚合)Model（caofu 2013-08-06）
    T.TuanListModel = new cBase.Class(AbstractModel, {
        __propertys__: function () {
            this.url = '/json/ListSearch';
            this.method = 'POST';
            //this.param = TuanStore.GroupSearchStore.getInstance();
            this.result = TuanStore.GroupListStore.getInstance();
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //酒店团购列表(商户聚合)Model（junyizhang 2014-08-04）
    T.TuanHotelListModel = new cBase.Class(AbstractModel, {
        __propertys__: function () {
            this.url = '/json/HotelListSearch';
            this.method = 'POST';
            this.result = TuanStore.GroupHotelListStore.getInstance();
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //首页全城特卖
    T.TuanHotListModel = new cBase.Class(AbstractModel, {
        __propertys__: function () {
            this.url = '/json/HotCitySearch';
            this.method = 'POST';
            this.usehead = true;
            this.param = {
                "ext": "",
                "flag": 0,
                "ver": VERSION
            };
            this.result = TuanStore.GroupHotListStore.getInstance();
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //酒店团购团购过滤条件(位操作) 1:品牌集团; 2:行政区; 4:商业区; 若为0则不返回数据Model（caofu 2013-08-08）
    T.TuanConditionModel = new cBase.Class(AbstractModel, {
        __propertys__: function () {
            this.url = '/json/ConditionListSearch';
            this.method = 'POST';
            this.param = { ver: VERSION };
            this.result = TuanStore.GroupConditionStore.getInstance();
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //酒店团购列表Model（caofu 2013-08-06）
    T.TuanCityListModel = new cBase.Class(AbstractModel, {
        __propertys__: function () {
            this.url = '/json/CityListSearch';
            this.method = 'POST';
            this.param = { dataVer: 99, ver: VERSION };
            this.result = TuanStore.TuanCityListStore.getInstance();
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //酒店团购关键词列表Model（zhanghd 2014-02-19）
    T.TuanKeyWordListModel = new cBase.Class(AbstractModel, {
        __propertys__: function () {
            this.url = '/json/KeywordSearch';
            this.method = 'POST';
            this.param = {};
            this.result = TuanStore.TuanKeyWordListStore.getInstance();
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //根据经纬度获取城市信息Model (xuweichen 2014-02-21)
    T.TuanLocalCityInfo = new cBase.Class(AbstractModel, {
        __propertys__: function () {
            this.url = '/json/SearchCityIdByLat';
            this.param = {};
            this.method = 'POST';
            this.result = TuanStore.TuanLocalCityInfoStore.getInstance();
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //创建订单Model
    T.TuanCreateOrder = new cBase.Class(AbstractModel, {
        __propertys__: function () {
            this.url = '/json/CreateOrder';
            this.param = {ver: VERSION};
            this.method = 'POST';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //提交订单Model
    T.TuanSubmitOrder = new cBase.Class(AbstractModel, {
        __propertys__: function () {
            this.url = '/json/SubmitOrder';
            this.param = {};
            this.method = 'POST';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //支付扣款请求
    T.TuanApplyOrder = new cBase.Class(AbstractModel, {
        __propertys__: function () {
            this.url = '/json/PaymentApply';
            this.param = {};
            this.method = 'POST';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //支付扣款请求
    T.TuanRetryPayment = new cBase.Class(AbstractModel, {
        __propertys__: function () {
            this.usehead = true;
            this.url = '/json/ContinueToPay';
            this.param = {ver: VERSION};
            this.method = 'POST';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //广告信息请求
    T.BannerSearch = new cBase.Class(AbstractModel, {
        __propertys__: function () {
            this.usehead = true;
            this.url = '/json/bannersearch';
            this.param = {ver: VERSION};
            this.method = 'POST';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //申请退款请求
    T.TuanRefundlTicketModel = new cBase.Class(AbstractModel, {
        __propertys__: function () {
            this.usehead = true;
            this.url = '/json/cancelticket';
            this.param = {ver: VERSION};
            this.method = 'POST';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //取消订单
    T.TuanCancelOrderModel = new cBase.Class(AbstractModel, {
        __propertys__: function () {
            this.usehead = true;
            this.url = '/json/OrderCancel';
            this.param = {};
            this.method = 'POST';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //删除订单
    T.TuanDeleteOrderModel = new cBase.Class(AbstractModel, {
        __propertys__: function () {
            this.usehead = true;
            this.url = '/json/OrderDelete';
            this.param = {};
            this.method = 'POST';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //图片列表请求
    T.TuanImagesListModel = new cBase.Class(AbstractModel, {
        __propertys__: function(){
            this.url = '/json/ProductPictures';
            this.param = {};
            this.method = 'POST';
            this.result = TuanStore.TuanImagesListStore.getInstance();
        }
    });
    //POI列表请求
    T.TuanPOIListModel = new cBase.Class(AbstractModel, {
        __propertys__: function(){
            this.url = '/json/POISearch';
            this.param = {
                ver: VERSION
            };
            this.method = 'POST';
            this.result = TuanStore.TuanPOIListStore.getInstance();
        }
    });
    //周边团购请求
    T.TuanNearListModel = new cBase.Class(AbstractModel, {
        __propertys__: function(){
            this.url = '/json/NearGroup';
            this.param = {};
            this.method = 'POST';
            this.result = TuanStore.TuanNearListStore.getInstance();
        }
    });
    //攻略目的地ID查询
    T.TuanStrategyIDModel = new cBase.Class(AbstractModel, {
        __propertys__: function(){
            this.url = '/json/Destination';
            this.param = {};
            this.method = 'POST';
            this.result = TuanStore.TuanStrategyIDStore.getInstance();
        }
    });
    //验证优惠券
    T.TuanValidateCouponModel = new cBase.Class(AbstractModel, {
        __propertys__: function(){
            this.url = '/json/ValidateCoupon';
            this.param = {};
            this.method = 'POST';
        }
    });
    //获取优惠券列表
    T.TuanCouponListModel = new cBase.Class(AbstractModel, {
        __propertys__: function(){
            this.url = '/json/CouponList';
            this.param = {ver: VERSION};
            this.method = 'POST';
            this.result = TuanStore.TuanCouponListStore.getInstance();
        }
    });
    //果粒橙抽奖
    T.ColaDrawModel = new cBase.Class(AbstractModel, {
        __propertys__: function(){
            this.url = '/json/GetPrizeResultService';
            this.param = {};
            this.method = 'POST';
        }
    });
    //果粒橙绑定券
    T.ColaAddPrizeModel = new cBase.Class(AbstractModel, {
        __propertys__: function(){
            this.url = '/json/SetPrizeToUser';
            this.param = {};
            this.method = 'POST';
        }
    });

    T.TuanAddFavorite = new cBase.Class(AbstractModel, {
        __propertys__: function(){
            this.url = '/json/FavoriteAdd';
            this.param = {};
            this.method = 'POST';
        }
    });

    T.TuanDelFavorite = new cBase.Class(AbstractModel, {
        __propertys__: function(){
            this.url = '/json/FavoriteDelete';
            this.param = {};
            this.method = 'POST';
        }
    });

    //酒店热门搜索关键词Model (lin_m)
    T.TuanHotKeywordsModel = new cBase.Class(AbstractModel, {
        __propertys__: function () {
            this.url = '/json/SearchHotWord';
            this.method = 'POST';
            this.param = { cityid: 0 };
            this.result = TuanStore.TuanHotKeywords.getInstance();
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //获取省市县数据
    T.TuanRegionInfoModel = new cBase.Class(AbstractModel, {
        __propertys__: function () {
            this.url = '/json/ExpressCity';
            this.method = 'POST';
            this.param = {};
            this.result = TuanStore.TuanRegionInfoStore.getInstance();
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //交叉推荐
    T.CrossRecommendModel = new cBase.Class(AbstractModel, {
        __propertys__: function () {
            this.url = '/json/ProductRecommend';
            this.method = 'POST';
            this.param = {ver: VERSION};
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //当地特色
    T.BannerClassModel = new cBase.Class(AbstractModel, {
        __propertys__: function () {
            this.url = '/json/BannerClass';
            this.method = 'POST';
            this.param = {};
            this.result = TuanStore.BannerClassStore.getInstance();
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    /**
     * 景点门票预订价格日历
     */
    T.TicketBookingModel = new cBase.Class(AbstractModel, {
        __propertys__: function () {
            this.url = '/json/TicketBooking';
            this.method = 'POST';
            this.param = {};
            this.result = TuanStore.TicketBookingStore.getInstance();
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    return T;
})
