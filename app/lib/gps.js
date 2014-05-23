/*
 * Library description here
 */

/*
 * Gps should shut off if screen goes off (may or may not be automatic -> depends on device HW)
 * 		- Problem: screen off event not detected as pause event (like all other windows)
 * 		- Response: Hopefully shuts off automatically. If not, does gps shutdown timer eventually trigger? (PROB NOT)
 * Gps should resume if screen is turned on (given it was on before)
 * Gps should shut off if leaving camera or viewPhoto (exception: opening viewPhoto from camera after takePicture() )
 * 
 * Current Pause/Resume behaviour
 * First resume is not detectable
 * Screen on/off fires on pause/resume (unless camera is on -> resume/pause both fire after screen comes on)
 * Open different app fires pause. Returning fires resume.
 */

// TODO: Store GPS values in db with photos
// TODO: Prompt user to open gps settings if gps is disabled
// TODO: Check gps timestamps against current system time and warn of offsets
// TODO: Average multiple accurate locations
// TODO: Allow some time after 'accurate' location obtained to receive additional locations (possibly more accurate)
// TODO: Set up user preferences table/model and have gps lib listen to changes
// TODO: Maybe use GPS Android manual mode to filter events based on: accuracy, provider (gps/network), age
// TODO: Long-term: allow an array of location requests to populate. GPS is on if at least one request exists

// Remember fix for offset timestamp: update system time (events might show as stale even though they are not)

// WARNING: CODE BELOW IS NOT A RELIABLE INDICATION FOR GPS CONNECTIVITY (SEE DOCS)
//if (Titanium.Geolocation.locationServicesEnabled === false)


//************************************************************************************************************
// Library initialization
//************************************************************************************************************

var Gb = Alloy.Globals.Gb; // Geobotanica namespace alias
Gb.logv('Initializing GPS library.');
var isActive = false;
var currLocRequest;

// GPS preferences 
// TODO: Associate with user in db. Create model listener to auto-update.
//Each profile has it's own gps preferences (save in database)
var gpsTimeoutPeriodMs = 300000; // 5 min
//var gpsTimeoutPeriodMs = 30000; // 30 s
var gpsTargetAccuracy = 5; // meters


//************************************************************************************************************
//Object definitions
//************************************************************************************************************

var Location = function(e) { // e = Ti.Geolocation location event
	this.latitude = e.coords.latitude || -1;
	this.longitude = e.coords.longitude || -1;
	this.altitude = e.coords.altitude || -1;
	this.accuracy = e.coords.accuracy || -1;
	this.altitudeAccuracy = e.coords.altitudeAccuracy || -1;
	this.provider = e.coords.name || 'unknown';
	this.speed = e.coords.speed || -1;
	this.timestamp = e.coords.timestamp || -1;
	this.osTimestamp = new Date().getTime();
	this.ageInS = (this.timestamp - this.osTimestamp) / 1000; // If large, system time may be offset (unless cached location)
	this.ageInS = this.ageInS.toFixed(2);
	this.isGpsLocationStale = currLocRequest.startTime - 5000 > this.timestamp ? true : false; // 5 s offset in case system time is a little off 
};

//Each request has some data associated with it
//(ONLY 1 REQUEST AT A TIME PERMITTED FOR NOW: use isActive as indicator)
var LocationRequest = function(window, dictCallbacks) {
	var self = this;
	this.window = window;
	this.startTime = new Date().getTime(); // UTC
	this.locationCount = 0; // Total number of location events received on this request.
	this.bestAccuracyObserved = 999; // meters
	this.bestLocationId; // = locationCount at that time.
	this.bestLocationCount; // Keeps record of number of location events received with best accuracy
	
	// Functions
	this.dictCallbacks = {
		update: dictCallbacks.update || function() { },	
		accurateUpdate: dictCallbacks.accurateUpdate || function() { },	
		timeout: dictCallbacks.timeout || function() { },	
		cancel: dictCallbacks.cancel || function() { },	
		error: dictCallbacks.error || function() { },	
	};
	this.gpsTimeoutRef = setTimeout(function() {
		if(isActive) {
			Gb.logi('GPS timeout trigggered. Cancelling location request now...');
			Ti.UI.createNotification({ message: 'GPS timed out'}).show();
			self.dictCallbacks.timeout();
			exports.removeEventListener(currLocRequest.window);
		} else {
			Gb.logw('GPS timeout trigggered when GPS inactive.');
		}
	}, gpsTimeoutPeriodMs);
	this.cancel = function() { clearTimeout(self.gpsTimeoutRef); };
};


//************************************************************************************************************
// Public functions
//************************************************************************************************************

//TODO: Use window to register onClose event
//TODO: Listen for app close or lose focus events
exports.addEventListener = function(window, dictCallbacks) { // Callbacks = { update, accurateUpdate, timeout, cancel, error }
	if(isActive) {
		Gb.logw('Location request already exists! Ignoring request...');
		return;
	}
	Ti.Geolocation.addEventListener('location', doGps);
	currLocRequest = new LocationRequest(window, dictCallbacks);
	isActive = true;
	return currLocRequest;
};

exports.removeEventListener = function(window) { // TODO: Use window to remove a specific request
	if(!isActive) {
		Gb.logw('No location request to cancel! Ignoring request to cancel...');
		return;
	}
	currLocRequest.cancel();
	currLocRequest = null;
	Ti.Geolocation.removeEventListener('location', doGps);
	isActive = false;
};

exports.isActive = function() {
	return isActive;
};

//exports.setTargetAccuracy = function(targetAccuracy) {
//	
//};


//************************************************************************************************************
// Callbacks
//************************************************************************************************************

var doGps = function(e) {
	if(e.success == false) {
		Gb.logw('Get location failed. Message: ' + e.error + '(code = ' + e.code + ')');
		Gb.logw('Silently ignoring...');
//		currLocRequest.dictCallbacks.error(e.error);
		return;
	}
	if(e.error) {
		if(e.code == 0) {
			if(e.error === 'network is disabled') {
				Gb.logv('Location event: network is disabled. Silently ignoring...');
				return;
			} else if (e.error === 'gps is disabled') {
				var msg = 'GPS is disabled.';
				Gb.logv(msg);
				Ti.UI.createNotification({ message: msg }).show();

				currLocRequest.dictCallbacks.error(msg);
				exports.removeEventListener(currLocRequest.window);
				return;
			}
		} else {
			Gb.loge('Error getting location (code = ' + e.code + ')');
			Gb.loge('Error message: ' + e.error);
			currLocRequest.dictCallbacks.error(e.error);
			exports.removeEventListener(currLocRequest.window);
			return;
		}
	}
//	if(e == null || e.coords == null || e.coords.accuracy == null) {
	if(e === undefined || e.coords === undefined || e.coords.accuracy === undefined) {
		Gb.logd('Location event ignored (undefined)');
		return;
	}

	var loc = new Location(e);
	if(loc.isGpsLocationStale) {
		Gb.logd('GPS location is stale (' + loc.ageInS / 60 + ' min). Silently ignoring...');
		return;
	}
	
//	No location error detected. Now process location data.
	++currLocRequest.locationCount;

	if(loc.accuracy < currLocRequest.bestAccuracyObserved) {
		currLocRequest.bestAccuracyObserved = loc.accuracy;
		currLocRequest.bestLocationId = currLocRequest.locationCount;
		currLocRequest.bestLocationCount = 1;
	} else if(loc.accuracy == currLocRequest.bestAccuracyObserved) {
		++currLocRequest.bestLocationCount;
	}

	Gb.logi('GPS location: (lat, long, alt) = (' + loc.latitude + ', ' + loc.longitude + ', ' + loc.altitude + ')');
	Gb.logi('GPS accuracy= ±' + loc.accuracy + ' m ; altitude accuracy= ' + loc.altitudeAccuracy + ' m'); 
	Gb.logi('GPS provider= ' + loc.provider+ '; speed= ' + loc.speed + ' m/s ; timestamp= ' + loc.timestamp); 
	Gb.logi('GPS location age= ' + loc.ageInS + ' s; Location count= ' + currLocRequest.locationCount);
	Gb.logd('Best accuracy= ± ' + currLocRequest.bestAccuracyObserved + ' m (' + 
		currLocRequest.bestLocationCount + 'x, 1st @ #' + currLocRequest.bestLocationId + ')');
	
	if(loc.accuracy > gpsTargetAccuracy) {
		Gb.logi('Waiting for more accurate position...');
		currLocRequest.dictCallbacks.update(loc);
	} else {
		currLocRequest.dictCallbacks.accurateUpdate(loc);
		exports.removeEventListener(currLocRequest.window);
	}
};

