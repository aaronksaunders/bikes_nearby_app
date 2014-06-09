Alloy.Backbone.setDomLibrary({
  ajax : function(params) {
    debugger;
    var options = {
      success : params.success,
      error : params.error
    };

    //var promise = new Parse.Promise();
    var handled = !1;
    var xhr = Ti.Network.createHTTPClient({
      timeout : 5e3
    });
    xhr.onreadystatechange = function() {
      if (4 === xhr.readyState) {
        if (handled)
          return;
        handled = !0;
        if (xhr.status >= 200 && 300 > xhr.status) {
          var response;
          try {
            response = JSON.parse(xhr.responseText);
          } catch (e) {
            options.error(e);
          }
          response && options.success(response, xhr.status, xhr);
        } else
          options.error(xhr);
      }
    };
    xhr.open(params.type, params.url, !0);
    xhr.setRequestHeader("Content-Type", "text/plain");
    xhr.send(params.data);

  }
});

exports.BikeStation = Alloy.Backbone.Model.extend({
  initialize : function() {
    //alert("Welcome to this BikeStation");
  },
});
exports.BikeStationCollection = Alloy.Backbone.Collection.extend({
  model : exports.BikeStation,
  parse : function(_response) {
    return _response.stationBeanList;
  },
  url : function() {
    return 'http://www.citibikenyc.com/stations/json';
  }
});

if (false) {
  collection = new BikeStationCollection();
  collection.fetch({
    success : function() {
    },
    error : function() {
      console.log("error");
    }
  });
}
