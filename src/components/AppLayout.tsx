import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  BarChart3, FileText, Settings, ClipboardList, Database,
  LogOut, Menu, X, Leaf, Shield, PlusCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: BarChart3 },
  { to: '/data-entry', label: 'Data Entry', icon: PlusCircle },
  { to: '/emission-factors', label: 'Emission Factors', icon: Database },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/audit-log', label: 'Audit Log', icon: Shield },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar-background text-sidebar-foreground transition-transform lg:static lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <Leaf className="h-6 w-6 text-sidebar-primary" />
          <span className="text-lg font-bold text-sidebar-primary-foreground">CarbonTrack</span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="mb-2 truncate text-xs text-muted-foreground">{user?.email}</div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center border-b bg-card px-4 lg:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">GHG Protocol & ISO 14064</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
