var Alloy = require("alloy"), _ = Alloy._, Backbone = Alloy.Backbone;

Alloy.Globals.Gb = {};

var Gb = Alloy.Globals.Gb;

Gb.APP_NAME = "Geobotanica";

Gb.osname = "android";

Gb.deviceManufacturer = Ti.Platform.manufacturer;

Gb.deviceManufacturer = Gb.deviceManufacturer.charAt(0).toUpperCase() + Gb.deviceManufacturer.slice(1);

Gb.deviceModel = Ti.Platform.model;

Gb.appStartTime = new Date().getTime();

Gb.orientation = Ti.Gesture.getOrientation();

Gb.lastOrientationChangeTime = Gb.appStartTime;

Gb.deviceWidth = Titanium.Platform.displayCaps.platformWidth;

Gb.deviceHeight = Titanium.Platform.displayCaps.platformHeight;

Gb.deviceAspectRatio;

Gb.dataDir = Ti.Filesystem.applicationDataDirectory;

Gb.extDir = Ti.Filesystem.externalStorageDirectory;

Gb.logv = function(message) {
    Ti.API.trace(message);
};

Gb.logd = function(message) {
    Ti.API.debug(message);
};

Gb.logi = function(message) {
    Ti.API.info(message);
};

Gb.logw = function(message) {
    Ti.API.warn(message);
};

Gb.loge = function(message) {
    Ti.API.error(message);
};

Gb.lastClickTime = 0;

Gb.createDir = function(path) {
    var dir = Ti.Filesystem.getFile(path);
    if (false == dir.exists() || false == dir.isDirectory()) {
        Gb.logv("Creating directory: " + path);
        false == dir.createDirectory() && Gb.loge("Error creating directory: " + path);
    }
    dir = null;
};

Gb.initDb = function() {
    Alloy.Collections.instance("Profile");
    Alloy.Collections.instance("Photo");
    Alloy.Collections.Profile.fetch();
    Alloy.Collections.Photo.fetch();
    if (0 == Alloy.Collections.Profile.where({
        nickname: "Guest"
    }).length) {
        Gb.logv("Creating default profile in db: 'Guest'");
        Alloy.Collections.Profile.create({
            nickname: "Guest",
            createdOn: Gb.getCurrDateTime()
        });
    }
};

Gb.getProfilesExtDir = function() {
    return Gb.extDir + "/profiles";
};

Gb.getCurrDateTime = function() {
    var utcTime = new Date().toISOString();
    utcTime = utcTime.slice(0, 23);
    utcTime = utcTime.replace("T", "_");
    utcTime = utcTime.replace(":", "-");
    utcTime = utcTime.replace(":", "-");
    utcTime = utcTime.replace(".", "-");
    return utcTime;
};

Gb.max = function(x, y) {
    return x > y ? x : y;
};

Gb.min = function(x, y) {
    return y > x ? x : y;
};

Gb.logOrientation = function() {
    Gb.lastOrientationChangeTime = new Date().getTime();
    switch (Gb.orientation) {
      case Ti.UI.PORTRAIT:
        Gb.logd("New orientation: Portrait");
        break;

      case Ti.UI.LANDSCAPE_LEFT:
        Gb.logd("New orientation: Landscape left");
        break;

      case Ti.UI.UPSIDE_PORTRAIT:
        Gb.logd("New orientation: Upside-down portrait");
        break;

      case Ti.UI.LANDSCAPE_RIGHT:
        Gb.logd("New orientation: Landscape right");
    }
};

Gb.isDuplicateClickEvent = function() {
    var utcTime = new Date().getTime();
    if (100 > utcTime - Gb.lastClickTime) return true;
    Gb.lastClickTime = utcTime;
    return false;
};

var doAccelerometer = function(e) {
    Gb.orientation == Ti.UI.LANDSCAPE_LEFT && 0 > e.x ? Gb.orientation = Ti.UI.LANDSCAPE_RIGHT : Gb.orientation == Ti.UI.PORTRAIT && 0 > e.y && (Gb.orientation = Ti.UI.UPSIDE_PORTRAIT);
    Gb.logOrientation();
    Ti.App.fireEvent("gb_orientation");
    Ti.Accelerometer.removeEventListener("update", doAccelerometer);
};

Gb.deviceAspectRatio = Gb.max(Gb.deviceWidth, Gb.deviceHeight) / Gb.min(Gb.deviceWidth, Gb.deviceHeight);

Gb.deviceAspectRatio = Gb.deviceAspectRatio.toFixed(2);

Gb.logi(Gb.APP_NAME);

Gb.logd("device = " + Gb.deviceManufacturer + " " + Gb.deviceModel);

Gb.logd("screen (w, h, aspect ratio) = (" + Gb.deviceWidth + ", " + Gb.deviceHeight + ", " + Gb.deviceAspectRatio + ")");

Gb.logd("OS_ANDROID = true");

Gb.logd("OS_IOS = false");

Gb.logOrientation();

Gb.initDb();

Ti.Geolocation.setAccuracy(Ti.Geolocation.ACCURACY_HIGH);

Ti.Gesture.addEventListener("orientationchange", function(e) {
    Gb.orientation = e.orientation;
    Gb.deviceWidth = Titanium.Platform.displayCaps.platformWidth;
    Gb.deviceHeight = Titanium.Platform.displayCaps.platformHeight;
    Ti.Accelerometer.addEventListener("update", doAccelerometer);
});

Ti.Android.currentActivity.addEventListener("pause", function() {
    setTimeout(function() {
        if (500 > new Date().getTime() - Gb.lastOrientationChangeTime || Gb.orientation != Ti.Gesture.getOrientation()) Gb.logv("onPause() triggered by orientation change. Silently ignoring..."); else {
            Gb.logd("Android: onPause()");
            Ti.App.fireEvent("gb_pause");
        }
    }, 200);
});

Ti.Android.currentActivity.addEventListener("resume", function() {
    setTimeout(function() {
        if (500 > new Date().getTime() - Gb.lastOrientationChangeTime || Gb.orientation != Ti.Gesture.getOrientation()) Gb.logv("onResume() triggered by orientation change. Silently ignoring..."); else {
            Gb.logd("Android: onResume()");
            Ti.App.fireEvent("gb_resume");
        }
    }, 200);
});

Ti.Android.currentActivity.addEventListener("start", function() {
    Gb.logd("Android: onStart()");
});

Ti.Android.currentActivity.addEventListener("stop", function() {
    Gb.logd("Android: onStop()");
});

Ti.Android.currentActivity.addEventListener("create", function() {
    Gb.logd("Android: onCreate()");
});

Ti.Android.currentActivity.addEventListener("destroy", function() {
    Gb.logd("Android: onDestroy()");
});

Alloy.createController("index");