/*jshint -W030*/
/**
 * @author: xuweichen
 * @date: 14-2-13 下午1:13
 * @descriptions
 * @since v2.6 增加参数IsRealPay，实时支付相关
 */
define(['cUtility', 'cWidgetGuider', 'cWidgetFactory', 'cHybridFacade', 'cUtilityCrypt'], function (Util, WidgetGuider, WidgetFactory, Facade, Crypt) {
    "use strict";

    var WIDGET_NAME = 'Payment',
        PAYMENT_LINKS = {
            DEV: 'https://secure.fat18.qa.nt.ctripcorp.com/webapp/payment2/index.html',
            TEST: 'https://secure.fat18.qa.nt.ctripcorp.com/webapp/payment2/index.html',
            UAT: 'https://secure.uat.qa.nt.ctripcorp.com/webapp/payment2/index.html',
            PRO: 'https://secure.ctrip.com/webapp/payment2/index.html'
        },

        WIN = window,
        isInApp = Util.isInApp(),
        Guider = WidgetFactory.create('Guider'),
        Payment;

    /**
    * @param {Object} data 相关参数数据
    * @param {boolean} isInApp 是否hybrid链接
    */
    function generatePayWayUrl(data, isInApp, others) {
        var sback,
            rback,
            from,
            onum = data.oid || data.orderID,
            BOOKING_URL = isInApp ? '/webapp/tuan/index.html#booking' : '/webapp/tuan/booking',
            BOOKING_SUCCESS_URL = isInApp ? '/webapp/tuan/index.html#booking.success!{orderid}' : '/webapp/tuan/bookingsuccess/{orderid}.html',
            baseUrl = isInApp ? "index.html" : PAYMENT_LINKS[getEnv()],
            domain = isInApp ? 'file:/' : "http://" + location.host,
            extendToken = {
                IsNeedCardRisk: true,//风控参数
                payTypeList:data.payTypeList,
                subPayTypeList: data.subPayTypeList,
            },
            bookingSuccessUrl = BOOKING_SUCCESS_URL.replace('{orderid}', onum);

        if (others) {
            extendToken.isRealTimePay = others.IsRealPay || 0;
        }
        sback = domain + bookingSuccessUrl;
        rback = domain + BOOKING_URL;
        from = domain + (data.from || BOOKING_URL);
        data.oid = data.oid.toString(10);
        data.from = from;
        data.sback = sback;
        data.eback = sback;
        data.rback = ''; //第三方支付，不回跳到订单填写页， modified at 2014/10/11 17:12  by melvin ren
        return baseUrl + '#index?' + 'bustype=' + data.bustype + '&extend=' + encodeURIComponent(Crypt.Base64.encode(JSON.stringify(extendToken))) + '&oid=' + data.oid + '&token=' + encodeURIComponent(Crypt.Base64.encode(JSON.stringify(data)));

    }
    function getEnv() {
        var host = WIN.location.host.toLowerCase(),
            env = 'uat';

        if (host.match(/^(m|3g|wap)\.ctrip\.com/i) || host == '10.8.2.111') { //生产或者堡垒环境
            env = 'pro';
        } else if (host.match(/^m\.uat\.qa/i)) {
            env = 'uat';
        } else if (host.match(/^(m|w\-tuan\-m)\.fat/i) || host.match(/^(localhost|127\.0)/i)) {
            env = 'dev';
        }
        return env.toUpperCase();
    }
    //全部都跳转web上
    Payment = isInApp ? {
        submit: function (page, data, others) {
            //Guider.cross({ path: 'payment', param: generatePayWayUrl(data, thirdpartUrl, true) });

            var param = generatePayWayUrl(data, true, others);
            if (/file\:[\\\/]*/i.test(param)) {
                param = "index.html#" + param.split('#')[1];
            }

            Guider.cross({ path: 'payment2', param: param });

        }
    } : {
        submit: function (page, data, others) {
            //page.cross(generatePayWayUrl(data, thirdpartUrl));
            page.jump(generatePayWayUrl(data, false, others));
            //window.location = generatePayWayUrl(data, thirdpartUrl);
        }
    };


    WidgetFactory.register({
        name: WIDGET_NAME,
        fn: Payment
    });
});
