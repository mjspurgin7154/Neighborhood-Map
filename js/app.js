// Global variables.
var google, map, infowindow, marker;

// markers = [];

// City information
var locations = [
    {
        name: "Seattle",
        state: "Washington",
        population: "704,352",
        location: {lat: 47.609722, lng: -122.333056}
    },
    {
        name: "Spokane",
        state: "Washington",
        population: "215,973",
        location: {lat: 47.658889, lng: -117.425}
    },
    {
        name: "Tacoma",
        state: "Washington",
        population: "211,277",
        location: {lat: 47.241389, lng: -122.459444}
    },
    {
        name: "Vancouver",
        state: "Washington",
        population: "174,826",
        location: {lat: 45.633333, lng: -122.6}
    },
    {
        name: "Bellevue",
        state: "Washington",
        population: "141,400",
        location: {lat: 47.6, lng: -122.166667}
    }
];

function googleApiError() {
    alert("The map was not loaded due to a google api error.  Please try again.");
}

// Initialize the map.  Loads locations and associated markers.
// Calls functions to animate marker and load infowindow when a marker is clicked.
window.initMap = function () {
    "use strict";
    map = new google.maps.Map(document.getElementById("map"), {
        center: {lat: 47.351076, lng: -120.740135},
        zoom: 7
    });

    infowindow = new google.maps.InfoWindow();
    var bounds, position, population, name, state;
    bounds = new google.maps.LatLngBounds();

    for (var i = 0; i < locations.length; i++) {
        position = locations[i].location;
        population = locations[i].population;
        name = locations[i].name;
        state = locations[i].state;

        // Create a marker per location and put into markers array.
        marker = new google.maps.Marker({
            map: map,
            position: position,
            population: population,
            name: name,
            state: state,
            animation: google.maps.Animation.DROP,
            id: i
        });

        // Push each marker to the locations array.
        // markers.push(marker);

        locations[i].marker = marker;
        // console.log(this.marker);

        bounds.extend(marker.position);

        // Create an onclick event to open an infowindow at each marker.

        locations[i].marker.addListener("click", makeClickHandler(marker));

        // console.log(markers);
    }

    function makeClickHandler(marker) {
        return function () {
            markerInfoWindow(marker, infowindow);
            toggleBounce (marker);
        };
    }

    // map.fitBounds(bounds);

    google.maps.event.addDomListener(window, 'resize', function() {
        map.fitBounds(bounds);  //'bounds' is a LatLngBounds'
    });

    // Calls the view model.
    ko.applyBindings(new CityViewModel());

    // This function populates the infowindow when the marker is clicked.
    function markerInfoWindow(marker, infowindow) {
        var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.name + '&format=json&formatversion=2&callback=wikiCallback';
        var wikiTimeout = setTimeout(function () {
            alert("The wikipedia api failed to load!  Please try again.");
        }, 1000);

        $.ajax({
            url: wikiUrl,
            dataType: 'jsonp',
            success: function(response) {
                var WikiText = response[3][0];
                if (infowindow.marker != marker) {
                    infowindow.marker = marker;

                    var content = '<div> <p>Name: ' + marker.name  + '</p> <p>Population: ' + marker.population + '</p> </div></div> <p>Website: ' + WikiText + '</p></div>';
                    infowindow.setContent(content);
                    infowindow.open(map, marker);

                    // Make sure the marker property is cleared if the infowindow is closed.
                    infowindow.addListener("closeclick", function() {
                        infowindow.marker = null;
                    });
                }

                clearTimeout(wikiTimeout);
            }

        });
    }

    // This function causes the clicked marker to bounce for a brief period.
    function toggleBounce(marker) {
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                marker.setAnimation(null);
            }, 2100);
        }
    }
};


var CityModel = function(data) {
    this.name = data.name;
    this.state = data.state;
    this.population = data.population;
    this.location = data.location;
    this.marker = data.marker;
};

// View model starts here.

var CityViewModel = function() {
    var self = this;

    // Stores initial cities in city list array.
    self.cityList = ko.observableArray();
    locations.forEach(function(cityItem) {
        self.cityList.push( new CityModel(cityItem));
    });

    // // Stores user search input
    self.filter = ko.observable("");

    // Builds ul of cities.  Allows the list to be filtered via a search input box.
    self.filteredItems = ko.computed(function() {
        var filter = self.filter().toLowerCase();
        // If no search criteria, the entire city list is displayed in the side panel.
        // Else the list is filtered.
        if (!filter) {
            ko.utils.arrayForEach(self.cityList(), function(item) {
            item.marker.setVisible(true);
            });
            return self.cityList();
        } else {
            return ko.utils.arrayFilter(self.cityList(), function(item) {
            var result = (item.name.toLowerCase().search(filter) >= 0);
            item.marker.setVisible(result);
            return result;
            });
        }
    });

    // Animate marker associated with clicked location in the location list side panel.
    // Open an infowindow for the clicked location
    self.setLocation = function(clickedLoc) {
        clickedLoc.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            clickedLoc.marker.setAnimation(null);
        }, 2100);

        var marker = clickedLoc.marker;

        var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.name + '&format=json&formatversion=2&callback=wikiCallback';
        var wikiTimeout = setTimeout(function () {
            alert("The wikipedia api failed to load!  Please try again.");
        }, 1000);

        $.ajax({
            url: wikiUrl,
            dataType: 'jsonp',
            success: function(response) {
                var WikiText = response[3][0];
                if (infowindow.marker != marker) {
                    infowindow.marker = marker;

                    var content = '<div> <p>Name: ' + marker.name  + '</p> <p>Population: ' + marker.population + '</p> </div></div> <p>Website: ' + WikiText + '</p></div>';
                    infowindow.setContent(content);
                    infowindow.open(map, marker);

                    // Make sure the marker property is cleared if the infowindow is closed.
                    infowindow.addListener("closeclick", function() {
                        infowindow.marker = null;
                    });
                }

                clearTimeout(wikiTimeout);

            }
        });
    };

};
