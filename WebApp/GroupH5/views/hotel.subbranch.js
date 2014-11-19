/**
 * 商户列表
 * @url: m.ctrip.com/webapp/tuan/hotelsubbranch
 */
define(['TuanApp', 'libs', 'c', 'cUtility', 'cWidgetFactory', 'cGeoService', 'TuanStore', 'TuanBaseView', 'cCommonPageFactory', 'TuanModel', 'CommonStore', 'StoreManage', 'text!HotelSubbranchTpl', 'CallPhone', 'cWidgetGeolocation'],
function (TuanApp, libs, c, Util, WidgetFactory,cGeoService, TuanStore, TuanBaseView, CommonPageFactory, TuanModel, CommonStore, StoreManage, html, CallPhone) {
    var MSG = {
            pageTitle: "商户列表"
        },
        cui = c.ui,
        cBase = c.base,
        isInApp = Util.isInApp(),
        REFRESH_GPS_LOADING_CLS = 'ani_rotation',
        geolocationStore = TuanStore.GroupGeolocation.getInstance(), //经纬度信息
        tuanDetailsStore = TuanStore.TuanDetailsStore.getInstance(),
        tuanBranchOfficeModel = TuanModel.TuanBranchOfficeModel.getInstance(),
        Geolocation = cGeoService.GeoLocation,
        Guider = WidgetFactory.create('Guider');

    /**
     * 获取yyyy-mm-dd格式时间
     * @param {Date} date
     * @returns {string}
     */
    function formatDate(date){
        return date.toISOString().substring(0, 10).replace(/-/g, '');
    }

    var PageView = CommonPageFactory.create("TuanBaseView");
    var View = PageView.extend({
        events: {
//            'click .J_phone': 'showPhone',
            'click .J_showMap': 'showMap',
            'click .J_jumpHotel': 'jumpHotel',
            'click .J_busiCity': 'showHotel',
            'click #J_relocation': 'relocation'
        },
        onCreate: function () {
            this.htmlfun = _.template(html);
        },
        onLoad: function () {
            this.cityId = Lizard.P('cityid');
            if (tuanDetailsStore.get() != null) {
                this.showBranch();
            } else {
                this.backAction();
            }
            //更新头部
            this.setHeader();
        },
        setHeader: function () {
            var self = this;
            this.header.set({
                title: MSG.pageTitle,
                back: true,
                home: true,
                view: this,
                tel: 4000086666,
                events: {
                    returnHandler: function () {
                        self.backAction();
                    },
                    homeHandler: function () {
                        self.backHome();
                    }
                }
            });
        },
        showBranch: function (gps) {
            var self = this,
                cityId = this.cityId,
                param,
                gpsInfo = gps || geolocationStore.getAttr('gps') || {};
            this.showLoading();
            param = {
                id: tuanDetailsStore.get().id,
                pos: {
                    lon: gpsInfo.lng,
                    lat: gpsInfo.lat,
                    type: 3, //数据来源，默认3为高德
                    name: gpsInfo.city//服务端用来判断是否同城
                }
            };
            cityId && (param.cityid = cityId);//服务端用来判断是否同城
            tuanBranchOfficeModel.setParam(param);
            //获取详细信息
            tuanBranchOfficeModel.excute(function (data) {
                self.hideLoading();
                if (!data.groups.length) {
                    self.showMessage('抱歉，数据加载失败，请重试!');
                    return;
                }
                var cityInfo = StoreManage.getCurrentCity();
                cityInfo.CityName && (gpsInfo.CityName = cityInfo.CityName);
                self.$el.html($.trim(self.htmlfun({ data: data.groups, gps: gpsInfo, cityId: cityId })));
                self.CallPhone = new CallPhone({view: this});
            }, function (err) {
                var msg = err.msg ? err.msg : '啊哦,数据加载出错了!';
                // this.showHeadWarning('团购分店信息', msg, function () {
                self.showToast(msg, 3, function () {
                    self.backAction();
                });
                self.hideLoading();
            }, true, this);
        },
        showPhone: function (e) {
            var phone = new Array(), telphone;
            var phoneTxt = $(e.currentTarget).data("tel").toString();
            phoneTxt = phoneTxt.replace(/，/g, ",");
            _.each(phoneTxt.split(','), function (data) {
                phone.push(" <a href='tel:" + data + "'>" + data + "</a>");
                if (!telphone || telphone == "") telphone = data;
            });
            //初始化alert
            this.alert = new cui.Alert({
                title: '拨打电话',
                message: " <div id=\"tuan_tel\">" + phone.join("") + "</div>",
                buttons: [{
                    text: '取消',
                    click: function () {
                        this.hide();
                    }
                }, {
                    text: '<a href="tel:' + telphone + '" data-phone="'+telphone+'">拨打</a>',
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
                        })
                    }
                }]
            });
            this.alert.show();
        },
        onShow: function () { },
        onHide: function () {
            Geolocation.UnSubscribe('tuan/subbranch');
        },
        backAction: function () {
            var o = {};
            var id = tuanDetailsStore.getAttr('id');
            var cityid = this.cityId;
            id && (o.did = id);
            cityid && (o.cityid = cityid);
            this.back(o);
        },
        backHome: function () {
            TuanApp.tHome();
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

            this.forwardJump('hotelmap', '/webapp/tuan/hotelmap?lon=' + coords[0] + '&lat=' + coords[1] + '&hotelName=' + hotelName)

        },
        /**
         * 点击跳转跳转到国内酒店详情页
         * @param {int} 国内酒店ID
         */
        jumpHotel: function(e){
            var hotelId = $(e.currentTarget).data('id');
            if (!hotelId) return;
            var today = new Date();
            var tomorrow = new Date(today.setDate(today.getDate()+1));
            var fromUrl = encodeURIComponent(location.href);
            var url = isInApp ?
                'ctrip://wireless/InlandHotel?hotelDataType=1&checkInDate='+formatDate(new Date)+'&checkOutDate='+formatDate(tomorrow)+'&hotelId='+hotelId+'&from='+fromUrl :
                'http://m.ctrip.com/webapp/hotel/hoteldetail/' + hotelId + '.html?from=' + fromUrl;
            var history = this.getHistory();
            history.stack.pop();
            TuanApp.jumpToPage(url, this);
        },
        showHotel: function (e) {
            var target = $(e.currentTarget),
                unflod,
                arrow = target.find('.J_arrow');

            if (arrow.hasClass('arrow_skin01_up')) {
                arrow.toggleClass('arrow_skin01_up arrow_skin01_down');
                target.removeClass('J_sticky').removeClass('busi_fixed').css('top', '0').next().hide();
                target.parent().css('padding-top', '0');
                document.removeEventListener('scroll', this.onScroll);
            } else {
                unflod = this.$el.find('.arrow_skin01_up');
                unflod.toggleClass('arrow_skin01_up arrow_skin01_down');
                unflod.parent().removeClass('J_sticky').removeClass('busi_fixed').css('top', '0').next().hide();
                unflod.parent().parent().css('padding-top', '0');

                arrow.toggleClass('arrow_skin01_down arrow_skin01_up');
                target.addClass('J_sticky').next().show();
                document.addEventListener('scroll', this.onScroll);
            }
            this.onScroll();
        },
        onScroll: function () {
            var scroll = document.querySelector('.J_sticky');
            if (!scroll) return;
            if (window.scrollY >= scroll.parentNode.offsetTop) {
                scroll.classList.add('busi_fixed');
                scroll.parentNode.style.paddingTop = '45px';
                !isInApp && (scroll.style.top = '48px');
            } else {
                scroll.classList.remove('busi_fixed');
                scroll.parentNode.style.paddingTop = '0';
                !isInApp && (scroll.style.top = '0');
            }

        },
        //重新定位
        relocation: function (e) {
            var self = this,
                target = $(e.target),
                gpsAddr = this.$el.find('#J_gpsAddr');
            target.addClass(REFRESH_GPS_LOADING_CLS);
            Geolocation.Subscribe('tuan/subbranch', {
                onComplete: function (gps) {
                    target.removeClass(REFRESH_GPS_LOADING_CLS);
                    gpsAddr.html('您的位置：' + (gps.address || '未知位置'));
                    self.showBranch(gps);
                },
                onError: function () {
                    target.removeClass(REFRESH_GPS_LOADING_CLS);
                    gpsAddr.html('暂无定位信息');
                    self.showToast('抱歉，获取不到当前位置，请打开GPS后重试!');
                },
                onPosComplete: function (lng, lat) {
                },
                onPosError: function () {
                    target.removeClass(REFRESH_GPS_LOADING_CLS);
                    gpsAddr.html('暂无定位信息');
                    self.showToast('抱歉，获取不到当前位置，请打开GPS后重试!');
                }
            }, this, true);
        }
    });
    return View;
});
