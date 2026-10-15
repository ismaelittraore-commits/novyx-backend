const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Base de données interne des flux directs pour Novyx
const streamDatabase = {
    // Exemple pour tests ou séries spécifiques (Exemple: Chica Vampiro S1E1 - TMDB 60309)
    "tv_60309_s1_e1": [
        { name: "Supervideo Direct (VF)", type: "hls", url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
        { name: "Mixdrop Server (VF)", type: "mp4", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" }
    ]
};

app.get('/', (req, res) => {
    res.send('Backend Novyx - Extracteur de Flux Natif V2 Actif');
});

// Route d'extraction du flux direct
app.get('/api/source/:type/:id', async (req, res) => {
    const { type, id } = req.params;
    const season = req.query.season || 1;
    const episode = req.query.episode || 1;

    const mediaKey = type === 'movie' ? `movie_${id}` : `tv_${id}_s${season}_e${episode}`;

    // 1. Si une source directe personnalisée est enregistrée
    if (streamDatabase[mediaKey] && streamDatabase[mediaKey].length > 0) {
        return res.json({
            success: true,
            mediaKey: mediaKey,
            streamType: streamDatabase[mediaKey][0].type, // 'hls' ou 'mp4'
            directUrl: streamDatabase[mediaKey][0].url,
            sources: streamDatabase[mediaKey]
        });
    }

    // 2. Flux démonstration / fallback de secours natif
    return res.json({
        success: true,
        mediaKey: mediaKey,
        streamType: "hls",
        directUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        sources: [
            { name: "Serveur Streamzo #1 (VF)", type: "hls", url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { name: "Serveur Backup #2 (VF)", type: "mp4", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" }
        ]
    });
});

// Route d'injection de flux direct par l'Admin
app.post('/api/admin/add-direct-stream', (req, res) => {
    const { mediaKey, name, streamType, url } = req.body;
    if (!mediaKey || !url) {
        return res.status(400).json({ success: false, message: 'Paramètres manquants' });
    }

    if (!streamDatabase[mediaKey]) {
        streamDatabase[mediaKey] = [];
    }

    streamDatabase[mediaKey].unshift({ name: name || "Serveur Direct VF", type: streamType || "hls", url: url });
    return res.json({ success: true, message: `Flux direct ajouté pour ${mediaKey}` });
});

app.listen(PORT, () => {
    console.log(`Backend Novyx fonctionnel sur le port ${PORT}`);
});
