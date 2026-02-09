export function toDMS(decimal, isLatitude) {
  const hemisphere = isLatitude
    ? (decimal >= 0 ? 'N' : 'S')
    : (decimal >= 0 ? 'E' : 'W')
  const abs = Math.abs(decimal)
  const degrees = Math.floor(abs)
  const minutes = Math.floor((abs - degrees) * 60)
  const seconds = Math.floor(((abs - degrees) * 60 - minutes) * 60)
  return `${degrees}\u00B0 ${minutes}' ${seconds}" ${hemisphere}`
}

export function headingDirection(degrees) {
  if (degrees == null) return null
  if (degrees < 0 || degrees > 360) throw new Error('Invalid heading')

  if (degrees > 337.5 || degrees <= 22.5) return 'North'
  if (degrees <= 67.5) return 'North-East'
  if (degrees <= 112.5) return 'East'
  if (degrees <= 157.5) return 'South-East'
  if (degrees <= 202.5) return 'South'
  if (degrees <= 247.5) return 'South-West'
  if (degrees <= 292.5) return 'West'
  return 'North-West'
}

export function relativeTime(timestamp, now) {
  const seconds = Math.ceil((now - timestamp) / 1000)
  if (seconds < 10) return 'Just now'
  if (seconds < 60) return `${seconds} seconds ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  return `${Math.floor(seconds / 86400)} days ago`
}

export function toGeoJSON(lat, lng) {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Point',
      coordinates: [parseFloat(lng), parseFloat(lat)]
    }
  }
}

export function toWKT(lat, lng, alt) {
  if (alt != null) return `POINT(${lng} ${lat} ${alt})`
  return `POINT(${lng} ${lat})`
}
