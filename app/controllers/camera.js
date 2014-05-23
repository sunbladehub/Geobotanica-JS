/*
 * Controller description here
 */

// TODO: Show progress dialog while camera is starting/restarting
// TODO: Show progress animation while photo is being captured? (or hide button)
// TODO: Fix issue where Index has gray semi-transparent cover after exiting Camera (back removes cover) NOT OBSERVED RECENTLY
// TODO: Include buttons for keep, retake and cancel
// TODO: Photo saved to file system is high-res. Figure out if this can be easily reduced/controlled. 
//		imageAsResized() ? Android 3.0+ only


//************************************************************************************************************
// Controller initialization
//************************************************************************************************************

var args = arguments[0] || {};
var cameraUnderlay = args.cameraUnderlay;
var profile = args.profile;

var Gb = Alloy.Globals.Gb; // Geobotanica namespace alias
Gb.logv('Camera controller init.');
$.camera.open({ }); // Black bg only.
//var isRestartingNow = false;
var isTakingPhoto = false; // True only after 'success' event for showCamera() is received
var isFirstFocusEvent = true;
var isFirstPostLayoutEvent = true;

if(Ti.Media.isCameraSupported == false)
	Gb.loge('Camera is not available / supported');
//cameras = Ti.Media.availableCameras; // Requires Android >= 3.2
//for(i = 0; i < cameras.length; ++i) {
//	if(cameras[i] == Ti.Media.CAMERA_REAR)
//		Gb.logd("Camera #" + i + " is rear facing.");
//	if(cameras[i] == Ti.Media.CAMERA_FRONT)
//		Gb.logd("Camera #" + i + " is front facing.");
//}
startCamera();


//************************************************************************************************************
//Register Event Callbacks
//************************************************************************************************************

//Force screen on for at least screenTimeoutPeriod ms while camera on
//Screen timeout is renewed whenever button is pressed
$.camera.keepScreenOn = true; // Apparently Android only.
//Titanium.App.idleTimerDisabled = true; // Keep screen on. Apparently iOS only. Not tested.
var screenTimeoutPeriod = 300000; // 5 min   TODO: Store this in user prefs
var screenTimeoutCallback = function() {
	Gb.logv('Camera: Screen timeout triggered. Passing screen shut off management to OS now...');
	$.camera.keepScreenOn = false; 
};
var screenTimeoutRef;
resetScreenTimeout();
Ti.App.addEventListener('camera:click', resetScreenTimeout);

var lastCameraOverlayPostLayoutTime = 0; // Ugly hackish way to isolate back button events 
	// For screen off -> on, return from other app or above window popped events, 
	// Camera focus event is fired shortly after Camera Overlay postlayout event 
var cameraOverlayPostLayoutCallback = function() {
//	Gb.logv('Camera: cameraOverlay:postlayout event received.');
	lastCameraOverlayPostLayoutTime = new Date().getTime();
};
Ti.App.addEventListener('cameraOverlay:postlayout', cameraOverlayPostLayoutCallback);

// TODO: Fix this to be general towards any window above Camera
var lastViewPhotoPauseTime = 0; // Ugly hackish way to isolate back button events 
var viewPhotoPauseCallback = function() {
	Gb.logv('Camera: Detected viewPhoto pause event.');
    lastViewPhotoPauseTime = new Date().getTime();
};
Ti.App.addEventListener('viewPhoto:pause', viewPhotoPauseCallback);


//Ti.Gesture.addEventListener('orientationchange', function (e) {
//	Gb.logv('Closing camera due to rotation');
//	Titanium.Media.hideCamera(); // REQUIRES ANDROID >=3.2
//});


//************************************************************************************************************
// Functions
//************************************************************************************************************

function startCamera() {
	Gb.logv('Turning on camera now...');
	Ti.Media.showCamera({
		success:function(event) {
			isTakingPhoto = true;
			// called when media returned from the camera
	//		Gb.logv('Media type: ' + event.mediaType);
			if(event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
		        var image = event.media, width = image.width, height = image.height;
		        var path = profile.getPhotoDir();
		        var timestamp = Gb.getCurrDateTime();
		        var filename = timestamp + '.jpg';
		        var file = Titanium.Filesystem.getFile(path, filename);
	    		if(file.write(image) == false)
	    	        Gb.loge('Error saving photo to: ' + path + '/' + filename);
	    		else {
	    	        Gb.logi('Photo captured. Saved to: ' + path + '/' + filename);
	    	        
	    	        // Add entry in database
	    	        var photo = Alloy.Collections.Photo.create({
	    	            "profileId": profile.get('id'),
	//    	            "locationId": "INTEGER",
	//    	            "speciesId": "INTEGER", 
	//    	            "physicalId": "INTEGER",
	    	            "size": file.size,
	    	            "width": width,
	    	            "height": height,
	    	            "orientation": Gb.orientation,
	    	            "camera": Gb.deviceManufacturer + ' ' + Gb.deviceModel,
	    	            "os": Gb.osname,
	    	            "timestamp": timestamp,
	    	            "title": "",
	    	            "collection": "",
	    	        });
	    		}
				Gb.logv('Photo info (w , h, res, aspect ratio) = (' + width + ', ' + height + 
						', ' + width * height / 1000000 + ' MP, ' + width / height + ')');
				
				Alloy.createController('viewPhoto', { photo: photo }).getView('viewPhoto');
		        file = null;
			} else {
				alert("Unexpected media type: " + event.mediaType);
			}
		},
		cancel:function() {
			// called when user cancels taking a picture
			Gb.logv('Camera: takePicture() cancel callback.');
			isTakingPhoto = false;
		},
		error:function(e) {
			// called when there's an error
			isTakingPhoto = false;
			if (e.code == Ti.Media.NO_CAMERA) {
				var alert = Ti.UI.createAlertDialog({title:'Camera'});
				alert.setMessage('Camera is not available/supported.');
				alert.show();
			} else
				Gb.loge('Camera: Error message= ' + e.error + ' (code= ' + e.code + ')');
		},
		saveToPhotoGallery:false,
		//	allowEditing:false, // does nothing? allows cropping after capture?
		mediaTypes:[Ti.Media.MEDIA_TYPE_VIDEO,Ti.Media.MEDIA_TYPE_PHOTO],
		overlay:$.cameraOverlay.getView('cameraOverlay'),
		autohide:false, // Required if takePhoto() will be used. REQUIRES ANDROID >= 3.2
	//	Specifies if the camera should be hidden automatically after the media capture is completed.
	//	On Android, this property is considered only if overlay is also set. When an overlay is not set, 
	//	the default Android Camera Activity is used, which is only capable of reporting back the results of one taken photo,
	//	making autohide meaningless in that context.
		
	//	showControls:false, // On iOS, the overlay view is usually used in conjunction with showControls: false
	});
};

function resetScreenTimeout() {
	Gb.logv('Camera: Resetting screen timeout now...');
	if(screenTimeoutRef) {
		clearTimeout(screenTimeoutRef);
	}
	screenTimeoutRef = setTimeout(screenTimeoutCallback, screenTimeoutPeriod);
};


//************************************************************************************************************
// Event Callback Functions
//************************************************************************************************************

function doClick(e) {
	if(e.source == $.camera) { // NEVER GETS FIRED!!!
		Gb.logv("Camera: Screen tapped.");
	}
}

function doWinOpen(e) {
	Gb.logd('Camera: Opened window.');
}

function doFocus(e) { // Is fired after screen on, return from other app, Android back button and takePicture()
	if(isTakingPhoto) {
		Gb.logv('Camera: Focus event triggered by photo capture. Silently ignoring...');
		return;
	}
	if(isFirstFocusEvent) {
		isFirstFocusEvent = false;
		Gb.logv('Camera: First focus event. Silently ignoring...');
		return;
	}
	var now = new Date().getTime();
	if(now - lastViewPhotoPauseTime < 100 || now - lastCameraOverlayPostLayoutTime < 1000) {
		Gb.logv('Camera: Focus event triggered by screen off -> on, popped window or return from other app.');
		Gb.logv('Camera: Restarting now...');
		resetScreenTimeout();
		startCamera();
	} else {
		Gb.logv('Camera: Focus event triggered by back button. Closing Camera now...');
		$.camera.close();
	}
}

function doPostlayout() {
	if(isFirstPostLayoutEvent) {
		isFirstPostLayoutEvent = false;
		Gb.logv('Camera: First post-layout event.');
		if(OS_ANDROID) { // Both pause and resume events are fired on Android orientation.
			$.camera.activity.addEventListener('pause', function(e) {
				if(new Date().getTime() - Gb.lastOrientationChangeTime < 500 || Gb.orientation != Ti.Gesture.getOrientation())
					Gb.logv("onPause() triggered by orientation change. Silently ignoring...");
				else {
					Gb.logd('Camera: onPause()');
					isTakingPhoto = false;
				}
			});
			$.camera.activity.addEventListener('resume', function(e) {
				if(new Date().getTime() - Gb.lastOrientationChangeTime < 500 || Gb.orientation != Ti.Gesture.getOrientation())
					Gb.logv('onResume() triggered by orientation change. Silently ignoring...');
				else
					Gb.logd('Camera: onResume()');
//				else if(isRestartingNow)
//					Gb.logv('Camera: Resume event triggered by forced restart. Silently ignoring...');
//				else if(isTakingPhoto)
//					Gb.logv('Camera: Resume event triggered by photo capture. Silently ignoring...');
//				else {
//					Gb.logv('Camera: Resume event triggered by back button. Closing Camera now...');
//					$.camera.close();
//				}
			});
//			$.camera.addEventListener('androidback', function() { // Must be Android > 3.0
//			$.camera.addEventListener('android:back', function() { // NEVER GETS FIRED!!!
//				Gb.logv('Camera: Android back button pressed.');
//			});
		}
	}
};

function doWinClose(e) {
	Gb.logd('Camera: Closed window.');
	Ti.App.removeEventListener('cameraOverlay:click', resetScreenTimeout);
	Ti.App.removeEventListener('viewPhoto:pause', viewPhotoPauseCallback);
	Ti.App.removeEventListener('cameraOverlay:postlayout', cameraOverlayPostLayoutCallback);
//	if(isRestartingNow)
//		Alloy.createController('camera', { profile: profile }); // Restart Camera
//	else
//		Ti.App.fireEvent('camera:close');
}

//Titanium.App.idleTimerDisabled = false; // Keep screen on. Apparently iOS only.