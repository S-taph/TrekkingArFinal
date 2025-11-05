import { useState, useEffect } from 'react';
import { viajesAPI } from '../services/api';

/**
 * Hook para obtener viajes similares
 * @param {Number} viajeId - ID del viaje actual
 * @param {Number} limit - Cantidad máxima de viajes a obtener (default: 6)
 * @returns {Object} { trips, loading, error, refetch }
 */
const useSimilarTrips = (viajeId, limit = 6) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSimilarTrips = async () => {
    if (!viajeId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await viajesAPI.getSimilarViajes(viajeId, limit);

      if (response.success) {
        setTrips(response.data.viajes || []);
      } else {
        throw new Error(response.message || 'Error al obtener viajes similares');
      }
    } catch (err) {
      console.error('Error fetching similar trips:', err);
      setError(err.message || 'Error al cargar viajes similares');
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimilarTrips();
  }, [viajeId, limit]);

  return {
    trips,
    loading,
    error,
    refetch: fetchSimilarTrips
  };
};

export default useSimilarTrips;
