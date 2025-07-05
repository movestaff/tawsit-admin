declare module 'leaflet.markercluster' {
  import * as L from 'leaflet'

  export interface MarkerClusterGroupOptions extends L.LayerOptions {
    showCoverageOnHover?: boolean
    zoomToBoundsOnClick?: boolean
    spiderfyOnMaxZoom?: boolean
    removeOutsideVisibleBounds?: boolean
    animate?: boolean
    animateAddingMarkers?: boolean
    disableClusteringAtZoom?: number
    maxClusterRadius?: number | ((zoom: number) => number)
    polygonOptions?: L.PolylineOptions
    singleMarkerMode?: boolean
    spiderLegPolylineOptions?: L.PolylineOptions
    iconCreateFunction?: (cluster: any) => L.Icon
  }

  export class MarkerClusterGroup extends L.FeatureGroup {
    constructor(options?: MarkerClusterGroupOptions)
    addLayer(layer: L.Layer): this
    addLayers(layers: L.Layer[]): this
    clearLayers(): this
    eachLayer(fn: (layer: L.Layer) => void): this
    getBounds(): L.LatLngBounds
    getLayers(): L.Layer[]
    getVisibleParent(marker: L.Marker): L.Marker
    removeLayer(layer: L.Layer): this
    removeLayers(layers: L.Layer[]): this
    refreshClusters(): this
  }

  export function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup
}
