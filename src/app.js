require('dotenv').config();

const request = require('request');
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');

// Use Passport with OpenId Connect strategy to
// authenticate users with FlowId
const passport = require('passport')
const FlowIdStrategy = require('passport-openid-connect').Strategy
const User = require('passport-openid-connect').User

const index = require('./routes/index');
// const users = require('./routes/users');

const oic = new FlowIdStrategy({
  issuerHost: process.env.OIDC_BASE_URI,
  client_id: process.env.OIDC_CLIENT_ID,
  client_secret: process.env.OIDC_CLIENT_SECRET,
  redirect_uri: process.env.OIDC_REDIRECT_URI,
  scope: "openid profile"
});

passport.use(oic)
passport.serializeUser(FlowIdStrategy.serializeUser)
passport.deserializeUser(FlowIdStrategy.deserializeUser)

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Passport requires session to persist the authentication
// so were using express-session for this example
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}))

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware for checking if a user has been authenticated
// via Passport and FlowId OpenId Connect
function checkAuthentication(req,res,next){
  if(req.isAuthenticated()){
      next();
  } else{
      res.redirect("/");
  }
}

app.use('/', index);
// Only allow authenticated users to access the /users route
app.use('/users', checkAuthentication, function(req, res) {res.json(req.user)});
app.get('/profile', checkAuthentication, function(req, res, next) {

  request.get(
    'https://thirdparty.flowid.co/platform/oidc/userinfo',
    {
    'auth': {
      'bearer': req.user.token.access_token
    }
  },function(err, respose, body){

    console.log('User Info')
    console.log(body);

    res.json(JSON.parse(body));

  });
});

// Initiates an authentication request with FlowId
// The user will be redirect to FlowId and once authenticated
// they will be returned to the callback handler below
app.get('/login', passport.authenticate('passport-openid-connect', {
  successReturnToOrRedirect: "/",
  scope: 'profile'
}));

// Callback handler that FlowId will redirect back to
// after successfully authenticating the user
app.get('/oauth/callback', passport.authenticate('passport-openid-connect', {
  callback: true,
  successReturnToOrRedirect: '/users',
  failureRedirect: '/'
}))

// Destroy both the local session and
// revoke the access_token at FlowId
app.get('/logout', function(req, res){

  request.post('https://openid-connect.FlowId.com/oidc/token/revocation', {
    'form':{
      'client_id': process.env.OIDC_CLIENT_ID,
      'client_secret': process.env.OIDC_CLIENT_SECRET,
      'token': req.session.accessToken,
      'token_type_hint': 'access_token'
    }
  },function(err, respose, body){

    console.log('Session Revoked at FlowId');
    res.redirect('/');

  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  if (req.originalUrl === '/graphql') {
    next();
  } else {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  }
  
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
