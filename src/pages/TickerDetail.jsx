import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { ArrowLeft, Save } from 'lucide-react';
import './TickerDetail.css';

const TickerDetail = () => {
  const { tickerId } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showSma, setShowSma] = useState(true);
  const [showVolatility, setShowVolatility] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  
  // LocalStorage generic key logic
  const storageKey = `notes_${tickerId}`;
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/metrics/${tickerId}`);
        if (!response.ok) throw new Error('Failed to fetch ticker data');
        
        const json = await response.json();
        setData(json.rows);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    setNotes(localStorage.getItem(`notes_${tickerId}`) || '');
    setSaveStatus('');
  }, [tickerId]);
  
  const handleSaveNotes = () => {
    localStorage.setItem(storageKey, notes);
    setSaveStatus('Saved!');
    setTimeout(() => setSaveStatus(''), 2000);
  };
  
  if (loading) {
    return <div className="spinner-container"><div className="spinner"></div></div>;
  }
  
  if (error) {
     return (
       <div className="error-container card" style={{ textAlign: 'center', marginTop: '4rem' }}>
         <h2 className="title-lg text-red">Error Loading {tickerId}</h2>
         <p>{error}</p>
         <button className="back-btn mt-4" onClick={() => navigate('/')}>Return to Dashboard</button>
       </div>
     );
  }

  // Ticker name mapping for visual purpose
  const companyNames = {
    AAPL: 'Apple Inc.',
    TSLA: 'Tesla Inc.',
    AMZN: 'Amazon.com Inc.'
  };
  
  const companyName = companyNames[tickerId] || tickerId;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-date">{label}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="tooltip-item" style={{ color: entry.color }}>
              <span className="tooltip-name">{entry.name}:</span>
              <span className="tooltip-value">
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
    <div className="ticker-page">
      <button className="back-btn" onClick={() => navigate('/')}>
        <ArrowLeft size={18} /> Back to Overview
      </button>
      
      <div className="ticker-header">
        <h1 className="ticker-title">{tickerId}</h1>
        <p className="ticker-company">{companyName}</p>
      </div>
      
      <div className="content-grid">
        <div className="main-chart-area">
          <div className="controls-card card">
            <h3 className="controls-title">Chart Display Options</h3>
            <div className="toggle-group">
              <label className="toggle-label">
                <input 
                  type="checkbox" 
                  checked={showSma} 
                  onChange={e => setShowSma(e.target.checked)} 
                  className="toggle-checkbox"
                />
                <div className="toggle-slider"></div>
                <span className="toggle-text" style={{ color: 'var(--accent-gold)' }}>SMA 50</span>
              </label>
              
              <label className="toggle-label">
                <input 
                  type="checkbox" 
                  checked={showVolatility} 
                  onChange={e => setShowVolatility(e.target.checked)} 
                  className="toggle-checkbox"
                />
                <div className="toggle-slider"></div>
                <span className="toggle-text" style={{ color: 'var(--accent-purple)' }}>Volatility (30d)</span>
              </label>
            </div>
          </div>
          
          <div className="chart-card card">
            <ResponsiveContainer width="100%" height={450}>
              <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="var(--text-secondary)" 
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
                  tickMargin={10}
                />
                <YAxis 
                  yAxisId="left" 
                  stroke="var(--text-secondary)" 
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
                  domain={['auto', 'auto']} 
                  tickFormatter={value => `$${value}`}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="var(--text-secondary)" 
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
                  domain={[0, 'auto']} 
                  tickFormatter={value => `${(value * 100).toFixed(0)}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="close" 
                  stroke="var(--accent-cyan)" 
                  strokeWidth={3} 
                  dot={false} 
                  activeDot={{ r: 6, fill: 'var(--accent-cyan)' }}
                  name="Close Price" 
                />
                
                {showSma && (
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="sma50" 
                    stroke="var(--accent-gold)" 
                    strokeDasharray="5 5" 
                    strokeWidth={2} 
                    dot={false} 
                    name="SMA 50" 
                  />
                )}
                
                {showVolatility && (
                  <Area 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="volatility30" 
                    fill="rgba(131, 56, 236, 0.15)" 
                    stroke="var(--accent-purple)" 
                    strokeWidth={2} 
                    name="Volatility" 
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="notes-area">
          <div className="notes-card card">
            <div className="notes-header">
              <h3 className="notes-title">Graph Insights & Notes</h3>
              {saveStatus && <span className="save-status text-green">{saveStatus}</span>}
            </div>
            
            <textarea 
              className="notes-textarea" 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
              placeholder={`Add your analytical notes for ${tickerId} here...\n\nExample: strong support seen at SMA 50.`} 
            />
            
            <button className="save-btn" onClick={handleSaveNotes}>
              <Save size={18} /> Save Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TickerDetail;
