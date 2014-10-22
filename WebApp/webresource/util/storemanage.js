/**
 * @author: xuweichen
 * @date: 2014-2-18
 */
define(['TuanApp', 'TuanStore', 'CityListData'], function (TuanApp, TuanStore, CityListData, StoreManage) {
    'use strict';
    var MAX_KEYWORDS_HISTORY = 5,
        SEARCH_DISTANCE = 4, //附近团购查询的距离
        searchStore = TuanStore.GroupSearchStore.getInstance(),
        positionfilterStore = TuanStore.GroupPositionFilterStore.getInstance(), //区域筛选条件
        categoryfilterStore = TuanStore.GroupCategoryFilterStore.getInstance(),
        historyCityListStore = TuanStore.TuanHistoryCityListStore.getInstance(), //历史选择城市
        sortStore = TuanStore.GroupSortStore.getInstance(), //团购排序
        CityListStore = TuanStore.TuanCityListStore.getInstance(), //城市清单
        geolocationStore = TuanStore.GroupGeolocation.getInstance(), //经纬度信息
        historyKeySearchStore = TuanStore.TuanHistoryKeySearchStore.getInstance(),
        customFiltersStore = TuanStore.GroupCustomFilters.getInstance(), //团购自定义筛选项
        //key为url里面的ctype，val为真实的ctype
        GROUP_TYPE = {
            '0': '0', //全部团购
            '1': '1', //酒店客房
            '2': '8', //美食  餐饮娱乐
            '3': '7', //旅游度假
            '4': '6',  //门票
            '5': '9'  //娱乐
        };

    /**
    * 生成价格筛选项标题
    * @param val
    * @returns {string}
    */
    function generatePriceTitle(val) {
        var SPLITER = '-',
            UNIT = '元',
            prices = val.split('|'),
            start = prices[0],
            end = prices[1];

        if (start && end) {
            if (start > end) {
                start = end;
                end = prices[0];
            };
            return start + SPLITER + end + UNIT;
        } else if (!start) {
            return end + '以下';
        } else if (!end) {
            return start + '以上';
        };
        return '';
    };

    function generateStareTitle(val) {
        var STARS_STR = {
            '2': '二星/经济',
            '3': '三星/舒适',
            '4': '四星/高档',
            '5': '五星/豪华'
        };
        return STARS_STR[val] || '不限';
    };
    var StoreManage = {
        /**
        * 清除筛选项
        */
        clearSpecified: function (keepGroupType) {
            keepGroupType && searchStore.setAttr('sortRule', 2);
            keepGroupType && searchStore.setAttr('sortType', 0);
            !keepGroupType && customFiltersStore.remove();
            !keepGroupType && searchStore.setAttr('ctype', 0);
            !keepGroupType && searchStore.setAttr('weekendsAvailable', 0)
            positionfilterStore.remove();
            sortStore.remove();
            this.setCurrentKeyWord(false);
            searchStore.setAttr('qparams', this.getGroupQueryParam());
            searchStore.removeAttr('pos');
        },
        clearAll: function () {
            this.clearSpecified();
            searchStore.remove();
            categoryfilterStore.remove();
        },
        /**
        * 是否是选择了附近的团购
        * @return {Boolean}
        */
        isNearBy: function () {
            //return true;
            return searchStore.getAttr('nearby') || historyCityListStore.getAttr('nearby');
        },
        /**
        *@Param {int}Id 城市ID
        *@Param {string}Name 城市名称
        *@Description 添加城市选择历史记录
        */
        addHistoryCity: function (Id, Name) {
            var historyCityData = historyCityListStore.get();
            var list = [];
            if (historyCityData && historyCityData.list && $.isArray(historyCityData.list)) list = historyCityData.list;
            var obj, idx = 0;
            $.each(list, function (i, d) {
                if (d != Id) {
                    return true;
                } else {
                    obj = d;
                    idx = i;
                    return false;
                }
            })
            if (obj && obj == Id) {
                list.splice(idx, 1);
                list.unshift(Id);
            } else {
                list.unshift(Id);
                if (list.length > MAX_KEYWORDS_HISTORY) list.pop();
            }
            historyCityListStore.setAttr("list", list);
        },
        /**
        *@Param [{object}data] 城市信息集合，默认从 缓存Store中读取 。
        *@Description 在城市集合中的历史选择过的城市信息  create by zhanghd
        */
        findHistoryCity: function (data) {
            var historyCityData = historyCityListStore.get();
            var hcitylist = [];
            if (!data) {
                var CityData = CityListStore.get();
                if (!CityData) return;
                data = CityData.cities || CityData;
            }
            if (historyCityData && historyCityData.list) {
                var ni = historyCityData.list.length > 3 ? 3 : historyCityData.list.length;
                for (var st = 0; st < ni; st++) {
                    var f = false, hcity = historyCityData.list[st];
                    var cityinfo = this.findCityInfoById(hcity, data);
                    if (cityinfo) {
                        hcitylist.push(cityinfo);
                    }
                }
            }
            return hcitylist;
        },
        /**
        *@Param [{object}data] 城市信息集合，默认从 缓存Store中读取 。
        *@Description 获取城市集合中的城市数 create by zhanghd
        */
        getCityCount: function (data) {
            if (!data) {
                var CityData = CityListStore.get();
                if (!CityData) return;
                data = CityData.cities || CityData;
            };
            var citycount = 0;
            if (data && data.cities && data.cities.length > 0) {
                for (var i = 0, len = data.cities.length, Key; i < len; i++) {
                    Key = data.cities[i];
                    if (Key && Key.tag && Key.tag != "热门") {
                        citycount += Key.cities.length;
                    }
                }
            };
            return citycount;
        },
        /**
        *@Param {int}cityId 城市ID。
        *@Param [{object}data] 城市信息集合，默认从 缓存Store中读取 。
        *@Description 跟据城市id 在城市信息集合中查找城市信息（名称，团购数）  create by zhanghd
        */
        findCityInfoById: function (cityId, data, cityName) {
            //如果没有传城市列表，默认取localStorage
            var cityData;
            if (!data) {
                cityData = CityListStore.get();
                //如果没有城市列表，把cityId当正确处理
                if (!cityData) {
                    return {
                        CityID: cityId,
                        name: CityListData[cityId] || cityName,
                        cGroups: ''
                    };
                } else {
                    data = cityData.cities || cityData;
                }
            };
            for (var i = 0, olen = data.length, item; i < olen; i++) {
                item = data[i];
                if (item.tag == '热门' && item.cities) {
                    for (var j in item.cities) {
                        var c = item.cities[j];
                        if (c.id == cityId) {
                            return c;
                        }
                    }
                }
            }
            for (var i = 0, olen = data.length, item; i < olen; i++) {
                item = data[i];
                if (item.tag != '热门' && item.cities) {
                    for (var j in item.cities) {
                        var c = item.cities[j];
                        if (c.id == cityId) {
                            return c;
                        }
                    }
                }
            }
            return false;
        },
        /**
        *@Param {object}citydata 跟据定位坐标向Restful 查询到的信息。
        *@Description 设置当前定位成功的城市信息  create by zhanghd
        */
        setCurrentCity: function (citydata) {
            if (citydata) {
                var locationInfo = geolocationStore.get();
                if (locationInfo && locationInfo.gps) {
                    var ctyId = citydata.CityID || citydata;
                    var cityinfo = this.findCityInfoById(ctyId);
                    if (cityinfo) {//能在团购城市中查到
                        locationInfo.gps.CityId = citydata.CityID;
                        locationInfo.gps.CityName = cityinfo.name;
                        locationInfo.gps.Groups = cityinfo.cGroups;
                        geolocationStore.setAttr('gps', locationInfo.gps);
                        return true;
                    } else {//不能在团购城市中查到， 没有团购产品的城市就查不到了
                        if (citydata.CityID && citydata.CityName) {
                            locationInfo.gps.CityId = citydata.CityID;
                            locationInfo.gps.CityName = citydata.CityName;
                            locationInfo.gps.Groups = 0;
                            geolocationStore.setAttr('gps', locationInfo.gps);
                        }
                    }
                }
            }
            return false
        },
        /**
        *@Description 获取当前定位成功的城市信息  create by zhanghd
        */
        getCurrentCity: function () {
            var locationInfo = geolocationStore.get();
            if (locationInfo && locationInfo.gps && +locationInfo.gps.CityId > 0) {
                return locationInfo.gps;
            }
            return false
        },
        /**
        *@Param {int} id id值
        *@Param {string} name 名称
        *@Param {int} keyType 关键词类型
        *@Description 添加历史关键词搜索记录 create by zhanghd
        */
        addHistoryKeyWord: function (id, name, keyType) {
            var historyCityData = historyKeySearchStore.get();
            var positionType = positionfilterStore.getAttr('type');
            var list = [];
            var obj, idx = 0;
            if (historyCityData && historyCityData.list && $.isArray(historyCityData.list)) {
                list = historyCityData.list;
            }
            $.each(list, function (i, d) {
                if (d.id != id) {
                    return true;
                } else {
                    obj = d;
                    idx = i;
                    return false;
                }
            });
            if (obj && obj.id == id) {
                list.splice(idx, 1);
                list.unshift({ id: id, word: name, type: keyType });
            } else {
                list.unshift({ id: id, word: name, type: keyType });
                if (list.length > MAX_KEYWORDS_HISTORY) list.pop();
            }
            historyKeySearchStore.remove();
            historyKeySearchStore.setAttr('list', list);
            this.setCurrentKeyWord({ id: id, word: name, type: keyType });

            //移除位置区域里面重复的条件
            if ((positionType == '-1' || positionType == '5') && (keyType == 'zone' || keyType == 'markland')) {
                positionfilterStore.remove();
            }
            if (positionType == '4' && keyType == 'location') {
                positionfilterStore.remove();
            }
        },
        /**
        *@Description 获取历史关键词搜索记录集合 create by zhanghd
        */
        getHistoryKeyWord: function () {
            var historyCityData = historyKeySearchStore.get();
            var hcitylist = [];
            if (historyCityData && historyCityData.list) {
                hcitylist = historyCityData.list;
            }
            return hcitylist;
        },
        /**
        *@Param {string}key 名称
        *@Description 设置当前搜索关键词 create by zhanghd
        */
        setCurrentKeyWord: function (key) {
            historyKeySearchStore.setAttr("key", key);
        },
        /**
        *@Description 移除当前搜索关键词
        */
        removeCurrentKeyWord: function() {
            historyKeySearchStore.removeAttr("key");
        },
        /**
        *@Description 获取当前搜索关键词 create by zhanghd
        */
        getCurrentKeyWord: function () {
            var historyCityData = historyKeySearchStore.get();
            if (!historyCityData) return false;
            return historyCityData.key;
        },
        getGroupQueryParam: function () {
            var qparams = [];
            var customdata = customFiltersStore.get();
            var positionData = positionfilterStore.get();

            //价格
            var price = customdata && customdata.price && customdata.price.val;
            if (price) {
                qparams.push({ type: 1, value: price });
            }

            //星级
            var star = customdata && customdata.star;
            if (star && !$.isEmptyObject(star)) {
                var arr = [], k;
                for (var k in star) {arr.push(k)}
                qparams.push({ type: 2, value: arr.join(',') });
            }

            //品牌
            var brand = customdata && customdata.brand && customdata.brand.val;
            if (brand) {
                qparams.push({ type: 3, value: brand });
            }

            //特色
            var trait = customdata && customdata.trait && customdata.trait.val;
            if (trait) {
                qparams.push({ type: 14, value: trait });
            }

            //距离
            var loc = geolocationStore.get() && geolocationStore.get().gps; //this.getCurrentCity();
            var distance = customdata && customdata.distance && customdata.distance.val;
            if (historyCityListStore.getAttr('nearby') && loc) {
                qparams.push({
                    type: 9,
                    value: loc.lat + '|' + loc.lng + (distance ? ('|' + distance) : '')
                });
            } else if (distance){
                qparams.push({ type: 9, value: distance });
            }

            //天数
            var day = customdata && customdata.day && customdata.day.val;
            if (day) {
                qparams.push({ type: 14, value: day });
            }

            //多店通用
            var multiShopData = customdata && customdata.multiShop;
            if (multiShopData == 1) {
                qparams.push({
                    type: 14,
                    value: "102|10201"
                });
            }

            //代金券
            var voucher = customdata && customdata.voucher;
            if (voucher == 1) {
                qparams.push({
                    type: 14,
                    value: "102|10202"
                });
            }

            //团购类型（二级分类）
            var categoryData = categoryfilterStore.get();
            if (categoryData && categoryData.subVal) {
                qparams.push({ type: 14, value: categoryData.subVal });
            }

            //位置区域查询条件
            positionData = positionData ? positionData : { type: '', val: '' };
            if (positionData && positionData.type && +positionData.type > 0 && positionData.val && positionData.val != '') {
                qparams.push({
                    type: positionData.type,
                    name: positionData.name,
                    value: positionData.val
                });
            }

            //关键词搜索切选择后，历史查询记录应置为默认值
            var keywordData = this.getCurrentKeyWord();
            if (keywordData) {
                var keyType = (keywordData.type || '').toString().toLowerCase();
                var keyValue = keywordData.id || keywordData.word;
                var traType = {
                    'hotelid': 18,
                    'zone': 5,  //商业区
                    'hotelgroupid': 3,
                    'location': 4,  //行政区
                    'activity': 11, //活动
                    'district': 16, //景区
                    'markland': 17  //地标
                };
                if (keyType) {
                    if (/\D/.test(keyType)) { //keyType不是数字，才需要转换
                        if (traType[keyType]) {
                            keyType = traType[keyType];
                        } else {
                            keyType = 7; //关键字
                        }
                    }
                } else {
                    keyType = 7; //关键字
                }

                qparams.push({
                    type: keyType,
                    value: keyValue
                });
            }
            return qparams;
        },
        /**
        * 保存URL中的查询条件到localStorage
        */
        saveQueryString: function (callback) {
            var getQuery = Lizard.P,
                groupType = getQuery('ctype'), //团购类型
                price = getQuery('price'), //价格
                star = getQuery('star'), //星级
                kwd = getQuery('kwd'), //关键词

                place = getQuery('place'),
                lat = getQuery('lat'),
                lon = getQuery('lng') || getQuery('lon'), //兼容老版本，推荐lng
                cityId = getQuery("cityid"),
                cityName = getQuery('cityname'),
                sort = getQuery('sort');

            //如果传了cityid清空所有信息，当作切换城市查询
            if (cityId && (cityId != searchStore.getAttr('ctyId'))) {
                this.clearAll();
                //清除城市选择历史
                historyCityListStore.remove();
            };
            if (cityId) {
                searchStore.setAttr('ctyId', cityId);
                if (cityName) {
                    searchStore.setAttr('ctyName', cityName);
                } else if (CityListData[cityId]) {
                    searchStore.setAttr('ctyName', CityListData[cityId]);
                }
            };

            //我的附近
            if (lat && +lat > 0 && lon && +lon > 0 && place && place != "") {
                geolocationStore.setAttr('gps', {
                    "address": place,
                    "location": lon + "," + lat,
                    "city": cityName,
                    "lng": +lon,
                    "lat": +lat
                });
                this.setCurrentCity({ CityID: cityId });
                historyCityListStore.setAttr('nearby', true);

                this.addHistoryCity(cityId, cityName);
                var qparams = searchStore.getAttr('qparams') || [];
                //清除qparams里面已有的距离参数
                for (var i = 0, l = qparams.length; i < l; i++) {
                    if (qparams[i].type == 9) {
                        qparams.splice(i, 1);
                        break;
                    }
                }
                qparams.push({type: 9, value: lat + '|' + lon + '|' + SEARCH_DISTANCE });
                searchStore.setAttr('qparams', qparams);
            };

            //团购类型接收
            if (groupType) {
                categoryfilterStore.remove();
                searchStore.setAttr('ctype', GROUP_TYPE[groupType]);
            };

            //星级筛选(酒店客房时，传star才有效)
            if (star && groupType == 1) {
                customFiltersStore.setAttr('star', star.replace(',', '|'));
            };
            //价格筛选
            if (price) {
                customFiltersStore.setAttr('price', price);
            };
            //关键词 kwd={name}|{id}|{type}
            if (kwd) {
                kwd = kwd.split('|');
                this.addHistoryKeyWord(kwd[1], kwd[0], kwd[2]);
            };
            //排序 sort={sortRule}|{sortType}
            if (sort) {
                sort = sort.split('|');
                searchStore.setAttr('sortRule', sort[0]);
                searchStore.setAttr('sortType', sort[1] || 1);
            };

            callback && callback();
        },
        /**
        * 根据cityName获取cityid,从落地的JS数据中查找
        */
        getCityIdByName: function (cityName) {
            var cityid;
            if (cityName) {
                cityid = CityListData[cityName];
            };
            return false;
        }
    };
    return StoreManage;
});
