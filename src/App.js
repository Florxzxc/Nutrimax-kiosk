import React, { useState } from 'react';
import WelcomePage from './Main/WelcomePage';
import Choose from './Main/Choose';
import Overtime from './Main/Overtime';

const App = () => {
  const [page, setPage] = useState('welcome');

  return (
    <>
      {page === 'welcome' && <WelcomePage onEnter={() => setPage('choose')} />}
      {page === 'choose' && (
        <Choose
          onBack={() => setPage('welcome')}
          onOvertime={() => setPage('overtime')}
          onLeave={() => {/* Add leave logic here */}}
        />
      )}
      {page === 'overtime' && <Overtime onBack={() => setPage('choose')} />}
    </>
  );
};

export default App;
