/*jshint -W030 */
/**
 * 详情页
 * @url m.ctrip.com/webapp/tuan/detail/{pid}.html
 */
define(['TuanApp', 'libs', 'c', 'MemCache', 'cUtility', 'cHybridFacade', 'cWidgetMember', 'cWidgetGuider', 'TuanStore', 'TuanBaseView', 'cCommonPageFactory', 'TuanModel', 'CommonStore', 'text!DetailTpl', 'text!DetailNearTpl', 'cWidgetFactory', 'CallPhone', 'WechatShare', 'Helper', 'SmoothSlide'],
function (TuanApp, libs, c, MemCache, Util, Facade, WidgetMember, WidgetGuider, TuanStore, TuanBaseView, CommonPageFactory, TuanModel, CommonStore, html, nearHtml, WidgetFactory, CallPhone, WechatShare) {
    var MSG = {
            pageTitle: '团购详情',
            delFavoriteSuccess: '已取消收藏',
            addFavoriteSuccess: '收藏成功',
            delFavoriteError: '取消收藏失败',
            addFavoriteError: '添加收藏失败'
        },
        ShareToSNSInfo = {
            content: '仅售<%=price%>元！<%=name%>，<%if(score>0){%>评价<%=score%>分，<%}%><%if(addr){%><%=addr%><%}%>'
        },
        View,
        UNFOLD_CLS = 'view_unfold',
        FOLD_CLS = 'view_fold',
        SUCCESS_STATUS = 'success',
        disabledCls = 'btm_tuan_btn_dis',
        isInApp = Util.isInApp(),
        tuanDetailModel = TuanModel.TuanDetailModel.getInstance(),
        tuanDetailStore = TuanStore.TuanDetailsStore.getInstance(),
        tuanAddFavorite = TuanModel.TuanAddFavorite.getInstance(),
        tuanDelFavorite = TuanModel.TuanDelFavorite.getInstance(),
        tuanNearListModel = TuanModel.TuanNearListModel.getInstance(),

        geolocationStore = TuanStore.GroupGeolocation.getInstance(), //经纬度信息
        userStore = CommonStore.UserStore.getInstance(), //用户信息
        orderInfo = TuanStore.TuanOrderInfoStore.getInstance(),
        invoiceStore = TuanStore.TuanInvoiceStore.getInstance(),
        Member = WidgetFactory.create('Member'),
        Guider = WidgetFactory.create('Guider'),
        getQuery = Lizard.P,
        Slide = WidgetFactory.create('SmoothSlide'),
        $body = $('body'),
        LINE_CONFIG = 5;

    /**
    * 获取yyyy-mm-dd格式时间
    * @param {Date} date
    * @returns {string}
    */
    function formatDate(date) {
        return date.toISOString().substring(0, 10).replace(/-/g, '');
    }
    var PageView = CommonPageFactory.create("TuanBaseView");
    View = PageView.extend({
        pageid: '214008',
        hpageid: '215008',
        hasAd: false,
        lineHeight: 21,
        backHome: function () {
            TuanApp.tHome();
        },
        events: {
            'click #J_return ': 'returnHandler',
            'click #J_submit': 'submit',
            'click #J_favBtn': 'favorite',
            'click #J_share': 'shareHandler',
            'click .J_relatedProducts': 'gotoRelatedProducts',
            'click .J_tips': 'showTips',
            'click .J_viewMoreBtn': 'ctrlInfoTip',
            'click .J_showNotePop': 'showNotePop',
            'click .J_notesPopBox': 'hideNotePop',
            'click .J_picItem': 'showImageSlide',
            'click #J_branch': 'showBranch', //分店
            'click .J_showDetailMap': 'showMap', //地图
            'click #J_comment': 'showComment', //点评
            'click #J_service': 'showService', //服务优势
            'click #J_morehotel': 'showMorehotel',
            'click #J_expandInvalid': 'toggleInvalidDateInfo',
            'click #J_recommendNearby': 'recommendNearby',
            'click #J_gotoHotelDetail': 'onHotelDetailClick',
            'click .J_nearProducts': 'gotoNearProduct',
            'click #J_groupContain': 'gotoGroupContent'
        },
        onCreate: function () {
            this.htmlfun = _.template(html);

            this.cityId = getQuery('cityid');
            this.productId = getQuery('pid') || getQuery('productID');
            this.externalReferURL = getQuery('url');
        },
        //数据加载阶段
        _onLoad: function () {
            //from中可能含有querystring，用getQuery获取不到完整的带querystring的URL
            var fromUrl = this.fromUrl = Util.getUrlParam(location.href, 'from');

            /**
             * 是否从微信分享跳转过来的链接，微信中为自动添加from=singlemessage，导致详情页back跳转404
             * 如果分享到朋友圈会有from=timeline,导致详情页back跳转404
             * @param {String} fromUrl
             * @returns {*|boolean}
             */
            var isFromWeChat = this.isFromWeChat = fromUrl && (/singlemessage|timeline/.test(fromUrl.toLowerCase()));

            //如果没有fromUrl或者来自微信
            if(!fromUrl || isFromWeChat){
                this.fromUrl = '';
            }

            this.removeOrderData();
            this.getTuanDetail();
        },
        recommendNearby: function(){
            var cityId = this.cityId;
            var category = this.$el.find('.J_nearTabs .cur').attr('data-category') || 1;
            this.forwardJump('nearlist','/webapp/tuan/nearlist?pid=' + this.productId + '&category='+ category + (cityId ? '&cityid=' + cityId : ''));
        },
        updateHeader: function(isfav) {
            if (!isInApp) {
                this.$el.find('#J_share').remove();
            } else {
                this.$head && this.$head.addClass('headerview_detail_app');
                this.$buyCon && this.$buyCon.addClass('tuan_buy_app');
            }
            this.$el.find('#J_favBtn').attr('class', isfav ? 'icon_fav i_bef' : 'icon_unfav i_bef');
        },
        /**
         * 收藏操作
         */
        favorite: function(){
            var self = this,
                favorInfo = self.favorInfo;

            if(self.checkLogin()){
                //如果已经收藏
                if(favorInfo && favorInfo.isFavor){
                    self._delFavorite();
                }else{
                    self._addFavorite();
                }
            }
        },
        /**
        * 获取分享配置
        * @returns {{imageUrl: string, text: string, title: string, linkUrl: string, isIOSSystemShare: boolean}}
        */
        prepareShareData: function (callback) {
            var self = this,
                data,
                shareInfo = ShareToSNSInfo,
                detailData = self.detailData,
                productUrl = 'http://m.ctrip.com/webapp/tuan/detail/' + self.productId+'.html?cityid='+self.cityId,
                hotelInfo = detailData.hotels[0] || detailData.recommendHotel.hotel || {name: detailData.name}, //如果多店酒店，则显示推荐酒店信息
                images = detailData.images,
                imgUrl = images && images.length && images[0].small,
                shareTitle = detailData.name || hotelInfo.name;

            data =  {
                imgUrl: imgUrl,
                text: _.template(shareInfo.content)({
                    price: detailData.price && detailData.price.dPrice || '',
                    name: shareTitle,
                    score: hotelInfo.score,
                    addr: hotelInfo && hotelInfo.addr || '',
                    link: productUrl
                }),
                title: hotelInfo.name,
                linkUrl: productUrl,
                isIOSSystemShare: false
            };
            if (isInApp) {
                //如果有图片链接则下载到本地再进行分享
                imgUrl && Guider.downloadData({
                    url: imgUrl,
                    callback: function(ret){
                        data.imgUrl = ret.savedPath;
                        callback && callback.call(self, data);
                    }
                });
            } else {
                callback && callback.call(self, data);
            }
        },
        /**
         * 获取分享配置
         * @returns {Object}
         */
        //由于APP bug暂不能用
        /*prepareShareData: function () {
            var self = this,
                data,
                shareInfo = ShareToSNSInfo,
                detailData = self.detailData,
                productUrl = 'http://m.ctrip.com/webapp/tuan/detail/' + self.productId + '.html?cityid=' + self.cityId,
                hotelInfo = detailData.hotels[0] || detailData.recommendHotel.hotel || {name: detailData.name}, //如果多店酒店，则显示推荐酒店信息
                images = detailData.images,
                imgUrl = images && images.length && images[0].small,
                shareTitle = detailData.name || hotelInfo.name;

            data = [{
                shareType: 'Default',//默认所有分享方式都取这条数据
                imageUrl: imgUrl,
                text: _.template(shareInfo.content)({
                    price: detailData.price && detailData.price.dPrice || '',
                    name: shareTitle,
                    score: hotelInfo.score,
                    addr: hotelInfo && hotelInfo.addr || '',
                    link: productUrl
                }),
                title: hotelInfo.name,
                linkUrl: productUrl
            }];
            return data;
        },*/
        /**
         * @since app v6.1 (app有问题暂没用)
         * @param dataList {Array} 分享的内容
         * @param businessCode {String} 分享的业务ID，可以为空，设置后，方便BI统计数据
         * @param callback {Function} (optional) 分享回调
         */
        /*shareToVendor: function (dataList, businessCode, callback) {
            HybridShell.Fn('call_custom_share', callback || NOOP).run(dataList, businessCode);
        },*/

        shareHandler: function() {
            this.prepareShareData(function(data){
                Guider.shareToVendor(data);
            });
        },
        /**
         * 更新收藏状态
         * @param {boolean} status 是否收藏
         * @param {int} favorId 收藏ID
         */
        updateFavorStatus: function(status, favorId){
            var self = this;

            this.updateHeader(status);
            self.favorInfo = {
                isFavor: !!status,
                favorId: favorId
            };
            tuanDetailStore.setAttr('favorInfo', self.favorInfo);
        },
        /**
         * 添加收藏
         * @private
         */
        _addFavorite: function(){
            var self = this;

            tuanAddFavorite.setParam({
                pid: self.productId, //产品ID
                type: self.productInfo.pcId //团购类型，字段名称和屎一样难认
            });

            tuanAddFavorite.excute(function(ret){
                if(ret && ret.ResponseStatus.Ack.toLowerCase() === SUCCESS_STATUS){
                    self.updateFavorStatus(true, ret.favorId);
                    self.showToast(MSG.addFavoriteSuccess);
                }
            }, function(){
                self.showToast(MSG.addFavoriteError);
            });
        },
        /**
         * 取消收藏
         * @private
         */
        _delFavorite: function(){
            var self = this;

            tuanDelFavorite.setParam({
                favorId: self.favorInfo.favorId
            });
            tuanDelFavorite.excute(function(ret){
                if(ret && ret.ResponseStatus.Ack.toLowerCase() === SUCCESS_STATUS){
                    self.updateFavorStatus(false);
                    self.showToast(MSG.delFavoriteSuccess);
                }
            }, function(){
                self.showToast(MSG.delFavoriteError);
            });
        },
        /**
         * 登录行为
         */
        checkLogin: function () {
            var self = this,
                port = location.port;
            //若未登录，则点击按钮就进行登录
            if (!userStore.isLogin()) {
                !isInApp && self.showLoading();
                Member.memberLogin({
                    domain: '//' + document.domain + (port && port == 80 ? '' : (':'+port)),
                    param: '?t=1&from=' + encodeURIComponent('/webapp/tuan/detail/' + self.productId + '.html' + (this.cityId ? '?cityid=' + this.cityId : '')),
                    callback: function () {
                        self._onLoad(self.referer);
                    }
                });
                return false;
            }
            return true;
        },
        onShow: function () {
            this.hideLoading();
            this.header && this.header.hide();
            //document.addEventListener('scroll', this.onScroll.bind(this));
            this.$el.on('touchmove', this.onScroll.bind(this));
            this._onLoad();
        },
        onHide: function () {
            this.hideLoading();
            this.hideWarning404();
            this.mask && this.mask.hide();
            this.CallPhone && this.CallPhone.hideMask();
            this.$el.off('touchmove', this.onScroll.bind(this));
            if (!TuanApp.isInApp && this.header && this.header.rootBox) {this.header.rootBox.show();}
        },
        /**
         * 判断是否从hybrid的公共收藏列表页过来
         * @returns {*|boolean}
         */
        isFromHybridFavorPage: function(){
            return isInApp && getQuery('from_native_page')==1;
        },
        isFromHotel: function(url){
            return url.indexOf('/hotel/')>-1;         
        },
        returnHandler: function() {
            this.$el.html('');
            this.backAction();
        },
        backAction: function () {
            if(this.isFromHybridFavorPage()){
                Guider.backToLastPage({'param': JSON.stringify({"biz":"tuan","refresh": "1"})});
                return;
            }
            var url = decodeURIComponent(this.fromUrl || '');
            //如果url中指定了from
            if (url) {
                var history = this.getHistory();
                history.stack.pop();
                if (this.isFromHotel(url)) {
                    location.href = url;
                } else {
                    TuanApp.jumpToPage(url, this);     
                }
            } else {
                this.back();
            }
        },
        /**
         * 预订页之前先清除订单信息
         */
        removeOrderData: function(){
            //清除发票信息
            invoiceStore && invoiceStore.remove();
            //清除订单信息
            orderInfo && orderInfo.remove();
        },
        getTuanDetail: function () {
            var self = this,
                cityId = this.cityId,
                param,
                gpsInfo = geolocationStore.getAttr('gps')||{};

            this.showLoading();
            param = {
                id: self.productId,
                pos: {
                    lon: gpsInfo.lng,
                    lat: gpsInfo.lat,
                    type: 3, //数据来源，默认3为高德
                    name: gpsInfo.city//服务端用来判断是否同城
                },
                environment: TuanApp.environment
            };
            cityId && (param.cityid = cityId);//服务端用来判断是否同城
            tuanDetailModel.setParam(param);

            //获取详细信息
            tuanDetailModel.excute(function (data) {
                //修复点击重试之后页面依然无法加载的bug
                this.hideWarning404();
                var favorInfo,
                    channelInfo = data.channelInfo,
                    isCorrectChannel = channelInfo && channelInfo.isCorrectChannel;

                this.hideLoading();
                if (!(data && data.hotels)) {
                    this.showMessage('抱歉，数据加载失败，请重试或返回!');
                    return;
                }

                if (!isCorrectChannel) {
                    this.showMessage('该产品暂不支持手机售卖， 请在电脑端登录携程后购买。');
                }
                this.detailData = data;
                this.renderData(data);
                //收藏信息
                favorInfo = data.favorInfo;
                self.favorInfo = favorInfo;
                self.productInfo = data;
                //更新收藏状态
                self.updateFavorStatus(favorInfo && favorInfo.isFavor, favorInfo && favorInfo.favorId);
            }, function () {
                var self = this;
                this.showWarning404($.proxy(self.getTuanDetail, self));

                this.hideLoading();
            }, false, this);
        },
        renderData: function (data) {
            var labelVal = data.labelVal,
                labelText = '',
                btnSubmit,
                channelInfo = data.channelInfo,
                isCorrectChannel = channelInfo && channelInfo.isCorrectChannel;

            data.isInApp = isInApp;
            this.$el.html($.trim(this.htmlfun({ data: data })));

            this.$purNotes = this.$el.find('.J_purchaseNotes');
            this.$popNotes = this.$el.find('.J_notesPopBox');
            this.$head = this.$el.find('#J_headerview');
            this.$buyCon = this.$el.find('.J_sticky');

            this.renderArround(1);//附近酒店推荐

            //初始化幻灯片
            this.initImageSlider(data.images);
            //隐藏多余的tips (老版)
            this.hideMoreContent();
            //新版
            this.hideMoreNotes();

            btnSubmit = this.$el.find('#J_submit');
            if (labelVal == 98) { //即将结束

            } else if (labelVal == 99) {
                labelText = "已售完";
            } else if (labelVal == 100) {
                labelText = "已结束";
            }
            if (labelText) {
                btnSubmit.attr('class', disabledCls).text(labelText).removeAttr('id');
            }

            if (!isCorrectChannel) {
                btnSubmit.attr('class', disabledCls);
            }

            this.productData = data;

            this.CallPhone = new CallPhone({
                view: this
            });

            this.isFromWeChat && this.initWechatShare();
        },
        renderArround: function(category) {
            var $con = this.$el.find('.J_aroundProduct');
            tuanNearListModel.setParam({category: category, id: this.productId, environment:TuanApp.environment});
            tuanNearListModel.excute(function(data) {
                if (data && data.products && data.products.length) {
                    $con.append(_.template(nearHtml, {data: data, num: 4}));
                } else {
                    $con.remove();
                }
            }, function() {
                $con.remove();
            }, false, this);
        },
        hideMoreContent: function () {
            var panel = this.$el.find('.J_moreOrLessPanel'),
                h = this.lineHeight,
                t;
            $.each(panel, function() {
                t = $(this);
                if (t.height() <= LINE_CONFIG * h) {
                    t.next().remove();
                    t.removeClass('shadow');
                } else {
                    t.css({overflow: 'hidden', height: LINE_CONFIG * h + 'px'});
                }
            });
        },
        hideMoreNotes: function() {
            if (this.$purNotes.find('p').length >= 5) {

            }
        },
        initImageSlider: function(images) {
            var width = $body.offset().width,
                container = this.$el.find('#J_pic'),
                currentIndex = tuanDetailStore.getAttr('imageIndex') | 0,
                self = this;
            images = images.slice(0, 5);
            currentIndex = currentIndex >= 5 ? 4 : currentIndex < 0 ? 0 : currentIndex;
            this.imageSlider = new Slide({
                container: container,
                source: _.map(images, function(t) {return {src: t.large, title: t.title};}),
                itemCls: '.J_picItem',
                autoplay: 0,
                currentIndex: currentIndex,
                prefetch: 5,
                tpl: '<ul class="cont" style="height:180px;width:9999px;font-size:0;z-index: 1;">' +
                    '<%_.each(data, function(t, i) {%>' +
                '<li class="J_picItem" data-index="<%=i%>" style="display:inline-block"><img data-src="<%=t.src%>" data-img-title="<%=t.title%>"/>' +
                '<%if (i === data.length-1) {%><span class="endinfo">滑动查看相册</span><%}%></li><%});%>' + '</ul>',
                width: width,
                onTouchEnd: function(index, direct, distance) {
                    if (index === images.length-1 && direct === 'left' && distance > 10) {
                        tuanDetailStore.setAttr('imageIndex', index);
                        self.showImages();
                    }
                },
                onSwitch: function(index) {
                    //同步修改nav
                    self.selectImageNav(index);
                },
                onInit: function() {
                    //init nav
                    self.initSlideNav(container, images.length, currentIndex);
                }
            });
        },
        initSlideNav: function(container, len, cur) {
            var nav = container.find('.J_navItem');
            if (!nav.length) {
                nav = $(_.template('<div class="navitem J_navItem"><% for(var i=0;i<len;i++) {%><i class="<%if(cur === i){%> cur<%}%>"></i><%}%></div>', {len: len, cur: cur})).appendTo(container);
            }
            this.sliderNav = nav;
        },
        selectImageNav: function(index) {
            this.sliderNav && this.sliderNav.length && this.sliderNav.find('i').removeClass('cur').eq(index).addClass('cur');
        },
        initWechatShare: function () {
            this.prepareShareData(function(data) {
                var we;
                try {
                    we = new WechatShare({
                        data: {
                            // "appid": appid, //只有发送好友信息才需要appid
                            //"img_url": data.imageUrl, //暂不支持 app6.1 bug
                            "img_url": data.imgUrl,
                            "img_width": "200",
                            "img_height": "200",
                            "link": data.linkUrl,
                            "desc": data.text,
                            "title": data.title
                        }
                    });
                } catch (e) {
                }
            });
        },
        //跳转至图文详情页
        gotoGroupContent:function(){
            this.forwardJump('lashou','/webapp/tuan/lashou/' + this.productId + '.html');
        },
        submit: function () {
            if (!this.$el.find("#J_submit").hasClass(disabledCls)) {
                this.forwardJump('booking','/webapp/tuan/booking' + (this.externalReferURL ? ('?from=' + this.externalReferURL) : ''));
            }
        },
        gotoRelatedProducts: function (e) {
            var id = $(e.currentTarget).data('id');
            this.forwardJump('detail','/webapp/tuan/detail/' + id + '.html' + (this.cityId ? '?cityid=' + this.cityId : ''));
        },
        ctrlInfoTip: function (e) {
            var btn = $(e.target);
            var panel = btn.parent().prev();

            if (btn.attr("data-state") === "hide") {
                panel.removeAttr('style').removeClass('shadow');
                btn.attr({ "data-state": "show" }).html("收起").removeClass("view_unfold").addClass("view_fold");
            } else {
                panel.css({overflow:'hidden', height: this.lineHeight*LINE_CONFIG + 'px'}).addClass('shadow');
                btn.attr({ "data-state": "hide" }).html("查看全部").removeClass("view_fold").addClass("view_unfold");
            }
        },
        showTips: function () {
            this.forwardJump('detailtips', "/webapp/tuan/detailtips");
        },
        showImages: function () {
            var images = this.productData.images;

            //有图片才往后跳
            if(images && images.length){
                this.forwardJump('hotelimages','/webapp/tuan/hotelimages/' + this.productId + '.html', { viewName: 'hotelimages' });
            }
        },
        showImageSlide: function(e) {
            var id = ($(e.currentTarget).attr('data-index') | 0);
            tuanDetailStore.setAttr('imageIndex', id);
            this.forwardJump('hotelimageslide','/webapp/tuan/hotelimageslide/' + this.productId + '?index=' + (id+1), { viewName: 'hotelimageslide' });
        },
        showBranch: function () {
            var cityId = this.cityId;
            this.forwardJump('hotelsubbranch','/webapp/tuan/hotelsubbranch' + (cityId ? '?cityid=' + cityId : ''));
        },
        showMap: function (e) {
            var target = $(e.currentTarget), coords;
            if (!/J_phone/ig.test(target.attr('class'))) {
                coords = target.attr('data-coords').split(',');
                //name, lng, lat
                this.showCommonMap(target.attr('data-hotel-name'), coords[0], coords[1]);
            }
        },
        showComment: function () {
            this.forwardJump('hotelcomments', '/webapp/tuan/hotelcomments');
        },
        showService: function () {
            this.forwardJump('hotelservice', '/webapp/tuan/hotelservice');
        },
        showMorehotel: function (e) {
            var moreLinks = this.$el.find(".J_relatedRest"),
                btn = $(e.target),
                expanded = btn.data('expanded');

            moreLinks.css({ "display": expanded?'none':'' }).removeClass('no_bb');
            btn.data('expanded', !expanded)
                .html(expanded?'更多':'收起')
                .attr('class', expanded?'view_unfold':'view_fold');

        },
        showNotePop: function() {
            var $pop = this.$popNotes,
                $notes = this.$purNotes && this.$purNotes[0];
            $pop.html($notes ? $notes.outerHTML : '');
            $pop.find('.J_showNotePop').remove();
            !this.mask && (this.mask = new c.ui.Mask());
            $pop.show();
            this.mask.show();
        },
        hideNotePop: function() {
            this.mask && this.mask.hide();
            this.$popNotes && this.$popNotes.hide();
        },
        getAppUrl: function () {
            var productId = getQuery('pid');
            return "ctrip://wireless/hotel_groupon_detail?c1=" + productId;
        },
        /**
        * 控制无效日期展开收起
        */
        toggleInvalidDateInfo: function (e) {
            var target = $(e.target),
                isFolded = target.hasClass(UNFOLD_CLS),
                viewPanel = target.parent().prev();

            viewPanel[isFolded ? 'show' : 'hide']();
            if (isFolded) {
                target.removeClass(UNFOLD_CLS).addClass(FOLD_CLS).text('收起');
            } else {
                target.removeClass(FOLD_CLS).addClass(UNFOLD_CLS).text('查看不适用日期');
            }
        },
        onHotelDetailClick: function(e){
            var hotelId = $(e.target).attr('data-hotel-id');
            this.gotoHotelDetail(hotelId);
        },
        /*附近团购跳转至明细页*/
        gotoNearProduct:function(e){
            var pid= $(e.currentTarget).data("id");
            this.forwardJump("detail","/webapp/tuan/detail/" + pid + ".html" + (this.cityId ? "?cityid=" + this.cityId : ""));
        },
        /**
         * 点击跳转跳转到国内酒店详情页
         * @param {int} 国内酒店ID
         */
        gotoHotelDetail: function(hotelId){
            var today = new Date(),
                tomorrow = new Date(today.setDate(today.getDate()+1)),
                fromUrl = encodeURIComponent(location.href),
                url = isInApp ?
                'ctrip://wireless/InlandHotel?hotelDataType=1&checkInDate='+formatDate(new Date())+'&checkOutDate='+formatDate(tomorrow)+'&hotelId='+hotelId+'&from='+fromUrl :
                'http://m.ctrip.com/webapp/hotel/hoteldetail/' + hotelId + '.html?from=' + fromUrl;

            TuanApp.jumpToPage(url, this);
        },
        onScroll: function () {
            var scroll = this.$buyCon;
            var boundaryH = 180 - (isInApp ? 61 : 41);
            if (!scroll) { return; }
            if (window.scrollY >= boundaryH) {
                scroll.prev().css('marginBottom', scroll.height() + (parseInt(scroll.css('margin-bottom'), 10) || 0));
                scroll.addClass('tuan_buy_fixed');
                this.$head && this.$head.addClass('headerview_bgcolor');
            } else {
                scroll.prev().css('marginBottom', '0');
                scroll.removeClass('tuan_buy_fixed');
                this.$head && this.$head.removeClass('headerview_bgcolor');
            }
        }
    });
    return View;
});
