const passport = require("passport");

module.exports = (app) => {
  app.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })
  );

  app.get("/auth/google/callback", passport.authenticate("google"));

  app.get("/api/logout", (req, res) => {
    req.logout(); // passport provides .logout() and .user
    res.send(req.user);
  });

  // Test end result of someone who has gone through OAuth flow
  app.get("/api/current_user", (req, res) => {
    // res.send(req.session);
    res.send(req.user);
  });
};
