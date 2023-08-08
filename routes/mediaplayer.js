const express = require('express')
const Song = require('../models/songs')
const Folders = require('../models/folder')
const router = express.Router()
const { ensureAuthenticated } = require('../auth');
const passport = require('passport');
const User = require('../models/user');
const fs = require('fs');
const path = require('path');
const multer  = require('multer');
const { error } = require('console');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploaded-songs/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const extname = path.extname(file.originalname)
    cb(null, file.fieldname + '-' + uniqueSuffix + extname)
  }
})

const fileFilter = function (req, file, cb) {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true)
    } else {
      cb(new Error('Only audio files are allowed.'))
    }
}

const upload = multer({ storage: storage, fileFilter: fileFilter})

router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id });
    const query = user.isAdmin ? {} : { user: req.user._id };
    const songs = await Song.find(query).populate('user', 'name');
    const folders = await Folders.find(query).populate('user', 'name')
    res.render("media_player", { songs: songs, name: req.user.name, folders: folders });
  } catch (err) {
    console.log(err);
  }
});

router.post('/', upload.single('uploaded_file'), async (req, res, next) => {
  req.song = new Song()
  next()
}, saveSong('new'))

router.delete('/:id', async (req, res) => {
  try {
    const song = await Song.findByIdAndRemove(req.params.id);
    if (song) {
      if (song.songPath) {
        fs.unlink(`public${song.songPath}`, err => {
          if (err) {
            console.error(err);
          }
        });
      }
      res.redirect('/songs');
    } else {
      res.status(404).send('Song not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

function saveSong(path) {
  return async (req, res) => {
    let song = new Song()
    song.songName = req.body.songName
    song.singer = req.body.singer
    song.songFolder = req.body.songFolder
    if (req.file) {
      song.songPath = req.file.path.replace("public", "")
    }
    song.user = req.user._id
    try {
      song = await song.save()
      res.redirect('/songs');
    } catch (e) {
      res.render(`${path}`, { song: song })
    }
  }
}

module.exports = router