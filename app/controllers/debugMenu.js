/*
 * Controller description here
 */

//************************************************************************************************************
// Controller initialization
//************************************************************************************************************

var Gb = Alloy.Globals.Gb; // Geobotanica namespace alias
Gb.logv('Debug Menu controller init.');
$.debugMenu.open({ });

var isFirstLayoutEvent = true;
$.debugMenu.addEventListener('postlayout', function() {
	if(isFirstLayoutEvent) {
		isFirstLayoutEvent = false;
		Gb.logv('Debug Menu: First post-layout event.');
		if(OS_ANDROID) { // Both are fired on Android orientation!?
			$.debugMenu.activity.addEventListener('pause', function(e) {
				if(new Date().getTime() - Gb.lastOrientationChangeTime < 500 || Gb.orientation != Ti.Gesture.getOrientation())
					Gb.logv("onPause() triggered by orientation change. Silently ignoring...");
				else {
					Gb.logd('Debug Menu: onPause()');
				}
			});
			$.debugMenu.activity.addEventListener('resume', function(e) {
				if(new Date().getTime() - Gb.lastOrientationChangeTime < 500 || Gb.orientation != Ti.Gesture.getOrientation())
					Gb.logv("onResume() triggered by orientation change. Silently ignoring...");
				else {
					Gb.logd('Debug Menu: onResume()');
				}
			});
			$.debugMenu.activity.addEventListener('start', function(e) {
				Gb.logd('Debug Menu: onStart()');
			});
			$.debugMenu.activity.addEventListener('stop', function(e) {
				Gb.logd('Debug Menu: onStop()');
			});
			$.debugMenu.activity.addEventListener('create', function(e) {
				Gb.logd('Debug Menu: onCreate()');
			});
			$.debugMenu.activity.addEventListener('destroy', function(e) {
				Gb.logd('Debug Menu: onDestroy()');
			});
		}
	}
});

//************************************************************************************************************
// Event Callback Functions
//************************************************************************************************************

function doClick(e) {
	if(e.source == $.btnDeleteData) {
		var file = Ti.Filesystem.getFile(Gb.extDir);
		if(file.deleteDirectory(true) == true) // Does nothing if not directory
			Ti.UI.createNotification({ message: 'Deleted directory on external media'}).show();
		file = null;
	} else if (e.source == $.btnResetDb) {
		Gb.logw('Resetting all database records!');
		var db = Ti.Database.open('_alloy_');
		// TODO: Automatically get names of tables via PRAGMA table_info() and delete them all (or find a better way)
		var deleteRecords = db.execute('DELETE FROM profiles');
		var deleteRecords = db.execute('DELETE FROM photos');
		Gb.logv('Affected rows: ' + db.getRowsAffected());
		db.close();
		Gb.initDb();
		Ti.UI.createNotification({ message: 'Database is now reset' }).show();
	} else if (e.source == $.btnDeleteDb) {
		Gb.logw('Deleting app database now!');
		var db = Ti.Database.open('_alloy_');
		db.close();
		db.remove();
		$.debugMenu.close();
		Ti.UI.createNotification({ message:"Database deleted.\n  Please restart app."}).show();
//		Gb.logw('Dropping app tables now!');
//		var db = Ti.Database.open('_alloy_');
//		var deleteRecords = db.execute('DROP TABLE IF EXISTS profiles');
//		db.close();
//		Ti.UI.createNotification({ message:"Database tables deleted.\nPlease restart app."}).show();
	} else if (e.source == $.btnBack) {
		$.debugMenu.close();
	}
}

function doWinClose(e) {
	Gb.logd('Debug Menu: Closed window.');
}
