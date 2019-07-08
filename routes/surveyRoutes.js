const _ = require('lodash');
const { Path } = require('path-parser');
const { URL } = require('url');
const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin'); 
const requireCredits = require('../middlewares/requireCredits'); 
const Mailer = require('../services/Mailer');
const surveyTemplate = require('../services/emailTemplates/surveyTemplates');
const Survey = mongoose.model('surveys');

module.exports = (app) => {
    app.get('/api/surveys', requireLogin, async (req, res) => {
        const surveys = await Survey.find({ _user: req.user.id })
                                    .select({ recipients: false });

        res.send(surveys);
    });

    app.get('/api/surveys/:surveyId/:choice', (req, res) => {
        res.send('Thanks for voting!');
    });
    
    app.post('/api/surveys/webhooks', (req, res) => {
        const p = new Path('/api/surveys/:surveyId/:choice');
        _.chain(req.body)
        .map(({email, url}) => {
            const match = p.test(new URL(url).pathname);
            if (match) {
                return { email:email, surveyId: match.surveyId, choice: match.choice };
            }
        })
        .compact()
        .uniqBy('email', 'surveyId')
        .each( ( {surveyId, email, choice } ) => {
            /** Find survey with given survey id
             *  Then find the recipient with given email and responded=false
             *  Finally update this record by incrementing "choice" yes/no by 1
             *  and set responded to true
              */
            Survey.updateOne({
                _id: surveyId, // MongoDB id is _id
                recipients: {
                    $elemMatch: { email: email, responded: false }
                }
            }, {
                $inc: { [choice]:1 },
                $set: { 'recipients.$.responded': true },
                lastResponded: new Date()
            }).exec();
        })
        .value();
        res.send({});
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