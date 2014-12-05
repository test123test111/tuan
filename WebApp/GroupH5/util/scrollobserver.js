define(['c'], function () {
    var WIN = window,
        DOC = WIN.document,
        SCROLL_ACCURACY = 800, //50 ms
        SCROLL_TOLERANCE = 0, //滚动方法判断的误差系数，1px
        SCROLL_EVENT = 'scroll',
        SCROLL_STATUS = {
            START: 0,
            SCROLLING: 1,
            END: 2
        },
        SCROLL_EVENTS = {
            START: 'customScrollStart',
            END: 'customScrollEnd'
        },
        lastX = 0,
        lastY = 0,
        timer = null,
        observer;

    WIN = $(WIN);

    function scrollDirection(x1, x2, y1, y2) {
        return Math.abs(x1 - x2) >= Math.abs(y1 - y2) ? (x1 - x2 > SCROLL_TOLERANCE ? 'left' : 'right') : (y1 - y2 > SCROLL_TOLERANCE? 'up' : 'down');
    }
    function testScrollEnd() {
        var self = this,
            body = DOC.body,
            currentX = body.scrollLeft,
            currentY = body.scrollTop;

        //if(currentY === lastY && currentX ===  lastX){
        self.status = SCROLL_STATUS.END;
        WIN.trigger(SCROLL_EVENTS.END, {
            direction: self.direction,
            y: currentY,
            x: currentX
        });
        lastY = body.scrollTop;
        lastX = body.scrollLeft;
        // }
    }
    function updateStatus() {
        var self = this,
            body = DOC.body,
            currentX = body.scrollLeft,
            currentY = body.scrollTop;
        //滚动开始
        i= new Date().getTime();

        //console.log((self.status+"/"+SCROLL_STATUS.END)+'---'+(typeof self.status)+'/'+(typeof SCROLL_STATUS.END)+'--START----'+(self.status === SCROLL_STATUS.END));
        if(self.status === SCROLL_STATUS.END){
            self.status = SCROLL_STATUS.START;

            self.direction = scrollDirection(lastX, currentX, lastY, currentY);
            WIN.trigger(SCROLL_EVENTS.START, {
                direction: self.direction,
                y: currentY,
                x: currentX
            });
        } else {
            self.status = SCROLL_STATUS.SCROLLING;
        }
        clearTimeout(timer);
        timer = setTimeout($.proxy(testScrollEnd, self), SCROLL_ACCURACY);
    }
    function scrollHandler() {
        updateStatus.call(this);
    }
    observer = {
        init: function () {
            this.status = SCROLL_STATUS.END;

            this.__scrollHandler = $.proxy(scrollHandler, this);
            return this;
        },
        enable: function () {
            WIN.on(SCROLL_EVENT, this.__scrollHandler);
        },
        disable: function () {
            WIN.off(SCROLL_EVENT, this.__scrollHandler);
        }
    };

    return observer;
});
//test code
/*
 observer.init().enable();
 $(window).on('customScrollStart', function () {
 console.log(arguments);
 })
 $('body').on('click', function () {
 observer.disable();
 })
 */
