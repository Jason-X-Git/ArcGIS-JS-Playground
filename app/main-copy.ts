import EsriMap from "esri/Map";
import MapView from "esri/views/MapView";
import BasemapToggle from "esri/widgets/BasemapToggle";
import BasemapGallery from "esri/widgets/BasemapGallery";
import FeatureLayer from "esri/layers/FeatureLayer";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import Graphic from "esri/Graphic";

const map = new EsriMap({
    basemap: "streets-navigation-vector"
});

const view = new MapView({
    map: map,
    container: "viewDiv",
    center: [-118.244, 34.052],
    zoom: 12
});

// var basemapToggle = new BasemapToggle({
//     view: view,
//     nextBasemap: "satellite"
// });

// view.ui.add(basemapToggle, "bottom-right");

var basemapGallery = new BasemapGallery({
    view: view,
    source: {
        portal: {
            url: "https://www.arcgis.com",
            useVectorBasemaps: false  // Load vector tile basemaps
        }
    }
});

view.ui.add(basemapGallery, "top-right");

var diamondSymbol = {
    type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
    style: "diamond",
    color: "blue",  // autocasts as new Color()
    outline: {              // autocasts as new SimpleLineSymbol()
        style: "dash-dot",
        color: [255, 128, 45] // Again, no need for specifying new Color()
    }
};

var trailheadsRenderer = {
    type: "simple",
    // symbol: diamondSymbol,
    symbol: {
        type: "picture-marker",
        url: "http://static.arcgis.com/images/Symbols/NPS/npsPictograph_0231b.png",
        width: "18px",
        height: "18px"
    }
}

var trailheadsLabels = {
    symbol: {
        type: "text",
        color: "#FFFFFF",
        haloColor: "#5E8D74",
        haloSize: "2px",
        font: {
            size: "12px",
            family: "Noto Sans",
            style: "italic",
            weight: "normal"
        }
    },
    labelPlacement: "above-center",
    labelExpressionInfo: {
        expression: "$feature.TRL_NAME"
    }
};

var popupTrailheads = {
    "title": "{TRL_NAME}",
    "content": "<b>City:</b> {CITY_JUR}<br><b>Cross Street:</b> {X_STREET}<br><b>Parking:</b> {PARKING}<br><b>Elevation:</b> {ELEV_FT} ft"
}

var trailheads = new FeatureLayer({
    url:
        "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads/FeatureServer/0",
    renderer: trailheadsRenderer,
    labelingInfo: [trailheadsLabels]，
    outFields: ["TRL_NAME", "CITY_JUR", "X_STREET", "PARKING", "ELEV_FT"],
    popupTemplate: popupTrailheads，
});

map.add(trailheads);

var trailsRenderer = {
    type: "simple",
    symbol: {
        color: "#BA55D3",
        type: "simple-line",
        style: "solid"
    },
    visualVariables: [
        {
            type: "size",
            field: "ELEV_GAIN",
            minDataValue: 0,
            maxDataValue: 2300,
            minSize: "3px",
            maxSize: "7px"
        }
    ]
};

function createPopupTrails (feature) {
    let elev = feature.graphic.attributes.ELEV_GAIN;
    let use_bike = feature.graphic.attributes.USE_BIKE.toLowerCase() === 'no'? 'No Bike': 'Bike';
    return `Elevation - ${elev} ft of climbing. Bike - ${use_bike}`;
}

var popupTrails = {
    "title": "Trail Information in <b>{TRL_NAME}</b>",
    "content": createPopupTrails,
}

var trails = new FeatureLayer({
    url:
        "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails/FeatureServer/0",
    renderer: trailsRenderer,
    opacity: .75，
    outFields: ["TRL_NAME", "ELEV_GAIN", "USE_BIKE"],
});

trails.popupTemplate = popupTrails

map.add(trails, 0);

var bikeTrailsRenderer = {
    type: "simple",
    symbol: {
        type: "simple-line",
        style: "short-dot",
        color: "yellow",
        width: "3px"
    }
};

var bikeTrails = new FeatureLayer({
    url:
        "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails/FeatureServer/0",
    renderer: bikeTrailsRenderer,
    definitionExpression: "USE_BIKE = 'yes'"
});

map.add(bikeTrails, 1);

function createFillSymbol(value, color) {
    return {
        value: value,
        symbol: {
            color: color,
            type: "simple-fill",
            style: "solid",
            outline: {
                style: "none"
            }
        },
        label: value
    };
}

var openSpacesRenderer = {
    type: "unique-value",
    field: "TYPE",
    uniqueValueInfos: [
        createFillSymbol("Natural Areas", "#9E559C"),
        createFillSymbol("Regional Open Space", "#A7C636"),
        createFillSymbol("Local Park", "#149ECE"),
        createFillSymbol("Regional Recreation Park", "#ED5151")
    ]
};

var openspaces = new FeatureLayer({
    url:
        "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Parks_and_Open_Space/FeatureServer/0",
    renderer: openSpacesRenderer,
    opacity: 0.7
});

map.add(openspaces, 0);

// Reference the feature layer to query
var featureLayer = new FeatureLayer({
    url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads_Styled/FeatureServer/0",
});

// Layer used to draw graphics returned
var graphicsLayer = new GraphicsLayer();
map.add(graphicsLayer);

function addGraphics(result) {
    graphicsLayer.removeAll();
    result.features.forEach(function (feature) {
        var g = new Graphic({
            geometry: feature.geometry,
            attributes: feature.attributes,
            symbol: {
                type: "simple-marker",
                color: "red",
                outline: {
                    width: 2,
                    color: [0, 255, 255],
                },
                size: "20px"
            },
            popupTemplate: {
                title: "{TRL_NAME}",
                content: "This a {PARK_NAME} trail located in {CITY_JUR}."
            }
        });
        graphicsLayer.add(g);
    });
}

function queryFeatureLayerView(point, distance, spatialRelationship, sqlExpression) {
    // Add the layer if it is missing
    if (!map.findLayerById(featureLayer.id)) {
        featureLayer.outFields = ["*"];
        map.add(featureLayer, 0);
    }
    // Set up the query
    var query = {
        geometry: point,
        distance: distance,
        spatialRelationship: spatialRelationship,
        outFields: ["*"],
        returnGeometry: true,
        where: sqlExpression
    };
    // Wait for the layerview to be ready and then query features
    view.whenLayerView(featureLayer).then(function (featureLayerView) {
        if (featureLayerView.updating) {
            var handle = featureLayerView.watch("updating", function (isUpdating) {
                if (!isUpdating) {
                    // Execute the query
                    featureLayerView.queryFeatures(query).then(function (result) {
                        addGraphics(result)
                    });
                    handle.remove();
                }
            });
        } else {
            // Execute the query
            featureLayerView.queryFeatures(query).then(function (result) {
                addGraphics(result);
            });
        }
    });
}

view.when(function () {
    //*** UPDATE ***//
    //queryFeatureLayer(view.center, 1500, "intersects");
    queryFeatureLayerView(view.center, 1500, "intersects");
});

view.on("click", function (event) {
    //*** UPDATE ***//
    //queryFeatureLayer(event.mapPoint, 1500, "intersects");
    queryFeatureLayerView(event.mapPoint, 1500, "intersects");
});

//*** ADD ***//
view.when(function () {
    view.whenLayerView(featureLayer).then(function (featureLayerView) {
        view.on("pointer-move", function (event) {
            view.hitTest(event).then(function (response) {
                // Only return features for the feature layer
                var feature = response.results.filter(function (result) {
                    return result.graphic.layer === featureLayer;
                })[0].graphic;
                if (feature) {
                    // Show popup for new features only
                    if (!view.popup.features.length || view.popup.features.length && (view.popup.features[0].attributes.FID !== feature.attributes.FID)) {
                        view.popup.open({
                            title: feature.attributes.TRL_NAME,
                            content: "This a " + feature.attributes.PARK_NAME + " trail located in " + feature.attributes.CITY_JUR + ".",
                            location: feature.geometry
                        });
                    }
                }
            });
        });
    });
});