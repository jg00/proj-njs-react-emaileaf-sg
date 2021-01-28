const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const keys = require("../config/keys");

const User = mongoose.model("users");

passport.serializeUser((user, done) => {
  done(null, user.id);
  /*
    "user" here is either an existing user or new user.  Regardless user argument is a model instance.

    Using Mongo identifier:
    "user" argument is a user model instance
    user.id is the identifying piece of information that will identify users on follow-up requests
    user.id is NOT the googleID: profile.id
    user.id is a "shortcut" to the mongodb _id generated when the user was created.
    By "shortcut" we mean "id" is a reference to the _id.$oid created by Mongo.  We can just access to this _id.$oid using "id".
    In other words to uniquely identify our user inside of our cookie we are not using the profile.id but instead
    we are making use of the _id that is assigned to this record by Mongo.
    
    Reason for using Mongo identifier is we could easily be using multiple different authentication providers like 
    Facebook, LinkedIn, Google Sign In, etc. and if we have all three of those we cannot always assume
    that a user has a Google Id.  The user could have signed in with LinkedIn or Facebook so we can't assume
    they everyone will have a Google Id but we can assume that every user will have an Id automatically generated by Mongo. 

    OAuth's only purpose is to allow someone to sign in.  After that, we use own internal Id's.

    So Google OAuth flow is providing us a Google Profile Id which is specifically for the authentication portion flow that 
    "identifies a user who is first attempting to sign in".  After a user has signed in we don't care about the Google Profile Id
    anymore.  We only care about our own internal id which is the Mongo database id.

    Summary: Passport serialize the user model's id and will "eventually" stuff this identifying piece of information into a cookie.
    done(null, user.id) is called again to usher passport to continue the flow.

  */
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user); // this is a user model instance pulled from database.
    // User model instance added to req.object as 'req.user'
  });

  /*
    When passport deserializes a cookie we get the "id" we had before when we serialized the user.id
    Here we are turning an "id" into a Mongoose model instance by finding by id from Mongo.
  */
});

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: "/auth/google/callback",
      proxy: true,
    },
    (accessToken, refreshToken, profile, done) => {
      // done() ushers along the Google OAuth Strategy flow to the passport.serializeUser()
      User.findOne({ googleId: profile.id }).then((existingUser) => {
        if (existingUser) {
          // we already have a record with the given profile id
          done(null, existingUser); // note this is a user model from db. user instance is what is passed to passport.serializeUser((user,done)=>{})
        } else {
          // we don't have a user
          new User({ googleId: profile.id })
            .save()
            .then((user) => done(null, user)); // note this is a user model from db. user instance is what is passed to passport.serializeUser((user,done)=>{})
        }
      });
    }
  )
);

/*
  console.log("access token", accessToken);
  console.log("refresh token", refreshToken);
  console.log("profile", profile);
  At this point set up of phase one of authentication using passport OAuth is complete.
*/
