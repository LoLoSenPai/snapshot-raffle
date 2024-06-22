import { NextResponse } from 'next/server';
import { Alchemy, Network } from 'alchemy-sdk';

const collectionAddress = process.env.COLLECTION_ADDRESS;
const collectionSlug = process.env.COLLECTION_SLUG;

const alchemySettings = {
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(alchemySettings);

async function fetchHolders() {
    let holders = [];
    let pageKey = null;

    try {
        do {
            const response = await alchemy.nft.getOwnersForContract(collectionAddress, { withTokenBalances: true, pageKey });

            if (response?.owners && response.owners.length > 0) {
                response.owners.forEach(owner => {
                    const balance = owner.tokenBalances.reduce((sum, token) => sum + parseInt(token.balance, 10), 0);
                    holders.push({
                        address: owner.ownerAddress.toLowerCase(),
                        balance: balance
                    });
                });
            }

            pageKey = response.pageKey || null;
        } while (pageKey);

        return holders;
    } catch (error) {
        console.error('Error fetching holders:', error);
        return [];
    }
}

async function fetchListings(cursor = '') {
    let listings = [];
    let hasNextPage = true;

    try {
        while (hasNextPage) {
            const url = `https://api.opensea.io/api/v2/listings/collection/${collectionSlug}/all?limit=100${cursor ? `&cursor=${cursor}` : ''}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    'x-api-key': process.env.OPENSEA_API_KEY,
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            listings = listings.concat(data.listings);
            cursor = data.next;
            hasNextPage = !!cursor;
        }
        return listings;
    } catch (error) {
        console.error('Error fetching listings:', error);
        return [];
    }
}

async function countListingsByAddress() {
    const listings = await fetchListings();
    const addressCount = {};
    const expiredListings = {};

    listings.forEach(listing => {
        const { offerer, offer, startTime, endTime } = listing.protocol_data.parameters;
        const now = Math.floor(Date.now() / 1000); // Get current time in seconds

        // Check if the offer is active
        if (now >= startTime && now <= endTime) {
            offer.forEach(item => {
                if (item.itemType === 3 && item.token.toLowerCase() === collectionAddress.toLowerCase()) {
                    if (addressCount[offerer.toLowerCase()]) {
                        addressCount[offerer.toLowerCase()] += parseInt(item.startAmount, 10);
                    } else {
                        addressCount[offerer.toLowerCase()] = parseInt(item.startAmount, 10);
                    }
                }
            });
        } else {
            if (!expiredListings[offerer.toLowerCase()]) {
                expiredListings[offerer.toLowerCase()] = [];
            }
            expiredListings[offerer.toLowerCase()].push({ startTime, endTime });
        }
    });

    return { addressCount, expiredListings };
}

export async function GET() {
    const holders = await fetchHolders();
    const { addressCount, expiredListings } = await countListingsByAddress();

    const combinedData = holders.map(holder => ({
        address: holder.address,
        balance: holder.balance,
        listings: addressCount[holder.address] || 0,
        expiredListings: expiredListings[holder.address] || [],
        difference: holder.balance - (addressCount[holder.address] || 0)
    }));

    combinedData.sort((a, b) => b.difference - a.difference);

    return NextResponse.json({ holders: combinedData });
}
