import React, { useEffect, useState } from 'react';
import { CalendarDays, Download, Filter } from 'lucide-react';
import { KpiCard } from '../components/Tdb/KpiCard';
import { PerformanceChart } from '../components/Tdb/PerformanceChart';
import { CostsChart } from '../components/Tdb/CostsChart';
import { AlertsList } from '../components/Tdb/AlertsList';
import { RegionDensityMap } from '../components/Tdb/RegionDensityMap';
import CteCard from '../components/Tdb/CteCard';

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
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary text-white px-3 py-2 text-sm shadow-soft hover:opacity-90">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Tournées du jour" value="12" sub="+2 vs hier" trend="up" trendValue="+20%" />
        <KpiCard title="Employés transportés" value="254" sub="Remplissage moyen 92%" />
        <KpiCard title="Distance totale" value="438 km" sub="-5% vs moyenne" trend="down" trendValue="-5%" />
        <CteCard dateDebut={dateDebut} dateFin={dateFin} />
      </div>

      {/* Charts et alertes + carte densité */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
        <PerformanceChart />
        <CostsChart />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <AlertsList />
        <RegionDensityMap />
      </div>
    </div>
  );
}
