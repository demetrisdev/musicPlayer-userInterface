const express = require('express')
const Song = require('../models/songs')
const Folder = require('../models/folder')
const router = express.Router()
const { ensureAuthenticated } = require('../auth');
const passport = require('passport');
const User = require('../models/user');
const { error } = require('console');


router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id });
    const query = user.isAdmin ? {} : { user: req.user._id };
    const songs = await Song.find(query).populate('user', 'name');
    const folders = await Folder.find(query).populate('user', 'name')
    res.render("media_player", { songs: songs, name: req.user.name, folders: folders });
  } catch (err) {
    console.log(err);
  }
});

router.post('/', async (req, res) => {
  const folder = new Folder({
    folderName: req.body.folderName,
    user: req.user._id
  });
  try {
    const savedFolder = await folder.save();
    res.redirect('/songs');
  } catch (err) {
    console.error(err);
    res.redirect('/songs');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const folder = await Folder.findByIdAndRemove(req.params.id);
    if (folder) {
      // Delete all songs in the folder
      await Song.deleteMany({ songFolder: folder._id });
      res.redirect('/songs');
    } else {
      res.status(404).send('Folder not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});



module.exports = router