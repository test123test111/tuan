/**
 * @author: junyizhang
 * @date: 2014/10/24 15:30
 * @descriptions 首页、列表、关键词等页面公用的数据
 */
define(function () {
    var distance = 4; //附近团购查询的距离
    return {
        SEARCH_DISTANCE: distance,
        SEARCH_DISTANCE_TEXT: distance + '公里内',
        MAP_SOURCE_ID: 3,
        MAX_KEYWORDS_HISTORY: 5,
        CITY_CENTER: '市中心',
        defaultCity: {
            id: 2,
            name: '上海'
        },
        priceText: {
             '0|99':        '&yen; 100 以下',
             '100|250':     '&yen; 100-250',
             '250|400':     '&yen; 250-400',
             '400|600':     '&yen; 400-600',
             '601|':        '&yen; 600 以上',
             '0|1999':      '&yen; 2000 以下',
             '2000|3000':   '&yen; 2000-3000',
             '3001|':       '&yen; 3000 以上'
        },
        traitText: {
            '103|101':      '一元酒店',
            '103|10303':    '别墅轰趴',
            '103|10304':    '住店游玩',
            '103|10305':    '情侣酒店'
        },
        starText: {
            '2': '二星/经济',
            '3': '三星/舒适',
            '4': '四星/高档',
            '5': '五星/豪华'
        },
        groupType: {
            '0':    { 'index': 0, 'name': '全部团购', 'category': 'all' },
            '1':    { 'index': 1, 'name': '酒店', 'category': 'hotel' },
            '8':    { 'index': 2, 'name': '美食', 'category': 'catering' },
            '7':    { 'index': 3, 'name': '旅游度假', 'category': 'vacation' },
            '6':    { 'index': 4, 'name': '门票', 'category': 'ticket' },
            '9':    { 'index': 5, 'name': '娱乐', 'category': 'entertainment' },
            '106':  { 'index': 6, 'name': '一元团购', 'category': 'onepaygroup' },
            '108':  { 'index': 7, 'name': '城市诱惑', 'category': 'feature' }
        },
        //key为url里面的ctype，val为真实的ctype
        index2ctype: {
            '0': '0', //全部团购
            '1': '1', //酒店客房
            '2': '8', //美食
            '3': '7', //旅游度假
            '4': '6', //门票
            '5': '9'  //娱乐
        },
        traType: {
            'hotelid': 18,
            'zone': 5,  //商业区
            'hotelgroupid': 3,
            'location': 4,  //行政区
            'activity': 11, //活动
            'district': 16, //景区
            'markland': 17  //地标
        },
        /*
         商业区 位置
         行政区 位置
         机场   机场
         火车站 火车站
         地铁站  地铁站
         品牌   名称
         产品名称  名称
         地标 位置
         主题   名称
         景点  位置
         */
        typeToName: {
            'zone': '位置',
            'location': '位置',
            'district': '位置',
            'markland': '位置',//地标
            'attractions': '位置',//景点
            'airport': '机场',
            'railwaystation': '火车站',
            'subway': '地铁站',
            'brand': '名称',//品牌
            'productname': '名称',//产品名称
            'theme': '名称',//主题
            'hotelid': '名称',
            'hotelgroupid': '名称'
        }
    };
});
