<!DOCTYPE html>
<html lang="fr" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Novyx - Streaming VF Natif</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Lecteur vidéo HLS.js pour les flux natifs -->
    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        novyxDark: '#0b0d12',
                        novyxCard: '#151922',
                        novyxGold: '#f3c65d',
                        novyxGoldHover: '#d4aa48',
                    }
                }
            }
        }
    </script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #0b0d12; color: #ffffff; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0b0d12; }
        ::-webkit-scrollbar-thumb { background: #252a37; border-radius: 3px; }
    </style>
</head>
<body class="bg-novyxDark text-white min-h-screen flex flex-col">

    <!-- Header Bar -->
    <header class="fixed top-0 left-0 right-0 z-40 bg-novyxDark/80 backdrop-blur-md border-b border-white/5 px-4 md:px-8 py-3 flex items-center justify-between">
        <div class="flex items-center space-x-3">
            <button id="menuToggleBtn" onclick="toggleSidebar()" class="text-white hover:text-novyxGold transition p-2 focus:outline-none text-xl">
                <i class="fa-solid fa-bars"></i>
            </button>
            <div class="flex items-center space-x-2 cursor-pointer" onclick="navigateTab('home')">
                <div class="w-8 h-8 rounded bg-gradient-to-br from-novyxGold to-amber-600 flex items-center justify-center font-bold text-novyxDark text-lg shadow-lg shadow-novyxGold/20">N</div>
                <span class="text-xl font-bold tracking-wider text-white">Novyx</span>
            </div>
        </div>
        <div class="flex items-center space-x-3">
            <button onclick="openSearchModal()" class="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition">
                <i class="fa-solid fa-magnifying-glass text-novyxGold"></i>
            </button>
        </div>
    </header>

    <!-- Sidebar Menu -->
    <div id="sidebarOverlay" class="fixed inset-0 bg-black/70 z-50 hidden backdrop-blur-sm transition-opacity" onclick="toggleSidebar()"></div>
    <div id="sidebarDrawer" class="fixed top-0 left-0 bottom-0 w-80 bg-[#12151d] z-50 transform -translate-x-full transition-transform duration-300 ease-in-out border-r border-white/10 flex flex-col shadow-2xl">
        <div class="p-6 flex items-center justify-between border-b border-white/10">
            <div class="flex items-center space-x-2">
                <div class="w-8 h-8 rounded bg-gradient-to-br from-novyxGold to-amber-600 flex items-center justify-center font-bold text-novyxDark text-lg">N</div>
                <span class="text-xl font-bold tracking-wider text-white">Novyx</span>
            </div>
            <button onclick="toggleSidebar()" class="text-gray-400 hover:text-white text-xl p-2">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
        <div class="p-4 border-b border-white/5">
            <div class="relative">
                <input type="text" id="sidebarSearchInput" placeholder="Rechercher un film, une série..." onkeyup="handleSidebarSearch(event)" class="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-novyxGold transition">
                <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-3 text-novyxGold text-sm"></i>
            </div>
        </div>
        <div class="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            <button onclick="navigateTab('home'); toggleSidebar();" id="nav-home" class="w-full flex items-center space-x-4 px-4 py-3 rounded-xl font-medium text-left bg-novyxGold text-novyxDark transition shadow-md">
                <i class="fa-solid fa-house text-lg w-6"></i><span>Accueil</span>
            </button>
            <button onclick="navigateTab('movies'); toggleSidebar();" id="nav-movies" class="w-full flex items-center space-x-4 px-4 py-3 rounded-xl font-medium text-left text-gray-300 hover:bg-white/5 hover:text-white transition">
                <i class="fa-solid fa-film text-lg w-6"></i><span>Films</span>
            </button>
            <button onclick="navigateTab('series'); toggleSidebar();" id="nav-series" class="w-full flex items-center space-x-4 px-4 py-3 rounded-xl font-medium text-left text-gray-300 hover:bg-white/5 hover:text-white transition">
                <i class="fa-solid fa-tv text-lg w-6"></i><span>Séries</span>
            </button>
            <button onclick="navigateTab('favorites'); toggleSidebar();" id="nav-favorites" class="w-full flex items-center space-x-4 px-4 py-3 rounded-xl font-medium text-left text-gray-300 hover:bg-white/5 hover:text-white transition">
                <i class="fa-solid fa-heart text-lg w-6"></i><span>Favoris</span>
            </button>
            <button onclick="navigateTab('history'); toggleSidebar();" id="nav-history" class="w-full flex items-center space-x-4 px-4 py-3 rounded-xl font-medium text-left text-gray-300 hover:bg-white/5 hover:text-white transition">
                <i class="fa-solid fa-clock-rotate-left text-lg w-6"></i><span>Historique</span>
            </button>
        </div>
        <div class="p-4 border-t border-white/10 text-xs text-center text-gray-500">Novyx • Lecteur Natif VF</div>
    </div>

    <!-- Main Container -->
    <main class="flex-1 pt-16 pb-20">
        <div id="view-home" class="view-section">
            <div id="heroBannerContainer" class="relative w-full h-[75vh] md:h-[80vh] flex items-end">
                <div class="absolute inset-0 bg-cover bg-center transition-all duration-700" style="background-image: url('https://placehold.co/1920x1080/151922/f3c65d?text=Novyx+Streaming');">
                    <div class="absolute inset-0 bg-gradient-to-t from-[#0b0d12] via-[#0b0d12]/40 to-transparent"></div>
                    <div class="absolute inset-0 bg-gradient-to-r from-[#0b0d12] via-transparent to-transparent"></div>
                </div>
                <div class="relative z-10 p-6 md:p-12 max-w-3xl space-y-4">
                    <div class="inline-block text-xs uppercase tracking-widest text-novyxGold font-bold px-3 py-1 rounded bg-novyxGold/10 border border-novyxGold/30">À la une</div>
                    <h1 id="heroTitle" class="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">Chargement...</h1>
                    <div class="flex items-center space-x-4 text-sm font-semibold text-gray-300">
                        <span id="heroRating" class="flex items-center text-novyxGold"><i class="fa-solid fa-star mr-1.5"></i> -</span>
                        <span id="heroYear" class="text-gray-400">-</span>
                        <span id="heroGenre" class="bg-white/10 px-2.5 py-0.5 rounded text-xs text-gray-200">-</span>
                    </div>
                    <p id="heroOverview" class="text-gray-300 text-sm md:text-base line-clamp-3 leading-relaxed">Veuillez patienter pendant la récupération des tendances...</p>
                    <div class="flex items-center space-x-4 pt-2">
                        <button id="heroWatchBtn" class="flex items-center space-x-3 bg-novyxGold hover:bg-novyxGoldHover text-novyxDark px-7 py-3.5 rounded-full font-bold transition shadow-lg shadow-novyxGold/25">
                            <i class="fa-solid fa-play"></i><span>Regarder</span>
                        </button>
                        <button id="heroDetailsBtn" class="flex items-center space-x-3 bg-white/10 hover:bg-white/20 text-white px-7 py-3.5 rounded-full font-bold transition backdrop-blur-md border border-white/10">
                            <i class="fa-solid fa-circle-info"></i><span>Détails</span>
                        </button>
                    </div>
                </div>
                <div id="heroDots" class="absolute bottom-6 right-6 z-20 flex space-x-2"></div>
            </div>

            <section class="mt-8 px-4 md:px-8" id="continueWatchingSection" style="display:none;">
                <h2 class="text-xl font-bold flex items-center space-x-2 mb-4"><i class="fa-solid fa-clock-rotate-left text-novyxGold mr-2"></i><span>Continuer à regarder</span></h2>
                <div id="continueWatchingGrid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"></div>
            </section>

            <section class="mt-8 px-4 md:px-8">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-bold flex items-center space-x-2"><i class="fa-solid fa-fire text-novyxGold mr-2"></i><span>Films Populaires</span></h2>
                    <button onclick="navigateTab('movies')" class="text-xs text-novyxGold hover:underline font-semibold">Voir tout</button>
                </div>
                <div id="popularMoviesGrid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"></div>
            </section>

            <section class="mt-12 px-4 md:px-8 mb-12">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-bold flex items-center space-x-2"><i class="fa-solid fa-tv text-novyxGold mr-2"></i><span>Séries Populaires</span></h2>
                    <button onclick="navigateTab('series')" class="text-xs text-novyxGold hover:underline font-semibold">Voir tout</button>
                </div>
                <div id="popularSeriesGrid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"></div>
            </section>
        </div>

        <div id="view-movies" class="view-section hidden px-4 md:px-8 pt-6">
            <h1 class="text-2xl font-bold mb-6 flex items-center"><i class="fa-solid fa-film text-novyxGold mr-3"></i> Tous les Films</h1>
            <div id="allMoviesGrid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"></div>
        </div>

        <div id="view-series" class="view-section hidden px-4 md:px-8 pt-6">
            <h1 class="text-2xl font-bold mb-6 flex items-center"><i class="fa-solid fa-tv text-novyxGold mr-3"></i> Toutes les Séries</h1>
            <div id="allSeriesGrid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"></div>
        </div>

        <div id="view-favorites" class="view-section hidden px-4 md:px-8 pt-6">
            <h1 class="text-2xl font-bold mb-6 flex items-center"><i class="fa-solid fa-heart text-novyxGold mr-3"></i> Mes Favoris</h1>
            <div id="favoritesGrid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"></div>
        </div>

        <div id="view-history" class="view-section hidden px-4 md:px-8 pt-6">
            <h1 class="text-2xl font-bold mb-6 flex items-center"><i class="fa-solid fa-clock-rotate-left text-novyxGold mr-3"></i> Historique</h1>
            <div id="historyGrid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"></div>
        </div>
    </main>

    <!-- Search Modal -->
    <div id="searchModal" class="fixed inset-0 bg-black/80 z-50 hidden backdrop-blur-md flex flex-col p-4 md:p-12">
        <div class="max-w-3xl w-full mx-auto flex flex-col h-full">
            <div class="flex items-center justify-between mb-6">
                <div class="relative flex-1 mr-4">
                    <input type="text" id="modalSearchInput" placeholder="Rechercher un film ou une série..." oninput="performSearch(this.value)" class="w-full bg-[#151922] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-novyxGold text-lg">
                    <i class="fa-solid fa-magnifying-glass absolute left-4 top-4 text-novyxGold text-lg"></i>
                </div>
                <button onclick="closeSearchModal()" class="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white text-xl"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div id="searchResultsContainer" class="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pr-2"></div>
        </div>
    </div>

    <!-- Details Modal -->
    <div id="detailsModal" class="fixed inset-0 bg-black/80 z-50 hidden backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-[#12151d] border border-white/10 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl relative my-8">
            <button onclick="closeDetailsModal()" class="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition"><i class="fa-solid fa-xmark text-lg"></i></button>
            <div id="detailsBackdrop" class="relative w-full h-64 bg-cover bg-center">
                <div class="absolute inset-0 bg-gradient-to-t from-[#12151d] via-[#12151d]/50 to-transparent"></div>
            </div>
            <div class="p-6 -mt-16 relative z-10 space-y-4">
                <div class="flex items-end space-x-4">
                    <img id="detailsPoster" src="" class="w-28 h-40 object-cover rounded-xl shadow-xl border border-white/10" alt="Poster">
                    <div class="space-y-1 pb-2">
                        <h2 id="detailsTitle" class="text-2xl font-bold text-white"></h2>
                        <div class="flex items-center space-x-3 text-sm text-gray-300">
                            <span id="detailsRating" class="text-novyxGold font-bold flex items-center"><i class="fa-solid fa-star mr-1"></i> -</span>
                            <span id="detailsYear"></span>
                            <span id="detailsTypeBadge" class="bg-novyxGold/20 text-novyxGold px-2 py-0.5 rounded text-xs font-semibold"></span>
                        </div>
                    </div>
                </div>

                <div id="tvSeasonsContainer" class="hidden space-y-3 pt-2">
                    <label class="block text-xs uppercase tracking-wider text-gray-400 font-bold">Saison</label>
                    <div id="seasonsButtons" class="flex flex-wrap gap-2"></div>
                    <label class="block text-xs uppercase tracking-wider text-gray-400 font-bold pt-2">Épisode</label>
                    <select id="episodeSelect" class="w-full bg-[#1b1f2b] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-novyxGold"></select>
                </div>

                <p id="detailsOverview" class="text-gray-300 text-sm leading-relaxed"></p>

                <div class="flex items-center space-x-4 pt-4 border-t border-white/10">
                    <button id="modalWatchBtn" class="flex-1 bg-novyxGold hover:bg-novyxGoldHover text-novyxDark py-3.5 rounded-xl font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-novyxGold/20">
                        <i class="fa-solid fa-play"></i><span>Regarder</span>
                    </button>
                    <button id="modalFavoriteBtn" onclick="toggleCurrentFavorite()" class="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition border border-white/10">
                        <i class="fa-regular fa-heart text-lg" id="modalFavIcon"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Lecteur Vidéo Plein Écran Natif (Aucune iFrame) -->
    <div id="playerModal" class="fixed inset-0 bg-black z-50 hidden flex flex-col">
        <div class="bg-black/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-white/10 z-10">
            <div class="flex items-center space-x-3">
                <button onclick="closePlayerModal()" class="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition">
                    <i class="fa-solid fa-arrow-left text-lg"></i>
                </button>
                <div>
                    <h3 id="playerTitle" class="text-white font-bold text-sm md:text-base line-clamp-1">Lecture en cours</h3>
                    <span id="playerSubtitle" class="text-xs text-novyxGold font-medium">Flux natif haute performance</span>
                </div>
            </div>
        </div>
        <div class="flex-1 w-full bg-black relative flex items-center justify-center">
            <!-- Balise vidéo HTML5 native pure (pas d'iframe) -->
            <video id="nativeVideoPlayer" controls autoplay class="w-full h-full max-h-screen bg-black"></video>
        </div>
    </div>

    <!-- Script Application Logic -->
    <script>
        const TMDB_API_KEY = "8265bd1679663a7ea12ac168da84d2e8";
        const TMDB_BASE_URL = "https://api.themoviedb.org/3";
        const IMG_BASE = "https://image.tmdb.org/t/p/original";
        const IMG_POSTER = "https://image.tmdb.org/t/p/w500";
        const BACKEND_RENDER_URL = "https://novyx-backend.onrender.com";

        let activeMedia = null;
        let selectedSeason = 1;
        let selectedEpisode = 1;
        let heroMovies = [];
        let currentHeroIndex = 0;
        let heroInterval = null;
        let hlsInstance = null;

        let favorites = JSON.parse(localStorage.getItem('novyx_favorites') || "[]");
        let history = JSON.parse(localStorage.getItem('novyx_history') || "[]");

        window.onload = function() {
            fetchHeroTrending();
            fetchPopularCatalogs();
            renderContinueWatching();
            renderFavorites();
            renderHistory();
        };

        function toggleSidebar() {
            const drawer = document.getElementById('sidebarDrawer');
            const overlay = document.getElementById('sidebarOverlay');
            if (drawer.classList.contains('-translate-x-full')) {
                drawer.classList.remove('-translate-x-full');
                overlay.classList.remove('hidden');
            } else {
                drawer.classList.add('-translate-x-full');
                overlay.classList.add('hidden');
            }
        }

        function navigateTab(tabName) {
            document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
            document.getElementById(`view-${tabName}`).classList.remove('hidden');
            ['home', 'movies', 'series', 'favorites', 'history'].forEach(t => {
                const btn = document.getElementById(`nav-${t}`);
                if (btn) btn.className = t === tabName ? "w-full flex items-center space-x-4 px-4 py-3 rounded-xl font-medium text-left bg-novyxGold text-novyxDark transition shadow-md" : "w-full flex items-center space-x-4 px-4 py-3 rounded-xl font-medium text-left text-gray-300 hover:bg-white/5 hover:text-white transition";
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        async function fetchHeroTrending() {
            try {
                const res = await fetch(`${TMDB_BASE_URL}/trending/all/day?api_key=${TMDB_API_KEY}&language=fr-FR`);
                const data = await res.json();
                heroMovies = data.results.slice(0, 5);
                if (heroMovies.length > 0) { updateHeroBanner(0); startHeroCarousel(); }
            } catch (err) { console.error(err); }
        }

        function updateHeroBanner(index) {
            currentHeroIndex = index;
            const item = heroMovies[index];
            if (!item) return;

            const isMovie = item.media_type === 'movie' || item.title;
            const title = item.title || item.name;
            const backdropUrl = item.backdrop_path ? `${IMG_BASE}${item.backdrop_path}` : 'https://placehold.co/1920x1080/151922/f3c65d?text=Novyx';

            document.getElementById('heroBannerContainer').style.backgroundImage = `url('${backdropUrl}')`;
            document.getElementById('heroTitle').innerText = title;
            document.getElementById('heroRating').innerHTML = `<i class="fa-solid fa-star mr-1.5 text-novyxGold"></i> ${item.vote_average ? item.vote_average.toFixed(1) : '8.5'}`;
            document.getElementById('heroYear').innerText = (item.release_date || item.first_air_date || "").split('-')[0] || "2026";
            document.getElementById('heroGenre').innerText = isMovie ? "Film" : "Série TV";
            document.getElementById('heroOverview').innerText = item.overview || "Aucune description disponible.";

            const mediaObj = { id: item.id, media_type: isMovie ? 'movie' : 'tv', title: title, poster_path: item.poster_path, backdrop_path: item.backdrop_path, vote_average: item.vote_average, release_date: item.release_date || item.first_air_date, overview: item.overview };
            document.getElementById('heroWatchBtn').onclick = () => triggerWatch(mediaObj);
            document.getElementById('heroDetailsBtn').onclick = () => openDetailsModal(mediaObj);

            document.getElementById('heroDots').innerHTML = heroMovies.map((_, i) => `<span onclick="setHeroIndex(${i})" class="cursor-pointer transition-all duration-300 ${i === index ? 'w-8 h-2 rounded-full bg-novyxGold' : 'w-2 h-2 rounded-full bg-white/40'}"></span>`).join('');
        }

        function setHeroIndex(i) { clearInterval(heroInterval); updateHeroBanner(i); startHeroCarousel(); }
        function startHeroCarousel() { heroInterval = setInterval(() => { currentHeroIndex = (currentHeroIndex + 1) % heroMovies.length; updateHeroBanner(currentHeroIndex); }, 6000); }

        async function fetchPopularCatalogs() {
            try {
                const resM = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=fr-FR`);
                const dataM = await resM.json();
                renderMediaGrid(dataM.results, 'popularMoviesGrid');
                renderMediaGrid(dataM.results, 'allMoviesGrid', 'movie');

                const resS = await fetch(`${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&language=fr-FR`);
                const dataS = await resS.json();
                renderMediaGrid(dataS.results, 'popularSeriesGrid', 'tv');
                renderMediaGrid(dataS.results, 'allSeriesGrid', 'tv');
            } catch (err) { console.error(err); }
        }

        function renderMediaGrid(items, containerId, forcedType = null) {
            const container = document.getElementById(containerId);
            if (!container) return;

            container.innerHTML = items.map(item => {
                const isMovie = forcedType ? forcedType === 'movie' : (item.title !== undefined);
                const title = item.title || item.name;
                const poster = item.poster_path ? `${IMG_POSTER}${item.poster_path}` : 'https://placehold.co/500x750/151922/ffffff?text=Novyx';

                const mediaObj = { id: item.id, media_type: isMovie ? 'movie' : 'tv', title: title, poster_path: item.poster_path, backdrop_path: item.backdrop_path, vote_average: item.vote_average, release_date: item.release_date || item.first_air_date, overview: item.overview };

                return `
                    <div class="group relative bg-[#151922] rounded-xl overflow-hidden border border-white/5 hover:border-novyxGold/50 transition duration-300 cursor-pointer flex flex-col" onclick='openDetailsModal(${JSON.stringify(mediaObj)})'>
                        <div class="relative aspect-[2/3] w-full overflow-hidden bg-gray-900">
                            <img src="${poster}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="${title}" loading="lazy">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-3">
                                <button onclick="event.stopPropagation(); triggerWatch(${JSON.stringify(mediaObj).replace(/"/g, '&quot;')})" class="w-full bg-novyxGold text-novyxDark py-2 rounded-lg font-bold text-sm flex items-center justify-center space-x-2">
                                    <i class="fa-solid fa-play"></i><span>Regarder</span>
                                </button>
                            </div>
                        </div>
                        <div class="p-3 flex-1 flex flex-col justify-between">
                            <h3 class="font-bold text-sm text-white line-clamp-1 group-hover:text-novyxGold transition">${title}</h3>
                        </div>
                    </div>
                `;
            }).join('');
        }

        async function openDetailsModal(media) {
            activeMedia = media;
            const isMovie = media.media_type === 'movie';

            document.getElementById('detailsBackdrop').style.backgroundImage = `url('${media.backdrop_path ? IMG_BASE + media.backdrop_path : IMG_POSTER + media.poster_path}')`;
            document.getElementById('detailsPoster').src = media.poster_path ? `${IMG_POSTER}${media.poster_path}` : 'https://placehold.co/500x750/151922/ffffff?text=Novyx';
            document.getElementById('detailsTitle').innerText = media.title;
            document.getElementById('detailsRating').innerHTML = `<i class="fa-solid fa-star mr-1"></i> ${media.vote_average ? media.vote_average.toFixed(1) : '8.0'}`;
            document.getElementById('detailsYear').innerText = (media.release_date || "").split('-')[0] || "2026";
            document.getElementById('detailsTypeBadge').innerText = isMovie ? "Film" : "Série TV";
            document.getElementById('detailsOverview').innerText = media.overview || "Aucun synopsis disponible.";

            const tvContainer = document.getElementById('tvSeasonsContainer');
            if (!isMovie) {
                tvContainer.classList.remove('hidden');
                await loadTvSeasons(media.id);
            } else {
                tvContainer.classList.add('hidden');
            }

            document.getElementById('modalWatchBtn').onclick = () => { closeDetailsModal(); triggerWatch(activeMedia); };
            document.getElementById('detailsModal').classList.remove('hidden');
        }

        function closeDetailsModal() { document.getElementById('detailsModal').classList.add('hidden'); }

        async function loadTvSeasons(tvId) {
            try {
                const res = await fetch(`${TMDB_BASE_URL}/tv/${tvId}?api_key=${TMDB_API_KEY}&language=fr-FR`);
                const data = await res.json();
                const seasons = data.seasons ? data.seasons.filter(s => s.season_number > 0) : [];

                document.getElementById('seasonsButtons').innerHTML = seasons.map(s => `
                    <button onclick="selectSeason(${s.season_number}, ${tvId})" id="seasonBtn-${s.season_number}" class="px-3.5 py-2 rounded-xl text-sm font-semibold transition ${s.season_number === 1 ? 'bg-novyxGold text-novyxDark' : 'bg-white/5 text-gray-300'}">
                        Saison ${s.season_number}
                    </button>
                `).join('');

                if (seasons.length > 0) selectSeason(seasons[0].season_number, tvId);
            } catch (err) { console.error(err); }
        }

        async function selectSeason(sn, tvId) {
            selectedSeason = sn;
            try {
                const res = await fetch(`${TMDB_BASE_URL}/tv/${tvId}/season/${sn}?api_key=${TMDB_API_KEY}&language=fr-FR`);
                const data = await res.json();
                const episodes = data.episodes || [];
                const epSelect = document.getElementById('episodeSelect');
                epSelect.innerHTML = episodes.map(ep => `<option value="${ep.episode_number}">Épisode ${ep.episode_number} : ${ep.name}</option>`).join('');
                selectedEpisode = 1;
                epSelect.onchange = (e) => { selectedEpisode = parseInt(e.target.value); };
            } catch (err) { console.error(err); }
        }

        function triggerWatch(media) {
            activeMedia = media;
            const isMovie = media.media_type === 'movie';
            launchPlayer(media, isMovie ? null : selectedSeason, isMovie ? null : selectedEpisode);
            addToHistory(media);
        }

        async function launchPlayer(media, season = null, episode = null) {
            const isMovie = media.media_type === 'movie';
            const currentSeason = season || 1;
            const currentEpisode = episode || 1;

            document.getElementById('playerTitle').innerText = isMovie ? media.title : `${media.title} - S${currentSeason} E${currentEpisode}`;
            document.getElementById('playerModal').classList.remove('hidden');

            fetchStreamAndPlay(media, isMovie, currentSeason, currentEpisode);
        }

        async function fetchStreamAndPlay(media, isMovie, season, episode) {
            const type = isMovie ? 'movie' : 'tv';
            const tmdbId = media.id;

            try {
                let apiUrl = `${BACKEND_RENDER_URL}/api/source/${type}/${tmdbId}`;
                if (!isMovie) apiUrl += `?season=${season}&episode=${episode}`;

                const response = await fetch(apiUrl);
                const data = await response.json();

                if (data.success && data.directUrl) {
                    playNativeStream(data.directUrl, data.streamType);
                } else {
                    alert("Flux vidéo non disponible pour ce média.");
                }
            } catch (error) {
                console.error(error);
                alert("Erreur de communication avec le serveur de flux.");
            }
        }

        function playNativeStream(streamUrl, type) {
            const videoElement = document.getElementById('nativeVideoPlayer');

            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }

            if (type === 'hls' || streamUrl.includes('.m3u8')) {
                if (Hls.isSupported()) {
                    hlsInstance = new Hls();
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(videoElement);
                    hlsInstance.on(Hls.Events.MANIFEST_PARSED, function() {
                        videoElement.play();
                    });
                } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
                    videoElement.src = streamUrl;
                    videoElement.play();
                }
            } else {
                videoElement.src = streamUrl;
                videoElement.play();
            }
        }

        function closePlayerModal() { 
            const videoElement = document.getElementById('nativeVideoPlayer');
            videoElement.pause();
            videoElement.src = "";
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
            document.getElementById('playerModal').classList.add('hidden'); 
        }

        function toggleCurrentFavorite() {
            if (!activeMedia) return;
            const idx = favorites.findIndex(f => f.id === activeMedia.id);
            if (idx > -1) favorites.splice(idx, 1); else favorites.push(activeMedia);
            localStorage.setItem('novyx_favorites', JSON.stringify(favorites));
            renderFavorites();
        }

        function renderFavorites() { renderMediaGrid(favorites, 'favoritesGrid'); }
        function addToHistory(media) { history = history.filter(h => h.id !== media.id); history.unshift(media); localStorage.setItem('novyx_history', JSON.stringify(history)); renderHistory(); renderContinueWatching(); }
        function renderHistory() { renderMediaGrid(history, 'historyGrid'); }
        function renderContinueWatching() { renderMediaGrid(history.slice(0, 5), 'continueWatchingGrid'); }

        function openSearchModal() { document.getElementById('searchModal').classList.remove('hidden'); }
        function closeSearchModal() { document.getElementById('searchModal').classList.add('hidden'); }

        async function performSearch(query) {
            if (!query.trim()) return;
            try {
                const res = await fetch(`${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&language=fr-FR&query=${encodeURIComponent(query)}`);
                const data = await res.json();
                renderMediaGrid(data.results.filter(i => i.media_type === 'movie' || i.media_type === 'tv'), 'searchResultsContainer');
            } catch (e) { console.error(e); }
        }

        function handleSidebarSearch(e) { if (e.key === 'Enter') performSearch(e.target.value); }
    </script>
</body>
</html>
