function Controller() {
    function doClick(e) {
        if (e.source == $.btnWelcome) Alloy.createController("login"); else if (e.source == $.btnQuit) {
            Gb.logd("Quitting app now.");
            Titanium.Android.currentActivity.finish();
        } else if (e.source == $.btnCamera) {
            var profile = Alloy.Collections.Profile.where({
                nickname: "Guest"
            })[0];
            Alloy.createController("camera", {
                profile: profile
            });
        } else e.source == $.btnDebugMenu && Alloy.createController("debugMenu");
    }
    function doWinClose() {
        Gb.logd("Index: Closed window.");
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "index";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    var __defers = {};
    $.__views.index = Ti.UI.createWindow({
        backgroundColor: "#000",
        navBarHidden: "true",
        id: "index"
    });
    $.__views.index && $.addTopLevelView($.__views.index);
    doWinClose ? $.__views.index.addEventListener("close", doWinClose) : __defers["$.__views.index!close!doWinClose"] = true;
    $.__views.__alloyId4 = Ti.UI.createLabel({
        width: Ti.UI.FILL,
        height: Ti.UI.SIZE,
        color: "white",
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        backgroundColor: "transparent",
        font: {
            fontSize: "24sp",
            fontWeight: "bold"
        },
        top: "5%",
        text: "Geobotanica",
        id: "__alloyId4"
    });
    $.__views.index.add($.__views.__alloyId4);
    $.__views.__alloyId5 = Ti.UI.createView({
        width: "80%",
        height: Ti.UI.SIZE,
        layout: "vertical",
        top: "40%",
        id: "__alloyId5"
    });
    $.__views.index.add($.__views.__alloyId5);
    $.__views.btnWelcome = Ti.UI.createButton({
        width: Ti.UI.FILL,
        height: Ti.UI.SIZE,
        center: "50%",
        font: {
            fontFamily: "Helvetica",
            fontSize: "18sp",
            fontStyle: "normal",
            fontWeight: "normal"
        },
        id: "btnWelcome",
        title: "Welcome"
    });
    $.__views.__alloyId5.add($.__views.btnWelcome);
    doClick ? $.__views.btnWelcome.addEventListener("click", doClick) : __defers["$.__views.btnWelcome!click!doClick"] = true;
    $.__views.btnCamera = Ti.UI.createButton({
        width: Ti.UI.FILL,
        height: Ti.UI.SIZE,
        center: "50%",
        font: {
            fontFamily: "Helvetica",
            fontSize: "18sp",
            fontStyle: "normal",
            fontWeight: "normal"
        },
        id: "btnCamera",
        title: "Camera"
    });
    $.__views.__alloyId5.add($.__views.btnCamera);
    doClick ? $.__views.btnCamera.addEventListener("click", doClick) : __defers["$.__views.btnCamera!click!doClick"] = true;
    $.__views.btnQuit = Ti.UI.createButton({
        width: Ti.UI.FILL,
        height: Ti.UI.SIZE,
        center: "50%",
        font: {
            fontFamily: "Helvetica",
            fontSize: "18sp",
            fontStyle: "normal",
            fontWeight: "normal"
        },
        id: "btnQuit",
        title: "Quit"
    });
    $.__views.__alloyId5.add($.__views.btnQuit);
    doClick ? $.__views.btnQuit.addEventListener("click", doClick) : __defers["$.__views.btnQuit!click!doClick"] = true;
    $.__views.btnDebugMenu = Ti.UI.createButton({
        width: "80%",
        height: Ti.UI.SIZE,
        center: "50%",
        font: {
            fontFamily: "Helvetica",
            fontSize: "18sp",
            fontStyle: "normal",
            fontWeight: "normal"
        },
        id: "btnDebugMenu",
        title: "Debug Menu",
        bottom: "5%",
        opacity: "0.6"
    });
    $.__views.index.add($.__views.btnDebugMenu);
    doClick ? $.__views.btnDebugMenu.addEventListener("click", doClick) : __defers["$.__views.btnDebugMenu!click!doClick"] = true;
    exports.destroy = function() {};
    _.extend($, $.__views);
    var Gb = Alloy.Globals.Gb;
    Gb.logv("Index controller init.");
    $.index.open({
        exitOnClose: true
    });
    var isFirstLayoutEvent = true;
    $.index.addEventListener("postlayout", function() {
        if (isFirstLayoutEvent) {
            isFirstLayoutEvent = false;
            Gb.logv("Index: First post-layout event.");
            $.index.activity.addEventListener("pause", function() {
                if (500 > new Date().getTime() - Gb.lastOrientationChangeTime || Gb.orientation != Ti.Gesture.getOrientation()) Gb.logv("onPause() triggered by orientation change. Silently ignoring..."); else {
                    Gb.logd("Index: onPause()");
                    Ti.App.fireEvent("gb_pause");
                }
            });
            $.index.activity.addEventListener("resume", function() {
                if (500 > new Date().getTime() - Gb.lastOrientationChangeTime || Gb.orientation != Ti.Gesture.getOrientation()) Gb.logv("onResume() triggered by orientation change. Silently ignoring..."); else {
                    Gb.logd("Index: onResume()");
                    Ti.App.fireEvent("gb_resume");
                }
            });
            $.index.activity.addEventListener("start", function() {
                Gb.logd("Index: onStart()");
            });
            $.index.activity.addEventListener("stop", function() {
                Gb.logd("Index: onStop()");
            });
            $.index.activity.addEventListener("create", function() {
                Gb.logd("Index: onCreate()");
            });
            $.index.activity.addEventListener("destroy", function() {
                Gb.logd("Index: onDestroy()");
            });
            $.index.addEventListener("android:back", function() {
                Gb.logv("Index: Android:back button pressed.");
                $.index.close();
            });
        }
    });
    __defers["$.__views.index!close!doWinClose"] && $.__views.index.addEventListener("close", doWinClose);
    __defers["$.__views.btnWelcome!click!doClick"] && $.__views.btnWelcome.addEventListener("click", doClick);
    __defers["$.__views.btnCamera!click!doClick"] && $.__views.btnCamera.addEventListener("click", doClick);
    __defers["$.__views.btnQuit!click!doClick"] && $.__views.btnQuit.addEventListener("click", doClick);
    __defers["$.__views.btnDebugMenu!click!doClick"] && $.__views.btnDebugMenu.addEventListener("click", doClick);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;