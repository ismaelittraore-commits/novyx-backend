const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Base de données pour tes liens spécifiques (Mode Streamzo)
const streamDatabase = {
    // Tu pourras ajouter tes vrais liens MP4 / M3U8 ici
    "movie_550": {
        streamType: "mp4",
        directUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    }
};

app.get('/', (req, res) => {
    res.send('Backend Novyx - Actif');
});

// Route principale pour fournir la vidéo
app.get('/api/source/:type/:id', (req, res) => {
    const { type, id } = req.params;
    const season = req.query.season || 1;
    const episode = req.query.episode || 1;

    const mediaKey = type === 'movie' ? `movie_${id}` : `tv_${id}_s${season}_e${episode}`;

    // 1. Si la vidéo est enregistrée dans ta base
    if (streamDatabase[mediaKey]) {
        return res.json({
            success: true,
            streamType: streamDatabase[mediaKey].streamType,
            directUrl: streamDatabase[mediaKey].directUrl
        });
    }

    // 2. Flux vidéo de démonstration par défaut (évite l'alerte "non disponible")
    return res.json({
        success: true,
        streamType: "mp4",
        directUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    });
});

app.listen(PORT, () => {
    console.log(`Serveur prêt sur le port ${PORT}`);
});
