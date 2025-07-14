import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Wheel } from 'react-custom-roulette';
import { AnimatePresence, motion } from 'framer-motion';

// NOTE: Using react-wheel-of-prizes for reliable pointer alignment and segment display
// The pointer is always at the top and the selected name will always match the pointer

function WheelPage({ wheels, setWheels }) {
    const { category } = useParams();
    const navigate = useNavigate();
    const idx = wheels.findIndex(w => w.title.toLowerCase() === category);
    const [modal, setModal] = useState({ open: false, wheelIdx: idx });
    const [listCollapsed, setListCollapsed] = useState(false);
    const [bounce, setBounce] = useState(false);
    const wheelRef = useRef();

    // Add a utility function for safe slicing
    function safeSlice(arr, ...args) {
        return Array.isArray(arr) ? arr.slice(...args) : [];
    }

    // Modal close on Escape or click outside (must be before any early return)
    useEffect(() => {
        if (!modal.open) return;
        const handleKey = (e) => { if (e.key === 'Escape') closeModal(); };
        const handleClick = (e) => {
            if (e.target.classList && e.target.classList.contains('modal-overlay')) closeModal();
        };
        window.addEventListener('keydown', handleKey);
        window.addEventListener('mousedown', handleClick);
        return () => {
            window.removeEventListener('keydown', handleKey);
            window.removeEventListener('mousedown', handleClick);
        };
    }, [modal.open]);

    // Handle last player case: if only 1 player left, auto-sell and redirect
    useEffect(() => {
        if (wheel && Array.isArray(wheel.items) && wheel.items.length === 1) {
            // Auto-sell the last player
            setTimeout(() => {
                setModal({ open: true, wheelIdx: idx });
            }, 500);
        }
        if (wheel && Array.isArray(wheel.items) && wheel.items.length === 0) {
            setTimeout(() => navigate('/'), 1200);
        }
    }, [wheel, navigate, idx]);

    if (idx === -1) return <div>Category not found</div>;

    const handleInputChange = (value) => {
        setWheels(wheels => wheels.map((w, i) => i === idx ? { ...w, input: value } : w));
    };
    const handleAddItem = () => {
        setWheels(wheels => wheels.map((w, i) => {
            if (i === idx && w.input.trim()) {
                if (!w.items.includes(w.input.trim())) {
                    return { ...w, items: [...w.items, w.input.trim()], input: '' };
                }
            }
            return w;
        }));
    };
    const handleRemoveItem = (itemIdx) => {
        setWheels(wheels => wheels.map((w, i) => i === idx ? { ...w, items: w.items.filter((_, j) => j !== itemIdx) } : w));
    };
    const playSound = (src) => {
        const audio = new window.Audio(src);
        audio.play();
    };
    const handleSpin = () => {
        if (wheels[idx].items.length > 0 && !wheels[idx].spinning) {
            playSound('/spin.mp3'); // Play spin sound
        }
        setWheels(wheels => wheels.map((w, i) => {
            if (i === idx && w.items.length > 0 && !w.spinning) {
                const rawPrize = Math.floor(Math.random() * w.items.length);
                // Use rawPrize directly so the selected segment matches the pointer
                return { ...w, mustSpin: true, prizeNumber: rawPrize, spinning: true, _rawPrize: rawPrize };
            }
            return w;
        }));
    };
    const handleStopSpinning = () => {
        playSound('/win.mp3'); // Play win sound
        setBounce(true);
        setTimeout(() => setBounce(false), 600);
        setWheels(wheels => wheels.map((w, i) => {
            if (i === idx) {
                setTimeout(() => setModal({ open: true, wheelIdx: idx }), 300);
                // Use the original random index for the selected name
                const selectedIdx = typeof w._rawPrize === 'number' ? w._rawPrize : w.prizeNumber;
                return { ...w, mustSpin: false, spinning: false, selected: w.items[selectedIdx] };
            }
            return w;
        }));
    };
    const closeModal = () => setModal({ open: false, wheelIdx: null });
    const hideChoice = () => {
        setWheels(wheels => wheels.map((w, i) => {
            if (i === idx) {
                return { ...w, items: w.items.filter(item => item !== w.selected), selected: null };
            }
            return w;
        }));
    };

    const wheel = wheels[idx];
    const subtitle = `Pick your ${wheel.title}!`;

    // Use a yellow/black theme for the wheel segments
    const wheelData = Array.isArray(wheel.items) && wheel.items.length ? wheel.items.map((item) => ({
        option: item,
        style: {
            backgroundColor: '#ffd600',
            color: '#232526',
            fontWeight: 900,
            fontSize: 22,
            fontFamily: 'Montserrat, Arial, sans-serif',
            textAlign: 'center',
            textShadow: '0 2px 8px #000',
            border: 'none',
            boxShadow: 'none',
            filter: 'none',
            transform: 'rotate(0deg)', // always horizontal
        },
        tooltip: item,
    })) : [];

    return (
        <div className="container wheel-full">
            <button className="back-btn" onClick={() => navigate('/')}>←</button>
            <div className="wheel-subtitle">{subtitle}</div>
            <div className="wheel-layout">
                <div className="wheel-left">
                    <div
                        className={`wheel-center wheel-immersive-center${wheel.spinning ? ' wheel-glow' : ''}${bounce ? ' wheel-bounce' : ''}`}
                        ref={wheelRef}
                        style={{
                            position: 'relative',
                            width: window.innerWidth > 700 ? 480 : 320,
                            height: window.innerWidth > 700 ? 480 : 320,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {/* Pointer overlay: large, rounded, orange teardrop pointer, always at top */}
                        <div
                            className="wheel-pointer"
                            style={{
                                position: 'absolute',
                                top: '-38px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                zIndex: 2,
                                width: 64,
                                height: 48,
                                pointerEvents: 'none',
                                display: 'flex',
                                alignItems: 'flex-end',
                                justifyContent: 'center',
                            }}
                        >
                            <div className="wheel-pointer" />
                        </div>
                        <Wheel
                            mustStartSpinning={wheel.mustSpin}
                            prizeNumber={wheel.prizeNumber}
                            data={wheelData}
                            backgroundColors={['#ffd600']}
                            textColors={['#232526']}
                            onStopSpinning={handleStopSpinning}
                            fontFamily="Montserrat, Arial, sans-serif"
                            fontSize={22}
                            spinDuration={0.7}
                            radiusLineColor="#232526"
                            radiusLineWidth={4}
                            outerBorderColor="#232526"
                            outerBorderWidth={8}
                            width={window.innerWidth > 700 ? 480 : 320}
                        />
                    </div>
                    <div className="wheel-spin-btn-row">
                        <button
                            onClick={handleSpin}
                            disabled={wheel.items.length === 0 || wheel.spinning}
                            className={wheel.items.length === 0 || wheel.spinning ? 'disabled spin-button' : 'spin-button'}
                            style={{ backgroundColor: wheel.color, color: '#fff' }}
                        >
                            <img src="/spin.svg" alt="Spin" style={{ width: 22, verticalAlign: 'middle', marginRight: 6 }} />
                            {wheel.spinning ? 'Spinning...' : 'SPIN'}
                        </button>
                    </div>
                </div>
                <div className="wheel-right">
                    <div className="list-wrapper playerlist-card">
                        <div className="header playerlist-header">
                            <h2 className="wheel-title playerlist-title">{wheel.title}</h2>
                            <button
                                className="toggle-btn"
                                onClick={() => setListCollapsed(c => !c)}
                            >
                                {listCollapsed ? 'Show List' : 'Hide List'}
                            </button>
                        </div>
                        <div className={`collapsible-content${listCollapsed ? ' collapsed' : ''}`}
                            style={{ transition: 'max-height 0.4s cubic-bezier(.68,-0.55,.27,1.55), opacity 0.3s' }}>
                            <div className="playerlist-inputrow input-area">
                                <input
                                    type="text"
                                    placeholder="Input text here..."
                                    value={wheel.input}
                                    onChange={e => handleInputChange(e.target.value)}
                                    className="wheel-input playerlist-input"
                                    onKeyDown={e => { if (e.key === 'Enter') handleAddItem(); }}
                                />
                                <button
                                    className="spin-button wheel-add-btn add-btn"
                                    style={{ backgroundColor: wheel.color, color: '#fff' }}
                                    onClick={handleAddItem}
                                >
                                    +
                                </button>
                            </div>
                            {Array.isArray(wheel.items) && wheel.items.length > 0 ? (
                                <div className="playerlist-listwrap">
                                    <ul className="playerlist-list">
                                        <AnimatePresence>
                                            {wheel.items.map((item, itemIdx) => (
                                                <motion.li
                                                    key={itemIdx}
                                                    className={`playerlist-item${wheel.selected === item ? ' selected' : ''}`}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -20 }}
                                                >
                                                    <span className="playerlist-dot"></span>
                                                    <span className="playerlist-name">{item}</span>
                                                    <button
                                                        className="remove-btn"
                                                        title="Remove item"
                                                        onClick={() => handleRemoveItem(itemIdx)}
                                                    >
                                                        ❌
                                                    </button>
                                                </motion.li>
                                            ))}
                                        </AnimatePresence>
                                    </ul>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
            {/* Modal Popup */}
            {modal.open && wheel && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="selected-label">Selected</div>
                        <div className="modal-player-name">{wheel.selected}</div>
                        <div className="modal-btn-row">
                            <button
                                className="spin-button download-button secondary"
                                onClick={hideChoice}
                            >
                                Hide Choice
                            </button>
                            <button
                                className="spin-button download-button"
                                onClick={() => {
                                    // Add to Unsold wheel
                                    setWheels(wheels => {
                                        let unsoldIdx = wheels.findIndex(w => w.title === 'Unsold');
                                        let updated = wheels.map((w, i) => {
                                            if (i === idx) {
                                                return { ...w, items: w.items.filter(item => item !== w.selected), selected: null };
                                            }
                                            return w;
                                        });
                                        if (unsoldIdx === -1) {
                                            // Create Unsold wheel
                                            updated.push({
                                                id: wheels.length + 1,
                                                title: 'Unsold',
                                                color: '#9e9e9e',
                                                items: [wheel.selected],
                                                input: '',
                                                mustSpin: false,
                                                prizeNumber: 0,
                                                spinning: false,
                                                selected: null
                                            });
                                        } else {
                                            // Add to existing Unsold wheel if not already present
                                            updated = updated.map((w, i) => i === unsoldIdx && !w.items.includes(wheel.selected)
                                                ? { ...w, items: [...w.items, wheel.selected] }
                                                : w
                                            );
                                        }
                                        return updated;
                                    });
                                    closeModal();
                                }}
                            >
                                Unsold
                            </button>
                            <button
                                className="spin-button download-button green"
                                onClick={closeModal}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default WheelPage; 