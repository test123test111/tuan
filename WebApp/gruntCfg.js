var config = {
    webresourceSrc: "GroupH5",
    buConfig: "config.js",
    isSimple: true,
    jshint: false,
    channel: "tuan",
    hybridChannel: "tuan",
    pageTitle: "团购",
    zip: "tuan",
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
    jsExclude: [
    ],
    resourceExclude: [

    ]
};

module.exports = config;
