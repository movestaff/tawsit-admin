import { CalendarDays, Download, Filter } from 'lucide-react';
import { KpiCard } from '../components/Tdb/KpiCard';
import { PerformanceChart } from '../components/Tdb/PerformanceChart';
import { CostsChart } from '../components/Tdb/CostsChart';
import { AlertsList } from '../components/Tdb/AlertsList';
import { RealtimeMapPlaceholder } from '../components/Tdb/RealtimeMapPlaceholder';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-soft px-6 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-4">Tableau de bord</h1>
          <p className="text-sm text-gray-500">Vue synthétique des opérations de transport</p>
        </div>

        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-soft hover:bg-gray-50">
            <Filter className="w-4 h-4" /> Filtres
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-soft hover:bg-gray-50">
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
        <KpiCard title="Incidents signalés" value="3" sub="2 retards • 1 panne" trend="none" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
        <PerformanceChart />
        <CostsChart />
      </div>

      {/* Bottom row: Alerts + Map */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <AlertsList />
        <RealtimeMapPlaceholder />
      </div>
    </div>
  );
}
