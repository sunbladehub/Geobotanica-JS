

exports.definition = {
    config : {
        "columns": {
            "id": "INTEGER PRIMARY KEY AUTOINCREMENT",
            "profileId": "INTEGER", // Foreign key
            "locationId": "INTEGER", // Foreign key (includes gps, area, etc.)
            "speciesId": "INTEGER", // Foreign key
            "physicalId": "INTEGER", // Foreign key (serial number, QR code, third party id (e.g. city) )
            "size": "INTEGER",
            "width": "INTEGER",
            "height": "INTEGER",
            "orientation": "Integer", // See Ti.Gesture.orientation
            // Android: Portrait=1, Landscape=2 (no others)
            "camera": "TEXT",
            "os": "TEXT",
            // TODO: Add more detail later: flash fired, exposure time, aperture value, ISO Speed Rating, focal length
            "timestamp": "TEXT", // Used to construct filename too: YYYY-MM-DD_HH-MM-SS-SSS.jpg
            "title": "TEXT", // Custom user field
            "collection": "TEXT", // Custom user field
        },
//        "defaults": {
//        	
//        },
        "adapter": {
            type: "sql",
            collection_name: "photos",
        	idAttribute : "id",
//        	"migration" : "1.1"
        }
    },

    extendModel: function(Model) {		
        _.extend(Model.prototype, {
        	
        	getProfile: function() {
        		return Alloy.Collections.Profile.get(this.get('profileId'));
        	},
        	
        	getPath: function() {
        		return Gb.getProfilesExtDir() + '/' + 
        			this.getProfile().get('nickname') + '/images/' + this.get('timestamp') + '.jpg';
        	},
        	
        	getRotationAngle: function() { // Angle to correct image rotation
        		switch(this.get('orientation')) {
	    			case Ti.UI.PORTRAIT : { // = 1
	    				return 90;
	    			}
	    			case Ti.UI.LANDSCAPE_LEFT : { // = 2
	    				return 0;
	    			}
	    			case Ti.UI.UPSIDE_PORTRAIT : { // = 3
	    				return -90;
	    			}
	    			case Ti.UI.LANDSCAPE_RIGHT : { // = 4
	    				return 180;
	    			}
    			};
        	},
        	
        	getSizeAfterRotation: function() {
        		var w = this.get('width');
        		var h = this.get('height');
        		var orientation = this.get('orientation');
        		if(orientation == Ti.UI.LANDSCAPE_LEFT || orientation == Ti.UI.LANDSCAPE_RIGHT)
        			return { w:w, h:h };
        		else
        			return { w:h, h:w };
        	},
        });
		
        return Model;
    },

    extendCollection: function(Collection) {		
        _.extend(Collection.prototype, {
        	
        });
		
        return Collection;
    }
};

/*
USAGE

var library = Alloy.createCollection('book');
// The table name is the same as the collection_name value from the 'config.adapter' object. This may be different from the model name.
var table = library.config.adapter.collection_name;
// use a simple query
library.fetch({query:'SELECT * from ' + table + ' where author="' + searchAuthor + '"'});
// or a prepared statement
library.fetch({query: { statement: 'SELECT * from ' + table + ' where author = ?', params: [searchAuthor] }});



myModel.fetch({id: 123});
// is equivalent to
myModel.fetch({query: 'select * from ... where id = ' + 123 });


*/


