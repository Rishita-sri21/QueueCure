import React, { useState, useEffect } from 'react';
import { HeartPulse, Volume2, Sparkles, Monitor, Phone, Shield, Database, Wifi, WifiOff, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReceptionistConsole from './components/ReceptionistConsole';
import LobbyTV from './components/LobbyTV';
import PatientMobile from './components/PatientMobile';
import ArchitectureSheet from './components/ArchitectureSheet';
import { playChime, announcePatientCall } from './utils/audio';
import SmartSearch from './components/SmartSearch';

export default function App() {
  // 💾 local Storage Initial Fallback Data
  const [queue, setQueue] = useState(() => {
    const saved = localStorage.getItem('qc_enterprise_queue');
    return saved ? JSON.parse(saved) : [
      { id: '1', token: 101, name: 'Aarav Mehta', phone: '9876543210', status: 'Waiting', severity: 'Routine', joinedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
      { id: '2', token: 102, name: 'Priya Sharma', phone: '9123456789', status: 'Waiting', severity: 'Urgent', joinedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
      { id: '3', token: 103, name: 'Amit Patel', phone: '8765432109', status: 'Waiting', severity: 'Emergency', joinedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
      { id: '4', token: 104, name: 'Sneha Reddy', phone: '7654321098', status: 'Waiting', severity: 'Routine', joinedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() }
    ];
  });

  const [completedConsultations, setCompletedConsultations] = useState(() => {
    const saved = localStorage.getItem('qc_enterprise_completed');
    return saved ? JSON.parse(saved) : [
      { id: 'c1', token: 99, name: 'Rajesh Kumar', duration: 12, completedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
      { id: 'c2', token: 100, name: 'Sunita Devi', duration: 8, completedAt: new Date(Date.now() - 50 * 60 * 1000).toISOString() }
    ];
  });

  // PERSISTENT HISTORY STATE
  const [visitHistory, setVisitHistory] = useState(() => {
    const saved = localStorage.getItem('qc_enterprise_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [nextTokenSeed, setNextTokenSeed] = useState(() => {
    const saved = localStorage.getItem('qc_enterprise_seed');
    return saved ? parseInt(saved, 10) : 105;
  });

  const [dbMode, setDbMode] = useState('LOCAL_CACHE'); 
  const [backendURL] = useState('http://localhost:5000'); 

  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [severity, setSeverity] = useState('Routine'); 
  const [avgConfigTime, setAvgConfigTime] = useState(10);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('split');
  const [viewPatientId, setViewPatientId] = useState('1');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    localStorage.setItem('qc_enterprise_history', JSON.stringify(visitHistory));
  }, [visitHistory]);

  useEffect(() => {
    const checkServerConnection = async () => {
      try {
        const response = await fetch(`${backendURL}/api/queue`);
        if (response.ok) {
          const data = await response.json();
          setQueue(data);
          setDbMode('MONGO_LIVE');
          triggerToast("Connected to live MongoDB Cluster!");
          const analyticsResponse = await fetch(`${backendURL}/api/queue/analytics`);
          if (analyticsResponse.ok) {
            const analytics = await analyticsResponse.json();
            if (analytics.avgDuration) setAvgConfigTime(analytics.avgDuration);
          }
        }
      } catch (err) {
        setDbMode('LOCAL_CACHE');
        console.log("Database offline. Defaulting to client-side caching storage engine.");
      }
    };
    checkServerConnection();
  }, [backendURL]);

  useEffect(() => {
    if (dbMode === 'LOCAL_CACHE') {
      localStorage.setItem('qc_enterprise_queue', JSON.stringify(queue));
    }
  }, [queue, dbMode]);

  useEffect(() => {
    if (dbMode === 'LOCAL_CACHE') {
      localStorage.setItem('qc_enterprise_completed', JSON.stringify(completedConsultations));
    }
  }, [completedConsultations, dbMode]);

  useEffect(() => {
    localStorage.setItem('qc_enterprise_seed', nextTokenSeed.toString());
  }, [nextTokenSeed]);

  useEffect(() => {
    const waitingList = queue.filter(p => p.status === 'Waiting');
    if (waitingList.length > 0 && !waitingList.some(p => p.id === viewPatientId)) {
      setViewPatientId(waitingList[0].id);
    }
  }, [queue, viewPatientId]);

  const triggerToast = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const computeActualAvgTime = () => {
    if (completedConsultations.length === 0) return avgConfigTime;
    const total = completedConsultations.reduce((sum, item) => sum + item.duration, 0);
    return Math.round((total / completedConsultations.length) * 10) / 10;
  };

  const actualAvgTime = computeActualAvgTime();
  const currentlyServing = queue.find(p => p.status === 'Serving');
  const totalWaitingCount = queue.filter(p => p.status === 'Waiting').length;

  const getQueueMetrics = (patientId) => {
    const waitingList = queue.filter(p => p.status === 'Waiting');
    const index = waitingList.findIndex(p => p.id === patientId);
    if (index === -1) {
      const isServing = queue.find(p => p.id === patientId && p.status === 'Serving');
      return isServing ? { position: 0, waitTime: 0 } : { position: -1, waitTime: -1 };
    }
    return { position: index + 1, waitTime: Math.max(0, index * actualAvgTime) };
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    if (!patientName.trim()) return;
    const payload = {
      name: patientName.trim(),
      phone: patientPhone.trim() || '9' + Math.floor(100000000 + Math.random() * 900000000),
      severity: severity
    };
    if (dbMode === 'MONGO_LIVE') {
      try {
        const response = await fetch(`${backendURL}/api/queue/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const registeredPatient = await response.json();
          const queueRes = await fetch(`${backendURL}/api/queue`);
          const freshQueue = await queueRes.json();
          setQueue(freshQueue);
          setNextTokenSeed(registeredPatient.token + 1);
          triggerToast(`Database Token #${registeredPatient.token} issued successfully!`);
        }
      } catch (err) { console.error("Backend registration failed: ", err); }
    } else {
      const newPatient = {
        id: Math.random().toString(36).substr(2, 9),
        token: nextTokenSeed,
        ...payload,
        status: 'Waiting',
        joinedAt: new Date().toISOString()
      };
      setQueue(prevQueue => {
        const updated = [...prevQueue, newPatient];
        return updated.sort((a, b) => {
          if (a.status === 'Serving') return -1;
          if (b.status === 'Serving') return 1;
          const weights = { 'Emergency': 3, 'Urgent': 2, 'Routine': 1 };
          return weights[b.severity] - weights[a.severity];
        });
      });
      setNextTokenSeed(prev => prev + 1);
      triggerToast(`Local Token #${nextTokenSeed} issued successfully!`);
    }
    setPatientName(''); setPatientPhone(''); setSeverity('Routine');
  };

  const handleQuickAdd = async (premadeName, customSeverity = 'Routine') => {
    const payload = { name: premadeName, phone: '98' + Math.floor(10000000 + Math.random() * 90000000), severity: customSeverity };
    if (dbMode === 'MONGO_LIVE') {
      try {
        const response = await fetch(`${backendURL}/api/queue/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const registered = await response.json();
          const queueRes = await fetch(`${backendURL}/api/queue`);
          const freshQueue = await queueRes.json();
          setQueue(freshQueue);
          setNextTokenSeed(registered.token + 1);
          triggerToast(`Database Token #${registered.token} issued for ${premadeName}`);
        }
      } catch (err) { console.error(err); }
    } else {
      const newPatient = { id: Math.random().toString(36).substr(2, 9), token: nextTokenSeed, ...payload, status: 'Waiting', joinedAt: new Date().toISOString() };
      setQueue(prev => {
        const updated = [...prev, newPatient];
        return updated.sort((a, b) => {
          if (a.status === 'Serving') return -1;
          if (b.status === 'Serving') return 1;
          const weights = { 'Emergency': 3, 'Urgent': 2, 'Routine': 1 };
          return weights[b.severity] - weights[a.severity];
        });
      });
      setNextTokenSeed(prev => prev + 1);
      triggerToast(`Local Token #${nextTokenSeed} issued for ${premadeName}`);
    }
  };

  const handleCallNext = async () => {
    if (dbMode === 'MONGO_LIVE') {
      try {
        const response = await fetch(`${backendURL}/api/queue/call-next`, { method: 'PATCH' });
        if (response.ok) {
          const resData = await response.json();
          const queueRes = await fetch(`${backendURL}/api/queue`);
          const freshQueue = await queueRes.json();
          setQueue(freshQueue);
          if (resData.currentlyServing) {
            triggerToast(`Token #${resData.currentlyServing.token} called to Chamber!`);
            playChime(soundEnabled);
            setTimeout(() => { announcePatientCall(soundEnabled, resData.currentlyServing.token, resData.currentlyServing.name); }, 800);
          } else { triggerToast("Operational queue cleared."); }
          const analyticsResponse = await fetch(`${backendURL}/api/queue/analytics`);
          if (analyticsResponse.ok) {
            const analytics = await analyticsResponse.json();
            if (analytics.avgDuration) setAvgConfigTime(analytics.avgDuration);
          }
        }
      } catch (err) { console.error(err); }
    } else {
      setQueue(prevQueue => {
        const updatedQueue = [...prevQueue];
        const currentServingIdx = updatedQueue.findIndex(p => p.status === 'Serving');
        let completedItem = null;
        if (currentServingIdx !== -1) {
          const servingPatient = updatedQueue[currentServingIdx];
          completedItem = { id: servingPatient.id, token: servingPatient.token, name: servingPatient.name, duration: Math.floor(Math.random() * 8) + 6, completedAt: new Date().toISOString() };
          // ADD TO HISTORY
          setVisitHistory(prev => [...prev, { ...servingPatient, visitedAt: new Date().toISOString() }]);
          updatedQueue.splice(currentServingIdx, 1);
        }
        const nextWaitingIdx = updatedQueue.findIndex(p => p.status === 'Waiting');
        if (nextWaitingIdx !== -1) {
          updatedQueue[nextWaitingIdx] = { ...updatedQueue[nextWaitingIdx], status: 'Serving', calledAt: new Date().toISOString() };
          triggerToast(`Token #${updatedQueue[nextWaitingIdx].token} called to Chamber!`);
          playChime(soundEnabled);
          setTimeout(() => { announcePatientCall(soundEnabled, updatedQueue[nextWaitingIdx].token, updatedQueue[nextWaitingIdx].name); }, 850);
        } else { triggerToast("Operational queue cleared."); }
        if (completedItem) { setCompletedConsultations(prev => [completedItem, ...prev]); }
        return updatedQueue;
      });
    }
  };

  const handleRemovePatient = (id, token, name) => {
    setQueue(prev => prev.filter(p => p.id !== id));
    triggerToast(`Token #${token} cancelled.`);
  };

  const handleSystemPurge = () => {
    if (window.confirm("Purge local queue session? This resets database models back to clinic defaults.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col antialiased">
      <div className="bg-slate-950 border-b border-slate-800/80 text-[11px] px-6 py-2.5 text-slate-400 font-medium flex justify-between items-center tracking-wide">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span> ENGINE: ACTIVE
          </span>
          <span className="text-slate-800">|</span>
          <span className="flex items-center gap-1 text-slate-400">
            CONNECTION: {dbMode === 'MONGO_LIVE' ? <span className="text-emerald-400 flex items-center gap-1 font-bold"><Wifi className="w-3.5 h-3.5" /> MONGO-LIVE</span> : <span className="text-amber-400 flex items-center gap-1 font-bold"><WifiOff className="w-3.5 h-3.5" /> LOCAL CACHE</span>}
          </span>
        </div>
        <button onClick={handleSystemPurge} className="text-slate-500 hover:text-rose-400 transition-colors text-[10px] uppercase font-black tracking-widest cursor-pointer">⚠️ Reset Local Database</button>
      </div>

      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 py-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400"><HeartPulse className="w-6 h-6 animate-pulse" /></div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 bg-clip-text text-transparent">QueueCure '26</span>
              <p className="text-xs text-slate-400 font-medium">Integrated Triage-Priority Queue Dashboard</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center bg-slate-900 border border-slate-800 p-1.5 rounded-xl gap-1">
            {[
              { id: 'split', icon: Sparkles, label: 'Dual Matrix Monitor' },
              { id: 'reception', icon: Monitor, label: 'Receptionist Desk' },
              { id: 'patient', icon: Phone, label: 'Lobby & Mobile' },
              { id: 'architecture', icon: Shield, label: 'Blueprint Sheet' },
              { id: 'search', icon: Search, label: 'Smart Search' }
            ].map((item) => (
              <motion.button 
                key={item.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(item.id)} 
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === item.id ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <item.icon className="w-3.5 h-3.5" /> {item.label}
              </motion.button>
            ))}
          </div>
          <button onClick={() => { setSoundEnabled(!soundEnabled); }} className={`p-2 rounded-lg border transition-all cursor-pointer ${soundEnabled ? 'border-cyan-500/30 text-cyan-400 bg-cyan-950/20' : 'border-slate-800 text-slate-500 hover:text-slate-300'}`}><Volume2 className="w-4 h-4" /></button>
        </div>
      </header>

      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 border border-cyan-500 text-slate-100 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border-l-4 border-l-cyan-400">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping animate-bounce"></span>
          <p className="text-xs font-bold tracking-wide text-cyan-100">{notification}</p>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'search' && (
              <div className="max-w-2xl mx-auto mt-10">
                <h2 className="text-2xl font-bold mb-6 text-center text-cyan-400">Smart Search</h2>
                <SmartSearch patients={queue} history={visitHistory} />
              </div>
            )}
            {activeTab === 'split' && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-7">
                  <ReceptionistConsole queue={queue} completedConsultations={completedConsultations} patientName={patientName} setPatientName={setPatientName} patientPhone={patientPhone} setPatientPhone={setPatientPhone} severity={severity} setSeverity={setSeverity} avgConfigTime={avgConfigTime} setAvgConfigTime={setAvgConfigTime} nextTokenSeed={nextTokenSeed} currentlyServing={currentlyServing} actualAvgTime={actualAvgTime} totalWaitingCount={totalWaitingCount} handleAddPatient={handleAddPatient} handleQuickAdd={handleQuickAdd} handleCallNext={handleCallNext} handleRemovePatient={handleRemovePatient} setViewPatientId={setViewPatientId} viewPatientId={viewPatientId} getQueueMetrics={getQueueMetrics} />
                </div>
                <div className="xl:col-span-5 grid grid-cols-1 gap-6">
                  <LobbyTV currentlyServing={currentlyServing} queue={queue} getQueueMetrics={getQueueMetrics} totalWaitingCount={totalWaitingCount} />
                  <PatientMobile queue={queue} viewPatientId={viewPatientId} setViewPatientId={setViewPatientId} getQueueMetrics={getQueueMetrics} />
                </div>
              </div>
            )}
            {activeTab === 'reception' && (
              <ReceptionistConsole queue={queue} completedConsultations={completedConsultations} patientName={patientName} setPatientName={setPatientName} patientPhone={patientPhone} setPatientPhone={setPatientPhone} severity={severity} setSeverity={setSeverity} avgConfigTime={avgConfigTime} setAvgConfigTime={setAvgConfigTime} nextTokenSeed={nextTokenSeed} currentlyServing={currentlyServing} actualAvgTime={actualAvgTime} totalWaitingCount={totalWaitingCount} handleAddPatient={handleAddPatient} handleQuickAdd={handleQuickAdd} handleCallNext={handleCallNext} handleRemovePatient={handleRemovePatient} setViewPatientId={setViewPatientId} viewPatientId={viewPatientId} getQueueMetrics={getQueueMetrics} />
            )}
            {activeTab === 'patient' && (
              <div className="max-w-2xl mx-auto space-y-6">
                <LobbyTV currentlyServing={currentlyServing} queue={queue} getQueueMetrics={getQueueMetrics} totalWaitingCount={totalWaitingCount} />
                <PatientMobile queue={queue} viewPatientId={viewPatientId} setViewPatientId={setViewPatientId} getQueueMetrics={getQueueMetrics} />
              </div>
            )}
            {activeTab === 'architecture' && <ArchitectureSheet />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
