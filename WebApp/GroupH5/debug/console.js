/**
 * Created by li.xx on 14-11-12.
 * @contact li.xx@ctrip.com
 * @description
 */
define(['libs', 'c', 'cUtility'], function(libs, c, Util){

    var $main = $('#main'),
        $body = $('body'),
        WWW = {user: '{"value":{"UserID":"21634352BAC43044380A7807B0699491","LoginName":"","IsNonUser":false,"UserName":"qwg测","Mobile":"13612300125","BMobile":"13612300125","Address":"ctrip shanghai","Birthday":"19850823","Experience":513857623,"Gender":1,"PostCode":"","VipGrade":30,"VipGradeRemark":"钻石贵宾","Email":"shhu@ctrip.com","ExpiredTime":"/Date(-62135596800000-0000)/","Auth":"6D95370F6BD15BBC7FEE38F11C1E2D58233905E7ED550A7394C958D73B3B5933"},"oldvalue":null,"timeout":"2014/11/26 10:54:26","savedate":"2014/10/27 10:54:26"}', userinfo:'{"data":{"UserID":"21634352BAC43044380A7807B0699491","LoginName":"","IsNonUser":false,"UserName":"qwg测","Mobile":"13612300125","BMobile":"13612300125","Address":"ctrip shanghai","Birthday":"19850823","Experience":513857623,"Gender":1,"PostCode":"","VipGrade":30,"VipGradeRemark":"钻石贵宾","Email":"shhu@ctrip.com","ExpiredTime":"/Date(-62135596800000-0000)/","Auth":"6D95370F6BD15BBC7FEE38F11C1E2D58233905E7ED550A7394C958D73B3B5933"},"timeout":"2014-11-26 10:50:55"}'},
        XIAOLI = {user: '{"value":{"UserID":"AEFF51E4F9EA6CCBA42E11736E72441C","LoginName":"","IsNonUser":false,"UserName":"xiaoli-FAT","Mobile":"13023112562","BMobile":"","Address":"","Birthday":"19210101","Experience":1200,"Gender":2,"PostCode":"","VipGrade":0,"VipGradeRemark":"普通会员","Email":"chen.xiaoli@ctrip.com","ExpiredTime":"/Date(-62135596800000-0000)/","Auth":"22489D878AF6215DED9BAB44EE3AB2D7CFE94333D4E38D59DF80561A3E5DD066"},"oldvalue":null,"timeout":"2014/12/14 10:11:42","savedate":"2014/11/14 10:11:42"}', userinfo: '{"data":{"UserID":"AEFF51E4F9EA6CCBA42E11736E72441C","LoginName":"","IsNonUser":false,"UserName":"xiaoli-FAT","Mobile":"13023112562","BMobile":"","Address":"","Birthday":"19210101","Experience":1200,"Gender":2,"PostCode":"","VipGrade":0,"VipGradeRemark":"普通会员","Email":"chen.xiaoli@ctrip.com","ExpiredTime":"/Date(-62135596800000-0000)/","Auth":"22489D878AF6215DED9BAB44EE3AB2D7CFE94333D4E38D59DF80561A3E5DD066"},"timeout":"2014-12-12 20:38:51"}'},
        NORMAL = {user: '{"value":{"UserID":"FCA154F6235E2ECF665F5DFE71D4D5B1","LoginName":"","IsNonUser":false,"UserName":"","Mobile":"","BMobile":"","Address":"","Birthday":"00010101","Experience":1200,"Gender":2,"PostCode":"","VipGrade":0,"VipGradeRemark":"普通会员","Email":"daihy@ctrip.com","ExpiredTime":"/Date(-62135596800000-0000)/","Auth":"7B5C33A12EE614DE6656E23ABD8897D505C1DE90901325518281D46C2D640A85"},"oldvalue":null,"timeout":"2014/12/14 15:38:25","savedate":"2014/11/14 15:38:25"}', userinfo: '{"data":{"UserID":"FCA154F6235E2ECF665F5DFE71D4D5B1","LoginName":"","IsNonUser":false,"UserName":"","Mobile":"","BMobile":"","Address":"","Birthday":"00010101","Experience":1200,"Gender":2,"PostCode":"","VipGrade":0,"VipGradeRemark":"普通会员","Email":"daihy@ctrip.com","ExpiredTime":"/Date(-62135596800000-0000)/","Auth":"7B5C33A12EE614DE6656E23ABD8897D505C1DE90901325518281D46C2D640A85"},"timeout":"2014-12-14 15:38:22"}'},
        DEBUG_KEY = 'IS_TUAN_DEBUG';

    function ConsoleDebug(options) {
        var d = {
            btn: '<i style="position:fixed;bottom:300px;color:green;z-index:9999;">CL</i>',
            div: '<div style="position:fixed;bottom:290px;z-index:10000;display:none;width: 100%;"><button class="J_clearStorage">Clear</button><button class="J_xiaoli">Xiaoli</button><button class="J_www">www</button><button class="J_normal">Normal</button><button class="J_noOne">None</button><button class="J_reload">Reload</button><div class="J_debugLogSwitch"></div></div>',
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

            $main.on('click', 'button', function(e) {
                var $this = $(e.target),
                    msg;
                if ($this.hasClass('J_xiaoli')) {
                    msg = '已切换为小丽登陆！';
                    self.setUserLogin(XIAOLI);
                } else if ($this.hasClass('J_noOne')){
                    msg = '已切换为无用户登陆！';
                    self.setUserLogin();
                } else if ($this.hasClass('J_www')) {
                    msg = '已切换为www用户登陆';
                    self.setUserLogin(WWW);
                } else if ($this.hasClass('J_normal')) {
                    msg = '已切换为普通账户登录';
                    self.setUserLogin(NORMAL);
                } else if ($this.hasClass('J_clearStorage')) {
                    msg = '';
                    self.clearLocal();
                    self.showToast('Clear', 1, function() {
                        self.reset();
                    });
                } else if ($this.hasClass('J_reload')) {
                    msg = 'Reloading Page';
                }
                msg && self.showToast(msg, 1, function() {
                    self.refreshPage();
                });
            });

            $body.on('click', '.J_logContent i', function() {
                self.consoleBox.hide();
                localStorage.setItem(DEBUG_KEY, false);
            });

        },
        setUserLogin: function(user) {
            localStorage.setItem('USER', user && user.user);
            localStorage.setItem('USERINFO', user && user.userinfo);
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
                this.div.find('button').addClass('btn_blue1')
                    .css({width:'70px', display:'inline-block', 'margin': '3px', 'line-height': '24px',height: '24px'});
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
        },
        refreshPage: function() {
            location.reload();
        }
    };

    return ConsoleDebug;

});

/*
 //                btn = $('<i style="position:fixed;bottom:300px;color:green;z-index:9999;">CL</i>').appendTo('#main');
 //                btn.on('click', function() {
 //                    !con && require(['ConsoleDebug'], function(ConsoleDebug) {
 //                        con = new ConsoleDebug();
 //                    });
 //                    con && con.show();
 //                });
 */