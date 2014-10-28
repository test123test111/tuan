;(function () {
    function buildPath (relative) {
        return Lizard.WebresourcePDBaseUrl + relative;
    };

    require.config({
        paths: {
            //custom models
            TuanApp: buildPath("tuanapp"),
            TuanStore: buildPath("models/tuanstore"),
            TuanModel: buildPath("models/tuanmodel"),
            DropDown: buildPath("com/dropdown"),
            TuanFilters: buildPath("widget/tuanfilters"),
            SmoothSlide: buildPath("widget/slide"),
            TabSlide: buildPath("widget/tabslide"),
            Switch: buildPath("com/switch"),
            VoiceSearch: buildPath("widget/voicesearch"),
            StoreManage: buildPath("util/storemanage"),
            HttpErrorHelper: buildPath("util/httperrortpl"),
            NumberStep: buildPath("com/numberstep"),
            Payment: buildPath("widget/payment"),
            ScrollObserver: buildPath("util/scrollobserver"),
            MemCache: buildPath("util/memcache"),
            InvoiceStore: buildPath("thirdpart/invoicestore"),
            AMapWidget: buildPath("widget/amap"),
            POIWidget: buildPath("widget/poi"),
            LazyLoad: buildPath("com/lazyload"),
            FilterXss: buildPath("util/filterxss"),
            CityListData: buildPath("data/citylist"),
            StringsData: buildPath("data/strings"),
            Tab: buildPath("com/tab"),
            PageHistory: buildPath("com/history"),
            PageTreeConfig: buildPath("com/pagetreeconfig"),
            TuanBaseView:buildPath("com/baseview"),
            ValidatorUtil: buildPath("util/form/validator"),
            FieldUtil: buildPath("util/form/field"),

            //模版
            HomeTpl: buildPath("templates/home.html"),
            ListProductTpl: buildPath("templates/list.product.html"),
            ListBusinessTpl: buildPath("templates/list.business.html"),
            BookingTpl: buildPath("templates/booking.html"),
            BookingSuccessTpl: buildPath("templates/booking.success.html"),
            CityListTpl: buildPath("templates/citylist.html"),
            CouponTpl: buildPath("templates/coupon.html"),
            DetailTpl: buildPath("templates/detail.html"),
            DetailTipsTpl: buildPath("templates/detail.tips.html"),
            HotelCommentsTpl: buildPath("templates/hotel.comments.html"),
            HotelImagesTpl: buildPath("templates/hotel.images.html"),
            HotelImageSlideTpl: buildPath("templates/hotel.imageslide.html"),
            HotelMapTpl: buildPath("templates/hotel.map.html"),
            HotelServiceTpl: buildPath("templates/hotel.service.html"),
            HotelSubbranchTpl: buildPath("templates/hotel.subbranch.html"),
            LashouTpl: buildPath("templates/lashou.html"),
            InvoiceTpl: buildPath("templates/invoice.html"),
            KeywordSearchTpl: buildPath("templates/keywordsearch.html"),
            NearListTpl: buildPath("templates/near.list.html"),
            RefundTpl: buildPath("templates/refund.html"),
            RefundTipTpl: buildPath("templates/refund.tip.html"),
            TuanOrderDetailTpl: buildPath("templates/tuanorderdetail.html"),
            OrderDetailItemTpl: buildPath("templates/order.detail.item.html"),
            RecommendTpl: buildPath("templates/recommend.html")
        }
    });
})();
