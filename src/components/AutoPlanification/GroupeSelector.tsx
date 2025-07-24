import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  TextField,
  Typography
} from '@mui/material';
import {
  fetchGroupesEmployes,
  fetchSites,
  fetchGroupesDejaPlanifies,
} from '../../lib/api';
import { toast } from 'react-toastify';

type GroupeSelectorProps = {
  planificationType: 'depart' | 'retour';
  selected: string[];
  onChange: (newSelected: string[]) => void;
  active: boolean;
};


interface Groupe {
  id: string;
  nom: string;
  site_id: string;
  heure_debut: string;
  heure_fin: string;
  recurrence_type: string;
  type: string;
}

interface Site {
  id: string;
  nom: string;
}

export default function GroupeSelector({ 
  planificationType,
  selected,
  onChange,
  active 
}: { 
  planificationType: 'depart' | 'retour';
  selected: string[];
  onChange: (newSelected: string[]) => void;
  active: boolean;
}) 


{
  const [groupes, setGroupes] = useState<Groupe[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!active) return;

    const load = async () => {
      try {
        // ✅ Charger tous les groupes, les sites et les groupes déjà planifiés
        const [allGroupes, sitesRes, planifiésRes] = await Promise.all([
          fetchGroupesEmployes(),
          fetchSites(),
          fetchGroupesDejaPlanifies()
        ]);

        const groupesActifsIds = planifiésRes?.groupesIds || [];

        // ✅ Filtrer les groupes déjà planifiés
        const groupesDisponibles = (allGroupes || []).filter(
          (g: Groupe) => !groupesActifsIds.includes(g.id)
        );

        setGroupes(groupesDisponibles);
        setSites(Array.isArray(sitesRes) ? sitesRes : []);
      } catch (e: any) {
        console.error(e);
        toast.error("❌ Erreur lors du chargement des groupes ou des sites");
      }
    };

    load();
  }, [active]);

  const siteNames = Object.fromEntries(sites.map(site => [site.id, site.nom]));

  // ✅ Filtrage texte + type départ
  const filteredGroupes = (groupes || [])
    .filter(g => g.type === planificationType)
    .filter(g => g.nom.toLowerCase().includes(filter.toLowerCase()));

  // ✅ Sélection unique
  const handleSelect = (id: string) => {
    if (selected.includes(id)) {
      onChange([]);
    } else {
      onChange([id]);
    }
  };

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        📋 Sélectionnez un groupe
      </Typography>

      <TextField
        fullWidth
        label="Filtrer par nom"
        value={filter}
        onChange={e => setFilter(e.target.value)}
        margin="normal"
      />

      <List dense>
        {filteredGroupes.map((groupe) => (
          <ListItem
            key={groupe.id}
            button
            onClick={() => handleSelect(groupe.id)}
            selected={selected.includes(groupe.id)}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'var(--tw-color-primary)/10',
                color: 'var(--tw-color-primary)'
              },
              '&.Mui-selected:hover': {
                backgroundColor: 'var(--tw-color-primary)/20'
              }
            }}
          >
            <ListItemText
              primary={groupe.nom}
              secondary={`Site: ${siteNames[groupe.site_id] ?? groupe.site_id} | Début: ${groupe.heure_debut ?? '-'} | Fin: ${groupe.heure_fin ?? '-'}`}
            />

            <ListItemSecondaryAction>
              <Checkbox
                edge="end"
                onChange={() => handleSelect(groupe.id)}
                checked={selected.includes(groupe.id)}
                sx={{
                  color: 'var(--tw-color-primary)',
                  '&.Mui-checked': {
                    color: 'var(--tw-color-primary)'
                  }
                }}
              />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </div>
  );
}
