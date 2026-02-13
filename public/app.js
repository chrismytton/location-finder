import { toDMS, headingDirection, relativeTime, toGeoJSON, toWKT } from './geo.js'

// --- Constants ---
const MS_TO_MPH = 2.237
const MS_TO_KPH = 3.6
const MAP_ZOOM = 17
const SPEED_UNITS = ['mph', 'km/h', 'm/s']

const $ = (id) => document.getElementById(id)

// --- State ---
const state = {
  position: null,
  error: null,
  locating: false,
  watchID: null,
  now: Date.now(),
  speedUnit: localStorage.getItem('speedUnit') || 'mph',
  map: null,
  marker: null,
}

// --- Formatting helpers ---
function formatCoords(coords) {
  return {
    lat: coords.latitude.toFixed(4),
    lng: coords.longitude.toFixed(4),
  }
}

function formatAltitude(coords) {
  if (coords.altitude == null) return null
  // Desktops often report altitude as 0 with no accuracy — ignore this
  if (coords.altitude === 0 && coords.altitudeAccuracy == null) return null
  return {
    value: coords.altitude.toFixed(2),
    accuracy: coords.altitudeAccuracy != null ? coords.altitudeAccuracy.toFixed(2) : null,
  }
}

function formatSpeed(speed, unit) {
  if (!speed) return { value: '0', label: unit }
  switch (unit) {
    case 'km/h': return { value: (speed * MS_TO_KPH).toFixed(1), label: 'km/h' }
    case 'm/s': return { value: speed.toFixed(1), label: 'm/s' }
    default: return { value: (speed * MS_TO_MPH).toFixed(1), label: 'mph' }
  }
}

// --- Map ---
function loadLeaflet() {
  if (state.leafletLoaded) return state.leafletLoaded
  state.leafletLoaded = new Promise((resolve) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'leaflet@1.9.4/leaflet.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'leaflet@1.9.4/leaflet.js'
    script.onload = resolve
    document.head.appendChild(script)
  })
  return state.leafletLoaded
}

function initMap(lat, lng) {
  if (state.map) return
  state.map = L.map('map', {
    zoomControl: false,
    attributionControl: false,
  }).setView([lat, lng], MAP_ZOOM)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(state.map)
  state.marker = L.marker([lat, lng]).addTo(state.map)
}

function updateMap(lat, lng) {
  if (!state.mapVisible) return
  if (!state.map) {
    initMap(lat, lng)
    return
  }
  state.marker.setLatLng([lat, lng])
  state.map.setView([lat, lng])
}

async function showMap() {
  state.mapVisible = true
  $('btn-show-map').classList.add('hidden')
  $('map').classList.remove('hidden')
  await loadLeaflet()
  if (state.position) {
    const { latitude, longitude } = state.position.coords
    initMap(latitude, longitude)
  }
}

// --- Render ---
function renderViews() {
  const { position, error, locating } = state

  $('view-position').classList.toggle('hidden', !position)
  $('view-locating').classList.toggle('hidden', !locating || !!position)
  $('view-error').classList.toggle('hidden', !error || locating || !!position)
  $('view-start').classList.toggle('hidden', locating || !!position || !!error)

  if (error && !position) {
    $('error-message').textContent = `ERROR(${error.code}): ${error.message}`
  }
}

function renderPosition() {
  const coords = state.position?.coords
  if (!coords) return

  const { lat, lng } = formatCoords(coords)
  const alt = formatAltitude(coords)
  const speed = formatSpeed(coords.speed, state.speedUnit)
  const heading = coords.heading
  const accuracy = coords.accuracy != null ? coords.accuracy.toFixed(2) : null

  // Coordinates
  $('coords-value').textContent = `${lat}, ${lng}`
  $('coords-dms').textContent = `${toDMS(coords.latitude, true)}  ${toDMS(coords.longitude, false)}`
  $('coords-accuracy').textContent = accuracy ? `\u00B1 ${accuracy} m` : ''

  // Speed
  $('speed-value').textContent = `${speed.value} ${speed.label}`

  // Heading — hide card entirely when null
  const hasHeading = heading != null
  $('card-heading').classList.toggle('hidden', !hasHeading)
  if (hasHeading) {
    $('heading-value').textContent = headingDirection(heading)
    $('heading-deg').textContent = `${heading.toFixed(2)}\u00B0`
  }

  // Altitude
  $('card-altitude').classList.toggle('hidden', !alt)
  if (alt) {
    $('alt-value').textContent = `${alt.value} m`
    $('alt-accuracy').textContent = alt.accuracy ? `\u00B1 ${alt.accuracy} m` : ''
  }

  // Map links
  $('link-google').href = `https://www.google.co.uk/maps/@${lat},${lng},${MAP_ZOOM}z`
  $('link-osm').href = `https://www.openstreetmap.org/#map=${MAP_ZOOM}/${lat}/${lng}`
  $('link-geohack').href = `https://geohack.toolforge.org/geohack.php?params=${lat};${lng}_type:landmark`

  // Developer data
  $('geojson-pre').textContent = JSON.stringify(toGeoJSON(lat, lng), null, 2)
  $('wkt-pre').textContent = toWKT(lat, lng, alt?.value ?? null)

  // Last updated
  $('updated-value').textContent = relativeTime(state.position.timestamp, state.now)
  $('updated-value').title = new Date(state.position.timestamp).toString()

  // Map
  updateMap(coords.latitude, coords.longitude)
}

function render() {
  renderViews()
  renderPosition()
}

// --- Toast ---
function showToast(message, type = 'success') {
  const toast = document.createElement('div')
  toast.className = `toast toast--${type}`
  toast.textContent = message
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 2000)
}

// --- Clipboard ---
function copyToClipboard(value) {
  if (!navigator.clipboard) {
    showToast('Copy not supported', 'error')
    return
  }
  if (value == null || value === '' || value === '\u00A0') {
    showToast('Nothing to copy', 'error')
    return
  }
  navigator.clipboard.writeText(value)
  showToast('Copied to clipboard')
}

// --- Click handlers ---
function bindClicks() {
  // Coordinates — click to copy
  $('card-coords').addEventListener('click', () => {
    if (!state.position) return
    const { lat, lng } = formatCoords(state.position.coords)
    copyToClipboard(`${lat}, ${lng}`)
  })

  // Speed — click to cycle units
  $('card-speed').addEventListener('click', () => {
    const idx = SPEED_UNITS.indexOf(state.speedUnit)
    state.speedUnit = SPEED_UNITS[(idx + 1) % SPEED_UNITS.length]
    localStorage.setItem('speedUnit', state.speedUnit)
    renderPosition()
  })

  // Map — show on demand
  $('btn-show-map').addEventListener('click', showMap)

  // Dev section copy buttons
  $('btn-copy-geojson').addEventListener('click', (e) => {
    e.stopPropagation()
    copyToClipboard($('geojson-pre').textContent)
  })
  $('btn-copy-wkt').addEventListener('click', (e) => {
    e.stopPropagation()
    copyToClipboard($('wkt-pre').textContent)
  })
}

// --- Geolocation ---
function startTracking() {
  state.locating = true
  state.error = null
  render()
  localStorage.setItem('locationAllowed', 'true')
  if (state.watchID != null) {
    navigator.geolocation.clearWatch(state.watchID)
  }
  state.watchID = navigator.geolocation.watchPosition(
    (position) => {
      state.position = position
      state.locating = false
      render()
    },
    (err) => {
      state.error = err
      state.locating = false
      render()
    },
    { enableHighAccuracy: true }
  )
}

// --- Init ---
function init() {
  bindClicks()
  $('btn-start').addEventListener('click', startTracking)

  setInterval(() => {
    state.now = Date.now()
    if (state.position) render()
  }, 1000)

  if (localStorage.getItem('locationAllowed') === 'true') {
    startTracking()
  }
}

init()
