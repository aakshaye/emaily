const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('../config/keys')
const mongoose = require('mongoose');

const User = mongoose.model('users'); // get model from mongoose

passport.serializeUser((user, done) => {
    done(null, user.id); // user.id is _id in mongo record NOT profile id
});

passport.deserializeUser((id, done) => {
    User.findById(id)
        .then((user) => {
            done(null, user);
        });
});

passport.use(
    new GoogleStrategy(
        {
            clientID: keys.googleClientID,
            clientSecret: keys.googleClientSecret,
            callbackURL: '/auth/google/callback',
            proxy: true
        },
        async (accessToken, refreshToken, profile, done) => {
            const existingUser = await User.findOne({googleId:profile.id})
            if (existingUser) {
                // found a user with given profile ID
                return done(null, existingUser);
            } 
            // user with given record not found
            // Make a model instance and persists it to mongodb
            const userIns = await new User({ googleId: profile.id }).save();
            done(err, userIns); // 'user' is saved user in mongo, pass it to passport
        }
    )
);
