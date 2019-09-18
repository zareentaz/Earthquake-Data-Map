

// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createMarker(data.features);
  console.log(data.features)
});

function createMarker(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  // Referal from https://leafletjs.com/examples/geojson/

  function onEachFeature(feature , layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  // Define function to create the circle radius based on the magnitude
  function radiusSize(magnitude) {
    return magnitude * 20000;
  }

  function circleColor(magnitude){
      if (magnitude > 5) {
        return '#ff3333'
      } else if (magnitude > 4) {
          return '#ff6633'
      } else if (magnitude > 3) {
          return '#ff9933'
      } else if (magnitude > 2) {
          return '#ffcc33'
      } else if (magnitude > 1) {
          return '#ffff33'
      } else {
          return '#ccff33'
      }
  };
  

    // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
 
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(earthquakeData, latlng) {
      return L.circle(latlng, {
        radius: radiusSize(earthquakeData.properties.mag),
        color: circleColor(earthquakeData.properties.mag),
        fillOpacity: 1
      });
    },
    onEachFeature: onEachFeature
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

// Create a fucntion a make different layers of map
function createMap(earthquakes) {
  var grayscalemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY 
  });

  var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var outdoorsmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.outdoors",
      accessToken: API_KEY
  });

// Create the faultline layer
var faultLine = new L.LayerGroup();

// Define a baseMaps object to hold our base layers
var baseMaps = {
  "Greyscale": grayscalemap,
  "Satellite": satellitemap,
  "Outdoor": outdoorsmap,

};


// Create overlay object to hold our overlay layer
var overlayMaps = {
  Earthquakes: earthquakes,
  FaultLines: faultLine
};

// Create our map, giving it the streetmap and earthquakes layers to display on load
var myMap = L.map("map", {
  center: [
    37.09, -95.71
  ],
  zoom: 4,
  layers: [grayscalemap,satellitemap,outdoorsmap,earthquakes,faultLine]
});

// Create a layer control
   // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


  // Query to retrieve the faultline data
  var faultlinequery = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";
  
  // Create the faultlines and add them to the faultline layer
  d3.json(faultlinequery, function(data) {
    L.geoJSON(data, {
      style: function() {
        return {color: "orange", fillOpacity: 0}
      }
    }).addTo(faultLine)
  })


  function getColor(d) {
    return d > 5 ? '#ff3333' :
           d > 4  ? '#ff6633' :
           d > 3  ? '#ff9933' :
           d > 2  ? '#ffcc33' :
           d > 1  ? '#ffff33' :
                    '#ccff33';
  }

  //Add Legend to the map
  var legend = L.control({position: 'bottomright'});

    legend.onAdd = function(myMap){
      var div = L.DomUtil.create('div', 'info legend'), // create a div with a class "info"
        grades = [0, 1, 2, 3, 4, 5],
        labels = [];

  // loop through our density intervals and generate a label with a colored square for each interval
  for (var i = 0; i < grades.length; i++) {
    div.innerHTML += 
        '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
}
    return div;
  };
  legend.addTo(myMap);
}