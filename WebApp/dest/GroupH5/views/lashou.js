/**
* 酒店图文详情
* @url: m.ctrip.com/webapp/tuan/lashou/{pid}.html
*/
define(['TuanApp', 'libs', 'c', 'TuanBaseView', 'cCommonPageFactory', 'TuanStore', 'TuanModel', 'text!LashouTpl'], function (TuanApp, libs, c, TuanBaseView, CommonPageFactory, TStore, TModel, html) {
    var disabledCls = 'btm_tuan_btn_dis',
        tuanDetailsStore = TStore.TuanDetailsStore.getInstance(),
        tuanDetailModel = TModel.TuanDetailModel.getInstance();
    var PageView = CommonPageFactory.create("TuanBaseView");
    var View;
    View = PageView.extend({
        events: {
            'click #J_submit': 'submit'
        },
        getGroupContent: function () {
            var self = this;
            var contents = tuanDetailsStore.getAttr('contents');
            if (contents) {
                var content = _.find(contents, function (ctx) { return ctx.type == 5; });
                if(!content){
                    //弹出提示框
                    self.showMessage("无图文详情!");
                    this.setHeader();
                }
                else{
                    self.render(tuanDetailsStore.get());
                }
            } else { //请求服务器
                self.showLoading();
                tuanDetailModel.setParam({
                    id: Lizard.P('pid')
                });
                tuanDetailModel.excute(function (data) {
                    contents = data && data.contents;
                    self.hideLoading();
                    if (contents) {
                        var content = _.find(contents, function (ctx) { return ctx.type == 5; });
                        if (!content) {
                            //提示框
                            self.showMessage("无图文详情!");
                        }
                        else{
                            self.render(data);
                        }                  
                    }
                }, function () {
                    self.hideLoading();
                    self.showToast("获取图文详情失败!");
                });
            }
        },
        render: function (data) {
            var price = data.price;
            var actives = data.activities;
            var content = _.find(data.contents, function (ctx) { return ctx.type == 5; });
            this.setHeader(content.title);
            this.$el.html($.trim(_.template(html, {"content":content,"price":price,"activities":actives})));
            var  btnSubmit = this.$el.find('#J_submit');
            //已售完
            if(data.labelVal ==99 || data.labelVal==100){
               btnSubmit.attr('class', disabledCls).text(data.labelText).removeAttr('id');
            }
            //渠道不可售
             if (!( data.channelInfo && data.channelInfo.isCorrectChannel)) {
                btnSubmit.attr('class', disabledCls);
            }
        },
        onCreate: function () {
        },
        onLoad: function () {
            //获取图文详情内容
            this.parseDetailUrl();
            this.getGroupContent();
        },
        parseDetailUrl:function(){
            //var externalReferURL = Lizard.P('url');
            this.productId = Lizard.P('pid');
            this.externalReferURL = Lizard.P('url');
        },
        setHeader: function (title) {
            var self = this;
            this.header.set({
                title: title || '团购包含',
                back: true,
                view: this,
                events: {
                    returnHandler: function () {
                        self.backAction();
                    }
                }
            });
        },
        onShow: function () {
        },
        onHide: function () { },
        backAction: function () {
            this.back();
        },
         submit: function () {
            if (!this.$el.find("#J_submit").hasClass(disabledCls)) {
                this.forwardJump('booking','/webapp/tuan/booking' + (this.externalReferURL ? ('?from=' + this.externalReferURL) : ''));
            }
        }
    });
    return View;
});
