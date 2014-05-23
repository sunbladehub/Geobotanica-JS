/*
 * Controller description here
 */

// TODO: Profile manager (delete, change profiles)
// TODO: Back button for ios?
// TODO: Improve layout (separate profile buttons from other action buttons)
// TODO: [Long term] Play with binding UI directly to Models/Collections


//************************************************************************************************************
// Controller initialization
//************************************************************************************************************

var Gb = Alloy.Globals.Gb; // Geobotanica namespace alias
Gb.logv('Login controller init.');
$.login.open({});
initUI();

var isFirstLayoutEvent = true;
$.login.addEventListener('postlayout', function() {
	if(isFirstLayoutEvent) {
		isFirstLayoutEvent = false;
		Gb.logv('Login: First post-layout event.');
		if(OS_ANDROID) { // Both are fired on Android orientation!?
			$.login.activity.addEventListener('pause', function(e) {
				if(new Date().getTime() - Gb.lastOrientationChangeTime < 500 || Gb.orientation != Ti.Gesture.getOrientation())
					Gb.logv("onPause() triggered by orientation change. Silently ignoring...");
				else {
					Gb.logd('Login: onPause()');
				}
			});
			$.login.activity.addEventListener('resume', function(e) {
				if(new Date().getTime() - Gb.lastOrientationChangeTime < 500 || Gb.orientation != Ti.Gesture.getOrientation())
					Gb.logv("onResume() triggered by orientation change. Silently ignoring...");
				else {
					Gb.logd('Login: onResume()');
				}
			});
//			$.login.activity.addEventListener('start', function(e) {
//				Gb.logd('Login:  onStart()');
//			});
//			$.login.activity.addEventListener('stop', function(e) {
//				Gb.logd('Login:  onStop()');
//			});
//			$.login.activity.addEventListener('create', function(e) {
//				Gb.logd('Login:  onCreate()');
//			});
//			$.login.activity.addEventListener('destroy', function(e) {
//				Gb.logd('Login:  onDestroy()');
//			});
		}
	}
});


//************************************************************************************************************
// Model Listeners
//************************************************************************************************************

Alloy.Collections.Profile.on("add", function(profile) {
	Gb.logv("Profiles.onAdd()");
});

Alloy.Collections.Profile.on("change", function(profile) {
	Gb.logv("Profiles.onChange()");
	initUI();
});

Alloy.Collections.Profile.on("destroy", function(profile) {
	Gb.logv("Profiles.onDestroy()");
//	initUI();
});


//************************************************************************************************************
// Event Callback Functions
//************************************************************************************************************

function doClick(e) {
// Required to use title since $.xxx syntax is invalid for dynamically created objects
	var btn_title = e.source.title;
	if (btn_title == 'New Profile') {
		Alloy.createController("newProfile");
//		var ModalWindow = Ti.UI.createWindow({});
//		ModalWindow.open({modal:true});
	} else
		Alloy.createController("camera", { profile: Alloy.Collections.Profile.get(e.source.profile_id) });
}

function doWinClose(e) {
	Gb.logd('Login: Closed window.');
	// Ti.App.removeEventListener('new_user', function(e) { initUI() });
}


//************************************************************************************************************
// Functions
//************************************************************************************************************

function initUI() {
	$.view.removeAllChildren();

//	Populate button data for profiles
	var button_data = [];
	var cnt = 0;

	Alloy.Collections.Profile.fetch();
	var profile_array = Alloy.Collections.Profile.models;
	cnt = profile_array.length;
	for (i = 0; i < cnt; ++i) {
		profile = profile_array[i];
		button_data[i] = { title: profile.get('nickname'), profile_id: profile.get('id')};
	}

//	Add 'New Profile' button data
	button_data.push({ title : "New Profile" });

//	Create/add buttons
	for (i = 0, length = button_data.length; i < length; ++i) {
		Gb.logv("Creating button: " + button_data[i].title);
		var btn = Ti.UI.createButton(button_data[i]);
		btn.setWidth("80%");
		btn.setFont({
			fontSize : '18sp'
		});
		btn.addEventListener('click', doClick);
		$.view.add(btn);
	}

//	buttons.forEach(function(obj) { // SLOWER... see https://coderwall.com/p/kvzbpa
}




//if(Ti.App.Properties.hasProperty('GbProfiles')) {
//	profiles = Ti.App.Properties.getList('GbProfiles');
//	cnt = profiles.length;
//	for(i = 0; i < cnt; ++i) {
//		Gb.logv('Profile ' + (i+1) + ': ' + profiles[i].name);
//		button_data[i] = { title: profiles[i].name }; 
//		most recently used
//	}
//}

