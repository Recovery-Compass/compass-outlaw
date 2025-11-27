import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [hasEntered, setHasEntered] = useState(false);

  return (
    <>
      {/* Background layer for the whole app to ensure no white flashes */}
      <div className="fixed inset-0 bg-void -z-50" />
      
      {!hasEntered ? (
        <LandingPage onEnter={() => setHasEntered(true)} />
      ) : (
        <div className="animate-in fade-in duration-700 slide-in-from-bottom-4">
          <Dashboard />
        </div>
      )}
    </>
  );
};

export default App;