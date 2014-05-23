/*
 * Controller description here
 */

//************************************************************************************************************
// Controller initialization
//************************************************************************************************************

var Gb = Alloy.Globals.Gb; // Geobotanica namespace alias
Gb.logv('Index controller init.');
$.index.open({
//    orientationModes : [ // Not required. Set only in app.tss (requires heavyweight window)
//        Titanium.UI.PORTRAIT,
//        Titanium.UI.UPSIDE_PORTRAIT
//    ]
//	activityEnterAnimation: Ti.Android.R.anim.slide_in_left,
//	activityExitAnimation: Ti.Android.R.anim.slide_out_right,
	exitOnClose: true, // (to set root window)
});

var isFirstLayoutEvent = true;
$.index.addEventListener('postlayout', function() {
	if(isFirstLayoutEvent) {
		isFirstLayoutEvent = false;
		Gb.logv('Index: First post-layout event.');
		if(OS_ANDROID) { // Both are fired on Android orientation!?
			$.index.activity.addEventListener('pause', function(e) {
				if(new Date().getTime() - Gb.lastOrientationChangeTime < 500 || Gb.orientation != Ti.Gesture.getOrientation())
					Gb.logv("onPause() triggered by orientation change. Silently ignoring...");
				else {
					Gb.logd('Index: onPause()');
					Ti.App.fireEvent('gb_pause');
				}
			});
			$.index.activity.addEventListener('resume', function(e) {
				if(new Date().getTime() - Gb.lastOrientationChangeTime < 500 || Gb.orientation != Ti.Gesture.getOrientation())
					Gb.logv("onResume() triggered by orientation change. Silently ignoring...");
				else {
					Gb.logd('Index: onResume()');
					Ti.App.fireEvent('gb_resume');
				}
			});
			$.index.activity.addEventListener('start', function(e) {
				Gb.logd('Index: onStart()');
			});
			$.index.activity.addEventListener('stop', function(e) {
				Gb.logd('Index: onStop()');
			});
			$.index.activity.addEventListener('create', function(e) {
				Gb.logd('Index: onCreate()');
			});
			$.index.activity.addEventListener('destroy', function(e) {
				Gb.logd('Index: onDestroy()');
			});
//			$.index.addEventListener('androidback', function() { // Must be Android > 3.0 -> NOT DETECTED NOW
//				Gb.logv('Index: Android back button pressed.');
//			});
			$.index.addEventListener('android:back', function() {
				Gb.logv('Index: Android:back button pressed.');
				$.index.close();
			});
		}
	}
});

//************************************************************************************************************
// Event Callback Functions
//************************************************************************************************************

function doClick(e) {
	if(e.source == $.btnWelcome) {
		Alloy.createController('login');
	} else if (e.source == $.btnQuit) {
		Gb.logd('Quitting app now.');
		Titanium.Android.currentActivity.finish();
	} else if (e.source == $.btnCamera) {
		var profile = Alloy.Collections.Profile.where({ nickname: 'Guest' })[0];
		Alloy.createController('camera', { profile: profile });
//		Alloy.createController('viewPhoto', { profile: profile });
//	} else if (e.source == $.btnGallery) { // Albums can not be created or selected
//
//		Ti.Media.openPhotoGallery({
//			success:function(event) { },
//			cancel:function(){},
//			error:function(error) {	},
//		}); 
	} else if (e.source == $.btnDebugMenu) {
		Alloy.createController('debugMenu');
	} 
}

function doWinClose(e) {
	Gb.logd('Index: Closed window.');
}


//Colors may be specified as a hex triplet to determine the red, green and blue channels. 
//Thus, '#000000' is specified for black, '#ff0000' for red, '#00ff00' for green, '#0000ff' for blue, 
//and '#ffffff' for white, etc. A channel may be abbreviated when its two hex digits are identical, 
//such as '#000', '#f00', '#0f0#', '#00f' and '#fff' for the above colors, respectively.

//An additional alpha channel is supported as a prefix to the hex triplet. So, to make the purple-like color 
//'#ff00ff' semi-opaque, you could use an alpha value of '55', giving, '#55ff00ff' or '#5f0f'.

//'aqua', 'black', 'blue', 'brown', 'cyan', 'darkgray', 'fuchsia', 'gray', 'green', 'lightgray', 'lime', 'magenta', 'maroon', 'navy', 'olive', 'orange', 'pink', 'purple', 'red', 'silver', 'teal', 'white', 'yellow'.
//All color properties also accept a value of 'transparent'.
