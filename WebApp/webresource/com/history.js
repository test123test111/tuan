define(['c', 'cStore', 'PageTreeConfig'], function (c, cStore, PageTreeConfig) {
    /**************************************
    * create by ouxz 2014/7/21
    */
    var cBase = c.base;
    function isEmpty(o) {
        return o === null || o === undefined;
    }

    /**************************************
    * 期望的页面树
    */
    function PageTree(cfg) {
        this.data = {};
        for (var i in cfg) {
            if (cfg[i]) this.add(i, cfg[i].url, cfg[i].prev, cfg[i].jump, cfg[i].range, cfg[i].params);
        }
    }
    var braketReg = /\{([^\{\}]+)\}/g;
    PageTree.prototype = {
        constructor: PageTree,
        buildNode: function (id, url, prev, jump, range, params) {
            return {
                id: id,
                prev: prev,
                url: url,
                jump: jump || false,
                range: range,
                params: params || {}
            };
        },
        add: function (id, url, prev, jump, range, params) {
            this.data[id] = this.buildNode(id, url, prev, jump, range, params);
        },
        getNode: function (id, params) {
            var curNode = this.data[id];

            if (!curNode) return null;

            var url = curNode.url || '',
                prevParam = curNode.param || {};
            params = params || {};
            var reurl = (curNode.url || '').replace(braketReg, function (a, b) {

                return !isEmpty(params[b]) ? params[b] : (!isEmpty(prevParam[b]) ? prevParam[b] : '');
            });

            return {
                id: curNode.id,
                prev: curNode.prev,
                url: curNode.url,
                reurl: reurl,
                jump: curNode.jump,
                range: curNode.range
            }
        },
        getPrevNode: function (id, params) {
            var curNode = this.data[id],
                prevNode = curNode && curNode.prev && this.data[curNode.prev] && this.data[curNode.prev];
            if (!prevNode) return null;
            params = params || {};
            var prevParam = prevNode.params || {};
            var prevurl = (prevNode.url || '').replace(braketReg, function (a, b) {

                return !isEmpty(params[b]) ? params[b] : (!isEmpty(prevParam[b]) ? prevParam[b] : '');
            });
            return {
                id: prevNode.id,
                url: prevNode.url,
                prevurl: prevurl,
                prev: prevNode.prev,
                jump: prevNode.jump,
                range: prevNode.range
            };
        }
    };
    //lizerd1.1 页面结构定义
    var tree1 = new PageTree(PageTreeConfig);

    /***************************************
    * 历史栈
    */
    //用于保存历史
    var HistoryStackStore = new cBase.Class(cStore, {
        __propertys__: function () {
            this.key = 'P_TUAN_HISTORY_STACK';
            this.lifeTime = '30D';
            this.isUserData = true;
        },
        initialize: function ($super, options) {
            $super(options);
        },
        pop: function () {
            var data = this.getAttr('history') || [],
                ent = data.pop();
            this.setAttr('history', data);
            return ent;
        },
        push: function (obj, replace) {
            var data = this.getAttr('history') || [],
                max = Math.max(0, data.length - 1);
            if (replace) {
                data[max] = obj;
            } else {
                data.push(obj);
            }
            this.setAttr('history', data);
        },
        top: function () {
            var data = this.getAttr('history') || [],
                max = Math.max(0, data.length - 1);
            return data[max];
        },
        length: function () {
            var data = this.getAttr('history');
            return data && data.length || 0;
        },
        clear: function () {
            this.setAttr('history', []);
        },
        index: function (index) {
            var data = this.getAttr('history') || [];
            index = index < 0 ? data.length + index : index;
            return data[index];
        },
        addCache: function (id, obj, replace) {
            var data = {
                id: id,
                obj: obj,
                replace: replace
            };
            this.setAttr('cache', data);
        },
        getCache: function () {
            return this.getAttr('cache') || {};
        },
        clearCache: function () {
            this.setAttr('cache', {});
        },
        popById: function (id) {
            var data = this.getAttr('history') || [],
                index = -1, len = 0, result = null;
            for (var i = data.length - 1; i > -1; i--) {
                len++;
                if (data[i].id === id) {
                    index = i;
                    break;
                }
            }
            if (index > -1) {
                result = data.splice(index, len);
            }
            this.setAttr('history', data);
            return result;
        },
        addSequeHistory: function (obj) {
            var data = this.getAttr('sequehistory') || [];
            var max = Math.max(0, data.length - 1);
            var last = data[max] || {};
            if (last.id === obj.id) return;
            if (data.length > 10) {
                data.splice(0, 3);
            }
            data.push(obj);
            this.setAttr('sequehistory', data);
        },
        getSequeTop: function (id) {
            var data = this.getAttr('sequehistory') || [];
            var max = Math.max(0, data.length - 1);
            var d = null;
            if (data[max]) {
                if (data[max].id != id) {
                    d = data[max];
                } else if (data[max - 1]) {
                    d = data[max - 1];
                }
            }
            return d;
        }
    });

    function HistoryStack() {
        this.stack = HistoryStackStore.getInstance();
    }

    HistoryStack.prototype = {
        constructor: HistoryStack,
        push: function (id, url, ver, replace) {
            this.stack.addCache(id, HistoryStack.buildEntry(id, url, ver), replace);
        },
        confirmPush: function (id) {
            var data = this.stack.getCache();
            if (data.id === id) {
                this.stack.push(data.obj, data.replace);
                this.stack.clearCache();
            }
        },
        pop: function () {
            return this.stack.pop();
        },
        top: function () {
            return this.stack.top();
        },
        index: function (index) {
            return this.stack.index(index);
        },
        clear: function () {
            this.stack.clear();
        },
        getCache: function () {
            return this.stack.getCache();
        },
        clearCache: function () {
            this.stack.clearCache();
        },
        /**
        * 从栈顶开始向下查找id，找到则弹出id所在的位置到栈顶
        */
        popById: function (id) {
            return this.stack.popById(id);
        },
        addSequeHistory: function (obj) {
            this.stack.addSequeHistory(obj);
        },
        getSequeTop: function (id) {
            return this.stack.getSequeTop(id);
        }
    };


    HistoryStack.buildEntry = function (id, url, ver) {
        return {
            id: id,
            url: url,
            ver: ver
        };
    }


    var __FROM = '_____FROM_____';

    /***************************************
    * 历史对象
    */


    var History = function (tree, stack) {
        this.tree = tree;
        this.stack = stack;

    };

    History.prototype = {
        constructor: History,
        /**
        * 返回前一页
        * @param id {String} 当前的id
        * @param params {Object} 替换默认url中参数
        * @return url {String} 上一页的url
        */
        back: function (id, params) {
            var top = this.stack.pop(),
                prev = this.stack.top(),
                prevnode = this.tree.getPrevNode(id, params),
                node = this.tree.getNode(id),
                url = '';
            var range = node.range || [];
            if (prev && prev.id === __FROM) {
                this.stack.addSequeHistory({ id: id, url: url });
                //退栈
                this.stack.pop();
                return {
                    fullurl: prev.url,
                    url: prev.url.replace(/^[^#]+#/g, '').replace(/^#+/g, ''),
                    jump: true
                };
            }
            var jump = false, id;
            if (top && top.id === id && prev && prev.id && (!range.length || _.indexOf(range, prev.id) > -1)) {
                url = prev.url;
                jump = top.ver !== prev.ver || node.jump;
                id = prev.id;
            } else {
                url = prevnode.prevurl;
                jump = !!node.jump;
                id = prevnode.id;
                this.stack.clear();
            }
            this.stack.addSequeHistory({ id: id, url: url });
            return {
                fullurl: url,
                url: url.replace(/^[^#]+#/g, '').replace(/^#+/g, ''),
                jump: jump,
                id: id
            };
        },
        /**
        * 从栈顶开始向下查找id，找到则弹出id所在的位置到栈顶
        */
        popById: function (id) {
            return this.stack.popById(id);
        },
        /**
        * 历史向前
        * @param id {String} 下一页id
        * @param url {String} 下一页的url
        * @param data {Object} 记录额外的信息
        * @return url {String} 下一页的url
        */
        forward: function (id, url, ver, replace) {
            if (typeof url === 'object') {
                var node = this.tree.getNode(id, url);
                url = node.reurl;
            }
            this.stack.push(id, url, ver, replace);
            this.stack.addSequeHistory({ id: id, url: url });
            return url;
        },
        /**
        * 确认forward提交的内容
        * @param id {String} 要确认的id
        */
        confirmForward: function (id) {
            this.stack.confirmPush(id);
            //console.log(this.stack.stack.get());
        },
        /**
        * 获得业务的上一页
        */
        getLastView: function () {
            var sc = this.stack.getCache() || {};
            var last, node
            if (sc.id) {
                last = this.stack.top();
            } else {
                last = this.stack.index(-2);
            }
            return last;
        },
        //获得最近的一页
        getLatelyView: function (id) {
            var d = this.stack.getSequeTop(id);
            return d ? d.id : null;
        },

        //主动添加历史记录
        //当发现历史栈的顶部不是当前页，则压入栈
        addHistory: function (id, url, ver) {
            var sc = this.stack.getCache() || {};
            //当cache中id跟当前页不一样，则清空cache 
            if (sc.id && sc.id !== id) {
                this.stack.clearCache();
            }

            var last = this.stack.top();
            var from = this._getFromByUrl(url);
            if (!last || last.id !== id || from) {
                if (from) {
                    this.clearHistory();
                    this.stack.push(__FROM, from);
                    this.stack.addSequeHistory({ id: __FROM, url: from });
                    this.confirmForward(__FROM);
                }
                this.stack.push(id, url, ver);
                this.stack.addSequeHistory({ id: id, url: url });
                this.confirmForward(id);
            }
        },
        //清空历史
        clearHistory: function (id, url, ver) {
            this.stack.clear();
            if (id && url) {
                this.addHistory(id, url, ver);
            }
        },
        //判断上一页是不是from来的
        isPrevPageOrigin: function () {
            var t = this.getLastView();
            return t && t.id === __FROM;
        },
        switchTree: function (tree) {
            this.tree = tree;
        },
        //获得合法的from地址
        _getFromByUrl: function (url) {
            var F = 'from';
            var u = (url || '').split(/#+/g);
            var href = u[0],
                hash = u[1] || '',
                fd = null;
            if (href.indexOf(F) > -1) {
                var hrefMap = this._getQueryString(href);
                if (hrefMap[F]) fd = hrefMap[F];
            }
            if (hash.indexOf(F) > -1) {
                var hashMap = this._getQueryString(hash);
                if (hashMap[F]) fd = hashMap[F];
            }
            if (fd) fd = decodeURIComponent(fd);
            if (fd && !fd.match(/^\s*(?:http|\/)/)) {
                fd = null;
            }

            return fd;
        },
        _getQueryString: function (url) {
            var u = (url || '').split('?');
            u.shift();
            var u = u.join('?').split(/(?!\?[^?]*)&/g),
                k = {}, t;
            for (var i = 0, len = u.length; i < len; i++) {
                t = u[i].split('=');
                k[t.shift()] = t.join('=');
            }
            return k;
        }
        /*,
        //切换到lizerd1.1的页面树
        switchTreeByLizerd11: function () {
        this.switchTree(tree1);
        },
        //切换包lizerd2.0的页面树
        switchTreeByLizerd20: function () {
        this.switchTree(tree2);
        }*/
    };

    var history = new History(tree1, new HistoryStack());

    return history;
});
