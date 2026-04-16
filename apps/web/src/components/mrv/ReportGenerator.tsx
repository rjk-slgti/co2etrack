"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Download, FileText, Fingerprint, Globe, Info, Layout, Lock, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ReportGenerator() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-12">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-10 rounded-[48px] shadow-sm border border-slate-100">
           <div className="space-y-2">
              <div className="flex items-center gap-2">
                 <ShieldCheck className="h-5 w-5 text-[#006400]" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">GHG Protocol Compliant Report v4.0</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 leading-tight">Digital MRV <br/> <span className="text-[#006400]">Certificate Generator</span></h1>
           </div>
           <button 
             onClick={handleExport}
             disabled={isExporting}
             className="h-20 px-10 bg-[#006400] text-white rounded-[32px] font-black flex items-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-[#006400]/20"
           >
              {isExporting ? <span className="animate-spin h-5 w-5 border-2 border-white/20 border-t-white rounded-full"></span> : <Download className="h-6 w-6" />}
              {isExporting ? "Compiling Proofs..." : "Generate Final Certificate"}
           </button>
        </div>

        {/* Report Preview Surface */}
        <div className="bg-white rounded-[64px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col min-h-[1000px]">
           {/* Document Header */}
           <div className="p-16 border-b-8 border-[#006400] flex justify-between bg-slate-50/50">
              <div className="space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-slate-900 rounded-xl"></div>
                    <span className="font-black tracking-tighter text-xl">C44DEV <span className="text-[#006400]">CO2ETRACK</span></span>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Registry Hash</p>
                    <p className="text-sm font-mono text-slate-900">sha256:0xf4...a89</p>
                 </div>
              </div>
              <div className="text-right space-y-2">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Issuance Date</p>
                 <p className="text-lg font-black text-slate-900">April 16, 2026</p>
                 <Badge className="bg-emerald-100 text-emerald-700 font-bold border-none px-4 py-1">UNVERIFIED DRAFT</Badge>
              </div>
           </div>

           {/* Content Sections */}
           <div className="p-20 space-y-20">
              {/* Batch Identification */}
              <section className="space-y-8">
                 <h2 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-4">01. Batch Physical Provenance</h2>
                 <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-2">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Capture Facility</p>
                       <p className="text-base font-bold text-slate-900">Direct Air Capture Cluster GEN-01</p>
                       <p className="text-xs text-slate-400 italic">Geneva, Switzerland (46.2044° N, 6.1432° E)</p>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Storage Reservoir</p>
                       <p className="text-base font-bold text-slate-900">Northern Lights Subsea Well #7</p>
                       <p className="text-xs text-slate-400 italic">North Sea, Norway (ISO 27914 Compliant)</p>
                    </div>
                 </div>
              </section>

              {/* Scientific Verification Table */}
              <section className="space-y-8">
                 <h2 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-4">02. Quantified Removal Verification</h2>
                 <div className="rounded-[32px] border border-slate-100 overflow-hidden">
                    <table className="w-full text-left">
                       <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                             <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase">Parameter</th>
                             <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase">Value</th>
                             <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase">Confidence (k=2)</th>
                          </tr>
                       </thead>
                       <tbody className="text-sm font-medium text-slate-600">
                          <tr className="border-b border-slate-50">
                             <td className="px-8 py-6">Measured Gross CO2</td>
                             <td className="px-8 py-6 font-black text-slate-900 underline decoration-[#006400] decoration-2 underline-offset-4">50.24 t</td>
                             <td className="px-8 py-6">±0.25 t</td>
                          </tr>
                          <tr className="border-b border-slate-50">
                             <td className="px-8 py-6">Gas Purity (Weighted)</td>
                             <td className="px-8 py-6 font-black text-slate-900">99.98 %</td>
                             <td className="px-8 py-6">±0.01 %</td>
                          </tr>
                          <tr className="bg-[#006400]/5">
                             <td className="px-8 py-6 font-black text-[#006400]">Net Carbon Removal</td>
                             <td className="px-8 py-6 font-black text-[#006400] text-lg">50.12 tCO2e</td>
                             <td className="px-8 py-6 font-black text-[#006400]">P95 CONFIRMED</td>
                          </tr>
                       </tbody>
                    </table>
                 </div>
              </section>

              {/* Molecular Tagging Logs */}
              <section className="space-y-8">
                 <h2 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-4">03. Custody Chain Verification (Molecular)</h2>
                 <div className="grid grid-cols-3 gap-6">
                    {[
                       { site: "Point of Capture", status: "Injected", log: "MARKER-C13 detected @ 5.2ppm" },
                       { site: "Hub Rotterdam", status: "Verified", log: "Re-detection confirm @ 5.1ppm" },
                       { site: "Point of Injection", status: "Finalized", log: "Final proof match @ 5.1ppm" },
                    ].map((step, i) => (
                       <div key={i} className="p-6 rounded-[32px] bg-slate-50 border border-slate-100 space-y-4">
                          <div className="flex items-center justify-between">
                             <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{step.site}</p>
                             <CheckCircle2 className="h-4 w-4 text-[#006400]" />
                          </div>
                          <p className="text-xs font-medium text-slate-500 line-clamp-2">{step.log}</p>
                       </div>
                    ))}
                 </div>
              </section>

              {/* Auditor Attestation */}
              <section className="bg-slate-900 rounded-[48px] p-12 text-white flex justify-between items-center relative overflow-hidden">
                 <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/p6.png')]"></div>
                 <div className="space-y-4 relative z-10 max-w-md">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Auditor Attestation</p>
                    <p className="text-sm font-medium leading-relaxed opacity-80">
                       "I, acting as an independent verifier for C44DEV SA, certify that the batch specified herein has achieved the net removal status through molecular traceable evidence conforming to ISO 14064."
                    </p>
                 </div>
                 <div className="space-y-6 text-center relative z-10">
                    <div className="h-20 w-48 border-b-2 border-white/20 mx-auto flex items-center justify-center italic text-xl opacity-60">Digital Signature</div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verra ID: 009-AUDIT-C</p>
                 </div>
              </section>
           </div>
        </div>
      </div>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset", className)}>
      {children}
    </span>
  );
}
