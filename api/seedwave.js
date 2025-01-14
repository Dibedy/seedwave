import fs from 'fs';
import path from 'path';

const filePath = path.join('/tmp', 'seedwave.json');

function getWeightedSeedwaveLevel() {
    const weights = [5, 10, 20, 25, 20, 15, 5, 5, 3, 2];
    const cumulativeWeights = weights.map((sum => value => sum += value)(0));
    const random = Math.random() * 100;
    for (let i = 0; i < cumulativeWeights.length; i++) {
        if (random < cumulativeWeights[i]) return i + 1;
    }
    return 1;
}

function getRandomDuration() {
    const min = 0.07 * 60 * 1000;
    const max = 0.1 * 60 * 1000;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function readSeedwaveData() {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8');
            const parsedData = JSON.parse(data);
            if (!parsedData.previousSeedwave) {
                parsedData.previousSeedwave = { level: 'N/A', endedAt: 'N/A' };
            }
            return parsedData;
        }
    } catch (error) {
        console.error('Error reading seedwave data:', error);
    }
    return null;
}


function writeSeedwaveData(data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error writing seedwave data:', error);
    }
}

function isBloodseed() {
    const chance = 0.05;
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
            : seedwaveData && seedwaveData.previousSeedwave
            ? seedwaveData.previousSeedwave
            : { level: 'N/A', endedAt: 'N/A' };

        seedwaveData = {
            level: getWeightedSeedwaveLevel(),
            expiresAt: now + getRandomDuration(),
            isBloodseed: isBloodseed(),
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
