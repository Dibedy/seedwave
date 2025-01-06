let currentSeedwave = Math.floor(Math.random() * 10) + 1; // Initial seedwave (1-10)
let seedwaveExpires = Date.now() + Math.floor(Math.random() * 60 + 1) * 60 * 1000; // Expiration in 1-60 minutes

export default function handler(req, res) {
    const now = Date.now();

    // If the seedwave has expired, generate a new one
    if (now > seedwaveExpires) {
        currentSeedwave = Math.floor(Math.random() * 10) + 1;
        seedwaveExpires = now + Math.floor(Math.random() * 60 + 1) * 60 * 1000;
    }

    res.status(200).json({
        seedwave: currentSeedwave,
        expiresAt: seedwaveExpires, // Send absolute expiration timestamp in UTC
    });
}
