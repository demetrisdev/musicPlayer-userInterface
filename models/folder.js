const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  folderName: {
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
  }
});


module.exports = mongoose.model('Folder', folderSchema);