import { LayoutDashboard, ClipboardCheck, Bot, Settings, Book, HelpCircle } from 'lucide-react';

export default function Sidebar({ currentScreen, setCurrentScreen }: any) {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'analysis-trace', label: 'Jobs', icon: ClipboardCheck },
    { id: 'log-explorer', label: 'Log Explorer', icon: Bot },
    { id: 'fix-planner', label: 'Fix Planner', icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full flex flex-col gap-4 bg-surface w-64 p-6 neo-raised z-40 hidden md:flex">
      <div className="mb-8">
        <h1 className="text-lg font-semibold text-slate-800">System Engine</h1>
        <p className="text-xs text-primary font-medium tracking-tight">Multi-Agent Active</p>
      </div>
      <nav className="flex-grow flex flex-col gap-4">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentScreen(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'neo-inset text-primary font-semibold'
                  : 'text-slate-500 hover:text-primary hover:neo-raised'
              }`}
            >
              <Icon size={20} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-2 pt-6 border-t border-slate-200/50">
        <button onClick={() => setCurrentScreen('documentation')} className="flex w-full text-left items-center gap-3 px-4 py-2 text-slate-500 text-xs hover:text-primary transition-colors">
          <Book size={18} /> Documentation
        </button>
        <button className="flex items-center gap-3 px-4 py-2 text-slate-500 text-xs hover:text-primary">
          <HelpCircle size={18} />
          Support
        </button>
      </div>
    </aside>
  );
}
