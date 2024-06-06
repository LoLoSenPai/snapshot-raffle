import { NextResponse } from 'next/server';

function selectWinners(data, numberOfWinners) {
    const tickets = [];

    data.forEach(entry => {
        const count = parseInt(entry.difference, 10);
        for (let i = 0; i < count; i++) {
            tickets.push(entry.address);
        }
    });

    shuffleArray(tickets);

    const winners = new Set();
    while (winners.size < numberOfWinners && winners.size < tickets.length) {
        const winner = tickets[Math.floor(Math.random() * tickets.length)];
        winners.add(winner);
    }

    return Array.from(winners);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export async function POST(request) {
    const { numWinners, holdersData } = await request.json();
    const winners = selectWinners(holdersData, numWinners);
    return NextResponse.json({ winners });
}