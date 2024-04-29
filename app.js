require('dotenv').config();
const express = require('express');

const debug = require('debug')('app');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('passport');
const app = express();
const port = process.env.PORT;
const path = require('path');
const appRouter = require("./routers/appRouters");
const cookieParser = require('cookie-parser');

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('combined'));
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize())
app.use(passport.session())
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs");
app.use("/", appRouter)

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));


app.use(passport.authenticate('session'));


app.listen(port, () => {
    debug("Listening on port" + (port));
})

