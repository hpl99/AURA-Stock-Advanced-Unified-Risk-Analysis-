import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, Target, Car, Package } from 'lucide-react';

const Sidebar = () => {
  const navLinkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
      isActive
        ? 'bg-neon-cyan/10 text-neon-cyan shadow-[inset_2px_0_0_0_#00e5ff]'
        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
    }`;

  return (
    <aside className="w-[280px] shrink-0 border-r border-white/5 bg-[#0a0a0a] h-screen sticky top-0 flex flex-col p-6 z-20">
      <div className="mb-10 px-2 mt-2">
        <h2 className="text-3xl font-black tracking-tight text-gradient">FinDash</h2>
        <p className="text-xs text-gray-500 mt-1 font-medium tracking-widest uppercase">Intelligence Hub</p>
      </div>
      
      <nav className="flex flex-col gap-2">
        <NavLink to="/" className={navLinkClasses} end>
          <Activity size={20} />
          <span>Market Pulse</span>
        </NavLink>
        
        <div className="text-xs font-bold tracking-widest text-gray-600 mt-8 mb-2 px-4 uppercase">
          Equities
        </div>
        
        <NavLink to="/ticker/AAPL" className={navLinkClasses}>
          <Target size={20} />
          <span>Apple (AAPL)</span>
        </NavLink>
        
        <NavLink to="/ticker/TSLA" className={navLinkClasses}>
          <Car size={20} />
          <span>Tesla (TSLA)</span>
        </NavLink>
        
        <NavLink to="/ticker/AMZN" className={navLinkClasses}>
          <Package size={20} />
          <span>Amazon (AMZN)</span>
        </NavLink>
      </nav>
      
      <div className="mt-auto px-4 py-4 glass-panel rounded-xl border border-white/5 text-xs text-green-400 font-bold tracking-widest flex items-center justify-center gap-2 uppercase shadow-[0_0_15px_rgba(34,197,94,0.1)]">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
        Live Market Feed
      </div>
    </aside>
  );
};

export default Sidebar;
