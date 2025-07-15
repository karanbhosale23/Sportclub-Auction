import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home({ wheels }) {
    const navigate = useNavigate();
    const [hiddenCategories, setHiddenCategories] = useState([]);
    const [fadeOutCat, setFadeOutCat] = useState(null);

    // Defensive: prevent .slice() or .map() errors
    const safeWheels = Array.isArray(wheels) ? wheels : [];

    useEffect(() => {
        safeWheels.forEach(w => {
            if (w.items && w.items.length === 0 && !hiddenCategories.includes(w.title.toLowerCase())) {
                setFadeOutCat(w.title.toLowerCase());
                setTimeout(() => {
                    setHiddenCategories(h => [...h, w.title.toLowerCase()]);
                    setFadeOutCat(null);
                }, 400); // match fade duration
            }
        });
    }, [safeWheels, hiddenCategories]);

    // Find the Unsold Players wheel
    const unsoldWheel = safeWheels.find(w => w.title === 'Unsold Players');
    const hasUnsold = unsoldWheel && unsoldWheel.items && unsoldWheel.items.length > 0 && !hiddenCategories.includes('unsold players');

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
                {safeWheels.map(w => {
                    const cat = w.title.toLowerCase();
                    if (cat === 'unsold players') return null; // REMOVE the blue Unsold Players button
                    if (hiddenCategories.includes(cat)) return null;
                    return (
                        <button
                            key={w.title}
                            className={`category-btn ${cat}${fadeOutCat === cat ? ' fade-out' : ''}`}
                            onClick={() => navigate(`/${cat.replace(/\s+/g, '-')}`)}
                        >
                            {w.title}
                        </button>
                    );
                })}
                <button className="category-btn auction" onClick={() => navigate('/auction')}>Auction</button>
            </div>
            {hasUnsold && (
                <div style={{ marginTop: 32, textAlign: 'center' }}>
                    <h2 style={{ color: '#ffd600', fontFamily: 'Oswald, Arial Black, sans-serif', fontWeight: 700, fontSize: '2rem', marginBottom: 12 }}>Unsold Players</h2>
                    <button
                        className={`category-btn${fadeOutCat === 'unsold players' ? ' fade-out' : ''}`}
                        style={{ background: '#888', color: '#fff' }}
                        onClick={() => navigate('/unsold-players')}
                    >
                        Go to Unsold Wheel
                    </button>
                </div>
            )}
        </div>
    );
}

export default Home; 