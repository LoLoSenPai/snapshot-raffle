'use client';

import { useState } from 'react';

export default function RaffleForm() {
    const [numWinners, setNumWinners] = useState(1);
    const [winners, setWinners] = useState([]);
    const [holdersData, setHoldersData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState(false);

    const handleNumWinnersChange = (e) => {
        setNumWinners(e.target.value);
    };

    const fetchHoldersAndListings = async () => {
        setLoading(true);
        const response = await fetch('/api/holders-and-listings', {
            method: 'GET',
        });
        const data = await response.json();
        setHoldersData(data.holders);
        setLoading(false);
        setFetched(true);
    };

    const drawWinners = async () => {
        const response = await fetch('/api/draw', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ numWinners: parseInt(numWinners, 10), holdersData }),
        });
        const data = await response.json();
        setWinners(data.winners);
    };

    return (
        <div className='bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md space-y-4'>
            <h1 className='text-2xl font-bold mb-4'>Giveaway du mois</h1>
            <button
                onClick={fetchHoldersAndListings}
                className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full'
                disabled={loading}
            >
                {loading ? 'Fetching...' : 'Fetch Holders and Listings'}
            </button>
            {fetched && (
                <div className='mt-4 space-y-2'>
                    <div className='flex flex-col space-y-2'>
                        <label className='block'>
                            Number of Winners:
                            <input
                                type="number"
                                value={numWinners}
                                onChange={handleNumWinnersChange}
                                className='text-black p-2 rounded mt-1 block w-full'
                                min="1"
                            />
                        </label>
                        <button
                            onClick={drawWinners}
                            className='bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full'
                        >
                            Draw Winners
                        </button>
                    </div>
                    <div>
                        <h2 className='text-xl font-bold mt-4'>Winners</h2>
                        <ul className='list-disc list-inside'>
                            {winners.map((winner, index) => (
                                <li key={index}>{winner}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
            {fetched && (
                <div className='mt-4'>
                    <h2 className='text-xl font-bold'>CSV Data</h2>
                    <pre className='bg-gray-700 p-4 rounded text-sm overflow-x-auto'>{JSON.stringify(holdersData, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}
