var myApp = angular.module('app', ['ngMap', 'uiGmapgoogle-maps']);

myApp.config(function (uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: '',
        v: '3.17',
        libraries: 'weather,geometry,visualization'
    });
});

var location;
var gid = 0;

myApp.controller('MainCtrl', function ($scope, uiGmapGoogleMapApi, uiGmapIsReady, $http) {
    uiGmapGoogleMapApi.then(function (maps) {
        $scope.googlemap = {};
        $scope.map = {
            center: {
                latitude: 37.7837235,
                longitude: -122.4089778
            },
            zoom: 13,
            pan: 0,
            options: $scope.mapOptions,
            control: {},
            events: {
                tilesloaded: function (maps, eventName, args) {},
                dragend: function (maps, eventName, args) {},
                zoom_changed: function (maps, eventName, args) {}
            }
        };

        // $scope.route = [
        //         new maps.LatLng(22.568049,88.322868), //Kolkata
        //         new maps.LatLng(28.639979,77.233887), //New Delhi
        //         new maps.LatLng(12.98181,77.578239),   //Bengaluru
        //         new maps.LatLng(18.958246,73.053589)  //Mumbai
        // ];

        // $scope.path = new maps.Polyline({
        //   path: $scope.route,
        //   strokeColor: "#FF0000",
        //   strokeOpacity: 1.0,
        //   strokeWeight: 2
        // });

        // $scope.path.setMap($scope.map);

        // $scope.route = maps.Polyline({
        //   path: [],
        //   strokeColor: '#FF0000',
        //   strokeOpacity: 2.0,
        //   strokeWeight: 3,
        //   editable: false,
        //   map:$scope.map
        // }),

        // $scope.directionsService = new maps.DirectionsService();
        // $scope.directionsDisplay = new maps.DirectionsRenderer();

        // $scope.address = '1028 Market St';
        // $scope.city = 'San Francisco';
        // $scope.state = 'CA';
    });

    $scope.windowOptions = {
        show: true
    };

    $scope.onClick = function (data) {
        $scope.windowOptions.show = !$scope.windowOptions.show;
        console.log('$scope.windowOptions.show: ', $scope.windowOptions.show);
        console.log('This is a ' + data);
        //alert('This is a ' + data);
    };

    $scope.closeClick = function () {
        $scope.windowOptions.show = false;
    };

    $scope.title = "Window Title!";

    uiGmapIsReady.promise() // if no value is put in promise() it defaults to promise(1)
    .then(function (instances) {
        console.log(instances[0].map); // get the current map
    })
        .then(function () {
        $scope.addMarkerClickFunction($scope.markers);
    });

    $scope.markers = [{
        id: 0,
        coords: {
            latitude: 37.7837235,
            longitude: -122.4089778
        },
        data: 'Hackreactor'
    }];

    $scope.addMarkerClickFunction = function (markersArray) {
        angular.forEach(markersArray, function (value, key) {
            value.onClick = function () {
                $scope.onClick(value.data);
                $scope.MapOptions.markers.selected = value;
            };
        });
    };

    $scope.addMarker = function (address, state, city) {
        $http.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + address + ',' + city + ',' + state).success(function (response) {

        $scope.markers.push({
            id: gid++,
            coords: {
                latitude: response.results[0].geometry.location.lat,
                longitude: response.results[0].geometry.location.lng
            },
            data: 'Target'
        });
        targetLatitude = response.results[0].geometry.location.lat;
        targetLongitude = response.results[0].geometry.location.lng;
        });
        console.log($scope.markers);
    };

    $scope.getRoute = function (address, state, city) {
        $http.get('https://maps.googleapis.com/maps/api/directions/json?origin=SanFrancisco&destination=Oakland').success(function (response) {
            console.log(response);
            var polyline = response.routes[0].overview_polyline.points;
            console.log(polyline);
            console.log("hi!!!", $scope.route);
        });

        // $scope.map.addOverlay(polyline);

        // $scope.directionsDisplay.setMap($scope.map);

        // $scope.directionsService.route(directionsServiceRequest, function(response, status) {
        //     // if (status == google.maps.DirectionsStatus.OK) {
        //     // $scope.directionsDisplay.setDirections(response);
        //     // }
        //     console.log(response, status);
        //     console.log('hi!!!!!')
        // });

        // console.log($scope.directionsDisplay)
    };

    $scope.MapOptions = {
        minZoom: 3,
        zoomControl: false,
        draggable: true,
        navigationControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        disableDoubleClickZoom: false,
        keyboardShortcuts: true,
        markers: {
            selected: {}
        },
        styles: [{
            featureType: "poi",
            elementType: "labels",
            stylers: [{
                visibility: "off"
            }]
        }, {
            featureType: "transit",
            elementType: "all",
            stylers: [{
                visibility: "off"
            }]
        }],
    };


  });