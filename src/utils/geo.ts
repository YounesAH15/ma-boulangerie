/**
 * Utilitaires de géolocalisation pour "L'Ami du Pain" - Armentières
 * Adresse : 160 Rue Jules Lebleu, 59280 Armentières, France
 */

export const STORE_COORDS = {
  lat: 50.6845078,
  lng: 2.8655871,
  address: '160 Rue Jules Lebleu, 59280 Armentières, France',
};

/**
 * Calcule la distance orthodromique (Haversine) entre deux points en kilomètres
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Arrondi à 1 décimale
}

/**
 * Estime le temps de trajet en voiture en zone urbaine / péri-urbaine (vitesse moy ~32 km/h)
 */
export function estimateTravelMinutes(distanceKm: number, avgSpeedKmh = 32): number {
  if (distanceKm <= 0.3) return 1;
  const mins = Math.round((distanceKm / avgSpeedKmh) * 60);
  return Math.max(1, mins);
}
