"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { authAPI } from "../services/api"
import { safeRemoveItem, safeSetItem } from "../utils/safeStorage"

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = useCallback(async () => {
    try {
      const response = await authAPI.getProfile()
      if (response.success) {
        setUser(response.data.user)
      } else {
        // Si la respuesta no es exitosa, limpiar usuario
        setUser(null)
      }
    } catch (error) {
      // Si hay error de autenticación, el token ya fue limpiado en api.js
      console.log("[AuthContext] No hay sesión activa o token inválido:", error.message)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Verificar si hay sesión activa al cargar
  useEffect(() => {
    // Capturar token de OAuth redirect (si existe en la URL)
    const urlParams = new URLSearchParams(window.location.search)
    const tokenFromUrl = urlParams.get('token')

    if (tokenFromUrl) {
      console.log('[AuthContext] Token de OAuth detectado en URL, guardando...')
      // Guardar token en localStorage (modo cross-origin)
      safeSetItem('auth_token', tokenFromUrl)

      // Limpiar el token de la URL por seguridad
      urlParams.delete('token')
      const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '') + window.location.hash
      window.history.replaceState({}, document.title, newUrl)
    }

    checkAuth()
  }, [checkAuth])

  const login = useCallback(async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      if (response.success) {
        // Obtener perfil completo del usuario (incluye avatar y todos los campos)
        await checkAuth()
        return { success: true, user: response.data.user }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [checkAuth])

  const register = useCallback(async (userData) => {
    try {
      const response = await authAPI.register(userData)
      if (response.success) {
        setUser(response.data.user)
        return { success: true }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authAPI.logout()
      setUser(null)
      // Limpiar localStorage de forma segura (funciona en modo incógnito)
      safeRemoveItem('auth_token')
    } catch (error) {
      console.error("[v0] Error en logout:", error)
      // Limpiar usuario y token incluso si falla la petición
      setUser(null)
      safeRemoveItem('auth_token')
    }
  }, [])

  const updateUser = useCallback((updatedUserData) => {
    setUser((prev) => ({ ...prev, ...updatedUserData }))
  }, [])

  const value = useCallback(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      updateUser,
    }),
    [user, loading, login, register, logout, updateUser],
  )

  return <AuthContext.Provider value={value()}>{children}</AuthContext.Provider>
}
