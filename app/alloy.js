// The contents of this file will be executed before any of
// your view controllers are ever executed, including the index.
// You have access to all functionality on the `Alloy` namespace.
//
// This is a great place to do any initialization for your app
// or create any global variables/functions that you'd like to
// make available throughout your app. You can easily make things
// accessible globally by attaching them to the `Alloy.Globals`
// object. For example:
//
// Alloy.Globals.someGlobalFunction = function(){};

// TODO: Remove all Ti.App.fireEvent('gb_pause' / 'gb_resuem')
// TODO: Use onDestroy() for global app shutdown (works for Android back button and Quit button, NOT long press back button)
// TODO: Detect emulator with 'Unknown sdk' ('manufacturer' + 'model')
// TODO: Use require('/MyClass'); (with slash, without causes issues on some platforms? android?)
// TODO: Check all Ti.App.XXX events for memory leaks (local object may be held until app closes -> set null?)
// TODO: Call $.window.close() wherever appropriate (pass previous window into new controllers, then close on post-layout?)
// TODO: call controller.destroy() wherever appropriate (see docs)
// TODO detect and handle app exit events (back on root window or back long press not detected by onClose, doWinClose)
//		Option: detect back btn presses
// TODO: Use lib folder for utility, db, io libs
// TODO: test out debugger (BROKEN! No breakpoints are ever hit, even in default project with clean build and fresh breakpoints)
// TODO: Activate code completion / Get F3/F4 shortcuts working (suspect not supported in Titanium)

// Reminder: Use var for all local vars. Otherwise a global var will be created or a higher scoped var will be referenced (if exists).
// TODO: Establish consistent naming convention (objects, file names, priv vars/ pub vars)
// TODO: Maintain ios compatibility (back button + no quit btn + ?)


//************************************************************************************************************
// Global variable/constant/function definitions
//************************************************************************************************************

//var Gb = {}; // Geobotanica global namespace (Don't use. Access to Alloy controllers will be deprecated)
Alloy.Globals.Gb = {}; // Geobotanica global Alloy namespace
var Gb = Alloy.Globals.Gb; // Geobotanica namespace alias (defined like this in all controllers)
Gb.APP_NAME = 'Geobotanica';
Gb.osname = Ti.Platform.osname;
Gb.deviceManufacturer = Ti.Platform.manufacturer;
Gb.deviceManufacturer = Gb.deviceManufacturer.charAt(0).toUpperCase() + Gb.deviceManufacturer.slice(1); // Uppercase 1st
Gb.deviceModel = Ti.Platform.model;
Gb.appStartTime = new Date().getTime();
Gb.orientation = Ti.Gesture.getOrientation();
Gb.lastOrientationChangeTime = Gb.appStartTime;
//Gb.deviceWidth = Ti.Platform.DisplayCaps.getPlatformWidth(); // Depends on orientation
//Gb.deviceHeight = Ti.Platform.DisplayCaps.getPlatformHeight(); // Depends on orientation
Gb.deviceWidth = Titanium.Platform.displayCaps.platformWidth; // Depends on orientation
Gb.deviceHeight = Titanium.Platform.displayCaps.platformHeight; // Depends on orientation
Gb.deviceAspectRatio; // = Gb.max(Gb.deviceWidth, Gb.deviceHeight) / Gb.min(Gb.deviceWidth, Gb.deviceHeight);
Gb.dataDir = Ti.Filesystem.applicationDataDirectory;
Gb.extDir = Ti.Filesystem.externalStorageDirectory;
Gb.logv = function(message) { Ti.API.trace(message); };
Gb.logd = function(message) { Ti.API.debug(message); };
Gb.logi = function(message) { Ti.API.info(message); };
Gb.logw = function(message) { Ti.API.warn(message); };
Gb.loge = function(message) { Ti.API.error(message); };
Gb.lastClickTime = 0;


Gb.createDir = function(path) {
	var dir = Ti.Filesystem.getFile(path);
	if(dir.exists() == false || dir.isDirectory() == false) {
		Gb.logv('Creating directory: ' + path);
		if(dir.createDirectory() == false) {
			Gb.loge('Error creating directory: ' + path);
		}
	}
	dir = null;
};

Gb.initDb = function() {
	Alloy.Collections.instance('Profile'); // Create global instance
	Alloy.Collections.instance('Photo'); // Create global instance
	Alloy.Collections.Profile.fetch();
	Alloy.Collections.Photo.fetch();
	if(Alloy.Collections.Profile.where({ nickname: 'Guest' }).length == 0) {
		Gb.logv("Creating default profile in db: 'Guest'");
		Alloy.Collections.Profile.create({
			nickname: 'Guest',
			createdOn: Gb.getCurrDateTime(),
		});
	}
};

// External directory for profiles data
Gb.getProfilesExtDir = function() {
	return Gb.extDir + '/profiles';
};

Gb.getCurrDateTime = function() { // In format: YYYY-MM-DD_HH-MM-SS-SSS
	var utcTime = new Date().toISOString();
	utcTime = utcTime.slice(0, 23);
	utcTime = utcTime.replace('T', '_');
	utcTime = utcTime.replace(':', '-');
	utcTime = utcTime.replace(':', '-');
	utcTime = utcTime.replace('.', '-');
	return utcTime;
	// Can be reversed: new Date(year, month, day, hours, minutes, seconds, milliseconds);
};

Gb.max = function(x,y) {
	return x > y ? x : y;
};

Gb.min = function(x,y) {
	return x < y ? x : y;
};

Gb.logOrientation = function() {
	Gb.lastOrientationChangeTime = new Date().getTime();
	var message;
	switch(Gb.orientation) {
		case Ti.UI.PORTRAIT: {
			Gb.logd('New orientation: Portrait');
			break;
		}
		case Ti.UI.LANDSCAPE_LEFT: {
			Gb.logd('New orientation: Landscape left');
			break;
		}
		case Ti.UI.UPSIDE_PORTRAIT: {
			Gb.logd('New orientation: Upside-down portrait');
			break;
		}
		case Ti.UI.LANDSCAPE_RIGHT: {
			Gb.logd('New orientation: Landscape right');
		}
	};
};

Gb.isDuplicateClickEvent = function() {
	var utcTime = new Date().getTime();
	if(utcTime - Gb.lastClickTime < 100) {
//		Gb.logv('Ignoring duplicate click event.');
		return true;
	}
	Gb.lastClickTime = utcTime;
	return false;
};

//************************************************************************************************************
// Global Callbacks
//***********************************************************************************************************

var doAccelerometer = function(e) {
	if(Gb.orientation == Ti.UI.LANDSCAPE_LEFT && e.x < 0)
		Gb.orientation = Ti.UI.LANDSCAPE_RIGHT;
	else if(Gb.orientation == Ti.UI.PORTRAIT && e.y < 0)
		Gb.orientation = Ti.UI.UPSIDE_PORTRAIT;
	Gb.logOrientation();
	Ti.App.fireEvent('gb_orientation');
    Ti.Accelerometer.removeEventListener('update', doAccelerometer);
};

//************************************************************************************************************
//App Initialization
//***********************************************************************************************************

Gb.deviceAspectRatio = Gb.max(Gb.deviceWidth, Gb.deviceHeight) / Gb.min(Gb.deviceWidth, Gb.deviceHeight);
Gb.deviceAspectRatio = Gb.deviceAspectRatio.toFixed(2);

Gb.logi(Gb.APP_NAME);
Gb.logd('device = ' + Gb.deviceManufacturer + ' ' + Gb.deviceModel);
Gb.logd('screen (w, h, aspect ratio) = (' + Gb.deviceWidth + ', ' + Gb.deviceHeight + ', ' + Gb.deviceAspectRatio + ')');
Gb.logd('OS_ANDROID = ' + OS_ANDROID);
Gb.logd('OS_IOS = ' + OS_IOS);
Gb.logOrientation();
//Gb.logv('Current date/time is: ' + Gb.getCurrDateTime()); // YYYY-MM-DD_HH-MM-SS-SSS


// Get global refs to db tables. Ensure default data is present in the db.
Gb.initDb();

Ti.Geolocation.setAccuracy(Ti.Geolocation.ACCURACY_HIGH);
// TODO: Set Ti.Geolocation.purpose (req'd for iOS >4.0)
//Ti.Geolocation.preferredProvider = "gps";

//Titanium.App.idleTimerDisabled = true; // Keep screen on. Apparently iOS only.
//Titanium.UI.View.keepScreenOn = true; // Apparently Android only.

//************************************************************************************************************
// Register Global Listeners
//***********************************************************************************************************

// WARNING! This event is NOT fired if only Portrait<->Upside-down portrait OR only Landscape left <-> Landscape Right
// Need to update Gb.orientation somehow? Periodic accelerometer checks? (affects orientation stored for captured photos)
// Perhaps a non-issue since P<->UP or LL<->LR is unlikely if all 4 orientations are enabled
Ti.Gesture.addEventListener('orientationchange', function (e) { // TODO: Remove on app close?
	Gb.orientation = e.orientation;
	Gb.deviceWidth = Titanium.Platform.displayCaps.platformWidth; // Depends on orientation
	Gb.deviceHeight = Titanium.Platform.displayCaps.platformHeight; // Depends on orientation
	
	if(OS_ANDROID) // Fix for orientations: PU, LR
		Ti.Accelerometer.addEventListener('update', doAccelerometer);
	else {
		Gb.logOrientation();
		Ti.App.fireEvent('gb_orientation');
	}
});

// TODO: Figure out how to detect force quit (long press back on Android) -> Store values in Ti prefs to detect on restart
	// For Android >= 3.0: http://docs.appcelerator.com/titanium/3.0/#!/api/Titanium.UI.Window-event-androidback
if(OS_ANDROID) { // Both are fired on Android orientation!?
	Ti.Android.currentActivity.addEventListener('pause', function(e) {
		setTimeout(function() { // Need to delay to avoid race condition with orientation change event
			if(new Date().getTime() - Gb.lastOrientationChangeTime < 500 || Gb.orientation != Ti.Gesture.getOrientation())
				Gb.logv("onPause() triggered by orientation change. Silently ignoring...");
			else {
				Gb.logd('Android: onPause()');
				Ti.App.fireEvent('gb_pause');
			}
		}, 200);
	});
	Ti.Android.currentActivity.addEventListener('resume', function(e) {
		setTimeout(function() { // Need to delay to avoid race condition with orientation change event
			if(new Date().getTime() - Gb.lastOrientationChangeTime < 500 || Gb.orientation != Ti.Gesture.getOrientation())
				Gb.logv("onResume() triggered by orientation change. Silently ignoring...");
			else {
				Gb.logd('Android: onResume()');
				Ti.App.fireEvent('gb_resume');
			}
		}, 200);
	});
	Ti.Android.currentActivity.addEventListener('start', function(e) {
		Gb.logd('Android: onStart()');
	});
	Ti.Android.currentActivity.addEventListener('stop', function(e) {
		Gb.logd('Android: onStop()');
	});
	Ti.Android.currentActivity.addEventListener('create', function(e) {
		Gb.logd('Android: onCreate()');
	});
	Ti.Android.currentActivity.addEventListener('destroy', function(e) {
		Gb.logd('Android: onDestroy()');
	});
}

//PREVIOUS PROBLEM
//Android lifecycle events are not received when using heavyweight windows (either by view.xml or forced like camera overlay)
//Setting the navbar and fullscreen in TiApp.xml allows Ti.Android lifecycle events to be recieved
//But when windows are lightweight pressing back button anywhere will exit the app.
//Solution 1: Stick with lightweight windows and override the android back button functionality (PROB NOT GOOD SOL'N)
//		If setting navbarhidden="true", must be done in tiapp.xml
//Solution 2: Register for and listen to windows events 'pause' and 'resume' (CURRENTLY USED)
//		Con: Must register listeners in EACH controller
//		http://developer.appcelerator.com/question/145885/runtime-error-for-activityaddeventlistener-on-android-using-sdk-30


/* TODO: Use these constants so that conditional code is automatically removed on a per platform basis	
    OS_ANDROID : true if the current compiler target is Android
    OS_BLACKBERRY: true if the current compiler target is BlackBerry
    OS_IOS : true if the current compiler target is iOS
    OS_MOBILEWEB : true if the current compiler target is Mobile Web
    OS_TIZEN : true if the current compiler target is Tizen
    ENV_DEV : true if the current compiler target is built for development (running in the simulator or emulator)
    ENV_TEST : true if the current compiler target is built for testing on a device
    ENV_PRODUCTION : true if the current compiler target is built for production (running after a packaged installation)


CHECK FXN PARAM TYPE
function myFunction(myDate, myString) {
  if(arguments.length > 1 && typeof(Date.parse(myDate)) == "number" && typeof(myString) == "string") {
    //Code here
  }
}
*/
