// src/components/VehiculeSelector.tsx

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

export type VehiculeSelectorProps = {
  selected: Vehicule[];
  onChange: (value: Vehicule[]) => void;
  active: boolean;
  vehiculesDisponibles: Vehicule[];
};

export type Vehicule = {
  id: string;
  immatriculation: string;
  marque: string;
  modele: string;
  annee: number;
  capacite: number;
  disponible: boolean;
  prestataires?: {
    id: string;
    nom: string;
  };
};

export default function VehiculeSelector({
  selected,
  onChange,
  active,
  vehiculesDisponibles
}: VehiculeSelectorProps) {
  const [filteredVehicules, setFilteredVehicules] = useState<Vehicule[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setFilteredVehicules(vehiculesDisponibles);
  }, [vehiculesDisponibles]);

  useEffect(() => {
    if (!search) {
      setFilteredVehicules(vehiculesDisponibles);
    } else {
      const lower = search.toLowerCase();
      setFilteredVehicules(
        vehiculesDisponibles.filter((v) =>
          v.immatriculation?.toLowerCase().includes(lower) ||
          v.capacite?.toString().includes(lower) ||
          v.prestataires?.nom?.toLowerCase().includes(lower)
        )
      );
    }
  }, [search, vehiculesDisponibles]);

  const handleToggle = (vehicule: Vehicule) => {
    if (selected.find((v) => v.id === vehicule.id)) {
      onChange(selected.filter((v) => v.id !== vehicule.id));
    } else {
      onChange([...selected, vehicule]);
    }
  };

  return (
    <Paper className="border-2 border-primary bg-secondary p-4 rounded-lg shadow-card">
      <Typography variant="h6" gutterBottom className="text-primary">
        🚐 Sélection des véhicules disponibles
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Rechercher par immatriculation, capacité ou prestataire..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon className="text-primary" />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': {
              borderColor: 'var(--tw-color-primary)'
            }
          }
        }}
      />

      {!active ? (
        <div className="flex justify-center my-4">
          <CircularProgress />
        </div>
      ) : (
        <List dense>
          {filteredVehicules.map((vehicule) => {
            const isSelected = !!selected.find((v) => v.id === vehicule.id);
            return (
              <ListItem
                key={vehicule.id}
                button
                onClick={() => handleToggle(vehicule)}
                selected={isSelected}
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
                  primary={`${vehicule.immatriculation} (Capacité : ${vehicule.capacite})`}
                  secondary={`Prestataire : ${vehicule.prestataires?.nom ?? '-'}`}
                />
                <ListItemSecondaryAction>
                  <Checkbox
                    edge="end"
                    onChange={() => handleToggle(vehicule)}
                    checked={isSelected}
                    sx={{
                      color: 'var(--tw-color-primary)',
                      '&.Mui-checked': {
                        color: 'var(--tw-color-primary)'
                      }
                    }}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      )}
    </Paper>
  );
}
