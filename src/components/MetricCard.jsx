import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import './MetricCard.css';

const MetricCard = ({ ticker, data }) => {
  const navigate = useNavigate();
  
  if (!data || data.length === 0) return null;
  
  const latest = data[data.length - 1];
  const previous = data.length > 1 ? data[data.length - 2] : latest;
  
  const latestClose = latest.close;
  const previousClose = previous.close;
  
  const isPositive = latestClose >= previousClose;
  const color = isPositive ? 'var(--accent-green)' : 'var(--accent-red)';
  const bgGlow = isPositive ? 'rgba(0, 255, 135, 0.1)' : 'rgba(255, 0, 85, 0.1)';
  
  // We only need the close prices for the sparkline
  const chartData = data.map(d => ({ value: d.close }));
  
  // Calculate min and max for the YAxis domain so the sparkline fills the height better
  const minClose = Math.min(...chartData.map(d => d.value));
  const maxClose = Math.max(...chartData.map(d => d.value));
  const padding = (maxClose - minClose) * 0.1;

  return (
    <div 
      className="card metric-card" 
      onClick={() => navigate(`/ticker/${ticker}`)}
      style={{ '--card-glow': bgGlow }}
    >
      <div className="metric-header">
        <h3 className="metric-ticker">{ticker}</h3>
        <div className={`metric-badge ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        </div>
      </div>
      
      <div className="metric-body">
        <div className="metric-values">
          <div className="metric-price">${latestClose?.toFixed(2)}</div>
          <div className="metric-volatility">
            Vol: {(latest.volatility30 * 100).toFixed(2)}%
          </div>
        </div>
        
        <div className="metric-sparkline">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <YAxis 
                hide 
                domain={[minClose - padding, maxClose + padding]} 
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                strokeWidth={3} 
                dot={false} 
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
