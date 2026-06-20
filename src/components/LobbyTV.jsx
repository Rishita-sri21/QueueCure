import React from 'react';
import { Tv } from 'lucide-react';


export default function LobbyTV({ currentlyServing, queue, getQueueMetrics, totalWaitingCount }) {
  const upcomingLine = queue.filter(p => p.status === 'Waiting');

  return (
    <div className="bg-slate-950 border-4 border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[300px] transition-all duration-300">
      {/* Glare effect */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-600 to-transparent opacity-30"></div>
      
      <div>
        {/* Lobby Display Title */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-900 mb-5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></span>
            <span className="text-xs font-extrabold tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
              <Tv className="w-4 h-4 text-slate-400" /> Lobby Broadcast TV
            </span>
          </div>
          <span className="text-[9px] bg-slate-900 text-slate-400 border border-slate-800 px-2.5 py-0.5 rounded-full font-mono font-semibold">FEED_OK</span>
        </div>

        {/* Large Primary serving dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-900/50 border border-slate-850 p-5 rounded-2xl shadow-inner relative overflow-hidden">
          {currentlyServing && currentlyServing.severity === 'Emergency' && (
            <div className="absolute inset-x-0 top-0 h-[3px] bg-rose-500 shadow-[0_1px_8px_#f43f5e]"></div>
          )}
          
          <div className="md:col-span-5 text-center md:text-left">
            <span className="text-[10px] text-emerald-400 font-extrabold tracking-widest block mb-1">NOW SERVING</span>
            <div className={`inline-block font-mono font-black text-4xl px-5 py-2 rounded-2xl shadow-lg ${
              currentlyServing?.severity === 'Emergency' 
                ? 'bg-rose-500 text-slate-950 shadow-rose-950/20' 
                : 'bg-emerald-500 text-slate-950 shadow-emerald-950/20'
            }`}>
              {currentlyServing ? `#${currentlyServing.token}` : '---'}
            </div>
          </div>
          
          <div className="md:col-span-7 text-center md:text-left">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Patient Name</span>
            <h3 className="text-xl font-black text-slate-100 truncate mt-1 flex items-center justify-center md:justify-start gap-2">
              {currentlyServing ? currentlyServing.name : 'Chamber is Vacant'}
              {currentlyServing && (
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
                  currentlyServing.severity === 'Emergency' ? 'bg-rose-500/15 text-rose-400' :
                  currentlyServing.severity === 'Urgent' ? 'bg-amber-500/15 text-amber-400' :
                  'bg-slate-800 text-slate-500'
                }`}>
                  {currentlyServing.severity}
                </span>
              )}
            </h3>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              {currentlyServing ? 'Please enter Doctor Consultation Chamber' : 'Doctor ready to receive'}
            </p>
          </div>
        </div>
      </div>

      {/* Lobby Queue Preview Footer */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">UPCOMING PATIENT LINE</span>
          <span className="text-[10px] text-slate-500 font-bold">{totalWaitingCount} waiting</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {upcomingLine.slice(0, 3).map((p) => {
            const { waitTime } = getQueueMetrics(p.id);
            return (
              <div key={p.id} className="bg-slate-900 border border-slate-850 p-3 rounded-xl text-center relative overflow-hidden">
                {p.severity === 'Emergency' && (
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-rose-500"></div>
                )}
                <span className="text-xs font-black text-cyan-400 font-mono block">Token #{p.token}</span>
                <span className="text-[10px] text-slate-200 block truncate mt-1 font-bold">{p.name}</span>
                <span className="text-[9px] text-slate-500 font-mono block mt-1">~{waitTime}m wait</span>
              </div>
            );
          })}
          {totalWaitingCount === 0 && (
            <div className="col-span-3 text-center py-5 bg-slate-900/20 rounded-xl border border-dashed border-slate-850 text-slate-600 text-xs font-bold">
              No patients checked-in to wait-line.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}