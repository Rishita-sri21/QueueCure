import React, { useState } from 'react';
import { Search, History, User, Calendar, Clock } from 'lucide-react';

export default function SmartSearch({ patients, history }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredActive = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.phone.includes(searchTerm)
  );

  const filteredHistory = history.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    h.phone.includes(searchTerm)
  );

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl">
      <div className="relative mb-8">
        <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
        <input 
          type="text" 
          placeholder="Search by name or phone..." 
          className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Active Patients */}
        <section>
          <h3 className="text-xs font-black text-cyan-400 mb-4 flex items-center gap-2">
            <User className="w-4 h-4" /> IN CLINIC ({filteredActive.length})
          </h3>
          <div className="space-y-2">
            {filteredActive.map(p => (
              <div key={p.id} className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex justify-between">
                <div><p className="text-sm font-bold">{p.name}</p><p className="text-[10px] text-slate-500">{p.phone}</p></div>
                <span className="text-[10px] text-cyan-400 uppercase font-bold">{p.status}</span>
              </div>
            ))}
          </div>
        </section>

        {/* History Patients */}
        <section>
          <h3 className="text-xs font-black text-amber-500 mb-4 flex items-center gap-2">
            <History className="w-4 h-4" /> PAST VISITS ({filteredHistory.length})
          </h3>
          <div className="space-y-2">
            {filteredHistory.length > 0 ? filteredHistory.map((h, i) => (
              <div key={i} className="p-3 bg-slate-900/50 border border-slate-800/50 rounded-lg">
                <p className="text-sm font-bold text-slate-300">{h.name}</p>
                <div className="flex justify-between mt-1">
                  <p className="text-[10px] text-slate-500">{h.phone}</p>
                  <p className="text-[10px] text-slate-600 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(h.visitedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            )) : <p className="text-[10px] text-slate-700 italic">No historical records found.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}