/*
 * Overlay widget 
 * Description here...
 */

// TODO: Long-term. Check out TiOsm at https://github.com/3ign0n/TiOpenStreetMap
//				Related: https://code.google.com/p/osmdroid/
// 				Alternative: http://openlayers.org/ (webview)

//************************************************************************************************************
// Library references
//************************************************************************************************************

var libGps;


//************************************************************************************************************
// Controller initialization
//************************************************************************************************************

var Gb = Alloy.Globals.Gb; // Geobotanica namespace alias
//Gb.logv('Overlay Widget controller init.');
var isVisible = true;
var TXT_BTN_GET_LOC = 'Get Location';

// BUGGY!
//var isFirstLayoutEvent = true;
//$.widget.addEventListener('postlayout', function() { ...


//************************************************************************************************************
// Event Callback Functions
//************************************************************************************************************

function doClick(e) {
	if(Gb.isDuplicateClickEvent()) // TODO: Use everywhere
		return;
	Ti.App.fireEvent('camera:click'); // Should be ok if this is fired in viewPhoto since Camera is paused/stopped
	if(e.source == $.btnGps) {
		libGps = require('gps');
		if(libGps.isActive()) {
			Gb.logv('Canceling GPS update...');
			$.txtGps.setText('Location fetch canceled');
			$.btnGps.setTitle(TXT_BTN_GET_LOC);
			libGps.removeEventListener($.widget);
		} else {
			Gb.logv('Fetching GPS coordinates now...');
			$.txtGps.setText('Fetching location now...');
			$.btnGps.setTitle('Cancel GPS');
			var locationRequest = libGps.addEventListener($.widget, {
				update: function(location) {
					$.txtGps.setText('Recieved location #' + locationRequest.locationCount + '\n' +
						'Accuracy:\n  Current: ±' + location.accuracy + ' m\n' + 
						'  Best: ±' + locationRequest.bestAccuracyObserved + ' m (' + locationRequest.bestLocationCount + 'x, 1st @ #' + locationRequest.bestLocationId + ')\n');
//						'  Target: ±' + locationRequest.targetAccuracy + ' m)'); // TODO: Get from user prefs
				},
				accurateUpdate: function(location) {
					var timeToComplete = (location.timestamp - locationRequest.startTime) / 1000;
					var min = timeToComplete / 60; min = min.toFixed();
					var sec = (timeToComplete % 60); sec = sec.toFixed(1);
					$.txtGps.setText('Got accurate location in ' + min + ' min, ' + sec + ' s!\n' + 
						'Accuracy: ±' + location.accuracy + ' m');
					$.btnGps.setTitle(TXT_BTN_GET_LOC);
				},
				timeout: function() {
					$.txtGps.setText('GPS timed out');
					$.btnGps.setTitle(TXT_BTN_GET_LOC);
				},
				cancel: function() {
					$.txtGps.setText('Location fetch cancelled');
					$.btnGps.setTitle(TXT_BTN_GET_LOC);
				},
				error: function(msg) {
					$.txtGps.setText('Error: ' + msg);
					$.btnGps.setTitle(TXT_BTN_GET_LOC);
				}
			});
		}
	} else if (e.source == $.viewContainer || e.source == $.viewUnder) { // This is the only approach that worked so far... 
		isVisible = isVisible ? false : true;
		$.viewContainer.setVisible(isVisible);
		Gb.logv('Overlay widget: Screen tapped. Overlay visible = ' + isVisible);
	}
}

function doFocus(e) { // NEVER GETS FIRED!!
	Gb.logv('Overlay Widget: Focused on View.');
}

function doPostlayout(e) {
//	Gb.logv('Overlay Widget: Post layout event from view.');
}

//function doWinOpen(e) {
//	Gb.logd('Overlay Widget: Opened window.');
//}
//
//function doWinClose(e) {
//	Gb.logd('Overlay Widget: Closed window.');
//}

//
//function translateErrorCode(code) { // Docs indicate consts relevant to iOS only.
//	if (code == null)
//		return null;
//	switch (code) {
//		case Ti.Geolocation.ERROR_LOCATION_UNKNOWN:
//			return "Location unknown";
//		case Ti.Geolocation.ERROR_DENIED:
//			return "Access denied";
//		case Ti.Geolocation.ERROR_NETWORK:
//			return "Network error";
//		case Ti.Geolocation.ERROR_HEADING_FAILURE:
//			return "Failure to detect heading";
//		case Ti.Geolocation.ERROR_REGION_MONITORING_DENIED:
//			return "Region monitoring access denied";
//		case Ti.Geolocation.ERROR_REGION_MONITORING_FAILURE:
//			return "Region monitoring access failure";
//		case Ti.Geolocation.ERROR_REGION_MONITORING_DELAYED:
//			return "Region monitoring setup delayed";
//	}
//}
