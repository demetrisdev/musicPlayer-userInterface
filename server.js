if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const Songs = require('./models/songs')
const mongoose = require('mongoose')
const session = require('express-session');
const usersRouter = require('./routes/login')
const songRouter = require('./routes/mediaplayer')
const folderRouter = require('./routes/folder')
const passport = require('./passport-config');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');

const app = express()

app.set('view engine', 'ejs')

mongoose.connect('mongodb://localhost/music-player-extended', {
  useNewUrlParser: true, useUnifiedTopology: true})

mongoose.set('strictQuery', false);

app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: "mySecret",
    resave: false,
    saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session()); 
app.use(express.urlencoded({ extended: false }))

app.use(express.static('public'));

app.use('/uploaded-songs', express.static('uploaded-songs'));

app.use('/songs', songRouter)

app.use('/users', usersRouter)

app.use('/folders', folderRouter)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});


app.get('/api/songs', async (req, res) => {
  try {
    if (req.user.isAdmin) {
      const songs = await Songs.find();
      const playlist = songs.map(song => ({
        songName: song.songName,
        singer: song.singer,
        songPath: song.songPath,
        songFolder: song.songFolder
      }));
      res.json(playlist);
    } else {
      const songs = await Songs.find({ user: req.user._id });
      const playlist = songs.map(song => ({
        songName: song.songName,
        singer: song.singer,
        songPath: song.songPath,
        songFolder: song.songFolder
      }));
      res.json(playlist);
    }
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/logout', (req, res) => {
    req.logout(function(err) {
      if (err) {
        return next(err);
      }
      res.redirect('/');
    });
});

app.listen(3000)