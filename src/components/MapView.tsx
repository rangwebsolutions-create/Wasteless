import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import type { Hotspot } from '../types'
import { HOME_COORDS, DEFAULT_ZOOM, MAP_BOUNDS } from '../types'

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function hotspotDivIcon(resolved: boolean, isPrivate: boolean = false) {
  const className = resolved
    ? 'hotspot-marker hotspot-marker--resolved'
    : isPrivate
    ? 'hotspot-marker hotspot-marker--private'
    : 'hotspot-marker'

  return L.divIcon({
    className,
    html: '<span class="hotspot-marker__ring"></span><span class="hotspot-marker__dot"></span>',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  })
}

function pendingDivIcon() {
  return L.divIcon({
    className: 'pending-marker',
    html: '<span class="pending-marker__ring"></span><span class="pending-marker__dot"></span>',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  })
}

// Resolved private cleanup marker
function resolvedPrivateDivIcon() {
  return L.divIcon({
    className: 'hotspot-marker hotspot-marker--resolved hotspot-marker--private',
    html: '<span class="hotspot-marker__dot"></span>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}

interface MarkerEntry {
  marker: L.Marker
  circle?: L.Circle
}

interface MapViewProps {
  hotspots: Hotspot[]
  reportPlacementActive: boolean
  pendingLatLng: [number, number] | null
  onMapClick: (latlng: [number, number]) => void
  onHotspotClick: (hotspot: Hotspot) => void
  isEmpty: boolean
  t: (key: string) => string
  onLocationError?: (error: string) => void
  onLocationSuccess?: () => void
  reviewerId: string
}

export function MapView({
  hotspots,
  reportPlacementActive,
  pendingLatLng,
  onMapClick,
  onHotspotClick,
  isEmpty,
  t,
  onLocationError,
  onLocationSuccess,
  reviewerId,
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, MarkerEntry>>(new Map())
  const pendingMarkerRef = useRef<L.Marker | null>(null)
  const currentLocationRef = useRef<L.CircleMarker | null>(null)
  const accuracyCircleRef = useRef<L.Circle | null>(null)
  const mapElRef = useRef<HTMLDivElement>(null)
  const locateBtnRef = useRef<HTMLButtonElement>(null)
  const [isLocating, setIsLocating] = useState(false)

  useEffect(() => {
    if (mapRef.current || !mapElRef.current) return
    const map = L.map(mapElRef.current, {
      zoomControl: false,
      maxBounds: MAP_BOUNDS,
      maxBoundsViscosity: 1.0,
    }).setView(HOME_COORDS, DEFAULT_ZOOM)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)
    L.control.zoom({ position: 'bottomleft' }).addTo(map)
    map.on('click', (e) => {
      if (!reportPlacementActive) return
      onMapClick([e.latlng.lat, e.latlng.lng])
    })
    mapRef.current = map
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !navigator.geolocation) {
      onLocationError?.('Geolocation not supported in this browser')
    } else {
      const watchId = navigator.geolocation.watchPosition(
        (position) => updateCurrentLocation(position, map),
        (error) => {
          const errorMessage = error.message || 'Failed to get location'
          onLocationError?.(errorMessage)
        },
        { enableHighAccuracy: false, maximumAge: 5000, timeout: 5000 },
      )
      return () => {
        navigator.geolocation.clearWatch(watchId)
        currentLocationRef.current?.remove()
        accuracyCircleRef.current?.remove()
        currentLocationRef.current = null
        accuracyCircleRef.current = null
      }
    }
  }, [onLocationError])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.off('click')
    map.on('click', (e) => {
      if (!reportPlacementActive) return
      onMapClick([e.latlng.lat, e.latlng.lng])
    })
    if (mapElRef.current) {
      mapElRef.current.classList.toggle('crosshair', reportPlacementActive)
    }
  }, [reportPlacementActive, onMapClick])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Determine which hotspots should be visible:
    // - Private + open → visible only to creator (purple color)
    // - Resolved private → green dot, no popup, no metadata
    // - Open (none | public) → orange color, clickable
    // - Resolved (none | public) → exact pin, clickable
    const visible = hotspots.filter((h) => {
      if (h.cleanup_mode === 'private' && h.status === 'open') {
        return h.created_by === reviewerId
      }
      return true
    })

    // Remove stale
    markersRef.current.forEach((entry, id) => {
      if (!visible.find((h) => h.id === id)) {
        map.removeLayer(entry.marker)
        if (entry.circle) map.removeLayer(entry.circle)
        markersRef.current.delete(id)
      }
    })

    // Add or update
    visible.forEach((hotspot) => {
      if (markersRef.current.has(hotspot.id)) return

      const isPrivateResolved = hotspot.cleanup_mode === 'private' && hotspot.status === 'resolved'
      const isOpenHotspot = hotspot.status === 'open'
      const displayLat = hotspot.lat
      const displayLng = hotspot.lng
      let circle: L.Circle | undefined

      if (isOpenHotspot) {
        circle = undefined
      }

      const icon = isPrivateResolved
        ? resolvedPrivateDivIcon()
        : hotspotDivIcon(hotspot.status === 'resolved', hotspot.cleanup_mode === 'private')

      const marker = L.marker([displayLat, displayLng], { icon }).addTo(map)

      if (!isPrivateResolved) {
        // Private resolved pins have no popup/click handler — zero metadata
        marker.on('click', () => onHotspotClick(hotspot))
      }

      markersRef.current.set(hotspot.id, { marker, circle })
    })
  }, [hotspots, onHotspotClick])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (pendingMarkerRef.current) {
      map.removeLayer(pendingMarkerRef.current)
      pendingMarkerRef.current = null
    }
    if (pendingLatLng) {
      pendingMarkerRef.current = L.marker(pendingLatLng, { icon: pendingDivIcon() }).addTo(map)
    }
  }, [pendingLatLng])

  function updateCurrentLocation(position: GeolocationPosition, map: L.Map) {
    const point: L.LatLngExpression = [position.coords.latitude, position.coords.longitude]
    const accuracy = Math.max(position.coords.accuracy, 8)
    if (!accuracyCircleRef.current) accuracyCircleRef.current = L.circle(point, { radius: accuracy, color: '#2563eb', weight: 1, fillColor: '#60a5fa', fillOpacity: 0.16 }).addTo(map)
    else { accuracyCircleRef.current.setLatLng(point); accuracyCircleRef.current.setRadius(accuracy) }
    if (!currentLocationRef.current) currentLocationRef.current = L.circleMarker(point, { radius: 9, color: '#ffffff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }).addTo(map)
    else currentLocationRef.current.setLatLng(point)
  }

  function locateMe() {
    if (!navigator.geolocation || !mapRef.current) {
      onLocationError?.('Geolocation not supported')
      return
    }

    setIsLocating(true)
    if (locateBtnRef.current) {
      locateBtnRef.current.classList.add('loading')
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point: L.LatLngExpression = [position.coords.latitude, position.coords.longitude]
        mapRef.current?.setView(point, 17, { animate: true })
        if (mapRef.current) updateCurrentLocation(position, mapRef.current)
        setIsLocating(false)
        if (locateBtnRef.current) {
          locateBtnRef.current.classList.remove('loading')
        }
        onLocationSuccess?.()
      },
      (error) => {
        const errorMessage = error.message || 'Failed to get location'
        onLocationError?.(errorMessage)
        setIsLocating(false)
        if (locateBtnRef.current) {
          locateBtnRef.current.classList.remove('loading')
        }
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 10000 },
    )
  }

  return (
    <>
      <div id="map" ref={mapElRef} />
      <button
        ref={locateBtnRef}
        className="map-locate-btn"
        onClick={locateMe}
        type="button"
        aria-label="Show my current location"
        disabled={isLocating}
      >
        ⌖
      </button>
      {isEmpty && (
        <div className="map-empty-hint">
          <span>{t('noOpenHotspots')}</span>{' '}
          <strong>{t('reportHotspot')}</strong>{' '}
          <span>{t('toAddFirstOne')}</span>
        </div>
      )}
    </>
  )
}
