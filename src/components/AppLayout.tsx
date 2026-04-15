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
  { group: 'Main', items: [
    { to: '/', label: 'Dashboard', icon: BarChart3 },
    { to: '/auditor', label: 'Auditor Portal', icon: ClipboardList },
  ]},
  { group: 'Analysis & Administration', items: [
    { to: '/data-entry', label: 'Data Input', icon: PlusCircle },
    { to: '/reports', label: 'Disclosure Reports', icon: FileText },
    { to: '/emission-factors', label: 'Factor Database', icon: Database },
    { to: '/audit-log', label: 'Change Ledger', icon: Shield },
    { to: '/settings', label: 'Config', icon: Settings },
  ]}
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
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar-background text-sidebar-foreground transition-all lg:static lg:translate-x-0 border-r border-sidebar-border",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white shadow-lg">
            <Leaf className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black font-heading tracking-widest text-white leading-none">SLGTI</span>
            <span className="text-[10px] text-muted-foreground font-bold tracking-tighter uppercase italic">Carbon Track</span>
          </div>
        </div>

        <nav className="flex-1 space-y-6 p-4 overflow-y-auto mt-2">
          {NAV_ITEMS.map((group) => (
            <div key={group.group} className="space-y-2">
              <h3 className="px-3 text-[10px] font-black uppercase text-muted-foreground tracking-[.2em]">{group.group}</h3>
              <div className="space-y-1">
                {group.items.map(({ to, label, icon: Icon }) => {
                  const active = pathname === to;
                  return (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 group relative",
                        active
                          ? "bg-primary text-white shadow-md"
                          : "text-sidebar-foreground/70 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", active ? "text-white" : "text-muted-foreground group-hover:text-primary")} />
                      {label}
                      {active && <div className="absolute left-0 w-1 h-4 bg-accent rounded-full" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="mb-2 truncate text-xs text-muted-foreground">{user?.email}</div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden bg-background">
        <header className="flex h-16 items-center border-b bg-white px-4 lg:px-6 shadow-sm">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="ml-4 lg:ml-0 flex items-center">
            <h1 className="text-xl font-bold font-heading text-primary">Carbon Accounting System</h1>
          </div>
          <div className="ml-auto flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
            <ClipboardList className="h-4 w-4 text-secondary" />
            <span className="text-xs font-semibold text-secondary">GHG Protocol & ISO 14064</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
