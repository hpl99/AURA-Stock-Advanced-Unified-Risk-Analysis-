import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Target, Car, Package } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="logo-text">FinDash</h2>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
          <LayoutDashboard className="nav-icon" />
          <span>Portfolio Overview</span>
        </NavLink>
        
        <div className="nav-section">TICKERS</div>
        
        <NavLink to="/ticker/AAPL" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Target className="nav-icon" />
          <span>Apple (AAPL)</span>
        </NavLink>
        
        <NavLink to="/ticker/TSLA" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Car className="nav-icon" />
          <span>Tesla (TSLA)</span>
        </NavLink>
        
        <NavLink to="/ticker/AMZN" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Package className="nav-icon" />
          <span>Amazon (AMZN)</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
