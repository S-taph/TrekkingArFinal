import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { ThemeProvider } from "./context/ThemeContext"
import { CartProvider } from "./context/CartContext"
import { ChatbotWidget } from "./components/ChatbotWidget"
import { ProtectedRoute } from "./components/ProtectedRoute"
import GuidePhotoAlert from "./components/GuidePhotoAlert"
import { routes } from "./routes"

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <Routes>
              {routes.map((route, index) => {
                const { path, element, protected: isProtected, adminOnly, children } = route

                // Rutas con children (como /admin/*)
                if (children) {
                  return (
                    <Route
                      key={index}
                      path={path}
                      element={
                        isProtected ? (
                          <ProtectedRoute adminOnly={adminOnly}>{element}</ProtectedRoute>
                        ) : (
                          element
                        )
                      }
                    >
                      {children.map((child, childIndex) => (
                        <Route
                          key={childIndex}
                          path={child.path}
                          index={child.index}
                          element={child.element}
                        />
                      ))}
                    </Route>
                  )
                }

                // Rutas normales
                return (
                  <Route
                    key={index}
                    path={path}
                    element={
                      isProtected ? (
                        <ProtectedRoute adminOnly={adminOnly}>{element}</ProtectedRoute>
                      ) : (
                        element
                      )
                    }
                  />
                )
              })}
            </Routes>

            {/* Alerta para guías sin foto de perfil */}
            <GuidePhotoAlert />

            {/* Chatbot flotante global */}
            <ChatbotWidget />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}