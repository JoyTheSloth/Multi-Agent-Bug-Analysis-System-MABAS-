import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardScreen from './screens/DashboardScreen';
import AnalysisTraceScreen from './screens/AnalysisTraceScreen';
import LogExplorerScreen from './screens/LogExplorerScreen';
import FixPlannerScreen from './screens/FixPlannerScreen';
import DocumentationScreen from './screens/DocumentationScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('analysis-trace');

  return (
    <div className="flex min-h-screen bg-background text-on-surface font-sans">
      <Sidebar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
      <div className="flex-1 flex flex-col md:ml-64">
        <Topbar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
        <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
          {currentScreen === 'dashboard' && <DashboardScreen />}
          {currentScreen === 'analysis-trace' && <AnalysisTraceScreen />}
          {currentScreen === 'log-explorer' && <LogExplorerScreen />}
          {currentScreen === 'fix-planner' && <FixPlannerScreen />}
          {currentScreen === 'documentation' && <DocumentationScreen />}
        </main>
      </div>
    </div>
  );
}
