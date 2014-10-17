define(['cStore', 'cBase'], function (AbstractStore, cBase) {
    var InvoiceStore = InvoiceStore || {};

    /**
    * 发票抬头 查询参数Store
    */
    InvoiceStore.InvoiceSearchStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'INVOICE_SEARCH';
            this.lifeTime = '180S';
            this.defaultData = {
                "uid": 0,
                "inIds": []
            };
            this.isUserData = true; //若用户更换帐号后，自动清除 
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });


    /**
    *  发票抬头列表 store
    */
    InvoiceStore.InvoiceListStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'INVOICE_LIST';
            this.lifeTime = '180S';
            this.isUserData = true; //若用户更换帐号后，自动清除 
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    /**
    *  发票抬头操作详情 store
    */
    InvoiceStore.InvoiceSaveStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'INVOICE_SAVE';
            this.lifeTime = '180S';
            this.defaultData = {
                "intle": '',
                "inId": [],
                "uid": 0
            };
            this.isUserData = true; //若用户更换帐号后，自动清除 
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    /**
    *  发票抬头操作详情 store
    */
    InvoiceStore.InvoiceEditStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'INVOICE_EDIT';
            this.lifeTime = '180S';
            this.defaultData = {};
            this.isUserData = true; //若用户更换帐号后，自动清除 
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    /**
    *  发票抬头列表 store
    */
    InvoiceStore.InvoiceSaveResultStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'INVOICE_RESULT';
            this.lifeTime = '180S';
            this.isUserData = true; //若用户更换帐号后，自动清除 
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    /**
    * 发票抬头 批量删除参数Store
    */
    InvoiceStore.InvoiceDeleteStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'INVOICE_DELETE';
            this.lifeTime = '180S';
            this.defaultData = {
                "uid": 0,
                "inIds": 0
            };
            this.isUserData = true; //若用户更换帐号后，自动清除 
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    /**
    * 发票抬头 查询参数Store
    */
    InvoiceStore.InvoiceDeleteResultStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'INVOICE_DELETE_RESULT';
            this.lifeTime = '180S';
            this.isUserData = true; //若用户更换帐号后，自动清除 
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    InvoiceStore.LiPinCard_InvoiceTitle = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'LiPinCard_InvoiceTitle';
            this.lifeTime = '1d';
            this.isUserData = true; //若用户更换帐号后，自动清除 
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    InvoiceStore.LiPinCard_InvoiceTitle = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'LiPinCard_InvoiceTitle';
            this.lifeTime = '1d';
            this.isUserData = true; //若用户更换帐号后，自动清除 
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    InvoiceStore.Flight_InvoiceTitle = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'Flight_InvoiceTitle';
            this.lifeTime = '1d';
            this.isUserData = true; //若用户更换帐号后，自动清除 
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    InvoiceStore.Taocan_InvoiceTitle = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'Taocan_InvoiceTitle';
            this.lifeTime = '1d';
            this.isUserData = true; //若用户更换帐号后，自动清除 
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });



    /**
    * 页面间回调抽象store
    */
    var AbstractPageCall = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.CONST_TAG = 'tag';
            this.CONST_BACKURL = 'backurl';
            this.CONST_CALLBACK = 'callback';
            this.CONST_CURVALUE = 'curvalue';
        },
        initialize: function ($super, options) {
            $super(options);
        },
        //保存的用户选中的值
        save: function (data, loadback) {
            var obj = this.get(), self = this, num = 0;
            if ($.isArray(obj.callback)) {
                $.each(obj.callback, function (i, v) {
                    self._callFunByStr(v, data, null, function () {
                        num++;
                        if (num === obj.callback.length) {
                            loadback && loadback();
                        }
                    });

                });
            } else {
                this._callFunByStr(obj.callback, data, null, function () {
                    loadback && loadback();
                });
            }
        },
        /** 
        * 设置当前的配置
        * @param backurl  返回地址
        * @param callback 取到的数据传给那个方法
        * @param curvalue  
        */
        setCurrent: function (tag, backurl, callback, curvalue,path) {
            var obj = {};
            obj[this.CONST_TAG] = tag;
            obj[this.CONST_BACKURL] = backurl;
            obj[this.CONST_CALLBACK] = callback;
            obj[this.CONST_CURVALUE] = curvalue;
            obj[this.CONST_PATH] = path;
            this.set(obj);
        },
        /**
        * 获得当前的配置
        */
        getCurrent: function () {
            return this.get();
        },
        /**
        * 获得当前的值
        */
        getValue: function (loadback) {
            var obj = this.get();
            return this._callFunByStr(obj.curvalue, null, null, loadback);
        },
        //通过字符串调用某个类的方法
        _callFunByStr: function (str, data, scope, loadback) {
            scope = scope || Store;
            var minfo = /^(?:(\w*)::)?(\w*):(\w*)$/i.exec(str), Cls, Fun;
            if (minfo && minfo.length === 4) {
                if (minfo[1]) {
                    require([minfo[1]], function (namespace) {
                        var Cls = namespace[minfo[2]];
                        var Fun = minfo[3];
                        if (Cls && Cls.getInstance) {
                            var result = (Cls.getInstance()[Fun])(data);
                            loadback && loadback(result);
                        }
                    });
                } else {
                    Cls = scope[minfo[2]];
                    Fun = minfo[3];
                    if (Cls && Cls.getInstance) {
                        var result = (Cls.getInstance()[Fun])(data);
                        loadback && loadback(result);
                        return result;
                    }
                }
            }
            return false;
        }
    });
    InvoiceStore.InvoiceURLStore = new cBase.Class(AbstractPageCall, {
        __propertys__: function () {
            this.key = 'INVOICE_URL';
            this.lifeTime = '1D';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });


    return InvoiceStore;
});
