const passport = require("passport");

module.exports = (app) => {
  // 1 Get a code
  app.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
      // prompt: "select_account",
    })
  );

  // 2 Get profile for a code
  app.get(
    "/auth/google/callback",
    passport.authenticate("google"), // User profile serialized inside passport.js and forwarded on to next middleware below.

    (req, res) => {
      res.redirect("/surveys"); // Key here is App client will be mounted again, which will re-fetch /api/current_user (but now cookie will have user sent along), will go thru cookie parsing, deserialize user, returns current user, redirect page to /survey
    }
  );

  app.get("/api/logout", (req, res) => {
    req.logout(); // passport provides .logout() and .user
    // res.send(req.user);
    res.redirect("/");
  });

  // Test end result of someone who has gone through OAuth flow
  app.get("/api/current_user", (req, res) => {
    // res.send(req.session);
    res.send(req.user);
  });
};
