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
        <div className='w-full lg:w-[700px] p-6 space-y-4 bg-gray-800 rounded-lg shadow-md'>
            <h1 className='mb-4 text-2xl font-bold'>Giveaway du mois</h1>
            <button
                onClick={fetchHoldersAndListings}
                className='w-full px-4 py-2 font-bold text-white bg-blue-600 rounded hover:bg-blue-700'
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
                                className='block w-full p-2 mt-1 text-black rounded'
                                min="1"
                            />
                        </label>
                        <button
                            onClick={drawWinners}
                            className='w-full px-4 py-2 font-bold text-white bg-green-600 rounded hover:bg-green-700'
                        >
                            Draw Winners
                        </button>
                    </div>
                    <div>
                        <h2 className='mt-4 text-xl font-bold'>Winners</h2>
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
                    <pre className='p-4 overflow-x-auto text-sm bg-gray-700 rounded'>{JSON.stringify(holdersData, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}
