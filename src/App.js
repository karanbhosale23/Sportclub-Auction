import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuctionPage from './AuctionPage';
import Home from './Home';
import WheelPage from './WheelPage';
import { Wheel } from 'react-custom-roulette';
import './App.css';
import { TeamNamesProvider } from './TeamNamesContext';

const defaultWheels = [
  {
    id: 1,
    title: 'Batsman',
    color: '#007bff',
    items: ['Aman', 'Karan', 'Ajit', 'Dinesh', 'Omkar', 'Sahil Y', 'Sharavan', 'Sahil J'],
  },
  {
    id: 2,
    title: 'Allrounder',
    color: '#28a745',
    items: ['Arya', 'Digambar', 'Pratik', 'Jayesh', 'Nilesh', 'Gandharv', 'Aniket', 'Vivek'],
  },
  {
    id: 3,
    title: 'Bowler',
    color: '#dc3545',
    items: ['Sujit', 'Tejas', 'Atharva', 'Vedant', 'Ishwar', 'DK', 'Patil', 'Himanshu'],
  },
  {
    id: 4,
    title: 'Unsold Players',
    color: '#888',
    items: [],
  },
];

const App = () => {
  const [wheels, setWheels] = useState(defaultWheels.map(w => ({ ...w, input: '', mustSpin: false, prizeNumber: 0, spinning: false, selected: null })));
  return (
    <TeamNamesProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home wheels={wheels} />} />
          <Route path=":category" element={<WheelPage wheels={wheels} setWheels={setWheels} />} />
          <Route path="/unsold-players" element={<WheelPage wheels={wheels} setWheels={setWheels} isUnsoldWheel />} />
          <Route path="/auction" element={<AuctionPage />} />
        </Routes>
      </Router>
    </TeamNamesProvider>
  );
};

export default App;