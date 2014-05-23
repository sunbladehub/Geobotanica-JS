/*
 * Controller description here
 */

//************************************************************************************************************
// Controller initialization
//************************************************************************************************************

var Gb = Alloy.Globals.Gb; // Geobotanica namespace alias
Gb.logv('View Photo controller init.');

// Set photo and get some values
var args = arguments[0] || {};
var photo = args.photo; // Photo model

if(photo == null) {
	Gb.loge('View Photo: Error getting photo.');
} else {
	Gb.logv('View Photo: Photo received.');
	
	var path = photo.getPath();
	Gb.logd('Setting photo to: ' + path);
	$.imgPhoto.setImage(path);
	
	var photoAspectRatio = photo.get('width') / photo.get('height');
	var photoSize = photo.getSizeAfterRotation();
	var isPhotoLonger = photoAspectRatio > Gb.deviceAspectRatio ? true : false;
	
	// Set photo rotation/scale matrix 
	var angle = photo.getRotationAngle();
	if(angle != 0) { // Rotate image if necessary.
		Gb.logv('Rotating photo: ' + angle);
		var matrix = Ti.UI.create2DMatrix({ rotate: angle });
		if(angle != 180) { // Correct effect of rotation by scaling if angle = 90 / -90
			Gb.logv('Scaling photo (x, y): (' + photoAspectRatio + ', ' + 1 / photoAspectRatio + ')');
			matrix = matrix.scale(photoAspectRatio, 1 / photoAspectRatio);
		}
		$.imgPhoto.setTransform(matrix);
	}
	UpdateImageSettings();
}


$.viewPhoto.open({ 
//	orientationModes: [
//		Titanium.UI.PORTRAIT,
//		Titanium.UI.LANDSCAPE_LEFT,
//		Titanium.UI.UPSIDE_PORTRAIT,
//		Titanium.UI.LANDSCAPE_RIGHT
//	]
});
//$.overlay.getView('overlay').open({ }); // TODO: Figure out how to reuse overlay window for all photo info controls



//TODO [if applicable] automatically remove this event listener appropriately (global event listeners can cause memory leaks)
//Register custom event listener for new users (temporary)
Ti.App.addEventListener('gb_orientation', UpdateImageSettings); // Need custom orientation event to get corrected orientation

//$.viewPhoto.addEventListener('postlayout', function (e) {
//	Gb.logv('postlayout fired.');
//	var rect = $.imgPhoto.getRect();
//	Gb.logv('imgPhoto (x, y, w, h) = ' + rect.x + ', ' + rect.y + ', ' + rect.width + ', ' + rect.height);
//	var rect = $.viewPhoto.getRect();
//	Gb.logv('window (x, y, w, h) = ' + rect.x + ', ' + rect.y + ', ' + rect.width + ', ' + rect.height);
//});


var isFirstLayoutEvent = true;
$.viewPhoto.addEventListener('postlayout', function() {
	if(isFirstLayoutEvent) {
		isFirstLayoutEvent = false;
		Gb.logv('View Photo: First post-layout event.');
		if(OS_ANDROID) { // Both are fired on Android orientation!?
			$.viewPhoto.activity.addEventListener('pause', function(e) {
				if(new Date().getTime() - Gb.lastOrientationChangeTime < 500 || Gb.orientation != Ti.Gesture.getOrientation())
					Gb.logv("onPause() triggered by orientation change. Silently ignoring...");
				else {
					Gb.logd('View Photo: onPause()');
					Ti.App.fireEvent('viewPhoto:pause');
				}
			});
			$.viewPhoto.activity.addEventListener('resume', function(e) {
				if(new Date().getTime() - Gb.lastOrientationChangeTime < 500 || Gb.orientation != Ti.Gesture.getOrientation())
					Gb.logv("onResume() triggered by orientation change. Silently ignoring...");
				else {
					Gb.logd('View Photo: onResume()');
				}
			});
		}
	}
});

//************************************************************************************************************
// Functions
//************************************************************************************************************

function UpdateImageSettings() {
	// Default size and position of the photo
	var x = 0, y = 0, w = Gb.deviceWidth, h = Gb.deviceHeight;
	
	// Set the position and size of the photo
	var is_landscape = Gb.orientation == Ti.UI.LANDSCAPE_LEFT || Gb.orientation == Ti.UI.LANDSCAPE_RIGHT;
	if((is_landscape == false && isPhotoLonger == false) || (is_landscape == true && isPhotoLonger == true)) {
		h = Gb.deviceWidth * (photoSize.h / photoSize.w);
		y = (Gb.deviceHeight - h) / 2; // Horizontal black bars
	} else {
		w = Gb.deviceHeight * (photoSize.w / photoSize.h); // Vertical black bars
		x = (Gb.deviceWidth - w) / 2; // TODO: Why is it offset to the left after portrait -> landscape?
//		x = -115; // Offset is a little more than this
	}
	$.imgPhoto.setLeft(x);
	$.imgPhoto.setTop(y);
	$.imgPhoto.setWidth(w);
	$.imgPhoto.setHeight(h);
	Gb.logv('photo (x, y, w, h) = (' + x + ', ' + y + ', ' + w + ', ' + h + ')');
}
//$.imgPhoto.center = { x:'50%', y:'50%' }; // Buggy with rotation!

//************************************************************************************************************
// Event Callback Functions
//************************************************************************************************************

function doClick(e) {
	if(e.source == $.viewPhoto) {
		Gb.logv('Screen tapped.');
	} else if(e.source == $.btn) {
		Gb.logv('Close button pressed.');
		$.viewPhoto.close({ });
	}
}

function doWinOpen(e) {
	Gb.logd('View Photo: Opened window.');
}

function doWinFocus(e) {
	Gb.logd('View Photo: Focused on window.');
}

function doWinClose(e) {
	Gb.logd('View Photo: Closed window.');
	Ti.App.removeEventListener('gb_orientation', UpdateImageSettings);
}

function doGbOrientation() {
	UpdateImageSettings();
}

