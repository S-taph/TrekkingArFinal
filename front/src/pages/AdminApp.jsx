"use client"

import { useState } from "react"
import AdminLayout from "../components/admin/AdminLayout"
import Dashboard from "../components/admin/Dashboard"
import ViajesManager from "../components/admin/ViajesManager"
import GuiasManager from "../components/admin/GuiasManager"
import ReservasManager from "../components/admin/ReservasManager"
import UsuariosManager from "../components/admin/UsuariosManager"
import SuscriptoresManager from "../components/admin/SuscriptoresManager"
import CampaniasManager from "../components/admin/CampaniasManager"

export default function AdminApp() {
  const [currentPath, setCurrentPath] = useState("/admin")

  const handleNavigate = (path) => {
    setCurrentPath(path)
  }

  const renderContent = () => {
    switch (currentPath) {
      case "/admin":
        return <Dashboard onNavigate={handleNavigate} />
      case "/admin/usuarios":
        return <UsuariosManager />
      case "/admin/viajes":
        return <ViajesManager />
      case "/admin/guias":
        return <GuiasManager />
      case "/admin/reservas":
        return <ReservasManager />
      case "/admin/suscriptores":
        return <SuscriptoresManager />
      case "/admin/campanias":
        return <CampaniasManager />
      default:
        return <Dashboard />
    }
  }

  return (
    <AdminLayout currentPath={currentPath} onNavigate={handleNavigate}>
      {renderContent()}
    </AdminLayout>
  )
}
