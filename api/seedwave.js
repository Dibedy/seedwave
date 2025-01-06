// Track the current and last seedwave
let currentSeedwave = {
    level: Math.floor(Math.random() * 10) + 1, // Initial seedwave (1-10)
    expiresAt: Date.now() + Math.floor(Math.random() * 60 + 1) * 60 * 1000, // Expiration in 1-60 minutes
};

let lastSeedwave = null; // Store the last seedwave details

export default function handler(req, res) {
    const now = Date.now();

    // If the seedwave has expired, generate a new one
    if (now > currentSeedwave.expiresAt) {
        // Move the current seedwave to the lastSeedwave
        lastSeedwave = {
            level: currentSeedwave.level,
            endedAt: currentSeedwave.expiresAt,
        };

        // Generate a new seedwave
        currentSeedwave = {
            level: Math.floor(Math.random() * 10) + 1,
            expiresAt: now + Math.floor(Math.random() * 60 + 1) * 60 * 1000,
        };
    }

    // Respond with both current and last seedwave data
    res.status(200).json({
        seedwave: currentSeedwave.level,
        expiresAt: currentSeedwave.expiresAt, // Current seedwave expiration
        previousSeedwave: lastSeedwave || { level: 'N/A', endedAt: 'N/A' }, // Last seedwave details
    });
}
