// src/components/VehiculeSelector.tsx

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

import { fetchVehicules } from '../../lib/api';

export type VehiculeSelectorProps = {
  selected: Vehicule[];
  onChange: (value: Vehicule[]) => void;
  active: boolean;
};

export type Vehicule = {
  id: string;
  nom: string;
  capacite: number;
  disponible: boolean;
};

export default function VehiculeSelector({ selected, onChange, active }: VehiculeSelectorProps) {
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [filteredVehicules, setFilteredVehicules] = useState<Vehicule[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!active || vehicules.length > 0) return; // évite le rechargement inutile
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchVehicules();
        setVehicules(data);
        setFilteredVehicules(data);
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
      setFilteredVehicules(vehicules);
    } else {
      setFilteredVehicules(
        vehicules.filter((v) =>
          v.nom.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, vehicules]);

  const handleToggle = (vehicule: Vehicule) => {
    if (selected.find((v) => v.id === vehicule.id)) {
      onChange(selected.filter((v) => v.id !== vehicule.id));
    } else {
      onChange([...selected, vehicule]);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        🚐 Sélection des véhicules disponibles
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Rechercher un véhicule..."
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
          {filteredVehicules.map((vehicule) => (
            <ListItem
              key={vehicule.id}
              button
              onClick={() => handleToggle(vehicule)}
              selected={!!selected.find((v) => v.id === vehicule.id)}
            >
              <ListItemText
                primary={`${vehicule.nom} (Capacité : ${vehicule.capacite})`}
                secondary={vehicule.disponible ? '✅ Disponible' : '❌ Indisponible'}
              />
              <ListItemSecondaryAction>
                <Checkbox
                  edge="end"
                  onChange={() => handleToggle(vehicule)}
                  checked={!!selected.find((v) => v.id === vehicule.id)}
                />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}
