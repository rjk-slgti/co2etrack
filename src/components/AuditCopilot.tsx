import { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  ChevronRight, 
  Lightbulb, 
  MessageSquare, 
  ShieldAlert, 
  Sparkles,
  TrendingDown,
  X 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuditWorkspace } from '@/hooks/useAuditWorkspace';
import { formatKg } from '@/lib/audit-analytics';

interface Insight {
  id: string;
  type: 'coaching' | 'alert' | 'recommendation';
  title: string;
  message: string;
  actionLabel?: string;
}

export default function AuditCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const { entries, summary, organization } = useAuditWorkspace();
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    const newInsights: Insight[] = [];

    // 1. Data Quality Coaching
    const lowQualityCount = entries.filter(e => e.data_quality === 'Low').length;
    if (lowQualityCount > 0) {
      newInsights.push({
        id: 'quality-coach',
        type: 'coaching',
        title: 'Heads up: Data quality gaps',
        message: `${lowQualityCount} entries have low confidence scores. I recommend attaching primary source documents to improve audit assurance.`,
        actionLabel: 'Browse Evidence Vault'
      });
    }

    // 2. Reduction Recommendations
    if (summary.totalKg > 1000) {
      const transportShare = summary.topDrivers.find((d: any) => d.label === 'Transport')?.share ?? 0;
      if (transportShare > 30) {
        newInsights.push({
          id: 'reduction-transport',
          type: 'recommendation',
          title: 'Emission Reduction Pathway',
          message: 'Transport accounts for 30%+ of your footprint. Switching 20% of freight to rail or EV fleets could save up to 45 tCO2e annually.',
          actionLabel: 'Model Scenario'
        });
      }
    }

    // 3. Compliance Alert
    if (summary.verifiedShare < 50 && entries.length > 5) {
      newInsights.push({
        id: 'compliance-alert',
        type: 'alert',
        title: 'Assurance level is low',
        message: 'Your current verified inventory is below 50%. Professional reviewers need to clear the pending queue before final disclosure.',
        actionLabel: 'Open Auditor Portal'
      });
    }

    setInsights(newInsights);
  }, [entries, summary]);

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 h-14 w-14 rounded-full bg-slate-900 border-border shadow-2xl hover:scale-110 transition-transform group"
      >
        <div className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full animate-pulse border-2 border-white" />
        <BrainCircuit className="h-6 w-6 text-white group-hover:rotate-12 transition-transform" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-8 right-8 w-[380px] h-[600px] rounded-[40px] border-slate-200/60 shadow-3xl overflow-hidden bg-white/95 backdrop-blur-xl animate-in slide-in-from-bottom-8 duration-500 ring-1 ring-slate-100 flex flex-col">
      <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-slate-950 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Audit Copilot</h3>
            <p className="text-[10px] text-primary font-bold mt-1">AI-ASSISTED COMPLIANCE</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          <div className="p-4 rounded-3xl bg-primary/5 border border-primary/10">
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "Hi there! I've analyzed your <strong>{organization?.name}</strong> workspace. Here's what I recommend to reach 100% assurance."
            </p>
          </div>

          <div className="space-y-4">
            {insights.map((insight) => (
              <div key={insight.id} className="p-5 rounded-[28px] border border-slate-100 bg-white shadow-sm space-y-3 group hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-2">
                  {insight.type === 'coaching' && <Lightbulb className="h-4 w-4 text-amber-500" />}
                  {insight.type === 'alert' && <ShieldAlert className="h-4 w-4 text-red-500" />}
                  {insight.type === 'recommendation' && <TrendingDown className="h-4 w-4 text-primary" />}
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{insight.type}</span>
                </div>
                <h4 className="font-bold text-slate-900 leading-tight">{insight.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{insight.message}</p>
                {insight.actionLabel && (
                   <Button variant="ghost" className="p-0 h-auto text-[10px] font-black uppercase text-primary tracking-widest hover:bg-transparent flex items-center gap-1 group">
                     {insight.actionLabel}
                     <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                   </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>

      <div className="p-6 border-t border-slate-100 bg-slate-50/50">
        <div className="relative">
          <Input 
            placeholder="Ask anything about GHG Protocol..." 
            className="rounded-2xl border-slate-200 pl-10 h-12 text-xs focus-visible:ring-primary shadow-inner"
          />
          <MessageSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
        </div>
      </div>
    </Card>
  );
}
