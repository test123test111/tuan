/**
 * 酒店图片轮播页面
 * @url: m.ctrip.com/webapp/tuan/hotelimageslide
 */
define(['TuanApp', 'TuanBaseView', 'TuanStore', 'text!HotelImageSlideTpl', 'cWidgetFactory', 'cCommonPageFactory', 'SmoothSlide'],
function (TuanApp, TuanBaseView, TuanStore, html, WidgetFactory, CommonPageFactory) {
    var tuanDetailsStore = TuanStore.TuanDetailsStore.getInstance(),
        tuanImagesListStore = TuanStore.TuanImagesListStore.getInstance(),
        imageSlide,
        Slide = WidgetFactory.create('SmoothSlide'),
        View;
    var PageView = CommonPageFactory.create("TuanBaseView");
    View = PageView.extend({
        pageid: '260003',
        hpageid: '261003',
        events: {
            //'click #J_prev': 'prevImg',
            //'click #J_next': 'nextImg'
        },
        onCreate: function() {},
        onLoad: function() {
            var images = tuanImagesListStore.getAttr('images') || tuanDetailsStore.getAttr('images');

            if (images) {
                this.createSlide(images);
            }
        },
        setHeader: function(current, total) {
            var self = this;
            this.header.set({
                title: current + '/' + total + '张',
                back: true,
                home: true,
                view: this,
                events: {
                    returnHandler: function() {
                        self.backAction();
                    },
                    homeHandler: function() {
                        self.backHome();
                    }
                }
            });
        },
        onShow: function() {},
        onHide: function() {},
        backAction: function() {
            this.back();
        },
        backHome: function() {
            TuanApp.tHome();
        },
        createSlide: function(imgsData) {
            var self = this,
            descContainer, currentIndex = Lizard.P('index'),
            container = self.$el.find('#J_sliderWrap'),
            formattedData = [],
            len = imgsData && imgsData.length,
            updateTitleAndDesc = function(index, total, title) {
                descContainer.html(title);
                self.setHeader(index + 1, total);
            };

            currentIndex = currentIndex > 0 ? currentIndex - 1: 0;

            if (len) {
                for (var i = 0; i < len; i++) {
                    formattedData.push({
                        title: imgsData[i].title,
                        src: imgsData[i].large,
                        href: 'javascript:void(0);',
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
                    onSwitchEnd: function() {
                    },
                    onSwitch: function(index, data) {
                        updateTitleAndDesc(index, this.count(), data.title);
                    },
                    onInit: function(current) {
                        descContainer = $(this.container).find('#J_picDesc');
                        updateTitleAndDesc(current, this.count(), this.source[current].title);
                    }
                });
                this.slider = imageSlide;
            }
        }
        /*
        prevImg: function() {
            if (window.imgIndex > 1) {
                this.slider.pre();
            }
        },
        nextImg: function() {
            if (window.imgIndex < images.length) {
                this.slider.next();
            }
        }*/
    });
    return View;
});

