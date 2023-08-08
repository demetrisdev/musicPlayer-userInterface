const mongoose = require('mongoose')

const songSchema = new mongoose.Schema({
  songName: {
    type: String,
    required: true
  },
    singer: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  songPath: {
    type: String,
    required: true
  },
  songFolder: {
    type: String,
    required: true
  }
})


module.exports = mongoose.model('Song', songSchema)