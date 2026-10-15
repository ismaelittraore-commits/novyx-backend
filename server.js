const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const TMDB_API_KEY = '8265bd1679663a7ea12ac168da84d2e8';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Base de données en mémoire pour les liens hébergeurs VF personnalisés (Streamzo Style)
// Tu peux ajouter ici les liens directs d'hébergeurs (Doodstream, Streamtape, Supervideo, Vidoza)
const customLinks = {
    // Exemple pour une série spécifique (TMDB ID pour Chica Vampiro = 60309)
    "tv_60309_s1_e1": [
        { provider: "Doodstream (VF)", url: "https://doodstream.com/e/example_chica_s1e1" },
        { provider: "Streamtape (VF)", url: "https://streamtape.com/e/example_chica_s1e1" },
        { provider: "Supervideo (VF)", url: "https://supervideo.tv/e/example_chica_s1e1" }
    ]
};

app.get('/', (req, res) => {
    res.send('Serveur Backend Novyx - Mode Streamzo VF Actif');
});

// Récupérer les liens d'un média
app.get('/api/source/:type/:id', async (req, res) => {
    const { type, id } = req.params;
    const season = req.query.season || 1;
    const episode = req.query.episode || 1;
    const serverKey = req.query.server || 'auto';

    const mediaKey = type === 'movie' ? `movie_${id}` : `tv_${id}_s${season}_e${episode}`;
    
    let availableSources = [];

    // 1. Vérifier si un lien hébergeur personnalisé existe dans la base Novyx
    if (customLinks[mediaKey] && customLinks[mediaKey].length > 0) {
        availableSources = customLinks[mediaKey].map(item => ({
            name: item.provider,
            url: item.url,
            type: 'custom'
        }));
    }

    // 2. Fallbacks sur les résolveurs d'hébergeurs VF globaux
    availableSources.push(
        { name: 'Supervideo / Dood (VF)', url: `https://vidsrc.me/embed/${type}?tmdb=${id}${type === 'tv' ? `&season=${season}&episode=${episode}` : ''}&ds_lang=fr`, type: 'embed' },
        { name: 'Streamtape / Multi (VF)', url: `https://multiembed.mov/?video_id=${id}&tmdb=1${type === 'tv' ? `&s=${season}&e=${episode}` : ''}`, type: 'embed' },
        { name: 'Vidbinge (HD)', url: `https://vidbinge.dev/embed/${type}/${id}${type === 'tv' ? `/${season}/${episode}` : ''}`, type: 'embed' }
    );

    let selected = availableSources[0];
    if (serverKey !== 'auto') {
        const found = availableSources.find(s => s.name.toLowerCase().includes(serverKey.toLowerCase()));
        if (found) selected = found;
    }

    return res.json({
        success: true,
        mediaKey: mediaKey,
        streamUrl: selected.url,
        sources: availableSources
    });
});

// Endpoint pour ajouter facilement un lien d'hébergeur VF (Panel Streamzo)
app.post('/api/admin/add-link', (req, res) => {
    const { mediaKey, provider, url } = req.body;
    if (!mediaKey || !provider || !url) {
        return res.status(400).json({ success: false, message: 'Paramètres manquants' });
    }

    if (!customLinks[mediaKey]) {
        customLinks[mediaKey] = [];
    }

    customLinks[mediaKey].unshift({ provider, url });
    return res.json({ success: true, message: `Lien ajouté pour ${mediaKey}`, links: customLinks[mediaKey] });
});

app.listen(PORT, () => {
    console.log(`Serveur Novyx (Streamzo Architecture) démarré sur le port ${PORT}`);
});
