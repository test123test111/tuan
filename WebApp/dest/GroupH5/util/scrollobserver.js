define(["c"],function(){function t(t,o,i,r){return Math.abs(t-o)>=Math.abs(i-r)?t-o>0?"left":"right":i-r>0?"up":"down"}function o(){var o=this,i=n.body,r=i.scrollLeft,c=i.scrollTop;this.status==e.START?(this.status=e.BEGIN,this.direction=t(a,r,d,c),s.trigger(u.START,{direction:o.direction,y:c,x:r})):this.status=e.SCROLLING,clearTimeout(f),f=setTimeout(function(){o.status=e.START,s.trigger(u.END,{direction:o.direction,y:c,x:r}),d=i.scrollTop,a=i.scrollLeft},l)}function i(){{var t=n.body;t.scrollLeft,t.scrollTop}o()}var r,s=window,n=s.document,l=1e3,c="scroll",e={START:0,SCROLLING:1,END:2},u={START:"customScrollStart",END:"customScrollEnd"},a=0,d=0,f=null;return s=$(s),r={init:function(){return this.status=e.END,this.__scrollHandler=$.proxy(i,this),this},enable:function(){s.on(c,this.__scrollHandler)},disable:function(){s.off(c,this.__scrollHandler)}}});