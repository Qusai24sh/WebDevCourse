const form = document.getElementById('songForm');
const list = document.getElementById('songList');
const submitBtn = document.getElementById('submitBtn');

// ----- load songs safely from localStorage -----
function loadSongs() {
    const data = localStorage.getItem('playlist');
    if (!data) return [];

    try {
        const parsed = JSON.parse(data);

        // Make sure we always return an array
        if (Array.isArray(parsed)) {
            return parsed;
        }

        // If it was a single object or something else – ignore and start clean
        return [];
    } catch (e) {
        // If JSON is invalid – start with empty array
        return [];
    }
}

let songs = loadSongs();

// First render existing songs (if any)
renderSongs(songs);

// ----- form submit -----
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value.trim();
    const url = document.getElementById('url').value.trim();
    const songIdInput = document.getElementById('songId'); // hidden input

    if (!title || !url) {
        alert('Please fill all fields');
        return;
    }

    // If songId has value -> update existing song
    if (songIdInput.value) {
        const idToUpdate = Number(songIdInput.value);
        const songIndex = songs.findIndex(s => s.id === idToUpdate);
        if (songIndex !== -1) {
            songs[songIndex].title = title;
            songs[songIndex].url = url;
        }

        // Reset button to "Add"
        submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add';
        submitBtn.classList.remove('btn-warning');
        submitBtn.classList.add('btn-success');
        songIdInput.value = '';
    } else {
        // Create new song
        const song = {
            id: Date.now(),
            title: title,
            url: url,
            dateAdded: Date.now()
        };
        songs.push(song);
    }

    saveAndRender();
    form.reset();
});

// ----- save + render -----
function saveAndRender() {
    localStorage.setItem('playlist', JSON.stringify(songs));
    renderSongs(songs);
}

// ----- render table -----
function renderSongs(songArray) {
    // Safety check – just in case
    if (!Array.isArray(songArray)) {
        console.error('songArray is not an array:', songArray);
        return;
    }

    list.innerHTML = '';

    songArray.forEach(song => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${song.title}</td>
            <td><a href="${song.url}" target="_blank" class="text-info">Watch</a></td>
            <td class="text-end">
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
}

// ----- delete -----
function deleteSong(id) {
    if (confirm('Are you sure?')) {
        songs = songs.filter(song => song.id !== id);
        saveAndRender();
    }
}

// ----- edit -----
function editSong(id) {
    const songToEdit = songs.find(song => song.id === id);
    if (!songToEdit) return;

    document.getElementById('title').value = songToEdit.title;
    document.getElementById('url').value = songToEdit.url;
    document.getElementById('songId').value = songToEdit.id;

    submitBtn.innerHTML = '<i class="fas fa-save"></i> Update';
    submitBtn.classList.remove('btn-success');
    submitBtn.classList.add('btn-warning');
}
