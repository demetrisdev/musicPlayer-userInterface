const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('./models/user'); 

passport.use(new LocalStrategy({
  usernameField: 'name',
  passwordField: 'password'
}, async (name, password, cb) => {
  try {
    const user = await User.findOne({ name });
    if (!user) return cb(null, false, { message: 'Incorrect name surname or password.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return cb(null, false, { message: 'Incorrect name surname or password.' });

    return cb(null, user);
  } catch (err) {
    return cb(err);
  }
}));

passport.serializeUser((user, cb) => {
    cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
    User.findById(id)
      .then(user => cb(null, user))
      .catch(err => cb(err));
});

module.exports = passport;
