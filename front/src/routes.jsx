import { Navigate } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import CatalogPage from "./pages/CatalogPage"
import TripDetailPage from "./pages/TripDetailPage"
import CheckoutFlow from "./pages/CheckoutFlow"
import ProfilePage from "./pages/ProfilePage"
import MyReservationsPage from "./pages/MyReservationsPage"
import VerifyEmailPage from "./pages/VerifyEmailPage"
import GaleriaPage from "./pages/GaleriaPage"
import NosotrosPage from "./pages/NosotrosPage"
import ContactoPage from "./pages/ContactoPage"
import AdminApp from "./pages/AdminApp"
import AdminViajesPage from "./pages/admin/AdminViajesPage"
import AdminUsuariosPage from "./pages/admin/AdminUsuariosPage"
import AdminReservasPage from "./pages/admin/AdminReservasPage"
import AdminSuscriptoresPage from "./pages/admin/AdminSuscriptoresPage"
import AdminCampaniasPage from "./pages/admin/AdminCampaniasPage"
import NewsletterUnsubscribe from "./pages/NewsletterUnsubscribe"
import PaymentSuccess from "./pages/PaymentSuccess"
import PaymentFailure from "./pages/PaymentFailure"
import PaymentPending from "./pages/PaymentPending"

/**
 * Rutas centralizadas de la aplicación
 */
export const routes = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/verify-email",
    element: <VerifyEmailPage />,
  },
  {
    path: "/newsletter/unsubscribe/:token",
    element: <NewsletterUnsubscribe />,
  },
  {
    path: "/catalogo",
    element: <CatalogPage />,
  },
  {
    path: "/viajes/:id",
    element: <TripDetailPage />,
  },
  {
    path: "/galeria",
    element: <GaleriaPage />,
  },
  {
    path: "/nosotros",
    element: <NosotrosPage />,
  },
  {
    path: "/contacto",
    element: <ContactoPage />,
  },
  {
    path: "/checkout",
    element: <CheckoutFlow />,
    protected: true, // Requiere autenticación
  },
  {
    path: "/perfil",
    element: <ProfilePage />,
    protected: true,
  },
  {
    path: "/mis-reservas",
    element: <MyReservationsPage />,
    protected: true,
  },
  {
    path: "/pago/success",
    element: <PaymentSuccess />,
    protected: true,
  },
  {
    path: "/pago/failure",
    element: <PaymentFailure />,
    protected: true,
  },
  {
    path: "/pago/pending",
    element: <PaymentPending />,
    protected: true,
  },
  {
    path: "/admin",
    element: <AdminApp />,
    protected: true,
    adminOnly: true,
    children: [
      {
        index: true,
        element: <Navigate to="/admin/viajes" replace />,
      },
      {
        path: "viajes",
        element: <AdminViajesPage />,
      },
      {
        path: "usuarios",
        element: <AdminUsuariosPage />,
      },
      {
        path: "reservas",
        element: <AdminReservasPage />,
      },
      {
        path: "suscriptores",
        element: <AdminSuscriptoresPage />,
      },
      {
        path: "campanias",
        element: <AdminCampaniasPage />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]
