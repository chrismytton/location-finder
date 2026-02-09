import { toDMS, headingDirection, relativeTime, toGeoJSON, toWKT } from './geo.js'

// --- Constants ---
const MS_TO_MPH = 2.237
const MS_TO_KPH = 3.6
const MAP_ZOOM = 17

const $ = (id) => document.getElementById(id)

// --- State ---
const state = {
  position: null,
  error: null,
  locating: false,
  watchID: null,
  now: Date.now(),
}

// --- Formatting helpers ---
// Single source of truth for how values are displayed and copied.
function formatCoords(coords) {
  return {
    lat: coords.latitude.toFixed(4),
    lng: coords.longitude.toFixed(4),
  }
}

function formatAltitude(coords) {
  if (coords.altitude == null) return null
  return {
    value: coords.altitude.toFixed(2),
    accuracy: coords.altitudeAccuracy != null ? coords.altitudeAccuracy.toFixed(2) : null,
  }
}

function formatSpeed(speed) {
  return {
    mph: speed ? (speed * MS_TO_MPH).toFixed(1) : '0',
    kph: speed ? (speed * MS_TO_KPH).toFixed(1) : '0',
    ms: speed ? speed.toFixed(1) : '0',
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
  const speed = formatSpeed(coords.speed)
  const heading = coords.heading
  const accuracy = coords.accuracy != null ? coords.accuracy.toFixed(2) : null

  $('lat-value').textContent = lat
  $('lat-dms').textContent = toDMS(coords.latitude, true)
  $('lng-value').textContent = lng
  $('lng-dms').textContent = toDMS(coords.longitude, false)

  const accuracyStr = accuracy ? `+- ${accuracy} meters` : ''
  $('lat-value').title = accuracyStr
  $('lng-value').title = accuracyStr

  $('card-altitude').classList.toggle('hidden', !alt)
  if (alt) {
    $('alt-value').textContent = `${alt.value} meters`
    $('alt-accuracy').textContent = alt.accuracy ? `+-${alt.accuracy} meters` : ''
  }

  $('heading-value').textContent = headingDirection(heading) || '\u00A0'
  $('heading-deg').innerHTML = heading != null ? `${heading.toFixed(2)}\u00B0` : '\u00A0'

  $('mph-value').textContent = `${speed.mph} mph`
  $('kph-value').textContent = `${speed.kph} km/h`
  $('ms-value').textContent = `${speed.ms} m/s`

  $('geojson-pre').textContent = JSON.stringify(toGeoJSON(lat, lng), null, 2)
  $('wkt-pre').textContent = toWKT(lat, lng, alt?.value ?? null)

  $('link-google').href = `https://www.google.co.uk/maps/@${lat},${lng},${MAP_ZOOM}z`
  $('link-osm').href = `https://www.openstreetmap.org/#map=${MAP_ZOOM}/${lat}/${lng}`
  $('link-bing').href = `https://www.bing.com/maps?lvl=${MAP_ZOOM}&cp=${lat}~${lng}`

  $('updated-value').textContent = relativeTime(state.position.timestamp, state.now)
  $('updated-value').title = new Date(state.position.timestamp).toString()
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
function bindCardClicks() {
  const cards = {
    'card-lat': () => state.position && formatCoords(state.position.coords).lat,
    'card-lng': () => state.position && formatCoords(state.position.coords).lng,
    'card-altitude': () => formatAltitude(state.position?.coords)?.value,
    'card-heading': () => headingDirection(state.position?.coords?.heading) || null,
    'card-mph': () => {
      const speed = formatSpeed(state.position?.coords?.speed)
      return speed.mph
    },
    'card-kph': () => {
      const speed = formatSpeed(state.position?.coords?.speed)
      return speed.kph
    },
    'card-ms': () => {
      const speed = formatSpeed(state.position?.coords?.speed)
      return speed.ms
    },
    'card-geojson': () => {
      if (!state.position) return null
      const { lat, lng } = formatCoords(state.position.coords)
      return JSON.stringify(toGeoJSON(lat, lng), null, 2)
    },
    'card-wkt': () => {
      if (!state.position) return null
      const { lat, lng } = formatCoords(state.position.coords)
      const alt = formatAltitude(state.position.coords)
      return toWKT(lat, lng, alt?.value ?? null)
    },
    'card-updated': () => {
      if (!state.position) return null
      return new Date(state.position.timestamp).toString()
    },
  }

  for (const [id, getValue] of Object.entries(cards)) {
    $(id).addEventListener('click', () => copyToClipboard(getValue()))
  }
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
  bindCardClicks()
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
