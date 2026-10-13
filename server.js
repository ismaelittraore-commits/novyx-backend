const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Serveur Backend Novyx VF - En ligne !');
});

app.get('/api/source/:type/:id', async (req, res) => {
    const { type, id } = req.params;
    const { season, episode } = req.query;

    try {
        const tmdbUrl = `https://api.themoviedb.org/3/${type}/${id}?api_key=8265bd1679663a7ea12ac168da84d2e8&language=fr-FR`;
        const tmdbRes = await axios.get(tmdbUrl);
        const title = tmdbRes.data.title || tmdbRes.data.name;

        let embedUrl = "";
        if (type === 'movie') {
            embedUrl = `https://vidsrc.icu/embed/movie/${id}`;
        } else {
            embedUrl = `https://vidsrc.icu/embed/tv/${id}/${season || 1}/${episode || 1}`;
        }

        res.json({
            success: true,
            title: title,
            streamUrl: embedUrl,
            language: "VF / French"
        });

    } catch (error) {
        console.error("Erreur serveur :", error.message);
        res.status(500).json({ success: false, error: "Impossible de récupérer le flux VF." });
    }
});

app.listen(PORT, () => {
    console.log(`Serveur Novyx VF lancé sur le port ${PORT}`);
});
