import { Outlet } from "react-router-dom";
import { AdminSidebar } from "../components/admin/AdminSidebar";

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-ink text-white">
      <AdminSidebar />
      <main className="px-4 py-8 sm:px-6 lg:ml-72 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
