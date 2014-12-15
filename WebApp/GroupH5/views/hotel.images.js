/**
 * 酒店图片页面
 * @url: m.ctrip.com/webapp/tuan/hotelimages/{pid}.html
 */
define(['TuanApp', 'libs', 'c', 'TuanBaseView', 'cCommonPageFactory', 'TuanStore', 'TuanModel', 'text!HotelImagesTpl'], function (TuanApp, libs, c, TuanBaseView, CommonPageFactory, TStore, TModel, html) {
    var tuanDetailsStore = TStore.TuanDetailsStore.getInstance();
    var imagesListModel = TModel.TuanImagesListModel.getInstance();
    var tuanImagesListStore = TStore.TuanImagesListStore.getInstance();
    var PageView = CommonPageFactory.create("TuanBaseView");
    var View;
    View = PageView.extend({
        pageid: '260001',
        hpageid: '261001',
        events: {
            'click .detail_pics_in>li': 'gotoImageSlider'
        },
        getImagesList: function(){
            var self = this;
            var images = tuanDetailsStore.getAttr('images');
            var imageList = tuanImagesListStore.getAttr('images');

            //有缓存则读缓存
            if(images && +tuanDetailsStore.getAttr('id') === +this.pid){
                self.renderImagesList(images);
            } else if (imageList && +tuanImagesListStore.getAttr('id') === +this.pid) {
                self.renderImagesList(imageList);
            } else{ //没有缓存请求服务器
                self.showLoading();
                imagesListModel.setParam({id: this.pid});

                imagesListModel.excute(function(data){
                    data = data && data.images;
                    self.hideLoading();
                    if(!data||!data.length) {return;}

                    self.renderImagesList(data);
                }, function(){
                    self.hideLoading();
                    self.showToast('图片数据获取失败！');
                });
            }
        },
        renderImagesList: function(data){
            data = data || [];
            var itemRender = _.template(html);
            this.$el.html($.trim(itemRender(data)));
            this.setHeader(data.length || 0);
        },
        gotoImageSlider: function(e) {
            var id = $(e.currentTarget).attr('data-index');
            this.forwardJump('hotelimageslide','/webapp/tuan/hotelimageslide/' + this.pid + '?index=' + id, { viewName: 'hotelimageslide' });
        },
        isFromSlidePage: function (refer) {
            return refer && refer.match(/imageslide/i);
        },
        onCreate: function () {
        },
        onLoad: function () {
            this.pid = Lizard.P('pid');
            //如果从slide页返回，则不请求数据
            if(this.isFromSlidePage(this.referer)){
                window.scrollTo(this.scrollPos.x, this.scrollPos.y);
            }else{
                //获取图片列表
                this.getImagesList();
            }
        },
        setHeader: function (num) {
            var self = this;
            this.header.set({
                title: '共' + num + '张',
                back: true,
                home: true,
                view: this,
                events: {
                    returnHandler: function () {
                        self.backAction();
                    },
                    homeHandler: function () {
                        self.backHome();
                    }
                }
            });
        },
        onShow: function () {
        },
        onHide: function () {},
        backAction: function () {
            this.back();
        },
        backHome:function(){
            TuanApp.tHome();
        }
    });
    return View;
});
