const express = require('express');
const appRouter = express.Router();

var passport = require('passport');
var FacebookStrategy = require('passport-facebook');
const GoogleStrategy = require('passport-google-oauth20')
// const GoogleStrategy = require('passport-google-oidc');
var LocalStrategy = require('passport-local');
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./db/mydb.db')

passport.serializeUser(function (user, done) {
  console.log(user)
  done(null, user) //อยากส่งอะไรไปเก็บใน session
})
passport.deserializeUser(function (obj, done) {
  done(null, obj) //เอาของที่เก็บใน session มาใช้ต่อ
})

passport.use(new FacebookStrategy({
  clientID: process.env['FACEBOOK_CLIENT_ID'],
  clientSecret: process.env['FACEBOOK_CLIENT_SECRET'],
  callbackURL: '/oauth2/redirect/facebook',
  state: true
},
  function (accessToken, refreshToken, profile, done) {
    // console.log(profile)
    //ส่วนนี้จะเอาข้อมูลที่ได้จาก facebook ไปทำอะไรต่อก็ได้
    done(null, profile) //เสร็จแล้วให้เรียกฟังก์ชั่นนี้
  }
))

passport.use(new GoogleStrategy({
  clientID: process.env['GOOGLE_CLIENT_ID'],
  clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
  callbackURL: '/oauth2/redirect/google',
  scope: ['profile']
},
  function (accessToken, refreshToken, profile, done) {
    console.log(profile)
    //ส่วนนี้จะเอาข้อมูลที่ได้จาก facebook ไปทำอะไรต่อก็ได้
    done(null, profile) //เสร็จแล้วให้เรียกฟังก์ชั่นนี้
  }
))

passport.use(new LocalStrategy(function verify(username, password, cb) {
  db.get('SELECT * FROM users WHERE username = ?', [username], function (err, row) {
    if (err) { return cb(err); }
    if (!row) {
      console.log("Incorrect username or password.")
      return cb(null, false, { message: 'Incorrect username or password.' });
    }
    if (password != row.password) {
      return cb(null, false, { message: 'Incorrect username or password.' });
    }
    console.log(row)
    return cb(null, row);
  });
}));

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

appRouter.post('/login/password', passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/'
}));

appRouter.get('/', function (req, res, next) {
  return res.render('login');
});

appRouter.get('/register', function (req, res, next) {
  return res.render('register');
});
// ฟังก์ชันที่ใช้ในการตรวจสอบว่าชื่อผู้ใช้ซ้ำหรือไม่
function isUsernameExists(username, callback) {
  db.get('SELECT * FROM users WHERE username = ?', [username], function (err, row) {
    if (err) {
      return callback(err);
    }
    // ถ้ามีข้อมูล row คือชื่อผู้ใช้ซ้ำ
    if (row) {
      return callback(null, true);
    }
    // ถ้าไม่มีข้อมูล row คือชื่อผู้ใช้ไม่ซ้ำ
    return callback(null, false);
  });
}

// ใช้ในเส้นทาง /register เพื่อตรวจสอบก่อนการแทรกข้อมูลลงในฐานข้อมูล
appRouter.post('/register', function (req, res, next) {
  const username = req.body.username;
  const password = req.body.password;

  // ตรวจสอบว่าชื่อผู้ใช้ซ้ำหรือไม่
  isUsernameExists(username, function (err, exists) {
    if (err) {
      return next(err);
    }
    // ถ้าชื่อผู้ใช้ซ้ำ
    if (exists) {
      // ให้แสดงข้อความหรือทำการ redirect ไปยังหน้าที่คุณต้องการ
      console.log('Username already exists')
      return res.redirect('/');
    }

    // ถ้าชื่อผู้ใช้ไม่ซ้ำ ทำการแทรกข้อมูลลงในฐานข้อมูล
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], function (err) {
      if (err) { return next(err); }
      console.log('register successfully')
      res.redirect('/');
    });
  });
});


appRouter.get('/home', (req, res) => {
  // console.log(req.user.username)
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