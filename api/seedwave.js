import fs from 'fs';
import path from 'path';

const SEEDWAVE_FILE = path.resolve('./seedwave.json');

// Function to generate a seedwave level with gradual weighted distribution
function getWeightedSeedwaveLevel() {
    const weights = [
        5,   // Level 1
        10,  // Level 2
        20,  // Level 3
        25,  // Level 4
        20,  // Level 5
        15,  // Level 6
        5,   // Level 7
        5,   // Level 8
        3,   // Level 9
        2,   // Level 10
    ];

    // Create cumulative weights
    const cumulativeWeights = weights.map((sum => value => sum += value)(0));
    const random = Math.random() * 100;

    // Determine the level based on cumulative weights
    for (let i = 0; i < cumulativeWeights.length; i++) {
        if (random < cumulativeWeights[i]) return i + 1;
    }
}

// Function to generate a random duration between 25 minutes and 4 hours (in milliseconds)
function getRandomDuration() {
    const min = 25 * 60 * 1000; // 25 minutes in milliseconds
    const max = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Load seedwave data from file
function loadSeedwave() {
    try {
        const data = JSON.parse(fs.readFileSync(SEEDWAVE_FILE, 'utf8'));
        return data;
    } catch (error) {
        return {
            currentSeedwave: {
                level: getWeightedSeedwaveLevel(),
                expiresAt: Date.now() + getRandomDuration(),
            },
            lastSeedwave: null,
        };
    }
}

// Save seedwave data to file
function saveSeedwave(data) {
    fs.writeFileSync(SEEDWAVE_FILE, JSON.stringify(data, null, 2), 'utf8');
}

let { currentSeedwave, lastSeedwave } = loadSeedwave();

// API handler
export default function handler(req, res) {
    const now = Date.now();

    // If the seedwave has expired, generate a new one
    if (now > currentSeedwave.expiresAt) {
        lastSeedwave = {
            level: currentSeedwave.level,
            endedAt: currentSeedwave.expiresAt,
        };

        currentSeedwave = {
            level: getWeightedSeedwaveLevel(),
            expiresAt: now + getRandomDuration(),
        };

        saveSeedwave({ currentSeedwave, lastSeedwave });
    }

    // Add CORS headers to the response
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    res.status(200).json({
        seedwave: currentSeedwave.level,
        expiresAt: currentSeedwave.expiresAt,
        previousSeedwave: lastSeedwave || null,
    });
}
