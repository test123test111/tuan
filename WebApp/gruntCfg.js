var config = {
    webresourceSrc: "GroupH5",
    buConfig: "config.js",
    isSimple: true,
    jshint: false,
    channel: "tuan",
    hybridChannel: "tuan",
    pageTitle: "携程旅行网触屏版-酒店团购",
    zip: "zip",
    buEnv: "dev",
    host: "172.16.189.130",
    viewsExclude: [
        "Shared/Footer.cshtml",
        "Shared/BodyLayout.cshtml",
        "Shared/Header.cshtml",
    ],
    defaultView: 'home',
    // 这个配置只针对hybrid打包
    serviceReplace: {
        dev: {
            '@Tuan.ConfigManager.IncludeStaticFile()': '/webapp/tuan/dest/GroupH5/'
        },
        fws: {
            '@Tuan.ConfigManager.IncludeStaticFile()': '/webapp/tuan/dest/GroupH5/'
        },
        prd: {
            '@Tuan.ConfigManager.IncludeStaticFile()': '/webapp/tuan/dest/GroupH5/'
        }
    },
    //内部资源
    jsExclude: [
        "res/**/*.{png,gif,jpg}"
    ],
    //外部链接
    resourceExclude: [
        "http://pic.c-ctrip.com/h5/tuan/layer_index_sale.png"
    ]
};

module.exports = config;
