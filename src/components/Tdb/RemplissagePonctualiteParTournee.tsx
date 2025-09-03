// components/Tdb/RemplissagePonctualiteParTournee.tsx
import { useEffect, useMemo, useState } from 'react';
import { fetchRemplissagePonctualiteParTournee } from '../../lib/api';
import type { RemplPonctuParTour } from '../../lib/api';

export default function RemplissagePonctualiteParTournee({
  dateDebut,
  dateFin,
  defaultAvance = 20,
}: {
  dateDebut: string;
  dateFin: string;
  defaultAvance?: number;
}) {
  const [avance, setAvance] = useState(defaultAvance);
  const [rows, setRows] = useState<RemplPonctuParTour[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState<{ key: keyof RemplPonctuParTour; dir: 'asc'|'desc' }>({ key: 'taux_remplissage', dir: 'desc' });
  const [q, setQ] = useState('');

  useEffect(() => {
    if (!dateDebut || !dateFin) return;
    let cancelled = false;
    setLoading(true);
    setErr(null);

    fetchRemplissagePonctualiteParTournee(dateDebut, dateFin, avance)
      .then(data => { if (!cancelled) setRows(data || []); })
      .catch(e => { if (!cancelled) setErr(e?.message || 'Erreur inconnue'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [dateDebut, dateFin, avance]);

  const filtered = useMemo(() => {
    const list = q
      ? rows.filter(r => (r.tournee_nom || '').toLowerCase().includes(q.toLowerCase()))
      : rows.slice();
    return list.sort((a,b) => {
      const k = sort.key;
      const av = a[k] as number | string;
      const bv = b[k] as number | string;
      if (typeof av === 'number' && typeof bv === 'number') {
        return sort.dir === 'asc' ? av - bv : bv - av;
      }
      return sort.dir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [rows, q, sort]);

  const th = (label: string, key: keyof RemplPonctuParTour) => (
    <th
      className="px-3 py-2 text-left text-xs font-semibold text-gray-600 cursor-pointer select-none"
      onClick={() => setSort(s => ({ key, dir: s.key===key && s.dir==='desc' ? 'asc' : 'desc' }))}
      title="Trier"
    >
      {label}{' '}
      <span className="text-gray-400">{sort.key===key ? (sort.dir==='asc' ? '▲' : '▼') : ''}</span>
    </th>
  );

  return (
    <div className="bg-white rounded-xl shadow-soft p-5 border border-gray-100">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Remplissage & ponctualité — par tournée</h3>
          <p className="text-xs text-gray-500">Période {dateDebut} → {dateFin} • Avance ≥ {avance} min</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            className="border rounded px-2 py-1 text-sm"
            placeholder="Rechercher une tournée…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <label className="text-sm text-gray-600 flex items-center gap-2">
            Avance (min)
            <input
              type="number"
              min={0}
              className="w-20 border rounded px-2 py-1 text-sm"
              value={avance}
              onChange={(e) => setAvance(Number(e.target.value || 0))}
            />
          </label>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-400">Chargement…</div>
      ) : err ? (
        <div className="text-red-600">Erreur : {err}</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-500">Aucune tournée trouvée pour la période.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                {th('Tournée', 'tournee_nom')}
                {th('Nb exéc.', 'nb_exec')}
                {th('Transportés', 'transportes_total')}
                {th('Capacité', 'capacite_total')}
                {th('Remplissage %', 'taux_remplissage')}
                {th('Ponctualité %', 'ponctualite')}
                {th('Avances', 'nb_avances')}
                {th('Évaluable', 'nb_eval_ponctualite')}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.tournee_id} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2">{r.tournee_nom}</td>
                  <td className="px-3 py-2">{r.nb_exec}</td>
                  <td className="px-3 py-2">{r.transportes_total}</td>
                  <td className="px-3 py-2">{r.capacite_total}</td>
                  <td className="px-3 py-2">{r.taux_remplissage.toFixed(2)}%</td>
                  <td className="px-3 py-2">{r.ponctualite.toFixed(2)}%</td>
                  <td className="px-3 py-2">{r.nb_avances}</td>
                  <td className="px-3 py-2">{r.nb_eval_ponctualite}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
