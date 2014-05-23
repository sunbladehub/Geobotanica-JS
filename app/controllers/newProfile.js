/*
 * Controller description here
 */

//************************************************************************************************************
// Controller initialization
//************************************************************************************************************

var Gb = Alloy.Globals.Gb; // Geobotanica namespace alias
Gb.logv('New Profile controller init.');
$.newProfile.open({
//	modal: true // Shows a fuzzy screen momentarily when app exits. Otherwise does not function as expected
});

var isFirstLayoutEvent = true;
$.newProfile.addEventListener('postlayout', function() {
	if(isFirstLayoutEvent) {
		isFirstLayoutEvent = false;
		Gb.logv('New Profile: First post-layout event.');
		if(OS_ANDROID) { // Both are fired on Android orientation!?
			$.newProfile.activity.addEventListener('pause', function(e) {
				if(new Date().getTime() - Gb.lastOrientationChangeTime < 500 || Gb.orientation != Ti.Gesture.getOrientation())
					Gb.logv("onPause() triggered by orientation change. Silently ignoring...");
				else {
					Gb.logd('New Profile: onPause()');
				}
			});
			$.newProfile.activity.addEventListener('resume', function(e) {
				if(new Date().getTime() - Gb.lastOrientationChangeTime < 500 || Gb.orientation != Ti.Gesture.getOrientation())
					Gb.logv("onResume() triggered by orientation change. Silently ignoring...");
				else {
					Gb.logd('New Profile: onResume()');
				}
			});
		}
	}
});

//************************************************************************************************************
// Event Callback Functions
//************************************************************************************************************

function doCBoxChange(e) {
	var state = e.value;
	Gb.logv('Passphrase: ' + state);
	$.txtFldPW.setVisible(state);
	if(state)
		$.txtFldPW.focus(); // TODO: does nothing
	else
		$.txtFldPW.setValue('');
		$.txtFldName.focus();
//	doTxtFldChange({});
}

function doClick(e) {
	// TODO: Place validation code in separate fxn. What about model.isValid() (needed for profile changes too)
	var nickname = $.txtFldName.value;
	var passphrase = $.txtFldPW.value;
	var profile;
	if(e.source == $.btnOK) {
		
		// Validate nickname/passphrase
		if(nickname.length == 0) {
			Ti.UI.createNotification({ message: "Please enter a nickname"}).show();
			return;
		} else if(nickname.length < 3) {
			Ti.UI.createNotification({ message: "Nickname must be at least 3 characters"}).show();
			return;
		} else if(nickname.length > 15) {
			Ti.UI.createNotification({ message: "Nickname must not exceed 15 characters"}).show();
			return;
		} else if(Alloy.Collections.Profile.where({ nickname: nickname }).length != 0) {
			Ti.UI.createNotification({ message:"Nickname already taken. Sorry!"}).show();
			return;
		}
		if($.cBoxPW.value == true) {
			if(passphrase.length == 0) {
				Ti.UI.createNotification({ message: "Please enter a passphrase"}).show();
				return;
			} else if(passphrase.length < 6) {
				Ti.UI.createNotification({ message: "Passphrase must be at least 6 characters"}).show();
				return;
			} else if(passphrase.length > 20) {
				Ti.UI.createNotification({ message: "Passphrase must not exceed 20 characters"}).show();
				return;
			}
		}
		// Save new profile
		Gb.logd('Creating profile: ' + nickname + ' / ' + passphrase);

		profile = Alloy.Collections.Profile.create({
			nickname: nickname,
			createdOn: Gb.getCurrDateTime(),
//			lastAccessedOn:"",
		});
		if($.cBoxPW.value == true) {
			profile.set({passphrase: passphrase});
			profile.save();
		}
//		$.Profiles.create({nickname: nickname} ); // Produces error
		
//		if(Ti.App.Properties.hasProperty('GbProfiles')) 
//			profiles = Ti.App.Properties.getList('GbProfiles');
//		profiles[profiles.length] = {name: nickname};
//		Ti.App.Properties.setList('GbProfiles', profiles);
		
	}
	$.newProfile.close();
}

function doWinClose(e) {
	Gb.logd('New Profile: Closed window.');
}


//function doTxtFldChange(e) { // CBox causes problems until checked/unchecked
//	if(e.source)
//	Gb.logv('doTxtFldChange()');
//	Gb.logv('cBox=' + $.cBoxPW.value);
//	Gb.logv('txtFldName=' + $.txtFldName.value);
//	Gb.logv('txtFldPW=' + $.txtFldPW.value);
//	Gb.logv($.txtFldName.value.length > 0);
//	Gb.logv("!$.cBoxPW.value=" + $.cBoxPW.value == false);
//	Gb.logv($.txtFldPW.value.length > 0);
//	
////	if($.txtFldName.value.length == 0 || ($.cBoxPW.value && $.txtFldPW.value.length == 0) ) {
//	if($.txtFldName.value.length > 0 && ($.cBoxPW.value==false || $.txtFldPW.value.length > 0) ) {
//		$.btnOK.setEnabled(true);
//		Gb.logv('enable');
//	} else {
//		$.btnOK.setEnabled(false);
//		Gb.logv('disable');`
//	}
//}

