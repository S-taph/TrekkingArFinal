import { useState, useEffect } from "react"
import { viajesAPI } from "../services/api"

/**
 * Hook para obtener un viaje específico por ID
 * @param {number} id - ID del viaje
 * @returns {Object} { trip, loading, error, refetch }
 */
export const useTrip = (id) => {
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTrip = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await viajesAPI.getViajeById(id)

      if (response.success) {
        // El backend devuelve { success: true, data: { viaje: {...} } }
        const viajeData = response.data.viaje

        // Normalizar nombres de campos para compatibilidad con frontend
        // SIEMPRE normalizar fechas_disponibles si existen fechas
        if (viajeData.fechas && viajeData.fechas.length > 0) {
          viajeData.fechas_disponibles = viajeData.fechas.map(fecha => ({
            ...fecha,
            // Asegurar que id es el campo correcto (puede ser id_fechas_viaje)
            id: fecha.id_fechas_viaje || fecha.id,
            precio: fecha.precio_fecha || fecha.precio,
          }))
        } else if (viajeData.fechas_disponibles && viajeData.fechas_disponibles.length > 0) {
          // Si solo existe fechas_disponibles, también normalizarlo
          viajeData.fechas_disponibles = viajeData.fechas_disponibles.map(fecha => ({
            ...fecha,
            id: fecha.id_fechas_viaje || fecha.id,
            precio: fecha.precio_fecha || fecha.precio,
          }))
        }

        setTrip(viajeData)
      } else {
        throw new Error(response.message || "Error cargando viaje")
      }
    } catch (err) {
      console.error("[useTrip] Error:", err)
      setError(err.message)
      setTrip(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchTrip()
    }
  }, [id])

  return {
    trip,
    loading,
    error,
    refetch: fetchTrip,
  }
}
