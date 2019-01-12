const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const authenticatedMiddleware = require('./authenticated.middleware');

const app = express();

mongoose.connect('mongodb://localhost/session-test', {
    useCreateIndex: true,
    useNewUrlParser: true,
});

const schema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    role: {
        type: String,
        default: 'USER',
    },
});

const User = mongoose.model('User', schema);

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'kitty', resave: true, saveUninitialized: true, store: new MongoStore({mongooseConnection: mongoose.connection}) }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({
    session: true,
}, async (username, password, done) => {
    try {
        const user = await User.findOne({ username });

        if (!user) { return done(null, false); }

        const match = await bcrypt.compare(password, user.password);

        if (!match) { return done(null, false); }

        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

app.post('/login', passport.authenticate('local', { session: true }), (req, res) => {
    res.sendStatus(200);
});

app.get('/images', authenticatedMiddleware, (req, res) => {
    let status = 418;
    // if (!req.isAuthenticated()) { status = 403; }
    res.sendStatus(status);
});

app.listen(3000, () => {
    console.log('server started');
});
