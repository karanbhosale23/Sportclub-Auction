import React, { useState, useEffect, useRef } from 'react';

function AuctionPage() {
    // Load from localStorage or use default
    const basePrice = 100;
    const getInitialTeams = () => {
        const saved = localStorage.getItem('auctionTeams');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return [
                    { name: 'Team A', players: Array.from({ length: 11 }, (_, i) => ({ name: `player${i + 1}`, price: basePrice })), budget: 900 },
                    { name: 'Team B', players: Array.from({ length: 11 }, (_, i) => ({ name: `player${i + 1}`, price: basePrice })), budget: 900 },
                ];
            }
        }
        return [
            { name: 'Team A', players: Array.from({ length: 11 }, (_, i) => ({ name: `player${i + 1}`, price: basePrice })), budget: 900 },
            { name: 'Team B', players: Array.from({ length: 11 }, (_, i) => ({ name: `player${i + 1}`, price: basePrice })), budget: 900 },
        ];
    };
    const [teams, setTeams] = useState(getInitialTeams);
    const [editingTeamIdx, setEditingTeamIdx] = useState(null);
    const [editTeamName, setEditTeamName] = useState('');
    const [betForm, setBetForm] = useState({ teamIdx: 0, player: '', price: 100 });
    const [editingPlayer, setEditingPlayer] = useState({ teamIdx: null, playerIdx: null, name: '', price: 100 });
    const priceInputRef = useRef(null);
    const maxPlayers = 11;
    const minPrice = 100;

    // Auto-focus and select price input when editing a player
    useEffect(() => {
        if (editingPlayer.teamIdx !== null && priceInputRef.current) {
            priceInputRef.current.focus();
            priceInputRef.current.select();
        }
    }, [editingPlayer.teamIdx, editingPlayer.playerIdx]);

    // Dynamic step for betting amount
    const handleBetInput = (field, value) => {
        if (field === 'price') {
            let val = Number(value);
            if (isNaN(val)) val = minPrice;
            // Snap to step
            if (val < 200) val = Math.round((val - 100) / 10) * 10 + 100;
            else val = Math.round((val - 200) / 20) * 20 + 200;
            if (val < minPrice) val = minPrice;
            setBetForm(f => ({ ...f, [field]: val }));
        } else {
            setBetForm(f => ({ ...f, [field]: value }));
        }
    };
    const handleAddBet = (e) => {
        e.preventDefault();
        const { teamIdx, player, price } = betForm;
        if (!player.trim() || isNaN(price) || price < basePrice) return;
        setTeams(teams => teams.map((t, i) => {
            if (i === Number(teamIdx) && t.players.length < maxPlayers && t.budget >= (price - basePrice)) {
                return {
                    ...t,
                    players: [...t.players, { name: player.trim(), price: Number(price) }],
                    budget: t.budget - (Number(price) - basePrice),
                };
            }
            return t;
        }));
        setBetForm(f => ({ ...f, player: '', price: basePrice }));
    };

    // Team name editing
    const startEditTeam = (idx, name) => {
        setEditingTeamIdx(idx);
        setEditTeamName(name);
    };
    const saveEditTeam = (idx) => {
        setTeams(teams => teams.map((t, i) => i === idx ? { ...t, name: editTeamName.trim() || t.name } : t));
        setEditingTeamIdx(null);
        setEditTeamName('');
    };
    const cancelEditTeam = () => {
        setEditingTeamIdx(null);
        setEditTeamName('');
    };

    // Player editing
    const startEditPlayer = (teamIdx, playerIdx, player) => {
        setEditingPlayer({ teamIdx, playerIdx, name: player.name, price: player.price });
    };
    const cancelEditPlayer = () => {
        setEditingPlayer({ teamIdx: null, playerIdx: null, name: '', price: 100 });
    };
    const handleEditPlayerInput = (field, value) => {
        if (field === 'price') {
            // Allow empty string for manual clearing
            if (value === '') {
                setEditingPlayer(p => ({ ...p, [field]: '' }));
                return;
            }
            let val = Number(value);
            if (isNaN(val)) val = '';
            setEditingPlayer(p => ({ ...p, [field]: val }));
        } else {
            setEditingPlayer(p => ({ ...p, [field]: value }));
        }
    };
    const saveEditPlayer = () => {
        const { teamIdx, playerIdx, name, price } = editingPlayer;
        let finalPrice = Number(price);
        if (teamIdx === null || playerIdx === null || !name.trim() || isNaN(finalPrice) || finalPrice < basePrice) finalPrice = basePrice;
        setTeams(teams => teams.map((t, i) => {
            if (i === teamIdx) {
                // Calculate budget adjustment (only price above basePrice counts)
                const oldPrice = t.players[playerIdx].price;
                const newBudget = t.budget + (oldPrice - basePrice) - (finalPrice - basePrice);
                if (newBudget < 0) return t; // Don't allow over budget
                const newPlayers = t.players.map((p, idx) => idx === playerIdx ? { name: name.trim(), price: finalPrice } : p);
                return { ...t, players: newPlayers, budget: newBudget };
            }
            return t;
        }));
        cancelEditPlayer();
    };

    // Persist teams to localStorage
    useEffect(() => {
        localStorage.setItem('auctionTeams', JSON.stringify(teams));
    }, [teams]);

    // Add this style block at the top of the component (inside the component, before return)
    const priceAlignStyle = `
.player-price-align {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 48px;
  max-width: 60px;
  text-align: right;
  height: 100%;
  font-variant-numeric: tabular-nums;
}
`;

    return (
        <div className="auction-root">
            <style>{priceAlignStyle}</style>
            <div className="auction-header">
                <h1>Team Auction</h1>
                <button className="clear-btn" onClick={() => {
                    if (window.confirm('Are you sure you want to clear all auction data?')) {
                        setTeams([
                            { name: 'Team A', players: Array.from({ length: 11 }, (_, i) => ({ name: `player${i + 1}`, price: basePrice })), budget: 900 },
                            { name: 'Team B', players: Array.from({ length: 11 }, (_, i) => ({ name: `player${i + 1}`, price: basePrice })), budget: 900 },
                        ]);
                        localStorage.removeItem('auctionTeams');
                    }
                }}>Clear Auction Data</button>
            </div>
            <div className="teams-container">
                {teams.map((team, i) => (
                    <div className="team-card" key={i}>
                        <div className="team-header">
                            {editingTeamIdx === i ? (
                                <>
                                    <input className="team-name-input"
                                        value={editTeamName}
                                        onChange={e => setEditTeamName(e.target.value)}
                                        onBlur={() => saveEditTeam(i)}
                                        onKeyDown={e => { if (e.key === 'Enter') saveEditTeam(i); if (e.key === 'Escape') cancelEditTeam(); }}
                                        autoFocus
                                    />
                                    <button className="icon-btn save-btn" onClick={() => saveEditTeam(i)}>✓</button>
                                    <button className="icon-btn cancel-btn" onClick={cancelEditTeam}>✕</button>
                                </>
                            ) : (
                                <>
                                    <span className="team-name">{team.name}</span>
                                    <button className="icon-btn edit-btn" onClick={() => startEditTeam(i, team.name)}>
                                        <img src="/edit.svg" alt="Edit" />
                                    </button>
                                </>
                            )}
                        </div>
                        <div className="team-budget">
                            Budget: <span>{team.budget}</span> / 2000
                        </div>
                        <ul className="player-list">
                            {team.players.map((p, idx) => (
                                <li className="player-row" key={idx}>
                                    {editingPlayer.teamIdx === i && editingPlayer.playerIdx === idx ? (
                                        <>
                                            <input className="player-name-input"
                                                type="text"
                                                value={editingPlayer.name}
                                                onChange={e => handleEditPlayerInput('name', e.target.value)}
                                            />
                                            <input className="player-price-input"
                                                type="number"
                                                min={minPrice}
                                                max={team.budget + p.price}
                                                value={editingPlayer.price === 0 ? '' : editingPlayer.price}
                                                onChange={e => handleEditPlayerInput('price', e.target.value)}
                                                ref={priceInputRef}
                                                onFocus={e => e.target.select()}
                                            />
                                            <button className="icon-btn save-btn" onClick={saveEditPlayer}>✓</button>
                                            <button className="icon-btn cancel-btn" onClick={cancelEditPlayer}>✕</button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="player-name">{p.name}</span>
                                            <span className="player-price player-price-align">{p.price}</span>
                                            <button className="icon-btn edit-btn" onClick={() => startEditPlayer(i, idx, p)}>
                                                <img src="/edit.svg" alt="Edit" />
                                            </button>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AuctionPage; 