import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { carritoAPI } from "../services/api"
import { useAuth } from "./AuthContext"

const CartContext = createContext(null)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider")
  }
  return context
}

export const CartProvider = ({ children }) => {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Cargar carrito desde el backend cuando el usuario está autenticado
  const loadCart = useCallback(async () => {
    if (!user) {
      setItems([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await carritoAPI.getCarrito()
      if (response.success) {
        const cartItems = response.data.carrito?.items || []
        setItems(cartItems)
      }
    } catch (err) {
      console.error("[CartContext] Error cargando carrito:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])


  // Cargar carrito al montar o cuando cambia el usuario
  useEffect(() => {
    loadCart()
  }, [loadCart])

  // Agregar item al carrito
  const addItem = useCallback(
    async (itemData) => {
      if (!user) {
        setError("Debes iniciar sesión para agregar items al carrito")
        return { success: false, error: "Usuario no autenticado" }
      }

      try {
        setLoading(true)
        setError(null)

        const response = await carritoAPI.addItem(itemData)
        if (response.success) {
          // Recargar carrito para obtener datos actualizados (ahora enriquecidos)
          await loadCart()
          return { success: true, data: response.data }
        }
      } catch (err) {
        console.error("[CartContext] Error agregando item:", err)
        setError(err.message)
        return { success: false, error: err.message }
      } finally {
        setLoading(false)
      }
    },
    [user, loadCart],
  )


  // Actualizar cantidad de un item
  const updateItemQuantity = useCallback(
    async (itemId, cantidad) => {
      if (!user) {
        setError("Debes iniciar sesión")
        return { success: false, error: "Usuario no autenticado" }
      }

      try {
        setLoading(true)
        setError(null)

        const response = await carritoAPI.updateItem(itemId, cantidad)
        if (response.success) {
          // Actualizar estado local
          setItems((prevItems) =>
            prevItems.map((item) =>
              item.id === itemId ? { ...item, cantidad } : item,
            ),
          )
          return { success: true }
        }
      } catch (err) {
        console.error("[CartContext] Error actualizando cantidad:", err)
        setError(err.message)
        return { success: false, error: err.message }
      } finally {
        setLoading(false)
      }
    },
    [user],
  )

  // Eliminar item del carrito
  const removeItem = useCallback(
    async (itemId) => {
      if (!user) {
        setError("Debes iniciar sesión")
        return { success: false, error: "Usuario no autenticado" }
      }

      try {
        setLoading(true)
        setError(null)

        const response = await carritoAPI.deleteItem(itemId)
        if (response.success) {
          // Actualizar estado local
          setItems((prevItems) => prevItems.filter((item) => item.id !== itemId))
          return { success: true }
        }
      } catch (err) {
        console.error("[CartContext] Error eliminando item:", err)
        setError(err.message)
        return { success: false, error: err.message }
      } finally {
        setLoading(false)
      }
    },
    [user],
  )

  // Vaciar carrito
  const clearCart = useCallback(async () => {
    if (!user) {
      setError("Debes iniciar sesión")
      return { success: false, error: "Usuario no autenticado" }
    }

    try {
      setLoading(true)
      setError(null)

      const response = await carritoAPI.clearCarrito()
      if (response.success) {
        setItems([])
        return { success: true }
      }
    } catch (err) {
      console.error("[CartContext] Error vaciando carrito:", err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [user])

  // Calcular totales
  const itemCount = items.reduce((sum, item) => sum + item.cantidad, 0)
  const totalPrice = items.reduce(
    (sum, item) => sum + item.precio_unitario * item.cantidad,
    0,
  )

  const value = {
    items,
    loading,
    error,
    itemCount,
    totalPrice,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    reloadCart: loadCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
