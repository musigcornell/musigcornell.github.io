/* Mu Sigma Lambda Cornell: national chapter map
   Opens from any element with [data-map-open]. Leaflet is loaded on first open. */
(function(){
  var NATL = "https://www.musigmalambda.org/chapters/";

  var REGIONS = [
    { id:"ne", name:"Northeast", color:"#2F6DB5" },
    { id:"se", name:"Southeast", color:"#B31B1B" },
    { id:"mw", name:"Midwest",   color:"#E0A526" },
    { id:"sw", name:"Southwest", color:"#D2691E" },
    { id:"w",  name:"West",      color:"#6B3FA0" }
  ];

  /* [name, city, region, slug, lat, lng] */
  var CHAPTERS = [
    ["Cornell",   "Ithaca, New York",            "ne", "cornell",    42.4534,  -76.4735],
    ["Rider",     "Lawrenceville, New Jersey",   "ne", "rider",      40.2809,  -74.7424],
    ["Syracuse",  "Syracuse, New York",          "ne", "syracuse",   43.0392,  -76.1351],
    ["UConn",     "Storrs, Connecticut",         "ne", "uconn",      41.8077,  -72.2540],

    ["LSU",       "Baton Rouge, Louisiana",      "se", "lsu",        30.4133,  -91.1800],
    ["Arkansas",  "Fayetteville, Arkansas",      "se", "arkansas",   36.0687,  -94.1748],
    ["UCF",       "Orlando, Florida",            "se", "ucf",        28.6024,  -81.2001],
    ["UF",        "Gainesville, Florida",        "se", "uf",         29.6436,  -82.3549],
    ["Miami",     "Coral Gables, Florida",       "se", "miami",      25.7215,  -80.2793],
    ["Ole Miss",  "Oxford, Mississippi",         "se", "ole-miss",   34.3650,  -89.5380],
    ["UNC",       "Chapel Hill, North Carolina", "se", "unc",        35.9049,  -79.0469],
    ["Tennessee", "Knoxville, Tennessee",        "se", "tennessee",  35.9544,  -83.9295],
    ["UVA",       "Charlottesville, Virginia",   "se", "uva",        38.0336,  -78.5080],
    ["WVU",       "Morgantown, West Virginia",   "se", "wvu",        39.6480,  -79.9559],

    ["GVSU",      "Allendale, Michigan",         "mw", "gvsu",       42.9634,  -85.8889],
    ["Indiana",   "Bloomington, Indiana",        "mw", "indiana",    39.1682,  -86.5230],
    ["Miami OH",  "Oxford, Ohio",                "mw", "miami-oh",   39.5070,  -84.7452],
    ["OSU",       "Columbus, Ohio",              "mw", "osu",        40.0067,  -83.0305],
    ["Cincinnati","Cincinnati, Ohio",            "mw", "cincinnati", 39.1329,  -84.5150],
    ["UIUC",      "Champaign, Illinois",         "mw", "uiuc",       40.1020,  -88.2272],
    ["Iowa",      "Iowa City, Iowa",             "mw", "iowa",       41.6627,  -91.5549],
    ["Michigan",  "Ann Arbor, Michigan",         "mw", "michigan",   42.2780,  -83.7382],

    ["Texas",     "Austin, Texas",               "sw", "texas",      30.2849,  -97.7341],

    ["CU-Denver", "Denver, Colorado",            "w",  "cu-denver",  39.7453, -105.0034]
  ].map(function(c){
    return { name:c[0], city:c[1], region:c[2], slug:c[3], lat:c[4], lng:c[5], home:c[3] === "cornell" };
  });

  var LEAFLET_JS  = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
  var LEAFLET_CSS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";

  function region(id){ for (var i=0;i<REGIONS.length;i++) if (REGIONS[i].id===id) return REGIONS[i]; }
  function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];}); }

  /* ---------- modal markup ---------- */
  var modal = document.createElement("div");
  modal.className = "modal map-modal";
  modal.id = "mapModal";
  modal.hidden = true;
  modal.innerHTML =
    '<div class="modal-back" data-map-close></div>' +
    '<div class="modal-card map-card" role="dialog" aria-modal="true" aria-labelledby="mapModalTitle">' +
      '<button class="modal-x" type="button" data-map-close aria-label="Close">&times;</button>' +
      '<div class="map-head">' +
        '<p class="eyebrow">National network</p>' +
        '<h2 id="mapModalTitle">' + CHAPTERS.length + ' active chapters</h2>' +
        '<p class="sub">Click a marker or a school to see that chapter. Filter by region below.</p>' +
      '</div>' +
      '<div class="map-filters" role="group" aria-label="Filter by region">' +
        '<button class="map-chip" type="button" data-region="all" aria-pressed="true">All regions</button>' +
        REGIONS.map(function(r){
          var n = CHAPTERS.filter(function(c){return c.region===r.id;}).length;
          return '<button class="map-chip" type="button" data-region="'+r.id+'" aria-pressed="false">' +
                   '<i style="background:'+r.color+'"></i>'+r.name+' <span>'+n+'</span></button>';
        }).join("") +
      '</div>' +
      '<div class="map-body">' +
        '<div class="map-canvas" id="chapterMap" role="region" aria-label="Map of Mu Sigma Lambda chapters">' +
          '<p class="map-loading">Loading map&hellip;</p>' +
        '</div>' +
        '<div class="map-list" id="chapterList"></div>' +
      '</div>' +
      '<p class="map-foot">Chapter list from <a href="https://www.musigmalambda.org/" target="_blank" rel="noopener noreferrer">Mu Sigma Lambda Nationals &nearr;</a></p>' +
    '</div>';
  document.body.appendChild(modal);

  var listEl = modal.querySelector("#chapterList");
  var activeRegion = "all";
  var map = null, markers = {}, lastFocus = null, loading = null;

  /* ---------- side list ---------- */
  function renderList(){
    listEl.innerHTML = REGIONS.filter(function(r){ return activeRegion==="all" || activeRegion===r.id; })
      .map(function(r){
        var items = CHAPTERS.filter(function(c){ return c.region===r.id; });
        return '<div class="map-group">' +
          '<p class="map-group-h"><i style="background:'+r.color+'"></i>'+r.name+'<span>'+items.length+'</span></p>' +
          '<ul>' + items.map(function(c){
            return '<li><button type="button" class="map-item'+(c.home?' is-home':'')+'" data-slug="'+c.slug+'">' +
                     '<b>'+esc(c.name)+(c.home?' <em>Our chapter</em>':'')+'</b><span>'+esc(c.city)+'</span></button></li>';
          }).join("") + '</ul></div>';
      }).join("");
  }

  function popupHtml(c){
    var r = region(c.region);
    return '<div class="map-pop">' +
      '<p class="map-pop-r" style="color:'+r.color+'">'+r.name+' Region</p>' +
      '<b>'+esc(c.name)+'</b>' +
      '<span>'+esc(c.city)+'</span>' +
      (c.home ? '<span class="map-pop-home">Alpha Delta &middot; Cornell Chapter</span>' : '') +
      '<a href="'+NATL+c.slug+'" target="_blank" rel="noopener noreferrer">Chapter page &nearr;</a>' +
    '</div>';
  }

  /* ---------- Leaflet ---------- */
  function loadLeaflet(){
    if (window.L) return Promise.resolve();
    if (loading) return loading;
    loading = new Promise(function(res, rej){
      var css = document.createElement("link");
      css.rel = "stylesheet"; css.href = LEAFLET_CSS;
      document.head.appendChild(css);
      var s = document.createElement("script");
      s.src = LEAFLET_JS; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
    return loading;
  }

  function buildMap(){
    var el = document.getElementById("chapterMap");
    el.innerHTML = "";
    map = L.map(el, { scrollWheelZoom:false, zoomSnap:0.25, minZoom:3, maxZoom:10 });
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
      maxZoom:16,
      attribution:'Tiles &copy; Esri, Esri, HERE, Garmin, &copy; OpenStreetMap contributors'
    }).addTo(map);

    /* draw Cornell last so it sits on top */
    CHAPTERS.slice().sort(function(a,b){ return a.home - b.home; }).forEach(function(c){
      var r = region(c.region);
      var m = L.circleMarker([c.lat, c.lng], {
        radius: c.home ? 10 : 7,
        color: c.home ? "#E9B44C" : "#fff",
        weight: c.home ? 3 : 2,
        fillColor: r.color,
        fillOpacity: .95
      }).addTo(map);
      m.bindPopup(popupHtml(c), { closeButton:false, offset:[0,-4] });
      m.bindTooltip(c.name, { direction:"top", offset:[0,-8] });
      markers[c.slug] = m;
    });
    applyFilter(activeRegion);
  }

  function fitTo(rid){
    if (!map) return;
    var pts = CHAPTERS.filter(function(c){ return rid==="all" || c.region===rid; })
                      .map(function(c){ return [c.lat, c.lng]; });
    if (pts.length === 1) map.setView(pts[0], 7);
    else map.fitBounds(pts, { padding:[36,36], maxZoom:7 });
  }

  function applyFilter(rid){
    activeRegion = rid;
    modal.querySelectorAll(".map-chip").forEach(function(b){
      b.setAttribute("aria-pressed", b.dataset.region===rid ? "true" : "false");
    });
    CHAPTERS.forEach(function(c){
      var m = markers[c.slug]; if (!m) return;
      var on = rid==="all" || c.region===rid;
      if (on && !map.hasLayer(m)) m.addTo(map);
      if (!on && map.hasLayer(m)) map.removeLayer(m);
    });
    if (map) map.closePopup();
    renderList();
    fitTo(rid);
  }

  function focusChapter(slug){
    var m = markers[slug]; if (!m || !map) return;
    map.flyTo(m.getLatLng(), Math.max(map.getZoom(), 6), { duration:.6 });
    map.once("moveend", function(){ m.openPopup(); });
    listEl.querySelectorAll(".map-item").forEach(function(b){
      b.classList.toggle("is-active", b.dataset.slug===slug);
    });
  }

  /* ---------- open / close ---------- */
  function open(){
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modal.querySelector(".modal-x").focus();
    loadLeaflet().then(function(){
      if (!map) buildMap();
      else { map.invalidateSize(); fitTo(activeRegion); }
    }).catch(function(){
      document.getElementById("chapterMap").innerHTML =
        '<p class="map-loading">The map could not load. The full chapter list is alongside.</p>';
    });
  }
  function close(){
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  renderList();
  document.querySelectorAll("[data-map-open]").forEach(function(b){ b.addEventListener("click", open); });
  modal.addEventListener("click", function(e){
    if (e.target.closest("[data-map-close]")) return close();
    var chip = e.target.closest(".map-chip");
    if (chip) return applyFilter(chip.dataset.region);
    var item = e.target.closest(".map-item");
    if (item) return focusChapter(item.dataset.slug);
  });
  document.addEventListener("keydown", function(e){ if (e.key === "Escape" && !modal.hidden) close(); });
})();
