import { Search, Activity, Bell, User } from 'lucide-react';

export default function Topbar({ currentScreen, setCurrentScreen }: any) {
  return (
    <header className="flex justify-between items-center sticky top-0 z-50 bg-surface w-full px-6 py-4 neo-raised">
      <div className="flex items-center gap-8">
        <span className="text-xl font-semibold text-primary">Silk Analysis</span>
        
        {currentScreen === 'log-explorer' && (
          <div className="hidden md:flex gap-6">
            <button onClick={() => setCurrentScreen('dashboard')} className="text-slate-500 hover:text-primary transition-colors font-medium">Dashboard</button>
            <button className="text-primary font-semibold transition-colors font-medium">Log Explorer</button>
            <button className="text-slate-500 hover:text-primary transition-colors font-medium">Network</button>
          </div>
        )}

        {currentScreen !== 'log-explorer' && (
          <div className="hidden md:flex neo-inset rounded-full px-4 py-2 items-center gap-2 w-64 lg:w-96">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm w-full text-on-surface"
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <button className="neo-raised neo-pressed p-2 rounded-full text-slate-500 transition-all duration-300">
          <Activity size={20} />
        </button>
        <button className="neo-raised neo-pressed p-2 rounded-full text-slate-500 transition-all duration-300">
          <Bell size={20} />
        </button>
        <button className="neo-raised neo-pressed p-2 rounded-full text-primary transition-all duration-300">
          <User size={20} />
        </button>
      </div>
    </header>
  );
}
