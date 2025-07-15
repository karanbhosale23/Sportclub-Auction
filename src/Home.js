import React from 'react';
import { useNavigate } from 'react-router-dom';

<<<<<<< HEAD
function Home({ wheels, unsoldPlayers }) {
=======
function Home({ wheels }) {
>>>>>>> 00af4e9123933443e54099f5de35934ea88fb7a4
    const navigate = useNavigate();
    return (
        <div className="container home-full">
            <img src="/Screenshot 2025-07-05 141537.png" alt="Chhava Sports Club Logo" className="club-logo" />
            <h1 style={{ fontFamily: 'Oswald, Arial Black, sans-serif', fontSize: '2.8rem', letterSpacing: '1px', color: '#fff', textShadow: '0 2px 16px #b8860b, 0 1px 0 #000', textTransform: 'uppercase', margin: '8px 0 0 0', textAlign: 'center' }}>
                छावा SPORTS CLUB 🐯
            </h1>
            <div style={{ color: '#FFD700', fontFamily: 'Oswald, Arial Black, sans-serif', fontSize: '1.4rem', textAlign: 'center', margin: '8px 0 32px 0', letterSpacing: '1px', fontWeight: 'bold', textShadow: '0 1px 8px #000' }}>
                Auction
            </div>
            <div className="category-btn-row">
                {wheels.map(w => (
                    <button
                        key={w.title}
                        className={`category-btn ${w.title.toLowerCase()}`}
                        onClick={() => navigate(`/${w.title.toLowerCase()}`)}
                    >
                        {w.title}
                    </button>
                ))}
                <button className="category-btn auction" onClick={() => navigate('/auction')}>Auction</button>
            </div>
<<<<<<< HEAD
            {unsoldPlayers && unsoldPlayers.length > 0 && (
                <div style={{ marginTop: 32, textAlign: 'center' }}>
                    <h2 style={{ color: '#ffd600', fontFamily: 'Oswald, Arial Black, sans-serif', fontWeight: 700, fontSize: '2rem', marginBottom: 12 }}>Unsold Players</h2>
                    <button className="category-btn" style={{ background: '#888', color: '#fff' }} onClick={() => navigate('/unsold')}>
                        Go to Unsold Wheel
                    </button>
                </div>
            )}
=======
>>>>>>> 00af4e9123933443e54099f5de35934ea88fb7a4
        </div>
    );
}

export default Home; 