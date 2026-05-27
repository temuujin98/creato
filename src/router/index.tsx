import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { AdminLayout } from "../layouts/AdminLayout";
import { GeneratePage } from "../pages/GeneratePage";
import { DashboardPage } from "../pages/DashboardPage";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { MyImagesPage } from "../pages/MyImagesPage";
import { ProductDetailPage } from "../pages/ProductDetailPage";
import { ProductsPage } from "../pages/ProductsPage";
import { PricingPage } from "../pages/PricingPage";
import { RegisterPage } from "../pages/RegisterPage";
import { AdminCategoriesPage } from "../pages/admin/AdminCategoriesPage";
import { AdminCreditPackagesPage } from "../pages/admin/AdminCreditPackagesPage";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { AdminGenerationsPage } from "../pages/admin/AdminGenerationsPage";
import { AdminProductEditorPage } from "../pages/admin/AdminProductEditorPage";
import { AdminProductsPage } from "../pages/admin/AdminProductsPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:slug" element={<ProductDetailPage />} />
      <Route path="/generate/:productSlug" element={<GeneratePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-images"
        element={
          <ProtectedRoute>
            <MyImagesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/new" element={<AdminProductEditorPage />} />
        <Route path="products/:id" element={<AdminProductEditorPage />} />
        <Route path="credit-packages" element={<AdminCreditPackagesPage />} />
        <Route path="generations" element={<AdminGenerationsPage />} />
      </Route>
    </Routes>
  );
}
