define([],function(){var e={home:{prev:"",url:"/webapp/tuan/home",range:[]},list:{prev:"home",url:"/webapp/tuan/list",range:["home"]},lottery:{prev:"home",url:"/webapp/tuan/lottery",range:["home"]},localfeature:{prev:"home",url:"/webapp/tuan/localfeature",range:["home"]},listmap:{prev:"list",url:"/webapp/tuan/listmap",range:["list"]},detail:{prev:"list",url:"/webapp/tuan/detail/{did}.html?cityid={cityid}",range:["list","detail","home","nearlist","tuanorderdetail","listmap","bookingsuccess"],params:{did:0,cityid:0}},detailtips:{prev:"detail",url:"/webapp/tuan/detailtips",range:["detail"]},lashou:{prev:"list",url:"/webapp/tuan/lashou/{pid}.html",range:["detail"],params:{pid:0}},citylist:{prev:"home",url:"/webapp/tuan/citylist",range:[]},hotelimages:{prev:"detail",url:"/webapp/tuan/hotelimages/{did}.html",range:["detail"],params:{did:0}},hotelimageslide:{prev:"hotelimages",url:"/webapp/tuan/hotelimageslide?index={imgindex}",range:["hotelimages"],params:{imgindex:1}},hotelcomments:{prev:"detail",url:"/webapp/tuan/hotelcomments",range:["detail"]},hotelservice:{prev:"detail",url:"/webapp/tuan/hotelservice",range:["detail"]},detailtips:{prev:"detail",url:"/webapp/tuan/detailtips",range:["detail"]},hotelmap:{prev:"detail",url:"/webapp/tuan/hotelmap?lon={lon}&lat={lat}&hotelName={hotelname}",range:["detail","tuanorderdetail","hotelsubbranch"],params:{lon:0,lat:0,hotelname:""}},booking:{prev:"detail",url:"/webapp/tuan/booking",range:["detail"]},bookingsuccess:{prev:"list",url:"/webapp/tuan/bookingsuccess/{orderid}.html",range:["list"],params:{orderid:0}},coupon:{prev:"booking",url:"/webapp/tuan/coupon",range:["booking"]},invoice:{prev:"booking",url:"/webapp/tuan/invoice",range:["booking"]},hotelsubbranch:{prev:"detail",url:"/webapp/tuan/hotelsubbranch",range:["detail"]},keywordsearch:{prev:"home",url:"/webapp/tuan/keywordsearch",range:["home","list"]},nearlist:{prev:"detail",url:"/webapp/tuan/nearlist",range:["detail","bookingsuccess","tuanorderdetail"]},tuanorderdetail:{prev:"home",url:"/webapp/tuan/tuanorderdetail/{orderid}.html",range:["home","bookingsuccess"],params:{orderid:0}},refund:{prev:"home",url:"/webapp/tuan/refund/{orderid}.html",range:["home","tuanorderdetail"],params:{orderid:0}},refundtip:{prev:"tuanorderdetail",url:"/webapp/tuan/refundtip",range:["tuanorderdetail"]}};return e});