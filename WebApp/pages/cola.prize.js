define(['c', 'cPageView', 'CommonStore', 'TuanStore'], function (c, PageView, CStore, TStore) {
    'use strict';
    var userStore = CStore.UserStore.getInstance(); //用户信息
    var colaPrize = TStore.ColaPrizeStore.getInstance(); //果粒橙中奖结果

    var View = PageView.extend({
        bindEvent: function () {
            var self = this;
            $('#J_acceptPrize').bind('click', function () {
                self.jump('/webapp/tuan/pages/meizhiyuan.check.html?couponcode=' + self.prize.Coupon);
            });
        },
        onCreate: function () {
            this.els = {
                priceNum: $('#J_priceNum'),
                awardCode: $('#J_awardCode'),
            }
            this.bindEvent();

            var prize = colaPrize.get();
            if (prize) {
                this.prize = prize;
                if (prize.PrizeType == 2) {
                    this.els.priceNum.html(48);
                } else if (prize.PrizeType == 3) {
                    this.els.priceNum.html(4.8);
                }
                this.els.awardCode.html(prize.Coupon);
            } else {
                this.jump('/webapp/tuan/pages/cola.html');
            }
        },
        onShow: function () {
        },
        onHide: function () {
        }
    });
    return View;
});
