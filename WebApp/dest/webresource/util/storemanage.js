define(["TuanApp","TuanStore","CityListData","StringsData"],function(e,t,n,r){function p(e){var t="-",n="元",r=e.split("|"),i=r[0],s=r[1];return i&&s?(i>s&&(i=s,s=r[0]),i+t+s+n):i?s?"":i+"以上":s+"以下"}function d(e){var t={2:"二星/经济",3:"三星/舒适",4:"四星/高档",5:"五星/豪华"};return t[e]||"不限"}var i=t.GroupSearchStore.getInstance(),s=t.GroupPositionFilterStore.getInstance(),o=t.GroupCategoryFilterStore.getInstance(),u=t.TuanHistoryCityListStore.getInstance(),a=t.GroupSortStore.getInstance(),f=t.TuanCityListStore.getInstance(),l=t.GroupGeolocation.getInstance(),c=t.TuanHistoryKeySearchStore.getInstance(),h=t.GroupCustomFilters.getInstance(),v={clearSpecified:function(e){e&&i.setAttr("sortRule",2),e&&i.setAttr("sortType",0),!e&&h.remove(),!e&&i.setAttr("ctype",0),!e&&i.setAttr("weekendsAvailable",0),s.remove(),a.remove(),this.setCurrentKeyWord(!1),i.setAttr("qparams",this.getGroupQueryParam()),i.removeAttr("pos")},clearAll:function(){this.clearSpecified(),i.remove(),o.remove()},isNearBy:function(){return i.getAttr("nearby")||u.getAttr("nearby")},addHistoryCity:function(e,t){var n=u.get(),i=[];n&&n.list&&$.isArray(n.list)&&(i=n.list);var s,o=0;$.each(i,function(t,n){return n!=e?!0:(s=n,o=t,!1)}),s&&s==e?(i.splice(o,1),i.unshift(e)):(i.unshift(e),i.length>r.MAX_KEYWORDS_HISTORY&&i.pop()),u.setAttr("list",i)},findHistoryCity:function(e){var t=u.get(),n=[];if(!e){var r=f.get();if(!r)return;e=r.cities||r}if(t&&t.list){var i=t.list.length>3?3:t.list.length;for(var s=0;s<i;s++){var o=!1,a=t.list[s],l=this.findCityInfoById(a,e);l&&n.push(l)}}return n},getCityCount:function(e){if(!e){var t=f.get();if(!t)return;e=t.cities||t}var n=0;if(e&&e.cities&&e.cities.length>0)for(var r=0,i=e.cities.length,s;r<i;r++)s=e.cities[r],s&&s.tag&&s.tag!="热门"&&(n+=s.cities.length);return n},findCityInfoById:function(e,t,r){var i;if(!t){i=f.get();if(!i)return{CityID:e,name:n[e]||r,cGroups:""};t=i.cities||i}for(var s=0,o=t.length,u;s<o;s++){u=t[s];if(u.tag=="热门"&&u.cities)for(var a in u.cities){var l=u.cities[a];if(l.id==e)return l}}for(var s=0,o=t.length,u;s<o;s++){u=t[s];if(u.tag!="热门"&&u.cities)for(var a in u.cities){var l=u.cities[a];if(l.id==e)return l}}return!1},setCurrentCity:function(e){if(e){var t=l.get();if(t&&t.gps){var n=e.CityID||e,r=this.findCityInfoById(n);if(r)return t.gps.CityId=e.CityID,t.gps.CityName=r.name,t.gps.Groups=r.cGroups,l.setAttr("gps",t.gps),!0;e.CityID&&e.CityName&&(t.gps.CityId=e.CityID,t.gps.CityName=e.CityName,t.gps.Groups=0,l.setAttr("gps",t.gps))}}return!1},getCurrentCity:function(){var e=l.get();return e&&e.gps&&+e.gps.CityId>0?e.gps:!1},addHistoryKeyWord:function(e,t,n){var i=c.get(),o=s.getAttr("type"),u=[],a,f=0;i&&i.list&&$.isArray(i.list)&&(u=i.list),$.each(u,function(t,n){return n.id!=e?!0:(a=n,f=t,!1)}),a&&a.id==e?(u.splice(f,1),u.unshift({id:e,word:t,type:n})):(u.unshift({id:e,word:t,type:n}),u.length>r.MAX_KEYWORDS_HISTORY&&u.pop()),c.remove(),c.setAttr("list",u),this.setCurrentKeyWord({id:e,word:t,type:n}),(o<0||o=="5")&&(n=="zone"||n=="markland")&&s.remove(),o=="4"&&n=="location"&&s.remove()},getHistoryKeyWord:function(){var e=c.get(),t=[];return e&&e.list&&(t=e.list),t},setCurrentKeyWord:function(e){c.setAttr("key",e)},removeCurrentKeyWord:function(){c.removeAttr("key")},getCurrentKeyWord:function(){var e=c.get();return e?e.key:!1},getGroupQueryParam:function(){var e=[],t=h.get(),n=s.get(),r=t&&t.price&&t.price.val;r&&e.push({type:1,value:r});var i=t&&t.star;if(i&&!$.isEmptyObject(i)){var a=[],f;for(var f in i)a.push(f);e.push({type:2,value:a.join(",")})}var c=t&&t.brand&&t.brand.val;c&&e.push({type:3,value:c});var p=t&&t.trait&&t.trait.val;p&&e.push({type:14,value:p});var d=l.get()&&l.get().gps,v=t&&t.distance&&t.distance.val;u.getAttr("nearby")&&d?e.push({type:9,value:d.lat+"|"+d.lng+(v?"|"+v:"")}):v&&e.push({type:9,value:v});var m=t&&t.day&&t.day.val;m&&e.push({type:14,value:m});var g=t&&t.multiShop;g==1&&e.push({type:14,value:"102|10201"});var y=t&&t.voucher;y==1&&e.push({type:14,value:"102|10202"});var b=o.get();b&&b.subVal&&e.push({type:14,value:b.subVal}),n=n?n:{type:"",val:""},n&&n.type&&+n.type>0&&n.val&&n.val!=""&&e.push({type:n.type,name:n.name,value:n.val});var w=this.getCurrentKeyWord();if(w){var E=(w.type||"").toString().toLowerCase(),S=w.id||w.word,x={hotelid:18,zone:5,hotelgroupid:3,location:4,activity:11,district:16,markland:17};E?/\D/.test(E)&&(x[E]?E=x[E]:E=7):E=7,e.push({type:E,value:S})}return e},saveQueryString:function(e){var t=Lizard.P,s=t("ctype"),a=t("price"),f=t("star"),c=t("kwd"),p=t("place"),d=t("lat"),v=t("lng")||t("lon"),m=t("cityid"),g=t("cityname"),y=t("sort");m&&m!=i.getAttr("ctyId")&&(this.clearAll(),u.remove()),m&&(i.setAttr("ctyId",m),g=g||n[m]||"",i.setAttr("ctyName",g));if(d&&+d>0&&v&&+v>0&&p&&p!=""){l.setAttr("gps",{address:p,location:v+","+d,city:g,lng:+v,lat:+d}),u.setAttr("nearby",!0),m&&(this.setCurrentCity({CityID:m}),this.addHistoryCity(m,g));var b=i.getAttr("qparams")||[];for(var w=0,E=b.length;w<E;w++)if(b[w].type==9){b.splice(w,1);break}b.push({type:9,value:d+"|"+v+"|"+r.SEARCH_DISTANCE}),i.setAttr("qparams",b)}s&&(o.remove(),i.setAttr("ctype",r.index2ctype[s])),f&&s==1&&h.setAttr("star",f.replace(",","|")),a&&h.setAttr("price",a),c&&(c=c.split("|"),this.addHistoryKeyWord(c[1],c[0],c[2])),y&&(y=y.split("|"),i.setAttr("sortRule",y[0]),i.setAttr("sortType",y[1]||1)),e&&e()},getCityIdByName:function(e){var t;return e&&(t=n[e]),!1}};return v});