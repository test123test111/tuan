/**
 * 周边团购页面
 * @url: m.ctrip.com/webapp/tuan/nearlist
 */
/*jshint -W030*/
define(['TuanApp', 'TuanBaseView', 'cCommonPageFactory', 'LazyLoad', 'TuanStore', 'TuanModel', 'text!DetailNearTpl', 'StringsData', 'Helper'], function (TuanApp, TuanBaseView, CommonPageFactory, LazyLoad, TuanStore, TuanModel, html, StringsData) {
    var tuanNearListModel = TuanModel.TuanNearListModel.getInstance();
    var searchStore = TuanStore.GroupSearchStore.getInstance();
    var pageTitle = '周边团购';
    var PageView = CommonPageFactory.create("TuanBaseView");
    var View;
    View = PageView.extend({
        pageid: '214008',
        hpageid: '215008',
        setHeader: function(title) {
            var self = this;
            this.header.set({
                title: title || pageTitle,
                back: true,
                view: this,
                events: {
                    returnHandler: function() {
                        self.back();
                    }
                }

            });
            this.header.show();
        },
        events: {
            'click li[data-id]': 'detailHandler' //详情页
        },
        onCreate: function() {
            //列表渲染函数
            this.itemRenderFn = _.template(html);
        },
        onLoad: function() {
            var pid = Lizard.P('pid');
            var title = Lizard.P('title');
            this.category = Lizard.P('category');
            //如果没有产品ID则回退回去
            if (!pid) {
                this.back();
            }
            this.setHeader(title || '周边'+StringsData.groupType[this.category || 1].name+'团购');
            this.getNearList(pid);
        },
        onHide: function() {
            this.hideWarning404();
            this.LazyLoad && this.LazyLoad.unbindEvents();
        },
        onShow: function() {
            //图片延迟加载插件
            this.LazyLoad = new LazyLoad({
                wrap: this.$el,
                animate: 'opacity-fade-in'
            });
        },
        getNearList: function(pid) {
            var param = {
                id: pid,
                environment: TuanApp.environment
            };
            var category = Lizard.P('category');
            category && (param.category = category);
            tuanNearListModel.setParam(param);
            tuanNearListModel.excute(function(data) {
                data.showTags = false; //关闭图片左上角Tag
                this.renderList(data);
            },
            function() {
                var self = this;

                self.showWarning404(function() {
                    self.onLoad();
                });
            },
            false, this);
        },
        renderList: function(data) {
            data.ctype = searchStore.getAttr('ctype');
            var item = this.itemRenderFn({data: data});
            this.$el.html($.trim(item));
            this.LazyLoad && this.LazyLoad.updateDom();
        },
        detailHandler: function(e) {
            var id = $(e.currentTarget).attr('data-id'),
                cityId = Lizard.P('cityid');
            this.forwardJump('detail', '/webapp/tuan/detail/' + id + '.html' + (cityId ? '?cityid=' + cityId : ''));
        }
    });
    return View;
});
/**
 * changelog:
 * @since 6.1, 修改模板，引用detail.near.html 移除 near.list.html
 */