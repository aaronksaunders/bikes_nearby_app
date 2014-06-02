Welcome to Bike Finder
====
######forked from adampash/bikes_nearby_app
####What's Here
* ListView Integration
* Map View for IOS and Android
* Working with Geolocation Services
* Working with HTTP Client
* Integration of ActionBar on Android
* Example of dealing for cross-platform UI issues in style and view layout

####Remember you will need to setup you Android Map to get this working

See information here on the Appcelerator website
http://docs.appcelerator.com/titanium/latest/#!/guide/Google_Maps_v2_for_Android

####Debugger Code was added to force a specific location for testing.

When this function is called, it will default to this location. I added this because I was testing 
from Washington DC and it is too far to get any data to show

```
// FOR DEBUGGING
locate_bikes.setDebugLocation([40.70122128, -74.01234218]);
```



