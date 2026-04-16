import { type ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  ClipboardCheck,
  Database,
  FileText,
  Leaf,
  LogOut,
  Menu,
  Settings,
  Shield,
  Sparkles,
  Wand2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspaceSettings } from '@/hooks/useWorkspaceSettings';
import { cn } from '@/lib/utils';
import AuditCopilot from '@/components/AuditCopilot';

const NAV_ITEMS = [
  { to: '/', label: 'Command center', icon: BarChart3 },
  { to: '/data-entry', label: 'Audit wizard', icon: Wand2 },
  { to: '/auditor', label: 'Audit center', icon: ClipboardCheck },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/emission-factors', label: 'Factors', icon: Database },
  { to: '/audit-log', label: 'Audit trail', icon: Shield },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { settings } = useWorkspaceSettings();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(20,108,148,0.12),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(15,95,75,0.18),_transparent_40%)]">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu overlay"
        />
      )}

      <div className="flex min-h-screen">
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar/95 px-5 py-5 text-sidebar-foreground backdrop-blur-xl transition-transform lg:static lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sidebar-foreground/60">
                  Carbon
                </p>
                <p className="text-xl font-black tracking-tight text-sidebar-foreground">Audit Studio</p>
              </div>
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="mt-8 rounded-3xl border border-sidebar-border bg-white/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-sidebar-foreground/55">Active workspace</p>
                <p className="mt-1 text-lg font-bold text-sidebar-foreground">{settings.organizationName}</p>
                <p className="text-sm text-sidebar-foreground/65">
                  {settings.primaryStandard} | {settings.gwpSet}
                </p>
              </div>
              <Sparkles className="h-5 w-5 text-sidebar-foreground/45" />
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {NAV_ITEMS.map((item) => {
              const active = location.pathname === item.to;
              const Icon = item.icon;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all',
                    active
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-sidebar-foreground/72 hover:bg-white/10 hover:text-sidebar-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-3xl border border-sidebar-border bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-sidebar-foreground/55">Signed in</p>
            <p className="mt-1 truncate text-sm font-medium text-sidebar-foreground">
              {user?.email ?? 'demo@co2etrack.local'}
            </p>
            <Button
              type="button"
              variant="ghost"
              className="mt-4 w-full justify-start rounded-2xl text-sidebar-foreground hover:bg-white/10 hover:text-sidebar-foreground"
              onClick={signOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-xl">
            <div className="flex items-center gap-4 px-4 py-4 lg:px-8">
              <Button type="button" variant="outline" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>

              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Next-generation carbon auditing</p>
                <h1 className="text-lg font-bold tracking-tight text-foreground">
                  Fast, guided reporting for scopes 1, 2, and 3
                </h1>
              </div>

              <div className="ml-auto flex items-center gap-3">
                <div className="hidden rounded-full border border-border/80 bg-card px-4 py-2 text-sm text-muted-foreground md:block">
                  {settings.boundaryApproach}
                </div>
                <ThemeToggle />
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
      <AuditCopilot />
    </div>
  );
}
