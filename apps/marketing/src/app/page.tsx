export default function Home() {
  return (
    <main className="min-h-screen selection:bg-[#006400]/30 selection:text-[#006400]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-[#006400] rounded-lg"></div>
            <span className="font-black text-xl tracking-tighter text-slate-900">C44DEV <span className="text-[#006400]">CO2ETRACK</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500 uppercase tracking-widest">
             <a href="#technology" className="hover:text-[#006400] transition-colors">Technology</a>
             <a href="#compliance" className="hover:text-[#006400] transition-colors">Compliance</a>
             <button className="h-11 px-6 bg-[#006400] text-white rounded-2xl shadow-xl shadow-[#006400]/20 hover:scale-105 transition-transform active:scale-95">
               Client Portal
             </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
             <div className="space-y-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#006400]/5 border border-[#006400]/10 rounded-full">
                  <span className="h-2 w-2 rounded-full bg-[#006400] animate-pulse"></span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#006400]">Geneva Headquarters • C44DEV SA</span>
                </div>
                <h1 className="text-7xl font-black text-slate-900 leading-[0.9] tracking-tighter">
                  Physical <br/>
                  <span className="text-[#006400]">Traceability</span> <br/>
                  for CCUS.
                </h1>
                <p className="text-xl text-slate-500 font-medium max-w-lg leading-relaxed">
                  The only platform using patented chemical markers to provide molecule-level traceability for captured CO₂ batches across multi-modal transport.
                </p>
                <div className="flex items-center gap-6">
                  <button className="h-16 px-10 bg-[#006400] text-white rounded-[24px] font-black shadow-2xl shadow-[#006400]/30 hover:translate-y-[-4px] transition-all">
                    Register Facility
                  </button>
                  <button className="h-16 px-10 border-2 border-slate-200 text-slate-900 rounded-[24px] font-black hover:bg-slate-50 transition-colors">
                    View Methodology
                  </button>
                </div>
             </div>
             
             <div className="relative">
                <div className="aspect-square rounded-[64px] molecular-gradient shadow-[0_40px_100px_-20px_rgba(0,100,0,0.3)] flex items-center justify-center overflow-hidden">
                   <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/p6.png')]"></div>
                   <div className="text-white text-center space-y-4">
                      <div className="text-8xl font-black">CO₂</div>
                      <div className="text-xs font-black uppercase tracking-[0.3em] opacity-60">Chemically Tagged Batch</div>
                   </div>
                </div>
                <div className="absolute -bottom-10 -right-10 p-8 ccus-glass rounded-[40px] shadow-2xl max-w-xs space-y-4">
                   <p className="text-xs font-black text-[#006400] uppercase">Live Pilot Status</p>
                   <p className="text-3xl font-black text-slate-900 leading-tight">50 Tonnes Verified</p>
                   <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#006400] w-[65%]"></div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="py-32 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">The Chemical Barcode</h2>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto">
            Our patented tracer technology allows emitters to link physical molecules to digital carbon removal credits without the risk of double-counting or blending theft.
          </p>
          
          <div className="grid md:grid-cols-3 gap-10 pt-20">
             {[
               { title: "Capture & Inject", desc: "Inject unique chemical markers in ppm concentrations at the point of capture." },
               { title: "Transport Tracking", desc: "Verifiable re-detection across truck, rail, barge, and pipeline networks." },
               { title: "Storage Assurance", desc: "Full molecule-to-credit linkage via ISO 27914 compliant MRV dashboards." }
             ].map((item, i) => (
               <div key={i} className="p-10 bg-white rounded-[40px] shadow-sm border border-slate-100 text-left space-y-4 group hover:shadow-2xl transition-all">
                  <div className="h-14 w-14 rounded-2xl bg-[#006400]/5 flex items-center justify-center font-black text-[#006400]">{i+1}</div>
                  <h3 className="text-xl font-black text-slate-900">{item.title}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
               <div className="h-6 w-6 bg-slate-900 rounded"></div>
               <span className="font-black tracking-tighter">C44DEV CO2ETRACK</span>
             </div>
             <p className="text-xs text-slate-400 font-medium">© 2026 C44DEV SA. Geneva, Switzerland.<br/>CCUS Physical-Digital Traceability.</p>
          </div>
          <div className="grid grid-cols-2 gap-20">
             <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-slate-400">Company</p>
                <ul className="text-sm font-bold text-slate-600 space-y-2">
                   <li>Methodology</li>
                   <li>Case Studies</li>
                   <li>Technical Specs</li>
                </ul>
             </div>
             <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-slate-400">Contact</p>
                <ul className="text-sm font-bold text-slate-600 space-y-2">
                   <li>Geneva Office</li>
                   <li>Email Portal</li>
                   <li>Auditor Login</li>
                </ul>
             </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
