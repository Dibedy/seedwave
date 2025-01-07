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

// Function to generate a random duration between 30 minutes and 4 hours (in milliseconds)
function getRandomDuration() {
    const min = 0.2 * 60 * 1000; // 20 minutes in milliseconds
    const max = 0.1 * 60 * 1000; // 4 hours in milliseconds
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate the seedwave level
let currentSeedwave = {
    level: getWeightedSeedwaveLevel(),
    expiresAt: Date.now() + getRandomDuration(),
};

let lastSeedwave = null;

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
    }

    res.status(200).json({
        seedwave: currentSeedwave.level,
        expiresAt: currentSeedwave.expiresAt,
        previousSeedwave: lastSeedwave || { level: 'N/A', endedAt: 'N/A' },
    });
}
