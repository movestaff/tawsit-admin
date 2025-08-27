import React, { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { aiListSites, aiSuggestRoutes, aiGetProposal, aiAcceptProposal } from '../lib/api'

const center = [34.0, -6.8] as [number, number] // fallback

export default function IAPropositions() {
  const [sites, setSites] = useState<any[]>([])
  const [siteId, setSiteId] = useState<string>('')
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10))
  const [depart, setDepart] = useState<string>('08:00')
  //const [capacity, setCapacity] = useState<number>(15)
  const [propId, setPropId] = useState<string>('')
  const [proposal, setProposal] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    aiListSites().then(setSites).catch(console.error)
  }, [])

  async function handleSuggest() {
  if (!siteId) return alert('Choisis un site')
  setLoading(true)
  try {
    const { proposition_id } = await aiSuggestRoutes({ site_id: siteId, date, depart_time: depart })
    setPropId(proposition_id)
    const p = await aiGetProposal(proposition_id)
    setProposal(p)
  } catch (e:any) {
    alert(e.message || 'Erreur')
  } finally {
    setLoading(false)
  }
}

  async function handleAccept() {
    if (!propId) return
    setLoading(true)
    try {
      await aiAcceptProposal(propId)
      alert('Proposition validée en tournées ✅')
    } catch (e:any) {
      alert(e.message || 'Erreur accept')
    } finally {
      setLoading(false)
    }
  }

  // Geo rendering: simple polylignes (ordre des arrêts)
  const polylines = useMemo(() => {
    if (!proposal) return []
    const mapStopsByTour = new Map<string, any[]>()
    for (const s of proposal.stops) {
      const arr = mapStopsByTour.get(s.proposition_tournee_id) || []
      arr.push(s)
      mapStopsByTour.set(s.proposition_tournee_id, arr)
    }
    for (const [k, arr] of mapStopsByTour) arr.sort((a,b)=>a.ordre-b.ordre)
    return proposal.tours.map((t: any, idx: number) => ({
      id: t.id,
      idx,
      coords: (mapStopsByTour.get(t.id) || []).map((s:any)=>[Number(s.latitude), Number(s.longitude)] as [number,number])
    }))
  }, [proposal])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Propositions IA (VRP)</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <select className="border p-2 rounded" value={siteId} onChange={e=>setSiteId(e.target.value)}>
          <option value="">— Site —</option>
          {sites.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
        </select>
        <input type="date" className="border p-2 rounded" value={date} onChange={e=>setDate(e.target.value)} />
        <input type="time" className="border p-2 rounded" value={depart} onChange={e=>setDepart(e.target.value)} />
        
        <button onClick={handleSuggest} disabled={loading} className="bg-primary text-white px-4 py-2 rounded">
          {loading ? 'Calcul…' : 'Suggérer'}
        </button>
      </div>

      {proposal && (
        <>
          <div className="flex items-center gap-2">
            <button onClick={handleAccept} className="bg-green-600 text-white px-4 py-2 rounded">Valider en tournées</button>
            <span className="text-sm text-gray-500">Tours : {proposal.tours.length}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 h-[520px] border rounded overflow-hidden">
              <MapContainer center={center} zoom={11} style={{height:'100%', width:'100%'}}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {polylines.map((pl:any) => (
                  <Polyline key={pl.id} positions={pl.coords} />
                ))}
                {proposal.stops.map((s:any) => (
                  <Marker key={s.id} position={[Number(s.latitude), Number(s.longitude)] as any}>
                    <Popup>
                      <div className="text-sm">
                        <div className="font-semibold">{s.nom}</div>
                        <div>Ordre: {s.ordre}</div>
                        <div>Employés: {s.employes_count}</div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
           <div className="border rounded p-3 space-y-2">
  {proposal.tours.map((t:any, i:number)=>{
    const v = (proposal.vehicules || []).find((x:any)=>x.id === t.vehicule_id)
    return (
      <div key={t.id} className="border p-2 rounded">
        <div className="font-semibold">Tournée #{i+1}</div>
        <div>Véhicule: {v ? `${v.immatriculation} (cap. ${v.capacite})` : '—'}</div>
        <div>Demande: {t.demand} / Capacité: {t.capacity}</div>
        <div>Distance: {t.distance_km.toFixed(1)} km</div>
        <div>Durée: {t.duration_min.toFixed(0)} min</div>
      </div>
    )
  })}
</div>

          </div>
        </>
      )}
    </div>
  )
}
