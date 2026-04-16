import { type ReactNode, useState, useEffect } from 'react';
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
  Compass,
  Zap,
  ShieldCheck,
  Activity,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspaceSettings } from '@/hooks/useWorkspaceSettings';
import { useUserRole } from '@/hooks/useUserRole';
import { cn } from '@/lib/utils';
import AuditCopilot from '@/components/AuditCopilot';
import OnboardingWizard from '@/components/OnboardingWizard';

const NAV_ITEMS = [
  { to: '/', label: 'Command center', icon: BarChart3, step: 'Dashboard', roles: ['admin', 'auditor', 'data_entry', 'viewer'] },
  { to: '/data-entry', label: 'Emission capture', icon: Activity, step: 'Methodology 03', roles: ['admin', 'data_entry'] },
  { to: '/auditor', label: 'Validation desk', icon: ShieldCheck, step: 'Methodology 09', roles: ['admin', 'auditor'] },
  { to: '/reports', label: 'Disclosures', icon: FileText, step: 'Methodology 10', roles: ['admin', 'auditor', 'viewer'] },
  { to: '/emission-factors', label: 'Factor engine', icon: Database, step: 'Methodology 04', roles: ['admin', 'auditor'] },
  { to: '/audit-log', label: 'Audit history', icon: Shield, step: 'Assurance', roles: ['admin', 'auditor', 'viewer'] },
  { to: '/settings', label: 'Configuration', icon: Settings, step: 'Boundary', roles: ['admin'] },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { settings } = useWorkspaceSettings();
  const { data: role = 'viewer' } = useUserRole();

  const filteredNav = NAV_ITEMS.filter(item => item.roles.includes(role));

  useEffect(() => {
    // Show onboarding if organization name is default or boundary is not set
    if (settings.organizationName === 'SLGTI - Northern Campus' && !localStorage.getItem('co2etrack-onboarded')) {
       setShowOnboarding(true);
    }
  }, [settings.organizationName]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('co2etrack-onboarded', 'true');
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(20,108,148,0.12),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(15,95,75,0.18),_transparent_40%)]">
      {showOnboarding && <OnboardingWizard onComplete={handleOnboardingComplete} />}
      
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
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-sidebar-foreground/60">
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

          <div className="mt-8 rounded-[32px] border border-sidebar-border bg-white/5 p-5 relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 h-16 w-16 bg-primary/20 blur-2xl group-hover:bg-primary/40 transition-colors" />
            <div className="flex items-start justify-between gap-3 relative">
              <div>
                <p className="text-[10px] uppercase font-black tracking-[0.22em] text-sidebar-foreground/45">Organization</p>
                <p className="mt-1 text-base font-black text-sidebar-foreground leading-tight">{settings.organizationName}</p>
                <div className="mt-2 flex items-center gap-2">
                   <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <p className="text-[10px] uppercase font-bold text-sidebar-foreground/65 tracking-widest">
                     {settings.objective}
                   </p>
                </div>
              </div>
              <Compass className="h-5 w-5 text-primary opacity-40" />
            </div>
          </div>

          <nav className="mt-10 space-y-1">
            {filteredNav.map((item) => {
              const active = location.pathname === item.to;
              const Icon = item.icon;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center justify-between rounded-2xl px-4 py-3 h-12 transition-all',
                    active
                      ? 'bg-slate-900 text-white shadow-xl shadow-slate-200/20'
                      : 'text-sidebar-foreground/72 hover:bg-white/10 hover:text-sidebar-foreground'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-bold tracking-tight">{item.label}</span>
                  </div>
                  {active && (
                    <span className="text-[8px] font-black uppercase tracking-widest text-primary opacity-60">
                      {item.step}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-4">
             <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-transparent p-5 border border-primary/5">
                <div className="flex items-center gap-3 mb-3">
                   <Target className="h-4 w-4 text-primary" />
                   <p className="text-[10px] font-black uppercase tracking-widest text-primary">Decarbonization</p>
                </div>
                <div className="space-y-1">
                   <p className="text-xs font-bold text-sidebar-foreground">Reduction Pathway</p>
                   <p className="text-[10px] text-sidebar-foreground/50 font-medium">Net-zero gap analysis live.</p>
                </div>
             </div>

            <div className="rounded-3xl border border-sidebar-border bg-white/5 p-4 flex items-center justify-between">
              <div className="truncate">
                <p className="text-[8px] font-black uppercase tracking-[0.22em] text-sidebar-foreground/55">Auditor Identity</p>
                <p className="truncate text-xs font-bold text-sidebar-foreground">
                  {user?.email ?? 'demo@slgti.lk'}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-xl text-sidebar-foreground/40 hover:text-primary hover:bg-primary/5"
                onClick={signOut}
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </aside>

        <div className="flex flex-1 flex-col h-screen overflow-hidden">
          <header className="sticky top-0 z-30 border-b border-border/60 bg-[#1e3a8a] text-white backdrop-blur-xl">
            <div className="flex items-center gap-4 px-4 py-4 lg:px-12">
              <Button type="button" variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/10" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>

              <div>
                <p className="text-[10px] uppercase font-black tracking-[0.22em] text-white/50">GHG Protocol methodology</p>
                <h1 className="text-base font-black tracking-tight flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  SLGTI Carbon Auditing & Reporting Excellence
                </h1>
              </div>

              <div className="ml-auto flex items-center gap-4">
                <div className="hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 h-11 text-[10px] font-black uppercase tracking-widest text-white/60 md:flex">
                  <Compass className="h-4 w-4 text-emerald-400" />
                  {settings.boundaryApproach}
                </div>
                <ThemeToggle />
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-[#fafafa] relative overflow-x-hidden">
            {/* 3D Book Binding Effect */}
            <div className="absolute top-0 left-0 bottom-0 w-10 bg-gradient-to-r from-slate-300/40 via-white/50 to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 left-10 bottom-0 w-[0.5px] bg-slate-300/30 z-10 pointer-events-none" />
            
            {/* Paper Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/p6.png')] z-0 grayscale" />

            <div className="max-w-[920px] mx-auto px-12 py-16 relative z-10 min-h-full">
              {children}
            </div>
            <AuditCopilot />
          </main>
        </div>
      </div>
    </div>
  );
}
