"use strict";

angular.module("mvpsolo", ["ui.router", "geolocation", "firebase", "flow"]).config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/");

  $stateProvider.state("home", { url: "/", templateUrl: "/views/home.html", controller: "HomeCtrl" }).state("about", { url: "/about", templateUrl: "/views/about.html" }).state("contact", { url: "/contact", templateUrl: "/views/contact.html" }).state("register", { url: "/register", templateUrl: "/views/register.html", controller: "RegisterCtrl" }).state("profile", { url: "/profile", templateUrl: "/views/profile.html", controller: "ProfileCtrl" });
}]);


"use strict";

angular.module("mvpsolo").controller("HomeCtrl", ["$scope", "$location", "$state", "CommonProp", "$firebaseAuth", function ($scope, $location, $state, CommonProp, $firebaseAuth) {
  var firebaseObj = new Firebase("https://mvpsolo.firebaseio.com");
  var loginObj = $firebaseAuth(firebaseObj);
  var user = "";

  $scope.fblogin = function () {
    firebaseObj.authWithOAuthPopup("facebook", function (error, authData) {
      if (error) {
        console.log("Login Failed!", error);
      } else {
        console.log("Authenticated successfully with payload:", authData);
        $state.go("profile");
        console.log("the data is: ", authData.facebook.cachedUserProfile.first_name);
        $scope.username = authData.facebook.cachedUserProfile.first_name;
        $scope.userimage = authData.facebook.cachedUserProfile.picture.data.url;
      }
    });
  };

  $scope.twilogin = function () {
    firebaseObj.authWithOAuthPopup("twitter", function (error, authData) {
      if (error) {
        console.log("Login Failed!", error);
      } else {
        console.log("Authenticated successfully with payload:", authData);
        $state.go("profile");
        $scope.username = authData.twitter.username;
        $scope.userimage = authData.twitter.cachedUserProfile.profile_image_url;
      }
    });
  };

  $scope.goologin = function () {
    firebaseObj.authWithOAuthPopup("google", function (error, authData) {
      if (error) {
        console.log("Login Failed!", error);
      } else {
        console.log("Authenticated successfully with payload:", authData);
        $state.go("profile");
        $scope.username = authData.google.cachedUserProfile.given_name;
        $scope.userimage = authData.google.cachedUserProfile.picture;
      }
    });
  };

  $scope.user = {};
  $scope.signIn = function (e) {
    e.preventDefault();
    var username = $scope.user.email;
    var password = $scope.user.password;
    loginObj.$authWithPassword({
      email: username,
      password: password
    }).then(function (user) {
      //Success callback
      console.log("Authentication successful");
      CommonProp.setUser(user.password.email);
      $state.go("profile");
    }, function (error) {
      //Failure callback
      console.log("Authentication failure");
    });
  };

  firebaseObj.authAnonymously(function (error, authData) {
    if (error) {
      console.log("Login Failed!", error);
    } else {
      console.log("Authenticated successfully with payload:", authData);
    }
  });
}]).service("CommonProp", function () {
  var user = "";

  return {
    getUser: function getUser() {
      return user;
    },
    setUser: function setUser(value) {
      user = value;
    }
  };
});



"use strict";

angular.module("mvpsolo").controller("ProfileCtrl", ["$scope", "geolocation", "CommonProp", "$http", function ($scope, geolocation, CommonProp, $http) {
  $scope.username = CommonProp.getUser();
  // $scope.username = CommonProp.facebook.cachedUserProfile.first_name;
  // $scope.username = CommonProp.twitter.username;
  // $scope.username = CommonProp.google.cachedUserProfile.given_name;

  geolocation.getLocation().then(function (data) {
    $scope.coords = data.coords;
    console.log("here it is ", $scope.coords.latitude + " " + $scope.coords.longitude);

    var uberClientId = "s_mjPTYcY0Py3gc8E6ibnXGx7gxpdKZ4";
    var uberServerToken = "_UqtKdfLiLDmt6O_ZEqbYkzgwsMfg9Flz0XcdIKc";

    $http.get("http://ws.audioscrobbler.com/2.0/?method=geo.getevents&lat=" + $scope.coords.latitude + "&long=" + $scope.coords.longitude + "&distance=150&limit=50&api_key=b93c2762033e97bcdf97392e7d0dd42c&format=json").success(function (data, status, headers, config) {
      console.log(data);
      $scope.shows = data.events.event;
      for (var index = 0; index < $scope.shows.length; index++) {
        // console.log('lastfm geo', $scope.shows[index].venue.location['geo:point']['geo:lat']);

        var eventLatitude = $scope.shows[index].venue.location["geo:point"]["geo:lat"],
            eventLongitude = $scope.shows[index].venue.location["geo:point"]["geo:long"];

        $http.get("/uber/prices?start_latitude=" + $scope.coords.latitude + "&start_longitude=" + $scope.coords.longitude + "&end_latitude=" + eventLatitude + "&end_longitude=" + eventLongitude).success(function (result) {
          // console.log('result is', result["prices"]);

          var data = result.prices;
          if (typeof data !== typeof undefined) {
            // Sort Uber products by time to the user's location
            data.sort(function (t0, t1) {
              return t0.duration - t1.duration;
            });

            // Update the Uber button with the shortest time
            var shortest = data[0];
            if (typeof shortest !== typeof undefined) {
              console.log("Updating time estimate...");
              $("#time").html("Trip: " + Math.ceil(shortest.duration / 60) + " min");
            }
          }
        }).error(function (err) {
          console.log("could not load uber");
        });

        $scope.uber = function () {
          var uberURL = "https://m.uber.com/sign-up?";

          // Add parameters
          uberURL += "client_id=" + uberClientId;
          if (typeof $scope.coords.latitude !== typeof undefined) uberURL += "&" + "pickup_latitude=" + $scope.coords.latitude;
          if (typeof $scope.coords.longitude !== typeof undefined) uberURL += "&" + "pickup_longitude=" + $scope.coords.longitude;
          uberURL += "&" + "dropoff_latitude=" + eventLatitude;
          uberURL += "&" + "dropoff_longitude=" + eventLongitude;
          uberURL += "&" + "dropoff_nickname=" + "AFTER8";

          // Redirect to Uber
          window.location.href = uberURL;
        };
      }
    }).error(function (data) {
      console.log("could not find this url");
    });

    console.log("before it happens");

    $http.get("https://api.foursquare.com/v2/venues/search?ll=" + $scope.coords.latitude + "," + $scope.coords.longitude + "&query=nightclub&oauth_token=0ITXVPPFAN00QFV5KF1RFWBXGCTROVMQ1FS4YC0OHHPRYDX5&v=20150319").success(function (data, status, headers, config) {
      console.log(data.response);
      $scope.venues = data.response.venues;

      for (var index = 0; index < $scope.venues.length; index++) {
        // console.log('foursquare: ', $scope.venues[index].location.lat);

        var clubLatitude = $scope.venues[index].location.lat,
            clubLongitude = $scope.venues[index].location.lng;

        $http.get("/uber/prices?start_latitude=" + $scope.coords.latitude + "&start_longitude=" + $scope.coords.longitude + "&end_latitude=" + clubLatitude + "&end_longitude=" + clubLongitude).success(function (result) {
          // console.log('result is', result["prices"]);

          var data = result.prices;
          if (typeof data !== typeof undefined) {
            // Sort Uber products by time to the user's location
            data.sort(function (t0, t1) {
              return t0.duration - t1.duration;
            });

            // Update the Uber button with the shortest time
            var shortest = data[0];
            if (typeof shortest !== typeof undefined) {
              console.log("Updating time estimate...");
              $("#time2").html("Trip: " + Math.ceil(shortest.duration / 60) + " min");
            }
          }
        }).error(function (data) {
          console.log("could not load uber");
        });

        $scope.uber2 = function () {
          var uberURL = "https://m.uber.com/sign-up?";

          // Add parameters
          uberURL += "client_id=" + uberClientId;
          if (typeof $scope.coords.latitude !== typeof undefined) {
            uberURL += "&" + "pickup_latitude=" + $scope.coords.latitude;
          }
          if (typeof $scope.coords.longitude !== typeof undefined) {
            uberURL += "&" + "pickup_longitude=" + $scope.coords.longitude;
          }
          uberURL += "&" + "dropoff_latitude=" + clubLatitude;
          uberURL += "&" + "dropoff_longitude=" + clubLongitude;
          uberURL += "&" + "dropoff_nickname=" + "AFTER8";

          // Redirect to Uber
          window.location.href = uberURL;
        };
      }
    }).error(function (data) {
      console.log("could not find this url");
    });

    $scope.uploadFile = function (files) {
      var fd = new FormData();
      //Take the first selected file
      fd.append("file", files[0]);

      $http.post(uploadUrl, fd, {
        withCredentials: true,
        headers: { "Content-Type": undefined },
        transformRequest: angular.identity
      }).success(function (data, status, headers, config) {
        console.log(data);
        $scope.image = data.image;
      }).error(function (data) {
        console.log("Could not upload");
      });
    };
  });


"use strict";

angular.module("mvpsolo").controller("RegisterCtrl", ["$scope", "$location", "CommonProp", "$firebaseAuth", function ($scope, $location, CommonProp, $firebaseAuth) {
  $scope.mesg = "Hello";
  var firebaseObj = new Firebase("https://after8.firebaseio.com");
  var auth = $firebaseAuth(firebaseObj);
  $scope.signUp = function () {
    if (!$scope.regForm.$invalid) {
      var email = $scope.user.email;
      var password = $scope.user.password;
      if (email && password) {
        auth.$createUser({ email: email, password: password }).then(function () {
          // do things if success
          console.log("User creation success");
          $location.path("/");
        }, function (error) {
          // do things if failure
          console.log(error);
          $scope.regError = true;
          $scope.regErrorMessage = error.message;
        });
      }
    }
  };
}]);