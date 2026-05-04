// Colorado Medical & Retail Dispensary Map JavaScript

// Wait for DOM to be ready before initializing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMap);
} else {
  initMap();
}

function initMap() {
  require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/GraphicsLayer",
    "esri/Graphic",
    "esri/geometry/Point",
    "esri/rest/locator"
  ], function(EsriMap, MapView, GraphicsLayer, Graphic, Point, locator) {

    let map, view;
  
  // Google Sheets URLs (convert to CSV format)
  const MEDICAL_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSIpVOLCxvyerQVD0iz_07eg1ZS09HtI8E9BdDrC3pyaLFCrqQxsPEJIL5XPfEmWHYpwf1her74mdkp/pub?gid=0&single=true&output=csv";
  const RETAIL_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSIpVOLCxvyerQVD0iz_07eg1ZS09HtI8E9BdDrC3pyaLFCrqQxsPEJIL5XPfEmWHYpwf1her74mdkp/pub?gid=1684251998&single=true&output=csv";

  // Initialize map
  map = new EsriMap({ basemap: "streets-navigation-vector" });
  view = new MapView({ 
    container: "viewDiv", 
    map: map, 
    center: [-105.761894, 39.040364], // Colorado
    zoom: 6
  });

  // Create graphics layers
  const medicalLayer = new GraphicsLayer({ 
    title: "Medical", 
    visible: true 
  });
  const retailLayer = new GraphicsLayer({ 
    title: "Retail", 
    visible: true 
  });
  const retailMedicalLayer = new GraphicsLayer({ 
    title: "Retail & Medical", 
    visible: false 
  });

  map.addMany([medicalLayer, retailLayer, retailMedicalLayer]);

  // Create highlight layer for address search
  const highlightGraphicsLayer = new GraphicsLayer({ 
    title: "Search Highlights"
  });
  map.add(highlightGraphicsLayer);

  // Search variables
  let currentSuggestions = [];
  let selectedSuggestionIndex = -1;
  let suggestionTimeout = null;
  const locatorUrl = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer";

  // Store original graphics and data
  let medicalData = [];
  let retailData = [];
  let medicalGraphics = [];
  let retailGraphics = [];
  let matchedGraphics = [];

  // Symbol definitions
  const medicalSymbol = {
    type: "picture-marker",
    url: "Medical_leaf.png",
    width: "36px",
    height: "36px"
  };

  const retailSymbol = {
    type: "picture-marker",
    url: "Retail_leaf.png",
    width: "36px",
    height: "36px"
  };

  const mergedSymbol = {
    type: "picture-marker",
    url: "ReMed.png",
    width: "36px",
    height: "36px"
  };

  // Create popup template function
  function createPopupTemplate(data, isMerged = false) {
    if (isMerged) {
      // For merged locations, show both medical and retail data
      const medicalFieldInfos = [
        { fieldName: "medical_License Number", label: "Medical License Number" },
        { fieldName: "medical_DBA", label: "Medical DBA" },
        { fieldName: "medical_Street", label: "Medical Street" },
        { fieldName: "medical_City", label: "Medical City" },
        { fieldName: "medical_Zip Code", label: "Medical Zip Code" },
        { fieldName: "medical_Date Updated", label: "Medical Date Updated" }
      ];
      
      const retailFieldInfos = [
        { fieldName: "retail_License Number", label: "Retail License Number" },
        { fieldName: "retail_DBA", label: "Retail DBA" },
        { fieldName: "retail_Street", label: "Retail Street" },
        { fieldName: "retail_City", label: "Retail City" },
        { fieldName: "retail_Zip Code", label: "Retail Zip Code" },
        { fieldName: "retail_Date Updated", label: "Retail Date Updated" }
      ];

      const facilityName = data.medical["Facility Name"] || data.medical.DBA || "Combined Medical & Retail Location";

      return {
        title: facilityName,
        content: [{
          type: "fields",
          fieldInfos: medicalFieldInfos.concat(retailFieldInfos)
        }]
      };
    } else {
      // For single location, show specific fields
      const fieldInfos = [
        { fieldName: "License Number", label: "License Number" },
        { fieldName: "DBA", label: "DBA" },
        { fieldName: "Street", label: "Street" },
        { fieldName: "City", label: "City" },
        { fieldName: "Zip Code", label: "Zip Code" },
        { fieldName: "Date Updated", label: "Date Updated" }
      ];

      const facilityName = data["Facility Name"] || data.DBA || data.Street || "Dispensary";

      return {
        title: facilityName,
        content: [{
          type: "fields",
          fieldInfos: fieldInfos
        }]
      };
    }
  }

  // Function to normalize address for matching
  function normalizeAddress(street, city, zip) {
    const normalizeStr = (str) => (str || "").toString().trim().toUpperCase();
    return {
      street: normalizeStr(street),
      city: normalizeStr(city),
      zip: normalizeStr(zip)
    };
  }

  // Function to create a graphic from data
  function createGraphic(data, symbol, layer) {
    const lat = parseFloat(data.Latitude);
    const lon = parseFloat(data.Longitude);

    if (isNaN(lat) || isNaN(lon)) {
      return null;
    }

    const point = new Point({
      longitude: lon,
      latitude: lat
    });

    const graphic = new Graphic({
      geometry: point,
      symbol: symbol,
      attributes: data,
      popupTemplate: createPopupTemplate(data)
    });

    return graphic;
  }

  // Function to find matches between medical and retail
  function findMatches() {
    const matches = [];
    const matchedMedicalIndices = new Set();
    const matchedRetailIndices = new Set();

    medicalData.forEach((medRecord, medIndex) => {
      // Get zip code field (could be "Zip Code", "ZIP Code", or "Zip")
      const medZip = medRecord["Zip Code"] || medRecord["ZIP Code"] || medRecord.Zip;
      const medAddr = normalizeAddress(
        medRecord.Street,
        medRecord.City,
        medZip
      );

      retailData.forEach((retRecord, retIndex) => {
        // Get zip code field (could be "Zip Code", "ZIP Code", or "Zip")
        const retZip = retRecord["Zip Code"] || retRecord["ZIP Code"] || retRecord.Zip;
        const retAddr = normalizeAddress(
          retRecord.Street,
          retRecord.City,
          retZip
        );

        // Check if all three fields match and are not empty
        if (medAddr.street === retAddr.street &&
            medAddr.city === retAddr.city &&
            medAddr.zip === retAddr.zip &&
            medAddr.street !== "" &&
            medAddr.city !== "" &&
            medAddr.zip !== "") {
          
          matches.push({
            medical: medRecord,
            retail: retRecord,
            medicalIndex: medIndex,
            retailIndex: retIndex
          });
          
          matchedMedicalIndices.add(medIndex);
          matchedRetailIndices.add(retIndex);
        }
      });
    });

    return { matches, matchedMedicalIndices, matchedRetailIndices };
  }

  // Function to toggle Retail & Medical layer
  function toggleRetailMedicalLayer(show) {
    if (!show) {
      // Turn off - show all original markers
      retailMedicalLayer.removeAll();
      medicalGraphics.forEach(g => g.visible = true);
      retailGraphics.forEach(g => g.visible = true);
    } else {
      // Turn on - find matches and hide originals
      const { matches, matchedMedicalIndices, matchedRetailIndices } = findMatches();
      
      // Hide matched markers from medical and retail layers
      medicalGraphics.forEach((graphic, index) => {
        graphic.visible = !matchedMedicalIndices.has(index);
      });
      
      retailGraphics.forEach((graphic, index) => {
        graphic.visible = !matchedRetailIndices.has(index);
      });

      // Create purple markers for matches
      retailMedicalLayer.removeAll();
      matchedGraphics = [];

      matches.forEach(match => {
        // Use coordinates from medical record
        const lat = parseFloat(match.medical.Latitude);
        const lon = parseFloat(match.medical.Longitude);

        if (!isNaN(lat) && !isNaN(lon)) {
          const point = new Point({
            longitude: lon,
            latitude: lat
          });

          // Combine attributes with prefixes
          const combinedAttrs = {};
          Object.keys(match.medical).forEach(key => {
            combinedAttrs["medical_" + key] = match.medical[key];
          });
          Object.keys(match.retail).forEach(key => {
            combinedAttrs["retail_" + key] = match.retail[key];
          });

          const graphic = new Graphic({
            geometry: point,
            symbol: mergedSymbol,
            attributes: combinedAttrs,
            popupTemplate: createPopupTemplate(match, true)
          });

          matchedGraphics.push(graphic);
          retailMedicalLayer.add(graphic);
        }
      });

      console.log(`Found ${matches.length} matching locations`);
    }
  }

  // Show loading indicator
  const loadingIndicator = document.getElementById("loadingIndicator");
  if (loadingIndicator) {
    loadingIndicator.style.display = "block";
  }

  // Load data from Google Sheets
  Promise.all([
    new Promise((resolve, reject) => {
      Papa.parse(MEDICAL_SHEET_URL, {
        download: true,
        header: true,
        complete: (results) => resolve(results.data),
        error: (error) => reject(error)
      });
    }),
    new Promise((resolve, reject) => {
      Papa.parse(RETAIL_SHEET_URL, {
        download: true,
        header: true,
        complete: (results) => resolve(results.data),
        error: (error) => reject(error)
      });
    })
  ]).then(([medicalResults, retailResults]) => {
    // Store data (filter out rows without coordinates)
    medicalData = medicalResults.filter(row => row.Latitude && row.Longitude);
    retailData = retailResults.filter(row => row.Latitude && row.Longitude);

    console.log(`Loaded ${medicalData.length} medical records`);
    console.log(`Loaded ${retailData.length} retail records`);

    // Create medical graphics
    medicalData.forEach(record => {
      const graphic = createGraphic(record, medicalSymbol, medicalLayer);
      if (graphic) {
        medicalGraphics.push(graphic);
        medicalLayer.add(graphic);
      }
    });

    // Create retail graphics
    retailData.forEach(record => {
      const graphic = createGraphic(record, retailSymbol, retailLayer);
      if (graphic) {
        retailGraphics.push(graphic);
        retailLayer.add(graphic);
      }
    });

    // Hide loading indicator
    if (loadingIndicator) {
      loadingIndicator.style.display = "none";
    }

    console.log(`Created ${medicalGraphics.length} medical markers`);
    console.log(`Created ${retailGraphics.length} retail markers`);

  }).catch(error => {
    console.error("Error loading data:", error);
    if (loadingIndicator) {
      loadingIndicator.innerHTML = "Error loading data. Please check console.";
      loadingIndicator.style.color = "#dc3545";
    }
  });

  // ===============================================
  // UI EVENT HANDLERS
  // ===============================================

  // Layer checkbox event handlers
  document.getElementById("chkMedical").addEventListener("change", function(e) {
    medicalLayer.visible = e.target.checked;
    updateLegendVisibility();
  });

  document.getElementById("chkRetail").addEventListener("change", function(e) {
    retailLayer.visible = e.target.checked;
    updateLegendVisibility();
  });

  document.getElementById("chkRetailMedical").addEventListener("change", function(e) {
    retailMedicalLayer.visible = e.target.checked;
    toggleRetailMedicalLayer(e.target.checked);
    updateLegendVisibility();
  });

  // Clear All button
  document.getElementById("clearAllLayers").addEventListener("click", function() {
    document.getElementById("chkMedical").checked = false;
    document.getElementById("chkRetail").checked = false;
    document.getElementById("chkRetailMedical").checked = false;
    
    medicalLayer.visible = false;
    retailLayer.visible = false;
    retailMedicalLayer.visible = false;
    
    // Reset visibility when clearing
    toggleRetailMedicalLayer(false);
    updateLegendVisibility();
  });

  // Layers dropdown toggle
  const layersBtn = document.getElementById("layersBtn");
  const layersDropdown = document.getElementById("layersDropdown");
  
  if (layersBtn && layersDropdown) {
    layersBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      const isOpen = layersDropdown.style.display === "block";
      closeAllDropdowns();
      if (!isOpen) {
        layersDropdown.style.display = "block";
      }
    });
    
    // Prevent dropdown from closing when clicking inside it
    layersDropdown.addEventListener("click", function(e) {
      e.stopPropagation();
    });
  }

  // Legend button toggle
  const legendBtn = document.getElementById("legendBtn");
  const mapLegend = document.getElementById("mapLegend");
  const panelsContainer = document.getElementById("panelsContainer");
  const closePanels = document.getElementById("closePanels");
  
  if (legendBtn && mapLegend && panelsContainer) {
    legendBtn.addEventListener("click", function() {
      closeAllDropdowns();
      const isVisible = panelsContainer.style.display === "flex";
      
      if (isVisible && mapLegend.style.display === "block") {
        panelsContainer.style.display = "none";
      } else {
        // Hide all panels first
        document.querySelectorAll("#panelsContainer > div").forEach(panel => {
          panel.style.display = "none";
        });
        
        // Show legend
        mapLegend.style.display = "block";
        panelsContainer.style.display = "flex";
        updateCloseButtonVisibility();
      }
      
      updateLegendVisibility();
    });
  }

  // Close panels button
  if (closePanels) {
    closePanels.addEventListener("click", function() {
      if (panelsContainer) {
        panelsContainer.style.display = "none";
      }
      updateCloseButtonVisibility();
    });
  }

  // Close dropdowns when clicking outside
  document.addEventListener("click", function() {
    closeAllDropdowns();
  });

  // Function to close all dropdowns
  function closeAllDropdowns() {
    if (layersDropdown) {
      layersDropdown.style.display = "none";
    }
  }

  // Function to update legend visibility based on active layers
  function updateLegendVisibility() {
    const legendItems = document.querySelectorAll(".legend-item");
    
    legendItems.forEach(item => {
      const legendType = item.getAttribute("data-legend");
      let isVisible = false;
      
      if (legendType === "medical" && medicalLayer.visible) {
        isVisible = true;
      } else if (legendType === "retail" && retailLayer.visible) {
        isVisible = true;
      } else if (legendType === "retail-medical" && retailMedicalLayer.visible) {
        isVisible = true;
      }
      
      item.style.display = isVisible ? "flex" : "none";
    });
  }

  // Function to update close button visibility
  function updateCloseButtonVisibility() {
    if (closePanels && panelsContainer) {
      closePanels.style.display = (panelsContainer.style.display === "flex") ? "block" : "none";
    }
  }

  // ===============================================
  // ADDRESS SEARCH FUNCTIONALITY
  // ===============================================
  
  const searchBox = document.getElementById("searchBox");
  const addressSuggestions = document.getElementById("addressSuggestions");

  if (searchBox && addressSuggestions) {
    // Address search input handler
    searchBox.addEventListener("input", function(e) {
      const query = e.target.value.trim();
      
      // Clear previous timeout
      if (suggestionTimeout) {
        clearTimeout(suggestionTimeout);
      }
      
      if (query.length >= 3) {
        // Debounce the suggestions
        suggestionTimeout = setTimeout(() => {
          getSuggestions(query);
        }, 300);
      } else {
        hideSuggestions();
      }
    });

    // Keyboard navigation for search
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
  }

  function getSuggestions(query) {
    const params = {
      address: {
        address: query
      },
      location: view.center,
      maxLocations: 8,
      searchExtent: view.extent,
      outFields: ["*"]
    };
    
    locator.addressToLocations(locatorUrl, params).then(results => {
      const suggestions = results
        .filter(result => {
          // Filter for Colorado area results
          const address = result.address || "";
          return address.toLowerCase().includes("colorado") || address.toLowerCase().includes("co");
        })
        .map(result => result.address)
        .slice(0, 8);
      
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

  function flashAddressPoint(geometry) {
    // Clear any existing highlights
    highlightGraphicsLayer.removeAll();
    
    // Create flashing circle graphic
    const flashGraphic = new Graphic({
      geometry: geometry,
      symbol: {
        type: "simple-marker",
        style: "circle",
        color: [255, 0, 0, 0.8],
        size: "20px",
        outline: {
          color: [255, 255, 255, 1],
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
    
    const params = {
      address: {
        address: query
      },
      location: view.center,
      maxLocations: 1,
      outFields: ["*"]
    };
    
    locator.addressToLocations(locatorUrl, params).then(results => {
      if (results.length > 0) {
        const result = results[0];
        
        // Zoom to the address
        view.goTo({
          center: result.location,
          zoom: 18
        }).then(() => {
          // Flash the location
          flashAddressPoint(result.location);
          // Clear the search box
          searchBox.value = "";
        });
      } else {
        console.log(`No results found for "${query}"`);
      }
    }).catch(error => {
      console.error("Search error:", error);
    });
  }

  // Initialize legend visibility
  updateLegendVisibility();

  // Wait for view to load
  view.when(function() {
    console.log("Map view loaded successfully");
  });

  }); // End of require

} // End of initMap
