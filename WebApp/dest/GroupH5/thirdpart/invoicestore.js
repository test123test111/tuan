define(["cStore","cBase"],function(i,t){var e=e||{};e.InvoiceSearchStore=new t.Class(i,{__propertys__:function(){this.key="INVOICE_SEARCH",this.lifeTime="180S",this.defaultData={uid:0,inIds:[]},this.isUserData=!0},initialize:function($super,i){$super(i)}}),e.InvoiceListStore=new t.Class(i,{__propertys__:function(){this.key="INVOICE_LIST",this.lifeTime="180S",this.isUserData=!0},initialize:function($super,i){$super(i)}}),e.InvoiceSaveStore=new t.Class(i,{__propertys__:function(){this.key="INVOICE_SAVE",this.lifeTime="180S",this.defaultData={intle:"",inId:[],uid:0},this.isUserData=!0},initialize:function($super,i){$super(i)}}),e.InvoiceEditStore=new t.Class(i,{__propertys__:function(){this.key="INVOICE_EDIT",this.lifeTime="180S",this.defaultData={},this.isUserData=!0},initialize:function($super,i){$super(i)}}),e.InvoiceSaveResultStore=new t.Class(i,{__propertys__:function(){this.key="INVOICE_RESULT",this.lifeTime="180S",this.isUserData=!0},initialize:function($super,i){$super(i)}}),e.InvoiceDeleteStore=new t.Class(i,{__propertys__:function(){this.key="INVOICE_DELETE",this.lifeTime="180S",this.defaultData={uid:0,inIds:0},this.isUserData=!0},initialize:function($super,i){$super(i)}}),e.InvoiceDeleteResultStore=new t.Class(i,{__propertys__:function(){this.key="INVOICE_DELETE_RESULT",this.lifeTime="180S",this.isUserData=!0},initialize:function($super,i){$super(i)}}),e.LiPinCard_InvoiceTitle=new t.Class(i,{__propertys__:function(){this.key="LiPinCard_InvoiceTitle",this.lifeTime="1d",this.isUserData=!0},initialize:function($super,i){$super(i)}}),e.LiPinCard_InvoiceTitle=new t.Class(i,{__propertys__:function(){this.key="LiPinCard_InvoiceTitle",this.lifeTime="1d",this.isUserData=!0},initialize:function($super,i){$super(i)}}),e.Flight_InvoiceTitle=new t.Class(i,{__propertys__:function(){this.key="Flight_InvoiceTitle",this.lifeTime="1d",this.isUserData=!0},initialize:function($super,i){$super(i)}}),e.Taocan_InvoiceTitle=new t.Class(i,{__propertys__:function(){this.key="Taocan_InvoiceTitle",this.lifeTime="1d",this.isUserData=!0},initialize:function($super,i){$super(i)}});var n=new t.Class(i,{__propertys__:function(){this.CONST_TAG="tag",this.CONST_BACKURL="backurl",this.CONST_CALLBACK="callback",this.CONST_CURVALUE="curvalue"},initialize:function($super,i){$super(i)},save:function(i,t){var e=this.get(),n=this,s=0;$.isArray(e.callback)?$.each(e.callback,function(a,l){n._callFunByStr(l,i,null,function(){s++,s===e.callback.length&&t&&t()})}):this._callFunByStr(e.callback,i,null,function(){t&&t()})},setCurrent:function(i,t,e,n,s){var a={};a[this.CONST_TAG]=i,a[this.CONST_BACKURL]=t,a[this.CONST_CALLBACK]=e,a[this.CONST_CURVALUE]=n,a[this.CONST_PATH]=s,this.set(a)},getCurrent:function(){return this.get()},getValue:function(i){var t=this.get();return this._callFunByStr(t.curvalue,null,null,i)},_callFunByStr:function(i,t,e,n){e=e||Store;var s,a,l=/^(?:(\w*)::)?(\w*):(\w*)$/i.exec(i);if(l&&4===l.length)if(l[1])require([l[1]],function(i){var e=i[l[2]],s=l[3];if(e&&e.getInstance){var a=e.getInstance()[s](t);n&&n(a)}});else if(s=e[l[2]],a=l[3],s&&s.getInstance){var r=s.getInstance()[a](t);return n&&n(r),r}return!1}});return e.InvoiceURLStore=new t.Class(n,{__propertys__:function(){this.key="INVOICE_URL",this.lifeTime="1D"},initialize:function($super,i){$super(i)}}),e});