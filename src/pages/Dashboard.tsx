import React, { useEffect, useState } from 'react';
import { CalendarDays, Download, Filter } from 'lucide-react';
import { KpiCard } from '../components/Tdb/KpiCard';

import { CostsChart } from '../components/Tdb/CostsChart';
import { AlertsList } from '../components/Tdb/AlertsList';
import { RegionDensityMap } from '../components/Tdb/RegionDensityMap';
import CteCard from '../components/Tdb/CteCard';
import ToursCostCard from '../components/Tdb/ToursCostCard';
import ToursCostTimeline from '../components/Tdb/ToursCostTimeline';
import ToursCompare from '../components/Tdb/ToursCompare';
import { fetchStatsToursJour, fetchEmployesTransportesJour } from '../lib/api';
import RemplissagePonctualiteTimeline from '../components/Tdb/RemplissagePonctualiteTimeline';
import RemplissagePonctualiteParTournee from '../components/Tdb/RemplissagePonctualiteParTournee';


export default function Dashboard() {
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  // Calcul du lundi et du dimanche de la semaine en cours
  useEffect(() => {
    const today = new Date();
    const day = today.getDay();
    const diffMonday = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diffMonday));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const toIsoDate = (d: Date) =>
      new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .split('T')[0];

    setDateDebut(toIsoDate(monday));
    setDateFin(toIsoDate(sunday));
  }, []);

   const [toursJour, setToursJour] = useState<{ value: string; sub: string; trend: 'up'|'down'|'none'; trendValue: string }>({
    value: '—',
    sub: '',
    trend: 'none',
    trendValue: '',
  });

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const stats = await fetchStatsToursJour(); // aujourd'hui par défaut
        if (cancel) return;

        const value = String(stats.nb_today);
        const sub = `${stats.delta >= 0 ? '+' : ''}${stats.delta} vs hier`;
        const trend = stats.pct_change > 0 ? 'up' : stats.pct_change < 0 ? 'down' : 'none';
        const trendValue = `${stats.pct_change > 0 ? '+' : ''}${stats.pct_change}%`;

        setToursJour({ value, sub, trend, trendValue });
      } catch (e) {
        // Valeurs neutres en cas d'erreur
        if (!cancel) setToursJour({ value: '—', sub: 'indisponible', trend: 'none', trendValue: '' });
      }
    })();
    return () => { cancel = true; };
  }, []);

  const [emplJour, setEmplJour] = useState<{ value: string; sub: string; trend: 'up' | 'down' | 'none'; trendValue: string }>({
  value: '—',
  sub: '',
  trend: 'none',
  trendValue: '',
});

useEffect(() => {
  let cancel = false;
  (async () => {
    try {
      const stats = await fetchEmployesTransportesJour(); // aujourd'hui (TZ profil) par défaut
      if (cancel) return;
      const value = String(stats.nb_today);
      const sub = `${stats.delta >= 0 ? '+' : ''}${stats.delta} vs hier`;
      const trend = stats.pct_change > 0 ? 'up' : stats.pct_change < 0 ? 'down' : 'none';
      const trendValue = `${stats.pct_change > 0 ? '+' : ''}${stats.pct_change}%`;
      setEmplJour({ value, sub, trend, trendValue });
    } catch (_e) {
      if (!cancel) setEmplJour({ value: '—', sub: 'indisponible', trend: 'none', trendValue: '' });
    }
  })();
  return () => { cancel = true; };
}, []);

  return (
    <div className="min-h-screen bg-soft px-6 py-6">
      {/* En-tête avec champs date */}
      <div className="mb-6 flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-4">Tableau de bord</h1>
          <p className="text-sm text-gray-500">Vue synthétique des opérations de transport</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <label htmlFor="dateDebut" className="text-sm text-gray-500">Début</label>
            <input
              id="dateDebut"
              type="date"
              className="border rounded px-2 py-1 text-sm"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <label htmlFor="dateFin" className="text-sm text-gray-500">Fin</label>
            <input
              id="dateFin"
              type="date"
              className="border rounded px-2 py-1 text-sm"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
            />
          </div>
          {/* Le bouton Semaine en cours */}
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-soft hover:bg-gray-50"
            onClick={() => {
              const today = new Date();
              const day = today.getDay();
              const diffMonday = today.getDate() - day + (day === 0 ? -6 : 1);
              const monday = new Date(today.setDate(diffMonday));
              const sunday = new Date(monday);
              sunday.setDate(monday.getDate() + 6);
              const iso = (d: Date) =>
                new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                  .toISOString()
                  .split('T')[0];
              setDateDebut(iso(monday));
              setDateFin(iso(sunday));
            }}
          >
            <CalendarDays className="w-4 h-4" /> Semaine en cours
          </button>
        
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KpiCard
    title="Tournées du jour"
    value={toursJour.value}
    sub={toursJour.sub}
    trend={toursJour.trend}
    trendValue={toursJour.trendValue}
  />
        <KpiCard
  title="Employés transportés"
  value={emplJour.value}
  sub={emplJour.sub}
  trend={emplJour.trend}
  trendValue={emplJour.trendValue}
/>
        
        <CteCard dateDebut={dateDebut} dateFin={dateFin} />
        <ToursCostCard dateDebut={dateDebut} dateFin={dateFin} />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
  <ToursCostTimeline dateDebut={dateDebut} dateFin={dateFin}/>
  <ToursCompare dateDebut={dateDebut} dateFin={dateFin} top={8} />
</div>

      {/* Charts et alertes + carte densité */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
        <RemplissagePonctualiteTimeline dateDebut={dateDebut} dateFin={dateFin} defaultBucket="week" defaultSeuil={20} />
          <RegionDensityMap />
        
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-1 gap-4">
       
        <RemplissagePonctualiteParTournee dateDebut={dateDebut} dateFin={dateFin} defaultAvance={20} />
      </div>
    </div>
  );
}
