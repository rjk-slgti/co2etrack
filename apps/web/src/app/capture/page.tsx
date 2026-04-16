"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Beaker, Droplets, Info, Plus, Save, Thermometer, Wind } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MARKERS = [
  { id: "MARKER-C-13", name: "Stable Carbon Isotope C-13", purity: "99.9%" },
  { id: "MARKER-XE-129", name: "Xenon Multi-isotope", purity: "98.5%" },
  { id: "MARKER-SF-6-ALT", name: "Fluorocarbon Alternative", purity: "99.0%" },
];

const SMART_HINTS = {
  mass: "Pro-tip: Capture mass should match the meter readings at the compression manifold.",
  purity: "Regulator Guidance: Purity lower than 99.5% requires non-condensable reconciliation.",
  marker: "Audit Check: The molecular tracer must be verified via re-detection at the first modal transition.",
};

export default function CaptureWizard() {
  const [formData, setFormData] = useState({
    mass: "",
    purity: "99.9",
    markerId: MARKERS[0].id,
    concentration: "5.0",
    pressure: "75",
    temp: "25",
  });

  const uncertainty = (parseFloat(formData.mass) || 0) * (1 - (parseFloat(formData.purity) / 100)) * 0.05;

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Navigation Header */}
      <header className="bg-[#006400] text-white pt-20 pb-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/grid.png')]"></div>
        <div className="max-w-5xl mx-auto flex items-end justify-between relative z-10">
           <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20">
                <Shield className="h-3 w-3 text-[#00FF00]" />
                <span className="text-[10px] font-black uppercase tracking-widest">ISO 14064-2 Compliant Acquisition</span>
              </div>
              <h1 className="text-5xl font-black tracking-tight leading-none text-white">Capture & <br/> <span className="text-[#00FF00]">Molecular Tagging</span></h1>
           </div>
           <div className="flex flex-col items-end gap-2">
              <div className="h-16 w-16 rounded-3xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/5 shadow-2xl">
                 <Wind className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Node ID: GEN-EM-C44</span>
           </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 -mt-16 relative z-20">
        {/* Smart Guidance Banner for Freshers */}
        <div className="bg-[#1e3a8a]/5 border border-[#1e3a8a]/10 rounded-[40px] p-8 mb-10 flex items-center gap-8 group hover:bg-[#1e3a8a]/10 transition-all border-l-8 border-l-[#b45309] shadow-xl shadow-slate-200/50">
           <div className="h-14 w-14 rounded-2xl bg-white shadow-xl flex items-center justify-center shrink-0">
             <Info className="h-7 w-7 text-[#1e3a8a]" />
           </div>
           <div className="space-y-1">
              <h4 className="text-lg font-black text-slate-900 leading-tight">Smart Audit Assistant (Fresher Mode Active)</h4>
              <p className="text-xs font-semibold text-slate-500 italic leading-relaxed">
                "Audit Pro-tip: Ensure the molecular tag concentration matches the batch volume. Inconsistencies detected at Step 09 (Verification) can invalidate carbon credits."
              </p>
           </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Input Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[48px] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-[#006400]/5 flex items-center justify-center text-[#006400]">
                      <Plus className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900">New Capture Event</h2>
                  </div>
                  <Badge className="bg-slate-100 text-slate-400 font-black uppercase text-[8px] tracking-[0.2em] px-3 py-1 rounded-full border-none">Step 01: Ingestion</Badge>
               </div>
               
               <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4 group">
                     <div className="flex items-center justify-between px-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capture Mass (tCO₂)</label>
                        <Tooltip content={SMART_HINTS.mass} />
                     </div>
                     <div className="relative">
                        <input
                          type="number"
                          className="w-full h-16 bg-slate-50 border-none rounded-2xl px-6 font-black text-2xl outline-none focus:ring-4 focus:ring-[#006400]/5 transition-all text-slate-900"
                          value={formData.mass}
                          onChange={(e) => setFormData({ ...formData, mass: e.target.value })}
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">TONNES</span>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex items-center justify-between px-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gas Purity (%)</label>
                        <Tooltip content={SMART_HINTS.purity} />
                     </div>
                     <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          className="w-full h-16 bg-slate-50 border-none rounded-2xl px-6 font-black text-2xl outline-none focus:ring-4 focus:ring-[#006400]/5 transition-all text-slate-900"
                          value={formData.purity}
                          onChange={(e) => setFormData({ ...formData, purity: e.target.value })}
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">%</span>
                     </div>
                  </div>
               </div>

               <div className="mt-10 pt-10 border-t border-slate-50 grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">System Pressure</label>
                     <div className="flex items-center gap-4">
                        <div className="bg-[#006400]/5 p-4 rounded-2xl text-[#006400]"><Thermometer className="h-5 w-5" /></div>
                        <input
                          type="number"
                          className="w-full h-14 bg-slate-50 border-none rounded-xl px-4 font-bold outline-none"
                          value={formData.pressure}
                        />
                        <span className="text-xs font-black text-slate-400">BAR</span>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Gas Temperature</label>
                     <div className="flex items-center gap-4">
                        <div className="bg-[#006400]/5 p-4 rounded-2xl text-[#006400]"><Droplets className="h-5 w-5" /></div>
                        <input
                          type="number"
                          className="w-full h-14 bg-slate-50 border-none rounded-xl px-4 font-bold outline-none"
                          value={formData.temp}
                        />
                        <span className="text-xs font-black text-slate-400">°C</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Marker Selection */}
            <div className="bg-white rounded-[48px] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100">
               <div className="flex items-center gap-4 mb-8">
                  <div className="h-10 w-10 rounded-xl bg-[#006400]/5 flex items-center justify-center text-[#006400]">
                    <Beaker className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900">Chemical Marker Injection</h2>
               </div>

               <div className="grid gap-4">
                  {MARKERS.map((marker) => (
                    <button
                      key={marker.id}
                      onClick={() => setFormData({ ...formData, markerId: marker.id })}
                      className={cn(
                        "p-6 rounded-[32px] border-2 text-left transition-all flex items-center justify-between",
                        formData.markerId === marker.id ? "border-[#006400] bg-[#006400]/5" : "border-slate-50 hover:border-slate-200"
                      )}
                    >
                       <div className="flex items-center gap-4">
                          <div className={cn("h-4 w-4 rounded-full", formData.markerId === marker.id ? "bg-[#006400]" : "bg-slate-200")}></div>
                          <div>
                            <p className="font-black text-slate-900">{marker.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{marker.id}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-xs font-black text-slate-900">{marker.purity}</p>
                          <p className="text-[10px] font-black text-[#006400] uppercase tracking-tighter">Purity Check</p>
                       </div>
                    </button>
                  ))}
               </div>
            </div>
          </div>

          {/* Sidebar Accounting Stats */}
          <div className="space-y-6">
             <div className="bg-[#0f172a] rounded-[48px] p-8 text-white space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                   <Shield className="h-32 w-32" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">Certificate Draft</p>
                <div className="space-y-1">
                   <h3 className="text-4xl font-black tracking-tight">{formData.mass || "0.00"}</h3>
                   <p className="text-xs font-black text-blue-400 uppercase">Gross Tonnes Captured</p>
                </div>
                
                <div className="pt-6 border-t border-white/10 space-y-4">
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-bold">Uncertainty (σ)</span>
                      <span className="text-red-400 font-black">±{uncertainty.toFixed(3)} t</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-bold">Provenance Grade</span>
                      <span className="text-green-400 font-black">AAA-PRIME</span>
                   </div>
                </div>

                <div className="pt-8">
                   <button className="w-full h-16 bg-[#00FF00] text-[#006400] rounded-[24px] font-black flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all">
                      <Save className="h-5 w-5" />
                      Sign Batch
                   </button>
                </div>
             </div>

             <div className="bg-white rounded-[40px] p-8 shadow-xl border border-slate-100 space-y-6">
                <div className="flex items-center gap-3">
                   <Info className="h-4 w-4 text-[#006400]" />
                   <p className="text-xs font-black text-[#006400] uppercase tracking-widest">Scientific Guidance</p>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                   According to ISO 27914, all supercritical CO₂ batches exceeding 50 bar must be monitored for density fluctuations to maintain MRV fidelity.
                </p>
                <div className="pt-4 flex gap-2 overflow-x-auto pb-2">
                   {["ISO 14064", "Verra M001", "EU ETS"].map(tag => (
                     <span key={tag} className="flex-shrink-0 px-3 py-1 bg-slate-50 rounded-full text-[9px] font-black text-slate-400 border border-slate-100 uppercase tracking-tighter">{tag}</span>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}
