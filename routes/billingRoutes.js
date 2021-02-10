const keys = require("../config/keys");
const stripe = require("stripe")(keys.stripeSecretKey);
const requireLogin = require("../middlewares/requireLogin");

module.exports = (app) => {
  app.post("/api/stripe", requireLogin, async (req, res) => {
    const charge = await stripe.charges.create({
      amount: 500,
      currency: "usd",
      description: "$5 for 5 credits",
      source: req.body.id, // auth token for pending charge
    });

    // console.log(charge);
    // After charge finalized follow-up and give user credits they paid for.

    req.user.credits += 5;
    const user = await req.user.save();

    res.send(user);
  });
};

/*
    1 Notes app.post("api/stripe")
    Update User Model with 'credits', respond back with updated User model.
    Get reference to the current user model ie person who just made the rquest.
    We can access via req.user that is set up automatically by passport.  
    We wired up passport in index.js with app.use(passport.initialize() and app.use(passport.session()))

  From req.user
  {
    credits: 0,
    _id: 6010e901264916c2a790593b,
    googleId: '103189184585367694371',
    __v: 0
  }

  2 requireLogin.js replaced the check below
    Replace with requireLogin.js
    if (!req.user) {
      return res.status(401).send({ error: "You must log in!" });
    }
*/
