/**
 * 酒店点评页面
 * @url: m.ctrip.com/webapp/tuan/hotelcomments
 */
define(['TuanApp', 'libs', 'c', 'TuanStore', 'TuanBaseView', 'cCommonPageFactory', 'TuanModel', 'text!HotelCommentsTpl'], function (TuanApp, libs, c, TuanStore, TuanBaseView, CommonPageFactory, TuanModel, html) {
    var MSG = {
            pageTitle: '酒店点评'
        },
        cBase = c.base,
        tuanDetailsStore = TuanStore.TuanDetailsStore.getInstance(),
        TuanHotelCommentListModel = TuanModel.TuanHotelCommentListModel.getInstance(),
        PageView = CommonPageFactory.create("TuanBaseView"),
        View;

    View = PageView.extend({
        pageid: '214012',
        hpageid: '215012',
        pageSize: 25, //每页加载数
        events: {
        },
        onCreate: function () {
            var wrap = this.$el;

            wrap.html($.trim(html));

            this.totalWrap = wrap.find('#J_commTotal');
            this.listWrap = wrap.find('#J_commList');
            this.totalTpl = _.template(wrap.find('#J_commTotalTpl').html());
            this.listTpl = _.template(wrap.find('#J_commListTpl').html());

            this.onWindowScroll = $.proxy(this._onWindowScroll, this);
            this.showLoading();
            if (tuanDetailsStore && tuanDetailsStore.get() !== null) {
                this.productId = tuanDetailsStore.get().id;
                this.hotelId = tuanDetailsStore.get().hotels[0].id;
                this.showComments();
            } else {
                this.backAction();
            }
            this.totalWrap.empty();
            this.listWrap.empty();
        },
        setHeader: function () {
            var self = this;
            this.header.set({
                title: MSG.pageTitle,
                back: true,
                home: true,
                view: this,
                tel: 4000086666,
                events: {
                    returnHandler: function () {
                        self.backAction();
                    },
                    homeHandler: function () {
                        self.backHome();
                    }
                }
            });
            this.header.show();
        },
        showComments: function () {            
            this.pageIdx=1;
            this.getCommentListData(this.pageIdx);
        },
        rederList:function(data){
            var pageNum,
                pageIdx = this.pageIdx;

            data.dateFormat = cBase.Date.format;
            data.cDate = cBase.Date;
            this.totalPages = Math.ceil(data.count / this.pageSize);
            pageNum = isNaN(pageIdx)? 1 : pageIdx;
            if(pageNum<=1){
                this.totalWrap.html(this.totalTpl(data));
            }
            this.listWrap.append(this.listTpl(data));
            if(this.pageIdx==1){
                $(window).bind('scroll', this.onWindowScroll);
            }
        },
        getCommentListData:function(pageIdx){
            var self = this;
            TuanHotelCommentListModel.setParam({ 'hotelId': this.hotelId, 'pageIdx': pageIdx });
            //head 丢失, 重新加入
            TuanHotelCommentListModel.param.head = TuanHotelCommentListModel.getHead().get();
            //获取详细信息
            TuanHotelCommentListModel.excute(function (data) {
                this.hideLoading();
                this.isLoading = false;
                if (!data) {
                    this.showMessage('抱歉，数据加载失败，请重试!');
                    return;
                }
                this.rederList(data);                
            }, function (err) {
                this.isLoading = false;
                var msg = err.msg ? err.msg : '啊哦,数据加载出错了!';
                // var self = this;
                // this.showHeadWarning('酒店评论信息', msg, function () {
                self.showToast(msg, 3, function () {
                    self.backAction();
                });
                self.hideLoading();
            }, true, this);
        },
        _onWindowScroll:function(){
            var pos = c.ui.Tools.getPageScrollPos(),
                pageNum = isNaN(this.pageIdx) ? 1 : this.pageIdx; //当前页码

            if (this.pageIdx < this.totalPages && this.totalPages > 1) {
                this.isComplete = false;
            }else{//如果已经是最后一页或者没数据，停止加载，并移除滚动事件，释放部分内存
                this.isComplete = true;
                $(window).unbind('scroll', this.onWindowScroll);
                return;
            }

            var h = pos.pageHeight - (pos.top + pos.height);
            if (h <= 300 && !this.isComplete && !this.isLoading) {
                this.isLoading = true;
                if (this.pageIdx > this.totalPages) {
                    this.isComplete = true;
                    return;
                }
                this.pageIdx = ++pageNum;
                this.getCommentListData(this.pageIdx);
            }
        },
        onShow: function () { 
            this.setHeader();
        },
        onHide: function () {
            $(window).unbind('scroll', this.onWindowScroll);
        },
        backAction: function () {
            this.back();
        },
        backHome: function () {
            TuanApp.tHome();
        }
    });
    return View;
});
