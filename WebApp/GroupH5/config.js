(function() {
    var baseUrl = Lizard.WebresourcePDBaseUrl;
    var isDebug = typeof location != 'undefined' && location.search.indexOf('debug=1') != -1;
    var config = {
        paths: {
            //custom models
            TuanApp: baseUrl +"tuanapp",
            TuanStore: baseUrl +"models/tuanstore",
            TuanModel: baseUrl +"models/tuanmodel",
            DropDown: baseUrl +"com/dropdown",
            TuanFilters: baseUrl +"widget/tuanfilters",
            SmoothSlide: baseUrl +"widget/slide",
            TabSlide: baseUrl +"widget/tabslide",
            Switch: baseUrl +"com/switch",
            VoiceSearch: baseUrl +"widget/voicesearch",
            StoreManage: baseUrl +"util/storemanage",
            HttpErrorHelper: baseUrl +"util/httperrortpl",
            NumberStep: baseUrl +"com/numberstep",
            Payment: baseUrl +"widget/payment",
            WechatShare: baseUrl +"widget/wechatshare",
            ScrollObserver: baseUrl +"util/scrollobserver",
            MemCache: baseUrl +"util/memcache",
            AMapWidget: baseUrl +"widget/amap",
            POIWidget: baseUrl +"widget/poi",
            LazyLoad: baseUrl +"com/lazyload",
            CallPhone: baseUrl +"com/callPhone",
            FilterXss: baseUrl +"util/filterxss",
            CityListData: baseUrl +"data/citylist",
            StringsData: baseUrl +"data/strings",
            Tab: baseUrl +"com/tab",
            PageHistory: baseUrl +"com/history",
            ConsoleDebug: baseUrl +"debug/console",
            PageTreeConfig: baseUrl +"com/pagetreeconfig",
            TuanBaseView:baseUrl +"com/baseview",
            ValidatorUtil: baseUrl +"util/form/validator",
            FieldUtil: baseUrl +"util/form/field",

            //模版
            HomeTpl: baseUrl +"templates/home.html",
            ListProductTpl: baseUrl +"templates/list.product.html",
            ListBusinessTpl: baseUrl +"templates/list.business.html",
            BookingTpl: baseUrl +"templates/booking.html",
            BookingSuccessTpl: baseUrl +"templates/booking.success.html",
            CityListTpl: baseUrl +"templates/citylist.html",
            CouponTpl: baseUrl +"templates/coupon.html",
            DetailTpl: baseUrl +"templates/detail.html",
            DetailTipsTpl: baseUrl +"templates/detail.tips.html",
            HotelCommentsTpl: baseUrl +"templates/hotel.comments.html",
            HotelImagesTpl: baseUrl +"templates/hotel.images.html",
            HotelImageSlideTpl: baseUrl +"templates/hotel.imageslide.html",
            HotelMapTpl: baseUrl +"templates/hotel.map.html",
            HotelServiceTpl: baseUrl +"templates/hotel.service.html",
            HotelSubbranchTpl: baseUrl +"templates/hotel.subbranch.html",
            LashouTpl: baseUrl +"templates/lashou.html",
            InvoiceTpl: baseUrl +"templates/invoice.html",
            KeywordSearchTpl: baseUrl +"templates/keywordsearch.html",
            NearListTpl: baseUrl +"templates/near.list.html",
            RefundTpl: baseUrl +"templates/refund.html",
            RefundTipTpl: baseUrl +"templates/refund.tip.html",
            TuanOrderDetailTpl: baseUrl +"templates/tuanorderdetail.html",
            OrderDetailItemTpl: baseUrl +"templates/order.detail.item.html",
            RecommendTpl: baseUrl +"templates/recommend.html",
            MapNavTpl: baseUrl +"templates/hotel.map.nav.html"
        }
    };

    if (isDebug) {
        config.urlArgs = Date.now();
    }

    require.config(config);
})();

