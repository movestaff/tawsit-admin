import { useMap } from 'react-leaflet'
import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet.markercluster'
import { markerClusterGroup } from 'leaflet.markercluster'


interface Props {
  markers: {
    id: string
    lat: number
    lng: number
    popupContent: string
    icon?: L.Icon
  }[]
}

export default function MarkerClusterGroup({ markers }: Props) {
  const map = useMap()

  useEffect(() => {
    const markerCluster = markerClusterGroup()

    markers.forEach(({ id, lat, lng, popupContent, icon }) => {
      const marker = L.marker([lat, lng], { icon }).bindPopup(popupContent)
      markerCluster.addLayer(marker)
    })

    map.addLayer(markerCluster)

    return () => {
      map.removeLayer(markerCluster)
    }
  }, [markers, map])

  return null
}
