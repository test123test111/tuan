/**
 * 详情页
 * @url m.ctrip.com/webapp/tuan/detail/{pid}.html
 */
define(['TuanApp', 'libs', 'c', 'MemCache', 'cUtility', 'cHybridFacade', 'cWidgetMember', 'cWidgetGuider', 'TuanStore', 'TuanBaseView', 'cCommonPageFactory', 'TuanModel', 'CommonStore', 'text!DetailTpl', 'cWidgetFactory'],
function (TuanApp, libs, c, MemCache, Util, Facade, WidgetMember, WidgetGuider, TuanStore, TuanBaseView, CommonPageFactory, TuanModel, CommonStore, html, WidgetFactory) {
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
        cui = c.ui,
        refer, //网页来源，从onload里传入
        isInApp = Util.isInApp(),
        tuanDetailModel = TuanModel.TuanDetailModel.getInstance(),
        tuanDetailStore = TuanStore.TuanDetailsStore.getInstance(),
        tuanAddFavorite = TuanModel.TuanAddFavorite.getInstance(),
        tuanDelFavorite = TuanModel.TuanDelFavorite.getInstance(),

        geolocationStore = TuanStore.GroupGeolocation.getInstance(), //经纬度信息
        userStore = CommonStore.UserStore.getInstance(), //用户信息
        orderInfo = TuanStore.TuanOrderInfoStore.getInstance(),
        invoiceStore = TuanStore.TuanInvoiceStore.getInstance(),
        Member = WidgetFactory.create('Member'),
        Guider = WidgetFactory.create('Guider'),
        getQuery = Lizard.P;

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
        backHome: function (e) {
            TuanApp.tHome();
        },
        events: {
            'click #J_submit': 'submit',
            'click .J_relatedProducts': 'gotoRelatedProducts',
            'click .J_tips': 'showTips',
            'click .J_viewMoreBtn': 'ctrlInfoTip',
            'click #J_pic': 'showImages',
            'click #J_branch': 'showBranch', //分店
            'click .J_showDetailMap': 'showMap', //地图
            'click .J_phone': 'showPhone',
            'click #J_comment': 'showComment', //点评
            'click #J_service': 'showService', //服务优势
            'click #J_morehotel': 'showMorehotel',
            'click #J_expandInvalid': 'toggleInvalidDateInfo',
            'click #J_recommendNearby': 'recommendNearby',
            'click #J_gotoHotelDetail': 'onHotelDetailClick',
            'click .J_nearProducts': 'gotoNearProduct',
            'click #J_groupContain': 'gotoGroupContent',
        },
        onCreate: function () {
            this.htmlfun = _.template(html);

            this.cityId = getQuery('cityid');
            this.productId = getQuery('pid') || getQuery('productID');
            this.externalReferURL = getQuery('url');
        },
        //数据加载阶段
        _onLoad: function (referUrl) {
            //from中可能含有querystring，用getQuery获取不到完整的带querystring的URL
            this.fromUrl = Util.getUrlParam(location.href, 'from');
            //如果没有fromUrl或者来自微信
            if(!this.fromUrl || this.isFromWeChat(this.fromUrl)){
                this.fromUrl = '';
            };

            this.removeOrderData();
            this.getTuanDetail();
        },
        /**
         * 是否从微信分享跳转过来的链接，微信中为自动添加from=singlemessage，导致详情页back跳转404
         * @param {String} fromUrl
         * @returns {*|boolean}
         */
        isFromWeChat: function(fromUrl){
            return fromUrl && (fromUrl.toLowerCase().indexOf('singlemessage')>-1);
        },
        recommendNearby: function(){
            var cityId = this.cityId;
            this.forwardJump('nearlist','/webapp/tuan/nearlist?pid=' + this.productId + (cityId ? '&cityid=' + cityId : ''));
        },
        setHeader: function (favorited) {
            var self = this,
                headerData;

            headerData = {
                title: MSG.pageTitle,
                back: true,
                view: this,
                favorited: !!favorited, //Hybrid配置
                favorite: !favorited,   //Hybrid配置
                share: true, //分享，图片-native预置
                events: {
                    returnHandler: function () {
                        self.backAction();
                    }
                }
            };
            if(!isInApp){//如果是H5则配置对应的收藏按钮，hybrid不能配置
                var cls = favorited ? 'icon_fav i_bef' : 'icon_unfav i_bef';
                headerData.events.commitHandler = function(){
                    self.favorite();    
                };
                headerData.btn = {
                    title: '',
                    id: 'favorite',
                    classname: cls
                };
            };
            this.header.set(headerData);

            this.header.show();
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
                };
            };
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
            //如果有图片链接则现在到本地再进行分享
            imgUrl && Guider.downloadData({
                url: imgUrl,
                callback: function(ret){
                    data.imgUrl = ret.savedPath;
                    callback && callback.call(self, data);
                }
            });
        },
        /**
        * 分享按钮事件
        */
        bindShareEvent: function () {
            var self = this;

            Guider.apply({
                callback: function () {
                    //h5暂不支持
                },
                hybridCallback: function () {
                    Guider.register({
                        tagname: Facade.METHOD_SHARE, callback: function () {
                            self.prepareShareData(function(data){
                                Guider.shareToVendor(data);
                            });
                        }
                    });
                }
            })
        },
        /**
         * 更新收藏状态
         * @param {boolean} status 是否收藏
         * @param {int} favorId 收藏ID
         */
        updateFavorStatus: function(status, favorId){
            var self = this;

            self.updateFavorButton(status);
            self.favorInfo = {
                isFavor: !!status,
                favorId: favorId
            };
            tuanDetailStore.setAttr('favorInfo', self.favorInfo);
        },
        /**
         * 更新收藏按钮
         */
        updateFavorButton: function(status){
            var self = this,
                btnId = 'favorite',
                btn = this.header.rootBox.find('#favorite');

            self.setHeader(status);
            Guider.apply({
                callback: function(){
                },
                hybridCallback: function(){
                    Guider.register({
                        tagname: Facade.METHOD_FAVORITE, callback: function () {
                            self.favorite();
                        }
                    });
                    Guider.register({
                        tagname: Facade.METHOD_FAVORITED, callback: function () {
                            self.favorite();
                        }
                    });
                }
            });
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
                };
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
                };
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
                        self.onLoad(self.referer);
                    }
                });
                return false;
            };
            return true;
        },
        onShow: function () {
            this.hideLoading();
            this._onLoad();
        },
        onHide: function () {
            this.timer && clearInterval(this.timer);
            this.hideLoading();
            this.hideWarning404();
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
        backAction: function () {
            if(this.isFromHybridFavorPage()){
                Guider.backToLastPage({'param': JSON.stringify({"biz":"tuan","refresh": "1"})});
                return;
            };
            var url = decodeURIComponent(this.fromUrl || '');
            //如果url中指定了from
            if (url) {
                var history = this.getHistory();
                history.stack.pop();
                if (this.isFromHotel(url)) {
                    location.href = url;
                } else {
                    TuanApp.jumpToPage(url, this);     
                };
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
                //绑定分享
                self.bindShareEvent();
            }, function (err) {
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
            btnSubmit = this.$el.find('#J_submit');
            if (labelVal == 98) { //即将结束

            } else if (labelVal == 99) {
                labelText = "已售完";
            } else if (labelVal == 100) {
                labelText = "已结束";
            };
            if (labelText) {
                btnSubmit.attr('class', disabledCls).text(labelText).removeAttr('id');
            };

            if (!isCorrectChannel) {
                btnSubmit.attr('class', disabledCls);
            };

            //开启倒计时
            this.showTimer(data.etime);
            this.productData = data;
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


            var hidden = btn.parent().prev().find('.J_tipsHidden');

            if (btn.attr("data-state") === "hide") {

                hidden.show();
                btn.attr({ "data-state": "show" }).html("收起").removeClass("view_unfold").addClass("view_fold");
            } else {

                btn.attr({ "data-state": "hide" }).html("查看全部").removeClass("view_fold").addClass("view_unfold");
                hidden.hide();
            }
        },
        showTips: function (e) {
            this.forwardJump('detailtips', "/webapp/tuan/detailtips");
        },
        showImages: function () {
            var images = this.productData.images;

            //有图片才往后跳
            if(images && images.length){
                this.forwardJump('hotelimages','/webapp/tuan/hotelimages/' + this.productId + '.html', { viewName: 'hotelimages' });
            }
        },
        showBranch: function () {
            var cityId = this.cityId;
            this.forwardJump('hotelsubbranch','/webapp/tuan/hotelsubbranch' + (cityId ? '?cityid=' + cityId : ''));
        },
        showMap: function (e) {
            var target = $(e.currentTarget),
                coords = target.attr('data-coords').split(','),
                hotelName = target.attr('data-hotel-name');

            window.mapdata = {
                Longitude: coords[0],
                Latitude: coords[1],
                hotelName: hotelName
            };

            this.forwardJump('hotelmap','/webapp/tuan/hotelmap?lon=' + coords[0] + '&lat=' + coords[1] + '&hotelName=' + hotelName);
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
        showTimer: function (couponEdate) {
            var dayTemp = Date.parse(couponEdate.replace(/\-/g, '/')); //ios safari can not parse '2014-01-01';
            var dayNow = this.getServerDate();
            this.dateDiff = (dayTemp - dayNow);
            //单位时间长度
            var day = 24 * 60 * 60 * 1000;
            //如果小于三天，则开始倒计时
            if ((this.dateDiff / day) < 3) {
                this.timer = setInterval(_.bind(this.updateTimer, this), 600);

            }
        },
        showPhone: function (e) {
            var phone = [],
                telphone,
                phoneTxt = $(e.currentTarget).attr('data-phone');

            phoneTxt = phoneTxt.replace(/，/g, ",");
            _.each(phoneTxt.split(','), function (data) {
                phone.push(" <a href='tel:" + data + "'>" + data + "</a><br/>");
                if (!telphone || telphone == "") telphone = data;
            });
            if (!telphone || telphone == "") {
                this.showToast("没有留下电话号，无法拨打！");
                return;
            }
            //初始化alert
            this.alert = new cui.Alert({
                title: '拨打电话',
                message: phone.join(""),
                buttons: [{
                    text: '取消',
                    click: function () {
                        this.hide();
                    }
                }, {
                    text: '<a href="tel:' + telphone + '" data-phone="' + telphone + '">拨打</a>',
                    click: function (e) {
                        this.hide();
                        Guider.apply({
                            hybridCallback: function () {
                                var PHONE_ATTR_STR = 'data-phone',
                                    target = $(e.target);

                                if (!target.attr(PHONE_ATTR_STR)) {
                                    target = target.find('[' + PHONE_ATTR_STR + ']');
                                };

                                e.preventDefault();
                                Guider.callPhone({ tel: target.attr(PHONE_ATTR_STR) });
                                return false;
                            },
                            callback: function () {
                                return true;
                            }
                        });
                    }
                }]
            });
            this.alert.show();
        },
        updateTimer: function () {
            if (this.dateDiff > 0) {
                var day = 24 * 60 * 60 * 1000;
                var hour = 60 * 60 * 1000;
                var min = 60 * 1000;
                var second = 1000;
                //余下的时间
                var remainTime = this.dateDiff;
                var diffDay = Math.floor(remainTime / day);
                remainTime = remainTime % day;
                var diffHour = Math.floor(remainTime / hour);
                remainTime = remainTime % hour;
                var diffMin = Math.floor(remainTime / min);
                remainTime = remainTime % min;
                var diffSec = Math.floor(remainTime / second);
                this.$el.find(".tuan_hotel_time").text("剩余  " + diffDay + "天" + diffHour + "小时" + diffMin + "分" + diffSec + "秒");
                this.dateDiff = this.dateDiff - 1000;
            } else {
                this.endTimer();
            }
        },
        endTimer: function () {
            clearInterval(this.timer);
            this.$el.find(".tuan_hotel_time").text("0天0小时0分0秒");
            this.$el.find("#J_submit").addClass(disabledCls);
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
            };
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
                'ctrip://wireless/InlandHotel?hotelDataType=1&checkInDate='+formatDate(new Date)+'&checkOutDate='+formatDate(tomorrow)+'&hotelId='+hotelId+'&from='+fromUrl :
                'http://m.ctrip.com/webapp/hotel/hoteldetail/' + hotelId + '.html?from=' + fromUrl;

            TuanApp.jumpToPage(url, this);
        }
    });
    return View;
});
