"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Factory, Globe, Shield, Truck, Landmark } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const STEPS = [
  { id: 1, title: "Organization", icon: Factory },
  { id: 2, title: "Boundary", icon: Shield },
  { id: 3, title: "Objectives", icon: Globe },
  { id: 4, title: "Review", icon: CheckCircle2 },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    legal_type: "Corporate",
    boundary: "Operational Control",
    objective: "Compliance (EU ETS)",
    scopes: ["Scope 1", "Scope 2"],
  });

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/p6.png')]">
      <div className="max-w-3xl w-full">
        {/* Progress Header */}
        <div className="flex justify-between items-center mb-12">
          {STEPS.map((step) => (
            <div key={step.id} className="flex flex-col items-center gap-2 relative">
              <div
                className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                  currentStep >= step.id
                    ? "bg-[#006400] text-white shadow-xl shadow-[#006400]/20"
                    : "bg-white text-slate-300 border border-slate-200"
                )}
              >
                <step.icon className="h-5 w-5" />
              </div>
              <span
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest",
                  currentStep >= step.id ? "text-[#006400]" : "text-slate-400"
                )}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>

        {/* Wizard Card */}
        <div className="bg-white rounded-[48px] p-12 shadow-[0_32px_120px_-20px_rgba(0,100,0,0.08)] border border-slate-100 min-h-[500px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {currentStep === 1 && (
                <div className="space-y-6 text-center lg:text-left">
                  <div className="space-y-2">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                      Organizational <br/> Identity.
                    </h2>
                    <p className="text-slate-500 font-medium">Standardize your legal identity for the CCUS registry.</p>
                  </div>
                  <div className="space-y-4 pt-4">
                    <input
                      type="text"
                      placeholder="Organization Legal Name"
                      className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 focus:border-[#006400] outline-none transition-all font-bold text-lg"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      {["Corporate", "Government", "NGO", "Asset Manager"].map((type) => (
                        <button
                          key={type}
                          onClick={() => setFormData({ ...formData, legal_type: type })}
                          className={cn(
                            "h-16 rounded-2xl border-2 font-black transition-all",
                            formData.legal_type === type
                              ? "border-[#006400] bg-[#006400]/5 text-[#006400]"
                              : "border-slate-50 text-slate-400 hover:border-slate-200"
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2 text-center lg:text-left">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                      Operational <br/> Boundary.
                    </h2>
                    <p className="text-slate-500 font-medium">Defined by ISO 14064-1 consolidation logic.</p>
                  </div>
                  <div className="grid gap-4 pt-4">
                    {[
                      { id: "Operational Control", title: "Operational Control", desc: "Most common for compliance. Includes all facilities managed by you." },
                      { id: "Equity Share", title: "Equity Share", desc: "Calculates emissions according to your % ownership stake." },
                      { id: "Financial Control", title: "Financial Control", desc: "Based on financial reporting consolidation standards." }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setFormData({ ...formData, boundary: opt.id })}
                        className={cn(
                          "p-6 rounded-[32px] border-2 text-left transition-all flex items-start gap-4",
                          formData.boundary === opt.id
                            ? "border-[#006400] bg-[#006400]/5"
                            : "border-slate-50 hover:border-slate-200"
                        )}
                      >
                        <div className={cn("h-6 w-6 rounded-full border-2 mt-1", formData.boundary === opt.id ? "bg-[#006400] border-[#006400]" : "border-slate-200")}></div>
                        <div>
                          <p className={cn("font-black", formData.boundary === opt.id ? "text-[#006400]" : "text-slate-900")}>{opt.title}</p>
                          <p className="text-xs text-slate-500 font-medium mt-1">{opt.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-2 text-center lg:text-left">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                      Accounting <br/> Objectives.
                    </h2>
                    <p className="text-slate-500 font-medium">Select the primary regulatory framework.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    {[
                      { id: "Compliance (EU ETS)", icon: Landmark },
                      { id: "Voluntary (Verra)", icon: Shield },
                      { id: "Net-Zero Internal", icon: Globe },
                      { id: "MRV Proof-only", icon: Truck },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setFormData({ ...formData, objective: opt.id })}
                        className={cn(
                          "p-8 rounded-[40px] border-2 flex flex-col items-center gap-4 transition-all text-center",
                          formData.objective === opt.id
                            ? "border-[#006400] bg-[#006400]/5 text-[#006400]"
                            : "border-slate-50 text-slate-400 hover:border-slate-200"
                        )}
                      >
                        <opt.icon className="h-8 w-8" />
                        <span className="font-black text-xs uppercase tracking-widest">{opt.id}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {currentStep === 4 && (
                <div className="space-y-6 text-center">
                  <div className="h-24 w-24 bg-[#006400]/10 rounded-[32px] flex items-center justify-center mx-auto text-[#006400]">
                    <Shield className="h-10 w-10" />
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">Ready for Deployment.</h2>
                  <div className="bg-slate-50 p-6 rounded-[32px] text-left space-y-3 font-bold text-sm">
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                       <span className="text-slate-400 uppercase tracking-widest text-[10px]">Registry ID</span>
                       <span className="text-slate-900">{formData.name || "UNNAMED_ORG"}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                       <span className="text-slate-400 uppercase tracking-widest text-[10px]">Methodology</span>
                       <span className="text-slate-900">{formData.boundary}</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-slate-400 uppercase tracking-widest text-[10px]">Accounting Goal</span>
                       <span className="text-[#006400]">{formData.objective}</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <footer className="pt-12 flex justify-between items-center border-t border-slate-50">
            <button
              disabled={currentStep === 1}
              onClick={prevStep}
              className="text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-[#006400] transition-colors disabled:opacity-0"
            >
              Back
            </button>
            <div className="flex gap-4">
               {currentStep < 4 ? (
                 <button
                   onClick={nextStep}
                   className="h-14 px-10 bg-[#006400] text-white rounded-2xl font-black shadow-lg shadow-[#006400]/20 hover:scale-105 transition-all"
                 >
                   Continue
                 </button>
               ) : (
                 <button
                   className="h-14 px-10 bg-[#006400] text-white rounded-2xl font-black shadow-lg shadow-[#006400]/20 hover:scale-105 transition-all"
                 >
                   Launch Dashboard
                 </button>
               )}
            </div>
          </footer>
        </div>
        
        <p className="mt-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
          Regulator-Defensible Onboarding Portal • Verra M001 Certified
        </p>
      </div>
    </main>
  );
}
