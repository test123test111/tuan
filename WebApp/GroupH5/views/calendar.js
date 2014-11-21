/**
 * Created by li.xx on 2014/11/20.
 * @contact li.xx@ctrip.com
 * @description 门票价格日历的选择页面
 */
define(['TuanApp', 'libs', 'TuanBaseView', 'cCommonPageFactory', 'cUtility', 'TuanModel', 'TuanStore', 'cHolidayPriceCalendar'],
    function (TuanApp, libs, TuanBaseView, CommonPageFactory, Util, TModel, TStore, HolidayPriceCalendar) {
        'use strict';
        var View,
            ticketBookingModel = TModel.TicketBookingModel.getInstance(), //门票对接选择日期
            tuanDetailStore = TStore.TuanDetailsStore.getInstance(), //产品相关信息
            PageView = CommonPageFactory.create("TuanBaseView");

        View = PageView.extend({
            events: {},
            onLoad: function() {

            },
            onShow: function() {
                var self = this;
                this.header.set({
                    title: '选择日历',
                    view: this,
                    back: true,
                    events: {
                        returnHandler: function () {
                            self.back();
                        }
                    }
                });
                var date = tuanDetailStore.getAttr('ckintime'),
                    selectCls = 'cui_cld_daycrt';

                //daterange: {sdate: '', edate: ''}
                this.showLoading();
                ticketBookingModel.setParam({pid:self.pid, daterange: {sdate: '', edate:''}});
                ticketBookingModel.excute(function(data) {
                    self.hideLoading();
                    var priceDate = data.plist[0].PDList;
                    _.each(priceDate, function(t) {
                        t.dateStr = t.date;
                        t.date = new Date(self._convertTimeString(t.date));
                        t.price = parseInt(t.price, 10);
                    });
                    self.calendar = new HolidayPriceCalendar({
                        monthsNum: 2,
                        voidInvalid: true, //没有价格的日期是否有效可点,false可点
                        priceDate: priceDate,
                        header: false,
//                        startPriceTime: priceDate[0] && priceDate[0].date,
                        onShow: function() {
                            //(如果在当前view打开的话)隐藏上一个view， 否则会有bug：日历可以左右滑动且滑到最下面的时候会露出上一个view的内容
                            Util.isInApp() && (this.$el.find('.cui_cldweek').css('top', '0px'));
                            date && this.$el.find('[data-date="' + date + '"]').addClass(selectCls);
                        },
                        onHide: function() {
                            self.show();
                            this.remove();
                        },
                        callback: function(date, dateStyle, target) {
                            var textVal = self._formatCalendarDate(date) + (dateStyle.holiday || dateStyle.days);
                            this.$el.find('.' + selectCls).removeClass(selectCls);
                            target.addClass(selectCls);
                            tuanDetailStore.setAttr('ckintimetxt', textVal);//刷新页面后用来做显示
                            self._storeDailyPrice(priceDate, dateStyle.value);
                            self.forwardJump('booking', '/webapp/tuan/booking');
                        }
                    });
                    self.$el.append(self.calendar.$el);
                    self.calendar.show();
                }, function(err) {
                    self.hideLoading();
                });

            },
            onHide: function() {
            },
            onCreate: function() {

            },
            _storeDailyPrice: function(data, date) {
                var price;
                _.each(data, function(t) {
                    if (t.dateStr == date) {
                        price = t.price;
                        return false;
                    }
                });
                tuanDetailStore.setAttr('ckintime', date);
                tuanDetailStore.setAttr('ticketPrice', price || 0);
            },
            _formatCalendarDate: function(date) {
                (typeof date === 'string') && (date = new Date(this._convertTimeString(date)));
                return (date.getMonth()+ 1) +'月' + date.getDate() + '日 ';
            },
            _convertTimeString: function(dateStr) {
                return dateStr && dateStr.replace(/-/g, '/');
            }
        });


        return View;
    });
