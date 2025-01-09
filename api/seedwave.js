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

    const cumulativeWeights = weights.map((sum => value => sum += value)(0));
    const random = Math.random() * 100;

    for (let i = 0; i < cumulativeWeights.length; i++) {
        if (random < cumulativeWeights[i]) return i + 1;
    }
}

// Fixed seedwave duration (global synchronization)
const SEEDWAVE_DURATION = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

// Seedwave state
let seedwaveState = {
    level: getWeightedSeedwaveLevel(),
    expiresAt: Date.now() + SEEDWAVE_DURATION,
    startedAt: Date.now(),
};

// Function to reset the seedwave if expired
function updateSeedwave() {
    const now = Date.now();
    if (now > seedwaveState.expiresAt) {
        seedwaveState = {
            level: getWeightedSeedwaveLevel(),
            expiresAt: now + SEEDWAVE_DURATION,
            startedAt: now,
        };
    }
}

// API handler
export default function handler(req, res) {
    // Ensure seedwave state is up-to-date
    updateSeedwave();

    // Fetch the user's timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({
        seedwave: seedwaveState.level,
        startedAt: seedwaveState.startedAt,
        expiresAt: seedwaveState.expiresAt,
        timezone: userTimezone,
    });
}
