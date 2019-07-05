const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin'); 
const requireCredits = require('../middlewares/requireCredits'); 
const Mailer = require('../services/Mailer');
const surveyTemplate = require('../services/emailTemplates/surveyTemplates');
const Survey = mongoose.model('surveys');

module.exports = (app) => {
    app.get('/api/surveys/thanks', (req, res) => {
        res.send('Thanks for voting!');
    });

    app.post('/api/surveys', requireLogin, requireCredits, async (req, res) => {
        const { title, subject, body, recipients } = req.body;

        const survey = new Survey({
            title: title,
            subject: subject,
            body: body,
            recipients: recipients.split(',').map(email => { return {email: email.trim()} }),
            _user: req.user.id,
            dateSent: Date.now()
        });

        //TODO change to new sendgridmail library
        // Send email
        try {
            const mailer = new Mailer(survey, surveyTemplate(survey));
            await mailer.send();
            await survey.save();
            req.user.credits-=1;
            const user = await req.user.save();

            res.send(user);
        } catch(err) {
            res.status(422).send(err);
        }
    });


} 