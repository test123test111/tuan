/**
 * @author: hxren@ctrip.com
 * @date: 2014/09/02
 * @descriptions: 兼容使用lizard1.1框架的页面。 实现方案：解析1.1页面的参数，直接跳转到lizard2.0的页面
 */

/**
*@description: 获取URL中的参数
*/

(function (window) {
    var useragent = window.navigator.userAgent;
    //如果hybrid不需要解析
    if (useragent.indexOf('CtripWireless') > -1) {
        return true;
    };

    var _getUrlQuerys = function (name, checkKeyExist) {
        var urls = document.location.search || document.location.hash,
            re = new RegExp("(\\\?|&)" + name + "=([^&]+)(&|$)", "i"),
            m = urls.match(re);
        if (m) return m[2];
        return null;
    };

    //begin 解析url
    var _hreff = location.href;
    if (_hreff && _hreff.indexOf('#') > -1) {
        var _hashs = location.hash;

        var allianceid = _getUrlQuerys("allianceid"),
            sid = _getUrlQuerys("sid"),
            ouid = _getUrlQuerys("ouid"),
            sourceid = _getUrlQuerys("sourceid"),
            sales = _getUrlQuerys("sales");
        var marketingArgs = [];
        if (allianceid) {
            marketingArgs.push("allianceid=" + allianceid);
        }
        if (sid) {
            marketingArgs.push("sid=" + sid);
        }
        if (ouid) {
            marketingArgs.push("ouid=" + ouid);
        }
        if (sourceid) {
            marketingArgs.push("sourceid=" + sourceid);
        }
        if (sales) {
            marketingArgs.push("sales=" + sales);
        }

        //团购首页
        if (/#home/i.test(_hashs)) {
            var homeurl = '/webapp/tuan/';
            if (marketingArgs.length > 0) {
                homeurl += "?" + marketingArgs.join('&');
            }
            location.replace(homeurl);
        }

        //团购列表页
        if (/#list/i.test(_hashs)) {
            var listurl = '/webapp/tuan/list/',
                cityid = _getUrlQuerys("cityid"),
                kwd = _getUrlQuerys("kwd"),
                place = _getUrlQuerys("place"),
                lng = _getUrlQuerys("lng"),
                lat = _getUrlQuerys("lat"),
                ctype = _getUrlQuerys("ctype"),
                star = _getUrlQuerys("star"),
                price = _getUrlQuerys("price");
            //querysing array
            var qsArray = [];
            if (+cityid > 0) {
                qsArray.push("cityid=" + cityid)
            }
            if (kwd) {
                qsArray.push("kwd=" + kwd)
            }
            if (place) {
                qsArray.push("place=" + place)
            }
            if (lng) {
                qsArray.push("lng=" + lng)
            }
            if (lat) {
                qsArray.push("lat=" + lat)
            }
            if (ctype) {
                qsArray.push("ctype=" + ctype)
            }
            if (star) {
                qsArray.push("star=" + star)
            }
            if (price) {
                qsArray.push("price=" + price)
            }
            if (marketingArgs.length > 0) {
                qsArray.concat(marketingArgs);
            }
            if (qsArray.length > 0) {
                listurl += "?" + qsArray.join('&');
            }
            location.replace(listurl);
        }
        //团购详情页
        if (/#detail/i.test(_hashs)) {
            var matchResult = _hashs.match(/!(\d+)/);
            if (matchResult) {
                var detailId = matchResult[1];
                var detailurl = '/webapp/tuan/detail/' + detailId + '.html';
                if (marketingArgs.length > 0) {
                    detailurl += "?" + marketingArgs.join('&');
                }
                location.replace(detailurl);
            }
        };
        //团购订单填写页
        if (/#booking/i.test(_hashs)) {
            var detailid = _getUrlQuerys("detailid") || _getUrlQuerys("productid");
            if (detailid) {
                location.replace('/webapp/tuan/booking/?detailid=' + detailid);
            }
        }
        //团购订单详情页, http://m.ctrip.com/webapp/tuan/index.html#tuanorderdetail!6520501&from=%2Fwebapp%2Fmyctrip%2Findex.html%23orders%2Fallorders
        if (/#tuanorderdetail/i.test(_hashs)) {
            var orderdetailurl = '/webapp/tuan/tuanorderdetail/';
            var matchResult2 = _hashs.match(/!(\d+)/);
            if (matchResult2) {
                var orderId = matchResult2[1];
                orderdetailurl += orderId + '.html';
                var qsfrom = _getUrlQuerys("from");
                var qsArr = [];
                if (qsfrom) {
                    qsArr.push("from=" + qsfrom);
                }
                if (marketingArgs.length > 0) {
                    qsArr.concat(marketingArgs);
                }
                if (qsArr.length > 0) {
                    orderdetailurl += "?" + qsArr.join('&');
                }
            }
            location.replace(orderdetailurl);
        };

        //申请退款
        if (/#refund/i.test(_hashs)) {
            var matchResult3 = _hashs.match(/!(\d+)/);
            if (matchResult3) {
                var refundorderId = matchResult3[1];
                var refundfrom = _getUrlQuerys("from");
                var refundurl = '/webapp/tuan/refund/' + refundorderId + '.html';
                if (marketingArgs.length > 0) {
                    refundurl += "?" + marketingArgs.join('&');
                }
                if (refundfrom) {
                    refundurl += (refundurl.indexOf('?') > -1 ? "&" : "?") + "from=" + refundfrom;
                }
                location.replace(refundurl);
            }
        }
    }
    //end 解析url
})(window);
