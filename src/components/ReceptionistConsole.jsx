import React from 'react';
import { 
  UserPlus, Play, Clock, Sliders, Trash2, 
  ChevronRight, AlertCircle, Sparkles, Activity, Plus 
} from 'lucide-react';


export default function ReceptionistConsole({
  queue,
  completedConsultations,
  patientName,
  setPatientName,
  patientPhone,
  setPatientPhone,
  severity,
  setSeverity,
  avgConfigTime,
  setAvgConfigTime,
  nextTokenSeed,
  currentlyServing,
  actualAvgTime,
  totalWaitingCount,
  handleAddPatient,
  handleQuickAdd,
  handleCallNext,
  handleRemovePatient,
  setViewPatientId,
  viewPatientId,
  getQueueMetrics
}) {
  return (
    <div className="bg-slate-950 rounded-3xl border border-slate-800/80 p-6 shadow-2xl flex flex-col justify-between transition-all duration-300">
      <div>
        {/* Desk Header Badge */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-900 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.5)]"></div>
            <h2 className="font-extrabold text-sm tracking-wide text-slate-100 uppercase">Screen 1: Operational Desk Command</h2>
          </div>
          <span className="text-[10px] text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 px-2.5 py-1 rounded-full font-mono font-bold">FAST-TRACK DISPATCH</span>
        </div>

        {/* Real-Time Live Load Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/60 shadow-inner">
            <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">Doctor Velocity</span>
            <span className="text-xl font-black text-cyan-400 font-mono block mt-1">{actualAvgTime}m</span>
            <span className="text-[9px] text-slate-500 block mt-0.5">Moving average</span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/60 shadow-inner">
            <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">Active Queue</span>
            <span className="text-xl font-black text-emerald-400 font-mono block mt-1">{totalWaitingCount}</span>
            <span className="text-[9px] text-slate-500 block mt-0.5">Patients waiting</span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/60 shadow-inner">
            <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">Next Ticket</span>
            <span className="text-xl font-black text-purple-400 font-mono block mt-1">#{nextTokenSeed}</span>
            <span className="text-[9px] text-slate-500 block mt-0.5">Auto-assigned</span>
          </div>
        </div>

        {/* Dynamic Under-10-Second Quick Admission Form */}
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5 mb-6">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-2 mb-4">
            <UserPlus className="w-4 h-4 text-cyan-400" />
            Instant Patient Entry (Fast Registration Desk)
          </span>
          <form onSubmit={handleAddPatient} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
              <div className="md:col-span-4">
                <label className="text-[10px] font-bold text-slate-500 block uppercase mb-1">Patient Name *</label>
                <input 
                  type="text" required value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition font-medium"
                />
              </div>
              <div className="md:col-span-3">
                <label className="text-[10px] font-bold text-slate-500 block uppercase mb-1">Mobile Number</label>
                <input 
                  type="tel" value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="e.g. 9876543210" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition font-mono"
                />
              </div>
              <div className="md:col-span-3">
                <label className="text-[10px] font-bold text-slate-500 block uppercase mb-1">Clinical Triage</label>
                <select 
                  value={severity} onChange={(e) => setSeverity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/50 transition font-semibold"
                >
                  <option value="Routine">🟢 Routine Checkup</option>
                  <option value="Urgent">🟡 Urgent Priority</option>
                  <option value="Emergency">🔴 Critical Emergency</option>
                </select>
              </div>
              <div className="md:col-span-2 flex items-end">
                <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-450 active:scale-95 text-slate-950 font-extrabold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1 cursor-pointer shadow-lg shadow-cyan-950/20">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Issue
                </button>
              </div>
            </div>
          </form>

          {/* Quick-add preset shortcuts */}
          <div className="mt-4 pt-4 border-t border-slate-950 flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Quick Presets:</span>
            <button type="button" onClick={() => handleQuickAdd('Gopal Das', 'Routine')} className="bg-slate-950 hover:bg-slate-850 border border-slate-800 px-2.5 py-1.5 rounded-lg text-[10px] text-slate-300 transition cursor-pointer">
              🟢 Gopal Das (Routine)
            </button>
            <button type="button" onClick={() => handleQuickAdd('Fatima Bi', 'Urgent')} className="bg-slate-950 hover:bg-slate-850 border border-slate-800 px-2.5 py-1.5 rounded-lg text-[10px] text-slate-300 transition cursor-pointer">
              🟡 Fatima Bi (Urgent)
            </button>
            <button type="button" onClick={() => handleQuickAdd('Karan Singh', 'Emergency')} className="bg-slate-950 hover:bg-slate-850 border border-slate-800 px-2.5 py-1.5 rounded-lg text-[10px] text-slate-300 transition cursor-pointer">
              🔴 Karan Singh (Critical)
            </button>
          </div>
        </div>

        {/* Doctor Cabin Interface Actions */}
        <div className="border border-slate-800/80 bg-slate-900/20 rounded-2xl p-5 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-xs font-bold text-slate-200 block">Doctor Consultation Hub</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Controls transitions and logs consultation telemetry data</span>
            </div>
            <button onClick={handleCallNext} className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-550 text-slate-950 font-black px-6 py-3 rounded-xl text-xs tracking-wider uppercase transition flex items-center gap-2 active:scale-95 shadow-lg shadow-emerald-950/40 cursor-pointer">
              <Play className="w-4 h-4 fill-current" /> Call Next Patient
            </button>
          </div>

          {currentlyServing ? (
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-[9px] text-emerald-400 font-extrabold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">IN DOCTOR'S CABIN</span>
                <h4 className="text-base font-bold text-white mt-2 flex items-center gap-2">
                  {currentlyServing.name}
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                    currentlyServing.severity === 'Emergency' ? 'bg-rose-500/15 text-rose-400' :
                    currentlyServing.severity === 'Urgent' ? 'bg-amber-500/15 text-amber-400' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {currentlyServing.severity}
                  </span>
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Token #{currentlyServing.token} • Serving Active</p>
              </div>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-semibold">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-400">Pace: <b className="text-slate-200 font-mono">{actualAvgTime}m</b></span>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-slate-800/80 rounded-xl py-6 px-4 text-center">
              <AlertCircle className="w-6 h-6 text-slate-500 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-semibold">Doctor Cabin is Empty</p>
              <p className="text-[10px] text-slate-500 mt-1">Ready for next triage check-in.</p>
            </div>
          )}
        </div>

        {/* Live Active Line List */}
        <div>
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Live Active Line Registry ({queue.length})</h3>
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
            {queue.length === 0 ? (
              <p className="text-xs text-slate-600 text-center py-6">All quiet. No patients checked-in.</p>
            ) : (
              queue.map((p) => {
                const { position, waitTime } = getQueueMetrics(p.id);
                return (
                  <div 
                    key={p.id} 
                    onClick={() => p.status === 'Waiting' && setViewPatientId(p.id)}
                    className={`group p-3 rounded-2xl transition duration-200 border flex items-center justify-between cursor-pointer ${
                      p.status === 'Serving' 
                        ? 'bg-emerald-950/15 border-emerald-500/30' 
                        : viewPatientId === p.id && p.status === 'Waiting'
                        ? 'bg-cyan-950/20 border-cyan-500/50' 
                        : 'bg-slate-900/30 border-slate-800 hover:border-slate-750'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-black text-xs ${
                        p.status === 'Serving' 
                          ? 'bg-emerald-500 text-slate-950' 
                          : 'bg-slate-850 text-slate-300 border border-slate-800'
                      }`}>
                        #{p.token}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition">{p.name}</span>
                          <span className={`text-[8px] font-black px-1.5 py-0.2 rounded border ${
                            p.severity === 'Emergency' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                            p.severity === 'Urgent' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-slate-800/40 text-slate-400 border-slate-700/30'
                          }`}>
                            {p.severity}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block font-mono">
                          {p.phone} • {p.status === 'Waiting' ? `Lobby` : 'In Consultation'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {p.status === 'Waiting' && (
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-mono">Lobby Rank: <b className="text-cyan-400">#{position}</b></span>
                          <span className="text-[10px] text-slate-500 block">Est: <b className="text-slate-300">{waitTime}m</b></span>
                        </div>
                      )}
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePatient(p.id, p.token, p.name);
                        }}
                        className="text-slate-600 hover:text-red-400 p-1.5 rounded transition"
                        title="Remove patient"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Manual Config Speed Tuner */}
      <div className="mt-6 pt-4 border-t border-slate-900">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/30 p-3 rounded-2xl border border-slate-800/80">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-xs font-bold text-slate-300 block">Doctor Base Velocity</span>
              <span className="text-[10px] text-slate-500 block">Starting fallback speed</span>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
            <input 
              type="range" min="5" max="30" value={avgConfigTime}
              onChange={(e) => setAvgConfigTime(parseInt(e.target.value))}
              className="accent-cyan-500 cursor-pointer w-24 h-1 bg-slate-800 rounded-lg appearance-none"
            />
            <span className="text-xs font-mono font-bold text-cyan-400">{avgConfigTime} min</span>
          </div>
        </div>
      </div>
    </div>
  );
}