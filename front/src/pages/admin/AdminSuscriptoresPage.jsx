import AdminLayout from "../../components/admin/AdminLayout"
import SuscriptoresManager from "../../components/admin/SuscriptoresManager"

export default function AdminSuscriptoresPage() {
  return (
    <AdminLayout currentPath="/admin/suscriptores">
      <SuscriptoresManager />
    </AdminLayout>
  )
}
