const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Clé API TMDB
const TMDB_API_KEY = '8265bd1679663a7ea12ac168da84d2e8';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Route de test
app.get('/', (req, res) => {
    res.send('Serveur Backend Novyx VF Multi-Sources - En ligne !');
});

// Helper pour récupérer l'IMDb ID via TMDB
async function getImdbId(type, tmdbId) {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/${type}/${tmdbId}/external_ids?api_key=${TMDB_API_KEY}`);
        const data = await response.json();
        return data.imdb_id || null;
    } catch (e) {
        console.error('Erreur récupération IMDb ID:', e);
        return null;
    }
}

// Endpoint principal pour les liens de streaming (Multi-sources VF)
app.get('/api/source/:type/:id', async (req, res) => {
    const { type, id } = req.params;
    const season = req.query.season || 1;
    const episode = req.query.episode || 1;
    const preferredServer = req.query.server || 'auto';

    try {
        // 1. Récupérer l'IMDb ID
        const imdbId = await getImdbId(type, id);
        const mediaId = imdbId || id;

        // 2. Liste des sources disponibles orientées VF/Multilingue
        let sources = [];

        if (type === 'movie') {
            sources = [
                { name: 'vidsrcme_fr', url: `https://vidsrc.me/embed/movie?imdb=${mediaId}&ds_lang=fr` },
                { name: 'multiembed', url: `https://multiembed.mov/?video_id=${mediaId}&tmdb=1` },
                { name: 'vidsrcpro', url: `https://vidsrc.pro/embed/movie/${id}` },
                { name: 'vidsrcxyz', url: `https://vidsrc.xyz/embed/movie/${id}` }
            ];
        } else {
            // Séries (ex: Chica Vampiro, Nowhere Boys)
            sources = [
                { name: 'vidsrcme_fr', url: `https://vidsrc.me/embed/tv?imdb=${mediaId}&season=${season}&episode=${episode}&ds_lang=fr` },
                { name: 'multiembed', url: `https://multiembed.mov/?video_id=${mediaId}&tmdb=1&s=${season}&e=${episode}` },
                { name: 'vidsrcpro', url: `https://vidsrc.pro/embed/tv/${id}/${season}/${episode}` },
                { name: 'vidsrcxyz', url: `https://vidsrc.xyz/embed/tv/${id}/${season}/${episode}` }
            ];
        }

        // 3. Choix de l'URL finale
        let selectedUrl = sources[0].url;

        if (preferredServer !== 'auto') {
            const match = sources.find(s => s.name === preferredServer);
            if (match) selectedUrl = match.url;
        }

        return res.json({
            success: true,
            type: type,
            tmdbId: id,
            imdbId: imdbId,
            season: season,
            episode: episode,
            streamUrl: selectedUrl,
            allSources: sources
        });

    } catch (error) {
        console.error('Erreur traitement backend:', error);
        return res.status(500).json({ success: false, message: 'Erreur lors de la génération du flux.' });
    }
});

app.listen(PORT, () => {
    console.log(`Serveur Novyx démarré sur le port ${PORT}`);
});
