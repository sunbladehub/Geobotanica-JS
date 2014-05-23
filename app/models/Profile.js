

exports.definition = {
    config : {
        "columns": {
        	// Column name : data type
        	// Permitted data types:  
        	// string, varchar, int, tinyint, smallint, bigint, double, float, decimal, number, date, datetime and boolean
            "id": "INTEGER PRIMARY KEY AUTOINCREMENT",
            "nickname": "TEXT",
            "passphrase": "TEXT",
            "createdOn": "TEXT", // YYYY-MM-DD_HH-MM-SS-SSS
            "lastAccessedOn": "TEXT", // TODO: Implement this
        },
        "defaults": { // Default value for column where none is specified
        	// column : default value
            "nickname": "Joe",
            "passphrase": "",
            "createdOn": "",
//            "lastAccessedOn": "",
            // firstName, lastName, city, country
        },
        "adapter": {
/*        	Valid values for 'type'
            sql for the SQLite database on the Android and iOS platform.
            localStorage for HTML5 localStorage on the Mobile Web platform. You do not need to define the columns object in the config object. If defined, the object is ignored.
            properties for storing data locally in the Titanium SDK context. */
            type: "sql",
            collection_name: "profiles", // Name of table/namespace (stored in db: ~/com.geobotanica/databases_alloy_ )
        	idAttribute : "id", // Might be required for primary key to function
//        	"migration" : "1.1" // Database schema versioning/migration
        }
    },

    extendModel: function(Model) {		
        _.extend(Model.prototype, {
            // Extend, override or implement Backbone.Model 
        	
        	// TODO: implement validate() and use isValid().
        	// See: http://docs.appcelerator.com/backbone/0.9.2/#Model-validate
        	
        	getPhotoDir: function() {
        		var path = Gb.getProfilesExtDir() + '/' + this.get('nickname') + '/images';
        		Gb.createDir(path);
        		return path; 
        	},
        	
//        	getProfileExtDir: function() {
//	    		path = Gb.getProfilesExtDir() + '/' + this.nickname;
//	    		Gb.createDir(path);
//	    		return path;
//	    	},
//        	getPhotoDir: function() {
//        		path = this.getProfileExtDir() + '/images';
//        		Gb.createDir(path);
//        		return path; 
//        	},
        });
		
        return Model;
    },

    extendCollection: function(Collection) {		
        _.extend(Collection.prototype, {
            // Extend, override or implement Backbone.Collection 
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


