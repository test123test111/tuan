define(["cUtility","cWidgetGuider","cWidgetFactory","cHybridFacade","cUtilityCrypt"],function(e,t,n,r,i){function c(e,t){var n,r,s,u=e.oid||e.orderID,a=t?"/webapp/tuan/index.html#booking":"/webapp/tuan/booking",f=t?"/webapp/tuan/index.html#booking.success!{orderid}":"/webapp/tuan/bookingsuccess/{orderid}.html",l=t?"index.html":o[h()],c=t?"file:/":"http://"+location.host,p={IsNeedCardRisk:!0,payTypeList:e.payTypeList,subPayTypeList:e.subPayTypeList},d=f.replace("{orderid}",u);return n=c+d,r=c+a,s=c+(e.from||a),e.oid=e.oid.toString(10),e.from=s,e.sback=n,e.eback=n,e.rback="",l+"#index?"+"bustype="+e.bustype+"&extend="+encodeURIComponent(i.Base64.encode(JSON.stringify(p)))+"&oid="+e.oid+"&token="+encodeURIComponent(i.Base64.encode(JSON.stringify(e)))}function h(){var e=u.location.host.toLowerCase(),t="uat";if(e.match(/^(m|3g|wap)\.ctrip\.com/i)||e=="10.8.2.111")t="pro";else if(e.match(/^m\.uat\.qa/i))t="uat";else if(e.match(/^(m|w\-tuan\-m)\.fat/i)||e.match(/^(localhost|127\.0)/i))t="dev";return t.toUpperCase()}var s="Payment",o={DEV:"https://secure.fws.qa.nt.ctripcorp.com/webapp/payment2/index.html",TEST:"https://secure.fws.qa.nt.ctripcorp.com/webapp/payment2/index.html",UAT:"https://secure.uat.qa.nt.ctripcorp.com/webapp/payment2/index.html",PRO:"https://secure.ctrip.com/webapp/payment2/index.html"},u=window,a=e.isInApp(),f=n.create("Guider"),l;l=a?{submit:function(e,t){var n=c(t,!0);/file\:[\\\/]*/i.test(n)&&(n="index.html#"+n.split("#")[1]),f.cross({path:"payment2",param:n})}}:{submit:function(e,t){e.jump(c(t))}},n.register({name:s,fn:l})});