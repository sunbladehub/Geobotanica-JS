var Alloy = require("alloy"), _ = Alloy._, Backbone = Alloy.Backbone;

var Gb = {};

Gb.osname = "android";

Gb.isAndroid = "android" === Gb.osname ? true : false;

Gb.isIPhone = "iphone" === Gb.osname ? true : false;

Gb.appName = "Geobotanica";

Gb.Log = function(logLevel, message) {
    Ti.API.info(message);
};

Gb.Log(1, Gb.appName);

Gb.Log(1, "isAndroid = " + Gb.isAndroid);

Gb.Log(1, "isIPhone = " + Gb.isIPhone);

Alloy.createController("index");