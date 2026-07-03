import React from 'react'
import { 
  createRouter, 
  createRoute, 
  createRootRoute, 
  RouterProvider, 
  Outlet 
} from '@tanstack/react-router'
import { Toaster } from '@blinkdotnew/ui'
import { DashboardLayout } from './components/DashboardLayout'
import { DashboardPage } from './pages/DashboardPage'
import { ComparePage } from './pages/ComparePage'
import { HistoryPage } from './pages/HistoryPage'
import { ThreatsPage } from './pages/ThreatsPage'
import { TermsGuidePage } from './pages/TermsGuidePage'
import { ResultsWhyPage } from './pages/ResultsWhyPage'

// Root route with DashboardLayout
const rootRoute = createRootRoute({
  component: () => (
    <DashboardLayout>
      <Outlet />
      <Toaster position="top-right" />
    </DashboardLayout>
  ),
})

// Define routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
})

const compareRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/compare',
  component: ComparePage,
})

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  component: HistoryPage,
})

const threatsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/threats',
  component: ThreatsPage,
})

const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/terms',
  component: TermsGuidePage,
})

const resultsWhyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/why-results',
  component: ResultsWhyPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute, 
  compareRoute, 
  historyRoute, 
  threatsRoute,
  termsRoute,
  resultsWhyRoute,
])

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default function App() {
  return <RouterProvider router={router} />
}
