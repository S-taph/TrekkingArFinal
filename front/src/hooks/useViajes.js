import { useState, useEffect, useCallback } from "react"
import { viajesAPI } from "../services/api"

/**
 * Hook para obtener y filtrar viajes
 * @param {Object} initialFilters - Filtros iniciales
 * @returns {Object} { viajes, loading, error, pagination, refetch }
 */
export const useViajes = (initialFilters = {}) => {
  const [viajes, setViajes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: initialFilters.limit || 12,
    total: 0,
    totalPages: 0,
  })

  const fetchViajes = useCallback(
    async (filters = {}, page = 1) => {
      try {
        setLoading(true)
        setError(null)

        const params = {
          page,
          limit: pagination.limit,
          ...filters,
        }

        // Limpiar params vacíos
        Object.keys(params).forEach((key) => {
          if (params[key] === "" || params[key] === null || params[key] === undefined) {
            delete params[key]
          }
        })

        const response = await viajesAPI.getViajes(params)

        if (response.success) {
          setViajes(response.data.viajes || [])
          setPagination({
            page: response.data.pagination?.page || 1,
            limit: response.data.pagination?.limit || 12,
            total: response.data.pagination?.total || 0,
            totalPages: response.data.pagination?.totalPages || 0,
          })
        } else {
          throw new Error(response.message || "Error cargando viajes")
        }
      } catch (err) {
        console.error("[useViajes] Error:", err)
        setError(err.message)
        setViajes([])
      } finally {
        setLoading(false)
      }
    },
    [pagination.limit],
  )

  // Cargar viajes al montar o cuando cambian filtros iniciales
  useEffect(() => {
    fetchViajes(initialFilters)
  }, []) // Solo al montar

  const refetch = useCallback(
    (filters = {}, page = 1) => {
      fetchViajes(filters, page)
    },
    [fetchViajes],
  )

  return {
    viajes,
    loading,
    error,
    pagination,
    refetch,
  }
}
