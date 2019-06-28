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
        (accessToken, refreshToken, profile, done) => {
            User.findOne({googleId:profile.id})
                .then((existingUser) => {
                    if (existingUser) {
                        // found a user with given profile ID
                        done(null, existingUser);
                    } else {
                        // user with given record not found
                        // Make a model instance and persists it to mongodb
                        var userIns = new User({ googleId: profile.id }); 
                        userIns.save( (err) => {
                            if (err) {
                                console.log(err);
                            }
                        }) 
                        .then((user) => done(err, user)); // 'user' is saved user in mongo, pass it to passport
                    }
                });

            

        }
    )
);
