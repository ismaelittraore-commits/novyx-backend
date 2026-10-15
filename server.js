
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const TMDB_API_KEY = '8265bd1679663a7ea12ac168da84d2e8';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

app.get('/', (req, res) => {
    res.send('Serveur Backend Novyx - Mode Scraper VF Actif');
});

async function getImdbId(type, tmdbId) {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/${type}/${tmdbId}/external_ids?api_key=${TMDB_API_KEY}`);
        const data = await response.json();
        return data.imdb_id || null;
    } catch (e) {
        return null;
    }
}

// Endpoint principal avec sources VF prioritaires (Frembed / Vidsrc FR / Superembed)
app.get('/api/source/:type/:id', async (req, res) => {
    const { type, id } = req.params;
    const season = req.query.season || 1;
    const episode = req.query.episode || 1;
    const preferredServer = req.query.server || 'vidsrcme_fr';

    try {
        const imdbId = await getImdbId(type, id);
        const mediaId = imdbId || id;

        let sources = [];

        if (type === 'movie') {
            sources = [
                // Source 1 : Frembed / Lecteur spécialisé VF
                { name: 'frembed', url: `https://frembed.live/api/film.php?id=${id}` },
                // Source 2 : VidSrc VF forcée
                { name: 'vidsrcme_fr', url: `https://vidsrc.me/embed/movie?imdb=${mediaId}&ds_lang=fr` },
                // Source 3 : Multiembed / VF/Multi
                { name: 'multiembed', url: `https://multiembed.mov/?video_id=${mediaId}&tmdb=1` },
                // Source 4 : Vidbinge
                { name: 'vidbinge', url: `https://vidbinge.dev/embed/movie/${id}` }
            ];
        } else {
            // Séries TV (Chica Vampiro, Nowhere Boys, etc.)
            sources = [
                // Source 1 : Frembed TV (Spécialisé Séries VF)
                { name: 'frembed', url: `https://frembed.live/api/serie.php?id=${id}&sa=${season}&epi=${episode}` },
                // Source 2 : VidSrc TV VF
                { name: 'vidsrcme_fr', url: `https://vidsrc.me/embed/tv?imdb=${mediaId}&season=${season}&episode=${episode}&ds_lang=fr` },
                // Source 3 : Multiembed TV
                { name: 'multiembed', url: `https://multiembed.mov/?video_id=${mediaId}&tmdb=1&s=${season}&e=${episode}` },
                // Source 4 : Vidbinge TV
                { name: 'vidbinge', url: `https://vidbinge.dev/embed/tv/${id}/${season}/${episode}` }
            ];
        }

        let selectedUrl = sources[0].url;
        const match = sources.find(s => s.name === preferredServer);
        if (match) selectedUrl = match.url;

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
        console.error('Erreur backend:', error);
        return res.status(500).json({ success: false, message: 'Erreur génération flux.' });
    }
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
