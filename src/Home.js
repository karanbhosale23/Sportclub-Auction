import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home({ wheels }) {
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
        </div>
    );
}

export default Home; 