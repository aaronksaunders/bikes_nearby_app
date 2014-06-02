var drawPath, dropMarker, focusStation, initialize, locate_bikes, myLocation, nearestStations;

/* library for getting bike information */
locate_bikes = require('locate_bikes').bikes;

/* closest stations based on current user location */
nearestStations = [];

/* current user location */
myLocation = null;

/* interval id for refreshing application */
var updateIntervalId = null;

/**
 *
 */
focusStation = function(event) {
  var station, _i, _len, _ref;
  _ref = $.stations.children;
  for ( _i = 0, _len = _ref.length; _i < _len; _i++) {
    station = _ref[_i];
    station.setOpacity(0.5);
  }
  this.setOpacity(1);
  return activateStation(nearestStations[this.stationId], this.stationId);
};

/**
 *
 * sets the specified map region to fit the annotations provided
 *
 * @param {Ti.Map} _map
 * @param {Array} _annotations
 */
function zoomToFit(_map, _annotations) {
  var latMax, latMin, lngMax, lngMin;

  for (var c = 0; c < _annotations.length; c++) {

    var latitude = _annotations[c].latitude;
    var longitude = _annotations[c].longitude;

    latMax = Math.max(latMax || latitude, latitude);
    latMin = Math.min(latMin || latitude, latitude);

    lngMax = Math.max(lngMax || longitude, longitude);
    lngMin = Math.min(lngMin || longitude, longitude);

  }

  //create the map boundary area values
  var bndLat = (latMax + latMin) / 2;
  var bndLng = (lngMax + lngMin) / 2;

  var bndLatDelta = latMax - latMin + 0.005;
  var bndLngDelta = lngMax - lngMin + 0.005;

  //create the map region definition for the boundaries containing the sites
  var mapRegionSites = {
    latitude : bndLat,
    longitude : bndLng,
    animate : true,
    latitudeDelta : bndLatDelta,
    longitudeDelta : bndLngDelta
  };

  _map.setRegion(mapRegionSites);
};

/**
 *
 */
function dropMarker(station) {
  $.mapview.removeAllAnnotations();
  var stationAnnotation = Alloy.Globals.Map.createAnnotation({
    latitude : station.latitude,
    longitude : station.longitude,
    title : station.stationName,
    subtitle : station.availableBikes + ' bikes; ' + station.availableDocks + ' docks',
    pincolor : Alloy.Globals.Map.ANNOTATION_RED,
    myid : 1
  });
  $.mapview.addAnnotation(stationAnnotation);
};

/**
 * @param {Object} station
 */
function drawPath(station) {
  var route, routePts;
  routePts = {
    points : [station, myLocation.coords],
    color : "blue",
    width : 4
  };
  route = Alloy.Globals.Map.createRoute(routePts);
  $.mapview.addRoute(route);
};

/**
 *
 * @param {Object} station
 * @param {Object} index
 */
function activateStation(station, index) {
  dropMarker(station);
  return zoomToFit($.mapview, [myLocation, station]);
};

/**
 * when station is clicked, hightlight and have the map drop
 * a pin and zoom to location
 */
$.stationList.addEventListener('itemclick', function(e) {
  var item = e.section.getItemAt(e.itemIndex);
  activateStation(item.stationData, e.itemIndex);
});

/**
 * append the data to the list view
 *
 * @param {Array} _data - Array of station data
 */
function createListView(_data) {

  // clear the list
  $.section.deleteItemsAt(0, $.section.items.length);

  // this is pretty straight forward, assigning the values to the specific
  // properties in the template we defined above
  var items = [];
  for (var i in _data) {

    // add items to an array
    items.push({
      template : 'template1', // set the template
      stationData : _data[i],
      numBikes : {
        text : _data[i].availableBikes
      },
      stationName : {
        text : _data[i].stationName
      },
      stationDistance : {
        text : "Distance: " + _data[i].distanceInMiles.toFixed(2) + " miles"
      },
      eta : {
        text : 'Missing'
        // the data
      }
    });
  }

  // add the array, items, to the section defined in the view.xml file
  $.section.setItems(items);

}

function initialize() {

  Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_BEST;
  Ti.Geolocation.purpose = "Find the bikes nearest to you";

  Ti.Geolocation.getCurrentPosition(function(location) {

    locate_bikes.fetchBikesNear(location, function(closestStations, coords) {

      // added in for debug purposes
      myLocation = location = coords;
      Ti.API.info(JSON.stringify(myLocation));

      if (closestStations.length !== 0) {
        createListView(closestStations);

        // get the first item, selectItem
        OS_IOS && $.stationList.selectItem(0, 0);
        activateStation(closestStations[0], 0);

      } else {
        alert("Nada!!");
      }
    });
  });

  // update the information periodically, ONLY if it null.
  // if it is not null then there is an active interval that can 
  // continue toi be utilized
  if (updateIntervalId === null) {
    updateIntervalId = clearRefreshInterval(updateIntervalId);
    updateIntervalId = setRefreshInterval();
    Ti.API.info('updateIntervalId ' + updateIntervalId);
  }
}

/**
 * used by android for the menubar and title
 */
function doOpen() {
  var activity = $.getView().activity;
  var actionBar = activity.actionBar;

  activity.addEventListener('destroy', function(_event) {
    Ti.API.info(JSON.stringify(_event));
    updateIntervalId = clearRefreshInterval(updateIntervalId);
  });

  activity.addEventListener('pause', function(_event) {
    Ti.API.info(JSON.stringify(_event));
    updateIntervalId = clearRefreshInterval(updateIntervalId);
  });

  activity.addEventListener('resume', function(_event) {
    Ti.API.info(JSON.stringify(_event));
    Ti.API.info('activity.addEventListener:resumed');
    return initialize();
  });

  activity.addEventListener('userleavehint', function(_event) {
    Ti.API.info(JSON.stringify(_event));
    updateIntervalId && clearInterval(updateIntervalId);
  });

  activity.onCreateOptionsMenu = function(_event) {

    if (actionBar) {
      actionBar.displayHomeAsUp = true;
      actionBar.title = 'Bike Finder App';
      actionBar.onHomeIconItemSelected = function() {
        $.getView().close();
      };
    } else {
      alert('No Action Bar Found');
    }

  };
};

if (OS_IOS) {
  Ti.App.addEventListener('resumed', function() {
    Ti.API.info('Ti.App.addEventListener:resumed');
    return initialize();
  });

  Ti.App.addEventListener('pause', function() {
    Ti.API.info('Ti.App.addEventListener:pause');
    updateIntervalId = clearRefreshInterval(updateIntervalId);
  });
}

/**
 * clears out the specified interval and sets the variable to null
 */
function clearRefreshInterval(_id) {
  Ti.API.debug('clearRefreshInterval ' + _id);
  _id && clearInterval(_id);
  _id = null;
  return null;
}

/**
 *
 */
function setRefreshInterval() {
  return setInterval(function() {
    return initialize();
  }, 1000 * 60);
}

// FOR DEBUGGING
locate_bikes.setDebugLocation([40.70122128, -74.01234218]);
initialize();

$.getView().open();

//# sourceMappingURL=index.js.map
