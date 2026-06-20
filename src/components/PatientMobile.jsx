import React from 'react';
import { Clock, HelpCircle } from 'lucide-react';


export default function PatientMobile({ queue, viewPatientId, setViewPatientId, getQueueMetrics }) {
  const activePatient = queue.find(p => p.id === viewPatientId && p.status === 'Waiting');
  const waitingList = queue.filter(p => p.status === 'Waiting');

  return (
    <div className="bg-slate-950 rounded-3xl border-4 border-slate-800 p-4 shadow-2xl relative transition-all duration-300">
      {/* Notch indicator */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-slate-800 rounded-b-xl z-20 flex items-center justify-center">
        <div className="w-10 h-1 bg-slate-950 rounded-full mb-1"></div>
      </div>

      <div className="bg-slate-950 pt-5 rounded-2xl overflow-hidden">
        {/* Sim Heading Selector */}
        <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Patient Smartphone Simulator</span>
          </div>
          
          <select 
            value={viewPatientId} onChange={(e) => setViewPatientId(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-[10px] text-slate-300 rounded-lg px-2 py-1 font-sans focus:outline-none"
          >
            {waitingList.map(p => (
              <option key={p.id} value={p.id}>Sim: #{p.token} {p.name}</option>
            ))}
            {waitingList.length === 0 && (
              <option value="">No simulated views</option>
            )}
          </select>
        </div>

        {activePatient ? (
          (() => {
            const { position, waitTime } = getQueueMetrics(activePatient.id);
            const tokensAhead = Math.max(0, position - 1);

            return (
              <div className="space-y-4">
                {/* Live personal token badge */}
                <div className="bg-gradient-to-r from-cyan-950/20 to-blue-950/15 border border-cyan-500/20 rounded-2xl p-4 text-center relative overflow-hidden shadow-inner">
                  <div className="absolute inset-0 bg-cyan-500/5 backdrop-blur-[2px]"></div>
                  <div className="relative z-10">
                    <span className="text-[9px] font-black tracking-widest text-cyan-400 uppercase">Your Personal Ticket</span>
                    <h4 className="text-3xl font-black text-slate-100 font-mono tracking-tight mt-1">#{activePatient.token}</h4>
                    <p className="text-xs font-black text-slate-200 mt-1">{activePatient.name}</p>
                    <p className="text-[9px] text-slate-500 font-mono mt-0.5">{activePatient.phone}</p>
                  </div>
                </div>

                {/* Telemetry tracking cards */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl text-center">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Tokens Ahead</span>
                    <span className="text-2xl font-black text-cyan-400 font-mono block mt-1">{tokensAhead}</span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">In waiting line</span>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl text-center">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Est. Wait</span>
                    <span className="text-2xl font-black text-emerald-400 font-mono block mt-1">~{waitTime}m</span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">Data-driven calculation</span>
                  </div>
                </div>

                {/* Auto Refresh Guardrail */}
                <div className="bg-slate-900/30 border border-slate-850 p-3 rounded-xl flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-200 block">Sub-second Auto-Update Active</span>
                    <p className="text-[9px] text-slate-500 mt-0.5 leading-relaxed">
                      Our database runs active live listeners. Do not refresh this page. Your rank and wait will automatically shrink in real-time.
                    </p>
                  </div>
                </div>

                {/* Patient Checklist route progress */}
                <div className="pt-2">
                  <span className="text-[9px] text-slate-500 block uppercase tracking-widest font-black text-center mb-2.5">Lobby Progress</span>
                  <div className="flex items-center justify-between text-xs max-w-[240px] mx-auto">
                    <div className="flex flex-col items-center">
                      <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-black flex items-center justify-center text-[9px] shadow-lg shadow-cyan-950/20">1</span>
                      <span className="text-[8px] text-cyan-400 mt-1 font-bold uppercase tracking-wide">Registered</span>
                    </div>
                    <div className="flex-1 h-[2px] bg-cyan-500 mx-1"></div>
                    <div className="flex flex-col items-center">
                      <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-black flex items-center justify-center text-[9px] shadow-lg shadow-cyan-950/20">2</span>
                      <span className="text-[8px] text-cyan-400 mt-1 font-bold uppercase tracking-wide">In Lobby</span>
                    </div>
                    <div className="flex-1 h-[2px] bg-slate-800 mx-1"></div>
                    <div className="flex flex-col items-center">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-slate-500 border border-slate-800 font-black flex items-center justify-center text-[9px]">3</span>
                      <span className="text-[8px] text-slate-500 mt-1 font-bold uppercase tracking-wide">Serving</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()
        ) : (
          <div className="text-center py-10 bg-slate-900/10 rounded-2xl border border-dashed border-slate-850">
            <HelpCircle className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-semibold">Select a Patient</p>
            <p className="text-[9px] text-slate-500 max-w-[180px] mx-auto mt-1">Use the dropdown to simulate any specific patient mobile screen live.</p>
          </div>
        )}
      </div>
    </div>
  );
}