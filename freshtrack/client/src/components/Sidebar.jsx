import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Sparkles,
  Bell,
  BarChart3,
  Leaf,
  X,
} from 'lucide-react'
import useAlerts from '../hooks/useAlerts.js'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/suggestions', label: 'Suggestions', icon: Sparkles },
  { to: '/alerts', label: 'Alerts', icon: Bell, badge: 'alerts' },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
]

function linkClass({ isActive }) {
  return [
    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
    isActive
      ? 'bg-gray-200 text-black'
      : 'text-black hover:bg-gray-100 hover:text-black',
  ].join(' ')
}

export default function Sidebar({
  open = false,
  expanded = false,
  onClose,
}) {
  const { data } = useAlerts({ auto: true })
  const unread = data?.count ?? 0

  const desktopWidth = expanded ? 'md:w-64' : 'md:w-[72px]'
  const desktopVisibility = 'hidden md:block'

  const SidebarInner = ({ compact }) => (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Leaf className="h-5 w-5" />
          </div>
          {!compact ? (
            <div>
              <div className="text-sm font-semibold leading-5 text-black">FreshTrack</div>
              <div className="text-xs text-gray-600">Expiry + Smart Suggestions</div>
            </div>
          ) : null}
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {nav.map((item) => {
          const Icon = item.icon
          return (
            <NavLink key={item.to} to={item.to} className={linkClass} end title={compact ? item.label : undefined}>
              <Icon className="h-4 w-4" />
              {!compact ? <span className="flex-1">{item.label}</span> : null}
              {item.badge === 'alerts' && unread > 0 ? (
                <span className="rounded-full bg-danger px-2 py-0.5 text-xs font-semibold">
                  {unread}
                </span>
              ) : null}
            </NavLink>
          )
        })}
      </nav>

      {!compact ? (
        <div className="border-t border-gray-200 px-4 py-4 text-xs text-gray-600">
          Demo store • Auto-seeded database
        </div>
      ) : (
        <div className="border-t border-gray-200 px-2 py-4 text-center text-[10px] text-gray-600">
          Demo
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop: collapsible */}
      <aside
        className={[
          desktopVisibility,
          desktopWidth,
          'flex-shrink-0 bg-white text-black shadow-[inset_-1px_0_0_rgba(0,0,0,0.06)] transition-[width]',
        ].join(' ')}
      >
        <SidebarInner compact={!expanded} />
      </aside>

      {/* Mobile: opens only on click */}
      <div className={open ? 'md:hidden' : 'hidden'}>
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={onClose}
          aria-hidden="true"
        />
        <aside className="fixed left-0 top-0 z-50 h-full w-72 bg-white text-black shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold leading-5 text-black">FreshTrack</div>
                <div className="text-xs text-gray-600">Expiry + Smart Suggestions</div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-black hover:bg-gray-200"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <SidebarInner compact={false} />
        </aside>
      </div>
    </>
  )
}

