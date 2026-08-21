import {
  AppShell,
  AppShellSidebar,
  AppShellMain,
  MobileSidebarTrigger,
  SidebarItem,
  Button,
  Persona,
  Badge,
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
  Wifi,
  ExternalLink,
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
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-cyan-500/10 px-5">
            <div className="flex items-center">
              <ShieldCheck className="mr-2 h-6 w-6 text-cyan-400" />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-lg font-bold tracking-tight text-transparent">
                NetSec
              </span>
            </div>
            <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px] gap-1 px-1.5 py-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              DoH Live
            </Badge>
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

            <div className="pt-4 px-2">
              <div className="rounded-lg border border-cyan-500/10 bg-cyan-500/5 p-3 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-cyan-300 font-semibold text-[11px] uppercase tracking-wider">
                  <Wifi className="h-3.5 w-3.5 text-cyan-400" /> Cloudflare DoH
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Real-time encrypted DNS queries directly over HTTPS.
                </p>
              </div>
            </div>
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
                <Button variant="ghost" className="w-full justify-start gap-2 text-xs" onClick={() => goTo('/history')}>
                  <Settings className="h-4 w-4" /> Audit Logs
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2 text-xs text-red-400 hover:text-red-300" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" /> Sign out
                </Button>
              </div>
            ) : (
              <Button onClick={() => blink.auth.login()} variant="ghost" className="w-full justify-start gap-2 text-xs">
                <LogOut className="h-4 w-4" /> Sign in with Blink
              </Button>
            )}
          </div>
        </div>
      </AppShellSidebar>

      <AppShellMain className="relative overflow-y-auto bg-background">
        <div className="absolute right-0 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 -z-10 h-[300px] w-[300px] rounded-full bg-blue-600/5 blur-[100px]" />

        <div className="flex h-16 items-center justify-between border-b border-cyan-500/10 px-6 md:hidden">
          <div className="flex items-center gap-2">
            <MobileSidebarTrigger />
            <ShieldCheck className="h-5 w-5 text-cyan-400" />
            <span className="font-bold">NetSec</span>
          </div>
          <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px]">DoH Live</Badge>
        </div>

        <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col p-4 sm:p-6 lg:p-8">{children}</div>
      </AppShellMain>
    </AppShell>
  )
}
