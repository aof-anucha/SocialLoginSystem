const express = require('express');
const appRouter = express.Router();

var passport = require('passport');
var FacebookStrategy = require('passport-facebook');
const GoogleStrategy = require('passport-google-oauth20')
// const GoogleStrategy = require('passport-google-oidc');

passport.serializeUser(function(user, done) {
  console.log(user)
  done(null, user) //อยากส่งอะไรไปเก็บใน session
})
passport.deserializeUser(function(obj, done) {
  done(null, obj) //เอาของที่เก็บใน session มาใช้ต่อ
})

passport.use(new FacebookStrategy({
  clientID: process.env['FACEBOOK_CLIENT_ID'],
  clientSecret: process.env['FACEBOOK_CLIENT_SECRET'],
  callbackURL: '/oauth2/redirect/facebook',
  state: true
},
function(accessToken, refreshToken, profile, done) {
  // console.log(profile)
  //ส่วนนี้จะเอาข้อมูลที่ได้จาก facebook ไปทำอะไรต่อก็ได้
  done(null, profile) //เสร็จแล้วให้เรียกฟังก์ชั่นนี้
}
))

passport.use(new GoogleStrategy({
  clientID: process.env['GOOGLE_CLIENT_ID'],
  clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
  callbackURL: '/oauth2/redirect/google',
  scope: [ 'profile' ]
},
function(accessToken, refreshToken, profile, done) {
  console.log(profile)
  //ส่วนนี้จะเอาข้อมูลที่ได้จาก facebook ไปทำอะไรต่อก็ได้
  done(null, profile) //เสร็จแล้วให้เรียกฟังก์ชั่นนี้
}
))

// passport.use(new GoogleStrategy({
//   clientID: process.env['GOOGLE_CLIENT_ID'],
//   clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
//   callbackURL: '/oauth2/redirect/google'
// },
// (accessToken, refreshToken, profile, cb) => {
//   console.log(profile)
//   // Perform any additional verification or user lookup here
//   // and return the user object
//   return cb(null, profile);
// }
// ));

// appRouter.get('/', function(req, res, next) {
//     if (!req.user) { return res.render('login'); }
//     next();
//     res.render('home', { user: req.user });
//   });
appRouter.get('/login/federated/facebook', passport.authenticate('facebook'));
appRouter.get('/login/federated/google', passport.authenticate('google'));

appRouter.get('/oauth2/redirect/facebook', passport.authenticate('facebook', {
  successRedirect: '/home',
  failureRedirect: '/'
}));

appRouter.get('/oauth2/redirect/google', passport.authenticate('google', {
  successRedirect: '/home',
  failureRedirect: '/'
}));

appRouter.get('/', function(req, res, next) {
  return res.render('login');
});

appRouter.get('/home', (req, res) => {
  // console.log(req.user)
  // res.json(req.user)
  res.render('home', { user: req.user });
})

appRouter.post('/logout', function (req, res, next) {
  req.logout(function (err) {
      if (err) { return next(err); }
      res.redirect('/');
  });
});

module.exports = appRouter