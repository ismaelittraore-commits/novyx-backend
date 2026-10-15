const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Backend Novyx - Mode Intégrateur Intelligent Actif');
});

// Route principale pour récupérer les sources d'embed robustes
app.get('/api/source/:type/:id', (req, res) => {
    const { type, id } = req.params;
    const season = req.query.season || 1;
    const episode = req.query.episode || 1;

    let embedUrl = "";
    let altEmbedUrl = "";

    if (type === 'movie') {
        embedUrl = `https://vidsrc.xyz/embed/movie?tmdb=${id}`;
        altEmbedUrl = `https://vidsrc.icu/embed/movie/${id}`;
    } else {
        embedUrl = `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`;
        altEmbedUrl = `https://vidsrc.icu/embed/tv/${id}/${season}/${episode}`;
    }

    return res.json({
        success: true,
        type: "iframe_embed",
        primaryUrl: embedUrl,
        fallbackUrl: altEmbedUrl
    });
});

app.listen(PORT, () => {
    console.log(`Serveur Novyx Backend prêt sur le port ${PORT}`);
});
