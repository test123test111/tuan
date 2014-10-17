define(['c'], function () {
    var __cache = {},
        memcache;


    memcache = {
        setItem: function (key, value/*, expired*/) {
            __cache[key] = value;
            return this;
        },
        getItem: function (key) {
            return __cache[key];
        },
        removeItem: function (key) {
            delete __cache[key];
        }
    };

    return memcache;
});
