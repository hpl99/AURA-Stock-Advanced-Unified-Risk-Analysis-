import React, { useState, useEffect, useMemo, useRef, memo } from 'react';
import { 
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Activity, Apple, Car, Package, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMarketStream } from '../hooks/useMarketStream';

// Helper component for animating price differences
const PriceCell = ({ price }) => {
  const [flash, setFlash] = useState(null);
  const prevPrice = useRef(price);

  useEffect(() => {
    if (price !== prevPrice.current && prevPrice.current !== undefined) {
      if (price > prevPrice.current) {
         setFlash('up');
      } else {
         setFlash('down');
      }
      prevPrice.current = price;
      
      const timer = setTimeout(() => setFlash(null), 800);
      return () => clearTimeout(timer);
    }
  }, [price]);

  return (
    <motion.div
      animate={{
        backgroundColor: flash === 'up' ? 'rgba(34, 197, 94, 0.2)' : flash === 'down' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
        color: flash === 'up' ? '#4ade80' : flash === 'down' ? '#f87171' : '#e5e7eb'
      }}
      transition={{ duration: 0.4 }}
      className="px-3 py-1 -ml-3 rounded-lg font-mono font-bold w-fit"
    >
      ${price ? price.toFixed(2) : '---'}
    </motion.div>
  );
};

const HeaderTime = () => {
  const [time, setTime] = useState('');
  useEffect(() => {
    const int = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(int);
  }, []);
  return (
    <div className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 px-4 py-2 rounded-xl font-mono glass-panel">
      <Clock size={16} className="text-neon-cyan" />
      {time || 'Loading...'}
    </div>
  );
};

const Home = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [visibleTickers, setVisibleTickers] = useState({
    AAPL: true, TSLA: true, AMZN: true
  });

  const { liveData, isConnected } = useMarketStream();

  const neonColors = { AAPL: '#00e5ff', TSLA: '#ffbe0b', AMZN: '#8338ec' };
  const iconMap = {
    AAPL: <Apple size={18} className="text-[#00e5ff]" />,
    TSLA: <Car size={18} className="text-[#ffbe0b]" />,
    AMZN: <Package size={18} className="text-[#8338ec]" />
  };

  // 1. Initial Historical Fetch
  useEffect(() => {
    const fetchHistorical = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/metrics/all');
        if (!response.ok) throw new Error('Data fetch failed');
        const json = await response.json();
        
        // Transform the 30-day rows to sliding chart window
        const tickers = Object.keys(json.data);
        if (tickers.length) {
          const firstRows = json.data[tickers[0]].rows;
          const initialChart = firstRows.map((row, idx) => {
            const pt = { date: row.date.slice(5) }; // Short date
            tickers.forEach(t => { pt[t] = json.data[t].rows[idx]?.close || 0; });
            return pt;
          });
          setChartData(initialChart);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistorical();
  }, []);

  // 2. Sliding Window Snapshot Logic (Every 2 Seconds)
  useEffect(() => {
    if (!isConnected || chartData.length === 0) return;
    
    const interval = setInterval(() => {
       setChartData(prev => {
          const nowStr = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const snapshot = { date: nowStr };
          
          ['AAPL', 'TSLA', 'AMZN'].forEach(t => {
             // Fallback to latest chart point if no live update arrived recently
             const lastVal = prev[prev.length - 1]?.[t];
             snapshot[t] = liveData[t]?.price || lastVal || 0;
          });
          
          const newArray = [...prev, snapshot];
          if (newArray.length > 35) return newArray.slice(newArray.length - 35); // Max 35 points sliding
          return newArray;
       });
    }, 2000); // 2s pacing
    
    return () => clearInterval(interval);
  }, [isConnected, liveData, chartData.length]);

  // Tabular Insights Builder
  const tableRows = useMemo(() => {
    return ['AAPL', 'TSLA', 'AMZN'].map(ticker => {
      // Prioritize live websocket stream block, fallback to historical array locally
      const wsData = liveData[ticker];
      
      let currentPrice = wsData ? wsData.price : (chartData[chartData.length - 1]?.[ticker] || 0);
      let high24 = wsData?.['24hHigh'] || currentPrice * 1.05;
      let low24 = wsData?.['24hLow'] || currentPrice * 0.95;
      let vol = wsData?.volatility30 || 0.3;

      let recommendation = "Stable Trend";
      if (vol > 0.6) recommendation = "High Volatility - Watch Closely";
      else if (vol > 0.45) recommendation = "Moderate Risk";
      
      return {
        ticker,
        currentPrice,
        high24: high24.toFixed(2),
        low24: low24.toFixed(2),
        trend: wsData?.change > 0 ? 'up' : wsData?.change < 0 ? 'down' : 'flat',
        recommendation
      };
    });
  }, [liveData, chartData]);

  const toggleTicker = (ticker) => setVisibleTickers(prev => ({ ...prev, [ticker]: !prev[ticker] }));

  if (loading) return <div className="spinner-container"><div className="spinner"></div></div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black mb-2 flex items-center gap-3 text-white">
            <Activity className="text-neon-cyan" size={36} />
            Market Pulse
          </h1>
          <p className="text-gray-400 font-medium tracking-wide">Live-streaming WebSocket micro-structure.</p>
        </div>
        <HeaderTime />
      </header>
      
      {/* Triple Stock Chart */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl mb-8 relative border-t border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h3 className="text-xl font-bold tracking-tight text-gray-200">Live Asset Pricing</h3>
          
          <div className="flex gap-2 bg-[#0f172a]/50 p-1.5 rounded-xl border border-white/5">
            {Object.keys(neonColors).map(ticker => (
              <button 
                key={ticker}
                onClick={() => toggleTicker(ticker)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  visibleTickers[ticker] ? 'bg-white/10 shadow-sm' : 'text-gray-600 hover:text-gray-400'
                }`}
                style={{
                  color: visibleTickers[ticker] ? neonColors[ticker] : undefined,
                  boxShadow: visibleTickers[ticker] ? `inset 0 2px 5px rgba(255,255,255,0.05), 0 0 10px ${neonColors[ticker]}30` : 'none'
                }}
              >
                {ticker}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" stroke="#666" tick={{ fill: '#888', fontSize: 12 }} tickMargin={10} minTickGap={20} />
              <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 12 }} tickFormatter={value => `$${value}`} domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                itemStyle={{ fontWeight: 'bold' }}
                formatter={(value) => `$${value.toFixed(2)}`}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              
              {Object.keys(neonColors).map(ticker => (
                visibleTickers[ticker] && (
                  <Line 
                    key={ticker}
                    type="monotone" 
                    dataKey={ticker} 
                    stroke={neonColors[ticker]} 
                    strokeWidth={3} 
                    dot={false} 
                    activeDot={{ r: 6, fill: neonColors[ticker], stroke: '#0f172a', strokeWidth: 2 }}
                    isAnimationActive={false} /* Vital for performance on sliding arrays */
                    name={`${ticker} Price`} 
                  />
                )
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabular Insights */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="px-8 py-5 border-b border-white/5 bg-[#0f172a]/40 backdrop-blur-md flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-200">High-Speed Metrics</h3>
          {isConnected ? (
            <span className="text-xs text-neon-cyan font-bold tracking-widest uppercase flex items-center gap-2">
              <span className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse shadow-[0_0_8px_#00e5ff]" /> Live
            </span>
          ) : (
            <span className="text-xs text-red-500 font-bold tracking-widest uppercase opacity-70">
              Disconnected
            </span>
          )}
        </div>
        
        <div className="overflow-x-auto bg-[#0f172a]/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-500 text-xs uppercase tracking-widest border-b border-white/5">
                <th className="px-8 py-4 font-semibold">Asset</th>
                <th className="px-6 py-4 font-semibold">Live Price</th>
                <th className="px-6 py-4 font-semibold">24h High/Low</th>
                <th className="px-6 py-4 font-semibold text-center">Trend Indicator</th>
                <th className="px-8 py-4 font-semibold text-right">Algorithmic Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm font-medium">
              {tableRows.map(row => (
                <tr key={row.ticker} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                        {iconMap[row.ticker]}
                      </div>
                      <span className="font-bold text-lg text-gray-100">{row.ticker}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <PriceCell price={row.currentPrice} />
                  </td>
                  <td className="px-6 py-5 font-mono text-xs text-gray-400 flex flex-col gap-1">
                    <span className="text-green-400">H: ${row.high24}</span>
                    <span className="text-red-400">L: ${row.low24}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex justify-center">
                      <motion.div 
                        initial={false}
                        animate={{ opacity: row.trend !== 'flat' ? 1 : 0.2 }}
                        className={`w-6 h-6 flex items-center justify-center rounded-full ${
                          row.trend === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {row.trend === 'up' ? '▲' : row.trend === 'down' ? '▼' : '—'}
                      </motion.div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm backdrop-blur-md ${
                      row.recommendation.includes('High') 
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                        : row.recommendation.includes('Moderate')
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        : 'bg-green-500/10 text-neon-cyan border border-neon-cyan/20'
                    }`}>
                      {row.recommendation}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default Home;
