
var express = require('express');
var sql = require("mssql");
const bcrypt = require('bcrypt');

var app = express();

// config for your database
var knex = require('knex')({
    client: 'mssql',
    connection: {
        user: 'aksenov',
        password: 'Datapass123',
        server: 'droneinsp.database.windows.net',
        database: 'DroneInspDB',
        options:
            {
                encrypt: true
            }
    }
});

exports.init = function () {
    knex.schema.hasTable('counties').then(function (exists) {
        if (!exists) {
            return knex.schema

                .createTable('counties', function (table) {
                    table.integer('countyID').unique();
                    table.string('countyName').notNullable();
                })

                .createTable('roles', function (table) {
                    table.increments('roleID').unique();
                    table.string('roleName').notNullable();
                    table.boolean('isActive').notNullable();
                })

                .createTable('users', function (table) {
                    table.increments('userID').unique();
                    table.string('userName').notNullable();
                    table.string('passwordHash').notNullable();
                    table.integer('countyID').references('countyID').inTable('counties');
                    table.integer('districtID').notNullable();
                    table.boolean('isActive').notNullable();
                    table.string('firstName').notNullable();
                    table.string('lastName').notNullable();
                    table.string('email').nullable();
                    table.string('phone').nullable();
                })

                .createTable('userRoles', function (table) {
                    table.integer('roleID').references('roleID').inTable('roles');
                    table.integer('userID').references('userID').inTable('users');
                    table.unique(['roleID', 'userID']);
                })

                .createTable('bridge', function (table) {
                    table.increments('bridgeID').unique();
                    table.string('name').notNullable();
                    table.string('location').notNullable();
                    //Add reference to counties countyID
                    table.integer('countyID').notNullable();
                    table.string('barsNo').notNullable();
                    table.string('bridgeNo').notNullable();
                    table.string('spanOver').notNullable();
                    //Add reference
                    table.string('coordinates').notNullable();
                    table.string('description');
                })
                .createTable('reports', function (table) {
                    table.increments('reportID').unique();
                    table.string('status').notNullable();
                    //Don't use .date format, inconvinient
                    table.string('dateAssigned').notNullable();
                    table.string('dateSubmitted');
                    //Add reference to users.userID
                    table.integer('assignedTo').notNullable();
                    //Add reference to bridge bridgeID
                    table.integer('bridgeID').notNullable();
                    //Add reference


                    table.string('inspectionPerformed').notNullable();
                    //Add reference to user userID
                    table.string('inspectedBy').notNullable();
                    table.string('structuralEvalBy').notNullable();
                    table.string('reviewApprovedBy').notNullable();

                    table.string('NBI90Date');
                    table.string('NBI90Freq');
                    table.boolean('inspectionTypePeriodic').notNullable();
                    table.boolean('inspectionTypeInDepth').notNullable();
                    table.boolean('inspectionTypeInCond').notNullable();

                    table.boolean('fractureCritical').notNullable();
                    table.boolean('underwater').notNullable();
                    table.boolean('otherSpecial').notNullable();
                    table.boolean('inventory').notNullable();
                    table.boolean('interim').notNullable();
                    table.boolean('damageSpecial').notNullable();
                    table.boolean('closure').notNullable();
                    table.boolean('procedure').notNullable();

                    table.boolean('fractCritReq').notNullable();
                    table.boolean('underwaterReq').notNullable();
                    table.string('underWEq');
                    table.string('specialCode');

                    table.string('item93ADate');
                    table.string('item93BDate');
                    table.string('item93CDate');
                    table.string('inspDate1');
                    table.string('inspDate2');
                    table.string('inspDate3');
                    table.string('inspDate4');

                    table.integer('Freq1');
                    table.integer('Freq2');
                    table.integer('Freq3');
                    table.integer('Freq4');

                    table.boolean('UBReq').notNullable();
                    table.string('UBinspDate');
                    table.string('UBFreq');
                    table.string('UBinspVehic');


                })
                .createTable('reportItems', function (table) {
                    table.increments('itemID').unique();
                    table.string('title').notNullable();
                    table.string('description').notNullable();
                    //Add reference to photo photoID
                    table.integer('photoID');
                    //Add reference to report reportID
                    table.integer('reportID');
                })
                .createTable('photos', function (table) {
                    table.increments('photoID').unique();
                    //Add reference to users userID
                    table.integer('userID').notNullable();
                    //Add reference to reports reportID
                    table.integer('reportID');
                    table.string('date').notNullable();
                    table.string('title').notNullable();
                    table.string('description').notNullable();
                    table.string('location').notNullable();
                    table.boolean('selected').notNullable();
                })
                .createTable('profpics', function (table) {
                    table.increments('picID').unique();
                    //Add reference to users userID
                    table.integer('userID').notNullable();
                    table.string('location').notNullable();
                })

                .then(() => { return exports.populateCounties() }).then(() => { return exports.populateRoles() }).then(() => { return exports.populateUsers() }).then(() => { return exports.addUsersToRoles() }).then(() => { return exports.addPhotos() }).then(() => { return exports.addProfPics() });
        }
    })
};

exports.populateUsers = function () {
    return knex('users').insert([
        {
            userName: 'Admin',
            firstName: 'Admin',
            lastName: 'Admin',
            districtID: 0,
            passwordHash: bcrypt.hashSync('AdminPass123', 8),
            countyID: 0,
            isActive: true
        },
        {
            userName: 'Aleks',
            firstName: 'Aleks',
            lastName: 'Aksenov',
            phone: '3049628797',
            email: 'aksenov@marshall.edu',
            districtID: 0,
            passwordHash: bcrypt.hashSync('AleksPass123', 8),
            countyID: 0,
            isActive: true
        },
        {
            userName: 'David',
            firstName: 'David',
            lastName: 'Sloan',
            districtID: 0,
            passwordHash: bcrypt.hashSync('DavidPass123', 8),
            countyID: 0,
            isActive: true
        },
        {
            userName: 'Nate',
            firstName: 'Nate',
            lastName: 'Miklas',
            districtID: 0,
            passwordHash: bcrypt.hashSync('NatePass123', 8),
            countyID: 0,
            isActive: true
        },
        {
            userName: 'Ryan',
            firstName: 'Ryan',
            lastName: 'Dixon',
            districtID: 0,
            passwordHash: bcrypt.hashSync('RyanPass123', 8),
            countyID: 0,
            isActive: true
        }
    ])
}

exports.populateCounties = function () {
    return knex('counties').insert(
        [
            {
                countyID: 0,
                countyName: "Admin"
            },
            {
                countyID: 2,
                countyName: "Barbour"
            },
            {
                countyID: 4,
                countyName: "Berkeley"
            },
            {
                countyID: 6,
                countyName: "Boone"
            },
            {
                countyID: 8,
                countyName: "Braxton"
            },
            {
                countyID: 10,
                countyName: "Brooke"
            },
            {
                countyID: 12,
                countyName: "Cabell"
            },
            {
                countyID: 14,
                countyName: "Calhoun"
            },
            {
                countyID: 16,
                countyName: "Clay"
            },
            {
                countyID: 18,
                countyName: "Doddridge"
            },
            {
                countyID: 20,
                countyName: "Fayette"
            },
            {
                countyID: 22,
                countyName: "Gilmer"
            },
            {
                countyID: 24,
                countyName: "Grant"
            },
            {
                countyID: 26,
                countyName: "Greenbrier"
            },
            {
                countyID: 28,
                countyName: "Hampshire"
            },
            {
                countyID: 29,
                countyName: "Hancock"
            },
            {
                countyID: 31,
                countyName: "Hardy"
            },
            {
                countyID: 33,
                countyName: "Harrison"
            },
            {
                countyID: 35,
                countyName: "Jackson"
            },
            {
                countyID: 37,
                countyName: "Jefferson"
            },
            {
                countyID: 39,
                countyName: "Kanawha"
            },
            {
                countyID: 41,
                countyName: "Lewis"
            },
            {
                countyID: 43,
                countyName: "Lincoln"
            },
            {
                countyID: 45,
                countyName: "Logan"
            },
            {
                countyID: 60,
                countyName: "McDowell"
            },
            {
                countyID: 47,
                countyName: "Marion"
            },
            {
                countyID: 48,
                countyName: "Marshall"
            },
            {
                countyID: 49,
                countyName: "Mason"
            },
            {
                countyID: 51,
                countyName: "Mercer"
            },
            {
                countyID: 53,
                countyName: "Mineral"
            },
            {
                countyID: 54,
                countyName: "Mingo"
            },
            {
                countyID: 56,
                countyName: "Monongalia"
            },
            {
                countyID: 57,
                countyName: "Monroe"
            },
            {
                countyID: 58,
                countyName: "Morgan"
            },
            {
                countyID: 62,
                countyName: "Nicholas"
            },
            {
                countyID: 64,
                countyName: "Ohio"
            },
            {
                countyID: 66,
                countyName: "Pendleton"
            },
            {
                countyID: 67,
                countyName: "Pleasants"
            },
            {
                countyID: 69,
                countyName: "Pocahontas"
            },
            {
                countyID: 70,
                countyName: "Preston"
            },
            {
                countyID: 72,
                countyName: "Putnam"
            },
            {
                countyID: 74,
                countyName: "Raleigh"
            },
            {
                countyID: 75,
                countyName: "Randolph"
            },
            {
                countyID: 77,
                countyName: "Ritchie"
            },
            {
                countyID: 79,
                countyName: "Roane"
            },
            {
                countyID: 81,
                countyName: "Summers"
            },
            {
                countyID: 83,
                countyName: "Taylor"
            },
            {
                countyID: 84,
                countyName: "Tucker"
            },
            {
                countyID: 85,
                countyName: "Tyler"
            },
            {
                countyID: 87,
                countyName: "Upshur"
            },
            {
                countyID: 89,
                countyName: "Wayne"
            },
            {
                countyID: 91,
                countyName: "Webster"
            },
            {
                countyID: 92,
                countyName: "Wetzel"
            },
            {
                countyID: 94,
                countyName: "Wirt"
            },
            {
                countyID: 96,
                countyName: "Wood"
            },
            {
                countyID: 98,
                countyName: "Wyoming"
            }
        ])
}

exports.populateRoles = function () {
    //roles
    return knex('roles').insert([{
        roleName: "admin",
        isActive: true
    },
    {
        roleName: "Contractor",
        isActive: true
    },
    {
        roleName: "CountyOfficial",
        isActive: true
    },
    {
        roleName: "DistrictOficial",
        isActive: true
    },
    {
        roleName: "StateOfficial",
        isActive: true
    }
    ]
    )
};

exports.addProfPics = function () {
    return knex('profpics').insert([
        {
            userID: 2,
            location: "pictures/default.png"
        },
        {
            userID: 3,
            location: "pictures/default.png"
        },
        {
            userID: 4,
            location: "pictures/default.png"
        },
        {
            userID: 5,
            location: "pictures/default.png"
        },
        {
            userID: 1,
            location: "pictures/default.png"
        }

    ])
}

exports.addUsersToRoles = function () {
    return knex('userRoles').insert([
        {
            roleID: 1,
            userID: 1
        },
        {
            roleID: 1,
            userID: 2
        },
        {
            roleID: 1,
            userID: 3
        },
        {
            roleID: 1,
            userID: 4
        },
        /*{
            roleID: 2,
            userID: 5
        },
        {
            roleID: 2, 
            userID: 6
        },
        {
            roleID: 2,
            userID: 7
        }*/
    ])
}

exports.addPhotos = function () {
    return knex('photos').insert([
        {
            userID: 2,
            date: 4 / 3 / 2018,
            title: "Abraham G. Sams Memorial Bridge",
            decscription: "bridge",
            location: "https://i.imgur.com/DvWoKft.png"
        },
        {
            userID: 2,
            date: 4 / 4 / 2018,
            title: "photo 1",
            decscription: "FAILED WEB, STRINGER TWO PANEL FOUR, SPAN THREE",
            location: "https://i.imgur.com/WxSNlQ4.png"
        },
        {
            userID: 2,
            date: 4 / 4 / 2018,
            title: "photo 2",
            decscription: "STRINGER TWO, SPAN TWO, PANEL TWO SECTION LOSS",
            location: "https://i.imgur.com/USM0ix8.png"
        },
        {
            userID: 2,
            date: 4/4/2018,
            title: "photo 3",
            decscription: "DETERIORATION STRINGER THREE, PANEL TWO, SPAN ONE",
            location: "https://i.imgur.com/zDla9d1.png"
        },
        {
            userID: 2,
            date: 4/4/2018,
            title: "photo 4",
            decscription: "SPALLING UNDER BEARING AREA, SPAN TWO UNDER STRINGER ONE (BEARING REMAINS SUPPORTED)",
            location: "https://i.imgur.com/TdS84bT.png"
        }
    ])
}

exports.checkLogin = function (userName, cb) {
    knex.select().from('users').where({
        userName: userName
    }).then(function (grabbedUser) {
        cb(grabbedUser[0])
    })
}

exports.getUserInfo = function (userName, cb) {
    knex.raw('select profpics.location, users.userName, users.phone, users.firstName, users.lastName, users.email, roles.roleName, counties.countyName from ((((users inner join userRoles on users.userID = userRoles.userID) inner join roles on userRoles.roleID = roles.roleID) inner join counties on counties.countyID = users.countyID) inner join profpics on users.userID = profpics.userID) where users.userName = ' + "'" + userName + "'")
        .then(function (userinfo) {
            cb(userinfo);
        });
};


exports.updProfPic = function (userID, loc) {
    return knex("profpics").where("userID", userID)
        .update({ "location": loc })
}

exports.getReports = function (cb) {
    knex.select('*').from('reports').join('bridge', function () {
        this.on('reports.bridgeID', '=', 'bridge.bridgeID')
    }).then(function (reports) {
        cb(reports);
    });
}

exports.getReport = function (reportID, cb) {
    knex.table('reports').where('reportID', reportID).innerJoin('bridge', 'reports.bridgeID', '=', 'bridge.bridgeID')
        .then(function (report) {
            cb(report);
        });
}

//exports.getReportBuffer = function (reportID, cb) {
  //  knex.table('reports', 'photos').where('reportID', reportID).innerJoin('photos', 'photos.selected = 1')
    //.then(function (report) {
      //  cb(report);
    //});
//}

exports.getReportBuffer = function (reportID, cb) {
    knex.raw('SELECT * from reports INNER JOIN photos ON photos.reportID = reports.reportID WHERE photos.selected = 1 AND photos.reportID = ' + "'" + reportID + "'")
    .then(function (report) {
        cb(report);
    });
}

exports.getIndPhotos = function (photoID, cb) {
    knex.table('photos').where('photoID', photoID)
    .then(function (photo) {
        cb(photo);
    });
}

//exports.getPhoto = function (cb) {
    //knex.raw('SELECT * FROM photos WHERE photos.selected = 0 OR photos.selected IS NULL')
        //.then(function (photos) {
            //cb(photos);
        //});
//}

exports.getPhoto = function (cb) {
    knex.select('*').from('photos').whereNot('title', '=', 'Abraham G. Sams Memorial Bridge')
    .then(function (photos) {
        cb(photos);
    });
}

exports.getBridgePhotos = function (cb) {
    knex.select("*").from('photos').where('photos.title', '=', 'Abraham G. Sams Memorial Bridge')
        .then(function (photos) {
            cb(photos);
        });
}

exports.getSelectedPhotos = function (cb) {
    knex.select('*').from('photos').where('photos.selected', '=', '1')
        .then(function (photos) {
            cb(photos)
        });
}

//exports.changeToTrue = function (photoID) {
//return knex('photos').where("photoID", photoID).update({'selected': '1'})
//}

//exports.changeToTrue = function (photoID, cb) {
    //knex.raw('update dbo.photos set photos.selected = "1" where photos.photoID = ' + "'" + photoID + "'")
        //.then(function (photos) {
            //cb(photos)
        //});
//}

exports.changeToTrue = function (photoID, cb) {
    knex('photos').where('photoID', photoID).update({'selected': 'TRUE'})
    .then(function(photos) {
        cb(photos)
    });
}

exports.updatePhotos = function (photoID, title, desc, cb) {
    knex('photos').where('photoID', photoID).update({'title': title, 'description': desc})
    .then(function(photos) {
        cb(photos);
    });
}

exports.updateCheckedPhotos = function (photoID, title, desc, cb) {
    knex('photos').where('photoID', photoID).update({'title': title, 'description': desc, 'selected': 1})
    .then(function(photos) {
        cb(photos);
    });
}

exports.updateReportPhotos = function (photoID, title, desc, cb) {
    knex('photos').where('photoID', photoID).update({'title': title, 'description': desc})
    .then(function(photos) {
        cb(photos);
    });
}

exports.updateCheckedReportPhotos = function (photoID, title, desc, cb) {
    knex('photos').where('photoID', photoID).update({'title': title, 'description': desc, 'selected': 0})
    .then(function(photos) {
        cb(photos);
    });
}

exports.updateToSubmitted = function (cb) {
    knex('reports').update({'status': "submitted"})
}
//exports.updatePhotos = function (photoID, title, description) {
    //return knex('photos').where('photoID', photoID).update({'title': title, 'description': description})
//}

//exports.changeToTrue = function (cb) {
//knex('photos').update({selected: '1'})
//.then(function(photos) {
//cb(photos)
//});
//}

exports.changeToFalse = function (cb) {
    knex('photos').update({ selected: '0' })
        .then(function (photos) {
            cb(photos)
        });
}

exports.countPhotos = function (cb) {
    knex.count('*').from('photos')
        .then(function (photos) {
            cb(photos)
        });
}
exports.insertQueries = function(query, cb){
    knex.raw(query).then(()=>{
        console.log('inserted successful')
    })
}
