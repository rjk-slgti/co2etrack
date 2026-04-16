"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Box, Droplets, MapPin, Shield, Truck, Wind, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NODES = [
  { id: "capture", label: "Point of Capture", icon: Wind, color: "#006400" },
  { id: "transit", label: "Multi-modal Transit", icon: Truck, color: "#0f172a" },
  { id: "storage", label: "Geological Storage", icon: MapPin, color: "#008080" },
];

export default function MonitoringDashboard() {
  const [activeStep, setActiveStep] = useState(0);
  const [sensors, setSensors] = useState({
    pressure: 74.2,
    temp: 24.8,
    purity: 99.98,
  });

  // Simulate real-time sensor fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setSensors(prev => ({
        pressure: +(prev.pressure + (Math.random() * 0.4 - 0.2)).toFixed(1),
        temp: +(prev.temp + (Math.random() * 0.2 - 0.1)).toFixed(1),
        purity: +(prev.purity + (Math.random() * 0.02 - 0.01)).toFixed(2),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#006400]/5 border border-[#006400]/10 rounded-full w-fit">
            <span className="h-2 w-2 rounded-full bg-[#006400] animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#006400]">Real-Time Custody Sync Active</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Custody Transfer <span className="text-[#006400]">Live Map</span></h1>
        </div>
        <div className="flex gap-4">
           {["GEN-C44", "ROT-T12", "ST-09"].map(id => (
             <div key={id} className="h-12 px-4 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center gap-3">
                <Shield className="h-4 w-4 text-slate-300" />
                <span className="text-xs font-black text-slate-500 uppercase">{id}</span>
             </div>
           ))}
        </div>
      </div>

      {/* Main Flow Logic */}
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Left: Batch Specs */}
        <div className="space-y-6">
           <div className="bg-white rounded-[40px] p-8 shadow-xl border border-slate-100 space-y-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Batch</p>
              <div className="space-y-1">
                 <h3 className="text-2xl font-black text-slate-900 leading-tight">BATCH-2026-09A</h3>
                 <p className="text-xs font-bold text-[#006400] uppercase tracking-tighter">Verified Molecule Grade: AAA</p>
              </div>
              <div className="pt-6 border-t border-slate-50 space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase">Mass</span>
                    <span className="text-sm font-black text-slate-900 tracking-tight">50.24 t</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase">Purity</span>
                    <span className="text-sm font-black text-slate-900 tracking-tight">{sensors.purity}%</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase">Marker ID</span>
                    <span className="text-sm font-black text-blue-600 tracking-tight">MARKER-C13</span>
                 </div>
              </div>
           </div>

           <div className="ccus-glass rounded-[40px] p-8 space-y-6">
              <div className="flex items-center gap-3">
                 <Zap className="h-4 w-4 text-[#006400]" />
                 <p className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">Anomalies</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                 <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                 <p className="text-[10px] font-black text-emerald-700 uppercase">Zero Drift Detected</p>
              </div>
           </div>
        </div>

        {/* Center: Live Map Rendering */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-[#0f172a] rounded-[64px] p-16 relative overflow-hidden min-h-[500px] flex items-center justify-center">
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/grid.png')]"></div>
            
            {/* Flow Path Line */}
            <div className="absolute h-1 w-[60%] bg-white/10 left-[20%] z-0"></div>

            {/* Nodes */}
            <div className="relative z-10 w-full flex justify-between items-center max-w-4xl">
              {NODES.map((node, i) => (
                <div key={node.id} className="flex flex-col items-center gap-6 relative group">
                  <motion.div 
                    animate={{ scale: activeStep === i ? 1.1 : 1 }}
                    className={cn(
                      "h-24 w-24 rounded-[32px] flex items-center justify-center border-4 transition-all relative z-10 shadow-2xl",
                      activeStep >= i ? "bg-white border-[#00FF00] shadow-[#00FF00]/10" : "bg-slate-800 border-slate-700"
                    )}
                  >
                    <node.icon className={cn("h-8 w-8", activeStep >= i ? "text-[#006400]" : "text-slate-500")} />
                  </motion.div>
                  <div className="text-center space-y-1">
                    <p className={cn("text-[10px] font-black uppercase tracking-widest", activeStep >= i ? "text-white" : "text-slate-600")}>{node.label}</p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Station: LX-0{i+1}</p>
                  </div>

                  {i < NODES.length - 1 && (
                    <div className="absolute left-[120%] top-1/2 -translate-y-1/2 flex items-center gap-2">
                       <ArrowRight className="h-4 w-4 text-white/20" />
                    </div>
                  )}

                  {/* Ripple Effect for active node */}
                  {activeStep === i && (
                    <motion.div
                       layoutId="ripple"
                       initial={{ scale: 0.8, opacity: 0 }}
                       animate={{ scale: 1.5, opacity: 0.2 }}
                       transition={{ repeat: Infinity, duration: 2 }}
                       className="absolute h-24 w-24 rounded-[32px] bg-[#00FF00] -z-1"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Molecule Visualization (Floating Atoms) */}
            <AnimatePresence>
               {[...Array(5)].map((_, i) => (
                 <motion.div
                   key={i}
                   initial={{ x: "-50%", y: "-50%", opacity: 0 }}
                   animate={{ 
                      x: `${20 + (activeStep * 30) + (Math.random() * 5)}%`, 
                      y: `${45 + (Math.random() * 10)}%`, 
                      opacity: 0.4 
                   }}
                   className="absolute h-2 w-2 rounded-full bg-[#00FF00] blur-[2px]"
                   transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                 />
               ))}
            </AnimatePresence>

            {/* Controls */}
            <div className="absolute bottom-10 left-10 flex gap-4">
               <button 
                 onClick={() => setActiveStep(s => Math.max(0, s - 1))}
                 className="h-12 w-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/5 transition-colors"
               >
                 <ArrowRight className="h-4 w-4 rotate-180 text-white" />
               </button>
               <button 
                 onClick={() => setActiveStep(s => Math.min(NODES.length - 1, s + 1))}
                 className="h-12 w-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/5 transition-colors"
               >
                 <ArrowRight className="h-4 w-4 text-white" />
               </button>
            </div>
          </div>

          {/* Bottom Sensor Bar */}
          <div className="grid md:grid-cols-3 gap-6">
             {[
               { label: "Pipeline Pressure", val: sensors.pressure, unit: "BAR", icon: Wind },
               { label: "Temperature", val: sensors.temp, unit: "°C", icon: Droplets },
               { label: "Molecular Fidelity", val: 99.9, unit: "%", icon: Shield },
             ].map((s, i) => (
               <div key={i} className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{s.label}</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tighter">{s.val} <span className="text-xs text-slate-400 font-black">{s.unit}</span></p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-[#006400]/5 flex items-center justify-center text-[#006400]">
                    <s.icon className="h-5 w-5" />
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
