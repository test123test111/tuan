define(["libs","c","cUtility"],function(e,t,i){function s(e){var t={btn:'<i style="position:fixed;bottom:300px;color:green;z-index:9999;">CL</i>',div:'<div style="position:fixed;bottom:290px;z-index:10000;display:none;width: 100%;"><button class="J_clearStorage">Clear</button><button class="J_xiaoli">Xiaoli</button><button class="J_www">www</button><button class="J_normal">Normal</button><button class="J_noOne">None</button><button class="J_reload">Reload</button><div class="J_debugLogSwitch"></div></div>',conBox:'<div class="J_logContent" style="position: fixed;bottom:100px;z-index: 10001;height:130px;width: 100%;display: none;background:gray;"><i style="height: 30px;" class="cui-grayload-close"></i><textarea style="width: 100%;height: 100%;" placeholder="Here is log"></textarea></div>'};this.opt=$.extend(t,e),this.init()}var o=$("#main"),a=$("body"),n={user:'{"value":{"UserID":"21634352BAC43044380A7807B0699491","LoginName":"","IsNonUser":false,"UserName":"qwg测","Mobile":"13612300125","BMobile":"13612300125","Address":"ctrip shanghai","Birthday":"19850823","Experience":513857623,"Gender":1,"PostCode":"","VipGrade":30,"VipGradeRemark":"钻石贵宾","Email":"shhu@ctrip.com","ExpiredTime":"/Date(-62135596800000-0000)/","Auth":"6D95370F6BD15BBC7FEE38F11C1E2D58233905E7ED550A7394C958D73B3B5933"},"oldvalue":null,"timeout":"2015/11/26 10:54:26","savedate":"2014/10/27 10:54:26"}',userinfo:'{"data":{"UserID":"21634352BAC43044380A7807B0699491","LoginName":"","IsNonUser":false,"UserName":"qwg测","Mobile":"13612300125","BMobile":"13612300125","Address":"ctrip shanghai","Birthday":"19850823","Experience":513857623,"Gender":1,"PostCode":"","VipGrade":30,"VipGradeRemark":"钻石贵宾","Email":"shhu@ctrip.com","ExpiredTime":"/Date(-62135596800000-0000)/","Auth":"6D95370F6BD15BBC7FEE38F11C1E2D58233905E7ED550A7394C958D73B3B5933"},"timeout":"2014-11-26 10:50:55"}'},r={user:'{"value":{"UserID":"AEFF51E4F9EA6CCBA42E11736E72441C","LoginName":"","IsNonUser":false,"UserName":"xiaoli-FAT","Mobile":"13023112562","BMobile":"","Address":"","Birthday":"19210101","Experience":1200,"Gender":2,"PostCode":"","VipGrade":0,"VipGradeRemark":"普通会员","Email":"chen.xiaoli@ctrip.com","ExpiredTime":"/Date(-62135596800000-0000)/","Auth":"22489D878AF6215DED9BAB44EE3AB2D7CFE94333D4E38D59DF80561A3E5DD066"},"oldvalue":null,"timeout":"2015/12/14 10:11:42","savedate":"2014/11/14 10:11:42"}',userinfo:'{"data":{"UserID":"AEFF51E4F9EA6CCBA42E11736E72441C","LoginName":"","IsNonUser":false,"UserName":"xiaoli-FAT","Mobile":"13023112562","BMobile":"","Address":"","Birthday":"19210101","Experience":1200,"Gender":2,"PostCode":"","VipGrade":0,"VipGradeRemark":"普通会员","Email":"chen.xiaoli@ctrip.com","ExpiredTime":"/Date(-62135596800000-0000)/","Auth":"22489D878AF6215DED9BAB44EE3AB2D7CFE94333D4E38D59DF80561A3E5DD066"},"timeout":"2014-12-12 20:38:51"}'},l={user:'{"value":{"UserID":"FCA154F6235E2ECF665F5DFE71D4D5B1","LoginName":"","IsNonUser":false,"UserName":"","Mobile":"","BMobile":"","Address":"","Birthday":"00010101","Experience":1200,"Gender":2,"PostCode":"","VipGrade":0,"VipGradeRemark":"普通会员","Email":"daihy@ctrip.com","ExpiredTime":"/Date(-62135596800000-0000)/","Auth":"7B5C33A12EE614DE6656E23ABD8897D505C1DE90901325518281D46C2D640A85"},"oldvalue":null,"timeout":"2014/12/14 15:38:25","savedate":"2015/11/14 15:38:25"}',userinfo:'{"data":{"UserID":"FCA154F6235E2ECF665F5DFE71D4D5B1","LoginName":"","IsNonUser":false,"UserName":"","Mobile":"","BMobile":"","Address":"","Birthday":"00010101","Experience":1200,"Gender":2,"PostCode":"","VipGrade":0,"VipGradeRemark":"普通会员","Email":"daihy@ctrip.com","ExpiredTime":"/Date(-62135596800000-0000)/","Auth":"7B5C33A12EE614DE6656E23ABD8897D505C1DE90901325518281D46C2D640A85"},"timeout":"2014-12-14 15:38:22"}'},h="TUAN_DEBUG_CON",d=window.localStorage;return s.prototype={init:function(){var e=this;this._isDevEnv()&&(window._log=$.extend(window._log,{log:function(t){var i=e.consoleBox.find("textarea"),s=this.stash;s.push("undefined"!=typeof t?JSON.stringify(t):""),i.text(s.join("\n"))}})),this.renderHtml(),this.showMask(),this.renderConsoleBox(),this._bindEvents(),this.clearAds()},_isDevEnv:function(){var e,t=!1;return i.isInApp()?(e=i.isPreProduction(),("0"===e||"1"===e||"2"===e)&&(t=!0)):location.host.match(/^(m|3g|wap)\.ctrip\.com/i)||(t=!0),t},_bindEvents:function(){var e=this;this.btn&&this.btn.on("click",function(){e.renderHtml(),e.showMask()}),o.on("click","button",function(t){var i,s=$(t.target);s.hasClass("J_xiaoli")?(i="已切换为小丽登陆！",e.setUserLogin(r)):s.hasClass("J_noOne")?(i="已切换为无用户登陆！",e.setUserLogin()):s.hasClass("J_www")?(i="已切换为www用户登陆",e.setUserLogin(n)):s.hasClass("J_normal")?(i="已切换为普通账户登录",e.setUserLogin(l)):s.hasClass("J_clearStorage")?(i="",e.clearLocal(),e.showToast("Clear",1,function(){e.reset()})):s.hasClass("J_reload")&&(i="Reloading Page"),i&&e.showToast(i,1,function(){e.refreshPage()})}),a.on("click",".J_logContent i",function(){e.consoleBox.hide(),e.setStatusLocal(!1)})},setUserLogin:function(e){d.setItem("USER",e&&e.user),d.setItem("USERINFO",e&&e.userinfo)},showToast:function(e,i,s){!this.toast&&(this.toast=new t.ui.Toast),this.toast.show(e,i||1,s)},showMask:function(){var e=this;!this.mask&&(this.mask=new t.ui.Mask({onCreate:function(){this.root.on("click",function(){e.reset()})}})),this.mask.show()},hideMask:function(){this.mask&&this.mask.hide()},renderHtml:function(){var e=this;this.div||(this.div=$(this.opt.div).appendTo(o),this.switch=new t.ui.cuiSwitch({rootBox:$(".J_debugLogSwitch"),checked:this.getStatusLocal()?!0:!1,changed:function(){e.setStatusLocal(this.getStatus()),e.switchConsoleBox(this.getStatus())}}),this.div.find("button").addClass("btn_blue1").css({width:"70px",display:"inline-block",margin:"3px","line-height":"24px",height:"24px"})),this.switch[this.getStatusLocal()?"checked":"unChecked"](),this.div.show()},clearLocal:function(){var e=this.getStatusLocal();d&&d.clear(),this.setStatusLocal(e)},clearAds:function(){var e=setInterval(function(){var t=$(".dl_panel-bg .dl_btn-close");t&&t.length&&(t.trigger("click"),clearInterval(e))},100)},renderConsoleBox:function(){this.consoleBox=$(this.opt.conBox).appendTo(a),this.switchConsoleBox(this.getStatusLocal())},switchConsoleBox:function(e){this.consoleBox[e?"show":"hide"](),e&&window._log.log(),this.reset()},reset:function(){this.hideMask(),this.div&&this.div.hide()},getStatusLocal:function(){var e=d.getItem(h);return e&&"false"!=e?!0:!1},setStatusLocal:function(e){d.setItem(h,e)},show:function(){this.switch&&this.switch[this.getStatusLocal()?"checked":"unChecked"](),this.showMask(),this.div.show()},refreshPage:function(){location.reload()}},s});