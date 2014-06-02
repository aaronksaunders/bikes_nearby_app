var bikes, distance, DEBUG_LOCATION;

distance = require("distance").distance;

exports.bikes = {
    bikeShares: [ {
        city: "New York City",
        url: "http://www.citibikenyc.com/stations/json",
        latitude: 40.7127,
        longitude: -74.0059
    }, {
        city: "Chicago",
        url: "http://www.divvybikes.com/stations/json",
        latitude: 41.8819,
        longitude: -87.6278
    }, {
        city: "San Francisco",
        url: "https://www.bayareabikeshare.com/stations/json",
        latitude: 37.7833,
        longitude: -122.4167
    }, {
        city: "Columbus",
        url: "http://www.cogobikeshare.com/stations/json",
        latitude: 39.9833,
        longitude: -82.9833
    }, {
        city: "Aspen",
        url: "https://www.we-cycle.org/pbsc/stations.php",
        latitude: 39.1922,
        longitude: -106.8244
    }, {
        city: "Chattanooga",
        url: "http://www.bikechattanooga.com/stations/json",
        latitude: 35.0456,
        longitude: -85.2672
    } ],
    setDebugLocation: function(_coords) {
        DEBUG_LOCATION = {
            latitude: _coords[0],
            longitude: _coords[1]
        };
    },
    simpleDistance: function(coords, station) {
        return Math.abs(coords.latitude - station.latitude) + Math.abs(coords.longitude - station.longitude);
    },
    findNearestStation: function(coords, callback) {
        var bikeJSON, client;
        var that = this;
        SORTED_BIKES = that.bikeShares.sort(function(city1, city2) {
            return that.simpleDistance(coords, city1) - that.simpleDistance(coords, city2);
        });
        bikeJSON = SORTED_BIKES[0].url;
        Ti.API.info(bikeJSON);
        var client = Ti.Network.createHTTPClient({
            onload: function() {
                var bikeStations, closestStations, data, i, station, _i;
                data = JSON.parse(client.responseText);
                bikeStations = data.stationBeanList;
                bikeStations.sort(function(station1, station2) {
                    return that.simpleDistance(coords, station1) - that.simpleDistance(coords, station2);
                });
                closestStations = [];
                if (distance.getDistance(bikeStations[0], coords) > 48280) {
                    Ti.API.info("too far away");
                    closestStations = [];
                    DEBUG_LOCATION ? coords = DEBUG_LOCATION : callback([], coords);
                }
                for (i = _i = 0; 5 >= _i; i = ++_i) {
                    station = bikeStations[i];
                    station.distanceInMiles = distance.metersToMiles(distance.getDistance(station, coords));
                    closestStations.push(station);
                }
                null != callback && callback(closestStations, coords);
            },
            onerror: function(e) {
                Ti.API.debug(e.error);
                alert("error " + e.error);
                callback([], coords);
            },
            timeout: 5e3
        });
        client.open("GET", bikeJSON);
        client.send();
    },
    fetchBikesNear: function(position, callback) {
        this.findNearestStation(position.coords, callback);
    },
    getBikeData: function() {
        navigator.geolocation.getCurrentPosition(function(position) {
            return exports.fetchBikesNear(position);
        });
    }
};