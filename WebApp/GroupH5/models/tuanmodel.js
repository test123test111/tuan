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
        }
        return {
            //'domain': RESTAPI_DOMAIN.pro,
            'domain': domain,
            //'path': RESTAPI_PATH.pro
            'path': path
        };
    };

    var CREATE_ORDER_MSGS = {
        100: "操作成功",
        101: "节点数据验证不通过",
        102: "系统程序错误",
        201999: "产品不处于可售状态，不能生成订单",
        201000: "产品没有供应商,生成订单失败",
        201001: "产品已团完,生成订单失败",
        201002: "产品无分销商,生成订单失败",
        201003: "电话格式不符合规范（例：021-10106666-），未能生成订单",
        201004: "产品属0元团购，分销联盟不能生成订单",
        201005: "产品属马上订产品，分销联盟不能生成订单",
        201006: "超过此产品的最大购买数量，不能生成订单",
        201007: "小于此产品的最少购买数量，不能生成订单",
        201008: "本产品携程不开发票，不能生成订单",
        201009: "发票创建失败，不能生成订单",
        201010: "发票信息有误，不能生成订单",
        201012: "本产品每个手机号码仅限购买一次",
        201011: "产品属0元团购，一个手机号只能预订一次",
        301000: "订单取消成功",
        301001: "订单不属于用户或订单不存在",
        301002: "订单状态为非新订单",
        301003: "取消订单失败,订单状态修改失败",
        301004: "订单删除失败",
        301005: "订单删除成功",
        301006: "生成订单失败",
        301007: "订单状态修改失败",
        301008: "订单未查到支付记录",
        301009: "订单不存在",
        301010: "该订单已在处理中",
        401000: "券号或者订单不存在或已更新，券取消失败",
        401001: "更新订单失败，券取消失败",
        401002: "更新券号失败，券取消失败",
        401003: "券使用失败",
        401004: "现渠道和此张券应属于的渠道不同，不能取消券",
        401005: "券取消失败",
        401006: "此张券已使用，不能取消券",
        401007: "此张券已取消，不能再次取消券",
        401008: "此张券已作废，不能取消券",
        401009: "券号已有预约记录,不能使用",
        401010: "券状态:已过期超过两天,不可使用",
        401011: "订单类型错误(1为携程收款，2为对方收款)",
        501000: "联盟信息错误，无法取消券",
        501001: "更新联盟信息失败，未能生成订单",
        501002: "生成券号时发生异常，未能生成订单",
        601000: "信用卡发送扣款请求失败",
        601001: "存在重复流水号",
        601002: "保存信用卡信息错误",
        601003: "增加支付记录失败",
        601004: "调用支付接口失败"
    };

    //Version 在store里面也有定义，记得同步修改
    var T = {}, VERSION = 6.1;
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
            this.param = {ver: VERSION};
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
        },
        getErrorMessage: function(errors) {
            var code = errors && errors.ErrorCode;
            var msg = (errors && errors.Message) || '';
            return CREATE_ORDER_MSGS[code] || msg;
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
            this.param = { ver: VERSION, cityid: 0 };
            this.result = TuanStore.TuanHotKeywords.getInstance();
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    T.TuanHotWordsNewModel = new cBase.Class(AbstractModel, {
        __propertys__: function () {
            this.url = '/json/SearchWords';
            this.method = 'POST';
            this.param = { ver: VERSION, CityID: 0 };
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
});
