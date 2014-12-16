/*jshint -W030*/
/**
 * 酒店图片轮播页面
 * @url: m.ctrip.com/webapp/tuan/hotelimageslide
 */
define(['TuanApp', 'TuanBaseView', 'TuanModel', 'TuanStore', 'text!HotelImageSlideTpl', 'cWidgetFactory', 'cCommonPageFactory', 'SmoothSlide'],
function (TuanApp, TuanBaseView, TuanModel, TuanStore, html, WidgetFactory, CommonPageFactory) {
    var tuanDetailsStore = TuanStore.TuanDetailsStore.getInstance(),
        tuanImagesListStore = TuanStore.TuanImagesListStore.getInstance(),
        imagesListModel = TuanModel.TuanImagesListModel.getInstance(),
        imageSlide,
        Slide = WidgetFactory.create('SmoothSlide'),
        View;
    var PageView = CommonPageFactory.create("TuanBaseView");
    View = PageView.extend({
        pageid: '260003',
        hpageid: '261003',
        events: {
            'click article': 'clickHandler'
        },
        onCreate: function() {},
        onLoad: function() {
            var self = this;
            this.pid = Lizard.P('pid');
            var images = tuanDetailsStore.getAttr('images');
            var imageList = tuanImagesListStore.getAttr('images');

            //有缓存则读缓存
            if(images && +tuanDetailsStore.getAttr('id') === +this.pid) {
                this.createSlide(images);
            } else if (imageList && +tuanImagesListStore.getAttr('id') === +this.pid) {
                this.createSlide(imageList);
            } else {
                self.showLoading();
                imagesListModel.setParam({id: this.pid});
                imagesListModel.excute(function(data){
                    data = data && data.images;
                    self.hideLoading();
                    if(!data||!data.length) {return;}
                    self.createSlide(data);
                }, function(){
                    self.hideLoading();
                    self.showToast('图片数据获取失败！');
                });
            }
        },
        onShow: function() {
            this.header && this.header.hide();
        },
        onHide: function() {
            if (!TuanApp.isInApp && this.header && this.header.rootBox) {this.header.rootBox.show();}
        },
        backAction: function() {
            this.back({did: this.pid});
        },
        backHome: function() {
            TuanApp.tHome();
        },
        createSlide: function(imgsData) {
            var self = this,
                descContainer,
                currentIndex = Lizard.P('index'),
            container = self.$el.find('#J_sliderWrap'),
            formattedData = [],
            len = imgsData && imgsData.length,
            updateTitleAndDesc = function(index, total, title) {
                descContainer.html(title + '<br/>' + (index + 1) + '/' +total);
            };

            currentIndex = currentIndex > 0 ? currentIndex - 1: 0;
            self.storeIndex(currentIndex);
            if (len) {
                for (var i = 0; i < len; i++) {
                    formattedData.push({
                        title: imgsData[i].title,
                        src: imgsData[i].large,
                        href: '#',
                        desc: imgsData[i].desc
                    });
                }
            }
            if (formattedData.length) {
                //修复子页面容器撑不开问题
                container.parent().parent().css('height', '100%');
                imageSlide = new Slide({
                    container: container,
                    source: formattedData,
                    itemCls: '.pics_show_box_items',
                    autoplay: 0,
                    prefetch: 3,
                    currentIndex: currentIndex,
                    width: $('body').offset().width,
                    tpl: html,
                    onSwitchEnd: function() {},
                    onSwitch: function(index, data) {
                        self.storeIndex(index);
                        updateTitleAndDesc(index, this.count(), data.title);
                    },
                    onInit: function(current) {
                        descContainer = $(this.container).find('#J_picDesc');
                        updateTitleAndDesc(current, this.count(), this.source[current].title);
                    }
                });
                this.slider = imageSlide;
            }
        },
        clickHandler: function(e) {
            if (e.target && e.target.tagName.toLocaleLowerCase() === 'article') {
                this.backAction();
            }
        },
        storeIndex: function(index) {
            tuanDetailsStore.setAttr('imageIndex', index);
        }

    });
    return View;
});

