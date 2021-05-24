const _ = require("lodash");
const { Path } = require("path-parser");
const { URL } = require("url");
const mongoose = require("mongoose");
const requireLogin = require("../middlewares/requireLogin");
const requireCredits = require("../middlewares/requireCredits");
const Mailer = require("../services/Mailer");
const surveyTemplate = require("../services/emailTemplates/surveyTemplate");

const Survey = mongoose.model("surveys"); // retrieve Model

module.exports = (app) => {
  app.get("/api/surveys", requireLogin, async (req, res) => {
    const surveys = await Survey.find({ _user: req.user.id }).select({
      recipients: false,
    });

    res.send(surveys);
  });

  app.get("/api/surveys/:surveyId/:choice", (req, res) => {
    res.send("Thanks for voting!");
  });

  app.post("/api/surveys/webhooks", (req, res) => {
    const p = new Path("/api/surveys/:surveyId/:choice");

    _.chain(req.body)
      .map(({ email, url }) => {
        const match = p.test(new URL(url).pathname); // if matched return { surveyId: '60a41b03a267d50c88488cab', choice: 'yes' } else null if unable to extract both.
        if (match) {
          return { email, surveyId: match.surveyId, choice: match.choice };
        }
      })
      .compact() // remove undefined elements
      .uniqBy("email", "surveyId")

      .each(({ surveyId, email, choice }) => {
        Survey.updateOne(
          {
            _id: surveyId,
            recipients: {
              $elemMatch: { email: email, responded: false },
            },
          },
          {
            $inc: { [choice]: 1 },
            $set: { "recipients.$.responded": true },
            lastResponded: new Date(),
          }
        ).exec();
      })

      .value();

    // console.log(events); //[ { email: .., surveyId: .., choice: .. } ]

    res.send({});
  });

  app.post("/api/surveys", requireLogin, requireCredits, async (req, res) => {
    const { title, subject, body, recipients } = req.body;

    const survey = new Survey({
      title,
      subject,
      body,
      recipients: recipients
        .split(",")
        .map((email) => ({ email: email.trim() })),
      _user: req.user.id,
      dateSent: Date.now(),
    });

    // Send email. survey - subject, recipient properties; surveyTemplate(survey) - represents the body of the email
    const mailer = new Mailer(survey, surveyTemplate(survey));

    try {
      await mailer.send();

      await survey.save();

      req.user.credits -= 1;
      const user = await req.user.save();

      res.send(user); // return updated user model
    } catch (err) {
      res.status(422).send(err);
    }
  });
};

/*
  // Ref - Before refactor
  app.post("/api/surveys/webhooks", (req, res) => {
    // Parse route and return match or null
    const events = _.map(req.body, ({ email, url }) => {
      const pathname = new URL(url).pathname;
      const p = new Path("/api/surveys/:surveyId/:choice");
      const match = p.test(pathname); // if matched return { surveyId: '60a41b03a267d50c88488cab', choice: 'yes' } else null.
      if (match) {
        return { email, surveyId: match.surveyId, choice: match.choice };
      }
    });

    // Return array of only event objects. Undefined elements are removed.
    const compactEvents = _.compact(events);

    // Remove any duplicate event objects
    const uniqueEvents = _.uniqBy(compactEvents, "email", "surveyId");

    console.log(uniqueEvents);
    res.send({});
  });
*/
