define([], function () {

    var C = {
        //团购首页
        'home': {
            'prev': '',
            'url': '/webapp/tuan/home',
            'range': []
        },
        //列表页
        'list': {
            'prev': 'home',
            'url': '/webapp/tuan/list',
            'range': ['home']
        },
        //彩票页
        'lottery':{
            'prev':'home',
            'url':'/webapp/tuan/lottery',
            'range':['home']
        },
        'localfeature': {
            'prev': 'home',
            'url': '/webapp/tuan/localfeature',
            'range': ['home']
        },
        'listmap': {
            'prev': 'list',
            'url': '/webapp/tuan/listmap',
            'range': ['list']
        },
        //详情页
        'detail': {
            'prev': 'list',
            'url': '/webapp/tuan/detail/{did}.html?cityid={cityid}',
            'range': ['list','detail','home','nearlist','tuanorderdetail','listmap','bookingsuccess'],
            'params': {
                'did': 0,
                'cityid':0
            }
        },
        //详情页温馨提示
        'detailtips': {
            'prev': 'detail',
            'url': '/webapp/tuan/detailtips',
            'range': ['detail']
        },
        //酒店图文详情
        'lashou': {
            'prev': 'list',
            'url': '/webapp/tuan/lashou/{pid}.html',
            'range': ['detail'],
            'params': {
                'pid': 0               
            }
        },
        //城市列表
        'citylist':{
            'prev':'home',
            'url': '/webapp/tuan/citylist',
            'range': []
        },
        //详情页图片列表
        'hotelimages': {
            'prev': 'detail',
            'url': '/webapp/tuan/hotelimages/{did}.html',
            'range': ['detail'],
            'params': {
                'did': 0                
            }
        },
        //详情页图片列表
        'hotelimageslide': {
            'prev': 'hotelimages',
            'url': '/webapp/tuan/hotelimageslide?index={imgindex}',
            'range': ['hotelimages'],
            'params': {
                'imgindex': 1
            }
        },
        //详情页图片列表
        'hotelcomments': {
            'prev': 'detail',
            'url': '/webapp/tuan/hotelcomments',
            'range': ['detail']
        },
        //优惠服务
        'hotelservice': {
            'prev': 'detail',
            'url': '/webapp/tuan/hotelservice',
            'range': ['detail']
        },
        //团购温馨提示
        'detailtips': {
            'prev': 'detail',
            'url': '/webapp/tuan/detailtips',
            'range': ['detail']
        },
        //酒店地图
        'hotelmap': {
            'prev': 'detail',
            'url': '/webapp/tuan/hotelmap?lon={lon}&lat={lat}&hotelName={hotelname}',
            'range': ['detail','tuanorderdetail','hotelsubbranch'],
            'params': {
                'lon': 0,
                'lat': 0,
                'hotelname': ''
            }
        },
        //酒店地图导航
        'hotelmapnav': {
            'prev': 'hotelmap',
            'url': '/webapp/tuan/hotelmapnav?url={url}',
            'range': ['hotelmap'],
            'params': {'url': ''}
        },
        //团购预定页
        'booking': {
            'prev': 'detail',
            'url': '/webapp/tuan/booking',
            'range': ['detail']            
        },
        //预定完成页
        'bookingsuccess':{
            'prev': 'list',
            'url': '/webapp/tuan/bookingsuccess/{orderid}.html',
            'range': ['list'],
            'params': {
                'orderid': 0
            }
        },
        //使用优化券
        'coupon': {
            'prev': 'booking',
            'url': '/webapp/tuan/coupon',            
            'range': ['booking']
        },
        //发票
        'invoice': {
            'prev': 'booking',
            'url': '/webapp/tuan/invoice',           
            'range': ['booking']
        },
        //商户列表
        'hotelsubbranch': {
            'prev': 'detail',
            'url': '/webapp/tuan/hotelsubbranch',
            'range': ['detail']
        },
        //关键字搜索
        'keywordsearch': {
            'prev': 'home',
            'url': '/webapp/tuan/keywordsearch',
            'range': ['home','list']
        },
        //周边团购
        'nearlist':{
            'prev':'detail',
            'url': '/webapp/tuan/nearlist',
            'range': ['detail','bookingsuccess','tuanorderdetail']
        },
        //订单详情页
        'tuanorderdetail': {
            'prev': 'home',
            'url': '/webapp/tuan/tuanorderdetail/{orderid}.html',
            'range': ['home','bookingsuccess'],
            'params': {
                'orderid': 0
            }
        },
        'refund':{
            'prev': 'home',
            'url': '/webapp/tuan/refund/{orderid}.html',
            'range': ['home','tuanorderdetail'],
            'params': {
                'orderid': 0
            }
        },
        'refundtip':{
            'prev': 'tuanorderdetail',
            'url': '/webapp/tuan/refundtip',
            'range': ['tuanorderdetail']
        }
    };
    return C;
});
