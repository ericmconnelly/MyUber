
// Uber API Constants
// Security note: these are visible to whomever views the source code!
var uberClientId = "s_mjPTYcY0Py3gc8E6ibnXGx7gxpdKZ4"
  , uberServerToken = "_UqtKdfLiLDmt6O_ZEqbYkzgwsMfg9Flz0XcdIKc"; 
// var uberClientId = "2RBEw5gBXfALSe6E_qET2N5xhD5uPHTf"
//   , uberServerToken = "6MvDOZAXRR6f4R6LcUYJM50zMZM6xmWKfenBHpv4"; 
// var request = require('node_modules/request/request.js');

// Create variables to store latitude and longitude
var userLatitude
  , userLongitude
  , partyLatitude = 37.7989333
  , partyLongitude = -122.2690129
  , product_id;

// Create variable to store timer
var timer;
var uber;
// var location = require('app/app.js')
// var partyLatitude = location.latitude;
// var partyLongitude = location.longitude;


// Great resource: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation
navigator.geolocation.watchPosition(function(position) {
  // Update latitude and longitude
  userLatitude = position.coords.latitude;
  userLongitude = position.coords.longitude;

  // Create timer if needed
  // Once initialized, it will fire every 60 seconds as recommended by the Uber API
  // We only create the timer after we've gotten the user's location for the first time 
  if (typeof timer === typeof undefined) {
    timer = setInterval(function() {
      getEstimatesForUserLocation(userLatitude, userLongitude);
      getPromotions(userLatitude, userLongitude);
    }, 60000);

    // Query Uber API the first time manually
    getEstimatesForUserLocation(userLatitude, userLongitude);
    getPromotions(userLatitude, userLongitude);
  }
});

function getEstimatesForUserLocation(latitude,longitude) {
  console.log("Requesting updated time estimate...");
  $.ajax({
    url: "https://api.uber.com/v1/estimates/price",
    type: 'GET',
    headers: {
      Authorization: "Token " + uberServerToken
    },
    data: { 
      start_latitude: latitude,
      start_longitude: longitude,
      end_latitude: partyLatitude,
      end_longitude: partyLongitude
    },
    success: function(result) {
      console.log(result);

      // 'results' is an object with a key containing an Array
      var data = result["prices"];
      uber = data; 
      if (typeof data != typeof undefined) {
        // Sort Uber products by time to the user's location 
        data.sort(function(t0, t1) {
          return t0.duration - t1.duration;
        });

        // Update the Uber button with the shortest time
        var shortest = data[0];
        if(typeof shortest !== undefined ){
          product_id = shortest.product_id;
          console.log(product_id)
        }

        if (typeof shortest != typeof undefined) {
          console.log("Updating time estimate...");
          $("#time").html("Duration: " + Math.ceil(shortest.duration / 60.0) + " MIN");
          $("#time").append('<p>' + shortest.distance + " miles" + '</p>');
          $("#time").append('<p>' + shortest.estimate + " dollars" + '</p>');
        }
      }
    }
  });
}
$(document).ready(function(){
  $("#ride").click(function(event){
    // Redirect to Uber API via deep-linking to the mobile web-app
    var uberURL = "https://m.uber.com/sign-up?";

    // Add parameters
    uberURL += "client_id=" + uberClientId;
    if (typeof userLatitude != typeof undefined) uberURL += "&" + "pickup_latitude=" + userLatitude;
    if (typeof userLongitude != typeof undefined) uberURL += "&" + "pickup_longitude=" + userLongitude;
    uberURL += "&" + "dropoff_latitude=" + partyLatitude;
    uberURL += "&" + "dropoff_longitude=" + partyLongitude;
    uberURL += "&" + "dropoff_nickname=" + "Thinkful";

    // Redirect to Uber
    window.location.href = uberURL;
  });

  $("#requestRide").click(function(event){
      requestRide(userLatitude,userLongitude);
  });

  $("#requestTime").click(function(event){
      event.preventDefault();
      $('a').show();
      $("#uber1").html("Name: " + uber[0].display_name);
      $("#uber1").append('<p>' + "Distance: " + uber[0].distance + '</p>');
      
      $("#uber2").html("Name: " + uber[1].display_name);
      $("#uber2").append('<p>'+ uber[1].estimate + " USD" + '</p>');

      $("#uber3").html("Name: " + uber[2].display_name);
      $("#uber3").append('<p>' + uber[2].estimate + " USD" + '</p>');
      
      $("#uber4").html("Name: " + uber[3].display_name);
      $("#uber4").append('<p>' + uber[3].estimate + " USD" + '</p>');
      
      $("#uber5").html("Name: " + uber[4].display_name);
      $("#uber5").append('<p>' + uber[4].estimate + '</p>');
  });
});

function getPromotions(latitude,longitude) {
  console.log("Requesting promotion info...");
  $.ajax({
    url: "https://api.uber.com/v1/promotions",
    type: 'GET',
    contentType: 'application/json',
    headers: {
      Authorization: "Token " + uberServerToken
    },
    data: { 
      start_latitude: latitude,
      start_longitude: longitude,
      end_latitude: partyLatitude,
      end_longitude: partyLongitude
    },
    success: function(result) {
      console.log(result);
    }
  }); 
};

// function login(){
//   $.ajax({
//       url: "https://api.uber.com/v1/requests",
//       type: 'GET',
//       contentType: 'application/json',

// }

function requestRide(latitude,longitude){
    console.log("Requesting your ride...");
    $.ajax({
    url: "https://api.uber.com/v1/requests",
    type: 'POST',
    contentType: 'application/json',
    headers: {
      // "access-control-allow-origin": "*",
      // "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
      // "Allow": "GET, POST, PUT, DELETE, OPTIONS",
      // "access-control-allow-headers": "content-type, accept",
      // "access-control-max-age": 10,
      Authorization: "Token " + uberServerToken
    },
    data: {
      product_id : product_id, 
      start_latitude: latitude,
      start_longitude: longitude,
      end_latitude: partyLatitude,
      end_longitude: partyLongitude
    },
    success: function(result) {
      console.log(result);
    }
  }); 
};

function getPartyAddress(){
  $.ajax({
    url: "https://maps.googleapis.com/maps/api/geocode/",
    type: 'GET',
    contentType: 'application/json',
    headers: {
      Authorization: "Token " + uberServerToken
    },
    data: {
      product_id : product_id, 
      start_latitude: latitude,
      start_longitude: longitude,
      end_latitude: partyLatitude,
      end_longitude: partyLongitude
    },
    success: function(result) {
      console.log(result);
    }
  }); 

};

function getTime(){
  isTrue = true;
}

var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Allow": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

