import React, { createContext, useContext, useState, useEffect } from 'react';

const TeamNamesContext = createContext();

export function TeamNamesProvider({ children }) {
    const getInitialNames = () => {
        try {
            const teams = JSON.parse(localStorage.getItem('auctionTeams')) || [];
            if (Array.isArray(teams) && teams.length >= 2) {
                return [teams[0].name, teams[1].name];
            }
        } catch { }
        return ['Team A', 'Team B'];
    };
    const [teamNames, setTeamNames] = useState(getInitialNames);

    useEffect(() => {
        const handleStorage = (e) => {
            if (e.key === 'auctionTeams') setTeamNames(getInitialNames());
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    return (
        <TeamNamesContext.Provider value={{ teamNames, setTeamNames }}>
            {children}
        </TeamNamesContext.Provider>
    );
}

export function useTeamNames() {
    return useContext(TeamNamesContext);
} 