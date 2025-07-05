
import { useEffect, useState } from 'react';
import {
  Paper,
  TextField,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  ListItemSecondaryAction,
  Typography,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import { fetchGroupesEmployes } from '../../lib/api';

export type GroupeSelectorProps = {
  selected: string[];
  onChange: (value: string[]) => void;
  active: boolean;
};

export default function GroupeSelector({ selected, onChange, active }: GroupeSelectorProps) {
  const [groupes, setGroupes] = useState<GroupeEmploye[]>([]);
  const [filteredGroupes, setFilteredGroupes] = useState<GroupeEmploye[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!active || groupes.length > 0) return; // évite le rechargement inutile
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchGroupesEmployes();
        setGroupes(data);
        setFilteredGroupes(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!search) {
      setFilteredGroupes(groupes);
    } else {
      setFilteredGroupes(
        groupes.filter((g) =>
          g.nom.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, groupes]);

  const handleToggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((i) => i !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        📋 Sélection des groupes de travail
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Rechercher un groupe..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {loading ? (
        <CircularProgress />
      ) : (
        <List dense>
          {filteredGroupes.map((groupe) => (
            <ListItem
              key={groupe.id}
              button
              onClick={() => handleToggle(groupe.id)}
              selected={selected.includes(groupe.id)}
            >
              <ListItemText
                primary={groupe.nom}
                secondary={`Site: ${groupe.site_id} | Début: ${groupe.horaire_debut ?? '-'} | Fin: ${groupe.horaire_fin ?? '-'}`}
              />
              <ListItemSecondaryAction>
                <Checkbox
                  edge="end"
                  onChange={() => handleToggle(groupe.id)}
                  checked={selected.includes(groupe.id)}
                />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}

// Exemple type GroupeEmploye (adapte-le à tes modèles réels)
export type GroupeEmploye = {
  id: string;
  nom: string;
  site_id: string;
  horaire_debut?: string;
  horaire_fin?: string;
};
