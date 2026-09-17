// Deterministic fuzz based on hotspot ID — same hotspot always maps to same display offset
export function fuzzLatLng(id: string, lat: number, lng: number): [number, number] {
  let seed = 0
  for (let i = 0; i < id.length; i++) seed = (((seed << 5) - seed) + id.charCodeAt(i)) | 0
  seed = seed >>> 0
  const angle = ((seed % 1000) / 1000) * 2 * Math.PI
  const dist = 150 + ((seed % 500) / 500) * 150 // 150–300 m
  const dLat = (dist * Math.cos(angle)) / 111320
  const dLng = (dist * Math.sin(angle)) / (111320 * Math.cos((lat * Math.PI) / 180))
  return [lat + dLat, lng + dLng]
}

export function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function getCurrentPositionSafe(): Promise<GeolocationPosition | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 6000 }
    )
  })
}
