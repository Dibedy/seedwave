import { promises as fs } from 'fs';
import path from 'path';

// File to store seedwave state
const dataFilePath = path.join(process.cwd(), 'seedwaveData.json');

// Function to generate a seedwave level with gradual weighted distribution
function getWeightedSeedwaveLevel() {
    const weights = [5, 10, 20, 25, 20, 15, 5, 5, 3, 2];
    const cumulativeWeights = weights.map((sum => value => sum += value)(0));
    const random = Math.random() * 100;
    for (let i = 0; i < cumulativeWeights.length; i++) {
        if (random < cumulativeWeights[i]) return i + 1;
    }
}

// Function to generate a random duration between 25 minutes and 4 hours (in milliseconds)
function getRandomDuration() {
    const min = 25 * 60 * 1000; // 25 minutes
    const max = 4 * 60 * 60 * 1000; // 4 hours
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function getSeedwaveData() {
    try {
        // Read existing data
        const data = JSON.parse(await fs.readFile(dataFilePath, 'utf-8'));
        const now = Date.now();

        // Check if current seedwave has expired
        if (now > data.currentSeedwave.expiresAt) {
            // Update seedwave data
            data.previousSeedwave = {
                level: data.currentSeedwave.level,
                endedAt: data.currentSeedwave.expiresAt,
            };
            data.currentSeedwave = {
                level: getWeightedSeedwaveLevel(),
                expiresAt: now + getRandomDuration(),
            };
            // Save updated data to the file
            await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
        }
        return data;
    } catch (error) {
        // Initialize data if the file doesn't exist
        const now = Date.now();
        const initialData = {
            currentSeedwave: {
                level: getWeightedSeedwaveLevel(),
                expiresAt: now + getRandomDuration(),
            },
            previousSeedwave: { level: 'N/A', endedAt: 'N/A' },
        };
        // Write initial data to the file
        await fs.writeFile(dataFilePath, JSON.stringify(initialData, null, 2), 'utf-8');
        return initialData;
    }
}

export default async function handler(req, res) {
    const seedwaveData = await getSeedwaveData();
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Allow CORS for the API
    res.setHeader('Access-Control-Allow-Origin', '*');

    res.status(200).json({
        seedwave: seedwaveData.currentSeedwave.level,
        expiresAt: seedwaveData.currentSeedwave.expiresAt,
        previousSeedwave: seedwaveData.previousSeedwave,
        timezone: userTimezone,
    });
}
