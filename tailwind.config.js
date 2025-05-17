/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}', // Scanne tous les fichiers dans src
  ],
  theme: {
    extend: {
      colors: {
        primary: '#228B22',      // Vert forêt
        secondary: '#F5F5F5',    // Gris très clair
        accent: '#FFA500',       // Orange (accent dynamique)
        neutral: '#E0E0E0',      // Gris pour bordures et arrière-plan léger
        danger: '#DC2626',       // Rouge pour erreurs ou actions critiques
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem', // Coins arrondis par défaut
      },
      boxShadow: {
        card: '0 4px 8px rgba(0, 0, 0, 0.05)', // ombre douce pour les cartes
      },
    },
  },
  plugins: [],
}
