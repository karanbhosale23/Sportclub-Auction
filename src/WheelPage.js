import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Wheel } from 'react-custom-roulette';
import { useTeamNames } from './TeamNamesContext';

// NOTE: Using react-wheel-of-prizes for reliable pointer alignment and segment display
// The pointer is always at the top and the selected name will always match the pointer

function WheelPage({ wheels, setWheels, unsoldPlayers = [], setUnsoldPlayers, isUnsoldWheel }) {
    const { category } = useParams();
    const navigate = useNavigate();
    const idx = isUnsoldWheel ? 0 : wheels.findIndex(w => w.title.toLowerCase() === category);
    const [modal, setModal] = useState({ open: false, wheelIdx: idx });
    const [listCollapsed, setListCollapsed] = useState(false);
    const [bounce, setBounce] = useState(false);
    const wheelRef = useRef();
    const isSpinningRef = useRef(false); // Prevent double spins
    const { teamNames } = useTeamNames();
    const [sellModal, setSellModal] = useState({ open: false, player: '', team: teamNames[0], price: 100 });

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
        if (wheels[idx].items.length > 0 && !wheels[idx].spinning && !isSpinningRef.current) {
            isSpinningRef.current = true;
            playSound('/spin.mp3'); // Play spin sound
            setWheels(wheels => wheels.map((w, i) => {
                if (i === idx && w.items.length > 0 && !w.spinning) {
                    let rawPrize;
                    if (w.items.length === 1) {
                        rawPrize = 0;
                    } else {
                        // Ensure a new random index (not the same as last spin)
                        do {
                            rawPrize = Math.floor(Math.random() * w.items.length);
                        } while (rawPrize === w.prizeNumber && w.items.length > 1);
                    }
                    return { ...w, mustSpin: true, prizeNumber: rawPrize, spinning: true, _rawPrize: rawPrize };
                }
                return w;
            }));
        }
    };
    const handleStopSpinning = () => {
        isSpinningRef.current = false; // Unlock spin
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
        if (isUnsoldWheel) {
            // Remove from unsoldPlayers
            setUnsoldPlayers(players => players.filter(p => p !== wheels[0].selected));
            setWheels(ws => ws.map((w, i) => i === idx ? { ...w, selected: null } : w));
        } else {
            // Add to unsoldPlayers if not already present
            setUnsoldPlayers(players => players.includes(wheels[idx].selected) || !wheels[idx].selected ? players : [...players, wheels[idx].selected]);
            setWheels(ws => ws.map((w, i) => i === idx ? { ...w, items: w.items.filter(item => item !== w.selected), selected: null } : w));
        }
    };

    // Add player to team in localStorage
    const handleConfirmSale = () => {
        const { team, price, player } = sellModal;
        let teams = JSON.parse(localStorage.getItem('auctionTeams'));
        if (!teams) {
            teams = [
                { name: 'Team A', players: Array.from({ length: 11 }, (_, i) => ({ name: `player${i + 1}`, price: 100 })), budget: 2000 },
                { name: 'Team B', players: Array.from({ length: 11 }, (_, i) => ({ name: `player${i + 1}`, price: 100 })), budget: 2000 },
            ];
        }
        const teamIdx = teams.findIndex(t => t.name === team);
        if (teamIdx !== -1) {
            const teamObj = teams[teamIdx];
            // Find first placeholder player (name === 'playerX')
            const placeholderIdx = teamObj.players.findIndex(p => /^player\d+$/.test(p.name));
            if (placeholderIdx !== -1) {
                // Replace placeholder with new player
                const oldPrice = teamObj.players[placeholderIdx].price;
                teamObj.players[placeholderIdx] = { name: player, price };
                teamObj.budget = Math.max(0, teamObj.budget + oldPrice - price);
                teams[teamIdx] = teamObj;
                localStorage.setItem('auctionTeams', JSON.stringify(teams));
            } else {
                // All 11 are custom, show alert
                window.alert('Cannot add more than 11 players to a team.');
            }
        }
        // Remove player from wheel
        setWheels(wheels => wheels.map((w, i) => i === idx ? { ...w, items: w.items.filter(item => item !== player), selected: null } : w));
        setSellModal({ open: false, player: '', team: teamNames[0], price: 100 });
        setModal({ open: false, wheelIdx: null });
    };

    // Use wheels[idx] for normal, wheels[0] for unsold
    const wheel = wheels[idx];
    const subtitle = isUnsoldWheel ? 'Spin for Unsold Players!' : `Pick your ${wheel.title}!`;

    // Use a yellow/black theme for the wheel segments
    const wheelData = (wheel.items || []).map((item) => ({
        option: item,
        style: {
            backgroundColor: isUnsoldWheel ? '#888' : '#ffd600',
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
    }));

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
                            spinDuration={1.2}
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
                            <div className="playerlist-listwrap">
                                {wheel.items.length === 0 ? (
                                    <span style={{ color: '#888' }}>No items</span>
                                ) : (
                                    <ul className="playerlist-list">
                                        {(wheel.items || []).map((item, itemIdx) => (
                                            <li key={itemIdx} className={`playerlist-item${wheel.selected === item ? ' selected' : ''}`}>
                                                <span className="playerlist-dot"></span>
                                                <span className="playerlist-name">{item}</span>
                                                <button
                                                    className="remove-btn"
                                                    title="Remove item"
                                                    onClick={() => handleRemoveItem(itemIdx)}
                                                >
                                                    ❌
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
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
                                onClick={() => setSellModal({ open: true, player: wheel.selected, team: teamNames[0], price: 100 })}
                            >
                                Sold To
                            </button>
                            <button
                                className="spin-button download-button"
                                onClick={hideChoice}
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
            {/* Sell Modal */}
            {sellModal.open && (
                <div className="modal-overlay flex items-center justify-center">
                    <div className="sell-modal">
                        <div className="sell-modal-title">Sell Player</div>
                        <div className="sell-modal-player">{sellModal.player}</div>
                        <div className="sell-modal-team-row">
                            <button
                                className={`sell-modal-team-btn${sellModal.team === teamNames[0] ? ' selected' : ''}`}
                                onClick={() => setSellModal(s => ({ ...s, team: teamNames[0] }))}
                            >
                                {teamNames[0]}
                            </button>
                            <button
                                className={`sell-modal-team-btn${sellModal.team === teamNames[1] ? ' selected' : ''}`}
                                onClick={() => setSellModal(s => ({ ...s, team: teamNames[1] }))}
                            >
                                {teamNames[1]}
                            </button>
                        </div>
                        <div className="sell-modal-bid-row">
                            <button className="sell-modal-bid-btn" onClick={() => setSellModal(s => ({ ...s, price: Math.max(0, s.price - (s.price > 200 ? 20 : 10)) }))}>-</button>
                            <input
                                type="number"
                                className="sell-modal-bid-input"
                                value={sellModal.price}
                                min={0}
                                onChange={e => {
                                    let val = Number(e.target.value);
                                    if (isNaN(val)) val = 0;
                                    setSellModal(s => ({ ...s, price: Math.max(0, val) }));
                                }}
                            />
                            <button className="sell-modal-bid-btn" onClick={() => setSellModal(s => ({ ...s, price: s.price + (s.price >= 200 ? 20 : 10) }))}>+</button>
                        </div>
                        <div className="sell-modal-action-row">
                            <button
                                className="sell-modal-confirm-btn"
                                onClick={handleConfirmSale}
                            >
                                Confirm Sale
                            </button>
                            <button
                                className="sell-modal-cancel-btn"
                                onClick={() => setSellModal({ open: false, player: '', team: teamNames[0], price: 100 })}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default WheelPage; 