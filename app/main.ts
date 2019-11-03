import EsriMap from "esri/Map";
import MapView from "esri/views/MapView";
import FeatureLayer from "esri/layers/FeatureLayer";

const map = new EsriMap({
    basemap: "streets-navigation-vector"
});

const view = new MapView({
    map: map,
    container: "viewDiv",
    center: [-118.244, 34.052],
    zoom: 12
});

var featureLayer = new FeatureLayer({
    url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails_Styled/FeatureServer/0",
    outFields: ["*"], // Return all fields so it can be queried client-side
    popupTemplate: {  // Enable a popup
        title: "{TRL_NAME}", // Show attribute value
        content: "The trail elevation gain is {ELEV_GAIN} ft."  // Display in pop-up
    }
});

map.add(featureLayer);

var sqlExpressions = ["TRL_ID = 0", "TRL_ID > 0", "USE_BIKE = 'Yes'", "USE_BIKE = 'No'", "ELEV_GAIN < 1000", "ELEV_GAIN > 1000", "TRL_NAME = 'California Coastal Trail'"];

var selectFilter = document.createElement("select");
selectFilter.setAttribute("class", "esri-widget esri-select");
selectFilter.setAttribute("style", "width: 275px; font-family: Avenir Next W00; font-size: 1em;");

sqlExpressions.forEach(function (sql) {
    var option = document.createElement("option");
    option.value = sql;
    option.innerHTML = sql;
    selectFilter.appendChild(option);
});

view.ui.add(selectFilter, "top-right");

function setFeatureLayerViewFilter(expression) {
    view.whenLayerView(featureLayer).then(function (featureLayerView) {
        featureLayerView.filter = {
            where: expression
        };
    });
}

selectFilter.addEventListener('change', function (event) {
    // setFeatureLayerFilter(event.target.value);
    setFeatureLayerViewFilter(event.target.value);
});
