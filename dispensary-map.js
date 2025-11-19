// Denver Dispensary Map JavaScript

require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/layers/GeoJSONLayer",
  "esri/geometry/geometryEngine",
  "esri/widgets/DistanceMeasurement2D",
  "esri/widgets/AreaMeasurement2D",
  "esri/layers/GraphicsLayer",
  "esri/Graphic"
], function(Map, MapView, FeatureLayer, GeoJSONLayer, geometryEngine, DistanceMeasurement2D, AreaMeasurement2D, GraphicsLayer, Graphic) {

  let map, view;
  
  // Layer references
  let countyBoundariesLayerRef = null;
  let statisticalNeighborhoodsLayerRef = null;
  let retailMarijuanaLayerRef = null;
  let vettedAreasLayerRef = null;
  let childcareFacilitiesLayerRef = null;
  let childcareParcelsLayerRef = null;
  let drugTreatmentLayerRef = null;
  let publicSchoolsLayerRef = null;
  let publicSchoolAreasLayerRef = null;
  let nonPublicSchoolsLayerRef = null;
  let nonPublicSchoolAreasLayerRef = null;
  let parksLayerRef = null;
  let zoningLayerRef = null;
  let parcelsLayerRef = null;
  let buildingsLayerRef = null;
  let addressesLayerRef = null;

  // Initialize map
  map = new Map({ basemap: "streets-navigation-vector" });
  view = new MapView({ 
    container: "viewDiv", 
    map: map, 
    center: [-105.0178, 39.7392], // Denver, Colorado
    zoom: 10 
  });

  // County Boundaries Layer
  const countyBoundariesLayer = new FeatureLayer({
    url: "https://services1.arcgis.com/zdB7qR0BtYrg0Xpl/ArcGIS/rest/services/County_Boundary__Area_/FeatureServer/28",
    title: "County Boundaries",
    visible: true
  });
  countyBoundariesLayerRef = countyBoundariesLayer;
  map.add(countyBoundariesLayer);

  // Statistical Neighborhoods Layer
  const statisticalNeighborhoodsLayer = new FeatureLayer({
    url: "https://services1.arcgis.com/zdB7qR0BtYrg0Xpl/ArcGIS/rest/services/Enriched_Statistical_Neighborhood/FeatureServer/0",
    title: "Statistical Neighborhoods",
    visible: false,
    popupTemplate: {
        title: "{NBHD_NAME}"
    }
  });
  statisticalNeighborhoodsLayerRef = statisticalNeighborhoodsLayer;
  map.add(statisticalNeighborhoodsLayer);

  // Retail Marijuana Store Layer
  const retailMarijuanaLayer = new FeatureLayer({
    url: "https://services1.arcgis.com/zdB7qR0BtYrg0Xpl/ArcGIS/rest/services/ODC_BUSN_MARIJUANAFACILITIES_P/FeatureServer/210",
    title: "Retail Marijuana Store Location",
    visible: true,
    popupTemplate: {
      title: "{ENTITY_NAME}",
      content: [{
        type: "fields",
        fieldInfos: [{
          fieldName: "RECORD_ID",
          label: "License Number"
        }, {
          fieldName: "ADDRESS_LINE1",
          label: "Address Line 1"
        }, {
          fieldName: "ADDRESS_LINE2", 
          label: "Address Line 2"
        }, {
          fieldName: "CITY",
          label: "City"
        }, {
          fieldName: "STATE",
          label: "State"
        }, {
          fieldName: "ZIP_CODE",
          label: "ZIP"
        }, {
          fieldName: "CHECKBOXTYPE",
          label: "Facility Type"
        }, {
          fieldName: "LIC_NAME",
          label: "License Name"
        }, {
          fieldName: "APPLICATION_DATE",
          label: "Application Date"
        }, {
          fieldName: "EXPIRATION_DATE",
          label: "Expiration Date"
        }, {
          fieldName: "LIC_STATUS",
          label: "License Status"
        }, {
          fieldName: "COUNCIL_DIST",
          label: "Council District"
        }, {
          fieldName: "POLICE_DIST",
          label: "Police District"
        }, {
          fieldName: "NEIGHBORHOOD",
          label: "Neighborhood"
        }, {
          fieldName: "ZONE_DISTRICT",
          label: "Zone"
        }]
      }]
    }
  });
  retailMarijuanaLayerRef = retailMarijuanaLayer;
  map.add(retailMarijuanaLayer);

  // Vetted Areas Layer (GeoJSON)
  const vettedAreasLayer = new GeoJSONLayer({
    url: "https://raw.githubusercontent.com/nategregory1980/DenMap/81e4034aa00d4f6f32cf9178fb0546e3c1b2900e/vetted_areas.geojson",
    title: "Vetted Areas",
    visible: false,
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-fill",
        color: [0, 255, 0, 0.6], // Bright green with transparency
        outline: { 
          color: [0, 170, 0, 1], // Darker green outline
          width: 2 
        }
      }
    },
    popupTemplate: {
      title: "Vetted Area",
      content: "This area has been vetted for dispensary placement consideration."
    }
  });
  vettedAreasLayerRef = vettedAreasLayer;
  map.add(vettedAreasLayer);

  // Childcare Parcels Layer
  const childcareParcelsLayer = new FeatureLayer({
    url: "http://services1.arcgis.com/zdB7qR0BtYrg0Xpl/ArcGIS/rest/services/ChildCare_Parcels/FeatureServer/0",
    title: "Childcare Parcels",
    visible: false,
    minScale: 0,
    maxScale: 0,
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-fill",
        color: [255, 0, 0, 0.3],
        outline: { color: "#000000", width: 1 }
      }
    },
    popupTemplate: {
      title: "Childcare Parcel"
    }
  });

  // Childcare Facilities Layer
  const childcareFacilitiesLayer = new FeatureLayer({
    url: "https://services1.arcgis.com/zdB7qR0BtYrg0Xpl/ArcGIS/rest/services/ODC_BUSN_CHILDCAREFACILITY_P/FeatureServer/24",
    title: "Childcare Facilities",
    visible: false,
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-marker",
        color: "#FFFF00",
        size: 4,
        outline: { color: "#FFD700", width: 1 }
      }
    },
    popupTemplate: {
      title: "{BUS_PROF_NAME}",
      content: [{
        type: "fields",
        fieldInfos: [{
          fieldName: "BFN",
          label: "License Number"
        }, {
          fieldName: "FULL_ADDRESS",
          label: "Address Line 1"
        },{
          fieldName: "ADDRESS_LINE2",
          label: "Address Line 2"
        },{
            fieldName: "CITY",
            label: "City"
        },{
            fieldName: "STATE",
            label: "State"
        },{
            fieldName: "ZIP",
            label: "ZIP"
        },{
            fieldName: "LIC_STATUS",
            label: "License Status"
        },{
            fieldName: "LIC_TYPE",
            label: "License Type"
        },{
            fieldName: "ISSUE_DATE",
            label: "Issue Date"
        }]
      }]
    }
  });
  childcareParcelsLayerRef = childcareParcelsLayer;
  map.add(childcareParcelsLayer);
  childcareFacilitiesLayerRef = childcareFacilitiesLayer;
  map.add(childcareFacilitiesLayer);

  // Drug and Alcohol Treatment Layer
  const drugTreatmentLayer = new FeatureLayer({
    url: "https://services1.arcgis.com/zdB7qR0BtYrg0Xpl/ArcGIS/rest/services/ODC_SVCS_TREATMENTFACILITIES_P/FeatureServer/342",
    title: "Drug and Alcohol Treatment",
    visible: false,
    popupTemplate: {
        title: "{LOCATION_NAME}",
        content: [{
            type: "fields",
            fieldInfos: [{
                fieldName: "ADDRESS_LINE_1",
                label: "Address"
            }, {
                fieldName: "CITY",
                label: "City"
            }, {
                fieldName: "STATE",
                label: "State"
            }, {
                fieldName: "ZIP",
                label: "ZIP"
            }]
        }]
    }
  });
  drugTreatmentLayerRef = drugTreatmentLayer;
  map.add(drugTreatmentLayer);

  // Public Schools Layer
  const publicSchoolsLayer = new FeatureLayer({
    url: "https://services1.arcgis.com/zdB7qR0BtYrg0Xpl/ArcGIS/rest/services/ODC_EDU_PUBLICSCHOOLS_P/FeatureServer/258",
    title: "Public Schools",
    visible: false,
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-marker",
        color: "#FF0000",
        size: 4,
        outline: { color: "#000000", width: 1 }
      }
    }
  });

  // Public School Areas Layer
  const publicSchoolAreasLayer = new FeatureLayer({
    url: "https://services1.arcgis.com/zdB7qR0BtYrg0Xpl/ArcGIS/rest/services/ODC_EDU_PUBLICSCHOOLSAREA_A/FeatureServer/259",
    title: "Public School Areas",
    visible: false,
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-fill",
        color: [139, 0, 0, 0.4],
        outline: { color: "#8B0000", width: 1 }
      }
    },
    popupTemplate: {
        title: "{SCHOOL_NAME}",
        content: [{
            type: "fields",
            fieldInfos: [{
                fieldName: "SCHOOL_TYPE",
                label: "School Type"
            }, {
                fieldName: "SCHOOL_LEVEL",
                label: "School Level"
            }, {
                fieldName: "GRADE_LEVELS",
                label: "Grade Levels"
            }, {
                fieldName: "ADDRESS_LINE1",
                label: "Address"
            }]
        }]
    }
  });

  publicSchoolAreasLayerRef = publicSchoolAreasLayer;
  map.add(publicSchoolAreasLayer);
  publicSchoolsLayerRef = publicSchoolsLayer;
  map.add(publicSchoolsLayer);

  // Non-Public Schools Layer
  const nonPublicSchoolsLayer = new FeatureLayer({
    url: "https://services1.arcgis.com/zdB7qR0BtYrg0Xpl/ArcGIS/rest/services/ODC_EDU_NONPUBLICSCHOOLS_P/FeatureServer/256",
    title: "Non-Public Schools",
    visible: false,
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-marker",
        color: "#0000FF",
        size: 4,
        outline: { color: "#000080", width: 1 }
      }
    },
    popupTemplate: {
      title: "{SCHOOL_NAME}",
      content: [{
          type: "fields",
          fieldInfos: [{
              fieldName: "SCHOOL_TYPE",
              label: "School Type"
          }, {
              fieldName: "SCHOOL_LEVEL",
              label: "School Level"
          }, {
              fieldName: "GRADE_LEVELS",
              label: "Grade Levels"
          }, {
              fieldName: "ADDRESS_LINE1",
              label: "Address"
          }]
      }]
    }
  });

  // Non-Public School Areas Layer
  const nonPublicSchoolAreasLayer = new FeatureLayer({
    url: "https://services1.arcgis.com/zdB7qR0BtYrg0Xpl/ArcGIS/rest/services/ODC_EDU_NONPUBLICSCHOOLSAREA_A/FeatureServer/257",
    title: "Non-Public School Areas",
    visible: false,
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-fill",
        color: [0, 0, 139, 0.4],
        outline: { color: "#00008B", width: 1 }
      }
    }
  });

  nonPublicSchoolAreasLayerRef = nonPublicSchoolAreasLayer;
  map.add(nonPublicSchoolAreasLayer);
  nonPublicSchoolsLayerRef = nonPublicSchoolsLayer;
  map.add(nonPublicSchoolsLayer);

  // Parks Layer
  const parksLayer = new FeatureLayer({
    url: "https://services1.arcgis.com/zdB7qR0BtYrg0Xpl/ArcGIS/rest/services/ODC_PARK_PARKLAND_A/FeatureServer/87",
    title: "Parks",
    visible: false,
    labelsVisible: false,
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-fill",
        color: [0, 255, 0, 0.6],
        outline: { color: "#000000", width: 1 }
      }
    },
    popupTemplate: {
      title: "{FORMAL_NAME}",
      content: [{
        type: "fields",
        fieldInfos: [{
          fieldName: "PARK_TYPE",
          label: "Park Type"
        }, {
          fieldName: "PARK_CLASS",
          label: "Park Class"
        }, {
          fieldName: "ADDRESS_LINE1",
          label: "Address"
        }, {
          fieldName: "CITY",
          label: "City"
        },{
          fieldName: "STATE",
          label: "State"
        },{
          fieldName: "ZIP",
          label: "ZIP"
        }, {
          fieldName: "FACILITIES",
          label: "Facilities"
        }]
      }]
    }
  });
  parksLayerRef = parksLayer;
  map.add(parksLayer);

  // Zoning Layer
  const zoningLayer = new FeatureLayer({
    url: "https://services1.arcgis.com/zdB7qR0BtYrg0Xpl/ArcGIS/rest/services/ODC_ZONE_ZONING_A/FeatureServer/209",
    title: "Zoning",
    visible: false,
    labelsVisible: true,
    labelingInfo: [{
      labelExpressionInfo: {
        expression: "$feature.ZONE_DISTRICT"
      },
      symbol: {
        type: "text",
        color: "white",
        font: {
          family: "Arial",
          size: 10,
          weight: "bold"
        },
        haloColor: "black",
        haloSize: 1
      },
      minScale: 5000,
      maxScale: 0,
      labelPlacement: "center-center"
    }]
  });
  zoningLayerRef = zoningLayer;
  map.add(zoningLayer);

  // Parcels Layer
  const parcelsLayer = new FeatureLayer({
    url: "https://services1.arcgis.com/zdB7qR0BtYrg0Xpl/ArcGIS/rest/services/ODC_PROP_PARCELS_A/FeatureServer/245",
    title: "Parcels",
    visible: false,
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-fill",
        color: [0, 0, 0, 0],
        outline: { color: "#C0C0C0", width: 0.5 }
      }
    }
  });
  parcelsLayerRef = parcelsLayer;
  map.add(parcelsLayer);

  // Buildings Layer
  const buildingsLayer = new FeatureLayer({
    url: "https://services1.arcgis.com/zdB7qR0BtYrg0Xpl/ArcGIS/rest/services/Buildings_(Dissolved_by_Bldg_ID)/FeatureServer/0",
    title: "Buildings",
    visible: false,
    minScale: 0,
    maxScale: 0
  });
  buildingsLayerRef = buildingsLayer;
  map.add(buildingsLayer);

  // Addresses Layer
  const addressesLayer = new FeatureLayer({
    url: "https://services1.arcgis.com/zdB7qR0BtYrg0Xpl/ArcGIS/rest/services/ODC_CITY_LOC_ADDRESSPUBLIC_P/FeatureServer/31",
    title: "Addresses",
    visible: false,
    minScale: 5000,
    popupTemplate: {
      title: "{FULL_ADDRESS}"
    }
  });
  addressesLayerRef = addressesLayer;
  map.add(addressesLayer);

  // Scale monitoring for addresses layer
  const scaleWarningBanner = document.getElementById("scaleWarningBanner");
  
  function checkAddressesScale() {
    if (addressesLayerRef && addressesLayerRef.visible) {
      if (view.scale > 5000) {
        scaleWarningBanner.style.display = "block";
      } else {
        scaleWarningBanner.style.display = "none";
      }
    } else {
      scaleWarningBanner.style.display = "none";
    }
  }
  
  view.when(function() {
    view.watch("scale", checkAddressesScale);
    checkAddressesScale(); // Initial check
  });

  // UI Event Handlers
  const layersBtn = document.getElementById("layersBtn");
  const layersDropdown = document.getElementById("layersDropdown");
  const legendBtn = document.getElementById("legendBtn");
  const mapLegend = document.getElementById("mapLegend");
  const filterBtn = document.getElementById("filterBtn");
  const filterPanel = document.getElementById("filterPanel");
  const bufferBtn = document.getElementById("bufferBtn");
  const bufferPanel = document.getElementById("bufferPanel");
  const measureBtn = document.getElementById("measureBtn");
  const measurePanel = document.getElementById("measurePanel");
  const suitabilityBtn = document.getElementById("suitabilityBtn");
  const suitabilityPanel = document.getElementById("suitabilityPanel");
  const searchBox = document.getElementById("searchBox");
  const addressSuggestions = document.getElementById("addressSuggestions");
  
  // Filter variables
  let checkboxTypeValues = [];
  let licStatusValues = [];
  let currentDefinitionExpression = "";
  
  // Buffer variables
  let bufferLayer = null;
  let childcareBufferLayer = null;
  let drugTreatmentBufferLayer = null;
  let publicSchoolsBufferLayer = null;
  let nonPublicSchoolsBufferLayer = null;

  // Measurement variables
  let measurementWidget = null;
  let measurementGraphicsLayer = null;

  // Autocomplete variables
  let currentSuggestions = [];
  let selectedSuggestionIndex = -1;
  let suggestionTimeout = null;

  // Address highlight variables
  let highlightGraphicsLayer = null;

  // Suitability analysis variables
  let suitabilityPinsLayer = null;
  let suitabilityBuffersLayer = null;
  let placedPins = [];
  let maxPins = 100;
  let suitabilityMode = false;

  // Layers dropdown toggle
  layersBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    layersDropdown.style.display = layersDropdown.style.display === "block" ? "none" : "block";
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function(e) {
    if (!layersDropdown.contains(e.target) && e.target !== layersBtn) {
      layersDropdown.style.display = "none";
    }
  });

  // Function to update close button visibility
  function updateCloseButtonVisibility() {
    const closePanelsBtn = document.getElementById("closePanels");
    const anyPanelOpen = mapLegend.style.display === "block" || 
                         filterPanel.style.display === "block" || 
                         bufferPanel.style.display === "block" ||
                         measurePanel.style.display === "block" ||
                         suitabilityPanel.style.display === "block";
    closePanelsBtn.style.display = anyPanelOpen ? "flex" : "none";
  }
  
  // Initialize close button visibility (hidden by default)
  updateCloseButtonVisibility();

  // Legend toggle (original behavior)
  legendBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    mapLegend.style.display = mapLegend.style.display === "block" ? "none" : "block";
    updateCloseButtonVisibility();
  });

  // Filter panel toggle (same behavior as legend)
  filterBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    filterPanel.style.display = filterPanel.style.display === "block" ? "none" : "block";
    if (filterPanel.style.display === "block") {
      loadFilterOptions();
    }
    updateCloseButtonVisibility();
  });

  // Buffer panel toggle (same behavior as legend)
  bufferBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    bufferPanel.style.display = bufferPanel.style.display === "block" ? "none" : "block";
    updateCloseButtonVisibility();
  });

  // Measure panel toggle
  measureBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    measurePanel.style.display = measurePanel.style.display === "block" ? "none" : "block";
    updateCloseButtonVisibility();
  });

  // Suitability panel toggle
  suitabilityBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    const isOpening = suitabilityPanel.style.display !== "block";
    suitabilityPanel.style.display = isOpening ? "block" : "none";
    
    if (isOpening) {
      // Enable required layers for suitability analysis
      if (buildingsLayerRef) {
        buildingsLayerRef.visible = true;
        document.getElementById("chkBuildings").checked = true;
      }
      if (addressesLayerRef) {
        addressesLayerRef.visible = true;
        document.getElementById("chkAddresses").checked = true;
        checkAddressesScale(); // Check if we need to show scale warning
      }
      
      // Update legend and buffer section visibility
      updateLegendVisibility();
      updateBufferSectionVisibility();
      
      enableSuitabilityMode();
    } else {
      disableSuitabilityMode();
    }
    updateCloseButtonVisibility();
  });

  // Close button functionality - closes all panels
  document.getElementById("closePanels").addEventListener("click", function(e) {
    e.stopPropagation();
    mapLegend.style.display = "none";
    filterPanel.style.display = "none";
    bufferPanel.style.display = "none";
    measurePanel.style.display = "none";
    suitabilityPanel.style.display = "none";
    // Clear any active measurements when closing panels
    if (typeof clearActiveMeasurements === 'function') {
      clearActiveMeasurements();
    }
    // Disable suitability mode when closing panels
    disableSuitabilityMode();
    updateCloseButtonVisibility();
  });

  // Layer visibility checkboxes
  document.getElementById("chkRetailMarijuana").addEventListener("change", function(e) {
    if (retailMarijuanaLayerRef) retailMarijuanaLayerRef.visible = e.target.checked;
    updateLegendVisibility();
    updateBufferSectionVisibility();
  });
  
  document.getElementById("chkVettedAreas").addEventListener("change", function(e) {
    if (vettedAreasLayerRef) vettedAreasLayerRef.visible = e.target.checked;
    updateLegendVisibility();
  });
  
  document.getElementById("chkStatisticalNeighborhoods").addEventListener("change", function(e) {
    if (statisticalNeighborhoodsLayerRef) statisticalNeighborhoodsLayerRef.visible = e.target.checked;
    updateLegendVisibility();
  });
  
  document.getElementById("chkChildcareFacilities").addEventListener("change", function(e) {
    if (childcareFacilitiesLayerRef) childcareFacilitiesLayerRef.visible = e.target.checked;
    if (childcareParcelsLayerRef) childcareParcelsLayerRef.visible = e.target.checked;
    updateLegendVisibility();
    updateBufferSectionVisibility();
  });
  
  document.getElementById("chkDrugTreatment").addEventListener("change", function(e) {
    if (drugTreatmentLayerRef) drugTreatmentLayerRef.visible = e.target.checked;
    updateLegendVisibility();
    updateBufferSectionVisibility();
  });
  
  document.getElementById("chkPublicSchools").addEventListener("change", function(e) {
    if (publicSchoolsLayerRef) publicSchoolsLayerRef.visible = e.target.checked;
    if (publicSchoolAreasLayerRef) publicSchoolAreasLayerRef.visible = e.target.checked;
    updateLegendVisibility();
    updateBufferSectionVisibility();
  });
  
  document.getElementById("chkNonPublicSchools").addEventListener("change", function(e) {
    if (nonPublicSchoolsLayerRef) nonPublicSchoolsLayerRef.visible = e.target.checked;
    if (nonPublicSchoolAreasLayerRef) nonPublicSchoolAreasLayerRef.visible = e.target.checked;
    updateLegendVisibility();
    updateBufferSectionVisibility();
  });
  
  document.getElementById("chkParks").addEventListener("change", function(e) {
    if (parksLayerRef) parksLayerRef.visible = e.target.checked;
    updateLegendVisibility();
  });
  
  document.getElementById("chkZoning").addEventListener("change", function(e) {
    if (zoningLayerRef) zoningLayerRef.visible = e.target.checked;
    updateLegendVisibility();
  });
  
  document.getElementById("chkParcels").addEventListener("change", function(e) {
    if (parcelsLayerRef) parcelsLayerRef.visible = e.target.checked;
    updateLegendVisibility();
  });
  
  document.getElementById("chkBuildings").addEventListener("change", function(e) {
    if (buildingsLayerRef) buildingsLayerRef.visible = e.target.checked;
    updateLegendVisibility();
  });
  
  document.getElementById("chkAddresses").addEventListener("change", function(e) {
    if (addressesLayerRef) addressesLayerRef.visible = e.target.checked;
    checkAddressesScale(); // Check scale when visibility changes
    updateLegendVisibility();
  });

  // Clear All Layers button
  document.getElementById("clearAllLayers").addEventListener("click", function() {
    // Uncheck all layer checkboxes except Marijuana Store Locations
    const layerCheckboxes = [
      // "chkRetailMarijuana", // Keep this one checked
      "chkVettedAreas",
      "chkStatisticalNeighborhoods", 
      "chkChildcareFacilities",
      "chkDrugTreatment", // Corrected ID for drug treatment layer
      "chkPublicSchools",
      "chkNonPublicSchools",
      "chkParks",
      "chkZoning",
      "chkParcels",
      "chkBuildings",
      "chkAddresses"
    ];
    
    layerCheckboxes.forEach(checkboxId => {
      const checkbox = document.getElementById(checkboxId);
      if (checkbox && checkbox.checked) {
        checkbox.checked = false;
        // Trigger the change event to update layer visibility
        checkbox.dispatchEvent(new Event('change'));
      }
    });
    
    // Close the layers dropdown after clearing
    document.getElementById('layersDropdown').style.display = 'none';
  });

  // Filter button event listeners
  document.getElementById("applyFilters").addEventListener("click", applyFilters);
  document.getElementById("clearFilters").addEventListener("click", checkAllFilters);

  // Initialize measurement graphics layer
  measurementGraphicsLayer = new GraphicsLayer({
    title: "Measurements"
  });
  map.add(measurementGraphicsLayer);

  // Initialize address highlight graphics layer
  highlightGraphicsLayer = new GraphicsLayer({
    title: "Address Highlight",
    listMode: "hide" // Don't show in layer list
  });
  map.add(highlightGraphicsLayer);

  // Initialize suitability analysis layers
  suitabilityPinsLayer = new GraphicsLayer({
    title: "Suitability Pins",
    listMode: "hide"
  });
  map.add(suitabilityPinsLayer);

  suitabilityBuffersLayer = new GraphicsLayer({
    title: "Suitability Buffers",
    listMode: "hide"
  });
  map.add(suitabilityBuffersLayer);

  // Suitability Analysis functionality
  function enableSuitabilityMode() {
    suitabilityMode = true;
    view.container.style.cursor = "crosshair";
    
    // Add click handler for placing pins
    view.on("click", handleSuitabilityClick);
    
    // Update UI
    updatePinCounter();
    updateSuitabilityActions();
  }

  function disableSuitabilityMode() {
    suitabilityMode = false;
    view.container.style.cursor = "default";
    
    // Remove click handlers (this will be handled by view.on returns)
    // The event handlers will be cleaned up automatically
  }

  function handleSuitabilityClick(event) {
    if (!suitabilityMode || placedPins.length >= maxPins) return;
    
    // Check if click is on a building footprint
    view.hitTest(event).then(response => {
      const buildingHit = response.results.find(result => 
        result.graphic && result.graphic.layer === buildingsLayerRef
      );
      
      if (buildingHit) {
        placeSuitabilityPin(event.mapPoint, buildingHit.graphic);
      } else {
        console.log("Please click on a building footprint to place a pin.");
      }
    });
  }

  function placeSuitabilityPin(point, buildingGraphic) {
    // Create blue pin graphic
    const pinGraphic = new Graphic({
      geometry: point,
      symbol: {
        type: "simple-marker",
        style: "circle",
        color: [0, 123, 255, 0.8], // Blue color
        size: "12px",
        outline: {
          color: [255, 255, 255, 1],
          width: 2
        }
      },
      attributes: {
        pinId: placedPins.length + 1,
        buildingId: buildingGraphic.attributes.OBJECTID || placedPins.length + 1
      }
    });
    
    // Store pin data
    placedPins.push({
      graphic: pinGraphic,
      point: point,
      building: buildingGraphic
    });
    
    // Add to layer
    suitabilityPinsLayer.add(pinGraphic);
    
    // Update UI
    updatePinCounter();
    updateSuitabilityActions();
  }

  function updatePinCounter() {
    document.getElementById("pinCount").textContent = placedPins.length;
  }

  function updateSuitabilityActions() {
    const actionsDiv = document.getElementById("suitabilityActions");
    if (placedPins.length > 0) {
      actionsDiv.style.display = "flex";
    } else {
      actionsDiv.style.display = "none";
    }
  }

  function clearSuitabilityPins() {
    placedPins = [];
    suitabilityPinsLayer.removeAll();
    suitabilityBuffersLayer.removeAll();
    document.getElementById("suitabilityResults").innerHTML = "";
    
    // Hide the copy button
    const copyButton = document.getElementById("copyResults");
    if (copyButton) {
      copyButton.style.display = "none";
    }
    
    updatePinCounter();
    updateSuitabilityActions();
  }

  function copySuitabilityResults() {
    if (!window.currentAnalysisResults) {
      alert("No analysis results to copy!");
      return;
    }

    let textResults = "DENVER DISPENSARY SUITABILITY ANALYSIS RESULTS\n";
    textResults += "=" + "=".repeat(50) + "\n\n";

    window.currentAnalysisResults.forEach((result) => {
      const { pinId, pinAnalysis, buildingAnalysis } = result;
      
      // Determine if the location passes all criteria
      const hasIssues = pinAnalysis.inNoGoZone || 
                       pinAnalysis.inNoGoNeighborhood || 
                       buildingAnalysis.nearPublicSchool || 
                       buildingAnalysis.nearNonPublicSchool || 
                       buildingAnalysis.nearChildcare;

      textResults += `PIN ${pinId} ANALYSIS - ${hasIssues ? 'HAS ISSUES ❌' : 'SUITABLE ✅'}\n`;
      textResults += "-".repeat(40) + "\n";
      
      // Address information
      if (pinAnalysis.nearestAddress) {
        textResults += `📍 Address: ${pinAnalysis.nearestAddress}`;
        if (pinAnalysis.addressDistance !== null) {
          textResults += ` (${pinAnalysis.addressDistance}ft away)`;
        }
        textResults += "\n\n";
      }

      // Pin location analysis (1000ft radius)
      textResults += "PIN LOCATION ANALYSIS (1000ft radius):\n";
      textResults += `  • Zoning: ${pinAnalysis.inNoGoZone ? '❌ In No-Go Zone' : '✅ Not in No-Go Zone'}\n`;
      textResults += `  • Neighborhood: ${pinAnalysis.inNoGoNeighborhood ? '❌ In No-Go Neighborhood' : '✅ Not in No-Go Neighborhood'}\n`;
      textResults += `  • Marijuana Stores: ${pinAnalysis.nearMarijuanaStore ? `⚠️ Near ${pinAnalysis.marijuanaStoreCount} store(s)` : '✅ No stores nearby'}\n`;
      textResults += `  • Drug Treatment: ${pinAnalysis.nearDrugTreatment ? `⚠️ Near ${pinAnalysis.drugTreatmentCount} facility(ies)` : '✅ No facilities nearby'}\n`;

      // Building buffer analysis (1000ft from edges)
      textResults += "\nBUILDING BUFFER ANALYSIS (1000ft from edges):\n";
      textResults += `  • Public Schools: ${buildingAnalysis.nearPublicSchool ? `❌ Near ${buildingAnalysis.publicSchoolCount} school(s)` : '✅ No schools nearby'}\n`;
      textResults += `  • Non-Public Schools: ${buildingAnalysis.nearNonPublicSchool ? `❌ Near ${buildingAnalysis.nonPublicSchoolCount} school(s)` : '✅ No schools nearby'}\n`;
      textResults += `  • Childcare: ${buildingAnalysis.nearChildcare ? `❌ Near ${buildingAnalysis.childcareCount} facility(ies)` : '✅ No facilities nearby'}\n`;
      
      textResults += "\n";
    });

    textResults += `\nAnalysis completed on ${new Date().toLocaleString()}\n`;
    textResults += "Generated by Denver Dispensary Map Tool\n";

    // Copy to clipboard
    navigator.clipboard.writeText(textResults).then(() => {
      // Show success feedback
      const copyButton = document.getElementById("copyResults");
      const originalText = copyButton.innerHTML;
      copyButton.innerHTML = "✅ Copied!";
      copyButton.style.backgroundColor = "#28a745";
      
      setTimeout(() => {
        copyButton.innerHTML = originalText;
        copyButton.style.backgroundColor = "";
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      alert('Failed to copy results to clipboard. Please try again.');
    });
  }

  // Suitability button event listeners
  document.getElementById("analyzeSuitability").addEventListener("click", performSuitabilityAnalysis);
  document.getElementById("clearSuitabilityPins").addEventListener("click", clearSuitabilityPins);
  document.getElementById("copyResults").addEventListener("click", copySuitabilityResults);

  // Measurement functionality
  let activeDistanceMeasurement = null;
  let activeAreaMeasurement = null;

  function clearActiveMeasurements() {
    if (activeDistanceMeasurement) {
      activeDistanceMeasurement.destroy();
      activeDistanceMeasurement = null;
    }
    if (activeAreaMeasurement) {
      activeAreaMeasurement.destroy();
      activeAreaMeasurement = null;
    }
    measurementGraphicsLayer.removeAll();
    document.getElementById("measurementResults").innerHTML = "";
  }

  // Distance measurement
  document.getElementById("measureDistanceBtn").addEventListener("click", function() {
    clearActiveMeasurements();
    
    activeDistanceMeasurement = new DistanceMeasurement2D({
      view: view
    });

    // Update UI when measurement starts
    activeDistanceMeasurement.watch("state", function(state) {
      if (state === "measuring") {
        document.getElementById("measurementResults").innerHTML = "Click to start measuring distance...";
      }
    });

    // Update results when measurement changes
    activeDistanceMeasurement.watch("measurement", function(measurement) {
      if (measurement && measurement.length) {
        const distance = measurement.length.toFixed(2);
        const units = measurement.lengthUnit;
        document.getElementById("measurementResults").innerHTML = `Distance: ${distance} ${units}`;
      }
    });

    view.ui.add(activeDistanceMeasurement, "top-right");
  });

  // Area measurement
  document.getElementById("measureAreaBtn").addEventListener("click", function() {
    clearActiveMeasurements();
    
    activeAreaMeasurement = new AreaMeasurement2D({
      view: view
    });

    // Update UI when measurement starts
    activeAreaMeasurement.watch("state", function(state) {
      if (state === "measuring") {
        document.getElementById("measurementResults").innerHTML = "Click to start measuring area...";
      }
    });

    // Update results when measurement changes
    activeAreaMeasurement.watch("measurement", function(measurement) {
      if (measurement && measurement.area) {
        const area = measurement.area.toFixed(2);
        const areaUnits = measurement.areaUnit;
        const perimeter = measurement.perimeter ? measurement.perimeter.toFixed(2) : 0;
        const perimeterUnits = measurement.lengthUnit;
        document.getElementById("measurementResults").innerHTML = 
          `Area: ${area} ${areaUnits}<br>Perimeter: ${perimeter} ${perimeterUnits}`;
      }
    });

    view.ui.add(activeAreaMeasurement, "top-right");
  });

  // Clear measurements
  document.getElementById("clearMeasurementsBtn").addEventListener("click", function() {
    clearActiveMeasurements();
    document.getElementById("measurementResults").innerHTML = "Click a measurement tool to start measuring.";
  });

  // Buffer button event listeners
  document.getElementById("applyAllBuffers").addEventListener("click", function() {
    const marijuanaDistance = document.getElementById("marijuanaBufferDistance").value;
    const childcareDistance = document.getElementById("childcareBufferDistance").value;
    const drugTreatmentDistance = document.getElementById("drugTreatmentBufferDistance").value;
    const publicSchoolsDistance = document.getElementById("publicSchoolsBufferDistance").value;
    const nonPublicSchoolsDistance = document.getElementById("nonPublicSchoolsBufferDistance").value;
    
    // Apply all buffers using their respective distances (only for visible layers)
    if (marijuanaDistance && marijuanaDistance > 0 && retailMarijuanaLayerRef && retailMarijuanaLayerRef.visible) {
      applyMarijuanaBuffer(marijuanaDistance);
    }
    if (childcareDistance && childcareDistance > 0 && childcareFacilitiesLayerRef && childcareFacilitiesLayerRef.visible) {
      applyChildcareBufferStandalone(childcareDistance);
    }
    if (drugTreatmentDistance && drugTreatmentDistance > 0 && drugTreatmentLayerRef && drugTreatmentLayerRef.visible) {
      applyDrugTreatmentBufferStandalone(drugTreatmentDistance);
    }
    if (publicSchoolsDistance && publicSchoolsDistance > 0 && publicSchoolsLayerRef && publicSchoolsLayerRef.visible) {
      applyPublicSchoolsBufferStandalone(publicSchoolsDistance);
    }
    if (nonPublicSchoolsDistance && nonPublicSchoolsDistance > 0 && nonPublicSchoolsLayerRef && nonPublicSchoolsLayerRef.visible) {
      applyNonPublicSchoolsBufferStandalone(nonPublicSchoolsDistance);
    }
  });
  document.getElementById("clearAllBuffers").addEventListener("click", clearAllBuffers);

  // Statistical Neighborhoods toggle
  let noGoNeighborhoodsActive = false;
  document.getElementById("toggleNoGoNeighborhoods").addEventListener("click", function() {
    const button = document.getElementById("toggleNoGoNeighborhoods");
    
    if (!noGoNeighborhoodsActive) {
      // Turn on No-Go Neighborhoods
      if (statisticalNeighborhoodsLayerRef) {
        // Turn on the layer if it's not visible
        statisticalNeighborhoodsLayerRef.visible = true;
        
        // Update the checkbox in the layers dropdown
        const checkbox = document.getElementById("chkStatisticalNeighborhoods");
        if (checkbox) checkbox.checked = true;
        
        // Apply the filter and styling for no-go neighborhoods
        applyNoGoNeighborhoodsFilter();
        
        button.textContent = "Hide No-Go Neighborhoods";
        noGoNeighborhoodsActive = true;
      }
    } else {
      // Turn off No-Go Neighborhoods filter
      if (statisticalNeighborhoodsLayerRef) {
        // Reset to original renderer
        resetStatisticalNeighborhoodsRenderer();
        
        button.textContent = "View No-Go Neighborhoods";
        noGoNeighborhoodsActive = false;
      }
    }
  });

  // Zoning toggle
  let noGoZoningActive = false;
  let originalZoningRenderer = null;
  
  document.getElementById("toggleNoGoZoning").addEventListener("click", function() {
    const button = document.getElementById("toggleNoGoZoning");
    
    if (!noGoZoningActive) {
      // Turn on No-Go Zoning
      if (zoningLayerRef) {
        // Store the original renderer before modifying
        if (!originalZoningRenderer) {
          originalZoningRenderer = zoningLayerRef.renderer.clone();
        }
        
        // Turn on the layer if it's not visible
        zoningLayerRef.visible = true;
        
        // Update the checkbox in the layers dropdown
        const checkbox = document.getElementById("chkZoning");
        if (checkbox) checkbox.checked = true;
        
        // Apply the filter and styling for no-go zoning
        applyNoGoZoningFilter();
        
        button.textContent = "Hide No-Go Zoning";
        noGoZoningActive = true;
      }
    } else {
      // Turn off No-Go Zoning filter
      if (zoningLayerRef) {
        // Reset to original renderer
        resetZoningRenderer();
        
        button.textContent = "View No-Go Zoning";
        noGoZoningActive = false;
      }
    }
  });

  // Filter functionality
  function loadFilterOptions() {
    if (!retailMarijuanaLayerRef) return;
    
    // Query for unique CHECKBOXTYPE values
    const checkboxTypeQuery = retailMarijuanaLayerRef.createQuery();
    checkboxTypeQuery.where = "1=1";
    checkboxTypeQuery.outFields = ["CHECKBOXTYPE"];
    checkboxTypeQuery.returnDistinctValues = true;
    
    // Query for unique LIC_STATUS values
    const licStatusQuery = retailMarijuanaLayerRef.createQuery();
    licStatusQuery.where = "1=1";
    licStatusQuery.outFields = ["LIC_STATUS"];
    licStatusQuery.returnDistinctValues = true;
    
    Promise.all([
      retailMarijuanaLayerRef.queryFeatures(checkboxTypeQuery),
      retailMarijuanaLayerRef.queryFeatures(licStatusQuery)
    ]).then(results => {
      const [checkboxTypeResults, licStatusResults] = results;
      
      // Populate CHECKBOXTYPE filters
      const checkboxTypeContainer = document.getElementById("checkboxTypeFilters");
      checkboxTypeContainer.innerHTML = "";
      checkboxTypeValues = [];
      
      // Add group header
      const facilityGroupDiv = document.createElement("div");
      facilityGroupDiv.className = "filter-group";
      facilityGroupDiv.innerHTML = `<strong>Facility Type:</strong>`;
      
      // Collect all unique values
      checkboxTypeResults.features.forEach(feature => {
        const value = feature.attributes.CHECKBOXTYPE;
        if (value && value.trim() !== "" && !checkboxTypeValues.includes(value)) {
          checkboxTypeValues.push(value);
          const div = document.createElement("div");
          div.className = "filter-checkbox";
          div.innerHTML = `
            <input type="checkbox" id="chk_${value.replace(/\s+/g, '_')}" value="${value}" checked>
            <label for="chk_${value.replace(/\s+/g, '_')}">${value}</label>
          `;
          facilityGroupDiv.appendChild(div);
        }
      });
      
      checkboxTypeContainer.appendChild(facilityGroupDiv);
      
      // Populate LIC_STATUS filters
      const licStatusContainer = document.getElementById("licStatusFilters");
      licStatusContainer.innerHTML = "";
      licStatusValues = [];
      
      // Add group header
      const licenseGroupDiv = document.createElement("div");
      licenseGroupDiv.className = "filter-group";
      licenseGroupDiv.innerHTML = `<strong>License Status:</strong>`;
      
      // Collect all unique status values
      licStatusResults.features.forEach(feature => {
        const value = feature.attributes.LIC_STATUS;
        if (value && value.trim() !== "" && !licStatusValues.includes(value)) {
          licStatusValues.push(value);
          const div = document.createElement("div");
          div.className = "filter-checkbox";
          div.innerHTML = `
            <input type="checkbox" id="lic_${value.replace(/\s+/g, '_')}" value="${value}" checked>
            <label for="lic_${value.replace(/\s+/g, '_')}">${value}</label>
          `;
          licenseGroupDiv.appendChild(div);
        }
      });
      
      licStatusContainer.appendChild(licenseGroupDiv);
    }).catch(error => {
      console.error("Error loading filter options:", error);
    });
  }

  function applyFilters() {
    const selectedCheckboxTypes = [];
    const selectedLicStatus = [];
    
    // Get selected CHECKBOXTYPE values
    document.querySelectorAll('#checkboxTypeFilters input[type="checkbox"]:checked').forEach(checkbox => {
      selectedCheckboxTypes.push(`'${checkbox.value}'`);
    });
    
    // Get selected LIC_STATUS values
    document.querySelectorAll('#licStatusFilters input[type="checkbox"]:checked').forEach(checkbox => {
      selectedLicStatus.push(`'${checkbox.value}'`);
    });
    
    // Build definition expression
    let definitionExpression = "";
    
    if (selectedCheckboxTypes.length > 0) {
      definitionExpression += `CHECKBOXTYPE IN (${selectedCheckboxTypes.join(',')})`;
    }
    
    if (selectedLicStatus.length > 0) {
      if (definitionExpression.length > 0) {
        definitionExpression += " AND ";
      }
      definitionExpression += `LIC_STATUS IN (${selectedLicStatus.join(',')})`;
    }
    
    // Apply filter to layer
    if (retailMarijuanaLayerRef) {
      retailMarijuanaLayerRef.definitionExpression = definitionExpression;
      currentDefinitionExpression = definitionExpression;
    }
  }

  function checkAllFilters() {
    // Check all checkboxes
    document.querySelectorAll('#checkboxTypeFilters input[type="checkbox"]').forEach(checkbox => {
      checkbox.checked = true;
    });
    
    document.querySelectorAll('#licStatusFilters input[type="checkbox"]').forEach(checkbox => {
      checkbox.checked = true;
    });
    
    // Clear layer filter (show all items)
    if (retailMarijuanaLayerRef) {
      retailMarijuanaLayerRef.definitionExpression = "";
      currentDefinitionExpression = "";
    }
  }

  // No-Go Neighborhoods functionality
  function applyNoGoNeighborhoodsFilter() {
    if (!statisticalNeighborhoodsLayerRef) return;
    
    const noGoNeighborhoods = ["Overland", "Northeast Park Hill", "Baker", "Five Points", "Montbello", "Valverde"];
    
    // Create unique value infos for each no-go neighborhood
    const uniqueValueInfos = noGoNeighborhoods.map(neighborhood => ({
      value: neighborhood,
      symbol: {
        type: "simple-fill",
        color: [255, 0, 0, 0.6], // Bright red with transparency
        outline: {
          color: [255, 0, 0, 1], // Red outline
          width: 2
        }
      }
    }));
    
    // Create a unique value renderer
    const renderer = {
      type: "unique-value",
      field: "NBHD_NAME",
      uniqueValueInfos: uniqueValueInfos,
      defaultSymbol: {
        type: "simple-fill",
        color: [0, 0, 0, 0], // Transparent for other neighborhoods
        outline: {
          color: [128, 128, 128, 0.3],
          width: 0.5
        }
      }
    };
    
    statisticalNeighborhoodsLayerRef.renderer = renderer;
  }

  function resetStatisticalNeighborhoodsRenderer() {
    if (!statisticalNeighborhoodsLayerRef) return;
    
    // Reset to original transparent renderer
    const originalRenderer = {
      type: "simple",
      symbol: {
        type: "simple-fill",
        color: [0, 0, 0, 0], // Transparent
        outline: {
          color: [0, 0, 0, 1], // Black outline
          width: 2
        }
      }
    };
    
    statisticalNeighborhoodsLayerRef.renderer = originalRenderer;
  }

  // No-Go Zoning functionality
  function applyNoGoZoningFilter() {
    if (!zoningLayerRef) return;
    
    // Query the layer to get all unique zone district values
    const query = zoningLayerRef.createQuery();
    query.where = "1=1";
    query.outFields = ["ZONE_DISTRICT"];
    query.returnDistinctValues = true;
    
    zoningLayerRef.queryFeatures(query).then(results => {
      const noGoZones = ["CMP-EI", "CMP-EI2", "C-RX-12", "C-RX-5", "C-RX-8", "D-CV", "E-MS-2", "E-MS-2X", "E-MU-2.5", "E-MX-2", "E-MX-2A", "E-MX-2X", "E-RH-2.5", "E-RX-3", "E-RX-5", "E-SU-A", "E-SU-B", "E-SU-B1", "E-SU-D", "E-SU-D1", "E-SU-D1X", "E-SU-DX", "E-SU-G", "E-SU-G1", "E-TU-B", "E-TU-C", "G-MU-12", "G-MU-20", "G-MU-3", "G-MU-5", "G-MU-8", "G-RH-3", "G-RO-3", "G-RO-5", "G-RX-3", "G-RX-5", "M-RH-3", "M-RX-3", "M-RX-5", "M-RX-5A", "O-1", "OS-A", "OS-B", "OS-C", "PUD", "S-MU-12", "S-MU-20", "S-MU-3", "S-MU-5", "S-MU-8", "S-MX-2", "S-MX-2X", "S-RH-2.5", "S-SU-A", "S-SU-D", "S-SU-F", "S-SU-F1", "S-SU-FX", "S-SU-I", "S-SU-IX", "U-MS-2", "U-MS-2X", "U-MX-2", "U-MX-2X", "U-RH-2.5", "U-RH-3A", "U-RX-3", "U-RX-5", "U-SU-A", "U-SU-A1", "U-SU-A2", "U-SU-B", "U-SU-B1", "U-SU-B2", "U-SU-C", "U-SU-C1", "U-SU-C2", "U-SU-E", "U-SU-E1", "U-SU-H", "U-SU-H1", "U-TU-B", "U-TU-B2", "U-TU-C", "B-A-1", "B-A-2", "B-A-4", "GTWY-OSU", "O-1", "O-2", "OS-1", "P-1", "PUD-G", "GTWY-RU1", "GTWY-RU2", "R-O", "R-1", "R-2", "R-2-A", "R-2-B", "R-3", "R-3-X", "R-4", "R-4-X", "R-5", "R-MU-20", "R-MU-30", "RS-4", "R-X", "E-RH-2.5"];
      const uniqueValueInfos = [];
      
      // Get all unique zone districts from the data
      const allZones = results.features.map(feature => feature.attributes.ZONE_DISTRICT).filter(zone => zone);
      
      // Create symbols for all zones
      allZones.forEach(zone => {
        if (noGoZones.includes(zone)) {
          // Black styling for no-go zones
          uniqueValueInfos.push({
            value: zone,
            symbol: {
              type: "simple-fill",
              color: [0, 0, 0], // Black with transparency
              outline: {
                color: [0, 0, 0, 1], // Black outline
                width: 2
              }
            }
          });
        } else {
          // Keep original styling for other zones
          uniqueValueInfos.push({
            value: zone,
            symbol: {
              type: "simple-fill",
              color: [255, 255, 255, 0.6], // Light fill for visibility
              outline: {
                color: [130, 130, 130, 1],
                width: 0.75
              }
            }
          });
        }
      });
      
      // Create a unique value renderer
      const renderer = {
        type: "unique-value",
        field: "ZONE_DISTRICT",
        uniqueValueInfos: uniqueValueInfos,
        defaultSymbol: {
          type: "simple-fill",
          color: [255, 255, 255, 0.6],
          outline: {
            color: [130, 130, 130, 1],
            width: 0.75
          }
        }
      };
      
      zoningLayerRef.renderer = renderer;
    }).catch(error => {
      console.error("Error querying zone districts:", error);
    });
  }

  function resetZoningRenderer() {
    if (!zoningLayerRef) return;
    
    // Reset to the stored original renderer
    if (originalZoningRenderer) {
      zoningLayerRef.renderer = originalZoningRenderer;
    }
  }

  // Individual Buffer functionality
  function applyMarijuanaBuffer(bufferDistance) {
    if (!retailMarijuanaLayerRef) {
      alert("Marijuana store layer is not available");
      return;
    }

    if (!retailMarijuanaLayerRef.visible) {
      alert("Retail Marijuana layer must be visible to create buffers");
      return;
    }

    if (!bufferDistance || bufferDistance <= 0) {
      alert("Please enter a valid buffer distance for marijuana stores");
      return;
    }

    // Clear existing marijuana buffer
    if (bufferLayer) {
      map.remove(bufferLayer);
      bufferLayer = null;
    }
    const query = retailMarijuanaLayerRef.createQuery();
    query.where = retailMarijuanaLayerRef.definitionExpression || "1=1";
    query.returnGeometry = true;
    query.outFields = ["*"];

    retailMarijuanaLayerRef.queryFeatures(query).then(results => {
      if (results.features.length === 0) return;

      const bufferGeometries = results.features.map(feature => {
        return geometryEngine.buffer(feature.geometry, parseInt(bufferDistance), "feet");
      });

      const bufferGraphics = bufferGeometries.map((geometry, index) => ({
        geometry: geometry,
        attributes: {
          OBJECTID: index,
          BufferDistance: bufferDistance,
          LayerType: "Marijuana Store",
          OriginalName: results.features[index].attributes.DBA_NAME || "Unknown"
        }
      }));

      bufferLayer = new FeatureLayer({
        source: bufferGraphics,
        geometryType: "polygon",
        spatialReference: view.spatialReference,
        title: `Marijuana Store Buffers (${bufferDistance} ft)`,
        fields: [
          {name: "OBJECTID", type: "oid"},
          {name: "BufferDistance", type: "integer"},
          {name: "LayerType", type: "string"},
          {name: "OriginalName", type: "string"}
        ],
        renderer: {
          type: "simple",
          symbol: {
            type: "simple-fill",
            color: [255, 0, 0, 0.3], // Red for marijuana stores
            outline: {
              color: [255, 0, 0, 0.8],
              width: 2
            }
          }
        }
      });

      const marijuanaIndex = map.layers.indexOf(retailMarijuanaLayerRef);
      if (marijuanaIndex > 0) {
        map.add(bufferLayer, marijuanaIndex);
      } else {
        map.add(bufferLayer, 0);
      }
    }).catch(error => {
      console.error("Error creating marijuana buffer:", error);
    });
  }

  function applyChildcareBufferStandalone(bufferDistance) {
    if (!childcareFacilitiesLayerRef) {
      alert("Childcare facilities layer is not available");
      return;
    }

    if (!childcareFacilitiesLayerRef.visible) {
      alert("Childcare Facilities layer must be visible to create buffers");
      return;
    }

    if (!bufferDistance || bufferDistance <= 0) {
      alert("Please enter a valid buffer distance for childcare facilities");
      return;
    }

    // Clear existing childcare buffer
    if (childcareBufferLayer) {
      map.remove(childcareBufferLayer);
      childcareBufferLayer = null;
    }

    applyChildcareBuffer(bufferDistance);
  }

  function applyChildcareBuffer(bufferDistance) {
    const query = childcareFacilitiesLayerRef.createQuery();
    query.where = "1=1";
    query.returnGeometry = true;
    query.outFields = ["*"];

    childcareFacilitiesLayerRef.queryFeatures(query).then(results => {
      if (results.features.length === 0) return;

      const bufferGeometries = results.features.map(feature => {
        return geometryEngine.buffer(feature.geometry, parseInt(bufferDistance), "feet");
      });

      const bufferGraphics = bufferGeometries.map((geometry, index) => ({
        geometry: geometry,
        attributes: {
          OBJECTID: index + 10000, // Offset to avoid ID conflicts
          BufferDistance: bufferDistance,
          LayerType: "Childcare Facility",
          OriginalName: results.features[index].attributes.FACILITY_NAME || results.features[index].attributes.NAME || "Unknown"
        }
      }));

      childcareBufferLayer = new FeatureLayer({
        source: bufferGraphics,
        geometryType: "polygon",
        spatialReference: view.spatialReference,
        title: `Childcare Facility Buffers (${bufferDistance} ft)`,
        fields: [
          {name: "OBJECTID", type: "oid"},
          {name: "BufferDistance", type: "integer"},
          {name: "LayerType", type: "string"},
          {name: "OriginalName", type: "string"}
        ],
        renderer: {
          type: "simple",
          symbol: {
            type: "simple-fill",
            color: [0, 0, 255, 0.3], // Blue for childcare facilities
            outline: {
              color: [0, 0, 255, 0.8],
              width: 2
            }
          }
        }
      });

      const childcareIndex = map.layers.indexOf(childcareFacilitiesLayerRef);
      if (childcareIndex > 0) {
        map.add(childcareBufferLayer, childcareIndex);
      } else {
        map.add(childcareBufferLayer, 0);
      }
    }).catch(error => {
      console.error("Error creating childcare buffer:", error);
    });
  }

  // Drug Treatment Buffer functionality
  function applyDrugTreatmentBufferStandalone(bufferDistance) {
    if (!drugTreatmentLayerRef) {
      alert("Drug and Alcohol Treatment layer is not available");
      return;
    }

    if (!drugTreatmentLayerRef.visible) {
      alert("Drug and Alcohol Treatment layer must be visible to create buffers");
      return;
    }

    if (!bufferDistance || bufferDistance <= 0) {
      alert("Please enter a valid buffer distance for drug treatment facilities");
      return;
    }

    // Clear existing drug treatment buffer
    if (drugTreatmentBufferLayer) {
      map.remove(drugTreatmentBufferLayer);
      drugTreatmentBufferLayer = null;
    }

    applyDrugTreatmentBuffer(bufferDistance);
  }

  function applyDrugTreatmentBuffer(bufferDistance) {
    const query = drugTreatmentLayerRef.createQuery();
    query.where = "1=1"; // Get all features since drug treatment doesn't have filters
    query.returnGeometry = true;
    query.outFields = ["*"];

    drugTreatmentLayerRef.queryFeatures(query).then(results => {
      if (results.features.length === 0) return;

      const bufferGeometries = results.features.map(feature => {
        return geometryEngine.buffer(feature.geometry, parseInt(bufferDistance), "feet");
      });

      const bufferGraphics = bufferGeometries.map((geometry, index) => ({
        geometry: geometry,
        attributes: {
          OBJECTID: index + 20000, // Offset to avoid ID conflicts
          BufferDistance: bufferDistance,
          LayerType: "Drug Treatment Facility",
          OriginalName: results.features[index].attributes.FACILITY_NAME || results.features[index].attributes.NAME || "Unknown"
        }
      }));

      drugTreatmentBufferLayer = new FeatureLayer({
        source: bufferGraphics,
        geometryType: "polygon",
        spatialReference: view.spatialReference,
        title: `Drug Treatment Facility Buffers (${bufferDistance} ft)`,
        fields: [
          {name: "OBJECTID", type: "oid"},
          {name: "BufferDistance", type: "integer"},
          {name: "LayerType", type: "string"},
          {name: "OriginalName", type: "string"}
        ],
        renderer: {
          type: "simple",
          symbol: {
            type: "simple-fill",
            color: [128, 0, 128, 0.3], // Purple for drug treatment facilities
            outline: {
              color: [128, 0, 128, 0.8],
              width: 2
            }
          }
        }
      });

      const drugTreatmentIndex = map.layers.indexOf(drugTreatmentLayerRef);
      if (drugTreatmentIndex > 0) {
        map.add(drugTreatmentBufferLayer, drugTreatmentIndex);
      } else {
        map.add(drugTreatmentBufferLayer, 0);
      }
    }).catch(error => {
      console.error("Error creating drug treatment buffer:", error);
    });
  }

  // Public Schools Buffer functionality
  function applyPublicSchoolsBufferStandalone(bufferDistance) {
    if (!publicSchoolsLayerRef) {
      alert("Public Schools layer is not available");
      return;
    }

    if (!publicSchoolsLayerRef.visible) {
      alert("Public Schools layer must be visible to create buffers");
      return;
    }

    if (!bufferDistance || bufferDistance <= 0) {
      alert("Please enter a valid buffer distance for public schools");
      return;
    }

    // Clear existing public schools buffer
    if (publicSchoolsBufferLayer) {
      map.remove(publicSchoolsBufferLayer);
      publicSchoolsBufferLayer = null;
    }

    applyPublicSchoolsBuffer(bufferDistance);
  }

  function applyPublicSchoolsBuffer(bufferDistance) {
    const query = publicSchoolsLayerRef.createQuery();
    query.where = "1=1"; // Get all features since public schools doesn't have filters
    query.returnGeometry = true;
    query.outFields = ["*"];

    publicSchoolsLayerRef.queryFeatures(query).then(results => {
      if (results.features.length === 0) return;

      const bufferGeometries = results.features.map(feature => {
        return geometryEngine.buffer(feature.geometry, parseInt(bufferDistance), "feet");
      });

      const bufferGraphics = bufferGeometries.map((geometry, index) => ({
        geometry: geometry,
        attributes: {
          OBJECTID: index + 30000, // Offset to avoid ID conflicts
          BufferDistance: bufferDistance,
          LayerType: "Public School",
          OriginalName: results.features[index].attributes.SCHOOL_NAME || results.features[index].attributes.NAME || "Unknown"
        }
      }));

      publicSchoolsBufferLayer = new FeatureLayer({
        source: bufferGraphics,
        geometryType: "polygon",
        spatialReference: view.spatialReference,
        title: `Public Schools Buffers (${bufferDistance} ft)`,
        fields: [
          {name: "OBJECTID", type: "oid"},
          {name: "BufferDistance", type: "integer"},
          {name: "LayerType", type: "string"},
          {name: "OriginalName", type: "string"}
        ],
        renderer: {
          type: "simple",
          symbol: {
            type: "simple-fill",
            color: [255, 165, 0, 0.3], // Orange for public schools
            outline: {
              color: [255, 165, 0, 0.8],
              width: 2
            }
          }
        }
      });

      const publicSchoolsIndex = map.layers.indexOf(publicSchoolsLayerRef);
      if (publicSchoolsIndex > 0) {
        map.add(publicSchoolsBufferLayer, publicSchoolsIndex);
      } else {
        map.add(publicSchoolsBufferLayer, 0);
      }
    }).catch(error => {
      console.error("Error creating public schools buffer:", error);
    });
  }

  // Non-Public Schools Buffer functionality
  function applyNonPublicSchoolsBufferStandalone(bufferDistance) {
    if (!nonPublicSchoolsLayerRef) {
      alert("Non-Public Schools layer is not available");
      return;
    }

    if (!nonPublicSchoolsLayerRef.visible) {
      alert("Non-Public Schools layer must be visible to create buffers");
      return;
    }

    if (!bufferDistance || bufferDistance <= 0) {
      alert("Please enter a valid buffer distance for non-public schools");
      return;
    }

    // Clear existing non-public schools buffer
    if (nonPublicSchoolsBufferLayer) {
      map.remove(nonPublicSchoolsBufferLayer);
      nonPublicSchoolsBufferLayer = null;
    }

    applyNonPublicSchoolsBuffer(bufferDistance);
  }

  function applyNonPublicSchoolsBuffer(bufferDistance) {
    const query = nonPublicSchoolsLayerRef.createQuery();
    query.where = "1=1"; // Get all features since non-public schools doesn't have filters
    query.returnGeometry = true;
    query.outFields = ["*"];

    nonPublicSchoolsLayerRef.queryFeatures(query).then(results => {
      if (results.features.length === 0) return;

      const bufferGeometries = results.features.map(feature => {
        return geometryEngine.buffer(feature.geometry, parseInt(bufferDistance), "feet");
      });

      const bufferGraphics = bufferGeometries.map((geometry, index) => ({
        geometry: geometry,
        attributes: {
          OBJECTID: index + 40000, // Offset to avoid ID conflicts
          BufferDistance: bufferDistance,
          LayerType: "Non-Public School",
          OriginalName: results.features[index].attributes.SCHOOL_NAME || results.features[index].attributes.NAME || "Unknown"
        }
      }));

      nonPublicSchoolsBufferLayer = new FeatureLayer({
        source: bufferGraphics,
        geometryType: "polygon",
        spatialReference: view.spatialReference,
        title: `Non-Public Schools Buffers (${bufferDistance} ft)`,
        fields: [
          {name: "OBJECTID", type: "oid"},
          {name: "BufferDistance", type: "integer"},
          {name: "LayerType", type: "string"},
          {name: "OriginalName", type: "string"}
        ],
        renderer: {
          type: "simple",
          symbol: {
            type: "simple-fill",
            color: [0, 128, 0, 0.3], // Green for non-public schools
            outline: {
              color: [0, 128, 0, 0.8],
              width: 2
            }
          }
        }
      });

      const nonPublicSchoolsIndex = map.layers.indexOf(nonPublicSchoolsLayerRef);
      if (nonPublicSchoolsIndex > 0) {
        map.add(nonPublicSchoolsBufferLayer, nonPublicSchoolsIndex);
      } else {
        map.add(nonPublicSchoolsBufferLayer, 0);
      }
    }).catch(error => {
      console.error("Error creating non-public schools buffer:", error);
    });
  }

  function clearAllBuffers() {
    if (bufferLayer) {
      map.remove(bufferLayer);
      bufferLayer = null;
    }
    if (childcareBufferLayer) {
      map.remove(childcareBufferLayer);
      childcareBufferLayer = null;
    }
    if (drugTreatmentBufferLayer) {
      map.remove(drugTreatmentBufferLayer);
      drugTreatmentBufferLayer = null;
    }
    if (publicSchoolsBufferLayer) {
      map.remove(publicSchoolsBufferLayer);
      publicSchoolsBufferLayer = null;
    }
    if (nonPublicSchoolsBufferLayer) {
      map.remove(nonPublicSchoolsBufferLayer);
      nonPublicSchoolsBufferLayer = null;
    }
  }

  // Function to update buffer section visibility based on layer visibility
  function updateBufferSectionVisibility() {
    // Marijuana buffer section
    const marijuanaSection = document.getElementById('marijuanaBufferSection');
    if (marijuanaSection) {
      if (retailMarijuanaLayerRef && retailMarijuanaLayerRef.visible) {
        marijuanaSection.classList.remove('hidden');
      } else {
        marijuanaSection.classList.add('hidden');
      }
    }

    // Childcare buffer section
    const childcareSection = document.getElementById('childcareBufferSection');
    if (childcareSection) {
      if (childcareFacilitiesLayerRef && childcareFacilitiesLayerRef.visible) {
        childcareSection.classList.remove('hidden');
      } else {
        childcareSection.classList.add('hidden');
      }
    }

    // Drug treatment buffer section
    const drugTreatmentSection = document.getElementById('drugTreatmentBufferSection');
    if (drugTreatmentSection) {
      if (drugTreatmentLayerRef && drugTreatmentLayerRef.visible) {
        drugTreatmentSection.classList.remove('hidden');
      } else {
        drugTreatmentSection.classList.add('hidden');
      }
    }

    // Public schools buffer section
    const publicSchoolsSection = document.getElementById('publicSchoolsBufferSection');
    if (publicSchoolsSection) {
      if (publicSchoolsLayerRef && publicSchoolsLayerRef.visible) {
        publicSchoolsSection.classList.remove('hidden');
      } else {
        publicSchoolsSection.classList.add('hidden');
      }
    }

    // Non-public schools buffer section
    const nonPublicSchoolsSection = document.getElementById('nonPublicSchoolsBufferSection');
    if (nonPublicSchoolsSection) {
      if (nonPublicSchoolsLayerRef && nonPublicSchoolsLayerRef.visible) {
        nonPublicSchoolsSection.classList.remove('hidden');
      } else {
        nonPublicSchoolsSection.classList.add('hidden');
      }
    }
  }



  // Legend update functionality
  function updateLegendVisibility() {
    const legendItems = {
      'retail-marijuana': retailMarijuanaLayerRef && retailMarijuanaLayerRef.visible,
      'vetted-areas': vettedAreasLayerRef && vettedAreasLayerRef.visible,
      'childcare-facilities': childcareFacilitiesLayerRef && childcareFacilitiesLayerRef.visible,
      'childcare-parcels': childcareParcelsLayerRef && childcareParcelsLayerRef.visible,
      'drug-treatment': drugTreatmentLayerRef && drugTreatmentLayerRef.visible,
      'public-schools': publicSchoolsLayerRef && publicSchoolsLayerRef.visible,
      'public-school-areas': publicSchoolAreasLayerRef && publicSchoolAreasLayerRef.visible,
      'non-public-schools': nonPublicSchoolsLayerRef && nonPublicSchoolsLayerRef.visible,
      'non-public-school-areas': nonPublicSchoolAreasLayerRef && nonPublicSchoolAreasLayerRef.visible,
      'parks': parksLayerRef && parksLayerRef.visible,
      'zoning': zoningLayerRef && zoningLayerRef.visible,
      'parcels': parcelsLayerRef && parcelsLayerRef.visible,
      'buildings': buildingsLayerRef && buildingsLayerRef.visible,
      'addresses': addressesLayerRef && addressesLayerRef.visible,
      'statistical-neighborhoods': statisticalNeighborhoodsLayerRef && statisticalNeighborhoodsLayerRef.visible
    };

    // Update legend item visibility
    Object.keys(legendItems).forEach(key => {
      const legendElement = document.querySelector(`[data-legend="${key}"]`);
      if (legendElement) {
        legendElement.style.display = legendItems[key] ? 'flex' : 'none';
      }
    });

    // Build dynamic zoning legend when zoning layer is visible
    if (legendItems['zoning']) {
      buildZoningLegend();
    }
  }

  // Build dynamic zoning legend based on ZONE_DESCRIPTION field
  function buildZoningLegend() {
    if (!zoningLayerRef) return;

    // Query for unique zoning descriptions using distinct values
    const query = zoningLayerRef.createQuery();
    query.where = "1=1";
    query.outFields = ["ZONE_DESCRIPTION"];
    query.returnDistinctValues = true;
    query.returnGeometry = false;
    query.orderByFields = ["ZONE_DESCRIPTION"];

    zoningLayerRef.queryFeatures(query).then(results => {
      const zoningLegendContainer = document.getElementById("zoningLegendItems");
      if (!zoningLegendContainer) return;

      // Clear existing items
      zoningLegendContainer.innerHTML = "";

      // Use a Set to ensure unique values
      const uniqueDescriptions = new Set();
      results.features.forEach(feature => {
        const description = feature.attributes.ZONE_DESCRIPTION;
        if (description && description.trim() !== "") {
          uniqueDescriptions.add(description.trim());
        }
      });

      // Convert Set to Array and sort
      const sortedDescriptions = Array.from(uniqueDescriptions).sort();

      // Create legend items for each unique zoning description
      const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
        '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D5A6BD',
        '#FFA07A', '#20B2AA', '#9370DB', '#32CD32', '#FF69B4'
      ]; // Extended variety of colors for different zones

      sortedDescriptions.forEach((description, index) => {
        const legendItem = document.createElement("div");
        legendItem.className = "legend-item";
        
        const color = colors[index % colors.length];
        legendItem.innerHTML = `
          <div class="legend-symbol" style="background-color: ${color}; border: 1px solid #666;"></div>
          <span>${description}</span>
        `;
        
        zoningLegendContainer.appendChild(legendItem);
      });
    }).catch(error => {
      console.error("Error building zoning legend:", error);
    });
  }

  // Address autocomplete and search functionality
  searchBox.addEventListener("input", function(e) {
    const query = e.target.value.trim();
    
    // Clear previous timeout
    if (suggestionTimeout) {
      clearTimeout(suggestionTimeout);
    }
    
    if (query.length >= 2) {
      // Debounce the suggestions
      suggestionTimeout = setTimeout(() => {
        getSuggestions(query);
      }, 300);
    } else {
      hideSuggestions();
    }
  });

  searchBox.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (selectedSuggestionIndex >= 0 && currentSuggestions[selectedSuggestionIndex]) {
        selectSuggestion(currentSuggestions[selectedSuggestionIndex]);
      } else {
        performSearch(searchBox.value);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      navigateSuggestions(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      navigateSuggestions(-1);
    } else if (e.key === "Escape") {
      hideSuggestions();
      searchBox.blur();
    }
  });

  // Hide suggestions when clicking outside
  document.addEventListener("click", function(e) {
    if (!e.target.closest(".search-container")) {
      hideSuggestions();
    }
  });

  // Autocomplete helper functions
  function getSuggestions(query) {
    if (!addressesLayerRef) return;
    
    const searchQuery = addressesLayerRef.createQuery();
    searchQuery.where = `UPPER(FULL_ADDRESS) LIKE UPPER('%${query.replace(/'/g, "''")}%')`;
    searchQuery.outFields = ["FULL_ADDRESS"];
    searchQuery.returnGeometry = false;
    searchQuery.num = 10; // Limit to 10 suggestions
    
    addressesLayerRef.queryFeatures(searchQuery).then(result => {
      const suggestions = result.features
        .map(feature => feature.attributes.FULL_ADDRESS)
        .filter(address => address && address.trim() !== "")
        .sort((a, b) => {
          // Sort by relevance: exact matches first, then by length
          const aLower = a.toLowerCase();
          const bLower = b.toLowerCase();
          const queryLower = query.toLowerCase();
          
          const aStarts = aLower.startsWith(queryLower);
          const bStarts = bLower.startsWith(queryLower);
          
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          
          return a.length - b.length;
        })
        .slice(0, 8); // Show max 8 suggestions
      
      showSuggestions(suggestions, query);
    }).catch(error => {
      console.error("Autocomplete error:", error);
    });
  }

  function showSuggestions(suggestions, query) {
    currentSuggestions = suggestions;
    selectedSuggestionIndex = -1;
    
    if (suggestions.length === 0) {
      hideSuggestions();
      return;
    }
    
    const html = suggestions.map((suggestion, index) => {
      // Highlight matching text
      const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const highlighted = suggestion.replace(regex, '<strong>$1</strong>');
      
      return `
        <div class="suggestion-item" data-index="${index}">
          <span style="color: #666; margin-right: 4px;">📍</span>
          ${highlighted}
        </div>`;
    }).join('');
    
    addressSuggestions.innerHTML = html;
    addressSuggestions.style.display = 'block';
    
    // Add click event listeners to suggestions
    addressSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', function() {
        const index = parseInt(this.dataset.index);
        selectSuggestion(currentSuggestions[index]);
      });
    });
  }

  function hideSuggestions() {
    addressSuggestions.style.display = 'none';
    selectedSuggestionIndex = -1;
  }

  function navigateSuggestions(direction) {
    if (currentSuggestions.length === 0) return;
    
    // Remove previous selection
    if (selectedSuggestionIndex >= 0) {
      const items = addressSuggestions.querySelectorAll('.suggestion-item');
      if (items[selectedSuggestionIndex]) {
        items[selectedSuggestionIndex].classList.remove('selected');
      }
    }
    
    // Update selection
    selectedSuggestionIndex += direction;
    
    if (selectedSuggestionIndex < 0) {
      selectedSuggestionIndex = -1;
      searchBox.value = searchBox.value; // Keep original input
    } else if (selectedSuggestionIndex >= currentSuggestions.length) {
      selectedSuggestionIndex = currentSuggestions.length - 1;
    }
    
    // Apply new selection
    if (selectedSuggestionIndex >= 0) {
      const items = addressSuggestions.querySelectorAll('.suggestion-item');
      if (items[selectedSuggestionIndex]) {
        items[selectedSuggestionIndex].classList.add('selected');
        searchBox.value = currentSuggestions[selectedSuggestionIndex];
      }
    }
  }

  function selectSuggestion(address) {
    searchBox.value = address;
    hideSuggestions();
    performSearch(address);
  }

  // Function to flash/highlight an address point
  function flashAddressPoint(geometry) {
    // Clear any existing highlights
    highlightGraphicsLayer.removeAll();
    
    // Create flashing circle graphic
    const flashGraphic = new Graphic({
      geometry: geometry,
      symbol: {
        type: "simple-marker",
        style: "circle",
        color: [255, 0, 0, 0.8], // Red color
        size: "20px",
        outline: {
          color: [255, 255, 255, 1], // White outline
          width: 3
        }
      }
    });
    
    highlightGraphicsLayer.add(flashGraphic);
    
    // Remove the highlight after animation completes (3 seconds)
    setTimeout(() => {
      highlightGraphicsLayer.removeAll();
    }, 3000);
  }

  function performSearch(query) {
    if (!query.trim()) {
      return;
    }
    
    // Check if addresses layer is available
    if (!addressesLayerRef) {
      console.warn("Address search is not available - addresses layer not loaded.");
      return;
    }
    
    // Search only in addresses layer using FULL_ADDRESS field
    const searchQuery = addressesLayerRef.createQuery();
    searchQuery.where = `UPPER(FULL_ADDRESS) LIKE UPPER('%${query.replace(/'/g, "''")}%')`;
    searchQuery.outFields = ["FULL_ADDRESS", "OBJECTID"];
    searchQuery.returnGeometry = true;
    
    addressesLayerRef.queryFeatures(searchQuery).then(result => {
      const matchingFeatures = result.features;
      
      if (matchingFeatures.length > 0) {
        // Sort by relevance (exact matches first, then partial matches)
        const exactMatches = matchingFeatures.filter(feature => 
          feature.attributes.FULL_ADDRESS && 
          feature.attributes.FULL_ADDRESS.toLowerCase() === query.toLowerCase()
        );
        
        const featuresToShow = exactMatches.length > 0 ? exactMatches : matchingFeatures;
        
        // Make sure addresses layer is visible when showing results
        if (!addressesLayerRef.visible) {
          addressesLayerRef.visible = true;
          document.getElementById("chkAddresses").checked = true;
        }
        
        // Zoom to matching addresses immediately
        if (featuresToShow.length === 1 || exactMatches.length > 0) {
          // Single address or exact match - zoom to first result with appropriate scale
          const targetFeature = exactMatches.length > 0 ? exactMatches[0] : featuresToShow[0];
          view.goTo({
            center: targetFeature.geometry,
            scale: 2000
          }).then(() => {
            // Flash the selected address point
            flashAddressPoint(targetFeature.geometry);
            // Clear the search box after successful navigation
            searchBox.value = "";
            checkAddressesScale(); // Check if we need to show scale warning
          });
        } else {
          // Multiple addresses - zoom to extent of all matches
          const geometries = featuresToShow.map(f => f.geometry).filter(g => g);
          if (geometries.length > 0) {
            let extent = geometries[0].extent;
            for (let i = 1; i < geometries.length; i++) {
              if (geometries[i].extent) {
                extent = extent.union(geometries[i].extent);
              }
            }
            view.goTo(extent.expand(1.5)).then(() => {
              // For multiple results, flash the first/most relevant address
              const primaryFeature = exactMatches.length > 0 ? exactMatches[0] : featuresToShow[0];
              flashAddressPoint(primaryFeature.geometry);
              // Clear the search box after successful navigation
              searchBox.value = "";
              checkAddressesScale(); // Check if we need to show scale warning
            });
          }
        }
        
      } else {
        console.log(`No addresses found matching "${query}"`);
      }
    }).catch(error => {
      console.error("Address search error:", error);
    });
  }

  // Suitability Analysis function
  function performSuitabilityAnalysis() {
    if (placedPins.length === 0) return;
    
    document.getElementById("suitabilityResults").innerHTML = "Analyzing...";
    
    // Clear previous buffers
    suitabilityBuffersLayer.removeAll();
    
    // Create analysis promises for all pins
    const analysisPromises = placedPins.map(pinData => analyzeSinglePin(pinData));
    
    Promise.all(analysisPromises).then(results => {
      displayAnalysisResults(results);
    }).catch(error => {
      console.error("Analysis error:", error);
      document.getElementById("suitabilityResults").innerHTML = "Analysis failed. Please try again.";
    });
  }

  async function analyzeSinglePin(pinData) {
    const { point, building, graphic } = pinData;
    const pinId = graphic.attributes.pinId;
    
    // Create 1000ft buffers
    const pinBuffer = geometryEngine.buffer(point, 1000, "feet");
    const buildingBuffer = geometryEngine.buffer(building.geometry, 1000, "feet");
    
    // Add buffer graphics to map
    suitabilityBuffersLayer.add(new Graphic({
      geometry: pinBuffer,
      symbol: {
        type: "simple-fill",
        color: [0, 123, 255, 0.2], // Light blue for pin buffer
        outline: { color: [0, 123, 255, 0.8], width: 2 }
      }
    }));
    
    suitabilityBuffersLayer.add(new Graphic({
      geometry: buildingBuffer,
      symbol: {
        type: "simple-fill",
        color: [255, 165, 0, 0.2], // Light orange for building buffer
        outline: { color: [255, 165, 0, 0.8], width: 2 }
      }
    }));
    
    // Perform spatial queries
    const pinAnalysis = await analyzePinLocation(point, pinBuffer);
    const buildingAnalysis = await analyzeBuildingBuffer(buildingBuffer);
    
    return {
      pinId: pinId,
      pinAnalysis: pinAnalysis,
      buildingAnalysis: buildingAnalysis
    };
  }

  async function analyzePinLocation(point, buffer) {
    const results = {};
    
    try {
      // Find nearest address to the pin
      if (addressesLayerRef) {
        const addressQuery = addressesLayerRef.createQuery();
        addressQuery.geometry = buffer; // Search within the 1000ft buffer
        addressQuery.spatialRelationship = "intersects";
        addressQuery.outFields = ["FULL_ADDRESS"];
        addressQuery.returnGeometry = true;
        const addressResult = await addressesLayerRef.queryFeatures(addressQuery);
        
        if (addressResult.features.length > 0) {
          // Find the closest address to the pin
          let closestAddress = null;
          let closestDistance = Infinity;
          
          addressResult.features.forEach(addressFeature => {
            const distance = geometryEngine.distance(point, addressFeature.geometry, "feet");
            if (distance < closestDistance) {
              closestDistance = distance;
              closestAddress = addressFeature.attributes.FULL_ADDRESS;
            }
          });
          
          results.nearestAddress = closestAddress;
          results.addressDistance = Math.round(closestDistance);
        } else {
          results.nearestAddress = "No address found within 1000ft";
          results.addressDistance = null;
        }
      }
      
      // Check No-go zoning
      if (zoningLayerRef) {
        // First, let's see what zone the pin is actually in
        const allZonesQuery = zoningLayerRef.createQuery();
        allZonesQuery.geometry = point;
        allZonesQuery.spatialRelationship = "intersects";
        allZonesQuery.outFields = ["ZONE_DISTRICT", "ZONE_DESCRIPTION"];
        const allZonesResult = await zoningLayerRef.queryFeatures(allZonesQuery);
        
        if (allZonesResult.features.length > 0) {
          const actualZone = allZonesResult.features[0].attributes.ZONE_DISTRICT;
          const zoneDescription = allZonesResult.features[0].attributes.ZONE_DESCRIPTION;
          console.log(`Pin location is in zone: ${actualZone} (${zoneDescription})`);
          
          // Complete list of no-go zones for marijuana dispensaries
          const noGoZones = ["CMP-EI", "CMP-EI2", "C-RX-12", "C-RX-5", "C-RX-8", "D-CV", "E-MS-2", "E-MS-2X", "E-MU-2.5", "E-MX-2", "E-MX-2A", "E-MX-2X", "E-RH-2.5", "E-RX-3", "E-RX-5", "E-SU-A", "E-SU-B", "E-SU-B1", "E-SU-D", "E-SU-D1", "E-SU-D1X", "E-SU-DX", "E-SU-G", "E-SU-G1", "E-TU-B", "E-TU-C", "G-MU-12", "G-MU-20", "G-MU-3", "G-MU-5", "G-MU-8", "G-RH-3", "G-RO-3", "G-RO-5", "G-RX-3", "G-RX-5", "M-RH-3", "M-RX-3", "M-RX-5", "M-RX-5A", "O-1", "OS-A", "OS-B", "OS-C", "PUD", "S-MU-12", "S-MU-20", "S-MU-3", "S-MU-5", "S-MU-8", "S-MX-2", "S-MX-2X", "S-RH-2.5", "S-SU-A", "S-SU-D", "S-SU-F", "S-SU-F1", "S-SU-FX", "S-SU-I", "S-SU-IX", "U-MS-2", "U-MS-2X", "U-MX-2", "U-MX-2X", "U-RH-2.5", "U-RH-3A", "U-RX-3", "U-RX-5", "U-SU-A", "U-SU-A1", "U-SU-A2", "U-SU-B", "U-SU-B1", "U-SU-B2", "U-SU-C", "U-SU-C1", "U-SU-C2", "U-SU-E", "U-SU-E1", "U-SU-H", "U-SU-H1", "U-TU-B", "U-TU-B2", "U-TU-C", "B-A-1", "B-A-2", "B-A-4", "GTWY-OSU", "O-1", "O-2", "OS-1", "P-1", "PUD-G", "GTWY-RU1", "GTWY-RU2", "R-O", "R-1", "R-2", "R-2-A", "R-2-B", "R-3", "R-3-X", "R-4", "R-4-X", "R-5", "R-MU-20", "R-MU-30", "RS-4", "R-X", "E-RH-2.5"];
          
          results.inNoGoZone = noGoZones.includes(actualZone);
          results.actualZone = actualZone; // Store the actual zone district
          results.zoneDescription = zoneDescription; // Store the zone description for display
          
          console.log(`Is ${actualZone} a no-go zone? ${results.inNoGoZone}`);
        } else {
          results.inNoGoZone = false;
          results.actualZone = "No zoning found";
          results.zoneDescription = "";
          console.log("No zoning district found for this location");
        }
      }
      
      // Check No-go statistical neighborhoods
      if (statisticalNeighborhoodsLayerRef) {
        const neighborhoodQuery = statisticalNeighborhoodsLayerRef.createQuery();
        neighborhoodQuery.geometry = point;
        neighborhoodQuery.spatialRelationship = "intersects";
        neighborhoodQuery.where = "NBHD_NAME IN ('Overland', 'Northeast Park Hill', 'Baker', 'Five Points', 'Montbello', 'Valverde')";
        const neighborhoodResult = await statisticalNeighborhoodsLayerRef.queryFeatures(neighborhoodQuery);
        results.inNoGoNeighborhood = neighborhoodResult.features.length > 0;
      }
      
      // Check proximity to marijuana stores
      if (retailMarijuanaLayerRef) {
        const marijuanaQuery = retailMarijuanaLayerRef.createQuery();
        marijuanaQuery.geometry = buffer;
        marijuanaQuery.spatialRelationship = "intersects";
        const marijuanaResult = await retailMarijuanaLayerRef.queryFeatures(marijuanaQuery);
        results.nearMarijuanaStore = marijuanaResult.features.length > 0;
        results.marijuanaStoreCount = marijuanaResult.features.length;
      }
      
      // Check proximity to drug treatment facilities
      if (drugTreatmentLayerRef) {
        const drugTreatmentQuery = drugTreatmentLayerRef.createQuery();
        drugTreatmentQuery.geometry = buffer;
        drugTreatmentQuery.spatialRelationship = "intersects";
        const drugTreatmentResult = await drugTreatmentLayerRef.queryFeatures(drugTreatmentQuery);
        results.nearDrugTreatment = drugTreatmentResult.features.length > 0;
        results.drugTreatmentCount = drugTreatmentResult.features.length;
      }
      
    } catch (error) {
      console.error("Pin analysis error:", error);
    }
    
    return results;
  }

  async function analyzeBuildingBuffer(buffer) {
    const results = {};
    
    try {
      // Check proximity to public school parcels
      if (publicSchoolAreasLayerRef) {
        const publicSchoolQuery = publicSchoolAreasLayerRef.createQuery();
        publicSchoolQuery.geometry = buffer;
        publicSchoolQuery.spatialRelationship = "intersects";
        const publicSchoolResult = await publicSchoolAreasLayerRef.queryFeatures(publicSchoolQuery);
        results.nearPublicSchool = publicSchoolResult.features.length > 0;
        results.publicSchoolCount = publicSchoolResult.features.length;
      }
      
      // Check proximity to non-public school parcels
      if (nonPublicSchoolAreasLayerRef) {
        const nonPublicSchoolQuery = nonPublicSchoolAreasLayerRef.createQuery();
        nonPublicSchoolQuery.geometry = buffer;
        nonPublicSchoolQuery.spatialRelationship = "intersects";
        const nonPublicSchoolResult = await nonPublicSchoolAreasLayerRef.queryFeatures(nonPublicSchoolQuery);
        results.nearNonPublicSchool = nonPublicSchoolResult.features.length > 0;
        results.nonPublicSchoolCount = nonPublicSchoolResult.features.length;
      }
      
      // Check proximity to childcare facilities (both points and parcels)
      let childcareCount = 0;
      let nearChildcare = false;
      
      if (childcareFacilitiesLayerRef) {
        const childcareFacilitiesQuery = childcareFacilitiesLayerRef.createQuery();
        childcareFacilitiesQuery.geometry = buffer;
        childcareFacilitiesQuery.spatialRelationship = "intersects";
        const childcareFacilitiesResult = await childcareFacilitiesLayerRef.queryFeatures(childcareFacilitiesQuery);
        childcareCount += childcareFacilitiesResult.features.length;
        nearChildcare = nearChildcare || childcareFacilitiesResult.features.length > 0;
      }
      
      if (childcareParcelsLayerRef) {
        const childcareParcelsQuery = childcareParcelsLayerRef.createQuery();
        childcareParcelsQuery.geometry = buffer;
        childcareParcelsQuery.spatialRelationship = "intersects";
        const childcareParcelsResult = await childcareParcelsLayerRef.queryFeatures(childcareParcelsQuery);
        childcareCount += childcareParcelsResult.features.length;
        nearChildcare = nearChildcare || childcareParcelsResult.features.length > 0;
      }
      
      results.nearChildcare = nearChildcare;
      results.childcareCount = childcareCount;
      
    } catch (error) {
      console.error("Building analysis error:", error);
    }
    
    return results;
  }

  function updatePinColor(pinId, hasIssues) {
    // Find the pin graphic in the suitability pins layer
    const pinGraphic = suitabilityPinsLayer.graphics.find(graphic => 
      graphic.attributes && graphic.attributes.pinId === pinId
    );
    
    if (pinGraphic) {
      // Update the symbol color based on analysis results
      const newSymbol = {
        type: "simple-marker",
        style: "circle",
        color: hasIssues ? [220, 53, 69] : [40, 167, 69], // Red for issues, green for pass
        size: "12px",
        outline: {
          color: [255, 255, 255],
          width: 2
        }
      };
      
      pinGraphic.symbol = newSymbol;
    }
  }

  function displayAnalysisResults(results) {
    let html = "<h5 style='margin-top: 0; color: #034d46;'>Suitability Analysis Results</h5>";
    
    results.forEach((result, index) => {
      const { pinId, pinAnalysis, buildingAnalysis } = result;
      
      // Determine if the location passes all criteria
      const hasIssues = pinAnalysis.inNoGoZone || 
                       pinAnalysis.inNoGoNeighborhood || 
                       buildingAnalysis.nearPublicSchool || 
                       buildingAnalysis.nearNonPublicSchool || 
                       buildingAnalysis.nearChildcare;
      
      // Update the pin color based on analysis results
      updatePinColor(pinId, hasIssues);
      
      html += `<div class="analysis-section">`;
      html += `<h5>Pin ${pinId} Analysis ${hasIssues ? '❌' : '✅'}</h5>`;
      
      // Pin location analysis
      html += `<div style="margin-bottom: 8px;"><strong>Pin Location (1000ft radius):</strong></div>`;
      
      // Add nearest address information
      if (pinAnalysis.nearestAddress) {
        html += `<div class="analysis-item address-info" style="background-color: #e3f2fd; border-left: 4px solid #1976d2; margin-bottom: 6px; padding: 8px;">`;
        html += `📍 <strong>Nearest Address:</strong> ${pinAnalysis.nearestAddress}`;
        if (pinAnalysis.addressDistance !== null) {
          html += ` <span style="color: #666;">(${pinAnalysis.addressDistance}ft away)</span>`;
        }
        html += `</div>`;
      }
      
      html += `<div class="analysis-item ${pinAnalysis.inNoGoZone ? 'fail' : 'pass'}">`;
      html += `${pinAnalysis.inNoGoZone ? '❌' : '✅'} ${pinAnalysis.inNoGoZone ? 'In No-Go Zone' : 'Not in No-Go Zone'}`;
      if (pinAnalysis.actualZone && pinAnalysis.actualZone !== 'No zoning found') {
        html += `<br><span style="font-size: 0.9em; color: #666; margin-left: 20px;">Zone: ${pinAnalysis.actualZone}`;
        if (pinAnalysis.zoneDescription && pinAnalysis.zoneDescription.trim() !== '') {
          html += ` - ${pinAnalysis.zoneDescription}`;
        }
        html += `</span>`;
      }
      html += `</div>`;
      
      html += `<div class="analysis-item ${pinAnalysis.inNoGoNeighborhood ? 'fail' : 'pass'}">`;
      html += `${pinAnalysis.inNoGoNeighborhood ? '❌' : '✅'} ${pinAnalysis.inNoGoNeighborhood ? 'In No-Go Neighborhood' : 'Not in No-Go Neighborhood'}`;
      html += `</div>`;
      
      html += `<div class="analysis-item ${pinAnalysis.nearMarijuanaStore ? 'warning' : 'pass'}">`;
      html += `${pinAnalysis.nearMarijuanaStore ? '⚠️' : '✅'} ${pinAnalysis.nearMarijuanaStore ? `Near ${pinAnalysis.marijuanaStoreCount} marijuana store(s)` : 'No marijuana stores nearby'}`;
      html += `</div>`;
      
      html += `<div class="analysis-item ${pinAnalysis.nearDrugTreatment ? 'warning' : 'pass'}">`;
      html += `${pinAnalysis.nearDrugTreatment ? '⚠️' : '✅'} ${pinAnalysis.nearDrugTreatment ? `Near ${pinAnalysis.drugTreatmentCount} drug treatment facility(ies)` : 'No drug treatment facilities nearby'}`;
      html += `</div>`;
      
      // Building buffer analysis
      html += `<div style="margin: 8px 0 4px 0;"><strong>Building Buffer (1000ft from edges):</strong></div>`;
      html += `<div class="analysis-item ${buildingAnalysis.nearPublicSchool ? 'fail' : 'pass'}">`;
      html += `${buildingAnalysis.nearPublicSchool ? '❌' : '✅'} ${buildingAnalysis.nearPublicSchool ? `Near ${buildingAnalysis.publicSchoolCount} public school(s)` : 'No public schools nearby'}`;
      html += `</div>`;
      
      html += `<div class="analysis-item ${buildingAnalysis.nearNonPublicSchool ? 'fail' : 'pass'}">`;
      html += `${buildingAnalysis.nearNonPublicSchool ? '❌' : '✅'} ${buildingAnalysis.nearNonPublicSchool ? `Near ${buildingAnalysis.nonPublicSchoolCount} non-public school(s)` : 'No non-public schools nearby'}`;
      html += `</div>`;
      
      html += `<div class="analysis-item ${buildingAnalysis.nearChildcare ? 'fail' : 'pass'}">`;
      html += `${buildingAnalysis.nearChildcare ? '❌' : '✅'} ${buildingAnalysis.nearChildcare ? `Near ${buildingAnalysis.childcareCount} childcare facility(ies)` : 'No childcare facilities nearby'}`;
      html += `</div>`;
      
      html += `</div>`;
    });
    
    document.getElementById("suitabilityResults").innerHTML = html;
    
    // Show the copy button after results are displayed
    const copyButton = document.getElementById("copyResults");
    if (copyButton) {
      copyButton.style.display = "inline-block";
    }
    
    // Store results for copying
    window.currentAnalysisResults = results;
  }

  // Initial legend update when map loads
  view.when(function() {
    updateLegendVisibility();
    updateBufferSectionVisibility();
    // Initialize measurement results panel
    document.getElementById("measurementResults").innerHTML = "Click a measurement tool to start measuring.";
  });

  console.log("Denver Colorado Dispensary Map loaded successfully!");
});