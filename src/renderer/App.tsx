import React from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { useStore } from './store';

function App() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <MainLayout />
    </div>
  );
}

export default App;
