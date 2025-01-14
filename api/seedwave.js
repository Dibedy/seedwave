import fs from 'fs';
import path from 'path';

// File path for the seedwave storage
const filePath = path.join('/tmp', 'seedwave.json');

// Function to generate a seedwave level with gradual weighted distribution
function getWeightedSeedwaveLevel() {
    const weights = [5, 10, 20, 25, 20, 15, 5, 5, 3, 2];
    const cumulativeWeights = weights.map((sum => value => sum += value)(0));
    const random = Math.random() * 100;
    for (let i = 0; i < cumulativeWeights.length; i++) {
        if (random < cumulativeWeights[i]) return i + 1;
    }
    return 1; // Fallback level
}

// Function to generate a random duration between 25 minutes and 4 hours (in milliseconds)
function getRandomDuration() {
    const min = 25 * 60 * 1000;
    const max = 4 * 60 * 60 * 1000;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to read the current seedwave data from the file
function readSeedwaveData() {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading seedwave data:', error);
    }
    return null;
}

// Function to write the current seedwave data to the file
function writeSeedwaveData(data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error writing seedwave data:', error);
    }
}

// API handler
function isBloodseed() {
    const chance = 1; // 5% chance for a bloodseed
    return Math.random() < chance;
}

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    let seedwaveData = readSeedwaveData();
    const now = Date.now();

    if (!seedwaveData || now > seedwaveData.expiresAt) {
        const previousSeedwave = seedwaveData && seedwaveData.level
            ? { level: seedwaveData.level, endedAt: seedwaveData.expiresAt }
            : null;

        seedwaveData = {
            level: getWeightedSeedwaveLevel(),
            expiresAt: now + getRandomDuration(),
            isBloodseed: isBloodseed(), // Add bloodseed indicator
            previousSeedwave,
        };

        writeSeedwaveData(seedwaveData);
    }

    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

    res.status(200).json({
        seedwave: seedwaveData.level,
        expiresAt: seedwaveData.expiresAt,
        isBloodseed: seedwaveData.isBloodseed || false,
        previousSeedwave: seedwaveData.previousSeedwave || { level: 'N/A', endedAt: 'N/A' },
        timezone: userTimezone,
    });
}