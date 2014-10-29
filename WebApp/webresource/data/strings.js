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
            '108':  { 'index': 7, 'name': '当地特色', 'category': 'feature' }
        },
        //key为url里面的ctype，val为真实的ctype
        index2ctype: {
            '0': '0', //全部团购
            '1': '1', //酒店客房
            '2': '8', //美食
            '3': '7', //旅游度假
            '4': '6', //门票
            '5': '9'  //娱乐
        }
    };
});
