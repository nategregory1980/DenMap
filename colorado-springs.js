// Denver Dispensary Map JavaScript

require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/layers/GeoJSONLayer",
  "esri/layers/CSVLayer",
  "esri/geometry/geometryEngine",
  "esri/widgets/DistanceMeasurement2D",
  "esri/widgets/AreaMeasurement2D",
  "esri/layers/GraphicsLayer",
  "esri/Graphic"
], function(Map, MapView, FeatureLayer, GeoJSONLayer, CSVLayer, geometryEngine, DistanceMeasurement2D, AreaMeasurement2D, GraphicsLayer, Graphic) {

  let map, view;
  
  // Layer references
  let countyBoundariesLayerRef = null;
  let retailMarijuanaLayerRef = null;
  let medicalMarijuanaLayerRef = null;
  let vettedAreasLayerRef = null;
  let childcareFacilitiesLayerRef = null;
  let drugTreatmentLayerRef = null;
  let publicSchoolsLayerRef = null;
  let parcelsLayerRef = null;

  // Initialize map
  map = new Map({ basemap: "streets-navigation-vector" });
  view = new MapView({ 
    container: "viewDiv", 
    map: map, 
    center: [-104.7702, 38.8805], // Colorado Springs, Colorado
    zoom: 10 
  });

  // County Boundaries Layer
  const countyBoundariesLayer = new GeoJSONLayer({
    url: "https://media.githubusercontent.com/media/nategregory1980/DenMap/97a0c8b08e303bb74ec74e2e024a059ec5365b5a/Colorado_Springs_geojson/Colorado_springs_boundary.geojson",
    title: "County Boundaries",
    visible: true,
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-fill",
        color: [0, 0, 0, 0], // Transparent fill
        outline: {
          color: [0, 0, 0], // Black outline
          width: 2
        }
      }
    }
  });
  countyBoundariesLayerRef = countyBoundariesLayer;
  map.add(countyBoundariesLayer);

  // Retail Marijuana Store Layer
  const retailMarijuanaLayer = new CSVLayer({
    url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRXPcM58k3rifZTVGuaocBkU0QJjZgiqL06ggh9sXBCrVyJVsWDO2Fb5XC9OUdoojZ9Cal_Sx_SqVsz/pub?gid=1574512049&single=true&output=csv",
    title: "Retail Marijuana Store Location",
    visible: true,
    latitudeField: "Latitude",
    longitudeField: "Longitude",
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-marker",
        color: [255, 0, 0], // Red color for retail
        size: 8,
        outline: {
          color: [255, 255, 255],
          width: 1
        }
      }
    },
    popupTemplate: {
      title: "{Facility Name}",
      content: [{
        type: "fields",
        fieldInfos: [{
          fieldName: "License Number",
          label: "License Number"
        }, {
          fieldName: "DBA",
          label: "Doing Business As"
        }, {
          fieldName: "Street", 
          label: "Address Line"
        }, {
          fieldName: "City",
          label: "City"
        }, {
          fieldName: "State",
          label: "State"
        }, {
          fieldName: "ZIP Code",
          label: "ZIP Code"
        }]
      }]
    }
  });
  retailMarijuanaLayerRef = retailMarijuanaLayer;
  map.add(retailMarijuanaLayer);

  // Medical Marijuana Store Layer
  const medicalMarijuanaLayer = new CSVLayer({
    url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRXPcM58k3rifZTVGuaocBkU0QJjZgiqL06ggh9sXBCrVyJVsWDO2Fb5XC9OUdoojZ9Cal_Sx_SqVsz/pub?gid=1220809796&single=true&output=csv",
    title: "Medical Marijuana Store Location",
    visible: true,
    latitudeField: "Latitude",
    longitudeField: "Longitude",
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-marker",
        color: [0, 128, 0], // Green color for medical
        size: 8,
        outline: {
          color: [255, 255, 255],
          width: 1
        }
      }
    },
    popupTemplate: {
      title: "{Facility Name}",
      content: [{
        type: "fields",
        fieldInfos: [{
          fieldName: "License Number",
          label: "License Number"
        }, {
          fieldName: "DBA",
          label: "Doing Business As"
        }, {
          fieldName: "Street",
          label: "Address Line"
        }, {
          fieldName: "City",
          label: "City"
        }, {
          fieldName: "State",
          label: "State"
        }, {
          fieldName: "ZIP Code",
          label: "ZIP Code"
        }]
      }]
    }
  });
  medicalMarijuanaLayerRef = medicalMarijuanaLayer;
  map.add(medicalMarijuanaLayer);

  // Vetted Areas Layer (GeoJSON)
  const vettedAreasLayer = new GeoJSONLayer({
    url: "https://media.githubusercontent.com/media/nategregory1980/DenMap/97a0c8b08e303bb74ec74e2e024a059ec5365b5a/Colorado_Springs_geojson/Colorado_springs_vetted.geojson",
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

  // Childcare Facilities Layer
  const childcareFacilitiesLayer = new GeoJSONLayer({
    url: "https://media.githubusercontent.com/media/nategregory1980/DenMap/97a0c8b08e303bb74ec74e2e024a059ec5365b5a/Colorado_Springs_geojson/childcare_facilites.geojson",
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
      title: "{LICENSE_NU}",
      content: [{
        type: "fields",
        fieldInfos: [{
          fieldName: "PROVIDER_N",
          label: "Childcare Provider"
        }, {
          fieldName: "STREET_ADD",
          label: "Address"
        },{
            fieldName: "CITY",
            label: "City"
        },{
            fieldName: "STATE",
            label: "State"
        },{
            fieldName: "ZIP",
            label: "ZIP"
        }]
      }]
    }
  });
  childcareFacilitiesLayerRef = childcareFacilitiesLayer;
  map.add(childcareFacilitiesLayer);

  // Drug and Alcohol Treatment Layer
  const drugTreatmentLayer = new GeoJSONLayer({
    url: "https://media.githubusercontent.com/media/nategregory1980/DenMap/97a0c8b08e303bb74ec74e2e024a059ec5365b5a/Colorado_Springs_geojson/Alcohol_treatment_facilities.geojson",
    title: "Drug and Alcohol Treatment",
    visible: false,
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-marker",
        color: [134, 67, 173], // Purple color
        size: 4,
        outline: { color: "#000000", width: 1 }
      }
    },
    popupTemplate: {
        title: "{Provider_N}",
        content: [{
            type: "fields",
            fieldInfos: [{
                fieldName: "Address",
                label: "Address"
            }, {
                fieldName: "Address2",
                label: "Address line 2"
            }, {
                fieldName: "City",
                label: "City"
            }, {
                fieldName: "State",
                label: "State"
            }, {
                fieldName: "Zip",
                label: "ZIP"
            }]
        }]
    }
  });
  drugTreatmentLayerRef = drugTreatmentLayer;
  map.add(drugTreatmentLayer);

  // Public Schools Layer
  const publicSchoolsLayer = new GeoJSONLayer({
    url: "https://media.githubusercontent.com/media/nategregory1980/DenMap/97a0c8b08e303bb74ec74e2e024a059ec5365b5a/Colorado_Springs_geojson/schools.geojson",
    title: "Schools",
    visible: false,
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-marker",
        color: "#0011ff",
        size: 4,
        outline: { color: "#000000", width: 0.5 }
      }
    },
    popupTemplate: {
      title: "{School_Nam}",
      content: [{
        type: "fields",
        fieldInfos: [{
          fieldName: "Address",
          label: "Address"
        }, {
          fieldName: "City",
          label: "City"
        }, {
          fieldName: "State",
          label: "State"
        }, {
          fieldName: "Zip",
          label: "ZIP"
        }]
      }]
    }
  });

  publicSchoolsLayerRef = publicSchoolsLayer;
  map.add(publicSchoolsLayer);

  // Parcels Layer
  const parcelsLayer = new GeoJSONLayer({
    url: "https://media.githubusercontent.com/media/nategregory1980/DenMap/97a0c8b08e303bb74ec74e2e024a059ec5365b5a/Colorado_Springs_geojson/Colorado_springs_parcels.geojson",
    title: "Parcels",
    visible: false,
    minScale: 5000,
    outFields: ["PARCEL", "HYPERLINK"],
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-fill",
        color: [0, 0, 0, 0],
        outline: { color: "#C0C0C0", width: 0.5 }
      }
    },
    popupTemplate: {
      title: "{PARCEL}",
      content: [{
        type: "fields",
        fieldInfos: [{
          fieldName: "HYPERLINK",
          label: "Parcel Information"
        }]
      }]
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

  // Scale monitoring for parcels layer
  const scaleWarningBanner = document.getElementById("scaleWarningBanner");
  
  function checkScale() {
    const parcelsVisible = parcelsLayerRef && parcelsLayerRef.visible;
    const scaleOutOfRange = view.scale > 5000;
    
    if (parcelsVisible && scaleOutOfRange) {
      scaleWarningBanner.style.display = "block";
    } else {
      scaleWarningBanner.style.display = "none";
    }
  }
  
  view.when(function() {
    view.watch("scale", checkScale);
    checkScale(); // Initial check
  });

  // UI Event Handlers
  const layersBtn = document.getElementById("layersBtn");
  const layersDropdown = document.getElementById("layersDropdown");
  const legendBtn = document.getElementById("legendBtn");
  const mapLegend = document.getElementById("mapLegend");
  const bufferBtn = document.getElementById("bufferBtn");
  const bufferPanel = document.getElementById("bufferPanel");
  const measureBtn = document.getElementById("measureBtn");
  const measurePanel = document.getElementById("measurePanel");
  const suitabilityBtn = document.getElementById("suitabilityBtn");
  const suitabilityPanel = document.getElementById("suitabilityPanel");
  
  // Buffer variables
  let bufferLayer = null;
  let medicalMarijuanaBufferLayer = null;
  let childcareBufferLayer = null;
  let drugTreatmentBufferLayer = null;
  let publicSchoolsBufferLayer = null;

  // Measurement variables
  let measurementWidget = null;
  let measurementGraphicsLayer = null;

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
      // Buildings layer has been removed
      
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
  
  document.getElementById("chkMedicalMarijuana").addEventListener("change", function(e) {
    if (medicalMarijuanaLayerRef) medicalMarijuanaLayerRef.visible = e.target.checked;
    updateLegendVisibility();
    updateBufferSectionVisibility();
  });
  
  document.getElementById("chkVettedAreas").addEventListener("change", function(e) {
    if (vettedAreasLayerRef) vettedAreasLayerRef.visible = e.target.checked;
    updateLegendVisibility();
  });
  
  document.getElementById("chkChildcareFacilities").addEventListener("change", function(e) {
    if (childcareFacilitiesLayerRef) childcareFacilitiesLayerRef.visible = e.target.checked;
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
    updateLegendVisibility();
    updateBufferSectionVisibility();
  });
  
  document.getElementById("chkParcels").addEventListener("change", function(e) {
    if (parcelsLayerRef) parcelsLayerRef.visible = e.target.checked;
    checkScale(); // Check scale when visibility changes
    updateLegendVisibility();
  });

  // Clear All Layers button
  document.getElementById("clearAllLayers").addEventListener("click", function() {
    // Uncheck all layer checkboxes except Marijuana Store Locations
    const layerCheckboxes = [
      // "chkRetailMarijuana", // Keep retail marijuana checked
      // "chkMedicalMarijuana", // Keep medical marijuana checked
      "chkVettedAreas",
      "chkChildcareFacilities",
      "chkDrugTreatment",
      "chkPublicSchools",
      "chkParcels"
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

  // Initialize measurement graphics layer
  measurementGraphicsLayer = new GraphicsLayer({
    title: "Measurements"
  });
  map.add(measurementGraphicsLayer);

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
    
    // Turn on parcels layer
    if (parcelsLayerRef) {
      parcelsLayerRef.visible = true;
      // Update the checkbox if it exists
      const parcelsCheckbox = document.getElementById("chkParcels");
      if (parcelsCheckbox) {
        parcelsCheckbox.checked = true;
      }
    }
    
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
    
    // Check if click is on a parcel
    view.hitTest(event).then(response => {
      const parcelHit = response.results.find(result => 
        result.graphic && result.graphic.layer === parcelsLayerRef
      );
      
      if (parcelHit) {
        placeSuitabilityPin(event.mapPoint, parcelHit.graphic);
      } else {
        console.log("Please click on a parcel to place a pin.");
      }
    });
  }

  function placeSuitabilityPin(point, parcelGraphic) {
    // Log parcel attributes for debugging
    console.log("Parcel attributes:", parcelGraphic.attributes);
    
    // Try different possible field names for parcel number
    const parcelNumber = parcelGraphic.attributes.PARCEL || 
                        parcelGraphic.attributes.parcel || 
                        parcelGraphic.attributes.ParcelID ||
                        parcelGraphic.attributes.PARCELID ||
                        parcelGraphic.attributes.PIN ||
                        "Unknown";
    
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
        parcelId: parcelGraphic.attributes.OBJECTID || placedPins.length + 1,
        parcelNumber: parcelNumber
      }
    });
    
    // Store pin data
    placedPins.push({
      graphic: pinGraphic,
      point: point,
      parcel: parcelGraphic,
      parcelNumber: parcelNumber
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

    let textResults = "COLORADO SPRINGS DISPENSARY SUITABILITY ANALYSIS\n";
    textResults += "=" + "=".repeat(50) + "\n\n";

    window.currentAnalysisResults.forEach((result) => {
      const { pinId, parcelNumber, analysis } = result;
      
      // Determine if the location has issues (within 1000ft of any facility)
      const hasIssues = analysis.nearRetailMarijuana || 
                       analysis.nearMedicalMarijuana || 
                       analysis.nearChildcare ||
                       analysis.nearDrugTreatment ||
                       analysis.nearSchools;

      textResults += `PIN ${pinId} ANALYSIS - ${hasIssues ? 'HAS ISSUES ❌' : 'SUITABLE ✅'}\n`;
      textResults += `Parcel: ${parcelNumber}\n`;
      textResults += "-".repeat(40) + "\n";

      // Proximity analysis (1000ft buffer from pin)
      textResults += "FACILITIES WITHIN 1000FT:\n";
      textResults += `  • Retail Marijuana: ${analysis.nearRetailMarijuana ? `❌ Near ${analysis.retailMarijuanaCount} store(s)` : '✅ No stores nearby'}\n`;
      textResults += `  • Medical Marijuana: ${analysis.nearMedicalMarijuana ? `❌ Near ${analysis.medicalMarijuanaCount} store(s)` : '✅ No stores nearby'}\n`;
      textResults += `  • Childcare Facilities: ${analysis.nearChildcare ? `❌ Near ${analysis.childcareCount} facility(ies)` : '✅ No facilities nearby'}\n`;
      textResults += `  • Drug & Alcohol Treatment: ${analysis.nearDrugTreatment ? `❌ Near ${analysis.drugTreatmentCount} facility(ies)` : '✅ No facilities nearby'}\n`;
      textResults += `  • Schools: ${analysis.nearSchools ? `❌ Near ${analysis.schoolsCount} school(s)` : '✅ No schools nearby'}\n`;
      
      textResults += "\n";
    });

    textResults += `\nAnalysis completed on ${new Date().toLocaleString()}\n`;
    textResults += "Generated by Colorado Springs Dispensary Map Tool\n";

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
    const retailMarijuanaDistance = document.getElementById("retailMarijuanaBufferDistance").value;
    const medicalMarijuanaDistance = document.getElementById("medicalMarijuanaBufferDistance").value;
    const childcareDistance = document.getElementById("childcareBufferDistance").value;
    const drugTreatmentDistance = document.getElementById("drugTreatmentBufferDistance").value;
    const schoolsDistance = document.getElementById("schoolsBufferDistance").value;
    
    // Apply all buffers using their respective distances (only for visible layers)
    if (retailMarijuanaDistance && retailMarijuanaDistance > 0 && retailMarijuanaLayerRef && retailMarijuanaLayerRef.visible) {
      applyMarijuanaBuffer(retailMarijuanaDistance);
    }
    if (medicalMarijuanaDistance && medicalMarijuanaDistance > 0 && medicalMarijuanaLayerRef && medicalMarijuanaLayerRef.visible) {
      applyMedicalMarijuanaBuffer(medicalMarijuanaDistance);
    }
    if (childcareDistance && childcareDistance > 0 && childcareFacilitiesLayerRef && childcareFacilitiesLayerRef.visible) {
      applyChildcareBufferStandalone(childcareDistance);
    }
    if (drugTreatmentDistance && drugTreatmentDistance > 0 && drugTreatmentLayerRef && drugTreatmentLayerRef.visible) {
      applyDrugTreatmentBufferStandalone(drugTreatmentDistance);
    }
    if (schoolsDistance && schoolsDistance > 0 && publicSchoolsLayerRef && publicSchoolsLayerRef.visible) {
      applyPublicSchoolsBufferStandalone(schoolsDistance);
    }
  });
  document.getElementById("clearAllBuffers").addEventListener("click", clearAllBuffers);

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
        return geometryEngine.geodesicBuffer(feature.geometry, parseInt(bufferDistance), "feet");
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

  function applyMedicalMarijuanaBuffer(bufferDistance) {
    if (!medicalMarijuanaLayerRef) {
      alert("Medical marijuana store layer is not available");
      return;
    }

    if (!medicalMarijuanaLayerRef.visible) {
      alert("Medical Marijuana layer must be visible to create buffers");
      return;
    }

    if (!bufferDistance || bufferDistance <= 0) {
      alert("Please enter a valid buffer distance for medical marijuana stores");
      return;
    }

    // Clear existing medical marijuana buffer
    if (medicalMarijuanaBufferLayer) {
      map.remove(medicalMarijuanaBufferLayer);
      medicalMarijuanaBufferLayer = null;
    }
    const query = medicalMarijuanaLayerRef.createQuery();
    query.where = medicalMarijuanaLayerRef.definitionExpression || "1=1";
    query.returnGeometry = true;
    query.outFields = ["*"];

    medicalMarijuanaLayerRef.queryFeatures(query).then(results => {
      if (results.features.length === 0) return;

      const bufferGeometries = results.features.map(feature => {
        return geometryEngine.geodesicBuffer(feature.geometry, parseInt(bufferDistance), "feet");
      });

      const bufferGraphics = bufferGeometries.map((geometry, index) => ({
        geometry: geometry,
        attributes: {
          OBJECTID: index,
          BufferDistance: bufferDistance,
          LayerType: "Medical Marijuana Store",
          OriginalName: results.features[index].attributes.DBA_NAME || results.features[index].attributes["Facility Name"] || "Unknown"
        }
      }));

      medicalMarijuanaBufferLayer = new FeatureLayer({
        source: bufferGraphics,
        geometryType: "polygon",
        spatialReference: view.spatialReference,
        title: `Medical Marijuana Store Buffers (${bufferDistance} ft)`,
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
            color: [0, 128, 0, 0.3], // Green for medical marijuana stores
            outline: {
              color: [0, 128, 0, 0.8],
              width: 2
            }
          }
        }
      });

      const medicalMarijuanaIndex = map.layers.indexOf(medicalMarijuanaLayerRef);
      if (medicalMarijuanaIndex > 0) {
        map.add(medicalMarijuanaBufferLayer, medicalMarijuanaIndex);
      } else {
        map.add(medicalMarijuanaBufferLayer, 0);
      }
    }).catch(error => {
      console.error("Error creating medical marijuana buffer:", error);
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
        return geometryEngine.geodesicBuffer(feature.geometry, parseInt(bufferDistance), "feet");
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
        return geometryEngine.geodesicBuffer(feature.geometry, parseInt(bufferDistance), "feet");
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
        return geometryEngine.geodesicBuffer(feature.geometry, parseInt(bufferDistance), "feet");
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
  function clearAllBuffers() {
    if (bufferLayer) {
      map.remove(bufferLayer);
      bufferLayer = null;
    }
    if (medicalMarijuanaBufferLayer) {
      map.remove(medicalMarijuanaBufferLayer);
      medicalMarijuanaBufferLayer = null;
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
  }

  // Function to update buffer section visibility based on layer visibility
  function updateBufferSectionVisibility() {
    // Retail Marijuana buffer section
    const retailMarijuanaSection = document.getElementById('retailMarijuanaBufferSection');
    if (retailMarijuanaSection) {
      if (retailMarijuanaLayerRef && retailMarijuanaLayerRef.visible) {
        retailMarijuanaSection.classList.remove('hidden');
      } else {
        retailMarijuanaSection.classList.add('hidden');
      }
    }

    // Medical Marijuana buffer section
    const medicalMarijuanaSection = document.getElementById('medicalMarijuanaBufferSection');
    if (medicalMarijuanaSection) {
      if (medicalMarijuanaLayerRef && medicalMarijuanaLayerRef.visible) {
        medicalMarijuanaSection.classList.remove('hidden');
      } else {
        medicalMarijuanaSection.classList.add('hidden');
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

    // Schools buffer section
    const schoolsSection = document.getElementById('schoolsBufferSection');
    if (schoolsSection) {
      if (publicSchoolsLayerRef && publicSchoolsLayerRef.visible) {
        schoolsSection.classList.remove('hidden');
      } else {
        schoolsSection.classList.add('hidden');
      }
    }
  }



  // Legend update functionality
  function updateLegendVisibility() {
    const legendItems = {
      'retail-marijuana': retailMarijuanaLayerRef && retailMarijuanaLayerRef.visible,
      'medical-marijuana': medicalMarijuanaLayerRef && medicalMarijuanaLayerRef.visible,
      'vetted-areas': vettedAreasLayerRef && vettedAreasLayerRef.visible,
      'childcare-facilities': childcareFacilitiesLayerRef && childcareFacilitiesLayerRef.visible,
      'drug-treatment': drugTreatmentLayerRef && drugTreatmentLayerRef.visible,
      'public-schools': publicSchoolsLayerRef && publicSchoolsLayerRef.visible,
      'parcels': parcelsLayerRef && parcelsLayerRef.visible
    };

    // Update legend item visibility
    Object.keys(legendItems).forEach(key => {
      const legendElement = document.querySelector(`[data-legend="${key}"]`);
      if (legendElement) {
        legendElement.style.display = legendItems[key] ? 'flex' : 'none';
      }
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
    const { point, parcel, graphic, parcelNumber } = pinData;
    const pinId = graphic.attributes.pinId;
    
    // Create 1000ft buffer around the pin point
    const buffer = geometryEngine.geodesicBuffer(point, 1000, "feet");
    
    // Add buffer graphic to map
    suitabilityBuffersLayer.add(new Graphic({
      geometry: buffer,
      symbol: {
        type: "simple-fill",
        color: [0, 123, 255, 0.2], // Light blue for buffer
        outline: { color: [0, 123, 255, 0.8], width: 2 }
      }
    }));
    
    // Perform spatial queries
    const analysis = await analyzeProximity(buffer);
    
    return {
      pinId: pinId,
      parcelNumber: parcelNumber,
      analysis: analysis
    };
  }

  async function analyzeProximity(buffer) {
    const results = {
      nearRetailMarijuana: false,
      retailMarijuanaCount: 0,
      nearMedicalMarijuana: false,
      medicalMarijuanaCount: 0,
      nearChildcare: false,
      childcareCount: 0,
      nearDrugTreatment: false,
      drugTreatmentCount: 0,
      nearSchools: false,
      schoolsCount: 0
    };
    
    try {
      // Check proximity to retail marijuana stores
      if (retailMarijuanaLayerRef) {
        const retailQuery = retailMarijuanaLayerRef.createQuery();
        retailQuery.geometry = buffer;
        retailQuery.spatialRelationship = "intersects";
        const retailResult = await retailMarijuanaLayerRef.queryFeatures(retailQuery);
        results.nearRetailMarijuana = retailResult.features.length > 0;
        results.retailMarijuanaCount = retailResult.features.length;
      }
      
      // Check proximity to medical marijuana stores
      if (medicalMarijuanaLayerRef) {
        const medicalQuery = medicalMarijuanaLayerRef.createQuery();
        medicalQuery.geometry = buffer;
        medicalQuery.spatialRelationship = "intersects";
        const medicalResult = await medicalMarijuanaLayerRef.queryFeatures(medicalQuery);
        results.nearMedicalMarijuana = medicalResult.features.length > 0;
        results.medicalMarijuanaCount = medicalResult.features.length;
      }
      
      // Check proximity to childcare facilities
      if (childcareFacilitiesLayerRef) {
        const childcareQuery = childcareFacilitiesLayerRef.createQuery();
        childcareQuery.geometry = buffer;
        childcareQuery.spatialRelationship = "intersects";
        const childcareResult = await childcareFacilitiesLayerRef.queryFeatures(childcareQuery);
        results.nearChildcare = childcareResult.features.length > 0;
        results.childcareCount = childcareResult.features.length;
      }
      
      // Check proximity to drug treatment facilities
      if (drugTreatmentLayerRef) {
        const drugQuery = drugTreatmentLayerRef.createQuery();
        drugQuery.geometry = buffer;
        drugQuery.spatialRelationship = "intersects";
        const drugResult = await drugTreatmentLayerRef.queryFeatures(drugQuery);
        results.nearDrugTreatment = drugResult.features.length > 0;
        results.drugTreatmentCount = drugResult.features.length;
      }
      
      // Check proximity to schools
      if (publicSchoolsLayerRef) {
        const schoolQuery = publicSchoolsLayerRef.createQuery();
        schoolQuery.geometry = buffer;
        schoolQuery.spatialRelationship = "intersects";
        const schoolResult = await publicSchoolsLayerRef.queryFeatures(schoolQuery);
        results.nearSchools = schoolResult.features.length > 0;
        results.schoolsCount = schoolResult.features.length;
      }
      
    } catch (error) {
      console.error("Proximity analysis error:", error);
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
      const { pinId, parcelNumber, analysis } = result;
      
      // Determine if the location has issues (within 1000ft of any facility)
      const hasIssues = analysis.nearRetailMarijuana || 
                       analysis.nearMedicalMarijuana || 
                       analysis.nearChildcare ||
                       analysis.nearDrugTreatment ||
                       analysis.nearSchools;
      
      // Update the pin color based on analysis results
      updatePinColor(pinId, hasIssues);
      
      html += `<div class="analysis-section">`;
      html += `<h5>Pin ${pinId} Analysis ${hasIssues ? '❌' : '✅'}</h5>`;
      html += `<div style="margin-bottom: 8px; color: #666;"><strong>Parcel:</strong> ${parcelNumber}</div>`;
      
      html += `<div style="margin-bottom: 8px;"><strong>Within 1000ft Buffer:</strong></div>`;
      
      html += `<div class="analysis-item ${analysis.nearRetailMarijuana ? 'fail' : 'pass'}">`;
      html += `${analysis.nearRetailMarijuana ? '❌' : '✅'} ${analysis.nearRetailMarijuana ? `Near ${analysis.retailMarijuanaCount} retail marijuana store(s)` : 'No retail marijuana stores nearby'}`;
      html += `</div>`;
      
      html += `<div class="analysis-item ${analysis.nearMedicalMarijuana ? 'fail' : 'pass'}">`;
      html += `${analysis.nearMedicalMarijuana ? '❌' : '✅'} ${analysis.nearMedicalMarijuana ? `Near ${analysis.medicalMarijuanaCount} medical marijuana store(s)` : 'No medical marijuana stores nearby'}`;
      html += `</div>`;
      
      html += `<div class="analysis-item ${analysis.nearChildcare ? 'fail' : 'pass'}">`;
      html += `${analysis.nearChildcare ? '❌' : '✅'} ${analysis.nearChildcare ? `Near ${analysis.childcareCount} childcare facility(ies)` : 'No childcare facilities nearby'}`;
      html += `</div>`;
      
      html += `<div class="analysis-item ${analysis.nearDrugTreatment ? 'fail' : 'pass'}">`;
      html += `${analysis.nearDrugTreatment ? '❌' : '✅'} ${analysis.nearDrugTreatment ? `Near ${analysis.drugTreatmentCount} drug & alcohol treatment facility(ies)` : 'No drug treatment facilities nearby'}`;
      html += `</div>`;
      
      html += `<div class="analysis-item ${analysis.nearSchools ? 'fail' : 'pass'}">`;
      html += `${analysis.nearSchools ? '❌' : '✅'} ${analysis.nearSchools ? `Near ${analysis.schoolsCount} school(s)` : 'No schools nearby'}`;
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