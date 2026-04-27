// src/router.tsx
// Phase 1 / Plan 01-04 — all 18 v1 routes registered under <AppShell>.
// Protected children are wrapped in <ProtectedRoute /> (Phase 1 stub; Phase 2 enforces real auth).
//
// Plan 01-05 (FOUND-07 structural prevention): the side-effect import below ensures the seed
// TOOLS array is evaluated during the production bundle so __validateSlugsUnique +
// __validateLogosPresent fire at `vite build` time. Without this, no production code path
// references tools.ts (Phase 3 features will, but not in Phase 1) and tree-shaking would
// elide the module — making duplicate-slug bugs only catchable in tests.
import "@/data/tools"
import { createBrowserRouter } from "react-router"
import { AppShell } from "@/components/layout/AppShell"
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute"
import LandingPage from "@/pages/LandingPage"
import SignInPage from "@/pages/SignInPage"
import SignUpPage from "@/pages/SignUpPage"
import ForgotPasswordPage from "@/pages/ForgotPasswordPage"
import OnboardingPage from "@/pages/OnboardingPage"
import HomePage from "@/pages/HomePage"
import CategoriesPage from "@/pages/CategoriesPage"
import CategoryDetailPage from "@/pages/CategoryDetailPage"
import ToolDetailPage from "@/pages/ToolDetailPage"
import ComparePickerPage from "@/pages/ComparePickerPage"
import ComparePage from "@/pages/ComparePage"
import SearchPage from "@/pages/SearchPage"
import FavoritesPage from "@/pages/FavoritesPage"
import ProfilePage from "@/pages/ProfilePage"
import RankingsPage from "@/pages/RankingsPage"
import SubmitToolPage from "@/pages/SubmitToolPage"
import SubmitSuccessPage from "@/pages/SubmitSuccessPage"
import NotFoundPage from "@/pages/NotFoundPage"

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/signin", element: <SignInPage /> },
      { path: "/signup", element: <SignUpPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/categories", element: <CategoriesPage /> },
      { path: "/categories/:slug", element: <CategoryDetailPage /> },
      { path: "/tools/:slug", element: <ToolDetailPage /> },
      { path: "/compare/:a", element: <ComparePickerPage /> },
      { path: "/compare/:a/vs/:b", element: <ComparePage /> },
      { path: "/search", element: <SearchPage /> },
      { path: "/rankings", element: <RankingsPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/onboarding", element: <OnboardingPage /> },
          { path: "/home", element: <HomePage /> },
          { path: "/favorites", element: <FavoritesPage /> },
          { path: "/profile", element: <ProfilePage /> },
          { path: "/submit", element: <SubmitToolPage /> },
          { path: "/submit/success", element: <SubmitSuccessPage /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
])
