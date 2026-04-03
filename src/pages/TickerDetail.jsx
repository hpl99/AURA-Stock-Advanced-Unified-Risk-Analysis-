import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const TickerDetail = () => {
  const { tickerId } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showSma, setShowSma] = useState(true);
  const [showVolatility, setShowVolatility] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  
  const storageKey = `notes_${tickerId}`;
  const [notes, setNotes] = useState('');

  const fetchMetrics = async (isBackgroundPoll = false) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/metrics/${tickerId}`);
      if (!response.ok) throw new Error('Failed to fetch ticker data');
      
      const json = await response.json();
      setData(json.rows);
      
      if (isBackgroundPoll) {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        toast.success(`Market Data Updated: ${timeStr}`);
      }
    } catch (err) {
      if (!isBackgroundPoll) setError(err.message);
      else toast.error('Background data sync failed');
    } finally {
      if (!isBackgroundPoll) setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchMetrics();
    
    setNotes(localStorage.getItem(`notes_${tickerId}`) || '');
    setSaveStatus('');
    
    const interval = setInterval(() => {
      fetchMetrics(true);
    }, 60000);
    
    return () => clearInterval(interval);
  }, [tickerId]);
  
  const handleSaveNotes = () => {
    localStorage.setItem(storageKey, notes);
    setSaveStatus('Strategy Saved!');
    setTimeout(() => setSaveStatus(''), 2500);
  };
  
  if (loading) {
    return <div className="spinner-container"><div className="spinner"></div></div>;
  }
  
  if (error) {
     return (
       <div className="glass-panel p-8 text-center mt-12 max-w-2xl mx-auto rounded-3xl border-neon-red/20 shadow-[0_0_30px_rgba(255,0,85,0.1)]">
         <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
         <h2 className="text-2xl font-bold text-red-500 mb-2">Error Loading {tickerId}</h2>
         <p className="text-gray-400 mb-8">{error}</p>
         <button 
           className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors font-medium text-gray-300"
           onClick={() => navigate('/')}
         >
           Return to Market Pulse
         </button>
       </div>
     );
  }

  const companyNames = { AAPL: 'Apple Inc.', TSLA: 'Tesla Inc.', AMZN: 'Amazon.com Inc.' };
  const companyName = companyNames[tickerId] || tickerId;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0a0a0a]/90 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl">
          <p className="text-xs text-gray-400 mb-3 pb-2 border-b border-white/10 font-medium">{label}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex justify-between gap-6 mb-1 text-sm font-bold" style={{ color: entry.color }}>
              <span className="opacity-90">{entry.name}:</span>
              <span>
                {entry.dataKey === 'volatility30' 
                  ? `${(entry.value * 100).toFixed(2)}%` 
                  : `$${entry.value.toFixed(2)}`}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.4 }}
    >
      <button 
        className="flex items-center gap-2 text-gray-400 hover:text-white font-medium mb-8 px-4 py-2 glass-panel rounded-xl text-sm w-fit transition-all hover:-translate-x-1"
        onClick={() => navigate('/')}
      >
        <ArrowLeft size={16} /> Back to Market Pulse
      </button>
      
      <div className="mb-6">
        <h1 className="text-5xl font-black text-gradient tracking-tight mb-2">{tickerId}</h1>
        <p className="text-lg text-gray-400 font-medium">{companyName}</p>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="glass-panel p-6 px-8 rounded-3xl flex justify-between items-center border border-white/5">
            <h3 className="font-bold text-gray-200">Metrics Display</h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={showSma} onChange={e => setShowSma(e.target.checked)} />
                  <div className={`w-11 h-6 rounded-full transition-colors ${showSma ? 'bg-neon-gold' : 'bg-white/10'}`}></div>
                  <div className={`absolute left-1 top-1 w-4 h-4 bg-[#0a0a0a] rounded-full transition-transform ${showSma ? 'translate-x-5' : ''}`}></div>
                </div>
                <span className="text-sm font-bold text-neon-gold group-hover:text-yellow-300 transition-colors">SMA 50</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={showVolatility} onChange={e => setShowVolatility(e.target.checked)} />
                  <div className={`w-11 h-6 rounded-full transition-colors ${showVolatility ? 'bg-neon-purple' : 'bg-white/10'}`}></div>
                  <div className={`absolute left-1 top-1 w-4 h-4 bg-[#0a0a0a] rounded-full transition-transform ${showVolatility ? 'translate-x-5' : ''}`}></div>
                </div>
                <span className="text-sm font-bold text-neon-purple group-hover:text-purple-400 transition-colors">Volatility</span>
              </label>
            </div>
          </div>
          
          <div className="glass-panel p-6 pr-8 rounded-3xl w-full border border-white/5">
            <ResponsiveContainer width="100%" height={500}>
              <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="#666" tick={{ fill: '#888', fontSize: 12 }} tickMargin={10} />
                <YAxis yAxisId="left" stroke="#666" tick={{ fill: '#888', fontSize: 12 }} domain={['auto', 'auto']} tickFormatter={value => `$${value}`} />
                <YAxis yAxisId="right" orientation="right" stroke="#666" tick={{ fill: '#888', fontSize: 12 }} domain={[0, 'auto']} tickFormatter={value => `${(value * 100).toFixed(0)}%`} />
                
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                
                <Line yAxisId="left" type="monotone" dataKey="close" stroke="#00e5ff" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#00e5ff', stroke: '#0a0a0a', strokeWidth: 2 }} name="Close USD" />
                
                {showSma && (
                  <Line yAxisId="left" type="monotone" dataKey="sma50" stroke="#ffbe0b" strokeDasharray="6 6" strokeWidth={2} dot={false} name="SMA 50" />
                )}
                
                {showVolatility && (
                  <Area yAxisId="right" type="monotone" dataKey="volatility30" fill="rgba(131, 56, 236, 0.15)" stroke="#8338ec" strokeWidth={2} name="Volatility" />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="glass-panel p-6 rounded-3xl border border-neon-cyan/20 relative overflow-hidden flex flex-col h-full min-h-[500px]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-neon-cyan/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
          
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              My Strategy Notes
            </h3>
            {saveStatus && <span className="text-xs font-bold text-neon-cyan animate-pulse">{saveStatus}</span>}
          </div>
          
          <textarea 
            className="flex-1 w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm leading-relaxed text-gray-200 resize-none focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 transition-all placeholder:text-gray-600 mb-6 relative z-10"
            value={notes} 
            onChange={e => setNotes(e.target.value)} 
            placeholder={`Enter your quantitative analysis and trigger hypotheses for ${tickerId}...\n\nExamples:\n- RSI divergence detected\n- Monitor closely near SMA support\n- Volatility expansion phase initiated`} 
          />
          
          <button 
            className="w-full bg-neon-cyan hover:bg-[#00cce6] text-[#0a0a0a] font-black uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 relative z-10"
            onClick={handleSaveNotes}
          >
            <Save size={18} /> Save Strategy
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TickerDetail;
