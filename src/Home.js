import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function Home({ wheels }) {
    const navigate = useNavigate();
    // Only show categories with remaining players
    const availableWheels = Array.isArray(wheels) ? wheels.filter(w => Array.isArray(w.items) && w.items.length > 0) : [];
    return (
        <motion.div
            className="container home-full"
            variants={bgGradientVariants}
            animate="animate"
            style={{ minHeight: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 0 }}
        >
            <motion.img
                src="/Screenshot 2025-07-05 141537.png"
                alt="Chhava Sports Club Logo"
                className="club-logo"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: 'easeInOut' }}
                style={{ marginBottom: 0 }}
            />
            <h1 style={{ color: '#ffd600', fontWeight: 900, fontSize: '2.5rem', margin: '18px 0 24px 0', letterSpacing: 1, textAlign: 'center' }}>
                Team Auction
            </h1>
            <div className="category-btn-row" style={{ display: 'flex', flexWrap: 'wrap', gap: 18, justifyContent: 'center', alignItems: 'center', marginTop: 18 }}>
                {availableWheels.length > 0 ? availableWheels.map((w, i) => (
                    <button
                        key={w.title}
                        className="category-btn hover-animate"
                        style={{ background: w.color, color: '#fff', fontWeight: 700, fontSize: '1.2rem', borderRadius: 12, padding: '18px 32px', border: 'none', boxShadow: '0 2px 12px #0002', cursor: 'pointer', transition: 'transform 0.18s, box-shadow 0.18s' }}
                        onClick={() => navigate(`/${w.title.toLowerCase()}`)}
                    >
                        {w.title}
                    </button>
                )) : <div style={{ color: '#fff', fontSize: '1.2rem', marginTop: 32 }}>All categories completed!</div>}
            </div>
        </motion.div>
    );
}

export default Home; 