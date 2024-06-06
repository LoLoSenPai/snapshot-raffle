import { NextResponse } from 'next/server';
import { Alchemy, Network } from 'alchemy-sdk';
import axios from 'axios';

const API_KEY_ALCHEMY = 'mzVmh-ZF7Z3wgWhiie6JWADKb-kZdU_v';
const API_KEY_OPENSEA = '664425daeeeb45d29c5b1339526cd553';
const COLLECTION_ADDRESS = '0xe2a5bfbbd797689819067ed50348a0de8e1db018';
const COLLECTION_SLUG = 'monsieurabbit-genesis-collection';

const alchemySettings = {
    apiKey: API_KEY_ALCHEMY,
    network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(alchemySettings);

async function fetchHolders() {
    let holders = [];
    let pageKey = null;

    try {
        do {
            const response = await alchemy.nft.getOwnersForContract(COLLECTION_ADDRESS, { withTokenBalances: true, pageKey });

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
            const url = `https://api.opensea.io/api/v2/listings/collection/${COLLECTION_SLUG}/all?limit=100${cursor ? `&cursor=${cursor}` : ''}`;
            const response = await axios.get(url, {
                headers: {
                    accept: 'application/json',
                    'x-api-key': API_KEY_OPENSEA,
                },
            });
            listings = listings.concat(response.data.listings);
            cursor = response.data.next;
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

    listings.forEach(listing => {
        const offerer = listing.protocol_data.parameters.offerer.toLowerCase();
        if (addressCount[offerer]) {
            addressCount[offerer]++;
        } else {
            addressCount[offerer] = 1;
        }
    });

    return addressCount;
}

export async function GET() {
    const holders = await fetchHolders();
    const listingsCount = await countListingsByAddress();

    const combinedData = holders.map(holder => ({
        address: holder.address,
        balance: holder.balance,
        listings: listingsCount[holder.address] || 0,
        difference: holder.balance - (listingsCount[holder.address] || 0)
    }));

    // Order by difference (balance - listings)
    combinedData.sort((a, b) => b.difference - a.difference);

    return NextResponse.json({ holders: combinedData });
}
