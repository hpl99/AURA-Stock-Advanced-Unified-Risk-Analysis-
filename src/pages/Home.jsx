import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Activity, Apple, Car, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// Helper component for animating price differences
const PriceCell = ({ price }) => {
  const [flash, setFlash] = useState(null);
  const prevPrice = useRef(price);

  useEffect(() => {
    // If the price actually changed
    if (price !== prevPrice.current) {
      if (price > prevPrice.current) {
         setFlash('up');
      } else {
         setFlash('down');
      }
      prevPrice.current = price;
      
      const timer = setTimeout(() => setFlash(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [price]);

  return (
    <motion.div
      animate={{
        backgroundColor: flash === 'up' ? 'rgba(34, 197, 94, 0.2)' : flash === 'down' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
        color: flash === 'up' ? '#4ade80' : flash === 'down' ? '#f87171' : '#e5e7eb'
      }}
      transition={{ duration: 0.5 }}
      className="px-3 py-1 -ml-3 rounded-lg font-mono font-bold w-fit"
    >
      ${price.toFixed(2)}
    </motion.div>
  );
};

const Home = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [visibleTickers, setVisibleTickers] = useState({
    AAPL: true,
    TSLA: true,
    AMZN: true
  });

  const neonColors = { AAPL: '#00e5ff', TSLA: '#ffbe0b', AMZN: '#8338ec' };
  const iconMap = {
    AAPL: <Apple size={18} className="text-[#00e5ff]" />,
    TSLA: <Car size={18} className="text-[#ffbe0b]" />,
    AMZN: <Package size={18} className="text-[#8338ec]" />
  };

  const fetchMetrics = async (isBackgroundPoll = false) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/metrics/all');
      if (!response.ok) throw new Error('Data fetch failed');
      const json = await response.json();
      
      setData(json.data);
      if (isBackgroundPoll) {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        toast.success(`Market Data Updated: ${timeStr}`);
      }
    } catch (err) {
      if (!isBackgroundPoll) setError(err.message);
      else toast.error("Background data sync failed");
    } finally {
      if (!isBackgroundPoll) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    
    // 60-second polling interval
    const interval = setInterval(() => {
      fetchMetrics(true);
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const chartData = useMemo(() => {
    if (!data) return [];
    const tickers = Object.keys(data);
    if (tickers.length === 0) return [];
    
    const firstTickerRows = data[tickers[0]].rows;
    return firstTickerRows.map((row, idx) => {
      const dataPoint = { date: row.date };
      tickers.forEach(ticker => {
        dataPoint[ticker] = data[ticker].rows[idx]?.volatility30 || 0;
      });
      return dataPoint;
    });
  }, [data]);

  // Tabular Insights Builder
  const tableRows = useMemo(() => {
    if (!data) return [];
    return Object.keys(data).map(ticker => {
      const rows = data[ticker].rows;
      if (!rows || rows.length === 0) return null;
      
      const latest = rows[rows.length - 1];
      const smaVariance = latest.sma50 ? ((latest.close - latest.sma50) / latest.sma50 * 100).toFixed(2) : '0.00';
      
      let recommendation = "Stable Trend";
      if (latest.volatility30 > 0.6) recommendation = "High Volatility - Watch Closely";
      else if (latest.volatility30 > 0.4) recommendation = "Moderate Risk";
      
      return {
        ticker,
        currentPrice: latest.close,
        smaVariance,
        volatility: (latest.volatility30 * 100).toFixed(2),
        recommendation
      };
    }).filter(Boolean);
  }, [data]);

  const toggleTicker = (ticker) => {
    setVisibleTickers(prev => ({ ...prev, [ticker]: !prev[ticker] }));
  };

  if (loading) return <div className="spinner-container"><div className="spinner"></div></div>;
  if (error) return <div className="p-8 text-center mt-12 text-red-500 glass-panel rounded-2xl">{error}</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <header className="mb-8">
        <h1 className="text-4xl font-black mb-2 flex items-center gap-3 text-white">
          <Activity className="text-neon-cyan" size={36} />
          Market Comparison Hub
        </h1>
        <p className="text-gray-400 font-medium tracking-wide">Real-time macro-economic comparison.</p>
      </header>
      
      {/* Triple Stock Chart */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h3 className="text-xl font-bold tracking-tight text-gray-200">Comparative Timeline</h3>
          
          <div className="flex gap-2 bg-black/40 p-1.5 rounded-xl border border-white/5">
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
              <XAxis dataKey="date" stroke="#666" tick={{ fill: '#888', fontSize: 12 }} tickMargin={10} />
              <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 12 }} tickFormatter={value => `${(value * 100).toFixed(0)}%`} domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(10,10,10,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                itemStyle={{ fontWeight: 'bold' }}
                formatter={(value) => `${(value * 100).toFixed(2)}%`}
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
                    activeDot={{ r: 6, fill: neonColors[ticker], stroke: '#0a0a0a', strokeWidth: 2 }}
                    name={`${ticker} Vol`} 
                  />
                )
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabular Insights */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/5">
        <div className="px-8 py-5 border-b border-white/5 bg-white/[0.02]">
          <h3 className="font-bold text-lg text-gray-200">Live Tabular Insights</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-500 text-xs uppercase tracking-widest border-b border-white/5">
                <th className="px-8 py-4 font-semibold">Ticker</th>
                <th className="px-6 py-4 font-semibold">Current Price</th>
                <th className="px-6 py-4 font-semibold">SMA 50 Variance</th>
                <th className="px-6 py-4 font-semibold">Volatility Index</th>
                <th className="px-8 py-4 font-semibold">Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm font-medium">
              {tableRows.map(row => (
                <tr key={row.ticker} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      {iconMap[row.ticker]}
                      <span className="font-bold">{row.ticker}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <PriceCell price={row.currentPrice} />
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-300">
                    <span className={Number(row.smaVariance) > 0 ? 'text-green-400' : 'text-red-400'}>
                      {Number(row.smaVariance) > 0 ? '+' : ''}{row.smaVariance}%
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-300">{row.volatility}</td>
                  <td className="px-8 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                      row.recommendation.includes('High') 
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                        : row.recommendation.includes('Moderate')
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        : 'bg-green-500/10 text-green-400 border border-green-500/20'
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
