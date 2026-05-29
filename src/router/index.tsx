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
import { SettingsPage } from "../pages/SettingsPage";
import { AdminCategoriesPage } from "../pages/admin/categories";
import { AdminCreditPackagesPage } from "../pages/admin/credit-packages";
import { AdminDashboardPage } from "../pages/admin/dashboard";
import { AdminGenerationsPage } from "../pages/admin/generations";
import { AdminModelSettingsPage } from "../pages/admin/model-settings";
import {
  AdminPresetEditorPage,
  AdminPresetsPage,
} from "../pages/admin/presets";

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
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
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
        <Route path="products" element={<AdminPresetsPage />} />
        <Route path="products/new" element={<AdminPresetEditorPage />} />
        <Route path="products/:id" element={<AdminPresetEditorPage />} />
        <Route path="credit-packages" element={<AdminCreditPackagesPage />} />
        <Route path="generations" element={<AdminGenerationsPage />} />
        <Route path="model-settings" element={<AdminModelSettingsPage />} />
      </Route>
    </Routes>
  );
}
