const sendgrid = require("sendgrid"); // sengrid is of type SendGrid.SendGridConstructor
const helper = sendgrid.mail;
const keys = require("../config/keys");

class Mailer extends helper.Mail {
  constructor({ subject, recipients }, content) {
    super();

    this.sgApi = sendgrid(keys.sendGridKey); // creates and instance and returns object we can use to communicate with the sendgrid v3 Web Api.
    this.from_email = new helper.Email(`${keys.sendGridFromEmail}`); // returns {email:"your@email.com"}
    this.subject = subject;
    this.body = new helper.Content("text/html", content); // returns {type:"text/html", value: "<div>Content Example</div>"}
    this.recipients = this.formatAddresses(recipients);

    // Assigning values to properties above is only part one. They items need to be registerd with further properties of the Mailer iteslf using other SendGrid functions.
    this.addContent(this.body); // addContent() built-in function provided by function Mail base class. Used to push content to this.content [] array.
    this.addClickTracking(); // Enable click tracking inside of our email. Sendgrid scans the meail, replaces every link with their own special one.
    this.addRecipients();
  }

  // recipients argument -> [{email: "--"}]
  // recipients.map returns an array of email objects [{email}:"some@email"}]
  // the helper.Email returns an object {email:"value"} that conforms to Sendgrid format requirements
  formatAddresses(recipients) {
    return recipients.map(({ email }) => {
      return new helper.Email(email);
    });
  }

  // Click tracking set up
  addClickTracking() {
    const trackingSettings = new helper.TrackingSettings(); // returns TrackingSettings instance object
    const clickTracking = new helper.ClickTracking(true, true); // returns a ClickTracking instance object

    trackingSettings.setClickTracking(clickTracking); // registers the click_tracking property
    this.addTrackingSettings(trackingSettings); // Mail clsss method addTrackingSettings().  Register tracking_settings to Mail instance object's tracking_settings property.
  }

  // Take formatted recipient emails (via formatAddresses(recipients)) and add to tos [] array from the Personalization object instance.
  addRecipients() {
    const personalize = new helper.Personalization();
    this.recipients.forEach((recipient) => {
      personalize.addTo(recipient);
    });
    this.addPersonalization(personalize); // Mail clsss method addPersonalization(). Adds to Mail instance personalizations array [] property.
  }

  // Function for taking initialized Mailer instance object and communicate our entire Mailer of to the SendGrid API
  // and actually email out to all recipients
  async send() {
    const request = this.sgApi.emptyRequest({
      method: "POST",
      path: "/v3/mail/send",
      body: this.toJSON(), // toJSON() function defined by the Mail base class.  See function Mail().  Take all properties of mail object instance and convert them to json data before sending off to SendGrid.
    });

    const response = await this.sgApi.API(request); // Actually sends off to Sendgrid
    return response;
  }
}

module.exports = Mailer;
