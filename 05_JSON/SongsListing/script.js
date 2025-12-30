//--Get HTML DOM Element References 
const form = document.getElementById('songForm');
const list = document.getElementById('songList');
const submitBtn = document.getElementById('submitBtn');

const tableWrapper = document.getElementById('tableWrapper');
const cardsWrapper = document.getElementById('cardsWrapper');
const toggleViewBtn = document.getElementById('toggleViewBtn');
const toggleIcon = document.getElementById('toggleIcon');


let songs = [];
let currentView = 'table'; //table or cards


// This runs automatically when the page finishes loading
document.addEventListener('DOMContentLoaded', () => {

    //1) Get From Local Storage
    const storedData = localStorage.getItem('songs');
    //02) if exsist
    if (storedData) {
        // If yes, turn the JSON string back into an Array
        songs = JSON.parse(storedData);
    } else {
        // If no, start with an empty array
        songs = [];
    }

    document.querySelectorAll('input[name="sortOption"]').forEach(radio => {
        radio.addEventListener('change', () => {
            renderSongs();   // resort when clicked
        });
    });

    toggleViewBtn.addEventListener('click', toggleView);

    // SHOW the data
    renderSongs();
});





//User Click the Add Button
form.addEventListener('submit', (e) => {
    //Dont submit the for to the server yey let me handle it here
    e.preventDefault();

    //Read Forms Data
    const title = document.getElementById('title').value;
    const url = document.getElementById('url').value;
    const rating = Number(document.getElementById('rating').value);
    const existingId = document.getElementById('songId').value;


    if (existingId) {
        // ----- UPDATE MODE -----
        const index = songs.findIndex(song => song.id == existingId);

        if (index !== -1) {
            songs[index].title = title;
            songs[index].url = url;
            songs[index].rating = rating;
            songs[index].youtubeId = getYoutubeId(url);
        }
    } else {
        // ----- ADD MODE -----
        const song = {
            id: Date.now(),
            title: title,
            url: url,
            rating: rating,
            dateAdded: Date.now(),
            youtubeId: getYoutubeId(url)
        };

        songs.push(song);
    }

    saveAndRender();
    //TO DO SAVE  AND RERENDER 

    form.reset();
    document.getElementById('songId').value = '';
    submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add';
    submitBtn.classList.remove('btn-warning');
    submitBtn.classList.add('btn-success');
});

//Save to Local storage and  render UI Table
function saveAndRender() {

    localStorage.setItem('songs', JSON.stringify(songs));
    //TODO RELOAD UI 
    renderSongs();
}


//helper function to get id from youtube thumbnail
function getYoutubeId(url) {
    const regExp = /(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
}


//sorted by date name rating function
function getSortedSongs() {
    const selected = document.querySelector('input[name="sortOption"]:checked').value;
    const sorted = [...songs];

    if (selected === 'title') {
        sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (selected === 'rating') {
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
        sorted.sort((a, b) => b.dateAdded - a.dateAdded);
    }

    return sorted;
}

//Display Song From Current Updated songs array as tale Rows 
function renderSongs() {
    // Clear both table and cards
    list.innerHTML = '';
    cardsWrapper.innerHTML = '';

    const sortedSongs = getSortedSongs();

    if (currentView === 'table') {
        // TABLE VIEW
        sortedSongs.forEach(song => {
            const row = document.createElement('tr');

            const ytId = song.youtubeId || getYoutubeId(song.url);
            const thumbUrl = ytId
                ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
                : '';

            row.innerHTML = `
                <td>${song.title}</td>
                <td>
                    ${thumbUrl
                    ? `<img src="${thumbUrl}" alt="${song.title}"
                                style="width:120px;height:auto;cursor:pointer;"
                                onclick="playSong(${song.id})">`
                    : ''}
                </td>
                <td><a href="${song.url}" target="_blank" class="text-info">Watch</a></td>
                <td>${song.rating || ''}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-info me-2" onclick="playSong(${song.id})">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="btn btn-sm btn-warning me-2" onclick="editSong(${song.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteSong(${song.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;

            list.appendChild(row);
        });

    } else {
        // CARDS VIEW
        sortedSongs.forEach(song => {
            const ytId = song.youtubeId || getYoutubeId(song.url);
            const thumbUrl = ytId
                ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
                : '';

            const col = document.createElement('div');
            col.className = 'col-12 col-sm-6 col-md-4 col-lg-3';

            col.innerHTML = `
                <div class="card bg-dark text-light h-100">
                    ${thumbUrl
                    ? `<img src="${thumbUrl}" class="card-img-top" alt="${song.title}"
                                style="cursor:pointer;" onclick="playSong(${song.id})">`
                    : ''}
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${song.title}</h5>
                        <p class="card-text mb-1">Rating: ${song.rating || '-'}</p>
                        <a href="${song.url}" target="_blank" class="text-info mb-2">Watch on YouTube</a>

                        <div class="mt-auto d-flex justify-content-between">
                            <button class="btn btn-sm btn-info" onclick="playSong(${song.id})">
                                <i class="fas fa-play"></i>
                            </button>
                            <button class="btn btn-sm btn-warning" onclick="editSong(${song.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteSong(${song.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            cardsWrapper.appendChild(col);
        });
    }
}



function deleteSong(id) {
    if (confirm('Are you sure?')) {
        // Filter out the song with the matching ID
        songs = songs.filter(song => song.id !== id);
        saveAndRender();
    }
}


//adding the video in the page function
function playSong(id) {
    const song = songs.find(s => s.id === id);
    if (!song) return;

    const ytId = song.youtubeId || getYoutubeId(song.url);
    if (!ytId) {
        alert('Cannot play this song - invalid youtube URL');
        return;
    }

    const embedUrl = `https://www.youtube.com/embed/${ytId}?autoplay=1`;

    //open popup window with the youtube player
    window.open(embedUrl, 'ytplayer', 'width=800,height=450,resizable=yes');
}

function editSong(id) {

    const songToEdit = songs.find(song => song.id === id);
    if (!songToEdit) return;


    document.getElementById('title').value = songToEdit.title;
    document.getElementById('url').value = songToEdit.url;
    document.getElementById('rating').value = songToEdit.rating || '';
    document.getElementById('songId').value = songToEdit.id; // Set Hidden ID

    submitBtn.innerHTML = '<i class="fas fa-save"></i> Update';
    submitBtn.classList.replace('btn-success', 'btn-warning');
}

//toggle function
function toggleView() {
    if (currentView === 'table') {
        currentView = 'cards';


        tableWrapper.classList.add('d-none');
        cardsWrapper.classList.remove('d-none');

        toggleIcon.classList.remove('fa-th-large');
        toggleIcon.classList.add('fa-list');
        toggleViewBtn.title = 'Show table view';
    } else {
        currentView = 'table';

        cardsWrapper.classList.add('d-none');
        tableWrapper.classList.remove('d-none');

        toggleIcon.classList.remove('fa-list');
        toggleIcon.classList.add('fa-th-large');
        toggleViewBtn.title = 'Show cards view';
    }
    renderSongs();
}