import React from 'react';
import GlassHouseExhibit from './components/GlassHouseExhibit';

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      padding: '40px 20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <GlassHouseExhibit />
    </div>
  );
}

export default App;
