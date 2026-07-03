import {
  AppShell,
  AppShellSidebar,
  AppShellMain,
  MobileSidebarTrigger,
  SidebarItem,
  Button,
  Persona,
} from '@blinkdotnew/ui'
import {
  LayoutDashboard,
  ShieldCheck,
  History,
  Settings,
  LogOut,
  Activity,
  Maximize2,
  BookOpenText,
  HelpCircle,
} from 'lucide-react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { useBlinkAuth } from '@blinkdotnew/react'
import { blink } from '../blink/client'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useBlinkAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    blink.auth.logout(window.location.origin)
  }

  const goTo = (path: string) => {
    void navigate({ to: path })
  }

  return (
    <AppShell>
      <AppShellSidebar className="shrink-0 border-r border-cyan-500/10 bg-background/50 backdrop-blur-xl">
        <div className="flex h-full w-[260px] flex-col overflow-hidden">
          <div className="flex h-16 shrink-0 items-center border-b border-cyan-500/10 px-6">
            <ShieldCheck className="mr-2 h-6 w-6 text-cyan-400" />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-lg font-bold tracking-tight text-transparent">
              NetSec
            </span>
          </div>

          <div className="cyber-grid flex-1 space-y-1 overflow-y-auto px-3 py-6">
            <SidebarItem
              icon={<LayoutDashboard className="h-4 w-4" />}
              label="Dashboard"
              active={location.pathname === '/'}
              onClick={() => goTo('/')}
            />

            <SidebarItem
              icon={<Maximize2 className="h-4 w-4" />}
              label="Compare Sites"
              active={location.pathname === '/compare'}
              onClick={() => goTo('/compare')}
            />

            <SidebarItem
              icon={<Activity className="h-4 w-4" />}
              label="Threat Intel"
              active={location.pathname === '/threats'}
              onClick={() => goTo('/threats')}
            />

            <SidebarItem
              icon={<History className="h-4 w-4" />}
              label="Audit History"
              active={location.pathname === '/history'}
              onClick={() => goTo('/history')}
            />

            <SidebarItem
              icon={<BookOpenText className="h-4 w-4" />}
              label="Terms Guide"
              active={location.pathname === '/terms'}
              onClick={() => goTo('/terms')}
            />

            <SidebarItem
              icon={<HelpCircle className="h-4 w-4" />}
              label="Why Results"
              active={location.pathname === '/why-results'}
              onClick={() => goTo('/why-results')}
            />
          </div>

          <div className="shrink-0 border-t border-cyan-500/10 bg-black/20 p-4">
            {user ? (
              <div className="space-y-2">
                <Button variant="ghost" className="h-14 w-full justify-start p-2">
                  <Persona
                    name={user.displayName || user.email?.split('@')[0] || 'User'}
                    subtitle="Security Analyst"
                    src={user.photoURL}
                    className="text-left"
                  />
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => goTo('/history')}>
                  <Settings className="h-4 w-4" /> Settings
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2 text-red-400" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" /> Sign out
                </Button>
              </div>
            ) : (
              <Button onClick={() => blink.auth.login()} variant="ghost" className="w-full justify-start gap-2">
                <LogOut className="h-4 w-4" /> Sign in
              </Button>
            )}
          </div>
        </div>
      </AppShellSidebar>

      <AppShellMain className="relative overflow-y-auto bg-background">
        <div className="absolute right-0 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 -z-10 h-[300px] w-[300px] rounded-full bg-blue-600/5 blur-[100px]" />

        <div className="flex h-16 items-center gap-2 border-b border-cyan-500/10 px-6 md:hidden">
          <MobileSidebarTrigger />
          <ShieldCheck className="h-5 w-5 text-cyan-400" />
          <span className="font-bold">NetSec</span>
        </div>

        <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col p-4 sm:p-6 lg:p-8">{children}</div>
      </AppShellMain>
    </AppShell>
  )
}
