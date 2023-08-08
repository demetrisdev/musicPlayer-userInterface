const addSongBtn = document.getElementById('add-song-title');
const addSongPopup = document.getElementById('new-song-container');
const xSongButton = document.getElementById('x-button')
const playBtn = document.getElementById('play')
const pauseBtn = document.getElementById('pause')
const previousBtn = document.getElementById('previous')
const nextBtn = document.getElementById('next')
const progress = document.querySelector('.progress')
const progressContainer = document.querySelector('.progress-container')
const songTitle = document.getElementById('song-title');
const songArtist = document.getElementById('song-artist');
const audio = document.getElementById('audio');
const logoImage = document.querySelector('.logo-image')
const addSongTitle = document.querySelector('.add-song-title');
const SongPopup = document.querySelector('.add-song-popup');
const backButton = document.querySelector('.back-button')
const mainLibrary = document.querySelector('.main-library-container')
const folderContainer = document.querySelector('.oppened-folder-container')
const folders = document.querySelectorAll('.folder') 
const songFolder = document.getElementById('songFolder');
const songsContainer = document.querySelectorAll('.song-container')

let playlist = [];
let songIndex = 0;

folders.forEach(folder => {
  folder.addEventListener('click', () =>  {
    folderContainer.classList.add('visible');
    const folderName = folder.querySelector('.folder-name').innerText;
    const myContainer = document.getElementById('my-container');
    myContainer.innerText = folderName;
    mainLibrary.classList.remove('visible');
    const folderId = folder.dataset.folderId;
    songFolder.value = folderId;
    songsContainer.forEach(songContainer => {
      const containerFolderId = songContainer.dataset.folderId;
      if (containerFolderId === folderId) {
        songContainer.style.display = 'flex';
      } else {
        songContainer.style.display = 'none';
      }
    });
    playlist = Array.from(songsContainer)
      .filter(songContainer => songContainer.style.display === 'flex')
      .map(songContainer => {
        return {
          songName: songContainer.querySelector('.library-song-title').innerText,
          singer: songContainer.querySelector('.library-song-artist').innerText,
          songPath: songContainer.dataset.songPath
        };
      });
    songIndex = 0;
    displaySongs(playlist[songIndex]);
  });
});

backButton.addEventListener('click', () => {
  songFolder.value = '';
  folderContainer.classList.remove('visible');
  mainLibrary.classList.add('visible');
  mainLibrary.classList.add('showing-container');
  document.getElementById('my-container').innerText = '';
});

addSongTitle.addEventListener('mouseover', () => {
  SongPopup.style.opacity = '1';
});

addSongTitle.addEventListener('mouseout', () => {
  SongPopup.style.opacity = '0';
});

fetch('/api/songs')
  .then(response => response.json())
  .then(songs => {
    playlist = songs;
    displaySongs(playlist[songIndex]);
  })
  .catch(error => {
    console.error('Error fetching songs:', error);
  });

function displaySongs(song) {
  if (playlist.length > 0) {
    songTitle.innerHTML = song.songName;
    songArtist.innerHTML = song.singer;
    audio.src = song.songPath;
  } else {
    songTitle.innerHTML = 'Add Songs Please! :)';
    songArtist.innerHTML = '';
  }
}

function playMusic() {
  displaySongs(playlist[songIndex]);
  logoImage.classList.add('spinning')
  playBtn.style.display = 'none'
  pauseBtn.style.display = 'block'
  audio.play();
}

previousBtn.addEventListener('click', () => {
  songIndex--;
  if (songIndex < 0) {
    songIndex = playlist.length - 1;
  }
  playMusic();
});

nextBtn.addEventListener('click', () => {
  songIndex++;
  if (songIndex >= playlist.length) {
    songIndex = 0;
  }
  playMusic();
});

function nextSong() {
  songIndex++;
  if (songIndex >= playlist.length) {
    songIndex = 0;
  }
  playMusic();
}

function updateProgress(e) {
  const { duration, currentTime } = e.srcElement;
  const progressPercent = (currentTime / duration) * 100;
  progress.style.width = `${progressPercent}%`;
}

function setProgress(e) {
  const width = this.clientWidth;
  const clickX = e.offsetX;
  const duration = audio.duration;

  audio.currentTime = (clickX / width) * duration;
}

playBtn.addEventListener('click', () => {
  playMusic();
});

pauseBtn.addEventListener('click', () => {
  logoImage.classList.remove('spinning');
  playBtn.style.display = 'block';
  pauseBtn.style.display = 'none';
  audio.pause();
});

function pauseMusic() {
  logoImage.classList.remove('spinning');
  playBtn.style.display = 'block';
  pauseBtn.style.display = 'none';
  audio.pause();
}

function playSong(songPath) {
  const index = playlist.findIndex(song => song.songPath === decodeURIComponent(songPath));
  if (index !== -1) {
    if (songIndex === index && !audio.paused) {
      // Pause the audio if the same song is clicked again and it is playing
      pauseMusic();
    } else {
      songIndex = index;
      playMusic();
    }
  }
}

songsContainer.forEach(songContainer => {
  songContainer.addEventListener('click', () => {
    const songPath = songContainer.dataset.songPath;
    playSong(songPath);
  });
});

audio.addEventListener('timeupdate', updateProgress);

progressContainer.addEventListener('click', setProgress);

audio.addEventListener('ended', nextSong);

addSongBtn.addEventListener('click', () => {
  addSongPopup.style.display = 'block';
});

xSongButton.addEventListener('click', () => {
  addSongPopup.style.display = 'none';
});

addSongPopup.addEventListener('click', event => {
  if (event.target === addSongPopup) {
    addSongPopup.style.display = 'none';
  }
});
