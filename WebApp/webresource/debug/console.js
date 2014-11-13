/**
 * Created by li.xx on 14-11-12.
 * @contact li.xx@ctrip.com
 * @description
 */
define(['libs', 'c', 'cUtility'], function(libs, c, Util){

    var $main = $('#main'),
        $body = $('body'),
        DEBUG_KEY = 'IS_TUAN_DEBUG';

    function ConsoleDebug(options) {
        var d = {
            btn: '<i style="position:fixed;bottom:300px;color:green;z-index:9999;">CL</i>',
            div: '<div style="position:fixed;bottom:290px;z-index:10000;display:none;"><button class="J_clearStorage btn_blue"> Clear</button><div class="J_debugLogSwitch"></div></div>',
            conBox: '<div class="J_logContent" style="position: fixed;bottom:100px;z-index: 10001;height:180px;width: 100%;display: none;"><i>****</i><textarea style="width: 100%;height: 100%;"></textarea></div>'
        };
        this.opt = $.extend(d, options);
        this.init();
    }

    ConsoleDebug.prototype = {
        init: function() {
            if (this._isDevEnv()) {
//                this.btn = $(this.opt.btn).appendTo($main);

                window._log = function(s) {
                    var $text = this.consoleBox.find('textarea');
                    $text.html($text.html() ? $text.html() + '\n' + JSON.stringify(s) : JSON.stringify(s));
                }.bind(this);
            }
            this.renderHtml();
            this.showMask();
            this.renderConsoleBox();
            this._bindEvents();
            this.clearAds();
        },
        _isDevEnv: function() {
            var hasClear = false, env;
            if (Util.isInApp()) {
                //Hybrid， 非生产环境
                env = Util.isPreProduction();
                if (env === '0' || env === '1' || env === '2') {
                    hasClear = true;
                }
            } else {
                //H5, 非生产环境
                if (!location.host.match(/^(m|3g|wap)\.ctrip\.com/i)) {
                    hasClear = true;
                }
            }

            return hasClear;
        },
        _bindEvents: function() {
            var self = this;
            this.btn && this.btn.on('click', function() {
                self.renderHtml();
                self.showMask();
            });

            $main.on('click', '.J_clearStorage', function() {
                self.clearLocal();
                self.showToast('Clear', 1, function() {
                    self.reset();
                });
            });

            $body.on('click', '.J_logContent i', function() {
                self.consoleBox.hide();
                localStorage.setItem(DEBUG_KEY, false);
            });

        },
        showToast: function(msg, time, fun) {
            !this.toast && (this.toast = new c.ui.Toast());
            this.toast.show(msg, time || 1, fun);
        },
        showMask: function($dom) {
            var self = this;
            !this.mask && (this.mask = new c.ui.Mask({
                onCreate: function() {
                    this.root.on('click', function() {
                        self.reset();
                    });
                }
            }));
            this.mask.show();
        },
        hideMask: function() {
            this.mask && this.mask.hide();
        },
        renderHtml: function() {
            var self = this;
            if (!this.div) {
                this.div = $(this.opt.div).appendTo($main);
                this.switch = new c.ui.cuiSwitch({
                    rootBox: $('.J_debugLogSwitch'),
                    checked: this.getStatusLocal() ? true : false,
                    changed: function () {
                        localStorage.setItem(DEBUG_KEY, this.getStatus());
                        self.switchConsoleBox(this.getStatus());
                    }
                });
            }
            this.switch[this.getStatusLocal() ? 'checked' : 'unChecked']();
            this.div.show();
        },
        clearLocal: function() {
            var isDebug = localStorage.getItem(DEBUG_KEY);
            localStorage && localStorage.clear();
            localStorage.setItem(DEBUG_KEY, isDebug);
        },
        clearAds: function() {
            //测试提的需求： 测试环境中清空footer里的广告
            var fn = setInterval(function() {
                var ads = $('.dl_panel-bg .dl_btn-close');
                if (ads && ads.length) {ads.trigger('click');clearInterval(fn);}
            }, 100);
        },
        renderConsoleBox: function() {
            this.consoleBox = $(this.opt.conBox).appendTo($body);
            this.consoleBox[this.getStatusLocal() ? 'show': 'hide']();
        },
        switchConsoleBox: function(flag) {
            this.consoleBox[flag? 'show': 'hide']();
            this.reset();
        },
        reset: function() {
            this.hideMask();
            this.div && this.div.hide();
        },
        getStatusLocal: function() {
            var a = localStorage.getItem(DEBUG_KEY);
            return (!a || a == 'false') ? false : true;
        },
        show: function() {
            this.switch && this.switch[this.getStatusLocal() ? 'checked' : 'unChecked']();
            this.showMask();
            this.div.show();
        }
    };

    return ConsoleDebug;

});