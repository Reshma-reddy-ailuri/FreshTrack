import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

import Dashboard from './pages/Dashboard.jsx'
import Products from './pages/Products.jsx'
import Suggestions from './pages/Suggestions.jsx'
import Alerts from './pages/Alerts.jsx'
import Analytics from './pages/Analytics.jsx'

function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <Sidebar
          open={sidebarOpen}
          expanded={sidebarExpanded}
          onClose={() => setSidebarOpen(false)}
          onToggleExpanded={() => setSidebarExpanded((v) => !v)}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar
            onToggleSidebar={() => setSidebarOpen((v) => !v)}
            onToggleSidebarExpanded={() => setSidebarExpanded((v) => !v)}
            sidebarExpanded={sidebarExpanded}
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AppShell>
            <ErrorBoundary>
              <Dashboard />
            </ErrorBoundary>
          </AppShell>
        }
      />
      <Route
        path="/products"
        element={
          <AppShell>
            <ErrorBoundary>
              <Products />
            </ErrorBoundary>
          </AppShell>
        }
      />
      <Route
        path="/suggestions"
        element={
          <AppShell>
            <ErrorBoundary>
              <Suggestions />
            </ErrorBoundary>
          </AppShell>
        }
      />
      <Route
        path="/alerts"
        element={
          <AppShell>
            <ErrorBoundary>
              <Alerts />
            </ErrorBoundary>
          </AppShell>
        }
      />
      <Route
        path="/analytics"
        element={
          <AppShell>
            <ErrorBoundary>
              <Analytics />
            </ErrorBoundary>
          </AppShell>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

