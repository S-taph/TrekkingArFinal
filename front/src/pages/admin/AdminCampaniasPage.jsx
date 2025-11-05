import AdminLayout from "../../components/admin/AdminLayout"
import CampaniasManager from "../../components/admin/CampaniasManager"

export default function AdminCampaniasPage() {
  return (
    <AdminLayout currentPath="/admin/campanias">
      <CampaniasManager />
    </AdminLayout>
  )
}
