import React, { useState, useEffect } from 'react';
import MetricCard from '../components/MetricCard';

const Home = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/metrics/all');
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        const json = await response.json();
        setData(json.data);
      } catch (err) {
        setError(err.message);
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2 className="title-lg text-red">Connection Error</h2>
        <p className="subtitle" style={{ fontSize: '1.1rem', margin: '1rem 0' }}>{error}</p>
        <p className="text-secondary" style={{ color: 'var(--text-secondary)' }}>
          Ensure the FastAPI backend is running on http://127.0.0.1:8000
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="title-lg" style={{ marginBottom: '0.5rem' }}>Portfolio Overview</h1>
      <p className="subtitle">Real-time market metrics and insights</p>
      
      <div className="dashboard-grid">
        {data && Object.keys(data).map(ticker => (
          <MetricCard key={ticker} ticker={ticker} data={data[ticker].rows} />
        ))}
        {(!data || Object.keys(data).length === 0) && (
          <div className="card text-secondary" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
            No portfolio data available
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
