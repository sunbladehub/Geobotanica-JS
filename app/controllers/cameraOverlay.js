/*
 * Controller description here
 */

//************************************************************************************************************
// Controller initialization
//************************************************************************************************************

var Gb = Alloy.Globals.Gb; // Geobotanica namespace alias
Gb.logv('Camera Overlay controller init.');
//$.cameraOverlay.open({ }); // Not required for camera overlay
var isFirstLayoutEvent = true;

//************************************************************************************************************
// Event Callback Functions
//************************************************************************************************************

function doClick(e) {
	Ti.App.fireEvent('camera:click');
	if(e.source == $.btnCapture) {
		Gb.logv('Taking photo...');
		Ti.Media.takePicture();
	}
}

function doWinOpen(e) { // NEVER FIRED!!
	Gb.logd('Camera Overlay: Opened window.');
}

function doFocus(e) { // NEVER FIRED!!
	Gb.logv('Camera Overlay: Focused on View.');
}

function doPostlayout(e) {
	if(isFirstLayoutEvent) {
		isFirstLayoutEvent = false;
		$.cameraOverlay.addEventListener('android:back', function() { // NEVER FIRED!!!
			Gb.logv('Camera Overlay: Android:back button pressed.');
		});
	}
	Gb.logv('Camera Overlay: Post layout event.');
	Ti.App.fireEvent('cameraOverlay:postlayout');
}

function doWinClose(e) { // NEVER FIRED!!
	Gb.logd('Camera Overlay: Closed window.');
}
