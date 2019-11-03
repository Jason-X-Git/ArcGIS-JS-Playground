var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "esri/Map", "esri/views/MapView", "esri/layers/FeatureLayer"], function (require, exports, Map_1, MapView_1, FeatureLayer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Map_1 = __importDefault(Map_1);
    MapView_1 = __importDefault(MapView_1);
    FeatureLayer_1 = __importDefault(FeatureLayer_1);
    var map = new Map_1.default({
        basemap: "streets-navigation-vector"
    });
    var view = new MapView_1.default({
        map: map,
        container: "viewDiv",
        center: [-118.244, 34.052],
        zoom: 12
    });
    var featureLayer = new FeatureLayer_1.default({
        url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails_Styled/FeatureServer/0",
        outFields: ["*"],
        popupTemplate: {
            title: "{TRL_NAME}",
            content: "The trail elevation gain is {ELEV_GAIN} ft." // Display in pop-up
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
});
//# sourceMappingURL=main.js.map